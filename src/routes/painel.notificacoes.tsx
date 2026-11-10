import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/shop/ProductCard";
import { PageTitle, SideLayout } from "@/components/painel/SideLayout";
import { dateTimeBR } from "@/lib/format";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/painel/notificacoes")({
  head: () => seo("Central de Notificações do Lojista", "Avisos da plataforma separados por criticidade."),
  component: () => <SideLayout perfil="empresa"><Notificacoes /></SideLayout>,
});

const tag = { critico: ["Evento crítico", "danger"], moderacao: ["Moderação admin", "danger"], pedido: ["Novo pedido", "success"] } as const;

function Notificacoes() {
  const { notificacoes } = usePainel();
  return (
    <>
      <PageTitle title="Central de Notificações do Lojista" sub="Eventos críticos são sinalizados e enviados adicionalmente por e-mail." />
      {notificacoes.length === 0 ? (
        <p className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">Nenhuma notificação recente</p>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((n) => (
            <article key={n.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 ${n.tipo !== "pedido" ? "border-l-4 border-l-destructive" : "border-l-4 border-l-success"}`}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><Pill tone={tag[n.tipo][1]}>{tag[n.tipo][0]}</Pill><span className="text-xs text-muted-foreground">{dateTimeBR(n.data)}</span></div>
                <h2 className="mt-2 font-bold">{n.titulo}</h2>
                <p className="text-sm text-muted-foreground">{n.texto}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  {n.email ? <><Mail className="size-3.5" /> Enviado também para o e-mail cadastrado</> : "Notificação interna da plataforma"}
                </p>
              </div>
              <Button asChild>
                {n.link === "mensagens" ? <Link to="/painel/mensagens">Ver Caso ›</Link> : <Link to="/painel/pedidos">Ver Caso ›</Link>}
              </Button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
