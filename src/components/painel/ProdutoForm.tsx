import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inputCls, textareaCls } from "@/components/painel/SideLayout";
import { brl } from "@/lib/format";
import { usePainel, type ProdutoLoja } from "@/lib/painel";
import { margem } from "@/lib/validators";

const MAX_FOTO = 5 * 1024 * 1024;

export function ProdutoForm({ inicial }: { inicial?: ProdutoLoja | undefined }) {
  const { salvarProduto, categorias } = usePainel();
  const navigate = useNavigate();
  const [fotos, setFotos] = useState<string[]>(inicial?.fotos ?? []);
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [cats, setCats] = useState<string[]>(inicial?.categorias ?? []);
  const [addCat, setAddCat] = useState(false);
  const [preco, setPreco] = useState(inicial ? String(inicial.preco) : "");
  const [custo, setCusto] = useState(inicial ? String(inicial.custo) : "");
  const [estoque, setEstoque] = useState(inicial ? String(inicial.estoque) : "1");
  const [condicao, setCondicao] = useState<"novo" | "usado">(inicial?.condicao ?? "novo");
  const [frete, setFrete] = useState(inicial?.freteGratis ?? false);
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [erros, setErros] = useState<string[]>([]);

  const pv = Number(preco) || 0;
  const cu = Number(custo) || 0;
  const m = margem(pv, cu);

  const addFoto = (f: File | undefined) => {
    if (!f) return;
    if (!["image/webp", "image/jpeg", "image/png"].includes(f.type)) return toast.error("Envie uma imagem (WebP, JPG ou PNG).");
    if (f.size > MAX_FOTO) return toast.error("A foto deve ter no máximo 5 MB.");
    const r = new FileReader();
    r.onload = () => setFotos((x) => [...x, String(r.result)].slice(0, 6));
    r.readAsDataURL(f);
  };

  const salvar = (status: "publicado" | "rascunho") => {
    const e: string[] = [];
    if (!titulo.trim()) e.push("Informe o título do produto.");
    if (status === "publicado") {
      if (fotos.length === 0) e.push("Adicione ao menos uma foto para publicar.");
      if (cats.length === 0) e.push("Selecione ao menos uma categoria.");
      if (pv <= 0) e.push("Informe o preço de venda.");
    }
    setErros(e);
    if (e.length) return;
    salvarProduto({
      id: inicial?.id, titulo: titulo.trim(), categorias: cats, preco: pv, custo: cu, estoque: Math.max(0, Number(estoque) || 0),
      condicao, freteGratis: frete, descricao, fotos, status: inicial?.status === "inativo" ? "inativo" : status,
    });
    toast.success(status === "publicado" ? "Produto publicado no catálogo" : "Rascunho salvo");
    navigate({ to: "/painel/estoque" });
  };

  return (
    <div className="space-y-6">
      <Link to="/painel/estoque" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Voltar</Link>
      <h1 className="text-2xl font-bold">{inicial ? "Editar Produto" : "Cadastrar Novo Produto"}</h1>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 font-semibold">Fotos do Produto <span className="text-xs font-normal text-muted-foreground">(até 6, máx. 5 MB cada)</span></h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => {
            const f = fotos[i];
            return f ? (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl border">
                <img src={f} alt="" className="size-full object-cover" />
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">Foto 1 (Principal)</span>}
                <button type="button" onClick={() => setFotos(fotos.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90" aria-label="Remover foto"><X className="size-3.5" /></button>
              </div>
            ) : (
              <label key={i} className={`grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed text-center text-[11px] text-muted-foreground hover:border-brand ${i === 0 ? "border-brand/60" : ""}`}>
                <span className="flex flex-col items-center gap-1"><ImagePlus className="size-5" />{i === 0 ? "Foto 1 (Principal)" : `Foto ${i + 1}`}</span>
                <input type="file" accept="image/webp,image/jpeg,image/png" className="hidden" onChange={(e) => { addFoto(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-card p-5">
        <label className="text-sm"><span className="mb-1.5 block font-semibold">Título do produto</span><input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
        <div className="text-sm">
          <span className="mb-1.5 block font-semibold">Categorias Associadas <span className="font-normal text-muted-foreground">(selecione ao menos uma)</span></span>
          <div className="flex flex-wrap items-center gap-2">
            {cats.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                {categorias.find((x) => x.id === c)?.nome ?? c}
                <button type="button" onClick={() => setCats(cats.filter((x) => x !== c))} aria-label="Remover categoria"><X className="size-3" /></button>
              </span>
            ))}
            {addCat ? (
              <select autoFocus className="h-8 rounded-lg border bg-card px-2 text-xs" defaultValue="" onChange={(e) => { if (e.target.value) setCats([...new Set([...cats, e.target.value])]); setAddCat(false); }} onBlur={() => setAddCat(false)}>
                <option value="">Escolha…</option>
                {categorias.filter((c) => !cats.includes(c.id)).map((c) => <option key={c.id} value={c.id}>{c.pai ? `— ${c.nome}` : c.nome}</option>)}
              </select>
            ) : (
              <button type="button" onClick={() => setAddCat(true)} className="text-xs font-semibold text-brand">+ Adicionar outra categoria...</button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <label className="text-sm"><span className="mb-1.5 block font-semibold">Preço de Venda (R$)</span><input type="number" min="0" step="0.01" className={inputCls} value={preco} onChange={(e) => setPreco(e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1.5 block font-semibold">Custo Unitário (R$) <span className="font-normal text-muted-foreground">· confidencial</span></span><input type="number" min="0" step="0.01" className={inputCls} value={custo} onChange={(e) => setCusto(e.target.value)} /></label>
        <div className={`rounded-xl p-3 text-sm font-semibold sm:col-span-2 ${pv === 0 ? "bg-secondary text-muted-foreground" : m.prejuizo ? "bg-destructive/10 text-destructive" : "bg-success-soft text-success"}`}>
          Margem Estimada: {pv === 0 ? "informe o preço" : m.prejuizo ? `Prejuízo de ${brl(Math.abs(m.lucro))} (Margem: ${m.pct.toFixed(1)}%) — o custo é maior que o preço` : `Lucro de ${brl(m.lucro)} (Margem: +${m.pct.toFixed(1)}%)`}
        </div>
        <label className="text-sm"><span className="mb-1.5 block font-semibold">Quantidade em Estoque</span><input type="number" min="0" className={inputCls} value={estoque} onChange={(e) => setEstoque(e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1.5 block font-semibold">Condição</span>
          <select className={inputCls} value={condicao} onChange={(e) => setCondicao(e.target.value as "novo" | "usado")}><option value="novo">Novo</option><option value="usado">Usado</option></select>
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={frete} onChange={(e) => setFrete(e.target.checked)} className="size-4 accent-[var(--brand)]" /> Oferecer Frete Grátis neste produto</label>
        <label className="text-sm sm:col-span-2"><span className="mb-1.5 block font-semibold">Descrição Completa e Especificações Técnicas</span><textarea className={textareaCls} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></label>
      </section>

      {erros.length > 0 && <ul className="space-y-1 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{erros.map((e) => <li key={e}>• {e}</li>)}</ul>}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={() => salvar("publicado")}>{inicial ? "Salvar e Publicar" : "Publicar Produto no Catálogo"}</Button>
        <Button size="lg" variant="outline" onClick={() => salvar("rascunho")}>Salvar como Rascunho</Button>
      </div>
    </div>
  );
}
