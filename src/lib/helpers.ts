import { onlyDigits } from "./format";
import type { StatusPedido, StatusReembolso } from "./store";

export async function fetchCEP(cep: string) {
  const r = await fetch(`https://viacep.com.br/ws/${onlyDigits(cep)}/json/`);
  const j = await r.json();
  if (j.erro) throw new Error("CEP não encontrado");
  return { logradouro: j.logradouro as string, bairro: j.bairro as string, cidade: j.localidade as string, uf: j.uf as string };
}

export const statusTone = (s: StatusPedido) =>
  s === "entregue" ? "success" : s === "cancelado" ? "danger" : s === "em_preparacao" || s === "aguardando_pagamento" ? "warning" : "dark";

export const reembolsoLabel: Record<StatusReembolso, string> = {
  solicitado: "Solicitado",
  em_analise: "Em análise",
  aguardando_recebimento: "Aguardando recebimento",
  reembolsado: "Reembolsado",
  recusado: "Recusado",
};
