import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/shop/ProductCard";
import { getLoja, getProduto, parcelas } from "@/lib/data";
import { brl } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Meu Carrinho — mercado." },
      { name: "description", content: "Revise os itens do seu carrinho antes de finalizar a compra." },
      { property: "og:title", content: "Meu Carrinho — mercado." },
      { property: "og:description", content: "Carrinho de compras do marketplace." },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const { cart, setQty, removeFromCart } = useStore();
  const navigate = useNavigate();
  const itens = cart.map((i) => ({ ...i, p: getProduto(i.produtoId)! })).filter((i) => i.p);
  const qtd = itens.reduce((a, i) => a + i.quantidade, 0);
  const subtotal = itens.reduce((a, i) => a + i.p.preco * i.quantidade, 0);
  const frete = itens.every((i) => i.p.freteGratis) ? 0 : 29.9;
  const overStock = itens.some((i) => i.quantidade > i.p.estoque);
  const n = parcelas(subtotal);

  if (itens.length === 0)
    return (
      <div className="container-page grid place-items-center py-24 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Seu carrinho está vazio</h1>
        <Button asChild className="mt-6"><Link to="/produtos">Explorar produtos</Link></Button>
      </div>
    );

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Meu Carrinho de Compras <span className="text-base font-normal text-muted-foreground">({qtd} itens)</span></h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {itens.map(({ p, quantidade }) => (
            <div key={p.id} className="flex gap-4 rounded-2xl border bg-card p-4">
              <img src={p.fotos[0]} alt="" className="size-24 rounded-xl bg-surface object-cover" />
              <div className="flex flex-1 flex-col gap-1">
                <Link to="/produto/$id" params={{ id: p.id }} className="font-semibold hover:text-brand">{p.titulo}</Link>
                <span className="text-xs text-muted-foreground">Vendido e entregue por: {getLoja(p.lojaId)?.nome}</span>
                {quantidade > p.estoque ? <Pill tone="danger">Apenas {p.estoque} em estoque</Pill> : <span><Pill tone="success">Em estoque</Pill></span>}
                <div className="mt-auto flex items-center gap-4 pt-2">
                  <div className="flex items-center rounded-lg border">
                    <button onClick={() => setQty(p.id, quantidade - 1)} disabled={quantidade <= 1} className="grid size-8 place-items-center disabled:opacity-40" aria-label="Diminuir"><Minus className="size-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{quantidade}</span>
                    <button onClick={() => setQty(p.id, quantidade + 1)} disabled={quantidade >= p.estoque} className="grid size-8 place-items-center disabled:opacity-40" aria-label="Aumentar"><Plus className="size-3.5" /></button>
                  </div>
                  <button onClick={() => removeFromCart(p.id)} className="text-sm font-semibold text-destructive hover:underline">Remover</button>
                </div>
              </div>
              <div className="font-display text-lg font-bold">{brl(p.preco * quantidade)}</div>
            </div>
          ))}
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-bold">Resumo do Pedido</h2>
          <div className="flex justify-between text-sm"><span>Subtotal ({qtd} itens)</span><span>{brl(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Frete</span>{frete === 0 ? <Pill tone="success">Grátis</Pill> : <span>{brl(frete)}</span>}</div>
          <div className="border-t pt-4">
            <div className="flex justify-between"><span className="font-semibold">Total</span><span className="font-display text-2xl font-bold">{brl(subtotal + frete)}</span></div>
            <div className="text-right text-xs text-success">em até {n}x de {brl((subtotal + frete) / n)} sem juros</div>
          </div>
          {overStock && <p className="text-sm text-destructive">Ajuste as quantidades acima do estoque para continuar.</p>}
          <Button size="lg" variant="brand" className="w-full" disabled={overStock} onClick={() => navigate({ to: "/checkout" })}>Fechar Pedido (Checkout) →</Button>
          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">‹ Continuar Comprando</Link>
        </aside>
      </div>
    </div>
  );
}
