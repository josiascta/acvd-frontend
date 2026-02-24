type UserRole = "SERVIDOR" | "DISCENTE";

type UserResponse = {
  userId: UUID;
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
};
