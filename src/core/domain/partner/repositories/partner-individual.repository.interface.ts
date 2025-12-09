import { PartnerIndividual } from '../entities/partner-individual.entity';

export const PARTNER_INDIVIDUAL_REPOSITORY = Symbol(
  'IPartnerIndividualRepository',
);

export interface IPartnerIndividualRepository {
  findByPartnerId(partnerId: string): Promise<PartnerIndividual | null>;
  save(individual: PartnerIndividual): Promise<void>;
  delete(partnerId: string): Promise<void>;
}
