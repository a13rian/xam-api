import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PartnerStaffController,
  StaffInvitationController,
} from '../http/controllers/partner-staff.controller';
import { PartnerStaffOrmEntity } from '../../infrastructure/persistence/typeorm/entities/partner-staff.orm-entity';
import { PartnerStaffRepository } from '../../infrastructure/persistence/typeorm/repositories/partner-staff.repository';
import { PartnerStaffMapper } from '../../infrastructure/persistence/typeorm/mappers/partner-staff.mapper';
import { PARTNER_STAFF_REPOSITORY } from '../../core/domain/partner/repositories/partner-staff.repository.interface';
import { PartnerStaffCommandHandlers } from '../../core/application/partner-staff/commands';
import { PartnerStaffQueryHandlers } from '../../core/application/partner-staff/queries';
import { PartnerModule } from './partner.module';
import { UserModule } from './user.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([PartnerStaffOrmEntity]),
    forwardRef(() => PartnerModule),
    forwardRef(() => UserModule),
  ],
  controllers: [PartnerStaffController, StaffInvitationController],
  providers: [
    PartnerStaffMapper,
    {
      provide: PARTNER_STAFF_REPOSITORY,
      useClass: PartnerStaffRepository,
    },
    ...PartnerStaffCommandHandlers,
    ...PartnerStaffQueryHandlers,
  ],
  exports: [PARTNER_STAFF_REPOSITORY],
})
export class PartnerStaffModule {}
