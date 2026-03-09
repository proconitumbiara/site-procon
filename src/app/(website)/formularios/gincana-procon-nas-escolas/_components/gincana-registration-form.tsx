"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Image, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createGincanaRegistration } from "@/actions/create-gincana-registration";
import {
  CLOTHING_SIZES,
  createGincanaRegistrationSchema,
  SCHOOLS,
  STUDENT_PERIODS,
} from "@/actions/create-gincana-registration/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import LegalDialog from "@/components/website/global/LegalDialog";
import { useAction } from "next-safe-action/hooks";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type LegalDialogType = "terms" | "privacy" | "image" | null;

type FormValues = z.infer<typeof createGincanaRegistrationSchema>;

const defaultValues: Partial<FormValues> = {
  participantFullName: "",
  participantPhone: "",
  participantBirthDate: "",
  participantSchool: undefined,
  participantCategory: undefined,
  studentPeriod: undefined,
  employeePosition: "",
  clothingSize: undefined,
  acceptTermsAndPrivacy: undefined,
  acceptImageUse: undefined,
};

export function GincanaRegistrationForm() {
  const [openDialog, setOpenDialog] = useState<LegalDialogType>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(createGincanaRegistrationSchema),
    defaultValues,
    mode: "onChange",
  });

  const category = form.watch("participantCategory");
  const acceptTermsAndPrivacy = form.watch("acceptTermsAndPrivacy");
  const acceptImageUse = form.watch("acceptImageUse");

  const { execute, isExecuting } = useAction(createGincanaRegistration, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success("Inscrição realizada com sucesso!");
      form.reset(defaultValues);
    },
    onError: () => {
      toast.error("Erro ao enviar inscrição. Tente novamente.");
    },
  });

  function onSubmit(values: FormValues) {
    execute({
      ...values,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      locale: typeof navigator !== "undefined" ? navigator.language : undefined,
    });
  }

  const isSubmitDisabled =
    !form.formState.isValid ||
    !acceptTermsAndPrivacy ||
    !acceptImageUse ||
    isExecuting;

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="participantFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="participantPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      type="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="participantBirthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="max-w-72 h-6 md:h-auto md:max-w-full touch-manipulation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="participantSchool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escola <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a escola" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SCHOOLS.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
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
            name="participantCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="student" id="category-student" />
                      <FormLabel htmlFor="category-student" className="cursor-pointer font-normal">
                        Sou Aluno
                      </FormLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="employee" id="category-employee" />
                      <FormLabel htmlFor="category-employee" className="cursor-pointer font-normal">
                        Sou Profissional
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {category === "student" && (
            <FormField
              control={form.control}
              name="studentPeriod"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Série <span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a série" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STUDENT_PERIODS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {category === "employee" && (
            <FormField
              control={form.control}
              name="employeePosition"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>Cargo / Função <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Professor, Coordenador"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="clothingSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho da roupa <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {CLOTHING_SIZES.map((size) => (
                      <label
                        key={size}
                        className="flex cursor-pointer items-center gap-2 rounded-md border p-2 has-checked:border-primary has-checked:bg-primary/5"
                      >
                        <Checkbox
                          checked={!!field.value && field.value === size}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true ? size : undefined)
                          }
                        />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 rounded-lg border p-4">
            <FormField
              control={form.control}
              name="acceptTermsAndPrivacy"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1 leading-none text-xs">
                    <FormLabel className="cursor-pointer font-normal">
                      Aceito os termos de uso e a política de privacidade <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acceptImageUse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <div className="flex-1 space-y-1 leading-none">
                    <FormLabel className="cursor-pointer font-normal">
                      Aceito o uso de imagens pessoais registradas durante os eventos do projeto. <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isSubmitDisabled} className="w-full">
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Finalizar inscrição"
            )}
          </Button>
        </form>
      </Form>

      {/* Botões para abrir os termos */}
      <div className="flex flex-col w-full items-center gap-3">
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="font-bold text-primary text-center">Atenção:</h1>
          <p className="text-sm text-muted-foreground">
            Ao preencher o formulário, você concorda com os termos de uso, política de privacidade e termo de autorização de uso de imagem.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setOpenDialog("terms")}
          >
            <FileText className="size-4" />
            Ler Termos de Uso
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setOpenDialog("privacy")}
          >
            <Shield className="size-4" />
            Ler Política de Privacidade
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setOpenDialog("image")}
          >
            <Image className="size-4" />
            Ler Termo de Uso de Imagem
          </Button>
        </div>
      </div>

      {openDialog && (
        <LegalDialog
          type={openDialog}
          open={openDialog !== null}
          onOpenChange={(open) => !open && setOpenDialog(null)}
        />
      )}

    </div>

  );
}
