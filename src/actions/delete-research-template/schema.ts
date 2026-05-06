import { z } from "zod";

export const deleteResearchTemplateSchema = z.object({
  id: z.string().uuid({ message: "ID do template inválido." }),
});

export type DeleteResearchTemplateInput = z.infer<
  typeof deleteResearchTemplateSchema
>;
