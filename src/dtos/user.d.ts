type UserRole = "PROFESSOR" | "ALUNO";

type UserResponse = {
  userId: UUID;
  nome: string;
  fotoDePerfil: string;
  email: string;
  matricula: string;
  role: UserRole;
  numeroRg?: string;
  numeroCpf?: string;
  dataNascimento?: string;
  curso?: string;
};
