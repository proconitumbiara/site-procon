// Preposições e conjunções que devem permanecer em minúsculo no meio do nome
const LOWERCASE_PARTICLES = new Set([
  "da", "de", "di", "do", "du",
  "das", "dos", "des",
  "e", "y",
]);

/**
 * Normaliza um nome pessoal para o formato de título respeitando
 * as partículas do português (da, de, do, das, dos, e...).
 *
 * Exemplos:
 *   "JoÃO dA siLVA"  → "João da Silva"
 *   "MARIA DAS DORES" → "Maria das Dores"
 *   "ana e silva"    → "Ana e Silva"
 */
export const formatPersonName = (name?: string | null): string => {
  if (!name) return "";

  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index !== 0 && LOWERCASE_PARTICLES.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const formatBrazilianPhone = (digits: string) => {
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(
      3,
      7,
    )}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return digits;
};

export const normalizePhone = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return value.replace(/\D/g, "").slice(0, 11);
};

export const formatPhone = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return formatBrazilianPhone(normalizePhone(value));
};

export const normalizeAddress = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s,/, ",")
    .replace(/,\s*/g, ", ");
};


