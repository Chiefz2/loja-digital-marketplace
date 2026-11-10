import { createFileRoute } from "@tanstack/react-router";
import { SideLayout } from "@/components/painel/SideLayout";
import { ProdutoForm } from "@/components/painel/ProdutoForm";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/painel/produto/novo")({
  head: () => seo("Cadastrar Novo Produto", "Cadastre produtos com fotos, categorias e margem de lucro."),
  component: () => <SideLayout perfil="empresa"><ProdutoForm /></SideLayout>,
});
