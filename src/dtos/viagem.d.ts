type TipoViagem = "INDIVIDUAL" | "COLETIVA";

type ItinerarioDTO = {
  id: string;
  horarioEntrada: string; // LocalDateTime
  horarioSaida: string; // LocalDateTime
  local: string;
};

type ViagemDTO = {
  id: string;
  dataPartida: string; // LocalDate
  dataRetorno: string; // LocalDate
  prazoAnexosDiscentes: string; // LocalDate
  valorDiariaCnpq: number; // Float
  tipoViagem: TipoViagem;
  nomeResponsavel?: string;
  itinerarios: ItinerarioDTO[];
};
