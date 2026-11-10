import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shop/Field";
import { useStore } from "@/lib/store";
import { usePainel } from "@/lib/painel";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Acesse sua conta — mercado." },
      { name: "description", content: "Entre como cliente, lojista ou administrador." },
      { property: "og:title", content: "Acesse sua conta — mercado." },
      { property: "og:description", content: "Login unificado do marketplace." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const { login } = useStore();
  const { entrar, usuarios } = usePainel();
  const navigate = useNavigate();
  const [email, setEmail] = useState("ana@exemplo.com");
  const [senha, setSenha] = useState("Demo2026x");
  const [show, setShow] = useState(false);
  const [erro, setErro] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || senha.length < 8) return setErro("E-mail ou senha inválidos");
    const conta = usuarios.find((u) => u.email === email);
    if (email.startsWith("suspenso") || conta?.status === "suspenso" || conta?.status === "removido") return setErro("Conta suspensa. Entre em contato com o suporte.");
    if (email === "admin@exemplo.com") { entrar("admin"); toast.success("Bem-vindo, administrador!"); return navigate({ to: "/admin" }); }
    if (email === "loja@exemplo.com" || conta?.tipo === "empresa") { entrar("empresa"); toast.success("Bem-vindo ao Painel Lojista!"); return navigate({ to: "/painel" }); }
    login(email === "ana@exemplo.com" ? {} : { email, nome: email.split("@")[0] ?? email });
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  };

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border bg-card p-8 shadow-soft">
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><UserRound /></span>
          <h1 className="mt-4 text-2xl font-bold">Acesse sua conta</h1>
          <p className="text-sm text-muted-foreground">Clientes, Lojistas e Administradores</p>
        </div>
        <Field label="E-mail" type="email" placeholder="usuario@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="relative">
          <Field label="Senha" type={show ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} />
          <button type="button" onClick={() => setShow(!show)} className="absolute bottom-3 right-3 text-muted-foreground" aria-label="Mostrar senha">
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <div className="text-right"><Link to="/recuperar-senha" className="text-sm font-semibold text-brand hover:underline">Esqueceu a senha?</Link></div>
        {erro && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{erro}</p>}
        <Button type="submit" size="lg" className="w-full">Entrar</Button>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> ou cadastre-se <span className="h-px flex-1 bg-border" /></div>
        <Button asChild variant="outline" className="w-full"><Link to="/cadastro">Criar conta como Cliente</Link></Button>
        <Button asChild variant="outline" className="w-full"><Link to="/cadastro-empresa">Quero vender (Conta Empresa)</Link></Button>
        <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">Contas de demonstração (senha Demo2026x):</p>
          <div className="flex flex-wrap gap-2">
            {[["Cliente", "ana@exemplo.com"], ["Lojista", "loja@exemplo.com"], ["Admin", "admin@exemplo.com"]].map(([l, e]) => (
              <button key={e} type="button" onClick={() => { setEmail(e!); setSenha("Demo2026x"); }} className="rounded-full border bg-card px-3 py-1 font-semibold text-foreground hover:border-brand">{l}</button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
