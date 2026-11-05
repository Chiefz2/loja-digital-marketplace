import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shop/Field";
import { PasswordChecklist } from "@/components/shop/PasswordChecklist";
import { isStrongPassword, isValidEmail } from "@/lib/validators";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — mercado." },
      { name: "description", content: "Redefina sua senha em duas etapas seguras." },
      { property: "og:title", content: "Recuperar senha — mercado." },
      { property: "og:description", content: "Recuperação de senha com token por e-mail." },
    ],
  }),
  component: Recuperar,
});

function Recuperar() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [erro, setErro] = useState("");

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md space-y-5 rounded-3xl border bg-card p-8 shadow-soft">
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">ETAPA {step}</span>
        {step === 1 ? (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (!isValidEmail(email)) return setErro("Informe um e-mail válido"); setErro(""); toast("Se o e-mail existir, um código foi enviado"); setStep(2); }}>
            <div><h1 className="text-2xl font-bold">Recuperar Senha</h1><p className="text-sm text-muted-foreground">Informe seu e-mail para enviarmos um token.</p></div>
            <Field label="E-mail cadastrado" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={erro} />
            <Button type="submit" className="w-full" size="lg">Enviar Código de Acesso</Button>
            <p className="text-center text-sm">Lembrou a senha? <Link to="/entrar" className="font-semibold text-brand">Voltar ao Login</Link></p>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            if (!/^\d{6}$/.test(token)) return setErro("Token expirado ou inválido");
            if (!isStrongPassword(pw, [email])) return setErro("A senha não atende aos requisitos");
            if (pw !== pw2) return setErro("As senhas não coincidem");
            toast.success("Senha redefinida! Faça login.");
            navigate({ to: "/entrar" });
          }}>
            <div><h1 className="text-2xl font-bold">Criar Nova Senha</h1><p className="text-sm text-muted-foreground">Insira o token recebido por e-mail e sua nova senha.</p></div>
            <Field label="Código / Token de Validação" inputMode="numeric" maxLength={6} placeholder="000000" value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))} />
            <Field label="Nova senha" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Field label="Confirmar nova senha" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <PasswordChecklist pw={pw} personal={[email]} />
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <Button type="submit" className="w-full" size="lg">Redefinir Senha e Entrar</Button>
          </form>
        )}
      </div>
    </div>
  );
}
