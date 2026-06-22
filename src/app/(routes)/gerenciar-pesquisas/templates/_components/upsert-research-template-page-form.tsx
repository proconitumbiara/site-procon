"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { deleteResearchTemplate } from "@/actions/delete-research-template";
import { upsertResearchTemplate } from "@/actions/upsert-research-template";
import PriceMatrixGrid from "@/components/gerenciar-pesquisas/price-matrix-grid";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoriesTable,
  priceSearchTypesTable,
  productsTable,
  suppliersTable,
} from "@/db/schema";
import {
  filterCatalogByType,
  hasMatrixData,
  matrixToTemplateItems,
  templateItemsToMatrix,
  type MatrixState,
} from "@/lib/price-matrix-utils";

type Supplier = typeof suppliersTable.$inferSelect;
type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

type ResearchTemplate = {
  id: string;
  name: string;
  priceSearchTypeId: string;
  description: string | null;
  isActive: boolean;
  items: Array<{
    productId: string;
    supplierId: string;
  }>;
};

interface UpsertResearchTemplatePageFormProps {
  template?: ResearchTemplate;
  products: Product[];
  suppliers: Supplier[];
  priceSearchTypes: PriceSearchType[];
}

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Informe o nome." }),
  priceSearchTypeId: z
    .string()
    .uuid({ message: "Selecione um tipo de pesquisa." }),
  description: z.string().trim().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const UpsertResearchTemplatePageForm = ({
  template,
  products,
  suppliers,
  priceSearchTypes,
}: UpsertResearchTemplatePageFormProps) => {
  const router = useRouter();
  const activeTypes = priceSearchTypes.filter((type) => type.isActive);
  const selectableTypes = template
    ? priceSearchTypes.filter(
        (type) => type.isActive || type.id === template.priceSearchTypeId,
      )
    : activeTypes;
  const defaultTypeId =
    template?.priceSearchTypeId ?? activeTypes[0]?.id ?? "";

  const [matrix, setMatrix] = useState<MatrixState>(() =>
    template ? templateItemsToMatrix(template.items) : {},
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name ?? "",
      priceSearchTypeId: defaultTypeId,
      description: template?.description ?? "",
      isActive: template?.isActive ?? true,
    },
  });

  const selectedTypeId = form.watch("priceSearchTypeId");

  const { products: filteredProducts, suppliers: filteredSuppliers } = useMemo(
    () => {
      const catalog = filterCatalogByType(products, suppliers, selectedTypeId);
      return {
        products: catalog.products.filter((product) => product.isActive),
        suppliers: catalog.suppliers.filter((supplier) => supplier.isActive),
      };
    },
    [products, suppliers, selectedTypeId],
  );

  const handleMatrixChange = (key: string, value: string) => {
    setMatrix((prev) => {
      const next = { ...prev };
      if (!value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleTypeChange = (nextTypeId: string) => {
    if (nextTypeId === selectedTypeId) return;

    if (hasMatrixData(matrix)) {
      toast.warning("O tipo foi alterado e a grade foi limpa.");
    }

    setMatrix({});
    form.setValue("priceSearchTypeId", nextTypeId);
  };

  const { execute, status } = useAction(upsertResearchTemplate, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      toast.success(
        template
          ? "Template atualizado com sucesso!"
          : "Template criado com sucesso!",
      );
      router.push("/gerenciar-pesquisas/templates");
      router.refresh();
    },
    onError: (error) => {
      const message = error.error?.serverError ?? "Erro ao salvar template.";
      toast.error(message);
    },
  });

  const { execute: deactivateTemplate, status: deactivateStatus } = useAction(
    deleteResearchTemplate,
    {
      onSuccess: () => {
        toast.success("Template inativado com sucesso!");
        router.push("/gerenciar-pesquisas/templates");
        router.refresh();
      },
      onError: (error) => {
        const message = error.error?.serverError ?? "Erro ao inativar template.";
        toast.error(message);
      },
    },
  );

  const onSubmit = (values: FormValues) => {
    execute({
      id: template?.id,
      name: values.name,
      priceSearchTypeId: values.priceSearchTypeId,
      description: values.description || undefined,
      isActive: values.isActive,
      items: matrixToTemplateItems(matrix),
    });
  };

  const isSaving = status === "executing" || deactivateStatus === "executing";

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Template Dia das Mães" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceSearchTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de pesquisa</FormLabel>
                  <Select
                    onValueChange={handleTypeChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectableTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Descrição opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template ativo</FormLabel>
                <FormControl>
                  <div className="border-input bg-background flex h-10 items-center gap-2 rounded-md border px-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                    <span className="text-muted-foreground text-sm">
                      Use para ocultar templates sem apagar histórico
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold">Combinações do template</h3>
              <p className="text-muted-foreground text-sm">
                Marque as células que representam produto × fornecedor a
                pesquisar.
              </p>
            </div>
            <PriceMatrixGrid
              mode="structure"
              suppliers={filteredSuppliers}
              products={filteredProducts}
              matrix={matrix}
              onChange={handleMatrixChange}
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-6">
            {template?.isActive && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => deactivateTemplate({ id: template.id })}
                disabled={isSaving}
              >
                {deactivateStatus === "executing" ? "Inativando..." : "Inativar"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/gerenciar-pesquisas/templates")}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : template ? (
                "Atualizar template"
              ) : (
                "Criar template"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpsertResearchTemplatePageForm;
