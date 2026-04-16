import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  API_URL,
  getHeaders,
  handleViewDocument,
  handleDownloadDocument,
} from "../utils/api";
import type { ViagemDTO } from "../dtos/viagem";

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

  // Estados Modal de Validação (Substitui Aprovação/Reprovação rápida)
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [reqToValidate, setReqToValidate] =
    useState<RequisicaoDetalhesDTO | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [otherObservation, setOtherObservation] = useState("");

  const [submittingEval, setSubmittingEval] = useState(false);

  // Itens de validação POSITIVA (O que está correto) com suas mensagens de ERRO correspondentes
  const validationItems = [
    {
      id: "doc_discente",
      label: "Documento de identificação do discente correto e legível",
      errorMsg: "Documento de identificação do discente ilegível ou incorreto",
    },
    {
      id: "doc_responsavel",
      label: "Documento do responsável legal correto e legível",
      errorMsg: "Documento do responsável legal ilegível ou incorreto",
    },

    {
      id: "info_responsavel",
      label: "Informações do responsável legal consistentes e completas",
      errorMsg:
        "Informações do responsável legal estão divergentes ou incompletas",
    },
    {
      id: "dados_pessoais",
      label: "Dados pessoais do discente compatíveis com a documentação",
      errorMsg: "Dados pessoais do discente divergentes da documentação",
    },
    {
      id: "assinaturas",
      label: "Assinaturas e formatação dos documentos válidas",
      errorMsg:
        "Falta de assinatura ou formatação inválida nos documentos exigidos",
    },
    {
      id: "anexo_v",
      label: "Termo de Compromisso (Anexo V) preenchido corretamente",
      errorMsg:
        "Termo de Compromisso (Anexo V) ausente ou preenchido incorretamente",
    },
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

    const emails = addForm.emailDiscente
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email !== "");

    if (emails.length === 0) {
      alert("Por favor, insira pelo menos um e-mail válido.");
      setAddLoading(false);
      return;
    }

    try {
      const promises = emails.map(async (email) => {
        const payload = {
          emailDiscente: email,
          valorDiaria: 0,
          inscricaoValor: 0,
        };

        try {
          const res = await fetch(
            `${API_URL}/requisicoes/viagens/${id}/adicionar-discente/email`,
            {
              method: "POST",
              headers: getHeaders(),
              body: JSON.stringify(payload),
            },
          );

          if (!res.ok) {
            return { success: false, email };
          }
          return { success: true, email };
        } catch (error) {
          return { success: false, email };
        }
      });

      const results = await Promise.all(promises);

      const sucessos = results.filter((r) => r.success);
      const falhas = results.filter((r) => !r.success);

      if (falhas.length > 0) {
        const falhasEmails = falhas.map((f) => f.email).join("\n- ");
        alert(
          `Processo concluído com ressalvas:\n\n` +
            `${sucessos.length} aluno(s) adicionado(s) com sucesso.\n\n` +
            `Falha ao adicionar os seguintes e-mails:\n- ${falhasEmails}\n\n` +
            `Motivo provável: O aluno não possui cadastro no sistema ou já está na viagem.`,
        );
      }

      if (sucessos.length > 0 || falhas.length === 0) {
        setIsAddModalOpen(false);
        setAddForm({ emailDiscente: "" });
        fetchRequisicoes();
      }
    } catch (error) {
      alert("Falha inesperada ao tentar adicionar alunos.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDownloadAnexoI = async () => {
    // Busca o ID do anexo que foi salvo no localStorage após o preenchimento
    const anexoIId = localStorage.getItem(`anexoI_${id}`);

    if (!anexoIId) {
      alert("Você precisa preencher (Editar) o Anexo I antes de baixá-lo.");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/solicitacoes-coletivas/${anexoIId}/download`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      if (!res.ok) {
        throw new Error("Arquivo não encontrado no servidor.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Anexo_I_Viagem_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar Anexo I:", error);
      alert(
        "Falha ao baixar o Anexo I. Verifique se o documento já foi gerado.",
      );
    }
  };
  const handleDownloadAnexoIII = async () => {
    // Busca o ID do anexo que foi salvo no localStorage após o preenchimento
    const anexoIIIId = localStorage.getItem(`anexoIII_${id}`);

  if (!anexoIIIId) {
      alert("Você precisa preencher (Editar) o Anexo III antes de baixá-lo.");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/planejamento-atividade/${anexoIIIId}/download`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      if (!res.ok) {
        throw new Error("Arquivo não encontrado no servidor.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Anexo_III_Viagem_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar Anexo III:", error);
      alert(
        "Falha ao baixar o Anexo III. Verifique se o documento já foi gerado.",
      );
    }
  };


  // --- NOVA FUNÇÃO: Baixar PDF Anexo IV ---
  const handleDownloadAnexoIV = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/pdf/viagens/${id}/discentes-participantes`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      if (!res.ok) {
        throw new Error("Erro ao baixar o arquivo");
      }

      // Converte a resposta em um Blob (arquivo)
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Cria um link temporário para forçar o download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Anexo_IV_Discentes_Participantes_${id}.pdf`,
      );
      document.body.appendChild(link);
      link.click();

      // Limpeza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar Anexo IV:", error);
      alert(
        "Falha ao baixar o documento. Verifique se há alunos na viagem ou tente novamente mais tarde.",
      );
    }
  };

  const openValidateModal = (req: RequisicaoDetalhesDTO) => {
    setReqToValidate(req);
    setCheckedItems([]); // Inicia vazio para o professor fazer a checagem
    setOtherObservation("");
    setIsValidateModalOpen(true);
  };

  const handleSelectAll = () => {
    if (checkedItems.length === validationItems.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(validationItems.map((item) => item.id));
    }
  };

  const submitValidation = async () => {
    if (!reqToValidate) return;
    setSubmittingEval(true);

    const isAllChecked = checkedItems.length === validationItems.length;

    try {
      if (isAllChecked) {
        // APROVAR
        const res = await fetch(
          `${API_URL}/requisicoes/${reqToValidate.requisicaoId}/avaliar`,
          {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({
              status: "APROVADA",
              motivoReprovacao: null,
            }),
          },
        );
        if (!res.ok) throw new Error("Erro ao aprovar");
      } else {
        // REPROVAR
        // Identificar o que NÃO foi marcado para criar o motivo da reprovação
        const missingItems = validationItems.filter(
          (item) => !checkedItems.includes(item.id),
        );

        let finalMotivo = missingItems.map((item) => item.errorMsg).join(" | ");

        if (otherObservation.trim() !== "") {
          finalMotivo += finalMotivo
            ? ` | Outras observações: ${otherObservation.trim()}`
            : `Outras observações: ${otherObservation.trim()}`;
        }

        if (finalMotivo.trim() === "") {
          finalMotivo = "Documentação incompleta ou inválida.";
        }

        const res = await fetch(
          `${API_URL}/requisicoes/${reqToValidate.requisicaoId}/avaliar`,
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
      }

      setIsValidateModalOpen(false);
      setReqToValidate(null);
      fetchRequisicoes();
    } catch (err) {
      alert("Falha ao avaliar requisição.");
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

  // Filtragem e Ordenação Alfabética
  const requisicoesFiltradas = requisicoes
    .filter((req) => {
      if (statusFilter === "TODOS") return true;
      return req.status === statusFilter;
    })
    .sort((a, b) => a.discente.nome.localeCompare(b.discente.nome));

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
              className={`${
                activeTab === "DOCUMENTOS"
                  ? "border-[#008060] text-[#008060]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <span className="material-symbols-outlined text-[18px]">
                folder
              </span>{" "}
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
                  onClick={() => navigate(`/viagem/${id}/preencher-anexo-i`)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    edit
                  </span>
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
                  onClick={() => navigate(`/viagem/${id}/preencher-anexo-iii`)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    edit
                  </span>
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
                {/* --- BOTÃO ATUALIZADO PARA BAIXAR ANEXO IV --- */}
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

                      {/* 2. Central de Documentos (Nova Ordem) */}
                      <div className="flex flex-wrap items-start justify-center gap-6 bg-slate-50 px-5 py-3 rounded-lg border border-slate-100 min-w-fit">
                        {/* 2.1 Doc. do Estudante */}
                        <div className="flex flex-col items-center justify-between min-h-[44px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Doc. do Estudante
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
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium py-1">
                              Pendente
                            </span>
                          )}
                        </div>

                        {/* 2.2 Doc. Responsável legal */}
                        {menorDeIdade && (
                          <div className="flex flex-col items-center justify-between min-h-[44px] border-l border-slate-200 pl-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                              Doc. Responsável legal
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

                        {/* 2.3 ANEXO V */}
                        <div className="flex flex-col items-center justify-between min-h-[44px] border-l border-slate-200 pl-6">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            ANEXO V
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium py-1">
                            Pendente
                          </span>
                        </div>
                      </div>

                      {/* 3. Ações Rápidas (Botão Validar) */}
                      <div className="flex items-center justify-end gap-2 xl:border-l xl:border-slate-100 xl:pl-4">
                        <button
                          onClick={() => openValidateModal(req)}
                          disabled={submittingEval || isAguardandoEnvio}
                          title={
                            isAguardandoEnvio
                              ? "Aguardando envio do aluno"
                              : "Validar Documentação"
                          }
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-sm font-semibold border
                            ${
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
                          <span className="material-symbols-outlined text-[22px]">
                            info
                          </span>
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
                  E-mails dos Discentes (um por linha)
                </label>
                <textarea
                  required
                  rows={5}
                  value={addForm.emailDiscente}
                  onChange={(e) =>
                    setAddForm({ ...addForm, emailDiscente: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none transition-colors"
                  placeholder="aluno1@academico.ifpb.edu.br&#10;aluno2@academico.ifpb.edu.br&#10;aluno3@academico.ifpb.edu.br"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Cole os e-mails separados por quebra de linha.
                </p>
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
                    <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-700">
                          Nome:
                        </span>{" "}
                        {selectedReq.responsavelLegal.nome}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">
                          CPF:
                        </span>{" "}
                        {selectedReq.responsavelLegal.cpf}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">
                          Contato:
                        </span>{" "}
                        {selectedReq.responsavelLegal.contato}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">
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

      {/* --- MODAL: Validação (Aprovar/Reprovar Inteligente) --- */}
      {isValidateModalOpen && reqToValidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">
                  fact_check
                </span>
                Validar Documentação
              </h3>
              <button
                onClick={() => setIsValidateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-slate-600 mb-4">
                Marque os itens que estão <strong>corretos</strong> na
                documentação de <strong>{reqToValidate.discente.nome}</strong>.
              </p>

              <button
                onClick={handleSelectAll}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {checkedItems.length === validationItems.length
                    ? "deselect"
                    : "checklist"}
                </span>
                {checkedItems.length === validationItems.length
                  ? "Desmarcar todos"
                  : "Selecionar todos"}
              </button>

              <div className="space-y-3 mb-6">
                {validationItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      checked={checkedItems.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setCheckedItems([...checkedItems, item.id]);
                        else
                          setCheckedItems(
                            checkedItems.filter((id) => id !== item.id),
                          );
                      }}
                    />
                    <span
                      className={
                        checkedItems.includes(item.id)
                          ? "text-slate-900 font-medium"
                          : "text-slate-600"
                      }
                    >
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Só exibe o campo de observação extra se tiver alguma coisa desmarcada */}
              {checkedItems.length !== validationItems.length && (
                <div className="animate-fade-in border-t border-slate-100 pt-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Outras observações / Motivos de reprovação:
                  </label>
                  <textarea
                    rows={3}
                    value={otherObservation}
                    onChange={(e) => setOtherObservation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Se houver algo mais a corrigir além dos itens desmarcados acima, descreva aqui..."
                  />
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[16px]">
                      warning
                    </span>
                    A requisição será REPROVADA e o aluno receberá um aviso do
                    que precisa consertar.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
              <button
                onClick={() => setIsValidateModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={submitValidation}
                disabled={submittingEval}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2
                  ${
                    checkedItems.length === validationItems.length
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {submittingEval ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                ) : null}
                {checkedItems.length === validationItems.length
                  ? "Aprovar Requisição"
                  : "Reprovar Requisição"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
