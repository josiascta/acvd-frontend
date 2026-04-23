import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useViagemDetalhes } from "../../hooks/useViagemDetalhes";
import { useViagemActions } from "../../hooks/useViagemActions";

import { TabsHeader } from "./components/TabsHeader";
import { DocumentosViagemTab } from "./components/DocumentosViagemTab";
import { AlunosViagemTab } from "./components/AlunosViagemTab";

import { AddAlunoModal } from "./modals/AddAlunoModal";
import { InfoModal } from "./modals/InfoModal";
import { ValidateRequisicaoModal } from "./modals/ValidateRequisicaoModal";

export function DetalhesViagem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"DOCUMENTOS" | "ALUNOS">("ALUNOS");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");

  // Hooks encapsulados
  const { viagem, requisicoes, loading, fetchRequisicoes } =
    useViagemDetalhes(id);
  const {
    addLoading,
    submittingEval,
    handleAddAlunoBase,
    submitValidationBase,
    handleDownloadAnexoI,
    handleDownloadAnexoIV,
    handleDownloadAnexoIII,
    handleDownloadAnexoVI,
    handleDeleteAluno,
  } = useViagemActions(id, fetchRequisicoes);

  // Estados dos Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInfoReq, setSelectedInfoReq] =
    useState<RequisicaoDetalhesDTO | null>(null);
  const [reqToValidate, setReqToValidate] =
    useState<RequisicaoDetalhesDTO | null>(null);

  const openInfoModal = (req: RequisicaoDetalhesDTO) => setSelectedInfoReq(req);
  const openValidateModal = (req: RequisicaoDetalhesDTO) =>
    setReqToValidate(req);

  const viagemFinalizada = () => {
    if (!viagem) return false;
    if (!viagem.dataRetorno) return false;
    const hoje = new Date();
    const dataRetorno = new Date(viagem.dataRetorno);
    return hoje > dataRetorno;
  };
  const isFinalizada = viagemFinalizada();

  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-[18px] mr-1">
              arrow_back
            </span>{" "}
            Voltar
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Detalhes da Viagem
          </h2>
          {viagem && (
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                location_on
              </span>
              {viagem.itinerarios?.[viagem.itinerarios.length - 1]?.local ||
                "Destino não informado"}
            </p>
          )}
        </div>

        {/* Tabs Controles */}
        <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content: Documentos GERAIS da viagem */}
        {activeTab === "DOCUMENTOS" && (
          <DocumentosViagemTab
            id={id}
            isFinalizada={isFinalizada}
            handleDownloadAnexoI={() =>
              handleDownloadAnexoI(viagem?.solicitacaoColetivaId)
            }
            handleDownloadAnexoIV={handleDownloadAnexoIV}
            handleDownloadAnexoIII={handleDownloadAnexoIII}
            handleDownloadAnexoVI={handleDownloadAnexoVI}
          />
        )}

        {/* Tab Content: Alunos */}
        {activeTab === "ALUNOS" && (
          <AlunosViagemTab
            requisicoes={requisicoes}
            loading={loading}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            setIsAddModalOpen={setIsAddModalOpen}
            submittingEval={submittingEval}
            openValidateModal={openValidateModal}
            openInfoModal={openInfoModal}
            handleDeleteAluno={handleDeleteAluno}
          />
        )}
      </main>

      {/* Modais */}
      {isAddModalOpen && (
        <AddAlunoModal
          handleAddAlunoBase={handleAddAlunoBase}
          addLoading={addLoading}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {selectedInfoReq && (
        <InfoModal
          selectedReq={selectedInfoReq}
          onClose={() => setSelectedInfoReq(null)}
        />
      )}

      {reqToValidate && (
        <ValidateRequisicaoModal
          reqToValidate={reqToValidate}
          submittingEval={submittingEval}
          submitValidationBase={submitValidationBase}
          onClose={() => setReqToValidate(null)}
        />
      )}
    </div>
  );
}
