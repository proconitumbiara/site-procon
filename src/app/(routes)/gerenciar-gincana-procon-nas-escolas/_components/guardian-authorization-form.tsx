"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createGuardianAndAuthorization } from "@/actions/create-guardian-and-authorization";
import { createGuardianAndAuthorizationSchema } from "@/actions/create-guardian-and-authorization/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
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

const RELATIONSHIP_OPTIONS = [
  "Pai",
  "Mãe",
  "Avô",
  "Avó",
  "Tio",
  "Tia",
  "Outro",
] as const;

const formSchema = createGuardianAndAuthorizationSchema.omit({
  registrationId: true,
  fileUrl: true,
});

type FormValues = z.infer<typeof formSchema>;

interface GuardianAuthorizationFormProps {
  registrationId: string;
  onSuccess?: () => void;
  trigger: React.ReactNode;
}

export default function GuardianAuthorizationForm({
  registrationId,
  onSuccess,
  trigger,
}: GuardianAuthorizationFormProps) {
  const [open, setOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      document: "",
      phone: "",
      relationship: "",
    },
  });

  const { execute, isExecuting } = useAction(createGuardianAndAuthorization, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success("Responsável e autorização cadastrados com sucesso!");
      form.reset();
      setPdfFile(null);
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao cadastrar. Tente novamente.");
    },
  });

  const uploadPdf = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "gincana-authorization");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "Falha no upload do PDF.");
    }
    return data.fileUrl;
  };

  async function onSubmit(values: FormValues) {
    if (!pdfFile) {
      toast.error("Selecione o arquivo PDF da autorização.");
      return;
    }
    if (pdfFile.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são permitidos.");
      return;
    }

    setIsUploading(true);
    try {
      const fileUrl = await uploadPdf(pdfFile);
      execute({
        registrationId,
        fullName: values.fullName,
        document: values.document,
        phone: values.phone,
        relationship: values.relationship,
        fileUrl,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao enviar o PDF.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Cadastrar responsável e autorização</DialogTitle>
        <DialogDescription>
          Preencha os dados do responsável e envie o PDF da autorização de uso
          de imagem.
        </DialogDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo do responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parentesco</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Autorização (PDF)</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="application/pdf"
                  className="cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setPdfFile(file ?? null);
                  }}
                />
                {pdfFile && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FileText className="size-4" />
                    {pdfFile.name}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Envie o PDF da autorização de uso de imagem assinada.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isExecuting || isUploading || !pdfFile}
              >
                {(isExecuting || isUploading) && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isUploading
                  ? "Enviando PDF..."
                  : isExecuting
                    ? "Salvando..."
                    : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
