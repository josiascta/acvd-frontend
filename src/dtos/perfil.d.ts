interface DocumentoResponseDTO {
  id: string;
  nomeOriginal: string;
  tamanho: string;
  hash: string;
  dataUpload: string;
}

interface ContaBancariaDTO {
  id?: string;
  banco: string;
  numero: string;
  agencia: string;
  operacao: string;
}

interface ResponsavelLegalDTO {
  id?: string;
  nome: string;
  cpf: string;
  rg: string;
  contato: string;
  documento?: DocumentoResponseDTO;
}
