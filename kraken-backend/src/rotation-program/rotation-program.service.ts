import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EnrollmentStatus,
  EnrollmentTrack,
  JobRole,
  ProgramBlockType,
  ProgramOfferingType,
  ProgramStatus,
  TeamRole,
} from '@prisma/client/edge';
import { GenerateTeamsDto } from './dto/generate-teams.dto';
import { randomUUID } from 'crypto';

type StartProgramInput = {
  startDate?: string;
};

type BlockDefinition = {
  programId: string;
  type: ProgramBlockType;
  order: number;
  label: string;
  startsAt: Date;
  endsAt: Date;
};

const toUtcDate = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const daysInUtcMonth = (year: number, monthIndex: number) =>
  new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

const addMonthsUtc = (date: Date, months: number) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthDate = new Date(Date.UTC(year, month + months, 1));
  const targetYear = targetMonthDate.getUTCFullYear();
  const targetMonth = targetMonthDate.getUTCMonth();
  const maxDay = daysInUtcMonth(targetYear, targetMonth);
  const safeDay = Math.min(day, maxDay);
  return new Date(Date.UTC(targetYear, targetMonth, safeDay));
};

const parseStartDate = (value?: string) => {
  if (!value) {
    return null;
  }
  const [y, m, d] = value.split('-').map((part) => Number(part));
  if (!y || !m || !d) {
    return null;
  }
  return new Date(Date.UTC(y, m - 1, d));
};

const buildBlocks = (programId: string, programStart: Date) => {
  const blocks: BlockDefinition[] = [];

  for (let i = 1; i <= 3; i += 1) {
    const startsAt = addMonthsUtc(programStart, (i - 1) * 3);
    const endsAt = addMonthsUtc(programStart, i * 3);
    blocks.push({
      programId,
      type: ProgramBlockType.LEADER_BLOCK,
      order: i,
      label: `Leader Block ${i}`,
      startsAt,
      endsAt,
    });
  }

  const docsStart = addMonthsUtc(programStart, 9);
  blocks.push({
    programId,
    type: ProgramBlockType.DOCS_BLOCK,
    order: 1,
    label: 'Docs Month',
    startsAt: docsStart,
    endsAt: addMonthsUtc(docsStart, 1),
  });

  for (let i = 1; i <= 4; i += 1) {
    const startsAt = addMonthsUtc(programStart, (i - 1) * 2);
    const endsAt = addMonthsUtc(programStart, i * 2);
    blocks.push({
      programId,
      type: ProgramBlockType.JUNIOR_BLOCK,
      order: i,
      label: `Junior Block ${i}`,
      startsAt,
      endsAt,
    });
  }

  return blocks;
};

const ROLE_ORDER: JobRole[] = [
  JobRole.QA,
  JobRole.FRONTEND,
  JobRole.BACKEND,
  JobRole.DEVOPS,
];

const DEFAULT_LEADER_TARGETS: Record<JobRole, number> = {
  [JobRole.QA]: 3,
  [JobRole.FRONTEND]: 3,
  [JobRole.BACKEND]: 3,
  [JobRole.DEVOPS]: 2,
};

const DEFAULT_JUNIOR_TARGETS: Record<JobRole, number> = {
  [JobRole.QA]: 25,
  [JobRole.FRONTEND]: 25,
  [JobRole.BACKEND]: 25,
  [JobRole.DEVOPS]: 25,
};

const coerceTargets = <T extends Record<string, number>>(
  input: Record<string, number> | undefined,
  defaults: T,
) => {
  const result = { ...defaults };
  if (!input) {
    return result;
  }
  for (const key of Object.keys(defaults)) {
    const value = input[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
};

const buildJuniorTargets = (
  total: number,
  pctTargets: Record<JobRole, number>,
) => {
  const raw = ROLE_ORDER.map((role) => ({
    role,
    raw: (pctTargets[role] / 100) * total,
  }));
  const base = raw.map((item) => ({
    role: item.role,
    count: Math.floor(item.raw),
  }));
  let remainder = total - base.reduce((sum, item) => sum + item.count, 0);
  const sorted = [...raw].sort((a, b) => (b.raw % 1) - (a.raw % 1));
  let index = 0;
  while (remainder > 0) {
    const role = sorted[index % sorted.length].role;
    const item = base.find((entry) => entry.role === role);
    if (item) {
      item.count += 1;
      remainder -= 1;
    }
    index += 1;
  }
  return base.reduce<Record<JobRole, number>>(
    (acc, item) => {
      acc[item.role] = item.count;
      return acc;
    },
    {} as Record<JobRole, number>,
  );
};

const assignJuniorRoles = (
  juniors: { id: string; role?: JobRole | null }[],
  targets: Record<JobRole, number>,
) => {
  const assignedCounts: Record<JobRole, number> = {
    [JobRole.QA]: 0,
    [JobRole.FRONTEND]: 0,
    [JobRole.BACKEND]: 0,
    [JobRole.DEVOPS]: 0,
  };

  return juniors.map((junior) => {
    const selected = ROLE_ORDER.reduce(
      (best, role) => {
        const deficit = (targets[role] ?? 0) - assignedCounts[role];
        if (deficit > best.deficit) {
          return { role, deficit };
        }
        return best;
      },
      { role: ROLE_ORDER[0], deficit: Number.NEGATIVE_INFINITY },
    );

    assignedCounts[selected.role] += 1;
    return { ...junior, assignedRole: selected.role };
  });
};

@Injectable()
export class RotationProgramService {
  constructor(private prisma: PrismaService) {}

  createProgram(createProgramDto: CreateProgramDto) {
    const startsAt = createProgramDto.startDate ?? createProgramDto.startsAt;
    const endsAt = createProgramDto.endDate ?? createProgramDto.endsAt;

    return this.prisma.rotationProgram.create({
      data: {
        academicYear: createProgramDto.academicYear,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        name: createProgramDto.name,
      },
    });
  }

  async startProgram(programId: string, payload: StartProgramInput = {}) {
    type TermLite = { startsAt: Date | null; endsAt: Date | null };
    type OfferingLink = { offering: { term: TermLite | null } };

    const pickActiveOfferingStart = (
      links: OfferingLink[],
      now = new Date(),
    ) => {
      const terms = links
        .map((l) => l.offering.term)
        .filter((t): t is TermLite => Boolean(t));

      // Solo términos con startsAt válido
      const termsWithStart = terms.filter((t) => t.startsAt instanceof Date);

      // Activo si tiene rango completo y now está dentro
      const active = termsWithStart.filter((t) => {
        if (!t.startsAt || !t.endsAt) return false;
        return now >= t.startsAt && now <= t.endsAt;
      });

      if (active.length === 1) return toUtcDate(new Date(active[0].startsAt!));
      if (active.length > 1) {
        throw new BadRequestException(
          'Multiple active offerings found (term overlap)',
        );
      }

      // Fallback: si no hay activo, toma el más próximo futuro o el último pasado
      const sorted = [...termsWithStart].sort(
        (a, b) => (a.startsAt!.getTime() ?? 0) - (b.startsAt!.getTime() ?? 0),
      );

      if (sorted.length === 0) return null;

      const future = sorted.find((t) => t.startsAt!.getTime() >= now.getTime());
      if (future) return toUtcDate(new Date(future.startsAt!));

      return toUtcDate(new Date(sorted[sorted.length - 1].startsAt!));
    };

    return this.prisma.$transaction(async (tx) => {
      const program = await tx.rotationProgram.findUnique({
        where: { id: programId },
        include: {
          blocks: true,
          offerings: {
            include: {
              offering: { include: { term: true } },
            },
          },
        },
      });

      if (!program) {
        throw new NotFoundException('RotationProgram not found');
      }

      if (
        program.status === ProgramStatus.ACTIVE ||
        program.blocks.length > 0
      ) {
        const blocks = await tx.programBlock.findMany({
          where: { programId },
          orderBy: [{ startsAt: 'asc' }, { type: 'asc' }, { order: 'asc' }],
        });
        return { program, blocks };
      }

      const startOverride = parseStartDate(payload.startDate ?? undefined);

      const offeringDerivedStart = pickActiveOfferingStart(program.offerings);
      const derivedStart = startOverride
        ? startOverride
        : offeringDerivedStart
          ? offeringDerivedStart
          : new Date(Date.UTC(program.academicYear, 0, 1));

      const blocksData = buildBlocks(programId, derivedStart);

      const invalidBlock = blocksData.find(
        (block) => block.endsAt <= block.startsAt,
      );
      if (invalidBlock) {
        throw new BadRequestException('Invalid block range');
      }

      await tx.programBlock.createMany({
        data: blocksData.map((block) => ({
          programId: block.programId,
          type: block.type,
          order: block.order,
          label: block.label,
          startsAt: block.startsAt,
          endsAt: block.endsAt,
        })),
      });

      const programEnd = blocksData.reduce((latest, block) => {
        return block.endsAt > latest ? block.endsAt : latest;
      }, blocksData[0].endsAt);

      const updatedProgram = await tx.rotationProgram.update({
        where: { id: programId },
        data: {
          status: ProgramStatus.ACTIVE,
          startedAt: new Date(),
          startsAt: derivedStart,
          endsAt: programEnd,
        },
      });

      const blocks = await tx.programBlock.findMany({
        where: { programId },
        orderBy: [{ startsAt: 'asc' }, { type: 'asc' }, { order: 'asc' }],
      });

      return { program: updatedProgram, blocks };
    });
  }

  async listBlocks(programId: string) {
    return this.prisma.programBlock.findMany({
      where: { programId },
      orderBy: [{ startsAt: 'asc' }, { type: 'asc' }, { order: 'asc' }],
    });
  }

  async generateTeams(
    programId: string,
    blockId: string,
    dto: GenerateTeamsDto,
  ) {
    const minJuniorsPerTeam = dto.minJuniorsPerTeam ?? 3;
    const maxJuniorsPerTeam = dto.maxJuniorsPerTeam ?? 4;

    if (minJuniorsPerTeam > maxJuniorsPerTeam) {
      throw new BadRequestException(
        'minJuniorsPerTeam cannot exceed maxJuniorsPerTeam',
      );
    }

    const leaderTargets = coerceTargets(
      dto.leaderTargets,
      DEFAULT_LEADER_TARGETS,
    );
    const juniorTargetsPct = coerceTargets(
      dto.juniorTargetsPct,
      DEFAULT_JUNIOR_TARGETS,
    );

    type TermLite = { startsAt: Date | null; endsAt: Date | null };
    type ProgramOfferingWithTerm = {
      type: ProgramOfferingType;
      offeringId: string;
      offering: {
        teacherId: string;
        term: TermLite | null;
      };
    };

    const pickActiveProgramOffering = (
      list: ProgramOfferingWithTerm[],
      type: ProgramOfferingType,
      now = new Date(),
    ) => {
      const candidates = list.filter((o) => o.type === type);

      const active = candidates.filter((o) => {
        const term = o.offering.term;
        if (!term?.startsAt || !term?.endsAt) return false;
        return now >= term.startsAt && now <= term.endsAt;
      });

      if (active.length === 1) return active[0];

      if (active.length === 0) {
        // fallback: si solo existe uno (aunque no tenga term completo), úsalo
        if (candidates.length === 1) return candidates[0];
        throw new BadRequestException(
          `No active program offering found for ${type}`,
        );
      }

      throw new BadRequestException(
        `Multiple active program offerings found for ${type}`,
      );
    };

    return this.prisma.$transaction(async (tx) => {
      const program = await tx.rotationProgram.findUnique({
        where: { id: programId },
      });

      if (!program) {
        throw new NotFoundException('RotationProgram not found');
      }

      if (program.status !== ProgramStatus.ACTIVE) {
        throw new BadRequestException('RotationProgram is not ACTIVE');
      }

      const block = await tx.programBlock.findUnique({
        where: { id: blockId },
      });

      if (!block || block.programId !== programId) {
        throw new NotFoundException('ProgramBlock not found for this program');
      }

      if (block.type !== ProgramBlockType.LEADER_BLOCK) {
        throw new BadRequestException('Block is not a leader block');
      }

      const existingMemberships = await tx.teamMembership.count({
        where: { blockId },
      });

      if (existingMemberships > 0 && !dto.force) {
        throw new ConflictException('Teams already generated for this block');
      }

      if (existingMemberships > 0 && dto.force) {
        await tx.teamMembership.deleteMany({ where: { blockId } });
        await tx.team.deleteMany({ where: { leaderBlockId: blockId } });
      }

      // 👇 incluir term para decidir “activo”
      const offerings = await tx.programOffering.findMany({
        where: { programId },
        include: { offering: { include: { term: true } } },
      });

      // Prisma devuelve más campos, pero esto es compatible con el subset que necesitamos:
      const typedOfferings = offerings as unknown as ProgramOfferingWithTerm[];

      const practica = pickActiveProgramOffering(
        typedOfferings,
        ProgramOfferingType.PRACTICA_INTERNA,
      );
      const induccion = pickActiveProgramOffering(
        typedOfferings,
        ProgramOfferingType.INDUCCION,
      );

      const leadersEnrollments = await tx.enrollment.findMany({
        where: {
          offeringId: practica.offeringId,
          status: EnrollmentStatus.APPROVED,
          track: EnrollmentTrack.PRACTICA_INTERNA,
        },
      });

      const juniorsEnrollments = await tx.enrollment.findMany({
        where: {
          offeringId: induccion.offeringId,
          status: EnrollmentStatus.APPROVED,
          track: EnrollmentTrack.INDUCCION,
        },
      });

      const leadersByRole: Record<JobRole, typeof leadersEnrollments> = {
        [JobRole.QA]: [],
        [JobRole.FRONTEND]: [],
        [JobRole.BACKEND]: [],
        [JobRole.DEVOPS]: [],
      };

      for (const enrollment of leadersEnrollments) {
        const role = enrollment.primaryRole ?? enrollment.prefRole1;
        if (!role) {
          throw new BadRequestException('Leader enrollment missing role');
        }
        if (!leadersByRole[role]) {
          throw new BadRequestException(`Invalid leader role ${role}`);
        }
        leadersByRole[role].push(enrollment);
      }

      const selectedLeaders: {
        enrollment: (typeof leadersEnrollments)[number];
        role: JobRole;
      }[] = [];
      const leadersUsed: Record<JobRole, number> = {
        [JobRole.QA]: 0,
        [JobRole.FRONTEND]: 0,
        [JobRole.BACKEND]: 0,
        [JobRole.DEVOPS]: 0,
      };

      for (const role of ROLE_ORDER) {
        const needed = leaderTargets[role] ?? 0;
        const available = leadersByRole[role];
        if (available.length < needed) {
          throw new BadRequestException(`Not enough leaders for ${role}`);
        }
        const picked = available.slice(0, needed);
        picked.forEach((enrollment) =>
          selectedLeaders.push({ enrollment, role }),
        );
        leadersUsed[role] = picked.length;
      }

      const roleCounters: Record<JobRole, number> = {
        [JobRole.QA]: 0,
        [JobRole.FRONTEND]: 0,
        [JobRole.BACKEND]: 0,
        [JobRole.DEVOPS]: 0,
      };

      const teamsData = selectedLeaders.map((leader) => {
        roleCounters[leader.role] += 1;
        return {
          id: randomUUID(),
          name: `${leader.role}-Team-${roleCounters[leader.role]}`,
          offeringId: practica.offeringId,
          programId,
          leaderBlockId: blockId,
          createdBy: practica.offering.teacherId,
        };
      });

      await tx.team.createMany({ data: teamsData });

      const juniorsTargets = buildJuniorTargets(
        juniorsEnrollments.length,
        juniorTargetsPct,
      );
      const assignedJuniors = assignJuniorRoles(
        juniorsEnrollments.map((enrollment) => ({ id: enrollment.id })),
        juniorsTargets,
      );

      const teamsAssignments = teamsData.map((team) => ({
        teamId: team.id,
        members: [] as { enrollmentId: string; role: JobRole }[],
      }));

      const warnings: string[] = [];
      let juniorIndex = 0;
      const totalJuniors = assignedJuniors.length;

      for (let round = 0; round < minJuniorsPerTeam; round += 1) {
        for (const team of teamsAssignments) {
          if (juniorIndex >= totalJuniors) {
            warnings.push('Not enough juniors to fill minJuniorsPerTeam');
            break;
          }
          team.members.push({
            enrollmentId: assignedJuniors[juniorIndex].id,
            role: assignedJuniors[juniorIndex].assignedRole,
          });
          juniorIndex += 1;
        }
      }

      let assignedAny = true;
      while (juniorIndex < totalJuniors && assignedAny) {
        assignedAny = false;
        for (const team of teamsAssignments) {
          if (juniorIndex >= totalJuniors) break;
          if (team.members.length >= maxJuniorsPerTeam) continue;

          team.members.push({
            enrollmentId: assignedJuniors[juniorIndex].id,
            role: assignedJuniors[juniorIndex].assignedRole,
          });
          juniorIndex += 1;
          assignedAny = true;
        }
      }

      if (juniorIndex < totalJuniors) {
        warnings.push('Not enough team slots to assign all juniors');
      }

      const leaderMemberships = selectedLeaders.map((leader, index) => ({
        teamId: teamsData[index].id,
        userId: leader.enrollment.studentId,
        enrollmentId: leader.enrollment.id,
        blockId,
        teamRole: TeamRole.LEAD,
        jobRole: leader.role,
      }));

      const juniorsMemberships = teamsAssignments.flatMap((team) =>
        team.members.map((member) => {
          const enrollment = juniorsEnrollments.find(
            (entry) => entry.id === member.enrollmentId,
          );
          if (!enrollment) {
            throw new BadRequestException(
              'Enrollment mismatch while assigning juniors',
            );
          }
          return {
            teamId: team.teamId,
            userId: enrollment.studentId,
            enrollmentId: enrollment.id,
            blockId,
            teamRole: TeamRole.MEMBER,
            jobRole: member.role,
          };
        }),
      );

      await tx.teamMembership.createMany({
        data: [...leaderMemberships, ...juniorsMemberships],
      });

      const juniorsByRole = juniorsMemberships.reduce<Record<JobRole, number>>(
        (acc, member) => {
          acc[member.jobRole] += 1;
          return acc;
        },
        {
          [JobRole.QA]: 0,
          [JobRole.FRONTEND]: 0,
          [JobRole.BACKEND]: 0,
          [JobRole.DEVOPS]: 0,
        } as Record<JobRole, number>,
      );

      return {
        programId,
        blockId,
        teamsCreated: teamsData.length,
        leadersUsed,
        juniorsAssigned: juniorsMemberships.length,
        juniorsByRole,
        warnings,
        practicaOfferingId: practica.offeringId,
        induccionOfferingId: induccion.offeringId,
      };
    });
  }

  async getProgram(programId: string) {
    const program = await this.prisma.rotationProgram.findUnique({
      where: { id: programId },
      include: {
        blocks: {
          orderBy: [{ startsAt: 'asc' }, { type: 'asc' }, { order: 'asc' }],
        },
      },
    });

    if (!program) {
      throw new NotFoundException('RotationProgram not found');
    }

    return program;
  }

  private async buildJuniorRotationPlan(tx: PrismaService, programId: string) {
    const program = await tx.rotationProgram.findUnique({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException('RotationProgram not found');
    if (program.status !== ProgramStatus.ACTIVE) {
      throw new BadRequestException('RotationProgram is not ACTIVE');
    }
    const juniorBlocks = await tx.programBlock.findMany({
      where: { programId, type: ProgramBlockType.JUNIOR_BLOCK },
      orderBy: { order: 'asc' },
    });
    if (juniorBlocks.length !== 4) {
      throw new BadRequestException(
        'Expected 4 JUNIOR_BLOCK blocks. Start the program first.',
      );
    }
    const links = await tx.programOffering.findMany({
      where: { programId, type: ProgramOfferingType.INDUCCION },
      select: { offeringId: true },
    });
    if (links.length === 0)
      throw new BadRequestException('No INDUCCION offering linked');

    const offeringId = links[0].offeringId;
    const juniors = await tx.enrollment.findMany({
      where: {
        offeringId,
        status: EnrollmentStatus.APPROVED,
        track: EnrollmentTrack.INDUCCION,
      },
      select: { id: true, studentId: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!juniors.length) {
      throw new BadRequestException('No approved INDUCCION enrollments found');
    }

    const roleFor = (studentIndex: number, blockIndex: number) =>
      ROLE_ORDER[(studentIndex + blockIndex) % 4];
    const countsByBlock = juniorBlocks.map((block, b) => {
      const counts: Record<JobRole, number> = {
        [JobRole.QA]: 0,
        [JobRole.FRONTEND]: 0,
        [JobRole.BACKEND]: 0,
        [JobRole.DEVOPS]: 0,
      };
      for (let i = 0; i < juniors.length; i++) counts[roleFor(i, b)]++;
      return {
        blockId: block.id,
        order: block.order,
        counts,
        total: juniors.length,
      };
    });

    return {
      programId,
      offeringId,
      juniorBlocks,
      juniors,
      roleFor,
      countsByBlock,
    };
  }

  async previewJuniorRotation(programId: string) {
    const plan = await this.buildJuniorRotationPlan(this.prisma, programId);
    const perStudent = plan.juniors.map((j, i) => ({
      enrollmentId: j.id,
      studentId: j.studentId,
      roles: plan.juniorBlocks.map((b, bi) => ({
        blockId: b.id,
        order: b.order,
        role: plan.roleFor(i, bi),
      })),
    }));
    return {
      programId: plan.programId,
      offeringId: plan.offeringId,
      juniorsTotal: plan.juniors.length,
      blocks: plan.countsByBlock,
      plan: perStudent,
    };
  }
  async applyJuniorRotation(programId: string, force = false) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await this.buildJuniorRotationPlan(tx as any, programId);
      const offering = await tx.courseOffering.findUnique({
        where: { id: plan.offeringId },
        select: { teacherId: true },
      });
      if (!offering) throw new NotFoundException('Offering not found');

      const blockIds = plan.juniorBlocks.map((b) => b.id);
      const existing = await tx.teamMembership.count({
        where: { blockId: { in: blockIds } },
      });

      if (existing > 0 && !force) {
        throw new ConflictException('Junior rotation already applied');
      }

      if (existing > 0 && force) {
        await tx.teamMembership.deleteMany({
          where: { blockId: { in: blockIds } },
        });

        await tx.team.deleteMany({
          where: {
            programId,
            offeringId: plan.offeringId,
          },
        });
      }

      const teamsToCreate: {
        id: string;
        name: string;
        offeringId: string;
        programId: string;
        leaderBlockId: null;
        createdBy: string;
      }[] = [];

      const teamIdByBlockRole = new Map<string, string>();

      for (const block of plan.juniorBlocks) {
        for (const role of ROLE_ORDER) {
          const teamId = randomUUID();
          teamsToCreate.push({
            id: teamId,
            name: `JUNIORS-${role}-Block-${block.order}`,
            offeringId: plan.offeringId,
            programId,
            leaderBlockId: null,
            createdBy: offering.teacherId,
          });
          teamIdByBlockRole.set(`${block.id}:${role}`, teamId);
        }
      }
      await tx.team.createMany({ data: teamsToCreate });
      const membershipsToCreate: {
        teamId: string;
        userId: string;
        enrollmentId: string;
        blockId: string;
        teamRole: TeamRole;
        jobRole: JobRole;
      }[] = [];

      for (let i = 0; i < plan.juniors.length; i += 1) {
        const junior = plan.juniors[i];

        for (let bi = 0; bi < plan.juniorBlocks.length; bi += 1) {
          const block = plan.juniorBlocks[bi];
          const role = plan.roleFor(i, bi);

          const teamId = teamIdByBlockRole.get(`${block.id}:${role}`)!;

          membershipsToCreate.push({
            teamId,
            userId: junior.studentId,
            enrollmentId: junior.id,
            blockId: block.id,
            teamRole: TeamRole.MEMBER,
            jobRole: role,
          });
        }
      }

      await tx.teamMembership.createMany({ data: membershipsToCreate });
      const perStudent = plan.juniors.map((j, i) => ({
        enrollmentId: j.id,
        studentId: j.studentId,
        roles: plan.juniorBlocks.map((b, bi) => ({
          blockId: b.id,
          order: b.order,
          role: plan.roleFor(i, bi),
        })),
      }));

      return {
        programId: plan.programId,
        offeringId: plan.offeringId,
        juniorsTotal: plan.juniors.length,
        teamsCreated: teamsToCreate.length,
        membershipsCreated: membershipsToCreate.length,
        blocks: plan.countsByBlock,
        plan: perStudent,
      };
    });
  }
}
