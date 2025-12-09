import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PartnerController,
  AdminPartnerController,
} from '../http/controllers/partner.controller';
import { PartnerRepository } from '../../infrastructure/persistence/typeorm/repositories/partner.repository';
import { PartnerDocumentRepository } from '../../infrastructure/persistence/typeorm/repositories/partner-document.repository';
import { PartnerStaffRepository } from '../../infrastructure/persistence/typeorm/repositories/partner-staff.repository';
import { PartnerBusinessRepository } from '../../infrastructure/persistence/typeorm/repositories/partner-business.repository';
import { PartnerIndividualRepository } from '../../infrastructure/persistence/typeorm/repositories/partner-individual.repository';
import { PartnerMapper } from '../../infrastructure/persistence/typeorm/mappers/partner.mapper';
import { PartnerDocumentMapper } from '../../infrastructure/persistence/typeorm/mappers/partner-document.mapper';
import { PartnerStaffMapper } from '../../infrastructure/persistence/typeorm/mappers/partner-staff.mapper';
import { PartnerBusinessMapper } from '../../infrastructure/persistence/typeorm/mappers/partner-business.mapper';
import { PartnerIndividualMapper } from '../../infrastructure/persistence/typeorm/mappers/partner-individual.mapper';
import { PARTNER_REPOSITORY } from '../../core/domain/partner/repositories/partner.repository.interface';
import { PARTNER_DOCUMENT_REPOSITORY } from '../../core/domain/partner/repositories/partner-document.repository.interface';
import { PARTNER_STAFF_REPOSITORY } from '../../core/domain/partner/repositories/partner-staff.repository.interface';
import { PARTNER_BUSINESS_REPOSITORY } from '../../core/domain/partner/repositories/partner-business.repository.interface';
import { PARTNER_INDIVIDUAL_REPOSITORY } from '../../core/domain/partner/repositories/partner-individual.repository.interface';
import { PartnerOrmEntity } from '../../infrastructure/persistence/typeorm/entities/partner.orm-entity';
import { PartnerDocumentOrmEntity } from '../../infrastructure/persistence/typeorm/entities/partner-document.orm-entity';
import { PartnerStaffOrmEntity } from '../../infrastructure/persistence/typeorm/entities/partner-staff.orm-entity';
import { PartnerBusinessOrmEntity } from '../../infrastructure/persistence/typeorm/entities/partner-business.orm-entity';
import { PartnerIndividualOrmEntity } from '../../infrastructure/persistence/typeorm/entities/partner-individual.orm-entity';
import { PartnerCommandHandlers } from '../../core/application/partner/commands';
import { PartnerQueryHandlers } from '../../core/application/partner/queries';
import { UserModule } from './user.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      PartnerOrmEntity,
      PartnerDocumentOrmEntity,
      PartnerStaffOrmEntity,
      PartnerBusinessOrmEntity,
      PartnerIndividualOrmEntity,
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [PartnerController, AdminPartnerController],
  providers: [
    PartnerMapper,
    PartnerDocumentMapper,
    PartnerStaffMapper,
    PartnerBusinessMapper,
    PartnerIndividualMapper,
    {
      provide: PARTNER_REPOSITORY,
      useClass: PartnerRepository,
    },
    {
      provide: PARTNER_DOCUMENT_REPOSITORY,
      useClass: PartnerDocumentRepository,
    },
    {
      provide: PARTNER_STAFF_REPOSITORY,
      useClass: PartnerStaffRepository,
    },
    {
      provide: PARTNER_BUSINESS_REPOSITORY,
      useClass: PartnerBusinessRepository,
    },
    {
      provide: PARTNER_INDIVIDUAL_REPOSITORY,
      useClass: PartnerIndividualRepository,
    },
    ...PartnerCommandHandlers,
    ...PartnerQueryHandlers,
  ],
  exports: [
    PARTNER_REPOSITORY,
    PARTNER_DOCUMENT_REPOSITORY,
    PARTNER_STAFF_REPOSITORY,
    PARTNER_BUSINESS_REPOSITORY,
    PARTNER_INDIVIDUAL_REPOSITORY,
  ],
})
export class PartnerModule {}
