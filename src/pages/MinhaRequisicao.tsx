import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";

export function MinhaRequisicao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Usamos o tipo Resumo pois pegaremos da lista de /minhas
  const [requisicao, setRequisicao] = useState<RequisicaoResumoDTO | null>(
    null,
  );

  useEffect(() => {
    const fetchMinhaRequisicao = async () => {
      try {
        // Aluno não pode acessar /detalhes, então buscamos em /minhas e filtramos pelo ID da URL
        const res = await fetch(`${API_URL}/requisicoes/minhas`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          const todasRequisicoes: RequisicaoResumoDTO[] = await res.json();
          const reqEncontrada = todasRequisicoes.find((req) => req.id === id);

          if (reqEncontrada) {
            setRequisicao(reqEncontrada);
          } else {
            console.error("Requisição não encontrada na lista do discente.");
          }
        }
      } catch (err) {
        console.error("Erro ao buscar a requisição", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMinhaRequisicao();
  }, [id]);

  const handleConfirmarRequisicao = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/requisicoes/${id}/enviar`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      if (!res.ok) {
        // Tenta capturar a mensagem de erro que vem da Exception do Spring (Ex: falta conta bancária)
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao enviar requisição");
      }

      // Atualiza o status local para mudar o botão imediatamente
      setRequisicao((prev) =>
        prev ? { ...prev, status: "AGUARDANDO_ANALISE" } : null,
      );
      alert("Requisição enviada com sucesso!");
    } catch (error: any) {
      alert(
        error.message ||
          "Falha ao enviar a requisição para análise. Verifique seus documentos e dados bancários no perfil.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const text = status.replace("_", " ");
    let colorClass = "bg-slate-50 text-slate-700 border-slate-200";

    if (status === "AGUARDANDO_ENVIO")
      colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "AGUARDANDO_ANALISE")
      colorClass = "bg-blue-50 text-blue-700 border-blue-200";
    if (status === "APROVADA")
      colorClass = "bg-green-50 text-green-700 border-green-200";
    if (status === "REPROVADO")
      colorClass = "bg-red-50 text-red-700 border-red-200";

    return { text, colorClass };
  };

  // Pode enviar se estiver aguardando envio OU se o professor tiver reprovado (para corrigir e reenviar)
  const podeEnviar =
    requisicao?.status === "AGUARDANDO_ENVIO" ||
    requisicao?.status === "REPROVADO";

  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Minha Requisição
            </h2>

            {/* Status Visual */}
            {requisicao && (
              <span
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusDisplay(requisicao.status).colorClass}`}
              >
                {getStatusDisplay(requisicao.status).text}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#008060]">
              progress_activity
            </span>
          </div>
        ) : !requisicao ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 text-center">
            <span className="material-symbols-outlined text-3xl mb-2">
              error
            </span>
            <p className="font-semibold">
              Requisição não encontrada ou você não tem permissão para vê-la.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Se houver motivo de reprovação, mostra para o aluno poder arrumar */}
            {requisicao.status === "REPROVADO" &&
              requisicao.motivoReprovacao && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <h4 className="font-bold text-red-800 text-sm flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-[18px]">
                      warning
                    </span>
                    Motivo da Reprovação
                  </h4>
                  <p className="text-sm text-red-700">
                    {requisicao.motivoReprovacao}
                  </p>
                  <p className="text-xs text-red-600 mt-2 italic">
                    Corrija as pendências no seu perfil e envie a requisição
                    novamente abaixo.
                  </p>
                </div>
              )}

            {/* Secão de Documentos (Vazia por enquanto) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[250px] flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">
                  folder
                </span>
                Documentos da Viagem
              </h3>

              <div className="flex-grow flex items-center justify-center text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 p-6">
                Espaço reservado para o envio de documentos da viagem (quando
                solicitado).
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleConfirmarRequisicao}
                disabled={submitting || !podeEnviar}
                className={`px-6 py-3 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 
                  ${
                    podeEnviar
                      ? "bg-[#008060] text-white hover:bg-[#006048] hover:shadow-md"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
              >
                {submitting && (
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                )}

                {podeEnviar
                  ? "Confirmar e Enviar Requisição"
                  : requisicao.status === "AGUARDANDO_ANALISE"
                    ? "Em Análise pelo Servidor"
                    : requisicao.status === "APROVADA"
                      ? "Requisição Aprovada"
                      : "Indisponível"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
