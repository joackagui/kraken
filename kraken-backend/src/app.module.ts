import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { WalletModule } from './wallet/wallet.module';
import { TeamsModule } from './teams/teams.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { RotationProgramModule } from './rotation-program/rotation-program.module';
import { OfferingsModule } from './offerings/offerings.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { MeModule } from './me/me.module';
import { PracticaRolesModule } from './practica-roles/practica-roles.module';
import { CoursesModule } from './courses/courses.module';
import { TermsModule } from './terms/terms.module';
import { ProgramOfferingsController } from './program-offerings/program-offerings.controller';
import { ProgramOfferingsService } from './program-offerings/program-offerings.service';
import { ProgramOfferingsModule } from './program-offerings/program-offerings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    WalletModule,
    TeamsModule,
    CommonModule,
    RotationProgramModule,
    OfferingsModule,
    EnrollmentsModule,
    MeModule,
    PracticaRolesModule,
    CoursesModule,
    TermsModule,
    ProgramOfferingsModule
  ],
  controllers: [AppController, ProgramOfferingsController],
  providers: [AppService, ProgramOfferingsService],
})
export class AppModule {}
