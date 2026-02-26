interface TripCardProps {
  trip: ViagemDTO;
  onClick?: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
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

  // Lógica para descobrir o status da documentação dinamicamente (baseado no prazo)
  const dataAtual = new Date();
  const prazoAnexos = new Date(trip.prazoAnexosDiscentes);
  const isDocPendente = prazoAnexos >= dataAtual; // Se o prazo ainda não venceu, está pendente

  return (
    <article
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer hover:border-[#008060]/50"
    >
      <div className="p-5 flex flex-col h-full">
        {/* Header do Card */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1.5 text-left flex-1 min-w-0 pr-3">
            {/* Título com Truncate (...) */}
            <h3
              title={localFinal}
              className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#008060] transition-colors truncate"
            >
              {localFinal}
            </h3>

            {/* Data */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="material-symbols-outlined text-[16px]">
                calendar_month
              </span>
              {formatDate(trip.dataPartida)} - {formatDate(trip.dataRetorno)}
            </div>

            {/* Local da Cidade / Destino Final embaixo da data */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="material-symbols-outlined text-[16px]">
                location_on
              </span>
              <span className="truncate" title={localFinal}>
                {localFinal}
              </span>
            </div>
          </div>

          {/* Badge de Status Documentação */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors whitespace-nowrap shrink-0
            ${
              isDocPendente
                ? "bg-amber-50 text-amber-700 border-amber-200" // Amarelo para Pendente
                : "bg-[#008060]/10 text-[#008060] border-[#008060]/20" // Verde para Aprovada
            }`}
          >
            {isDocPendente ? "Doc Pendente" : "Doc Aprovada"}
          </span>
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
