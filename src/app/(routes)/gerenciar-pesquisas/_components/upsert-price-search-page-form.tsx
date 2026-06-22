"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertPriceSearch } from "@/actions/upsert-price-search";
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
import { Textarea } from "@/components/ui/textarea";
import {
  categoriesTable,
  priceSearchTypesTable,
  productsTable,
  researchTemplatesTable,
  suppliersTable,
} from "@/db/schema";
import {
  filterCatalogByType,
  hasMatrixData,
  matrixToPriceSearchItems,
  priceSearchItemsToMatrix,
  templateItemsToHighlightedKeys,
  type MatrixState,
} from "@/lib/price-matrix-utils";
import { PriceSearchWithRelations } from "@/types/content-management";

type Supplier = typeof suppliersTable.$inferSelect;
type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type ResearchTemplate = typeof researchTemplatesTable.$inferSelect & {
  items: Array<{
    productId: string;
    supplierId: string;
  }>;
};
type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface UpsertPriceSearchPageFormProps {
  priceSearch?: PriceSearchWithRelations;
  priceSearchTypes: PriceSearchType[];
  suppliers: Supplier[];
  products: Product[];
  templates: ResearchTemplate[];
}

const formSchema = z.object({
  title: z.string().trim().min(1, { message: "Informe o título." }),
  priceSearchTypeId: z
    .string()
    .uuid({ message: "Selecione um tipo de pesquisa." }),
  summary: z.string().trim().optional(),
  coverImageUrl: z.string().trim().optional(),
  year: z
    .number({ message: "Ano inválido." })
    .int()
    .min(2000, { message: "Ano mínimo 2000." })
    .max(2100, { message: "Ano máximo 2100." }),
  emphasis: z.boolean().optional(),
  collectionDate: z.string().trim().optional(),
  observation: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const UpsertPriceSearchPageForm = ({
  priceSearch,
  priceSearchTypes,
  suppliers,
  products,
  templates,
}: UpsertPriceSearchPageFormProps) => {
  const router = useRouter();
  const activeTypes = priceSearchTypes.filter((type) => type.isActive);
  const selectableTypes = priceSearch
    ? priceSearchTypes.filter(
        (type) =>
          type.isActive || type.id === priceSearch.priceSearchTypeId,
      )
    : activeTypes;
  const defaultTypeId =
    priceSearch?.priceSearchTypeId ?? activeTypes[0]?.id ?? "";

  const [matrix, setMatrix] = useState<MatrixState>(() =>
    priceSearch
      ? priceSearchItemsToMatrix(priceSearch.items)
      : {},
  );
  const [highlightedKeys, setHighlightedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: priceSearch?.title ?? "",
      priceSearchTypeId: defaultTypeId,
      summary: priceSearch?.summary ?? "",
      coverImageUrl: priceSearch?.coverImageUrl ?? "",
      year: priceSearch?.year ?? new Date().getFullYear(),
      emphasis: priceSearch?.emphasis ?? false,
      collectionDate: priceSearch?.collectionDate
        ? new Date(priceSearch.collectionDate).toISOString().split("T")[0]
        : "",
      observation: priceSearch?.observation ?? "",
    },
  });

  const selectedTypeId = form.watch("priceSearchTypeId");

  const { products: filteredProducts, suppliers: filteredSuppliers } = useMemo(
    () => {
      const catalog = filterCatalogByType(products, suppliers, selectedTypeId);
      const activeProducts = catalog.products.filter((product) => product.isActive);
      const activeSuppliers = catalog.suppliers.filter(
        (supplier) => supplier.isActive,
      );

      if (!priceSearch) {
        return { products: activeProducts, suppliers: activeSuppliers };
      }

      const extraProducts = priceSearch.items
        .map((item) => item.product)
        .filter(
          (product) =>
            product.priceSearchTypeId === selectedTypeId &&
            !activeProducts.some((active) => active.id === product.id),
        );
      const extraSuppliers = priceSearch.items
        .map((item) => item.supplier)
        .filter(
          (supplier) =>
            supplier.priceSearchTypeId === selectedTypeId &&
            !activeSuppliers.some((active) => active.id === supplier.id),
        );

      return {
        products: [...activeProducts, ...extraProducts],
        suppliers: [...activeSuppliers, ...extraSuppliers],
      };
    },
    [products, suppliers, selectedTypeId, priceSearch],
  );

  const filteredTemplates = useMemo(
    () =>
      templates.filter(
        (template) =>
          template.isActive && template.priceSearchTypeId === selectedTypeId,
      ),
    [templates, selectedTypeId],
  );

  const handleMatrixChange = (key: string, value: string) => {
    setMatrix((prev) => {
      const next = { ...prev };
      if (!value.trim()) {
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
      toast.warning("O tipo foi alterado e os preços da grade foram limpos.");
    }

    setMatrix({});
    setHighlightedKeys(new Set());
    setSelectedTemplateId("");
    form.setValue("priceSearchTypeId", nextTypeId);
  };

  const loadTemplateHighlight = () => {
    if (!selectedTemplateId) {
      toast.error("Selecione um template para carregar.");
      return;
    }

    const template = filteredTemplates.find(
      (item) => item.id === selectedTemplateId,
    );

    if (!template) {
      toast.error("Template não encontrado.");
      return;
    }

    if (!template.items.length) {
      toast.error("Este template não possui combinações cadastradas.");
      return;
    }

    setHighlightedKeys(templateItemsToHighlightedKeys(template.items));
    toast.success(
      `${template.items.length} células destacadas. Preencha os preços nas células marcadas.`,
    );
  };

  const uploadCoverImage = async (file: File) => {
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "projects");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Falha ao enviar imagem.");
      }

      form.setValue("coverImageUrl", result.fileUrl, { shouldDirty: true });
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Cover upload error", error);
      toast.error("Não foi possível enviar a imagem da capa.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const { execute, status } = useAction(upsertPriceSearch, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      toast.success(
        priceSearch
          ? "Pesquisa atualizada com sucesso!"
          : "Pesquisa criada com sucesso!",
      );
      router.push("/gerenciar-pesquisas");
      router.refresh();
    },
    onError: (error) => {
      const message =
        error.error?.serverError ??
        error.error?.validationErrors?.title?._errors?.[0] ??
        "Erro ao salvar pesquisa.";
      toast.error(message);
    },
  });

  const onSubmit = (values: FormValues) => {
    const items = matrixToPriceSearchItems(matrix);

    if (!items.length) {
      toast.error("Preencha ao menos um preço na grade.");
      return;
    }

    execute({
      ...values,
      id: priceSearch?.id,
      summary: values.summary || undefined,
      coverImageUrl: values.coverImageUrl || undefined,
      collectionDate: values.collectionDate || undefined,
      observation: values.observation || undefined,
      items,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da pesquisa" {...field} />
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
                  <Select onValueChange={handleTypeChange} value={field.value}>
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
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resumo</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px]"
                    placeholder="Resumo curto para o card"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem de capa</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <input type="hidden" {...field} />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            await uploadCoverImage(file);
                          }
                        }}
                      />
                      {(field.value || isUploadingCover) && (
                        <div className="space-y-2">
                          {isUploadingCover ? (
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Enviando imagem...
                            </div>
                          ) : (
                            <>
                              <div className="relative h-40 w-full overflow-hidden rounded-md border">
                                {field.value && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={field.value}
                                    alt="Prévia da capa"
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  form.setValue("coverImageUrl", "", {
                                    shouldDirty: true,
                                  })
                                }
                              >
                                Remover capa
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano da pesquisa</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2000}
                      max={2100}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="collectionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da coleta</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emphasis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destacar pesquisa</FormLabel>
                  <FormControl>
                    <div className="border-input bg-background flex h-10 items-center gap-2 rounded-md border px-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.checked)
                        }
                      />
                      <span className="text-muted-foreground text-sm">
                        Marque para destacar esta pesquisa
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observação</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px]"
                    placeholder="Observações sobre a pesquisa de preços"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Preços da pesquisa</h3>
                <p className="text-muted-foreground text-sm">
                  Preencha os preços na grade. Células vazias não serão salvas.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Selecionar template" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadTemplateHighlight}
                >
                  Carregar template
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/gerenciar-pesquisas/produtos">Produtos</Link>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/gerenciar-pesquisas/fornecedores">
                    Fornecedores
                  </Link>
                </Button>
              </div>
            </div>

            <PriceMatrixGrid
              mode="prices"
              suppliers={filteredSuppliers}
              products={filteredProducts}
              matrix={matrix}
              onChange={handleMatrixChange}
              highlightedKeys={highlightedKeys}
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/gerenciar-pesquisas")}
              disabled={status === "executing"}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={status === "executing"}>
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : priceSearch ? (
                "Atualizar pesquisa"
              ) : (
                "Criar pesquisa"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpsertPriceSearchPageForm;
