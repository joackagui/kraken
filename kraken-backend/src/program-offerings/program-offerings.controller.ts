import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { GlobalRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/common/roles.guard';
import { ProgramOfferingsService } from './program-offerings.service';
import { CreateProgramOfferingDTO } from './dto/create-program-offerings.dto';

@Controller('program-offerings')
export class ProgramOfferingsController {

    constructor(private readonly programOfferings: ProgramOfferingsService) {}
    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(GlobalRole.ADMIN)
    @Post(":programId/assign")
    assignOfferings(@Param("programId") programId: string, @Body() dto: CreateProgramOfferingDTO){
        return this.programOfferings.assignOfferingToProgram(programId, dto)
    }
}
