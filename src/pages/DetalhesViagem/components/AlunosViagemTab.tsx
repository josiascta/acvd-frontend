import React, { useMemo } from "react";
import { AlunoCard } from "./AlunoCard";

type Props = {
  requisicoes: RequisicaoDetalhesDTO[];
  loading: boolean;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  setIsAddModalOpen: (isOpen: boolean) => void;
  submittingEval: boolean;
  openValidateModal: (req: RequisicaoDetalhesDTO) => void;
  openInfoModal: (req: RequisicaoDetalhesDTO) => void;
  handleDeleteAluno: (id: string) => void;
};

export function AlunosViagemTab({
  requisicoes,
  loading,
  statusFilter,
  setStatusFilter,
  setIsAddModalOpen,
  submittingEval,
  openValidateModal,
  openInfoModal,
  handleDeleteAluno,
}: Props) {
  const requisicoesFiltradas = useMemo(() => {
    return requisicoes
      .filter((req) => {
        if (statusFilter === "TODOS") return true;
        return req.status === statusFilter;
      })
      .sort((a, b) => a.discente.nome.localeCompare(b.discente.nome));
  }, [requisicoes, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:ring-[#008060] focus:border-[#008060] outline-none shadow-sm cursor-pointer"
          >
            <option value="TODOS">Todos os status</option>
            <option value="AGUARDANDO_ENVIO">Aguardando Envio</option>
            <option value="AGUARDANDO_ANALISE">Aguardando Análise</option>
            <option value="APROVADA">Aprovada</option>
            <option value="REPROVADO">Reprovada</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 shrink-0">
          <button
            onClick={() => alert("Fazer ainda.")}
            className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
            title="Baixa os documentos de todos os alunos agrupados por pasta"
          >
            <span className="material-symbols-outlined text-[18px]">
              folder_zip
            </span>{" "}
            Baixar Documentos (.ZIP)
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#008060] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#006048] transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>{" "}
            Adicionar Aluno
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">
            progress_activity
          </span>{" "}
          Carregando alunos...
        </p>
      ) : requisicoesFiltradas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {requisicoesFiltradas.map((req) => (
            <AlunoCard
              key={req.requisicaoId}
              req={req}
              submittingEval={submittingEval}
              openValidateModal={openValidateModal}
              openInfoModal={openInfoModal}
              handleDeleteAluno={handleDeleteAluno}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          {statusFilter === "TODOS"
            ? "Nenhum aluno inscrito nesta viagem ainda."
            : "Nenhum aluno encontrado para o status selecionado."}
        </div>
      )}
    </div>
  );
}
