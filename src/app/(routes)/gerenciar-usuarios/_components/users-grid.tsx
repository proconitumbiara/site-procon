"use client";

import { Copy, KeyRound, Pencil } from "lucide-react";
import { useState } from "react";

import { generateResetPasswordLink } from "@/actions/generate-reset-password-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { usersTable } from "@/db/schema";
import { formatCPF, formatDate, formatPhone } from "@/lib/formatters";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import EditUserForm from "./edit-user-form";

interface UsersGridProps {
  users: (typeof usersTable.$inferSelect)[];
}

const UsersGrid = ({ users }: UsersGridProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resetLinkDialogOpen, setResetLinkDialogOpen] = useState(false);
  const [resetLink, setResetLink] = useState<string>("");
  const [resetLinkUserId, setResetLinkUserId] = useState<string>("");

  const { execute: generateResetLink, status: resetLinkStatus } = useAction(
    generateResetPasswordLink,
    {
      onSuccess: (result) => {
        if (result.data?.error) {
          toast.error(result.data.error.message);
          return;
        }
        if (result.data?.data?.resetUrl) {
          setResetLink(result.data.data.resetUrl);
          setResetLinkDialogOpen(true);
        }
      },
      onError: (error) => {
        const message =
          error.error?.serverError ?? "Erro ao gerar link de reset.";
        toast.error(message);
      },
    },
  );

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado para a área de transferência!`);
  };

  const handleGenerateResetLink = (userId: string) => {
    setResetLinkUserId(userId);
    generateResetLink({ userId });
  };

  if (!users.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum usuário cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="h-full border">
            <CardHeader className="space-y-4 border-b pb-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <Badge
                    variant={
                      user.role === "administrator" ? "default" : "secondary"
                    }
                  >
                    {user.role === "administrator"
                      ? "Administrador"
                      : "Profissional"}
                  </Badge>
                </div>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Informações do usuário
              </p>
              <div className="space-y-2">
                {user.cpf && (
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span>CPF</span>
                    <span>{formatCPF(user.cpf)}</span>
                  </div>
                )}
                {user.phoneNumber && (
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span>Telefone</span>
                    <span>{formatPhone(user.phoneNumber)}</span>
                  </div>
                )}
                <div className="text-muted-foreground flex justify-between text-sm">
                  <span>Cadastrado em</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Dialog
                  open={editingId === user.id}
                  onOpenChange={(open) => setEditingId(open ? user.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar usuário
                    </Button>
                  </DialogTrigger>
                  <EditUserForm
                    user={user}
                    onSuccess={() => setEditingId(null)}
                  />
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleGenerateResetLink(user.id)}
                  disabled={resetLinkStatus === "executing"}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Redefinir senha
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para exibir link de reset */}
      <Dialog open={resetLinkDialogOpen} onOpenChange={setResetLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link de Redefinição de Senha</DialogTitle>
            <DialogDescription>
              Link gerado com sucesso. Copie e compartilhe com o usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-md border p-3">
              <p className="text-sm break-all">{resetLink}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetLinkDialogOpen(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={() => handleCopyToClipboard(resetLink, "Link")}
              disabled={!resetLink}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersGrid;
