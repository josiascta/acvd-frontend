import React from 'react';

type TabsHeaderProps = {
  activeTab: "DOCUMENTOS" | "ALUNOS";
  setActiveTab: (tab: "DOCUMENTOS" | "ALUNOS") => void;
};

export function TabsHeader({ activeTab, setActiveTab }: TabsHeaderProps) {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab("DOCUMENTOS")}
          className={`${
            activeTab === "DOCUMENTOS"
              ? "border-[#008060] text-[#008060]"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
        >
          <span className="material-symbols-outlined text-[18px]">folder</span>{" "}
          Anexos da Viagem
        </button>
        <button
          onClick={() => setActiveTab("ALUNOS")}
          className={`${
            activeTab === "ALUNOS"
              ? "border-[#008060] text-[#008060]"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
        >
          <span className="material-symbols-outlined text-[18px]">groups</span>{" "}
          Alunos
        </button>
      </nav>
    </div>
  );
}
