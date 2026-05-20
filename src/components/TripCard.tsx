interface TripCardProps {
  trip: ViagemDTO;
  statusRequisicao?: string; // <-- NOVO: Recebe o status (se for aluno)
  onClick?: () => void;
}

export function TripCard({ trip, statusRequisicao, onClick }: TripCardProps) {
  // Formatador simples para deixar a data amigável (ex: "12 Out")
  const formatDate = (dateString: string) => {
    const dateToFormat = dateString.includes("T")
      ? dateString
      : `${dateString}T00:00:00`;
    return new Date(dateToFormat)
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      .replace(".", "");
  };

  // Pega o local do último itinerário
  const localFinal =
    trip.itinerarios.length > 0
      ? trip.itinerarios[trip.itinerarios.length - 1].local
      : "Destino a definir";

  // Função para renderizar a Badge de Status apenas para os Alunos
  const renderStatusBadge = () => {
    if (!statusRequisicao) return null; // Se não tiver status (Servidor), não mostra nada

    const text = statusRequisicao.replace("_", " ");
    let colorClass = "bg-slate-50 text-slate-700 border-slate-200";

    if (statusRequisicao === "AGUARDANDO_ENVIO")
      colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    if (statusRequisicao === "AGUARDANDO_ANALISE")
      colorClass = "bg-blue-50 text-blue-700 border-blue-200";
    if (statusRequisicao === "APROVADA")
      colorClass = "bg-green-50 text-green-700 border-green-200";
    if (statusRequisicao === "REPROVADO")
      colorClass = "bg-red-50 text-red-700 border-red-200";

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors whitespace-nowrap shrink-0 ${colorClass}`}
      >
        {text}
      </span>
    );
  };

  return (
    <article
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer hover:border-[#008060]/50"
    >
      <div className="p-5 flex flex-col h-full">
        {/* Header do Card */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1.5 text-left flex-1 min-w-0 pr-3">
            {/* Título */}
            <h3
              title={trip.atividadeEvento || trip.localidadeEvento || localFinal}
              className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#008060] transition-colors truncate"
            >
              {trip.atividadeEvento || trip.localidadeEvento || localFinal}
            </h3>

            {/* Tipo de Viagem (Tag) */}
            <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit">
              <span className="material-symbols-outlined text-[14px]">
                {trip.tipoViagem === "COLETIVA" ? "groups" : "person"}
              </span>
              {trip.tipoViagem}
            </div>

            {/* Data */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pt-1">
              <span className="material-symbols-outlined text-[16px]">
                calendar_month
              </span>
              {formatDate(trip.dataPartida)} - {formatDate(trip.dataRetorno)}
            </div>

            {/* Responsável da Viagem lendo direto do trip */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="material-symbols-outlined text-[16px]">
                badge
              </span>
              <span
                className="truncate"
                title={`Responsável: ${trip.name || trip.nomeResponsavel || "Não informado"}`}
              >
                Responsável: {trip.nomeResponsavel || "Não informado"}
              </span>
            </div>
          </div>

          {/* Badge de Status Documentação (Renderiza o status do aluno ou fica vazio) */}
          {renderStatusBadge()}
        </div>

        {/* Footer do Card */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Prazo de Anexos
            </span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-amber-500">
                warning
              </span>
              {formatDate(trip.prazoAnexosDiscentes)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
