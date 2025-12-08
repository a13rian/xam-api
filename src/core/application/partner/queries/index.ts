export * from './get-partner';
export * from './get-my-partner';
export * from './list-pending-partners';
export * from './list-documents/list-documents.query';
export * from './list-documents/list-documents.handler';

import { GetPartnerHandler } from './get-partner';
import { GetMyPartnerHandler } from './get-my-partner';
import { ListPendingPartnersHandler } from './list-pending-partners';
import { ListPartnerDocumentsHandler } from './list-documents/list-documents.handler';

export const PartnerQueryHandlers = [
  GetPartnerHandler,
  GetMyPartnerHandler,
  ListPendingPartnersHandler,
  ListPartnerDocumentsHandler,
];
