import { useState } from "react";
import { TripCard } from "../components/TripCard";
import { FabButton } from "../components/FabButton";
import { useNavigate } from "react-router-dom";

// MOCK: Adequado ao novo ViagemDTO
const MOCK_VIAGENS: ViagemDTO[] = [
  {
    id: "1",
    dataPartida: "2024-10-12T08:00:00",
    dataRetorno: "2024-10-14T18:00:00",
    prazoAnexosDiscentes: "2023-10-10", // Data antiga = Doc Aprovada
    valorDiariaCnpq: 320.5,
    tipoViagem: "COLETIVA",
    itinerarios: [
      {
        id: "it1",
        horarioEntrada: "2024-10-12T09:00:00",
        horarioSaida: "2024-10-12T12:00:00",
        local: "Campus IFPB - João Pessoa",
      },
      {
        id: "it2",
        horarioEntrada: "2024-10-12T14:00:00",
        horarioSaida: "2024-10-14T16:00:00",
        local: "Porto Digital",
      },
    ],
  },
  {
    id: "2",
    dataPartida: "2024-11-20T07:00:00",
    dataRetorno: "2024-11-20T19:00:00",
    prazoAnexosDiscentes: "2025-11-15", // Data no futuro = Doc Pendente
    valorDiariaCnpq: 150.0,
    tipoViagem: "COLETIVA",
    itinerarios: [
      {
        id: "it3",
        horarioEntrada: "2024-11-20T09:00:00",
        horarioSaida: "2024-11-20T11:00:00",
        local: "Fazenda Experimental",
      },
      {
        id: "it4",
        horarioEntrada: "2024-11-20T13:00:00",
        horarioSaida: "2024-11-20T17:00:00",
        local: "Embrapa",
      },
    ],
  },
  {
    id: "3",
    dataPartida: "2025-12-05T06:00:00",
    dataRetorno: "2025-12-07T22:00:00",
    prazoAnexosDiscentes: "2025-12-01", // Data no futuro = Doc Pendente
    valorDiariaCnpq: 500.0,
    tipoViagem: "INDIVIDUAL",
    itinerarios: [
      {
        id: "it5",
        horarioEntrada: "2025-12-05T14:00:00",
        horarioSaida: "2025-12-07T18:00:00",
        local: "Centro de Convenções",
      },
    ],
  },
];

export function Home() {
  const [busca, setBusca] = useState<string>("");
  const navigate = useNavigate();

  // Lógica de filtro baseada no texto digitado (Busca pelo localFinal)
  const viagensFiltradas = MOCK_VIAGENS.filter((viagem) => {
    if (busca.trim() === "") return true;

    const localFinal =
      viagem.itinerarios.length > 0
        ? viagem.itinerarios[viagem.itinerarios.length - 1].local
        : "";

    // Converte os dois para minúsculo para a busca ignorar letras maiúsculas/minúsculas
    return localFinal.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Minhas Viagens
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl">
              Acompanhe suas solicitações de viagens, roteiros e prazos de
              anexos.
            </p>
          </div>

          {/* Campo de Busca (Input) */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full md:max-w-xs transition-colors focus-within:border-[#008060] focus-within:ring-1 focus-within:ring-[#008060]">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por destino..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 p-0"
            />
          </div>
        </div>

        {/* Grid de Viagens usando a constante 'viagensFiltradas' */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viagensFiltradas.length > 0 ? (
            viagensFiltradas.map((viagem) => (
              <TripCard
                key={viagem.id}
                trip={viagem}
                onClick={() => console.log(`Clicou na viagem: ${viagem.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-2xl">
              Nenhuma viagem encontrada com o destino "{busca}".
            </div>
          )}
        </div>
      </main>

      {/* Botão Flutuante (FAB) */}
      <FabButton
        label="Nova Viagem"
        icon="add"
        onClick={() => navigate("/solicitacao-individual")}
      />
    </div>
  );
}
