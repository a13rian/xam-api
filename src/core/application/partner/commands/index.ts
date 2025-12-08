export * from './register-partner';
export * from './approve-partner';
export * from './reject-partner';
export * from './upload-document/upload-document.command';
export * from './upload-document/upload-document.handler';
export * from './review-document/review-document.command';
export * from './review-document/review-document.handler';

import { RegisterPartnerHandler } from './register-partner';
import { ApprovePartnerHandler } from './approve-partner';
import { RejectPartnerHandler } from './reject-partner';
import { UploadDocumentHandler } from './upload-document/upload-document.handler';
import {
  ApproveDocumentHandler,
  RejectDocumentHandler,
} from './review-document/review-document.handler';

export const PartnerCommandHandlers = [
  RegisterPartnerHandler,
  ApprovePartnerHandler,
  RejectPartnerHandler,
  UploadDocumentHandler,
  ApproveDocumentHandler,
  RejectDocumentHandler,
];
