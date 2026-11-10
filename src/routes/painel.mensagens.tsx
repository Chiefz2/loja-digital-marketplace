import { createFileRoute } from "@tanstack/react-router";
import { SideLayout } from "@/components/painel/SideLayout";
import { ChatView } from "@/components/painel/ChatView";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/painel/mensagens")({
  head: () => seo("Mensagens da Loja", "Converse com seus clientes sobre os pedidos."),
  component: () => <SideLayout perfil="empresa"><ChatView lado="loja" /></SideLayout>,
});
