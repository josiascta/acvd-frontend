import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  id?: string;
  handleDownloadAnexoI: () => void;
  handleDownloadAnexoIV: () => void;
};

export function DocumentosViagemTab({
  id,
  handleDownloadAnexoI,
  handleDownloadAnexoIV,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* ANEXO I */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 text-3xl">
            description
          </span>
          <div>
            <h4 className="font-bold text-slate-900">ANEXO I</h4>
            <p className="text-xs text-slate-500 font-medium">
              FORMULÁRIO DE SOLICITAÇÃO COLETIVA DE AJUDA DE CUSTO
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => id && navigate(`/viagem/${id}/preencher-anexo-i`)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={handleDownloadAnexoI}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Baixar"
          >
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
          </button>
        </div>
      </div>

      {/* ANEXO III */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 text-3xl">
            description
          </span>
          <div>
            <h4 className="font-bold text-slate-900">ANEXO III</h4>
            <p className="text-xs text-slate-500 font-medium">
              FORMULÁRIO DE PLANEJAMENTO DE ATIVIDADE DE CAMPO
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Em breve: Editar PDF")}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={() => alert("Em breve: Baixar PDF")}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Baixar"
          >
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
          </button>
        </div>
      </div>

      {/* ANEXO IV (Automático) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 text-3xl">
            description
          </span>
          <div>
            <h4 className="font-bold text-slate-900">ANEXO IV</h4>
            <p className="text-xs text-slate-500 font-medium">
              DISCENTES PARTICIPANTES DA VISITA TÉCNICA/ATIVIDADE DE CAMPO
            </p>
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
              Gerado automaticamente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAnexoIV}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Baixar"
          >
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
