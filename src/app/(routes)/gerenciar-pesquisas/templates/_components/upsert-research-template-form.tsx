"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useFieldArray, useForm } from "react-hook-form";
import { useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { deleteResearchTemplate } from "@/actions/delete-research-template";
import { upsertResearchTemplate } from "@/actions/upsert-research-template";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { categoriesTable, productsTable, suppliersTable } from "@/db/schema";

type Supplier = typeof suppliersTable.$inferSelect;
type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type ResearchTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  items: Array<{
    productId: string;
    supplierId: string;
    sortOrder: number;
  }>;
};

interface UpsertResearchTemplateFormProps {
  template?: ResearchTemplate;
  suppliers: Supplier[];
  products: Product[];
  onSuccess?: () => void;
}

const itemSchema = z.object({
  productId: z.string().uuid({ message: "Selecione um produto." }),
  supplierId: z.string().uuid({ message: "Selecione um fornecedor." }),
});

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Informe o nome." }),
  slug: z.string().trim().min(1, { message: "Informe o slug." }),
  description: z.string().trim().optional(),
  isActive: z.boolean(),
  items: z.array(itemSchema),
});

type FormValues = z.infer<typeof formSchema>;

const createEmptyItem = (productId?: string, supplierId?: string) => ({
  productId: productId ?? "",
  supplierId: supplierId ?? "",
});

const UpsertResearchTemplateForm = ({
  template,
  suppliers,
  products,
  onSuccess,
}: UpsertResearchTemplateFormProps) => {
  const activeProducts = products.filter((product) => product.isActive);
  const activeSuppliers = suppliers.filter((supplier) => supplier.isActive);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name ?? "",
      slug: template?.slug ?? "",
      description: template?.description ?? "",
      isActive: template?.isActive ?? true,
      items:
        template?.items.map((item) => ({
          productId: item.productId,
          supplierId: item.supplierId,
        })) ??
        [createEmptyItem(activeProducts[0]?.id, activeSuppliers[0]?.id)],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  const itemsListRef = useRef<HTMLDivElement>(null);

  const { execute, status } = useAction(upsertResearchTemplate, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success(
        template ? "Template atualizado com sucesso!" : "Template criado com sucesso!",
      );
      onSuccess?.();
      window.location.reload();
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
        onSuccess?.();
        window.location.reload();
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
      slug: values.slug,
      description: values.description || undefined,
      isActive: values.isActive,
      items: values.items.map((item, index) => ({
        ...item,
        sortOrder: index,
      })),
    });
  };

  const handleAddItem = () => {
    append(createEmptyItem(activeProducts[0]?.id, activeSuppliers[0]?.id));

    requestAnimationFrame(() => {
      const itemsList = itemsListRef.current;
      if (!itemsList) return;

      itemsList.scrollTo({
        top: itemsList.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  return (
    <DialogContent className="flex sm:h-[95vh] w-full sm:max-w-[95vw] flex-col p-0">
      <div className="border-b px-6 pt-6 pb-4">
        <DialogTitle>
          {template ? "Editar template de pesquisa" : "Novo template de pesquisa"}
        </DialogTitle>
        <DialogDescription>
          Defina combinações de produto e fornecedor para reutilizar em novas
          pesquisas.
        </DialogDescription>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-border/40">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="template-dia-das-maes" {...field} />
                    </FormControl>
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

            <div className="space-y-4">

              <div className="rounded-md">
                <div className="bg-background/95 sticky top-0 z-10 flex items-center justify-between  px-3 py-2">
                  <h3 className="text-lg font-semibold">Itens do template ({fields.length})</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar item
                  </Button>
                </div>

                <div
                  ref={itemsListRef}
                  className=" grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[40vh] space-y-2 overflow-y-auto p-3 [scrollbar-width:thin] [scrollbar-color:transparent_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-border/40"
                >
                  {fields.map((fieldItem, index) => (
                    <div
                      key={fieldItem.id}
                      className="rounded-md border p-3"
                    >

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground md:pt-2">
                          Item {index + 1}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 flex w-full flex-col gap-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem className="w-full space-y-1">
                              <FormLabel className="text-xs md:sr-only">Produto</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9 w-full">
                                    <SelectValue placeholder="Selecione um produto" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                      disabled={!product.isActive}
                                    >
                                      {product.name}
                                      {!product.isActive ? " - inativo" : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.supplierId`}
                          render={({ field }) => (
                            <FormItem className="w-full space-y-1">
                              <FormLabel className="text-xs md:sr-only">Fornecedor</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9 w-full">
                                    <SelectValue placeholder="Selecione um fornecedor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {suppliers.map((supplier) => (
                                    <SelectItem
                                      key={supplier.id}
                                      value={supplier.id}
                                      disabled={!supplier.isActive}
                                    >
                                      {supplier.name}
                                      {!supplier.isActive ? " - inativo" : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <div className="border-t px-6 pt-4 pb-6">
        <DialogFooter className="flex flex-wrap gap-2">
          {template && template.isActive && (
            <Button
              variant="destructive"
              onClick={() => deactivateTemplate({ id: template.id })}
              disabled={deactivateStatus === "executing" || status === "executing"}
            >
              {deactivateStatus === "executing" ? "Inativando..." : "Inativar"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onSuccess}
            disabled={status === "executing" || deactivateStatus === "executing"}
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={status === "executing" || deactivateStatus === "executing"}
          >
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
        </DialogFooter>
      </div>
    </DialogContent>
  );
};

export default UpsertResearchTemplateForm;
