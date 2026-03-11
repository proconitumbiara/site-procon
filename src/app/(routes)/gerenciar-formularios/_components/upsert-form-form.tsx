"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertForm } from "@/actions/upsert-form";
import { upsertFormSchema } from "@/actions/upsert-form/schema";
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
import type { FormRecord } from "@/lib/data/content";

const formSchema = upsertFormSchema;

type FormValues = z.infer<typeof formSchema>;

type FormWithProject = FormRecord & { project?: { title: string } };

interface UpsertFormFormProps {
  /** Para edição: formulário existente. Para criação: undefined. */
  form?: FormWithProject;
  /** Para criação: ID do projeto ao qual o formulário será vinculado. */
  projectId?: string;
  onSuccess?: () => void;
  /** Quando true, renderiza apenas o formulário (página [id]); quando false, dentro de DialogContent (criação no card). */
  embedded?: boolean;
}

const getDefaultValues = (
  form?: FormWithProject,
  projectId?: string,
): Partial<FormValues> => ({
  id: form?.id,
  name: form?.name ?? "",
  slug: form?.slug ?? "",
  isActive: form?.isActive ?? true,
  projectId: form?.projectId ?? projectId ?? "",
});

export default function UpsertFormForm({
  form: existingForm,
  projectId,
  onSuccess,
  embedded = false,
}: UpsertFormFormProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(existingForm, projectId),
  });

  const { execute, status } = useAction(upsertForm, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success(
        existingForm
          ? "Formulário atualizado com sucesso!"
          : "Formulário criado com sucesso!",
      );
      if (embedded) {
        router.refresh();
      } else {
        onSuccess?.();
        form.reset(getDefaultValues(undefined, projectId));
      }
    },
    onError: () => {
      toast.error("Erro ao salvar formulário.");
    },
  });

  const onSubmit = (values: FormValues) => {
    execute(values);
  };

  return (
    <Wrapper embedded={embedded} form={existingForm}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={embedded ? "flex flex-col gap-3" : "flex flex-col gap-4"}
        >
          <div className={embedded ? "grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto_auto]" : "grid gap-4 md:grid-cols-2"}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className={embedded ? "min-w-0" : undefined}>
                  <FormLabel className={embedded ? "sr-only" : undefined}>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do formulário" {...field} className={embedded ? "h-9" : undefined} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem className={embedded ? "min-w-0" : undefined}>
                  <FormLabel className={embedded ? "sr-only" : undefined}>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="slug-do-formulario" {...field} className={embedded ? "h-9" : undefined} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className={embedded ? "flex flex-row items-center gap-2 space-y-0" : "flex items-center gap-3 rounded-md border p-3"}>
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel className={embedded ? "m-0 text-sm" : "m-0"}>
                    Ativo
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            {embedded && (
              <div className="flex items-end">
                <Button type="submit" size="sm" disabled={status === "executing"}>
                  {status === "executing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            )}
          </div>

          {!embedded && (
            <DialogFooter>
              <Button type="submit" disabled={status === "executing"}>
                {status === "executing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : existingForm ? (
                  "Atualizar formulário"
                ) : (
                  "Criar formulário"
                )}
              </Button>
            </DialogFooter>
          )}
        </form>
      </Form>
    </Wrapper>
  );
}

function Wrapper({
  embedded,
  children,
  form,
}: {
  embedded: boolean;
  children: React.ReactNode;
  form?: FormWithProject;
}) {
  if (embedded) {
    return <div className="min-w-0">{children}</div>;
  }
  return (
    <DialogContent className="max-w-3xl">
      <DialogTitle>{form ? "Editar formulário" : "Novo formulário"}</DialogTitle>
      <DialogDescription>
        {form
          ? "Atualize as informações do formulário."
          : "Cadastre um novo formulário de inscrição vinculado ao projeto."}
      </DialogDescription>
      {children}
    </DialogContent>
  );
}
