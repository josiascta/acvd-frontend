import { useState, useEffect, useRef, type Key } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";
import toast from "react-hot-toast";

export function MinhaRequisicao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [dadosTemp, setDadosTemp] = useState({ nome: "", contato: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingTermo, setUploadingTermo] = useState(false);

  // O estado principal que guarda os dados da requisição
  const [requisicao, setRequisicao] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
            console.log(reqEncontrada)
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
    setShowConfirmSubmit(false);

    const toastId = toast.loading("Enviando documentos para análise...");

    try {
      const res = await fetch(`${API_URL}/requisicoes/${id}/enviar`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao enviar requisição.");
      }

      setRequisicao((prev: any) =>
        prev ? { ...prev, status: "AGUARDANDO_ANALISE" } : null,
      );

      toast.success("Documentos enviados com sucesso!", { id: toastId });
    } catch (error: any) {
      toast.error(
        error.message ||
          "Falha ao enviar a requisição para análise. Verifique se anexou todos os documentos.",
        { id: toastId },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadTermo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTermo(true);
    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading("Enviando Anexo V...");

    try {
      const res = await fetch(
        `${API_URL}/requisicoes/${id}/termo-responsabilidade`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      if (!res.ok)
        throw new Error("Erro ao fazer upload do termo de responsabilidade.");

      const docData = await res.json();

      setRequisicao((prev: any) =>
        prev ? { ...prev, termoResponsabilidade: docData } : null,
      );

      toast.success("Anexo V anexado com sucesso!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setUploadingTermo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleViewAnexoV = async () => {
    const toastId = toast.loading("Abrindo documento...");
    try {
      const res = await fetch(
        `${API_URL}/requisicoes/${id}/termo-responsabilidade/download`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (!res.ok) throw new Error("Erro ao visualizar o documento.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.dismiss(toastId); // Fecha o toast silenciosamente pois a nova aba já abriu
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
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

  const handleDownloadTermo = async (
    dados: RequisicaoResumoDTO,
    manual?: { nome: string; contato: string },
  ) => {
    const toastId = toast.loading("Gerando PDF do Anexo V...");
    try {
      const viagemId = dados.viagemId;
      const alunoId = dados.discenteId;

      if (!viagemId || !alunoId) {
        toast.error("Erro: Dados da viagem ou do discente não encontrados.", {
          id: toastId,
        });
        return;
      }

      let urlFetch = `${API_URL}/api/pdf/termo-responsabilidade/coletiva/${viagemId}/aluno/${alunoId}`;

      if (manual?.nome) {
        urlFetch += `?nomeResp=${encodeURIComponent(manual.nome)}&contatoResp=${encodeURIComponent(manual.contato)}`;
      }

      const response = await fetch(urlFetch, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          "Erro ao gerar o PDF. Verifique se os dados estão completos.",
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const nomeLimpo = dados.discenteNome?.replace(/\s+/g, "_") || "Termo";
      link.setAttribute("download", `Anexo_V_${nomeLimpo}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Download concluído com sucesso!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const confirmarESalvar = async () => {
    if (!dadosTemp.nome || !dadosTemp.contato) {
      toast.error("Por favor, preencha todos os campos do responsável.");
      return;
    }
    setShowModal(false);
    if (requisicao) {
      handleDownloadTermo(requisicao, dadosTemp);
    }
  };
  const ehMaiorDeIdade = () => {
  const usuario = JSON.parse(localStorage.getItem("user") || "{}");

  if (!usuario.dataNascimento) return false;

  const nascimento = new Date(usuario.dataNascimento);
  const hoje = new Date();

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade >= 18;
};

  const podeEnviar =
    requisicao?.status === "AGUARDANDO_ENVIO" ||
    requisicao?.status === "REPROVADO";

  // Verificamos de forma segura se o anexo V existe lendo o DTO do backend
  const temAnexo = !!requisicao?.termoResponsabilidade;

  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12 relative">
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
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Minha Requisição
              </h2>
              {requisicao && (
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  Total a Receber Estimado: R${" "}
                  {(
                    (requisicao.valorDiaria || 0) +
                    (requisicao.inscricaoValor || 0)
                  ).toFixed(2)}
                </p>
              )}
            </div>

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
              Requisição não encontrada ou você não tem permissão para a
              visualizar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requisicao.status === "REPROVADO" &&
              requisicao.motivoReprovacao && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                  <h4 className="font-bold text-red-800 text-sm flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-[18px]">
                      warning
                    </span>
                    Sua requisição foi reprovada pelos seguintes motivos:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-1 font-medium">
                    {requisicao.motivoReprovacao
                      .split(" | ")
                      .map((motivo: string, idx: Key | null | undefined) => (
                        <li key={idx}>{motivo.trim()}</li>
                      ))}
                  </ul>
                  <p className="text-xs text-red-600 mt-3 italic">
                    Corrija as pendências acima e envie seus documentos
                    novamente.
                  </p>
                </div>
              )}

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    folder
                  </span>
                  Documentos Exigidos
                </h3>
              </div>

              {podeEnviar && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6">
                  <h4 className="text-blue-800 font-bold text-sm mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">
                      help
                    </span>
                    Passo a passo para envio do Anexo V:
                  </h4>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1.5 ml-1">
                    <li>
                      Clique em <strong>"Baixar"</strong> para salvar o arquivo
                      PDF no seu computador (preencha os dados do responsável,
                      se solicitado).
                    </li>
                    <li>
                      Assine o documento digitalmente utilizando o site oficial
                      do <strong>gov.br</strong>, ou imprima e assine
                      manualmente.
                    </li>
                    <li>
                      Por fim, clique em <strong>"Enviar"</strong> para anexar o
                      documento <strong>válido e assinado</strong>.
                    </li>
                  </ol>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-3xl mt-0.5">
                      description
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800">ANEXO V</h4>
                        {temAnexo ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-green-100 text-green-700 border-green-200">
                            Anexado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-amber-100 text-amber-700 border-amber-200">
                            Pendente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium max-w-lg mt-0.5">
                        TERMO DE COMPROMISSO E RESPONSABILIDADE
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                  onClick={() => {
                        if (ehMaiorDeIdade()) {
                          setShowModal(true);
                        } else {
                          handleDownloadTermo(requisicao);
                        }
                      }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        download
                      </span>
                      Baixar
                    </button>

                    <input
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleUploadTermo}
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingTermo}
                      className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                    >
                      {uploadingTermo ? (
                        <span className="material-symbols-outlined animate-spin text-[18px]">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">
                          upload_file
                        </span>
                      )}
                      {temAnexo ? "Reenviar" : "Enviar"}
                    </button>

                    {temAnexo && (
                      <button
                        onClick={handleViewAnexoV}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center"
                        title="Visualizar documento anexado"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          visibility
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={submitting || !podeEnviar || !temAnexo}
                className={`px-6 py-3 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 
                  ${
                    podeEnviar && temAnexo
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
                  ? "Enviar Documentos"
                  : requisicao.status === "AGUARDANDO_ANALISE"
                    ? "Em Análise pelo Servidor"
                    : requisicao.status === "APROVADA"
                      ? "Requisição Aprovada"
                      : "Indisponível"}
              </button>
            </div>

            {/* MODAL DE DADOS DO RESPONSÁVEL */}
            {showModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">
                      family_restroom
                    </span>
                    Dados do Responsável
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Precisamos desses dados para preencher o **Anexo V** da sua
                    viagem antes de você poder baixar o PDF.
                  </p>

                  <div className="space-y-3">
                    <input
                      className="w-full p-2 text-sm border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Nome do Responsável"
                      onChange={(e) =>
                        setDadosTemp({ ...dadosTemp, nome: e.target.value })
                      }
                    />
                    <input
                      className="w-full p-2 text-sm border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Telefone/Contato"
                      onChange={(e) =>
                        setDadosTemp({ ...dadosTemp, contato: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmarESalvar}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors"
                    >
                      Salvar e Continuar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE ENVIO */}
            {showConfirmSubmit && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-amber-100 text-amber-600 p-3 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined text-3xl">
                        help
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Confirmar envio
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Você tem certeza que quer enviar seus documentos para
                        análise?
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 mb-6">
                    Certifique-se de que o <strong>Anexo V</strong> foi assinado
                    pelo gov.br e anexado corretamente. Após o envio, você não
                    poderá alterar os arquivos até o servidor responder.
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowConfirmSubmit(false)}
                      className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmarRequisicao}
                      className="px-5 py-2.5 text-sm bg-[#008060] hover:bg-[#006048] text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
                    >
                      Sim, enviar documentos
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}