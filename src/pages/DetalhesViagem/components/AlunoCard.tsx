import React, { memo } from "react";
import { handleViewDocument } from "../../../utils/api";

type AlunoCardProps = {
  req: RequisicaoDetalhesDTO;
  submittingEval: boolean;
  openValidateModal: (req: RequisicaoDetalhesDTO) => void;
  openInfoModal: (req: RequisicaoDetalhesDTO) => void;
  handleDeleteAluno: (id: string) => void;
};

const getStatusDisplay = (status: StatusRequisicao) => {
  const text = status.replace("_", " ");
  let colorClass = "";
  switch (status) {
    case "AGUARDANDO_ENVIO":
      colorClass = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "AGUARDANDO_ANALISE":
      colorClass = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "APROVADA":
      colorClass = "bg-green-50 text-green-700 border-green-200";
      break;
    case "REPROVADO":
      colorClass = "bg-red-50 text-red-700 border-red-200";
      break;
  }
  return { text, colorClass };
};

const isMenorDeIdade = (dataNascimentoStr?: string) => {
  if (!dataNascimentoStr) return false;
  const hoje = new Date();
  const dataNascimento = new Date(dataNascimentoStr);
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const m = hoje.getMonth() - dataNascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }
  return idade < 18;
};

export const AlunoCard = memo(
  ({
    req,
    submittingEval,
    openValidateModal,
    openInfoModal,
    handleDeleteAluno,
  }: AlunoCardProps) => {
    const statusInfo = getStatusDisplay(req.status);
    const menorDeIdade = isMenorDeIdade(req.discente.dataNascimento);
    const isAguardandoEnvio = req.status === "AGUARDANDO_ENVIO";

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
        {/* 1. Infos do Aluno */}
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className="font-bold text-slate-900 truncate"
              title={req.discente.nome}
            >
              {req.discente.nome}
            </h4>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${statusInfo.colorClass}`}
            >
              {statusInfo.text}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {req.discente.email}
          </p>
        </div>

        {/* 2. Central de Documentos */}
        <div className="flex flex-wrap items-start justify-center gap-6 bg-slate-50 px-5 py-3 rounded-lg border border-slate-100 min-w-fit">
          <div className="flex flex-col items-center justify-between min-h-[44px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Doc. do Estudante
            </span>
            {req.documentoDiscente?.id ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleViewDocument(req.documentoDiscente!.id)}
                  title="Visualizar"
                  className="text-blue-600 hover:bg-blue-100 p-1 rounded-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    visibility
                  </span>
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium py-1">
                Pendente
              </span>
            )}
          </div>

          {menorDeIdade && (
            <div className="flex flex-col items-center justify-between min-h-[44px] border-l border-slate-200 pl-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                Doc. Responsável legal
              </span>
              {req.responsavelLegal?.documento?.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleViewDocument(req.responsavelLegal!.documento!.id)
                    }
                    title="Visualizar"
                    className="text-blue-600 hover:bg-amber-100 p-1 rounded-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      visibility
                    </span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium py-1">
                  Pendente
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col items-center justify-between min-h-[44px] border-l border-slate-200 pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              ANEXO V
            </span>
            <span className="text-[11px] text-slate-400 font-medium py-1">
              Pendente
            </span>
          </div>
        </div>

        {/* 3. Ações Rápidas */}
        <div className="flex items-center justify-end gap-2 xl:border-l xl:border-slate-100 xl:pl-4">
          <button
            onClick={() => openValidateModal(req)}
            disabled={submittingEval || isAguardandoEnvio}
            title={
              isAguardandoEnvio
                ? "Aguardando envio do aluno"
                : "Validar Documentação"
            }
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-sm font-semibold border ${
              isAguardandoEnvio || submittingEval
                ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              fact_check
            </span>
            Validar
          </button>

          <button
            onClick={() => openInfoModal(req)}
            title="Informações Completas do Aluno"
            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 ml-1 rounded-full transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[22px]">info</span>
          </button>

          <button
            onClick={() => handleDeleteAluno(req.requisicaoId)}
            title="Remover Aluno da Viagem"
            className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[22px]">
              delete
            </span>
          </button>
        </div>
      </div>
    );
  },
);
