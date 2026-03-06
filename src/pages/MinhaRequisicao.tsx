import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";

export function MinhaRequisicao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requisicao, setRequisicao] = useState<RequisicaoResumoDTO | null>(
    null,
  );

  useEffect(() => {
    const fetchMinhaRequisicao = async () => {
      try {
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
        console.error("Erro ao procurar a requisição", err);
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
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao enviar requisição");
      }

      setRequisicao((prev) =>
        prev ? { ...prev, status: "AGUARDANDO_ANALISE" } : null,
      );
      alert("Requisição enviada com sucesso!");
    } catch (error: any) {
      alert(
        error.message ||
          "Falha ao enviar a requisição para análise. Verifique os seus documentos e dados bancários no perfil.",
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

  const podeEnviar =
    requisicao?.status === "AGUARDANDO_ENVIO" ||
    requisicao?.status === "REPROVADO";

  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
              Requisição não encontrada ou não tens permissão para a visualizar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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
                    Corrija as pendências e envie a requisição novamente abaixo.
                  </p>
                </div>
              )}

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[250px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    folder
                  </span>
                  Documentos Exigidos
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 text-3xl mt-0.5">
                      description
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-red-900">ANEXO V</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-red-100 text-red-700 border-red-200">
                          Pendente
                        </span>
                      </div>
                      <p className="text-xs text-red-800 font-medium max-w-lg mt-0.5">
                        TERMO DE RESPONSABILIDADE E AUTORIZAÇÃO/CIÊNCIA
                      </p>
                      <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          error
                        </span>
                        Aviso: Enviar anexo assinado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        alert("Em breve: Visualizar PDF em branco")
                      }
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                      title="Visualizar modelo"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        alert("Em breve: Formulário de preenchimento online")
                      }
                      className="px-3 py-1.5 bg-white border border-red-200 text-red-700 font-semibold text-xs rounded-md hover:bg-red-100 transition-colors whitespace-nowrap shadow-sm"
                    >
                      Preencher online
                    </button>

                    <button
                      onClick={() =>
                        alert("Em breve: Upload do documento assinado.")
                      }
                      className="flex items-center gap-1 ml-1 px-3 py-1.5 bg-red-600 text-white font-semibold text-xs rounded-md hover:bg-red-700 transition-colors shadow-sm"
                      title="Fazer upload do anexo assinado"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        upload_file
                      </span>
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
