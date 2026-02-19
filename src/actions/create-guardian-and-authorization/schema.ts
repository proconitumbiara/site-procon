import { z } from "zod";

export const createGuardianAndAuthorizationSchema = z.object({
  registrationId: z.string().uuid(),
  fullName: z.string().trim().min(1, "Nome completo é obrigatório"),
  document: z.string().trim().min(1, "Documento (CPF) é obrigatório"),
  phone: z.string().trim().min(1, "Telefone é obrigatório"),
  relationship: z.string().trim().min(1, "Parentesco é obrigatório"),
  fileUrl: z.string().url("URL do arquivo inválida"),
  mimeType: z.literal("application/pdf"),
});

export type CreateGuardianAndAuthorizationInput = z.infer<
  typeof createGuardianAndAuthorizationSchema
>;
