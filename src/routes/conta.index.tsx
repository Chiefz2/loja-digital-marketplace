import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { Field } from "@/components/shop/Field";
import { PasswordChecklist } from "@/components/shop/PasswordChecklist";
import { fetchCEP } from "./cadastro";
import { maskCEP, maskPhone, onlyDigits } from "@/lib/format";
import { useStore, type Usuario } from "@/lib/store";
import { isStrongPassword } from "@/lib/validators";

export const Route = createFileRoute("/conta/")({
  head: () => ({
    meta: [
      { title: "Meu perfil — mercado." },
      { name: "description", content: "Gerencie seus dados pessoais e endereço." },
      { property: "og:title", content: "Meu perfil — mercado." },
      { property: "og:description", content: "Área do cliente." },
    ],
  }),
  component: () => <AccountLayout><Perfil /></AccountLayout>,
});

function Perfil() {
  const { user, updateUser } = useStore();
  const [f, setF] = useState<Usuario>(user!);
  const [err, setErr] = useState<Partial<Record<keyof Usuario, string>>>({});
  const [pwOpen, setPwOpen] = useState(false);
  useEffect(() => { if (user) setF(user); }, [user]);
  const set = (k: keyof Usuario, v: string) => setF((s) => ({ ...s, [k]: v }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof err = {};
    if (f.nome.trim().length < 3) er.nome = "Informe seu nome";
    if (onlyDigits(f.telefone).length !== 11) er.telefone = "Telefone inválido";
    if (onlyDigits(f.cep).length !== 8) er.cep = "CEP inválido";
    for (const k of ["logradouro", "numero", "bairro", "cidade", "uf"] as const) if (!f[k]) er[k] = "Obrigatório";
    setErr(er);
    if (Object.keys(er).length) return;
    updateUser(f);
    toast.success("Dados salvos com sucesso");
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <h1 className="text-2xl font-bold">Dados do Perfil</h1>
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <span className="grid size-16 place-items-center overflow-hidden rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
          {f.foto ? <img src={f.foto} alt="" className="h-full w-full object-cover" /> : f.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </span>
        <div>
          <label className="cursor-pointer text-sm font-semibold text-brand">
            Trocar Foto
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) return toast.error("Imagem acima de 5MB");
              set("foto", URL.createObjectURL(file));
            }} />
          </label>
          <div className="text-xs text-muted-foreground">JPG, PNG ou WebP - máx 5MB</div>
        </div>
      </div>
      <div className="grid gap-4 rounded-2xl border bg-card p-5 md:grid-cols-2">
        <Field className="md:col-span-2" label="Nome completo" value={f.nome} onChange={(e) => set("nome", e.target.value)} error={err.nome} />
        <Field label="CPF" value={f.cpf} locked />
        <Field label="E-mail de Cadastro" value={f.email} locked />
        <Field label="Telefone / WhatsApp" value={f.telefone} onChange={(e) => set("telefone", maskPhone(e.target.value))} error={err.telefone} />
        <Field label="CEP" value={f.cep} error={err.cep} onChange={async (e) => {
          const v = maskCEP(e.target.value); set("cep", v);
          if (onlyDigits(v).length === 8) { try { const a = await fetchCEP(v); setF((s) => ({ ...s, ...a })); } catch { setErr((x) => ({ ...x, cep: "CEP não encontrado" })); } }
        }} />
        <Field className="md:col-span-2" label="Rua/Avenida" value={f.logradouro} onChange={(e) => set("logradouro", e.target.value)} error={err.logradouro} />
        <Field label="Número" value={f.numero} onChange={(e) => set("numero", e.target.value)} error={err.numero} />
        <Field label="Complemento" value={f.complemento} onChange={(e) => set("complemento", e.target.value)} />
        <Field label="Bairro" value={f.bairro} onChange={(e) => set("bairro", e.target.value)} error={err.bairro} />
        <Field label="Cidade" value={f.cidade} onChange={(e) => set("cidade", e.target.value)} error={err.cidade} />
        <Field label="UF" maxLength={2} value={f.uf} onChange={(e) => set("uf", e.target.value.toUpperCase())} error={err.uf} />
      </div>
      <Button type="submit" size="lg">Salvar Alterações</Button>
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="font-bold">Segurança da Conta</h2>
        <Button type="button" variant="outline" className="mt-3" onClick={() => setPwOpen(true)}><KeyRound /> Alterar Senha</Button>
      </div>
      <ChangePassword open={pwOpen} onClose={() => setPwOpen(false)} personal={[f.nome, f.email, onlyDigits(f.cpf)]} />
    </form>
  );
}

function ChangePassword({ open, onClose, personal }: { open: boolean; onClose: () => void; personal: string[] }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [err, setErr] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Alterar Senha</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Senha atual" type="password" value={a} onChange={(e) => setA(e.target.value)} />
          <Field label="Nova senha" type="password" value={b} onChange={(e) => setB(e.target.value)} />
          <Field label="Confirmar nova senha" type="password" value={c} onChange={(e) => setC(e.target.value)} />
          <PasswordChecklist pw={b} personal={personal} />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button className="w-full" onClick={() => {
            if (!a) return setErr("Informe a senha atual");
            if (!isStrongPassword(b, personal)) return setErr("A nova senha não atende aos requisitos");
            if (b !== c) return setErr("As senhas não coincidem");
            toast.success("Senha alterada"); setA(""); setB(""); setC(""); setErr(""); onClose();
          }}>Salvar nova senha</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
