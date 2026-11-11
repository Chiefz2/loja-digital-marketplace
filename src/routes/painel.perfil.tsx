import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shop/Field";
import { inputCls, PageTitle, SideLayout, textareaCls } from "@/components/painel/SideLayout";
import { Campo, EnderecoFields, LogoUpload } from "@/components/painel/EmpresaFields";
import { maskPhone } from "@/lib/format";
import { usePainel } from "@/lib/painel";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/painel/perfil")({
  head: () => seo("Configurações da Loja", "Dados cadastrais e perfil público da sua loja."),
  component: () => <SideLayout perfil="empresa"><Perfil /></SideLayout>,
});

function Perfil() {
  const { empresa, updateEmpresa } = usePainel();
  const [f, setF] = useState(empresa);
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));
  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    for (const [k, l] of [["nomeFantasia", "nome fantasia"], ["telefone", "telefone"], ["cep", "CEP"], ["logradouro", "logradouro"], ["numero", "número"], ["cidade", "cidade"], ["uf", "UF"]] as const)
      if (!String(f[k]).trim()) er[k] = `Informe o ${l}.`;
    setErr(er);
    if (Object.keys(er).length) return toast.error("Preencha os campos obrigatórios");
    updateEmpresa(f);
    toast.success("Dados da loja atualizados. A vitrine já mostra as mudanças.");
  };
  return (
    <form onSubmit={salvar} className="space-y-6">
      <PageTitle title="Configurações da Loja e Perfil Público" action={<Link to="/loja/$id" params={{ id: empresa.id }} className="text-sm font-semibold text-brand">Ver vitrine pública ›</Link>} />
      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <LogoUpload value={f.logo} onChange={(logo) => set({ logo })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Razão Social" locked value={f.razaoSocial} readOnly />
          <Field label="CNPJ" locked value={f.cnpj} readOnly />
          <Campo label="Nome Fantasia (Exibido na Vitrine Pública)"><input className={`${inputCls} ${err.nomeFantasia ? "border-destructive" : ""}`} value={f.nomeFantasia} onChange={(e) => set({ nomeFantasia: e.target.value })} />{err.nomeFantasia && <span className="mt-1 block text-xs text-destructive">{err.nomeFantasia}</span>}</Campo>
          <Campo label="Telefone Comercial / WhatsApp"><input className={inputCls} value={f.telefone} onChange={(e) => set({ telefone: maskPhone(e.target.value) })} /></Campo>
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-5"><h2 className="mb-4 font-semibold">Endereço comercial</h2><EnderecoFields v={f} set={set} err={err} /></section>
      <section className="rounded-2xl border bg-card p-5">
        <Campo label="Descrição Institucional da Empresa (Exibida aos Clientes na Vitrine)"><textarea className={textareaCls} value={f.descricao} onChange={(e) => set({ descricao: e.target.value })} /></Campo>
      </section>
      <Button size="lg" type="submit">Salvar Alterações da Loja</Button>
    </form>
  );
}
