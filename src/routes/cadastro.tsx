import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/shop/Field";
import { PasswordChecklist } from "@/components/shop/PasswordChecklist";
import { maskCEP, maskCPF, maskPhone, onlyDigits } from "@/lib/format";
import { useStore } from "@/lib/store";
import { isStrongPassword, isValidCPF, isValidEmail } from "@/lib/validators";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta de cliente — mercado." },
      { name: "description", content: "Cadastre-se e compre com frete grátis e compra garantida." },
      { property: "og:title", content: "Criar conta de cliente — mercado." },
      { property: "og:description", content: "Autocadastro de clientes no marketplace." },
    ],
  }),
  component: Cadastro,
});

export async function fetchCEP(cep: string) {
  const r = await fetch(`https://viacep.com.br/ws/${onlyDigits(cep)}/json/`);
  const j = await r.json();
  if (j.erro) throw new Error("CEP não encontrado");
  return { logradouro: j.logradouro as string, bairro: j.bairro as string, cidade: j.localidade as string, uf: j.uf as string };
}

const empty = { nome: "", cpf: "", telefone: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", email: "", senha: "", confirmar: "" };

function Cadastro() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState(empty);
  const [foto, setFoto] = useState<string>();
  const [termos, setTermos] = useState(false);
  const [err, setErr] = useState<Partial<Record<keyof typeof empty | "termos" | "foto", string>>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof empty, v: string) => setF((s) => ({ ...s, [k]: v }));
  const personal = [f.nome, f.email, onlyDigits(f.cpf), onlyDigits(f.telefone)];

  const onCep = async (v: string) => {
    set("cep", maskCEP(v));
    if (onlyDigits(v).length === 8) {
      try {
        const a = await fetchCEP(v);
        setF((s) => ({ ...s, ...a }));
        setErr((e) => ({ ...e, cep: undefined }));
      } catch {
        setErr((e) => ({ ...e, cep: "CEP não encontrado" }));
      }
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof err = {};
    if (f.nome.trim().split(" ").length < 2) er.nome = "Informe nome e sobrenome";
    if (!isValidCPF(f.cpf)) er.cpf = "CPF inválido";
    if (onlyDigits(f.telefone).length !== 11) er.telefone = "Telefone inválido";
    if (onlyDigits(f.cep).length !== 8) er.cep = "CEP inválido";
    for (const k of ["logradouro", "numero", "bairro", "cidade", "uf"] as const) if (!f[k]) er[k] = "Obrigatório";
    if (!isValidEmail(f.email)) er.email = "E-mail inválido";
    else if (f.email === "ana@exemplo.com") er.email = "E-mail já cadastrado";
    if (!isStrongPassword(f.senha, personal)) er.senha = "A senha não atende aos requisitos";
    if (f.senha !== f.confirmar) er.confirmar = "As senhas não coincidem";
    if (!termos) er.termos = "Aceite os termos de uso";
    setErr(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => {
      const { senha, confirmar, ...u } = f;
      login({ ...u, foto });
      toast.success("Conta criada com sucesso!");
      navigate({ to: "/" });
    }, 600);
  };

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold">Criar Minha Conta</h1>
      <p className="mt-1 text-muted-foreground">Cadastro de cliente</p>
      <form onSubmit={submit} className="mt-8 space-y-8 rounded-3xl border bg-card p-6 md:p-8">
        <div className="flex items-center gap-4">
          <label className="relative grid size-20 cursor-pointer place-items-center overflow-hidden rounded-full bg-secondary font-display text-xl font-bold">
            {foto ? <img src={foto} alt="" className="h-full w-full object-cover" /> : f.nome ? f.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() : <Camera className="size-6 text-muted-foreground" />}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) return setErr((s) => ({ ...s, foto: "Imagem acima de 5MB" }));
              setErr((s) => ({ ...s, foto: undefined }));
              setFoto(URL.createObjectURL(file));
            }} />
          </label>
          <div className="text-sm text-muted-foreground">Envie foto (JPG, PNG ou WebP - máx 5MB){err.foto && <div className="text-destructive">{err.foto}</div>}</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field className="md:col-span-2" label="Nome completo" value={f.nome} onChange={(e) => set("nome", e.target.value)} error={err.nome} />
          <Field label="CPF" placeholder="000.000.000-00" value={f.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} error={err.cpf} />
          <Field label="Telefone / WhatsApp" placeholder="(00) 00000-0000" value={f.telefone} onChange={(e) => set("telefone", maskPhone(e.target.value))} error={err.telefone} />
        </div>
        <div className="grid gap-4 md:grid-cols-6">
          <Field className="md:col-span-2" label="CEP" placeholder="00000-000" value={f.cep} onChange={(e) => onCep(e.target.value)} error={err.cep} />
          <Field className="md:col-span-4" label="Rua/Avenida" value={f.logradouro} onChange={(e) => set("logradouro", e.target.value)} error={err.logradouro} />
          <Field className="md:col-span-2" label="Número" value={f.numero} onChange={(e) => set("numero", e.target.value)} error={err.numero} />
          <Field className="md:col-span-4" label="Complemento (opcional)" value={f.complemento} onChange={(e) => set("complemento", e.target.value)} />
          <Field className="md:col-span-3" label="Bairro" value={f.bairro} onChange={(e) => set("bairro", e.target.value)} error={err.bairro} />
          <Field className="md:col-span-2" label="Cidade" value={f.cidade} onChange={(e) => set("cidade", e.target.value)} error={err.cidade} />
          <Field label="UF" maxLength={2} value={f.uf} onChange={(e) => set("uf", e.target.value.toUpperCase())} error={err.uf} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field className="md:col-span-2" label="E-mail" type="email" placeholder="usuario@exemplo.com" value={f.email} onChange={(e) => set("email", e.target.value)} error={err.email} />
          <Field label="Senha" type="password" value={f.senha} onChange={(e) => set("senha", e.target.value)} error={err.senha} />
          <Field label="Confirmar senha" type="password" value={f.confirmar} onChange={(e) => set("confirmar", e.target.value)} error={err.confirmar} />
          <div className="md:col-span-2"><PasswordChecklist pw={f.senha} personal={personal} /></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={termos} onCheckedChange={(v) => setTermos(!!v)} /> Aceitar os termos de uso {err.termos && <span className="text-destructive">— {err.termos}</span>}</label>
        <Button type="submit" size="lg" variant="brand" className="w-full" disabled={loading}>{loading ? "Criando conta…" : "Criar Minha Conta"}</Button>
        <p className="text-center text-sm">Já possui uma conta? <Link to="/entrar" className="font-semibold text-brand">Fazer Login</Link></p>
      </form>
    </div>
  );
}
