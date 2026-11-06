import geladeira from "@/assets/p-geladeira.jpg";
import smartphone from "@/assets/p-smartphone.jpg";
import notebook from "@/assets/p-notebook.jpg";
import fone from "@/assets/p-fone.jpg";

export type Categoria = { id: string; nome: string; pai?: string; icon: string };

export const departamentos: Categoria[] = [
  { id: "eletrodomesticos", nome: "Eletrodomésticos", icon: "Refrigerator" },
  { id: "informatica", nome: "Informática e Tech", icon: "Laptop" },
  { id: "smartphones", nome: "Smartphones", icon: "Smartphone" },
  { id: "casa", nome: "Casa e Decoração", icon: "Sofa" },
  { id: "moda", nome: "Moda e Acessórios", icon: "Shirt" },
  { id: "beleza", nome: "Beleza e Cuidados", icon: "Sparkles" },
  { id: "esportes", nome: "Esportes", icon: "Dumbbell" },
];

export const subcategorias: Categoria[] = [
  { id: "geladeiras", nome: "Geladeiras", pai: "eletrodomesticos", icon: "" },
  { id: "fogoes", nome: "Fogões", pai: "eletrodomesticos", icon: "" },
  { id: "lavadoras", nome: "Lavadoras", pai: "eletrodomesticos", icon: "" },
  { id: "micro-ondas", nome: "Micro-ondas", pai: "eletrodomesticos", icon: "" },
  { id: "notebooks", nome: "Notebooks", pai: "informatica", icon: "" },
  { id: "audio", nome: "Áudio e Fones", pai: "informatica", icon: "" },
  { id: "monitores", nome: "Monitores", pai: "informatica", icon: "" },
  { id: "android", nome: "Android", pai: "smartphones", icon: "" },
  { id: "ios", nome: "iOS", pai: "smartphones", icon: "" },
  { id: "moveis", nome: "Móveis", pai: "casa", icon: "" },
  { id: "decoracao", nome: "Decoração", pai: "casa", icon: "" },
  { id: "tenis", nome: "Tênis", pai: "moda", icon: "" },
  { id: "relogios", nome: "Relógios", pai: "moda", icon: "" },
  { id: "skincare", nome: "Skincare", pai: "beleza", icon: "" },
  { id: "perfumes", nome: "Perfumes", pai: "beleza", icon: "" },
  { id: "corrida", nome: "Corrida", pai: "esportes", icon: "" },
  { id: "fitness", nome: "Fitness", pai: "esportes", icon: "" },
];

export const allCategorias = [...departamentos, ...subcategorias];
export const catName = (id: string) => allCategorias.find((c) => c.id === id)?.nome ?? id;

export type Loja = {
  id: string;
  nome: string;
  descricao: string;
  nota: number;
  avaliacoes: number;
  vendas: number;
  verificada: boolean;
  iniciais: string;
};

export const lojas: Loja[] = [
  {
    id: "tech-eletro",
    nome: "Tech Eletro Oficial",
    descricao:
      "Há mais de 10 anos levando eletrodomésticos e eletrônicos de qualidade para todo o Brasil, com garantia oficial e entrega rápida.",
    nota: 4.9,
    avaliacoes: 420,
    vendas: 2000,
    verificada: true,
    iniciais: "TE",
  },
  {
    id: "mundo-digital",
    nome: "Mundo Digital",
    descricao: "Especialistas em informática, smartphones e acessórios. Atendimento humano e nota fiscal em todos os pedidos.",
    nota: 4.7,
    avaliacoes: 198,
    vendas: 950,
    verificada: true,
    iniciais: "MD",
  },
  {
    id: "casa-viva",
    nome: "Casa Viva Store",
    descricao: "Moda, casa e bem-estar com curadoria e preço justo.",
    nota: 4.5,
    avaliacoes: 87,
    vendas: 310,
    verificada: false,
    iniciais: "CV",
  },
];
export const getLoja = (id: string) => lojas.find((l) => l.id === id);

export type Produto = {
  id: string;
  lojaId: string;
  titulo: string;
  descricao: string;
  specs: [string, string][];
  preco: number;
  precoOriginal?: number | undefined;
  estoque: number;
  condicao: "novo" | "usado";
  freteGratis: boolean;
  categorias: string[];
  fotos: string[];
  nota: number;
  totalAvaliacoes: number;
  vendidos: number;
  dataCadastro: string;
};

const imgFor = (dep: string) =>
  dep === "eletrodomesticos" ? geladeira : dep === "smartphones" ? smartphone : dep === "informatica" ? notebook : fone;

type Seed = [string, string, string, string, number, number | undefined, number, "novo" | "usado", boolean, number, number, number];
// id, loja, dep, sub, preco, original, estoque, condicao, frete, nota, avaliacoes, vendidos
const seeds: [Seed, string][] = [
  [["geladeira-frost-free-400l", "tech-eletro", "eletrodomesticos", "geladeiras", 3299, 3899, 14, "novo", true, 4.9, 84, 512], "Geladeira Frost Free Duplex 400L Inox"],
  [["geladeira-side-by-side", "tech-eletro", "eletrodomesticos", "geladeiras", 7499, 8999, 5, "novo", true, 4.8, 31, 120], "Geladeira Side by Side 540L Inox com Dispenser"],
  [["geladeira-usada-300l", "casa-viva", "eletrodomesticos", "geladeiras", 1290, undefined, 1, "usado", false, 4.2, 6, 14], "Geladeira 300L Branca — Seminova"],
  [["fogao-5-bocas", "tech-eletro", "eletrodomesticos", "fogoes", 1899, 2199, 9, "novo", true, 4.6, 40, 210], "Fogão 5 Bocas Mesa de Vidro Inox"],
  [["lavadora-12kg", "tech-eletro", "eletrodomesticos", "lavadoras", 2499, 2899, 0, "novo", true, 4.7, 52, 330], "Lavadora de Roupas 12kg Inverter"],
  [["micro-ondas-30l", "mundo-digital", "eletrodomesticos", "micro-ondas", 699, 799, 22, "novo", false, 4.4, 19, 98], "Micro-ondas 30L Espelhado"],
  [["notebook-ultra-14", "mundo-digital", "informatica", "notebooks", 4899, 5599, 8, "novo", true, 4.8, 64, 280], "Notebook Ultra 14\" 16GB RAM SSD 512GB"],
  [["notebook-pro-16", "mundo-digital", "informatica", "notebooks", 8999, undefined, 3, "novo", true, 4.9, 22, 60], "Notebook Pro 16\" 32GB RAM SSD 1TB"],
  [["notebook-usado-13", "casa-viva", "informatica", "notebooks", 2199, undefined, 2, "usado", false, 4.1, 4, 9], "Notebook 13\" 8GB — Usado em ótimo estado"],
  [["fone-anc-wireless", "mundo-digital", "informatica", "audio", 899, 1199, 30, "novo", true, 4.7, 140, 900], "Fone Over-ear Bluetooth com Cancelamento de Ruído"],
  [["monitor-27-4k", "mundo-digital", "informatica", "monitores", 1999, 2399, 11, "novo", true, 4.6, 28, 150], "Monitor 27\" 4K IPS"],
  [["smartphone-x-256", "mundo-digital", "smartphones", "android", 2799, 3299, 18, "novo", true, 4.8, 210, 1200], "Smartphone X 256GB Câmera Tripla Preto"],
  [["smartphone-pro-512", "tech-eletro", "smartphones", "ios", 7999, 8999, 6, "novo", true, 4.9, 96, 400], "Smartphone Pro 512GB Titânio"],
  [["smartphone-usado-128", "casa-viva", "smartphones", "android", 999, undefined, 3, "usado", false, 4.0, 8, 22], "Smartphone 128GB — Usado"],
  [["tenis-corrida-cloud", "casa-viva", "esportes", "corrida", 699, 849, 25, "novo", true, 4.6, 58, 340], "Tênis de Corrida Cloud Branco"],
  [["tenis-casual-branco", "casa-viva", "moda", "tenis", 399, 499, 40, "novo", false, 4.3, 33, 200], "Tênis Casual Minimal Branco"],
];

export const produtos: Produto[] = seeds.map(([[id, lojaId, dep, sub, preco, original, estoque, condicao, frete, nota, total, vendidos], titulo], i) => {
  const img = imgFor(dep);
  return {
    id,
    lojaId,
    titulo,
    descricao: `${titulo}. Produto ${condicao === "novo" ? "novo, lacrado e com garantia oficial de 12 meses" : "usado, revisado e testado, com garantia de 90 dias"}. Ideal para quem busca qualidade, eficiência e design moderno no dia a dia.`,
    specs: [
      ["Marca", lojaId === "tech-eletro" ? "Eletra" : "Nova"],
      ["Condição", condicao === "novo" ? "Novo" : "Usado"],
      ["Garantia", condicao === "novo" ? "12 meses" : "90 dias"],
      ["Categoria", catName(sub)],
    ],
    preco,
    precoOriginal: original,
    estoque,
    condicao,
    freteGratis: frete,
    categorias: [dep, sub],
    fotos: [img, img, img],
    nota,
    totalAvaliacoes: total,
    vendidos,
    dataCadastro: new Date(2026, 0, 1 + i * 12).toISOString(),
  };
});
export const getProduto = (id: string) => produtos.find((p) => p.id === id);

export type Avaliacao = { id: string; produtoId: string; autor: string; nota: number; comentario: string; data: string; fotos: string[] };
export const avaliacoesSeed: Avaliacao[] = [
  { id: "a1", produtoId: "geladeira-frost-free-400l", autor: "Carlos M.", nota: 5, comentario: "Silenciosa, espaçosa e chegou antes do prazo. Recomendo muito!", data: "2026-09-12", fotos: [geladeira] },
  { id: "a2", produtoId: "geladeira-frost-free-400l", autor: "Juliana P.", nota: 5, comentario: "Acabamento inox lindo, gela muito rápido.", data: "2026-08-30", fotos: [] },
  { id: "a3", produtoId: "geladeira-frost-free-400l", autor: "Roberto A.", nota: 4, comentario: "Ótima, só achei a porta um pouco pesada.", data: "2026-08-02", fotos: [] },
  { id: "a4", produtoId: "smartphone-x-256", autor: "Fernanda L.", nota: 5, comentario: "Câmera excelente e bateria dura o dia todo.", data: "2026-10-01", fotos: [smartphone] },
  { id: "a5", produtoId: "notebook-ultra-14", autor: "Pedro H.", nota: 5, comentario: "Leve e muito rápido para trabalho.", data: "2026-09-20", fotos: [] },
];

export const parcelas = (v: number) => (v >= 1000 ? 10 : v >= 300 ? 6 : 3);

export const motivosReembolso = [
  "Produto apresentou defeito funcional",
  "Produto diferente do anunciado",
  "Produto chegou danificado",
  "Arrependimento da compra",
  "Faltam peças ou acessórios",
];
