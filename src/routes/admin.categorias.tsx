import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inputCls, PageTitle, SideLayout, textareaCls } from "@/components/painel/SideLayout";
import { produtos as catalogo } from "@/lib/data";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";
import { podeExcluirCategoria } from "@/lib/validators";

export const Route = createFileRoute("/admin/categorias")({
  head: () => seo("Categorias Globais", "Gerencie a árvore de categorias do marketplace."),
  component: () => <SideLayout perfil="admin"><Categorias /></SideLayout>,
});

function Categorias() {
  const { categorias, produtos, salvarCategoria, excluirCategoria } = usePainel();
  const [form, setForm] = useState<{ id?: string; nome: string; pai: string; descricao: string }>({ nome: "", pai: "", descricao: "" });
  const count = (id: string) => {
    const ids = new Set([...catalogo.filter((p) => p.lojaId !== "tech-eletro"), ...produtos].filter((p) => p.categorias.includes(id)).map((p) => p.id));
    return ids.size;
  };
  const subs = (id: string) => categorias.filter((c) => c.pai === id);
  const raizes = categorias.filter((c) => !c.pai);
  const sel = form.id ? { n: count(form.id), s: subs(form.id).length } : null;

  const excluir = (id: string) => {
    if (!podeExcluirCategoria(count(id), subs(id).length)) return toast.error("Exclusão bloqueada: há produtos ou subcategorias vinculados.");
    excluirCategoria(id); toast.success("Categoria excluída");
    if (form.id === id) setForm({ nome: "", pai: "", descricao: "" });
  };
  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Informe o nome da categoria");
    salvarCategoria({ ...(form.id ? { id: form.id } : {}), nome: form.nome.trim(), pai: form.pai || undefined, descricao: form.descricao });
    toast.success("Categoria salva"); setForm({ nome: "", pai: "", descricao: "" });
  };
  const linha = (c: (typeof categorias)[number], sub = false) => (
    <div key={c.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent ${form.id === c.id ? "bg-accent" : ""} ${sub ? "ml-6 text-sm" : "font-semibold"}`}>
      <span className="flex-1">{c.nome} <span className="text-xs font-normal text-muted-foreground">({count(c.id)} produtos)</span></span>
      <button onClick={() => setForm({ id: c.id, nome: c.nome, pai: c.pai ?? "", descricao: c.descricao })} aria-label="Editar"><Pencil className="size-4 text-muted-foreground" /></button>
      <button onClick={() => excluir(c.id)} aria-label="Excluir"><Trash2 className="size-4 text-destructive" /></button>
    </div>
  );
  return (
    <>
      <PageTitle title="Gestão Global da Árvore de Categorias" sub="Crie categorias raiz, subcategorias e gerencie exclusões com proteção de integridade." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Estrutura de Categorias</h2><Button size="sm" onClick={() => setForm({ nome: "", pai: "", descricao: "" })}><Plus /> Nova Categoria Raiz</Button></div>
          {raizes.map((r) => <div key={r.id}>{linha(r)}{subs(r.id).map((s) => linha(s, true))}</div>)}
        </div>
        <form onSubmit={salvar} className="h-fit space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-bold">{form.id ? "Editar Categoria" : "Criar Categoria"}</h2>
          <label className="block text-sm"><span className="mb-1 block font-semibold">Nome da categoria</span><input className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
          <label className="block text-sm"><span className="mb-1 block font-semibold">Categoria Pai (deixe vazio para Categoria Raiz)</span>
            <select className={inputCls} value={form.pai} onChange={(e) => setForm({ ...form, pai: e.target.value })}><option value="">— Nenhuma (raiz) —</option>{raizes.filter((r) => r.id !== form.id).map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}</select>
          </label>
          <label className="block text-sm"><span className="mb-1 block font-semibold">Descrição</span><textarea className={textareaCls} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></label>
          {sel && !podeExcluirCategoria(sel.n, sel.s) && (
            <div className="flex gap-2 rounded-xl bg-warning-soft p-3 text-xs"><AlertTriangle className="size-4 shrink-0 text-warning" /><span><b>Regra de Exclusão Segura:</b> esta categoria possui {sel.n} produtos{sel.s ? ` e ${sel.s} subcategorias` : ""} vinculados. A exclusão fica bloqueada até que sejam remanejados.</span></div>
          )}
          <Button type="submit" className="w-full">Salvar Alterações</Button>
        </form>
      </div>
    </>
  );
}
