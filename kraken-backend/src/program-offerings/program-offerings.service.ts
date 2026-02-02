import { Injectable } from '@nestjs/common';
import { CreateProgramOfferingDTO } from './dto/create-program-offerings.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProgramOfferingsService {
  constructor(private readonly prisma: PrismaService) {}
  async assignOfferingToProgram(
    programId: string,
    dto: CreateProgramOfferingDTO,
  ) {
    const [practica, induccion] = await Promise.all([
      this.prisma.programOffering.create({
        data: {
          type: 'INDUCCION',
          offeringId: dto.induccionOfferingId,
          programId,
        },
      }),
      this.prisma.programOffering.create({
        data: {
          type: 'PRACTICA_INTERNA',
          offeringId: dto.practicaOfferingId,
          programId,
        },
      }),
    ]);
    return {
        practica,
        induccion
    }
  }
}
