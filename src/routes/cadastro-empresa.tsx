import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordChecklist } from "@/components/shop/PasswordChecklist";
import { inputCls, textareaCls } from "@/components/painel/SideLayout";
import { Campo, EnderecoFields, LogoUpload } from "@/components/painel/EmpresaFields";
import { maskCNPJ, maskPhone } from "@/lib/format";
import { usePainel, type Empresa } from "@/lib/painel";
import { seo } from "@/lib/seo";
import { isStrongPassword, isValidCNPJ, isValidEmail } from "@/lib/validators";

export const Route = createFileRoute("/cadastro-empresa")({
  head: () => seo("Cadastro de Empresa Parceira", "Cadastre sua loja e comece a vender no marketplace."),
  component: Cadastro,
});

function Cadastro() {
  const { cadastrarEmpresa, usuarios, editarUsuario } = usePainel();
  const navigate = useNavigate();
  const [f, setF] = useState<Empresa>({ id: "tech-eletro", razaoSocial: "", nomeFantasia: "", cnpj: "", responsavel: "", ie: "", im: "", telefone: "", email: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", descricao: "" });
  const [senha, setSenha] = useState("");
  const [conf, setConf] = useState("");
  const [termos, setTermos] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<Empresa>) => setF((x) => ({ ...x, ...p }));
  const personal = [f.razaoSocial, f.nomeFantasia, f.email, f.cnpj];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.razaoSocial.trim()) er.razaoSocial = "Razão Social obrigatória.";
    if (!f.nomeFantasia.trim()) er.nomeFantasia = "Nome fantasia obrigatório.";
    if (!isValidCNPJ(f.cnpj)) er.cnpj = "CNPJ inválido.";
    else if (usuarios.some((u) => u.documento === f.cnpj)) er.cnpj = "CNPJ já cadastrado.";
    if (!f.responsavel.trim()) er.responsavel = "Informe o responsável legal.";
    if (f.telefone.replace(/\D/g, "").length < 10) er.telefone = "Telefone inválido.";
    if (!isValidEmail(f.email)) er.email = "E-mail inválido.";
    else if (usuarios.some((u) => u.email === f.email)) er.email = "E-mail já cadastrado.";
    for (const k of ["cep", "logradouro", "numero", "bairro", "cidade", "uf"] as const) if (!f[k].trim()) er[k] = "Obrigatório.";
    if (!isStrongPassword(senha, personal)) er.senha = "A senha não atende aos critérios.";
    if (senha !== conf) er.conf = "As senhas não conferem.";
    if (!termos) er.termos = "Aceite os termos de uso.";
    setErr(er);
    if (Object.keys(er).length) return toast.error("Revise os campos destacados");
    setBusy(true);
    setTimeout(() => {
      cadastrarEmpresa(f);
      const u = usuarios.find((x) => x.lojaId === f.id);
      if (u) editarUsuario(u.id, { nome: f.razaoSocial, email: f.email, documento: f.cnpj });
      toast.success("Empresa cadastrada! Bem-vindo ao Painel Lojista.");
      navigate({ to: "/painel" });
    }, 700);
  };

  const t = (k: keyof Empresa, label: string, mask?: (v: string) => string, cls = "") => (
    <Campo label={label} className={cls}>
      <input className={`${inputCls} ${err[k] ? "border-destructive" : ""}`} value={f[k] ?? ""} onChange={(e) => set({ [k]: mask ? mask(e.target.value) : e.target.value })} />
      {err[k] && <span className="mt-1 block text-xs text-destructive">{err[k]}</span>}
    </Campo>
  );

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Cadastro de Empresa Parceira</h1>
      <p className="mt-1 text-sm text-muted-foreground">Venda para milhares de clientes no marketplace.</p>
      <form onSubmit={submit} className="mt-8 space-y-6">
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div><h2 className="font-semibold">Logo da Loja</h2><p className="mb-3 text-xs text-muted-foreground">Upload do logotipo (máx 5MB)</p><LogoUpload value={f.logo} onChange={(logo) => set({ logo })} label="Enviar logotipo" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {t("razaoSocial", "Razão Social")}
            {t("nomeFantasia", "Nome Fantasia (Vitrine Pública)")}
            {t("cnpj", "CNPJ", maskCNPJ)}
            {t("responsavel", "Responsável Legal")}
            {t("ie", "Inscrição Estadual (opcional)")}
            {t("im", "Inscrição Municipal (opcional)")}
            {t("telefone", "Telefone Comercial", maskPhone)}
            {t("email", "E-mail Corporativo")}
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-5"><h2 className="mb-4 font-semibold">Endereço comercial</h2><EnderecoFields v={f} set={set} err={err} /></section>
        <section className="rounded-2xl border bg-card p-5">
          <Campo label="Descrição Pública da Empresa (Vitrine)"><textarea className={textareaCls} value={f.descricao} onChange={(e) => set({ descricao: e.target.value })} /></Campo>
        </section>
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Senha"><input type="password" className={`${inputCls} ${err.senha ? "border-destructive" : ""}`} value={senha} onChange={(e) => setSenha(e.target.value)} /></Campo>
            <Campo label="Confirmar senha"><input type="password" className={`${inputCls} ${err.conf ? "border-destructive" : ""}`} value={conf} onChange={(e) => setConf(e.target.value)} />{err.conf && <span className="mt-1 block text-xs text-destructive">{err.conf}</span>}</Campo>
          </div>
          <PasswordChecklist pw={senha} personal={personal} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} className="size-4" /> Aceitar os termos de uso</label>
          {err.termos && <span className="block text-xs text-destructive">{err.termos}</span>}
        </section>
        <Button size="lg" type="submit" className="w-full" disabled={busy}>{busy ? "Cadastrando…" : "Cadastrar Empresa"}</Button>
        <p className="text-center text-sm">Já possui cadastro corporativo? <Link to="/entrar" className="font-semibold text-brand">Entrar no painel</Link></p>
      </form>
    </div>
  );
}
