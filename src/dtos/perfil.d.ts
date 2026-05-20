export interface DocumentoResponseDTO {
  id: string;
  nomeOriginal: string;
  tamanho: string;
  hash: string;
  dataUpload: string;
}

export interface ContaBancariaDTO {
  id?: string;
  banco: string;
  numero: string;
  agencia: string;
  operacao: string;
}

export interface ResponsavelLegalDTO {
  id?: string;
  nome: string;
  cpf: string;
  rg: string;
  contato: string;
  documento?: DocumentoResponseDTO;
}
