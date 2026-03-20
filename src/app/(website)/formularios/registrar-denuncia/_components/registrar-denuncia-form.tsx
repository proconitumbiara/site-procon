"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createComplaint } from "@/actions/create-complaint";
import { createComplaintSchema } from "@/actions/create-complaint/schema";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof createComplaintSchema>;

function getTodayInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const getDefaultValues = (): FormValues => ({
  isAnonymous: false,

  complainantName: undefined,
  complainantProfession: undefined,
  complainantCpf: undefined,
  complainantPhone: undefined,
  complainantEmail: undefined,
  complainantAddress: undefined,
  complainantZipCode: undefined,

  respondentCompanyName: "",
  respondentCnpj: undefined,
  respondentAddress: "",
  respondentZipCode: "",
  respondentAdditionalInfo: undefined,

  factsDescription: "",
  request: "",
  evidenceType: "none",

  filingDate: getTodayInputValue(),
});

export function RegistrarDenunciaForm() {
  const form = useForm<FormValues>({
    // Cast para compatibilidade de tipos (zod@4 + react-hook-form + resolvers).
    resolver: zodResolver(createComplaintSchema) as any,
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  const isAnonymous = form.watch("isAnonymous");

  // Se alternar para anonimato, removemos valores/erros para que o schema
  // condicional valide como "ok" sem exigir dados do denunciante.
  useEffect(() => {
    if (!isAnonymous) return;

    const fields = [
      "complainantName",
      "complainantProfession",
      "complainantCpf",
      "complainantPhone",
      "complainantEmail",
      "complainantAddress",
      "complainantZipCode",
    ] as const;

    for (const f of fields) {
      form.setValue(f, undefined, { shouldDirty: false, shouldValidate: true });
    }
    form.clearErrors(fields as any);
  }, [form, isAnonymous]);

  const { execute, isExecuting } = useAction(createComplaint, {
    onSuccess: (result) => {
      if (result?.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      toast.success("Denúncia enviada com sucesso!");
      form.reset(getDefaultValues());
    },
    onError: () => {
      toast.error("Erro ao enviar denúncia. Tente novamente.");
    },
  });

  const isSubmitDisabled = !form.formState.isValid || isExecuting;

  const onSubmit = (values: FormValues) => {
    execute(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* 1) Solicitação Anônima */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1) Solicitar Fiscalização pelo PROCON</h3>
            <p className="text-sm text-muted-foreground">Solicitação Anônima:</p>
          </div>

          <FormField
            control={form.control}
            name="isAnonymous"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value ? "sim" : "nao"}
                    onValueChange={(val) => field.onChange(val === "sim")}
                    className="flex flex-wrap gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="nao" id="anon-nao" />
                      <FormLabel
                        htmlFor="anon-nao"
                        className="cursor-pointer font-normal"
                      >
                        Não
                      </FormLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="sim" id="anon-sim" />
                      <FormLabel
                        htmlFor="anon-sim"
                        className="cursor-pointer font-normal"
                      >
                        Sim
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 2) Qualificação do denunciante (condicional) */}
        {!isAnonymous && (
          <div className="space-y-4 rounded-xl border p-4">
            <h3 className="text-lg font-semibold">2) Qualificação do (a) denunciante (Consumidor)</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="complainantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complainantProfession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão</FormLabel>
                    <FormControl>
                      <Input placeholder="Informe sua profissão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="complainantCpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complainantPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
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

              <FormField
                control={form.control}
                name="complainantEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seuemail@exemplo.com"
                        type="email"
                        {...field}
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
                name="complainantZipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complainantAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço (rua/nº/bairro/cidade/Estado)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informe seu endereço completo"
                        className="min-h-[90px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* 3) Qualificação do denunciado (Fornecedor) */}
        <div className="space-y-4 rounded-xl border p-4">
          <h3 className="text-lg font-semibold">3) Qualificação do denunciado (Fornecedor)</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="respondentCompanyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social / Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="Informe o nome do fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="respondentCnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ (se houver)</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000/0000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="respondentAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço (rua/nº/bairro/cidade/Estado)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informe o endereço do fornecedor"
                    className="min-h-[110px]"
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
              name="respondentZipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="respondentAdditionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações Complementares</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex.: ponto de referência, inscrição estadual, etc."
                      className="min-h-[90px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* 4) Relato dos fatos */}
        <div className="space-y-4 rounded-xl border p-4">
          <h3 className="text-lg font-semibold">4) Relato dos Fatos (Descrição circunstanciada)</h3>
          <p className="text-sm text-muted-foreground">
            Descreva detalhadamente o fato/problema, incluindo dados do evento
            (data/hora ou período), produto/serviço, valor, forma de pagamento,
            local, nomes de pessoas envolvidas, respostas negativas ou falta de
            solução, e número de protocolos das tentativas.
          </p>

          <FormField
            control={form.control}
            name="factsDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relato</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escreva aqui sua descrição"
                    className="min-h-[180px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 5) Do Pedido */}
        <div className="space-y-4 rounded-xl border p-4">
          <h3 className="text-lg font-semibold">5) Do Pedido</h3>
          <p className="text-sm text-muted-foreground">
            O que você requer ao PROCON?
          </p>

          <FormField
            control={form.control}
            name="request"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requer:</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o pedido"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 6) Meios de prova */}
        <div className="space-y-4 rounded-xl border p-4">
          <h3 className="text-lg font-semibold">6) Indicação dos meios de prova</h3>
          <p className="text-sm text-muted-foreground">
            Indique abaixo os meios com os quais pretende provar suas alegações.
          </p>

          <FormField
            control={form.control}
            name="evidenceType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="documental" id="ev-doc" />
                      <FormLabel htmlFor="ev-doc" className="cursor-pointer font-normal">
                        Documental
                      </FormLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="photos_video" id="ev-media" />
                      <FormLabel htmlFor="ev-media" className="cursor-pointer font-normal">
                        Fotos/ Vídeo
                      </FormLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="none" id="ev-none" />
                      <FormLabel htmlFor="ev-none" className="cursor-pointer font-normal">
                        Não possuo provas
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Data de protocolo (conforme PDF) */}
        <div className="space-y-2 rounded-xl border p-4">
          <h3 className="text-lg font-semibold">Data</h3>
          <p className="text-sm text-muted-foreground">Itumbiara, ____ de _________________ de 20____.</p>

          <FormField
            control={form.control}
            name="filingDate"
            render={({ field }) => (
              <FormItem className="max-w-72">
                <FormLabel>Data da solicitação</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitDisabled}>
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar denúncia"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

