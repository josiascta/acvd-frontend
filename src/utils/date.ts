export function isMenorDeIdade(dataNascimento?: string): boolean {
  if (!dataNascimento) return false;
  const birthDate = new Date(dataNascimento);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 18;
}

export function formatarData(dataString: string | undefined | null): string {
  if (!dataString) return "Não Informado";
  try {
    return new Date(dataString.split("T")[0] + "T12:00:00").toLocaleDateString(
      "pt-BR",
    );
  } catch {
    return "Data Inválida";
  }
}
