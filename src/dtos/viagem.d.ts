export type TipoViagem = "INDIVIDUAL" | "COLETIVA";

// Novo tipo para controlar o estado da solicitação
export type StatusSolicitacao = "PENDENTE" | "APROVADA" | "REJEITADA";

export type ItinerarioDTO = {
  id: string;
  horarioEntrada: string; 
  horarioSaida: string; 
  local: string;
};

export type ViagemDTO = {
  id: string;
  dataPartida: string; 
  dataRetorno: string; 
  prazoAnexosDiscentes: string; 
  valorDiariaCnpq: number; 
  tipoViagem: TipoViagem;
  nomeResponsavel?: string;
  itinerarios: ItinerarioDTO[];
  
  // --- ADICIONE ESTES CAMPOS ---
  status?: StatusSolicitacao; // Opcional, pois viagens novas podem não ter status ainda
  solicitacaoId?: string;     // Para saber qual ID deletar ou editar
};