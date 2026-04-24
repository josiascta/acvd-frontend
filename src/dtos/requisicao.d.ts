type StatusRequisicao =
  | "AGUARDANDO_ENVIO"
  | "AGUARDANDO_ANALISE"
  | "APROVADA"
  | "REPROVADO";

type DocumentoInfoDTO = {
  id: string;
  nomeOriginal: string;
  tamanho: string;
  dataUpload: string;
};

type TermoResponsabilidadeDTO = {
  id: string;
  tamanho: string;
  hash: string;
  data: string;
};

type ContaInfoDTO = {
  banco: string;
  agencia: string;
  numero: string;
  operacao: string;
};

type DiscenteInfoDTO = {
  id: string;
  nome: string;
  matricula: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  curso: string;
  email: string;
  telefone: string;
};

type ResponsavelInfoDTO = {
  nome: string;
  cpf: string;
  rg: string;
  contato: string;
  documento?: DocumentoInfoDTO;
};

type RequisicaoDetalhesDTO = {
  requisicaoId: string;
  status: StatusRequisicao;
  motivoReprovacao?: string;
  valorDiaria: number;
  inscricaoValor: number;
  discente: DiscenteInfoDTO;
  contaBancaria?: ContaInfoDTO;
  documentoDiscente?: DocumentoInfoDTO;
  responsavelLegal?: ResponsavelInfoDTO;
  termoResponsabilidade?: DocumentoInfoDTO;
};

type RequisicaoResumoDTO = {
  id: string;
  viagemId: string;
  discenteId: string;
  discenteNome: string;
  discenteMatricula: string;
  status: StatusRequisicao;
  motivoReprovacao?: string;
  valorDiaria: number;
  inscricaoValor: number;
  responsavelLegal?: ResponsavelInfoDTO;
  termoResponsabilidade?: DocumentoInfoDTO;
};
