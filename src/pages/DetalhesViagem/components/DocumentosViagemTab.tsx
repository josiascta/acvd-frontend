import { useNavigate } from "react-router-dom";

type Props = {
  id?: string;
  isFinalizada: boolean;
  handleDownloadAnexoI: () => void;
  handleDownloadAnexoIV: () => void;
  handleDownloadAnexoIII: () => void;
  handleDownloadAnexoVI: () => void;
};

export function DocumentosViagemTab({
  id,
  isFinalizada,
  handleDownloadAnexoI,
  handleDownloadAnexoIV,
  handleDownloadAnexoIII,
  handleDownloadAnexoVI,
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
            onClick={() => id && navigate(`/viagem/${id}/preencher-anexo-iii`)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={handleDownloadAnexoIII}
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

      {/* ANEXO VI */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 text-3xl">
            description
          </span>
          <div>
            <h4 className="font-bold text-slate-900">ANEXO VI</h4>
            <p className="text-xs text-slate-500 font-medium">
              RELATÓRIO DE ATIVIDADE DE CAMPO
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isFinalizada && (
            <p className="text-[10px] text-amber-600 font-semibold mt-1">
              Disponível apenas após o término da viagem
            </p>
          )}
          <button
            onClick={() => {
              if (!isFinalizada) {
                alert(
                  "O relatório só pode ser preenchido após o término da viagem.",
                );
                return;
              }
              if (id) navigate(`/viagem/${id}/preencher-anexo-vi`);
            }}
            disabled={!isFinalizada}
            className={`p-1.5 rounded-md transition-colors ${
              isFinalizada
                ? "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                : "text-slate-300 cursor-not-allowed"
            }`}
            title="Editar"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>

          <button
            onClick={() => {
              if (!isFinalizada) {
                alert(
                  "O relatório só pode ser baixado após o término da viagem.",
                );
                return;
              }
              handleDownloadAnexoVI();
            }}
            disabled={!isFinalizada}
            className={`p-1.5 rounded-md transition-colors ${
              isFinalizada
                ? "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                : "text-slate-300 cursor-not-allowed"
            }`}
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
