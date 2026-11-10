import { createFileRoute } from "@tanstack/react-router";
import { SideLayout } from "@/components/painel/SideLayout";
import { ProdutoForm } from "@/components/painel/ProdutoForm";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/painel/produto/$id")({
  head: () => seo("Editar Produto", "Edite os dados de um produto do seu catálogo."),
  component: () => <SideLayout perfil="empresa"><Editar /></SideLayout>,
});

function Editar() {
  const { id } = Route.useParams();
  const { produtos } = usePainel();
  const p = produtos.find((x) => x.id === id);
  if (!p) return <p className="text-muted-foreground">Produto não encontrado.</p>;
  return <ProdutoForm key={p.id} inicial={p} />;
}
