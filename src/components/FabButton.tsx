interface FabButtonProps {
  onClick: () => void;
  label: string;
  icon?: string;
}

export function FabButton({ onClick, label, icon = "add" }: FabButtonProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-[#008060] hover:bg-[#006d52] text-white h-12 px-5 rounded-full shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <span className="text-sm font-bold">{label}</span>
      </button>
    </div>
  );
}
