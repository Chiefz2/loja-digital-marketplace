import { describe, expect, it } from "vitest";
import {
  canCancelOrder,
  canRequestRefund,
  isValidCPF,
  isValidLuhn,
  passwordChecks,
} from "@/lib/validators";

describe("regras de negócio", () => {
  it("RN06: valida cartão pelo algoritmo de Luhn", () => {
    expect(isValidLuhn("4111 1111 1111 1111")).toBe(true);
    expect(isValidLuhn("4111 1111 1111 1112")).toBe(false);
  });
  it("valida dígitos verificadores do CPF", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("529.982.247-26")).toBe(false);
  });
  it("RN21: senha entre 8 e 16 caracteres", () => {
    expect(passwordChecks("Abc12345").length).toBe(true);
    expect(passwordChecks("Ab1").length).toBe(false);
    expect(passwordChecks("Abcdefgh123456789").length).toBe(false);
  });
  it("RN21: senha não pode conter dados pessoais", () => {
    expect(passwordChecks("Maria2024x", ["Maria Silva"]).noPersonal).toBe(false);
    expect(passwordChecks("Sol2024xyz", ["Maria Silva"]).noPersonal).toBe(true);
  });
  it("RN17: reembolso até 30 dias após a entrega", () => {
    expect(canRequestRefund("2026-01-01T00:00:00Z", new Date("2026-01-30T00:00:00Z"))).toBe(true);
    expect(canRequestRefund("2026-01-01T00:00:00Z", new Date("2026-02-05T00:00:00Z"))).toBe(false);
  });
  it("RN09: cancelamento só antes do envio", () => {
    expect(canCancelOrder("em_preparacao")).toBe(true);
    expect(canCancelOrder("enviado")).toBe(false);
    expect(canCancelOrder("entregue")).toBe(false);
  });
});
