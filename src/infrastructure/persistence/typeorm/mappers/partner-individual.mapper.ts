import { Injectable } from '@nestjs/common';
import { PartnerIndividual } from '../../../../core/domain/partner/entities/partner-individual.entity';
import { PartnerIndividualOrmEntity } from '../entities/partner-individual.orm-entity';

@Injectable()
export class PartnerIndividualMapper {
  toDomain(entity: PartnerIndividualOrmEntity): PartnerIndividual {
    return PartnerIndividual.reconstitute({
      partnerId: entity.partnerId,
      displayName: entity.displayName,
      idCardNumber: entity.idCardNumber,
      specialization: entity.specialization,
      yearsExperience: entity.yearsExperience,
      certifications: entity.certifications ?? [],
      portfolio: entity.portfolio,
      personalBio: entity.personalBio,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: PartnerIndividual): PartnerIndividualOrmEntity {
    const entity = new PartnerIndividualOrmEntity();
    entity.partnerId = domain.partnerId;
    entity.displayName = domain.displayName;
    entity.idCardNumber = domain.idCardNumber;
    entity.specialization = domain.specialization;
    entity.yearsExperience = domain.yearsExperience;
    entity.certifications = domain.certifications;
    entity.portfolio = domain.portfolio;
    entity.personalBio = domain.personalBio;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
