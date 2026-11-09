import { describe, expect, it } from "vitest";
import { chatAnexoErro, isValidCNPJ, margem, podeExcluirCategoria, statusEstoque } from "@/lib/validators";

describe("regras da empresa e do admin", () => {
  it("valida dígitos do CNPJ", () => {
    expect(isValidCNPJ("11.222.333/0001-81")).toBe(true);
    expect(isValidCNPJ("11.222.333/0001-82")).toBe(false);
  });
  it("RF52: margem e alerta de prejuízo", () => {
    expect(margem(3299, 2200).lucro).toBe(1099);
    expect(margem(3299, 2200).pct).toBeCloseTo(33.3, 1);
    expect(margem(100, 120).prejuizo).toBe(true);
  });
  it("RF35: estoque 0 vira ESGOTADO", () => {
    expect(statusEstoque(0)).toBe("esgotado");
    expect(statusEstoque(1)).toBe("ativo");
  });
  it("RN27: anexo só WebP até 80 KB", () => {
    expect(chatAnexoErro("image/webp", 80 * 1024)).toBeNull();
    expect(chatAnexoErro("image/webp", 80 * 1024 + 1)).not.toBeNull();
    expect(chatAnexoErro("image/png", 1000)).not.toBeNull();
  });
  it("RF08.1: categoria com produtos não pode ser excluída", () => {
    expect(podeExcluirCategoria(14, 0)).toBe(false);
    expect(podeExcluirCategoria(0, 0)).toBe(true);
  });
});
