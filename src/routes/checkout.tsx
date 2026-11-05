import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pill } from "@/components/shop/ProductCard";
import { useRequireUser } from "@/components/shop/AccountLayout";
import { getProduto } from "@/lib/data";
import { brl } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  validateSearch: (s) => z.object({ produto: z.string().optional(), qtd: z.number().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Checkout — mercado." },
      { name: "description", content: "Finalize seu pedido com cartão, PIX ou boleto." },
      { property: "og:title", content: "Checkout — mercado." },
      { property: "og:description", content: "Fechamento de pedido." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const user = useRequireUser();
  const s = Route.useSearch();
  const { cart, cartoes, placeOrder } = useStore();
  const navigate = useNavigate();
  const [pag, setPag] = useState<"cartao" | "pix" | "boleto">("cartao");
  const [cartaoId, setCartaoId] = useState<string | undefined>();
  const [trocar, setTrocar] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  const fonte = s.produto ? [{ produtoId: s.produto, quantidade: s.qtd ?? 1 }] : cart;
  const itens = fonte.map((i) => ({ ...i, p: getProduto(i.produtoId)! })).filter((i) => i.p);
  const subtotal = itens.reduce((a, i) => a + i.p.preco * i.quantidade, 0);
  const frete = itens.every((i) => i.p.freteGratis) ? 0 : 29.9;
  const cartao = cartoes.find((c) => c.id === cartaoId) ?? cartoes[0];

  if (!user) return null;
  if (itens.length === 0)
    return <div className="container-page py-24 text-center"><p>Nenhum item para finalizar.</p><Button asChild className="mt-4"><Link to="/produtos">Ver produtos</Link></Button></div>;

  const endereco = `${user.logradouro}, ${user.numero}${user.complemento ? " — " + user.complemento : ""}, ${user.bairro}, ${user.cidade}/${user.uf}`;

  const finalizar = () => {
    if (lock.current) return; // RNF13 — trava de duplo clique
    if (pag === "cartao" && !cartao) return;
    lock.current = true;
    setBusy(true);
    setTimeout(() => {
      const id = placeOrder({ itens: fonte, pagamento: pag, cartaoFinal: pag === "cartao" ? cartao?.final : undefined, endereco, fromCart: !s.produto });
      navigate({ to: "/pedido-confirmado/$id", params: { id } });
    }, 1200);
  };

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <section className="rounded-2xl border bg-card p-6">
            <div className="flex justify-between"><h2 className="font-bold">1. Endereço de Entrega</h2><Link to="/conta" className="text-sm font-semibold text-brand">Alterar</Link></div>
            <p className="mt-3 font-semibold">{user.nome} · {user.telefone}</p>
            <p className="text-sm text-muted-foreground">{endereco} · CEP {user.cep}</p>
          </section>
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 font-bold">2. Forma de Pagamento</h2>
            <RadioGroup value={pag} onValueChange={(v) => setPag(v as typeof pag)} className="space-y-2">
              <label className={`flex gap-3 rounded-xl border p-4 ${pag === "cartao" ? "border-brand bg-brand-soft/40" : ""}`}>
                <RadioGroupItem value="cartao" className="mt-1" />
                <div className="flex-1">
                  {cartao ? (
                    <>
                      <div className="font-semibold">Cartão de Crédito Salvo ({cartao.bandeira} final {cartao.final})</div>
                      <div className="text-sm text-muted-foreground">{cartao.titular} · validade {cartao.mes}/{cartao.ano}</div>
                      <button type="button" onClick={() => setTrocar(!trocar)} className="mt-1 text-sm font-semibold text-brand">Trocar Cartão</button>
                      {trocar && (
                        <div className="mt-2 space-y-1">
                          {cartoes.map((c) => (
                            <button key={c.id} type="button" onClick={() => { setCartaoId(c.id); setTrocar(false); }} className="block w-full rounded-lg border bg-card px-3 py-2 text-left text-sm hover:border-brand">
                              {c.apelido} — {c.bandeira} •••• {c.final}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm">Nenhum cartão salvo. <Link to="/conta/cartoes" className="font-semibold text-brand">Cadastrar cartão</Link></div>
                  )}
                </div>
              </label>
              <label className={`flex gap-3 rounded-xl border p-4 ${pag === "pix" ? "border-brand bg-brand-soft/40" : ""}`}>
                <RadioGroupItem value="pix" className="mt-1" />
                <div><div className="font-semibold">PIX (Aprovação Imediata)</div><div className="text-sm text-muted-foreground">Liberação instantânea do pedido e nota fiscal</div></div>
              </label>
              <label className={`flex gap-3 rounded-xl border p-4 ${pag === "boleto" ? "border-brand bg-brand-soft/40" : ""}`}>
                <RadioGroupItem value="boleto" className="mt-1" />
                <div><div className="font-semibold">Boleto Bancário</div><div className="text-sm text-muted-foreground">Vencimento em 3 dias úteis</div></div>
              </label>
            </RadioGroup>
          </section>
        </div>
        <aside className="h-fit space-y-3 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-bold">Total da Compra</h2>
          {itens.map((i) => (
            <div key={i.produtoId} className="flex justify-between gap-3 text-sm"><span className="line-clamp-1">{i.quantidade}× {i.p.titulo}</span><span className="shrink-0">{brl(i.p.preco * i.quantidade)}</span></div>
          ))}
          <div className="flex justify-between border-t pt-3 text-sm"><span>Frete</span>{frete === 0 ? <Pill tone="success">Grátis</Pill> : brl(frete)}</div>
          <div className="flex justify-between"><span className="font-semibold">Total a Pagar</span><span className="font-display text-2xl font-bold">{brl(subtotal + frete)}</span></div>
          <Button size="lg" variant="brand" className="w-full" disabled={busy || (pag === "cartao" && !cartao)} onClick={finalizar}>
            {busy ? "Processando transação…" : "Finalizar e Pagar Pedido"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">Ao clicar, o estoque é reservado e a transação é processada</p>
          <Link to="/carrinho" className="block text-center text-sm text-muted-foreground hover:text-foreground">‹ Voltar ao carrinho</Link>
        </aside>
      </div>
    </div>
  );
}
