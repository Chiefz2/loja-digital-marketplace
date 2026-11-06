import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shop/Field";
import { useStore } from "@/lib/store";

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
  const navigate = useNavigate();
  const [email, setEmail] = useState("ana@exemplo.com");
  const [senha, setSenha] = useState("Demo2026x");
  const [show, setShow] = useState(false);
  const [erro, setErro] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || senha.length < 8) return setErro("E-mail ou senha inválidos");
    if (email.startsWith("suspenso")) return setErro("Conta suspensa. Entre em contato com o suporte.");
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
        <p className="text-center text-xs text-muted-foreground">Demonstração: os dados acima já entram como cliente.</p>
      </form>
    </div>
  );
}
