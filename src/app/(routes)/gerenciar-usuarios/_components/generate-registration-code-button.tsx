"use client";

import { Copy, UserPlus } from "lucide-react";
import { useState } from "react";

import { generateRegistrationCode } from "@/actions/generate-registration-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

const GenerateRegistrationCodeButton = () => {
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [registrationCode, setRegistrationCode] = useState<string>("");

  const { execute: generateCode, status: codeStatus } = useAction(
    generateRegistrationCode,
    {
      onSuccess: (result) => {
        if (result.data?.error) {
          toast.error(result.data.error.message);
          return;
        }
        if (result.data?.data?.code) {
          setRegistrationCode(result.data.data.code);
          setCodeDialogOpen(true);
        }
      },
      onError: (error) => {
        const message =
          error.error?.serverError ?? "Erro ao gerar código de cadastro.";
        toast.error(message);
      },
    },
  );

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado para a área de transferência!`);
  };

  const handleGenerateCode = () => {
    generateCode({});
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={handleGenerateCode}
        disabled={codeStatus === "executing"}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Gerar código de cadastro
      </Button>

      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código de Cadastro</DialogTitle>
            <DialogDescription>
              Código gerado com sucesso. Compartilhe este código para permitir o
              cadastro de novos usuários.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-md border p-4 text-center">
              <p className="text-2xl font-bold tracking-wider">
                {registrationCode}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCodeDialogOpen(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => handleCopyToClipboard(registrationCode, "Código")}
              disabled={!registrationCode}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Código
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GenerateRegistrationCodeButton;
