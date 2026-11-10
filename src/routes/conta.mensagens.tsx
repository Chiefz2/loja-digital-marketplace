import { createFileRoute } from "@tanstack/react-router";
import { AccountLayout } from "@/components/shop/AccountLayout";
import { ChatView } from "@/components/painel/ChatView";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/conta/mensagens")({
  validateSearch: (s: Record<string, unknown>): { pedido?: string } => (typeof s.pedido === "string" ? { pedido: s.pedido } : {}),
  head: () => seo("Mensagens", "Fale diretamente com as lojas sobre seus pedidos."),
  component: Mensagens,
});

function Mensagens() {
  const { pedido } = Route.useSearch();
  return <AccountLayout><ChatView lado="cliente" pedidoInicial={pedido} /></AccountLayout>;
}
