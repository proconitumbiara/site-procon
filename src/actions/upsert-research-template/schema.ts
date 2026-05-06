import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  USER_NOT_AUTHORIZED: "USER_NOT_AUTHORIZED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.USER_NOT_AUTHORIZED]:
    "Usuário não autorizado a realizar esta ação",
} as const;

const itemSchema = z.object({
  productId: z.string().uuid({ message: "Produto inválido." }),
  supplierId: z.string().uuid({ message: "Fornecedor inválido." }),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const upsertResearchTemplateSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z
      .string()
      .trim()
      .min(1, { message: "O nome do template é obrigatório." }),
    slug: z
      .string()
      .trim()
      .min(1, { message: "O slug do template é obrigatório." }),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional(),
    items: z.array(itemSchema),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();

    data.items.forEach((item, index) => {
      const key = `${item.productId}:${item.supplierId}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message:
            "Combinação de produto e fornecedor duplicada no mesmo template.",
        });
      } else {
        seen.add(key);
      }
    });
  });

export type UpsertResearchTemplateInput = z.infer<
  typeof upsertResearchTemplateSchema
>;
