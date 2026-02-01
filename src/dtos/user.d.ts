type UserRole = "PROFESSOR" | "ALUNO";

type UserResponse = {
  userId: UUID;
  nome: string;
  fotoDePerfil: string;
  email: string;
  matricula: string;
  role: UserRole;
  numeroRg?: string;        // Adicionado
  numeroCpf?: string;       // Adicionado
  dataNascimento?: string;
  curso?: string;
};
