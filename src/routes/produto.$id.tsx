import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/shop/ProductCard";
import { Stars } from "@/components/shop/Stars";
import { catName, getLoja, getProduto, parcelas } from "@/lib/data";
import { brl, dateBR, maskCEP, onlyDigits } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/produto/$id")({
  loader: ({ params }) => {
    const p = getProduto(params.id);
    if (!p) throw notFound();
    return { titulo: p.titulo, descricao: p.descricao };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.titulo} — mercado.` },
          { name: "description", content: loaderData.descricao.slice(0, 155) },
          { property: "og:title", content: loaderData.titulo },
          { property: "og:description", content: loaderData.descricao.slice(0, 155) },
        ]
      : [{ title: "Produto não encontrado" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => <div className="container-page py-20 text-center">Produto não encontrado.</div>,
  component: Detalhe,
});

function Detalhe() {
  const { id } = Route.useParams();
  const p = getProduto(id)!;
  const loja = getLoja(p.lojaId)!;
  const { user, addToCart, avaliacoes } = useStore();
  const navigate = useNavigate();
  const [foto, setFoto] = useState(0);
  const [qtd, setQtd] = useState(1);
  const [cep, setCep] = useState("");
  const [frete, setFrete] = useState<string | null>(null);
  const esgotado = p.estoque === 0;
  const n = parcelas(p.preco);
  const reviews = avaliacoes.filter((a) => a.produtoId === p.id);
  const recomenda = reviews.length ? Math.round((reviews.filter((r) => r.nota >= 4).length / reviews.length) * 100) : 98;
  const [dep, sub] = p.categorias;

  const requireLogin = () => {
    if (!user) {
      toast("Entre na sua conta para continuar");
      navigate({ to: "/entrar" });
      return false;
    }
    return true;
  };

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex flex-wrap gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> /
        <Link to="/produtos" search={{ cat: dep }} className="hover:text-foreground">{catName(dep)}</Link> /
        <Link to="/produtos" search={{ cat: sub }} className="hover:text-foreground">{catName(sub)}</Link> /
        <span className="line-clamp-1 text-foreground">{p.titulo}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {p.fotos.map((f, i) => (
              <button key={i} onClick={() => setFoto(i)} className={`size-16 overflow-hidden rounded-xl border-2 bg-surface ${foto === i ? "border-brand" : "border-transparent"}`}>
                <img src={f} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-3xl bg-surface">
            <img src={p.fotos[foto]} alt={p.titulo} width={816} height={816} className="aspect-square w-full object-cover" />
            <div className="absolute left-4 top-4 flex gap-1.5">
              {p.freteGratis && <Pill tone="success">Frete grátis</Pill>}
              <Pill tone={p.condicao === "novo" ? "dark" : "warning"}>{p.condicao}</Pill>
              {esgotado && <Pill tone="danger">Esgotado</Pill>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold leading-tight">{p.titulo}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Stars value={p.nota} /> <span className="font-semibold text-foreground">{p.nota.toFixed(1)}</span> · {p.totalAvaliacoes} avaliações de compradores
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            {p.precoOriginal && <div className="text-sm text-muted-foreground line-through">{brl(p.precoOriginal)}</div>}
            <div className="font-display text-4xl font-bold">{brl(p.preco)}</div>
            <div className="mt-1 text-sm text-success">em até {n}x de {brl(p.preco / n)} sem juros no cartão</div>
            <div className="mt-4">
              {esgotado ? <Pill tone="danger">Esgotado</Pill> : <Pill tone="success">Em estoque ({p.estoque} unidades)</Pill>}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center rounded-lg border">
                <button disabled={esgotado || qtd <= 1} onClick={() => setQtd(qtd - 1)} className="grid size-10 place-items-center disabled:opacity-40" aria-label="Diminuir"><Minus className="size-4" /></button>
                <span className="w-10 text-center font-semibold">{qtd}</span>
                <button disabled={esgotado || qtd >= p.estoque} onClick={() => setQtd(qtd + 1)} className="grid size-10 place-items-center disabled:opacity-40" aria-label="Aumentar"><Plus className="size-4" /></button>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              <Button size="lg" variant="brand" disabled={esgotado} onClick={() => requireLogin() && navigate({ to: "/checkout", search: { produto: p.id, qtd } })}>
                Comprar Agora
              </Button>
              <Button size="lg" variant="outline" disabled={esgotado} onClick={() => { if (!requireLogin()) return; addToCart(p.id, qtd); toast.success("Adicionado ao carrinho"); navigate({ to: "/carrinho" }); }}>
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
            <span className="grid size-12 place-items-center rounded-xl bg-primary font-display font-bold text-primary-foreground">{loja.iniciais}</span>
            <div className="flex-1">
              <div className="font-semibold">{loja.nome}</div>
              {loja.verificada && <div className="flex items-center gap-1 text-xs text-success"><BadgeCheck className="size-3.5" /> Loja Parceira Verificada · {loja.nota}</div>}
            </div>
            <Link to="/loja/$id" params={{ id: loja.id }} className="text-sm font-semibold text-brand hover:underline">Ver Loja Oficial ›</Link>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Truck className="size-4" /> Simular frete</div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (onlyDigits(cep).length !== 8) return setFrete("CEP inválido"); setFrete(p.freteGratis ? "GRÁTIS — chega em até 5 dias úteis" : `${brl(29.9)} — chega em até 7 dias úteis`); }}>
              <input value={cep} onChange={(e) => setCep(maskCEP(e.target.value))} placeholder="00000-000" className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm" />
              <Button type="submit" variant="outline">Calcular</Button>
            </form>
            {frete && <p className="mt-2 text-sm text-muted-foreground">{frete}</p>}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" /> Compra garantida: devolução em até 30 dias</p>
          </div>
        </div>
      </div>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold">Descrição do Produto</h2>
          <p className="leading-relaxed text-muted-foreground">{p.descricao}</p>
          <table className="mt-6 w-full overflow-hidden rounded-xl border text-sm">
            <tbody>
              {p.specs.map(([k, v]) => (
                <tr key={k} className="border-b last:border-0 odd:bg-secondary"><td className="p-3 font-semibold">{k}</td><td className="p-3 text-muted-foreground">{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-bold">Avaliações de Clientes ({p.totalAvaliacoes})</h2>
          <div className="mb-6 flex items-center gap-6 rounded-2xl bg-secondary p-5">
            <div className="font-display text-5xl font-bold">{p.nota.toFixed(1)}</div>
            <div><Stars value={p.nota} size={18} /><div className="mt-1 text-sm text-muted-foreground">{recomenda}% recomendam este produto</div></div>
          </div>
          <div className="space-y-4">
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">Ainda não há avaliações escritas para este produto.</p>}
            {reviews.map((r) => (
              <div key={r.id} className="border-b pb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{r.autor}</span>
                  <Pill tone="success">Compra Verificada</Pill>
                  <span className="ml-auto text-xs text-muted-foreground">{dateBR(r.data)}</span>
                </div>
                <Stars value={r.nota} className="mt-1" />
                <p className="mt-2 text-sm text-muted-foreground">{r.comentario}</p>
                {r.fotos.length > 0 && <div className="mt-2 flex gap-2">{r.fotos.map((f, i) => <img key={i} src={f} alt="" className="size-14 rounded-lg object-cover" />)}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
