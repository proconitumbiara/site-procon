"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertProject } from "@/actions/upsert-project";
import { upsertProjectSchema } from "@/actions/upsert-project/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { ProjectWithDocuments } from "@/types/content-management";

const PROJECT_STATUSES = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "draft", label: "Rascunho" },
] as const;

interface UpsertProjectFormProps {
  project?: ProjectWithDocuments;
  onSuccess?: () => void;
  /** Quando true, renderiza apenas o formulário (para página [id]); quando false, dentro de DialogContent (criação). */
  embedded?: boolean;
}

const formSchema = upsertProjectSchema.omit({ id: true });

type FormValues = z.infer<typeof formSchema>;

const getDefaultValues = (project?: ProjectWithDocuments): FormValues => ({
  title: project?.title ?? "",
  slug: project?.slug ?? "",
  summary: project?.summary ?? "",
  description: project?.description ?? "",
  coverImageUrl: project?.coverImageUrl ?? "",
  emphasis: project?.emphasis ?? false,
  status: project?.status ?? "active",
});

const UpsertProjectForm = ({
  project,
  onSuccess,
  embedded = false,
}: UpsertProjectFormProps) => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(project),
  });

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const { execute, status } = useAction(upsertProject, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success(
        project
          ? "Projeto atualizado com sucesso!"
          : "Projeto criado com sucesso!",
      );
      if (embedded) {
        router.refresh();
      } else {
        onSuccess?.();
        form.reset(getDefaultValues(project));
      }
    },
    onError: (error) => {
      const message =
        error.error?.serverError ??
        error.error?.validationErrors?.title?._errors?.[0] ??
        "Erro ao salvar projeto.";
      toast.error(message);
    },
  });

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

  const onSubmit = (values: FormValues) => {
    execute({
      ...values,
      id: project?.id,
    });
  };

  return (
    <Wrapper embedded={embedded} project={project}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do projeto" {...field} />
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
                    <Input placeholder="slug-do-projeto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
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
                  <Textarea placeholder="Resumo do projeto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição detalhada</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[180px]"
                    placeholder="Descrição completa"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="emphasis"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 rounded-md border p-3">
                <FormControl>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                </FormControl>
                <FormLabel className="m-0">Destacar projeto</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {embedded ? (
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={status === "executing"}>
                {status === "executing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Atualizar projeto"
                )}
              </Button>
            </div>
          ) : (
            <DialogFooter>
              <Button type="submit" disabled={status === "executing"}>
                {status === "executing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : project ? (
                  "Atualizar projeto"
                ) : (
                  "Criar projeto"
                )}
              </Button>
            </DialogFooter>
          )}
        </form>
      </Form>
    </Wrapper>
  );
};

const Wrapper = ({
  embedded,
  children,
  project,
}: {
  embedded: boolean;
  children: React.ReactNode;
  project?: ProjectWithDocuments;
}) => {
  if (embedded) {
    return <div className="space-y-4">{children}</div>;
  }
  return (
    <DialogContent className="max-w-3xl">
      <DialogTitle>{project ? "Editar projeto" : "Novo projeto"}</DialogTitle>
      <DialogDescription>
        {project
          ? "Atualize as informações do projeto."
          : "Cadastre um novo projeto institucional."}
      </DialogDescription>
      {children}
    </DialogContent>
  );
};

export default UpsertProjectForm;
