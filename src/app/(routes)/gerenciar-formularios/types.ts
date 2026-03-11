import type {
  guardianAuthorizationDocumentTable,
  guardianTable,
  registrationTable,
} from "@/db/schema";

export type RegistrationRow = typeof registrationTable.$inferSelect;
export type GuardianRow = typeof guardianTable.$inferSelect;
export type GuardianAuthorizationDocumentRow =
  typeof guardianAuthorizationDocumentTable.$inferSelect;

export type GuardianAuthorizationDocumentWithGuardian =
  GuardianAuthorizationDocumentRow & {
    guardian: GuardianRow;
  };

export type RegistrationWithGuardian = RegistrationRow & {
  guardianAuthorizationDocuments: GuardianAuthorizationDocumentWithGuardian[];
};
