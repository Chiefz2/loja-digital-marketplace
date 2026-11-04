import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, Dumbbell, Eye, LayoutGrid, Shirt, ShieldCheck, Smartphone, Sofa, Sparkles, Tag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shop/ProductCard";
import { produtos } from "@/lib/data";
import geladeira from "@/assets/p-geladeira.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "mercado. — Tudo que você precisa em um só lugar" },
      { name: "description", content: "Encontre produtos, ofertas e lojas parceiras verificadas. Frete grátis, compra garantida e até 12x sem juros." },
      { property: "og:title", content: "mercado. — Tudo que você precisa em um só lugar" },
      { property: "og:description", content: "Marketplace com lojas parceiras verificadas, frete grátis e compra garantida." },
    ],
  }),
  component: Index,
});

const circles = [
  { label: "Ofertas", icon: Tag, search: { ordem: "ofertas" as const } },
  { label: "Eletrônicos", icon: Smartphone, search: { cat: "smartphones" } },
  { label: "Moda", icon: Shirt, search: { cat: "moda" } },
  { label: "Casa", icon: Sofa, search: { cat: "casa" } },
  { label: "Beleza", icon: Sparkles, search: { cat: "beleza" } },
  { label: "Esportes", icon: Dumbbell, search: { cat: "esportes" } },
];

const beneficios = [
  { icon: Truck, t: "Frete grátis", d: "Em milhares de produtos" },
  { icon: ShieldCheck, t: "Compra Garantida", d: "Seu dinheiro de volta em até 30 dias" },
  { icon: CreditCard, t: "Até 12x sem juros", d: "Nos cartões de crédito" },
  { icon: Eye, t: "Transparência", d: "Nota fiscal em todos os pedidos" },
];

function Index() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);
  const ofertas = [...produtos].filter((p) => p.precoOriginal).sort((a, b) => b.precoOriginal! / b.preco - a.precoOriginal! / a.preco);
  const doDia = ofertas.slice(0, 4);
  const outras = ofertas.slice(4, 12);

  return (
    <div className="container-page space-y-16 py-8">
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-hero p-8 text-primary-foreground md:p-14">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-brand/30 blur-3xl" />
          <p className="relative mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand">Marketplace</p>
          <h1 className="relative max-w-lg text-4xl font-bold leading-tight md:text-5xl">Tudo que você precisa em um só lugar.</h1>
          <p className="relative mt-4 max-w-md text-primary-foreground/70">
            Encontre produtos, ofertas e tudo o que precisa para o seu dia a dia.
          </p>
          <Button asChild variant="hero" size="lg" className="relative mt-8">
            <Link to="/produtos">Explorar produtos <ArrowRight /></Link>
          </Button>
        </div>
        <Link to="/produtos" search={{ cat: "geladeiras" }} className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-surface p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Até 30% OFF</p>
            <h2 className="mt-2 text-2xl font-bold">Geladeiras Modernas</h2>
            <p className="mt-1 text-sm text-muted-foreground">Compre com até 30% OFF</p>
          </div>
          <img src={geladeira} alt="Geladeira inox" width={816} height={816} className="mx-auto mt-4 h-52 object-contain mix-blend-multiply transition duration-500 group-hover:scale-105" />
        </Link>
      </section>

      <section className="flex gap-6 overflow-x-auto pb-2 md:justify-between">
        {circles.map((c) => (
          <Link key={c.label} to="/produtos" search={c.search} className="group flex shrink-0 flex-col items-center gap-2">
            <span className="grid size-20 place-items-center rounded-full border bg-card transition group-hover:border-brand group-hover:bg-brand-soft">
              <c.icon className="size-7 text-foreground group-hover:text-brand" />
            </span>
            <span className="text-sm font-semibold">{c.label}</span>
          </Link>
        ))}
        <Link to="/departamentos" className="group flex shrink-0 flex-col items-center gap-2">
          <span className="grid size-20 place-items-center rounded-full border bg-card transition group-hover:border-brand group-hover:bg-brand-soft">
            <LayoutGrid className="size-7" />
          </span>
          <span className="text-sm font-semibold">Mais</span>
        </Link>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-bold">Compre com benefícios</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {beneficios.map((b) => (
            <div key={b.t} className="flex items-start gap-3 rounded-2xl border bg-card p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><b.icon className="size-5" /></span>
              <div>
                <div className="font-semibold">{b.t}</div>
                <div className="text-xs text-muted-foreground">{b.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Vitrine titulo="Oferta do dia" itens={doDia} loading={loading} />
      <Vitrine titulo="Outras ofertas" itens={outras} loading={loading} />
    </div>
  );
}

function Vitrine({ titulo, itens, loading }: { titulo: string; itens: typeof produtos; loading: boolean }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-bold">{titulo}</h2>
        <Link to="/produtos" search={{ ordem: "ofertas" }} className="text-sm font-semibold text-brand hover:underline">Ver todas</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/5] rounded-2xl" />)
          : itens.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
