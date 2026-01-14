export const formatCPF = (cpf?: string | null) => {
  if (!cpf) {
    return "";
  }
  // Remove non-digits and format as xxx.xxx.xxx-xx
  const cleaned = cpf.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length < 11) {
    return cpf; // Return original if not enough digits
  }
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};
