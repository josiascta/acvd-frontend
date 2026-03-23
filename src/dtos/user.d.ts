// cSpell:disable-Portuguese
export type UserRole = "SERVIDOR" | "DISCENTE";

export interface ContaBancariaDTO {
  id?: string;
  banco: string;
  numero: string; 
  agencia: string;
  operacao?: string;
}

export type UserResponse = {
  userId: string;
  nome: string;
  fotoDePerfil: string;
  email: string;
  matricula: string;
  telefone: string;
  role: UserRole;
  numeroRg?: string;
  numeroCpf?: string; 
  dataNascimento?: string;
  curso?: string;
  turmaPeriodo?: string;
  endereco?: string;
  contaBancaria?: ContaBancariaDTO; 
};