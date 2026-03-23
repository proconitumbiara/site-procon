"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Phone } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
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

type EvidenceFlowStep = "idle" | "sending" | "saving" | "done" | "error";

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  if (parts.length < 2) return "";
  return `.${parts[parts.length - 1]}`;
}

function getIdPrefixFromComplaintId(complaintId: unknown): string | null {
  const digits = String(complaintId ?? "").replace(/\D/g, "");
  if (digits.length < 6) return null;
  return digits.slice(0, 6);
}

function isPdfFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  return file.type === "application/pdf" || ext === ".pdf";
}

function isAllowedMediaImage(file: File): boolean {
  const ext = getFileExtension(file.name);
  return (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".png"
  );
}

function isAllowedMediaVideoOrAudio(file: File): boolean {
  const ext = getFileExtension(file.name);
  const isMp4 =
    file.type === "video/mp4" ||
    ext === ".mp4";
  const isMp3 =
    file.type === "audio/mpeg" ||
    file.type === "audio/mp3" ||
    ext === ".mp3";
  return isMp4 || isMp3;
}

const getDefaultValues = (): FormValues => ({
  isAnonymous: false,

  // Use strings vazias em vez de `undefined` para evitar warning
  // de "uncontrolled -> controlled" nos inputs que recebem `{...field}`.
  complainantName: "",
  complainantProfession: "",
  complainantCpf: "",
  complainantPhone: "",
  complainantEmail: "",
  complainantAddress: "",
  complainantZipCode: "",

  respondentCompanyName: "",
  respondentCnpj: "",
  respondentAddress: "",
  respondentAdditionalInfo: "",

  factsDescription: "",
  request: "",
});

export function RegistrarDenunciaForm() {
  const form = useForm<FormValues>({
    // Cast para compatibilidade de tipos (zod@4 + react-hook-form + resolvers).
    resolver: zodResolver(createComplaintSchema) as any,
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  const isAnonymous = form.watch("isAnonymous");
  const evidenceType = form.watch("evidenceType");
  const isValid = form.formState.isValid;

  const [flowOpen, setFlowOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<EvidenceFlowStep>("idle");
  const [lastFlowError, setLastFlowError] = useState<string | null>(null);
  const [complaintCode6, setComplaintCode6] = useState<string>("");
  const [savingCurrent, setSavingCurrent] = useState(0);
  const [savingTotal, setSavingTotal] = useState(0);

  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const submitSnapshotRef = useRef<{
    evidenceType: FormValues["evidenceType"];
    docFiles: File[];
    mediaFiles: File[];
  } | null>(null);

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
      form.setValue(f, "", { shouldDirty: false, shouldValidate: true });
    }
    form.clearErrors(fields as any);
  }, [form, isAnonymous]);

  const isBusy = flowStep === "sending" || flowStep === "saving";

  const { execute, isExecuting } = useAction(createComplaint, {
    onSuccess: async (result) => {
      if (result?.data?.error) {
        const message =
          result.data.error.message ??
          "Erro ao enviar denúncia. Tente novamente.";
        setLastFlowError(message);
        setFlowStep("error");
        toast.error(message);
        return;
      }

      const complaintId = result?.data?.complaintId;
      const idPrefix = getIdPrefixFromComplaintId(complaintId);
      if (!idPrefix) {
        const message =
          "Erro ao enviar denúncia: a API externa não retornou um id válido.";
        setLastFlowError(message);
        setFlowStep("error");
        toast.error(message);
        return;
      }

      setComplaintCode6(idPrefix);

      const snapshot = submitSnapshotRef.current;
      const selectedEvidenceType = snapshot?.evidenceType ?? "none";
      const snapshotDocFiles = snapshot?.docFiles ?? [];
      const snapshotMediaFiles = snapshot?.mediaFiles ?? [];

      const uploadDocuments = async (files: File[]) => {
        setSavingTotal(files.length);
        setSavingCurrent(0);
        setFlowStep("saving");

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "denunciations/documents");
          formData.append("idPrefix", idPrefix);
          formData.append("index", String(i + 1));

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error ?? "Falha ao enviar documento.");
          }

          setSavingCurrent((c) => c + 1);
        }
      };

      const uploadMedia = async (files: File[]) => {
        const imageFiles = files.filter(isAllowedMediaImage);
        const videoAudioFiles = files.filter(isAllowedMediaVideoOrAudio);

        const total = imageFiles.length + videoAudioFiles.length;
        setSavingTotal(total);
        setSavingCurrent(0);
        setFlowStep("saving");

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "denunciations/media");
          formData.append("idPrefix", idPrefix);
          formData.append("index", String(i + 1));

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error ?? "Falha ao enviar imagem.");
          }

          setSavingCurrent((c) => c + 1);
        }

        for (let i = 0; i < videoAudioFiles.length; i++) {
          const file = videoAudioFiles[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "denunciations/media");
          formData.append("idPrefix", idPrefix);
          formData.append("index", String(i + 1));

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error ?? "Falha ao enviar vídeo/áudio.");
          }

          setSavingCurrent((c) => c + 1);
        }
      };

      try {
        if (selectedEvidenceType === "documental") {
          const validDocs = snapshotDocFiles.filter(isPdfFile);
          if (validDocs.length > 0) {
            await uploadDocuments(validDocs);
          }
        } else if (selectedEvidenceType === "photos_video") {
          const validMedia = snapshotMediaFiles.filter(
            (f) => isAllowedMediaImage(f) || isAllowedMediaVideoOrAudio(f),
          );
          if (validMedia.length > 0) {
            await uploadMedia(validMedia);
          }
        }

        setFlowStep("done");
        setFlowOpen(true);

        // Limpeza após concluir o fluxo.
        form.reset(getDefaultValues());
        setDocFiles([]);
        setMediaFiles([]);
        submitSnapshotRef.current = null;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao salvar provas.";
        setLastFlowError(message);
        setFlowStep("error");
        toast.error(message);
      }
    },
    onError: () => {
      const message = "Erro ao enviar denúncia. Tente novamente.";
      setLastFlowError(message);
      setFlowStep("error");
      toast.error(message);
    },
  });

  const isSubmitDisabled = !isValid || isExecuting || isBusy;

  const onSubmit = (values: FormValues) => {
    if (isBusy) return;

    submitSnapshotRef.current = {
      evidenceType: values.evidenceType,
      docFiles: docFiles.slice(),
      mediaFiles: mediaFiles.slice(),
    };

    setLastFlowError(null);
    setComplaintCode6("");
    setSavingCurrent(0);
    setSavingTotal(0);
    setFlowOpen(true);
    setFlowStep("sending");

    const evidenceTypeToSend =
      values.evidenceType && values.evidenceType !== "none"
        ? values.evidenceType
        : undefined;

    execute({
      ...values,
      // A API externa já define `evidenceType` como `none` por padrão.
      // Portanto, nunca enviamos `evidenceType: "none"`.
      evidenceType: evidenceTypeToSend,
      // A API externa já define `filingDate` como `Date(now)` por padrão.
      filingDate: undefined,
      // Alguns tipos do RHF deixam `complainantName` possivelmente undefined;
      // por segurança, garantimos sempre string para a validação do schema.
      complainantName: values.complainantName ?? "",
    } as any);
  };

  const handlePickDocumentFiles = (picked: File[]) => {
    if (isBusy) return;

    const valid: File[] = [];
    const invalidNames: string[] = [];
    for (const f of picked) {
      if (isPdfFile(f)) valid.push(f);
      else invalidNames.push(f.name);
    }

    if (invalidNames.length > 0) {
      const shown = invalidNames.slice(0, 3).join(", ");
      toast.error(
        `Alguns arquivos foram recusados: ${shown}${invalidNames.length > 3
          ? ` (+${invalidNames.length - 3} arquivos)`
          : ""
        }. Envie apenas PDF.`,
      );
    }

    if (valid.length > 0) setDocFiles((prev) => [...prev, ...valid]);
  };

  const handlePickMediaFiles = (picked: File[]) => {
    if (isBusy) return;

    const valid: File[] = [];
    const invalidNames: string[] = [];
    for (const f of picked) {
      const ok = isAllowedMediaImage(f) || isAllowedMediaVideoOrAudio(f);
      if (ok) valid.push(f);
      else invalidNames.push(f.name);
    }

    if (invalidNames.length > 0) {
      const shown = invalidNames.slice(0, 3).join(", ");
      toast.error(
        `Alguns arquivos foram recusados: ${shown}${invalidNames.length > 3
          ? ` (+${invalidNames.length - 3} arquivos)`
          : ""
        }. Envie apenas JPG/PNG, MP4 e MP3.`,
      );
    }

    if (valid.length > 0) setMediaFiles((prev) => [...prev, ...valid]);
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
            <h3 className="text-lg font-semibold">Identificação</h3>
            <p className="text-sm text-muted-foreground">Você deseja registrar a denúncia de forma anônima?</p>
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
          <div className="space-y-4 rounded-xl border p-4 relative">
            <div>
              <h3 className="text-lg font-semibold">Denunciante</h3>
              <p className="text-sm text-muted-foreground">Informe seus dados para que possamos contatar você caso necessário.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="complainantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo <span className="text-red-500">*</span></FormLabel>
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
                    <FormLabel>CPF <span className="text-red-500">*</span></FormLabel>
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

              <FormField
                control={form.control}
                name="complainantEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail <span className="text-red-500">*</span></FormLabel>
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
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-xs text-red-500/80 text-center absolute top-4 right-4">Campos com * são obrigatórios</p>
          </div>
        )}

        {/* 3) Qualificação do denunciado (Fornecedor) */}
        <div className="space-y-4 rounded-xl border p-4 relative">
          <div>
            <h3 className="text-lg font-semibold">Denunciado</h3>
            <p className="text-sm text-muted-foreground">Informe os dados da empresa ou prestador de serviço.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="respondentCompanyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social / Nome Fantasia <span className="text-red-500">*</span></FormLabel>
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
                    className="min-h-[60px]"
                    {...field}
                  />
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
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-xs text-red-500/80 text-center absolute top-4 right-4">Campos com * são obrigatórios</p>
        </div>

        {/* 4) Relato dos fatos */}
        <div className="space-y-4 rounded-xl border p-4 relative">
          <div>
            <h3 className="text-lg font-semibold">Relato dos Fatos <span className="text-red-500">*</span></h3>
            <p className="text-sm text-muted-foreground">Descreva detalhadamente o fato/problema, incluindo dados do evento (data/hora ou período), produto/serviço, valor, forma de pagamento, local, nomes de pessoas envolvidas, respostas negativas ou falta de solução, e número de protocolos das tentativas.</p>
          </div>

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

          <p className="text-xs text-red-500/80 text-center absolute top-4 right-4">Campo obrigatório!</p>

        </div>

        {/* 5) Do Pedido */}
        <div className="space-y-4 rounded-xl border p-4 relative">
          <div>
            <h3 className="text-lg font-semibold">Pedido <span className="text-red-500">*</span></h3>
            <p className="text-sm text-muted-foreground">Informe o que você requer ao Procon Itumbiara em relação à denúncia.</p>
          </div>

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

          <p className="text-xs text-red-500/80 text-center absolute top-4 right-4">Campo obrigatório!</p>
        </div>

        {/* 6) Meios de prova */}
        <div className="space-y-4 rounded-xl border p-4">
          <div>
            <h3 className="text-lg font-semibold">Meios de Prova</h3>
            <p className="text-sm text-muted-foreground">Indique abaixo os meios com os quais pretende provar suas alegações.</p>
          </div>

          <FormField
            control={form.control}
            name="evidenceType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    value={field.value ?? ""}
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

        {evidenceType === "documental" && (
          <div className="space-y-3 rounded-xl border p-4">
            <div className="space-y-2">
              <FormLabel>Documentos (PDF)</FormLabel>
              <Input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                disabled={isBusy}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) handlePickDocumentFiles(files);
                  e.currentTarget.value = "";
                }}
              />
              {docFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Arquivos selecionados: {docFiles.length}
                  </div>
                  {docFiles.map((f, idx) => (
                    <div
                      key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="truncate text-sm">{f.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          setDocFiles((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Aceitamos apenas arquivos PDF.
              </p>
            </div>
          </div>
        )}

        {evidenceType === "photos_video" && (
          <div className="space-y-3 rounded-xl border p-4">
            <div className="space-y-2">
              <FormLabel>
                Fotos / Vídeo / Áudio (JPG, PNG, MP4, MP3)
              </FormLabel>
              <Input
                type="file"
                accept="image/jpeg,image/png,video/mp4,audio/mpeg,.jpg,.jpeg,.png,.mp4,.mp3"
                multiple
                disabled={isBusy}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) handlePickMediaFiles(files);
                  e.currentTarget.value = "";
                }}
              />
              {mediaFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Arquivos selecionados: {mediaFiles.length}
                  </div>
                  {mediaFiles.map((f, idx) => (
                    <div
                      key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="truncate text-sm">{f.name}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          setMediaFiles((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Aceitamos apenas JPG/PNG para imagens e MP4/MP3 para vídeos/áudio.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitDisabled}>
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {flowStep === "saving" ? "Salvando provas..." : "Enviando..."}
              </>
            ) : (
              "Enviar denúncia"
            )}
          </Button>
        </div>
      </form>

      <Dialog
        open={flowOpen}
        onOpenChange={(next) => {
          if (!next && isBusy) return;
          setFlowOpen(next);
          if (!next) setFlowStep("idle");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            {flowStep === "sending" && (
              <DialogTitle>Enviando denúncia...</DialogTitle>
            )}
            {flowStep === "saving" && (
              <DialogTitle>Salvando provas...</DialogTitle>
            )}
            {flowStep === "done" && <DialogTitle>Concluído</DialogTitle>}
            {flowStep === "error" && <DialogTitle>Erro</DialogTitle>}
            {flowStep === "idle" && <DialogTitle>Carregando...</DialogTitle>}

            {flowStep === "sending" && (
              <DialogDescription>
                Aguarde um momento enquanto enviamos sua denúncia.
              </DialogDescription>
            )}

            {flowStep === "saving" && (
              <DialogDescription className="space-y-3">
                <div>
                  Salvando provas... {savingCurrent}/{savingTotal}
                </div>
                <div className="h-2 w-full rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-foreground"
                    style={{
                      width:
                        savingTotal > 0
                          ? `${Math.min(
                            100,
                            Math.round((savingCurrent / savingTotal) * 100),
                          )}%`
                          : "0%",
                    }}
                  />
                </div>
              </DialogDescription>
            )}

            {flowStep === "done" && (
              <DialogDescription>
                Sua denúncia foi enviada com sucesso. O código da sua denúncia
                é <span className="font-mono text-primary font-bold">#{complaintCode6}</span>, salve-o e caso queira, entre em
                contato com o Procon Itumbiara e informe este código para ter notícias a
                cerca da denúncia. <br /><br />
                <a href="tel:+556434321215" className="flex items-center gap-2 no-underline"><Phone className="w-4 h-4" /> (64) 3432-1215</a>
                <a href="mailto:procon@itumbiara.go.gov.br" className="flex items-center gap-2 no-underline mt-1"><Mail className="w-4 h-4" /> procon@itumbiara.go.gov.br</a>
              </DialogDescription>
            )}

            {flowStep === "error" && (
              <DialogDescription>
                {lastFlowError ?? "Não foi possível finalizar o envio da denúncia."}
              </DialogDescription>
            )}
          </DialogHeader>

          {(flowStep === "done" || flowStep === "error") && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFlowOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </Form>
  );
}

