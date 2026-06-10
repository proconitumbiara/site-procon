import { z } from "zod";

export const deletePriceSearchTypeSchema = z.object({
  id: z.string().uuid({ message: "ID do tipo inválido." }),
});

export type DeletePriceSearchTypeInput = z.infer<
  typeof deletePriceSearchTypeSchema
>;
