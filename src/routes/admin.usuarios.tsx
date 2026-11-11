import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pill } from "@/components/shop/ProductCard";
import { inputCls, PageTitle, SideLayout } from "@/components/painel/SideLayout";
import { dateBR } from "@/lib/format";
import { usePainel, type Usuario } from "@/lib/painel";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => seo("Gerenciamento de Usuários", "Edite, suspenda, reative ou remova contas."),
  component: () => <SideLayout perfil="admin"><Usuarios /></SideLayout>,
});

const abas = ["Todos", "Clientes", "Empresas", "Suspensos"] as const;

function Usuarios() {
  const { usuarios, setUsuarioStatus, editarUsuario } = usePainel();
  const [q, setQ] = useState("");
  const [aba, setAba] = useState<(typeof abas)[number]>("Todos");
  const [confirm, setConfirm] = useState<{ u: Usuario; acao: "suspenso" | "removido" } | null>(null);
  const [edit, setEdit] = useState<Usuario | null>(null);
  const lista = usuarios
    .filter((u) => u.status !== "removido")
    .filter((u) => aba === "Todos" || (aba === "Clientes" && u.tipo === "cliente") || (aba === "Empresas" && u.tipo === "empresa") || (aba === "Suspensos" && u.status === "suspenso"))
    .filter((u) => `${u.nome} ${u.email} ${u.documento}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Gerenciamento de Usuários" sub="Acesso irrestrito para gerenciar, editar dados cadastrais, suspender ou remover contas." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF/CNPJ..." className="h-10 w-full rounded-full border bg-card pl-10 pr-4 text-sm outline-none focus:border-brand" /></div>
        <div className="flex rounded-full border bg-card p-1">{abas.map((a) => <button key={a} onClick={() => setAba(a)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${aba === a ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{a}</button>)}</div>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Usuário</th><th>Tipo de perfil</th><th>Data cadastro</th><th>Status</th><th className="pr-4 text-right">Ações do administrador</th></tr></thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>}
            {lista.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3"><div className="font-semibold">{u.tipo === "empresa" ? <Link to="/admin/lojas" className="hover:underline">{u.nome}</Link> : u.nome}</div><div className="text-xs text-muted-foreground">{u.email} · {u.documento}</div></td>
                <td><Pill tone={u.tipo === "empresa" ? "brand" : "dark"}>{u.tipo}</Pill></td>
                <td>{dateBR(u.cadastro)}</td>
                <td><Pill tone={u.status === "ativo" ? "success" : "danger"}>{u.status}</Pill></td>
                <td className="space-x-3 pr-4 text-right font-semibold">
                  <button onClick={() => setEdit(u)}>Editar</button>
                  {u.status === "suspenso" ? <button className="text-success" onClick={() => { setUsuarioStatus(u.id, "ativo"); toast.success("Conta reativada"); }}>Reativar</button>
                    : <button className="text-warning" onClick={() => setConfirm({ u, acao: "suspenso" })}>Suspender</button>}
                  <button className="text-destructive" onClick={() => setConfirm({ u, acao: "removido" })}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.acao === "suspenso" ? "Suspender conta?" : "Remover conta?"}</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.acao === "suspenso" ? `${confirm?.u.nome} não conseguirá entrar até ser reativado.` : `A conta de ${confirm?.u.nome} será removida. O histórico de pedidos é preservado.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirm) { setUsuarioStatus(confirm.u.id, confirm.acao); toast.success(confirm.acao === "suspenso" ? "Conta suspensa" : "Conta removida"); } }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar dados cadastrais</DialogTitle></DialogHeader>
          {edit && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); editarUsuario(edit.id, edit); toast.success("Dados atualizados"); setEdit(null); }}>
              <label className="block text-sm"><span className="mb-1 block font-semibold">Nome</span><input className={inputCls} value={edit.nome} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} /></label>
              <label className="block text-sm"><span className="mb-1 block font-semibold">E-mail</span><input className={inputCls} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></label>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
