import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  API_URL,
  getHeaders,
  handleViewDocument,
  handleDownloadDocument,
} from "../utils/api";

export function DetalhesViagem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"DOCUMENTOS" | "ALUNOS">("ALUNOS");
  const [viagem, setViagem] = useState<ViagemDTO | null>(null);

  const [requisicoes, setRequisicoes] = useState<RequisicaoDetalhesDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para o filtro de status
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");

  // Estados Modal Adicionar Aluno
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ emailDiscente: "" });
  const [addLoading, setAddLoading] = useState(false);

  // Estados Modal Info Completa
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RequisicaoDetalhesDTO | null>(
    null,
  );

  // Estados Modal Reprovação
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [reqToReject, setReqToReject] = useState<RequisicaoDetalhesDTO | null>(
    null,
  );
  const [rejectReasons, setRejectReasons] = useState<string[]>([]);
  const [otherRejectReason, setOtherRejectReason] = useState("");

  const [submittingEval, setSubmittingEval] = useState(false);

  const predefinedReasons = [
    "Documento de identificação do discente ilegível ou incorreto",
    "Termo de Compromisso (Anexo V) ausente ou preenchido incorretamente",
    "Documento de autorização/identificação do responsável legal ilegível ou incorreto",
    "Informações do responsável legal estão divergentes ou incompletas",
    "Dados pessoais do discente (nome, CPF, RG, etc.) divergentes da documentação",
    "Falta de assinatura ou formatação inválida nos documentos exigidos",
  ];

  useEffect(() => {
    fetchViagem();
    fetchRequisicoes();
  }, [id]);

  const fetchViagem = async () => {
    try {
      const res = await fetch(`${API_URL}/viagens/${id}`, {
        headers: getHeaders(),
      });
      if (res.ok) setViagem(await res.json());
    } catch (err) {
      console.error("Erro ao buscar viagem", err);
    }
  };

  const fetchRequisicoes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/requisicoes/viagens/${id}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const list: RequisicaoResumoDTO[] = await res.json();
        const detalhesPromises = list.map((req) =>
          fetch(`${API_URL}/requisicoes/${req.id}/detalhes`, {
            headers: getHeaders(),
          }).then((r) => (r.ok ? r.json() : null)),
        );
        const detalhadas = await Promise.all(detalhesPromises);
        setRequisicoes(detalhadas.filter((d) => d !== null));
      }
    } catch (err) {
      console.error("Erro ao buscar alunos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const payload = {
        emailDiscente: addForm.emailDiscente,
        valorDiaria: 0, // Removido do Front, enviado 0 para não quebrar API
        inscricaoValor: 0, // Removido do Front, enviado 0
      };

      const res = await fetch(
        `${API_URL}/requisicoes/viagens/${id}/adicionar-discente/email`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Erro ao adicionar aluno");

      setIsAddModalOpen(false);
      setAddForm({ emailDiscente: "" });
      fetchRequisicoes();
    } catch (error) {
      alert("Falha ao adicionar aluno. Verifique o e-mail.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleQuickApprove = async (requisicaoId: string) => {
    if (!window.confirm("Tem certeza que deseja APROVAR esta requisição?"))
      return;

    setSubmittingEval(true);
    try {
      const res = await fetch(
        `${API_URL}/requisicoes/${requisicaoId}/avaliar`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ status: "APROVADA", motivoReprovacao: null }),
        },
      );

      if (!res.ok) throw new Error("Erro ao aprovar");
      fetchRequisicoes();
    } catch (err) {
      alert("Falha ao aprovar requisição.");
    } finally {
      setSubmittingEval(false);
    }
  };

  const openRejectModal = (req: RequisicaoDetalhesDTO) => {
    setReqToReject(req);
    setRejectReasons([]);
    setOtherRejectReason("");
    setIsRejectModalOpen(true);
  };

  const submitReject = async () => {
    if (!reqToReject) return;

    let finalMotivo = rejectReasons.filter((r) => r !== "Outro").join(" | ");
    if (rejectReasons.includes("Outro") && otherRejectReason.trim() !== "") {
      finalMotivo += finalMotivo
        ? ` | Outro: ${otherRejectReason.trim()}`
        : `Outro: ${otherRejectReason.trim()}`;
    }

    if (finalMotivo.trim() === "") {
      alert("Por favor, selecione ou digite um motivo para a reprovação.");
      return;
    }

    setSubmittingEval(true);
    try {
      const res = await fetch(
        `${API_URL}/requisicoes/${reqToReject.requisicaoId}/avaliar`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            status: "REPROVADO",
            motivoReprovacao: finalMotivo,
          }),
        },
      );

      if (!res.ok) throw new Error("Erro ao reprovar");

      setIsRejectModalOpen(false);
      setReqToReject(null);
      fetchRequisicoes();
    } catch (err) {
      alert("Falha ao reprovar requisição.");
    } finally {
      setSubmittingEval(false);
    }
  };

  const openInfoModal = (req: RequisicaoDetalhesDTO) => {
    setSelectedReq(req);
    setIsInfoModalOpen(true);
  };

  const handleDeleteAluno = (reqId: string) => {
    alert("Fazer ainda.");
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

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return "Não informada";
    const [year, month, day] = dataStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
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

  const requisicoesFiltradas = requisicoes.filter((req) => {
    if (statusFilter === "TODOS") return true;
    return req.status === statusFilter;
  });

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

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("DOCUMENTOS")}
              className={`${activeTab === "DOCUMENTOS" ? "border-[#008060] text-[#008060]" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <span className="material-symbols-outlined text-[18px]">
                folder
              </span>{" "}
              Anexos da Viagem
            </button>
            <button
              onClick={() => setActiveTab("ALUNOS")}
              className={`${activeTab === "ALUNOS" ? "border-[#008060] text-[#008060]" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <span className="material-symbols-outlined text-[18px]">
                groups
              </span>{" "}
              Alunos
            </button>
          </nav>
        </div>

        {/* Tab Content: Documentos GERAIS da viagem */}
        {activeTab === "DOCUMENTOS" && (
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
                  onClick={() => alert("Em breve: Visualizar PDF")}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Visualizar"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    visibility
                  </span>
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
                  onClick={() => alert("Em breve: Visualizar PDF")}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Visualizar"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    visibility
                  </span>
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
                <span className="material-symbols-outlined text-emerald-500 text-3xl">
                  list_alt
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">ANEXO IV</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    DISCENTES PARTICIPANTES DA VISITA TÉCNICA/ATIVIDADE DE CAMPO
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Gerado automaticamente
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("Em breve: Visualizar PDF")}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Visualizar"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    visibility
                  </span>
                </button>
                <button
                  onClick={() => alert("Em breve: Baixar PDF")}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Baixar"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    download
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Alunos */}
        {activeTab === "ALUNOS" && (
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

              {/* Botões de Ação */}
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
                {requisicoesFiltradas.map((req) => {
                  const statusInfo = getStatusDisplay(req.status);
                  const menorDeIdade = isMenorDeIdade(
                    req.discente.dataNascimento,
                  );
                  const isAguardandoEnvio = req.status === "AGUARDANDO_ENVIO";

                  return (
                    <div
                      key={req.requisicaoId}
                      className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                    >
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
                            Identidade
                          </span>
                          {req.documentoDiscente ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  handleViewDocument(req.documentoDiscente!.id)
                                }
                                title="Visualizar"
                                className="text-blue-600 hover:bg-blue-100 p-1 rounded-md transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  visibility
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  handleDownloadDocument(
                                    req.documentoDiscente!.id,
                                    req.documentoDiscente!.nomeOriginal,
                                  )
                                }
                                title="Baixar"
                                className="text-blue-600 hover:bg-blue-100 p-1 rounded-md transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  download
                                </span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium py-1">
                              Pendente
                            </span>
                          )}
                        </div>

                        {/* Anexo V Padronizado */}
                        <div className="flex flex-col items-center justify-between min-h-[44px] border-l border-slate-200 pl-6">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Anexo V
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium py-1">
                            Pendente
                          </span>
                        </div>

                        {menorDeIdade && (
                          <div className="flex flex-col items-center justify-between min-h-[44px] border-l border-slate-200 pl-6">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                              Responsável legal
                            </span>
                            {req.responsavelLegal?.documento ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    handleViewDocument(
                                      req.responsavelLegal!.documento!.id,
                                    )
                                  }
                                  title="Visualizar"
                                  className="text-amber-600 hover:bg-amber-100 p-1 rounded-md transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    visibility
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownloadDocument(
                                      req.responsavelLegal!.documento!.id,
                                      req.responsavelLegal!.documento!
                                        .nomeOriginal,
                                    )
                                  }
                                  title="Baixar"
                                  className="text-amber-600 hover:bg-amber-100 p-1 rounded-md transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    download
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
                      </div>

                      {/* 3. Ações Rápidas */}
                      <div className="flex items-center justify-end gap-1 xl:border-l xl:border-slate-100 xl:pl-4">
                        <button
                          onClick={() => openRejectModal(req)}
                          disabled={submittingEval || isAguardandoEnvio}
                          title={
                            isAguardandoEnvio
                              ? "Aguardando envio do aluno"
                              : "Reprovar Requisição"
                          }
                          className={`p-2 rounded-full transition-all flex items-center justify-center 
                            ${
                              isAguardandoEnvio || submittingEval
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-red-500 hover:text-red-700 hover:bg-red-50"
                            }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            thumb_down
                          </span>
                        </button>

                        <button
                          onClick={() => handleQuickApprove(req.requisicaoId)}
                          disabled={submittingEval || isAguardandoEnvio}
                          title={
                            isAguardandoEnvio
                              ? "Aguardando envio do aluno"
                              : "Aprovar Requisição"
                          }
                          className={`p-2 rounded-full transition-all flex items-center justify-center 
                            ${
                              isAguardandoEnvio || submittingEval
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-green-500 hover:text-green-700 hover:bg-green-50"
                            }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            thumb_up
                          </span>
                        </button>

                        <button
                          onClick={() => openInfoModal(req)}
                          title="Informações Completas do Aluno"
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 ml-1 rounded-full transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            info
                          </span>
                        </button>

                        <button
                          onClick={() => handleDeleteAluno(req.requisicaoId)}
                          title="Remover Aluno da Viagem"
                          className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-2 ml-1 rounded-full transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[22px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                {statusFilter === "TODOS"
                  ? "Nenhum aluno inscrito nesta viagem ainda."
                  : "Nenhum aluno encontrado para o status selecionado."}
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAL: Adicionar Aluno --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                Adicionar Aluno
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddAluno} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  E-mail do Discente
                </label>
                <input
                  type="email"
                  required
                  value={addForm.emailDiscente}
                  onChange={(e) =>
                    setAddForm({ ...addForm, emailDiscente: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="aluno@academico.ifpb.edu.br"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#008060] hover:bg-[#006048] rounded-lg transition-colors flex items-center"
                >
                  {addLoading ? (
                    <span className="material-symbols-outlined animate-spin mr-1">
                      progress_activity
                    </span>
                  ) : null}{" "}
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Informações Completas --- */}
      {isInfoModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-full overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
              <h3 className="font-bold text-lg text-slate-800">
                Informações Complementares
              </h3>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <section>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Dados do Discente
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-700">Nome:</span>{" "}
                    {selectedReq.discente.nome}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Matrícula:
                    </span>{" "}
                    {selectedReq.discente.matricula}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      E-mail:
                    </span>{" "}
                    {selectedReq.discente.email}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Telefone:
                    </span>{" "}
                    {selectedReq.discente.telefone}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">CPF:</span>{" "}
                    {selectedReq.discente.cpf}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">RG:</span>{" "}
                    {selectedReq.discente.rg || "Não informado"}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Data de Nasc.:
                    </span>{" "}
                    {formatarData(selectedReq.discente.dataNascimento)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Curso:</span>{" "}
                    {selectedReq.discente.curso}
                  </div>
                </div>
              </section>

              {isMenorDeIdade(selectedReq.discente.dataNascimento) &&
                selectedReq.responsavelLegal && (
                  <section>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Responsável legal
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div>
                        <span className="font-semibold text-amber-800">
                          Nome:
                        </span>{" "}
                        {selectedReq.responsavelLegal.nome}
                      </div>
                      <div>
                        <span className="font-semibold text-amber-800">
                          CPF:
                        </span>{" "}
                        {selectedReq.responsavelLegal.cpf}
                      </div>
                      <div>
                        <span className="font-semibold text-amber-800">
                          Contato:
                        </span>{" "}
                        {selectedReq.responsavelLegal.contato}
                      </div>
                      <div>
                        <span className="font-semibold text-amber-800">
                          RG:
                        </span>{" "}
                        {selectedReq.responsavelLegal.rg}
                      </div>
                    </div>
                  </section>
                )}

              {selectedReq.contaBancaria && (
                <section>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Conta Bancária
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-700">
                        Banco:
                      </span>{" "}
                      {selectedReq.contaBancaria.banco}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Agência:
                      </span>{" "}
                      {selectedReq.contaBancaria.agencia}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Conta:
                      </span>{" "}
                      {selectedReq.contaBancaria.numero}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Operação:
                      </span>{" "}
                      {selectedReq.contaBancaria.operacao}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Reprovação --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-red-700 flex items-center gap-1">
                <span className="material-symbols-outlined">warning</span>{" "}
                Motivo da Reprovação
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4 font-medium">
                Selecione o que há de errado com a documentação do aluno:
              </p>

              <div className="space-y-3 mb-4">
                {predefinedReasons.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                      checked={rejectReasons.includes(reason)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setRejectReasons([...rejectReasons, reason]);
                        else
                          setRejectReasons(
                            rejectReasons.filter((r) => r !== reason),
                          );
                      }}
                    />
                    {reason}
                  </label>
                ))}

                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    checked={rejectReasons.includes("Outro")}
                    onChange={(e) => {
                      if (e.target.checked)
                        setRejectReasons([...rejectReasons, "Outro"]);
                      else
                        setRejectReasons(
                          rejectReasons.filter((r) => r !== "Outro"),
                        );
                    }}
                  />
                  Outro motivo
                </label>
              </div>

              {rejectReasons.includes("Outro") && (
                <textarea
                  rows={3}
                  value={otherRejectReason}
                  onChange={(e) => setOtherRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500 transition-all mb-4"
                  placeholder="Descreva o motivo da reprovação detalhadamente..."
                />
              )}

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 mt-2">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitReject}
                  disabled={submittingEval || rejectReasons.length === 0}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Confirmar Reprovação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
