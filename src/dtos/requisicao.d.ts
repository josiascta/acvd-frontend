type TipoAfastamento =
  | "MENOR_04_HORAS"
  | "MAIOR_04_HORAS"
  | "MAIOR_08_HORAS"
  | "MAIOR_08_HORAS_ALIMENTACAO_OU_LOCOMOCAO"
  | "MAIOR_08_HORAS_ALIMENTACAO_E_LOCOMOCAO"
  | "MAIOR_08_HORAS_ALIMENTACAO_E_HOSPEDAGEM"
  | "MAIOR_08_HORAS_ALIMENTACAO_E_HOSPEDAGEM_E_LOCOMOCAO";

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
  tipoAfastamento: TipoAfastamento;
  solicitaInscricao: boolean;
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
  tipoAfastamento: TipoAfastamento;
  solicitaInscricao: boolean;
  responsavelLegal?: ResponsavelInfoDTO;
  termoResponsabilidade?: DocumentoInfoDTO;
};
