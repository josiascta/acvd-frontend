interface TripFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function TripFilters({
  activeFilter,
  onFilterChange,
}: TripFiltersProps) {
  const filters = [
    { id: "all", label: "Todas" },
    { id: "open", label: "Em aberto" },
    { id: "completed", label: "Concluídas" },
  ];

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
      <button className="px-3 py-1.5 text-sm font-medium rounded text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[18px]">
          filter_list
        </span>
        Filtrar
      </button>
      <div className="h-4 w-px bg-slate-200 mx-1"></div>

      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-3 py-1.5 text-sm whitespace-nowrap rounded transition-colors ${
            activeFilter === filter.id
              ? "font-bold bg-slate-100 text-slate-900"
              : "font-medium text-slate-600 hover:bg-slate-50"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
