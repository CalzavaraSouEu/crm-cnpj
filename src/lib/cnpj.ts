export function cleanCNPJ(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCNPJ(value: string): string {
  const digits = cleanCNPJ(value);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

export function validateCNPJ(value: string): boolean {
  const digits = cleanCNPJ(value);

  if (digits.length !== 14) return false;

  // Reject all same digits
  if (/^(\d)\1+$/.test(digits)) return false;

  // Validate check digits
  const calc = (str: string, weights: number[]) =>
    str
      .split("")
      .reduce((sum, d, i) => sum + parseInt(d) * weights[i], 0);

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const r1 = calc(digits.slice(0, 12), w1) % 11;
  const d1 = r1 < 2 ? 0 : 11 - r1;

  if (parseInt(digits[12]) !== d1) return false;

  const r2 = calc(digits.slice(0, 13), w2) % 11;
  const d2 = r2 < 2 ? 0 : 11 - r2;

  if (parseInt(digits[13]) !== d2) return false;

  return true;
}
