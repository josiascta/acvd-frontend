import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Tipagem dos documentos vindos do Backend
interface DocumentoResponseDTO {
  id: string;
  nomeOriginal: string;
  tipo: string; // "RG", "CPF", "RESIDENCIA"
  caminhoDoArquivo: string;
}

// Configuração dos tipos de documentos esperados
const TIPOS_DOCS = {
  RG: {
    label: "Identidade (RG)",
    icon: "badge",
    description: "Documento de identificação oficial.",
  },
  CPF: {
    label: "CPF",
    icon: "article",
    description: "Cadastro de Pessoa Física.",
  },
  RESIDENCIA: {
    label: "Residência",
    icon: "home",
    description: "Comprovante de residência atualizado.",
  },
};

export function Perfil() {
  const navigate = useNavigate();
  const { session, isLoadingSession } = useAuth();

  // Estados para gerenciar os documentos
  const [documentos, setDocumentos] = useState<DocumentoResponseDTO[]>([]);
  const [uploading, setUploading] = useState<string | null>(null); // Controla qual doc está sendo enviado
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const API_URL = "http://localhost:8080";

  // Redirecionamento de segurança (mantido da sua versão)
  useEffect(() => {
    if (!isLoadingSession && !session) {
      navigate("/login");
    } else if (!isLoadingSession && session && !session.matricula) {
      navigate("/completar-perfil");
    }
  }, [isLoadingSession, session, navigate]);

  // Busca documentos assim que a sessão existir
  useEffect(() => {
    if (session) {
      fetchDocumentos();
    }
  }, [session]);

  // --- FUNÇÕES DE INTEGRAÇÃO COM BACKEND ---

  const fetchDocumentos = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/documentos`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    tipo: string,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(tipo);
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", tipo);

    try {
      const response = await fetch(`${API_URL}/documentos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        await fetchDocumentos(); // Atualiza a lista
      } else {
        alert("Erro ao enviar o documento. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro de conexão.");
    } finally {
      setUploading(null);
      if (fileInputRefs.current[tipo]) {
        fileInputRefs.current[tipo]!.value = ""; // Limpa o input
      }
    }
  };

  const handleViewDocument = async (doc: DocumentoResponseDTO) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/documentos/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        alert("Não foi possível abrir o documento.");
      }
    } catch (error) {
      console.error("Erro ao visualizar:", error);
    }
  };

  // --- RENDERIZAÇÃO ---

  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fcfb]">
        <div className="animate-spin size-8 border-4 border-[#008060] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) return null;

  const formatarData = (dataString: string | undefined | null) => {
    if (!dataString) return "Não Informado";
    try {
      const dataApenas = dataString.split("T")[0];
      return new Date(dataApenas + "T12:00:00").toLocaleDateString("pt-BR");
    } catch {
      return "Data Inválida";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fcfb] text-slate-900 font-sans antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Card Principal de Perfil (Mantido igual ao seu código) */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#008060]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative flex flex-col md:flex-row items-start gap-8">
            {/* Foto com Lápis */}
            <div className="relative group cursor-pointer self-center md:self-start">
              <div className="size-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#008060] flex items-center justify-center text-white text-4xl font-black">
                {session.fotoDePerfil ? (
                  <img
                    src={session.fotoDePerfil}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {session.nome ? session.nome[0].toUpperCase() : "?"}
                  </span>
                )}
              </div>
              <div className="absolute bottom-1 right-1 size-9 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 group-hover:text-[#008060] transition-colors border border-slate-100">
                <span className="material-symbols-outlined text-xl">edit</span>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {session.nome || "Estudante"}
                </h1>
                <button
                  onClick={() => navigate("/completar-perfil")}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-100 hover:text-[#008060] transition-all border border-slate-100 uppercase tracking-widest shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">
                    settings
                  </span>
                  Configurações
                </button>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm max-w-3xl">
                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    E-mail Acadêmico
                  </span>
                  <span className="text-slate-700 font-bold truncate">
                    {session.email}
                  </span>
                </div>

                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Nº Matrícula
                  </span>
                  <span className="text-slate-700 font-mono font-black text-base">
                    {session.matricula || "Não Informado"}
                  </span>
                </div>

                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    RG
                  </span>
                  <span className="text-slate-700 font-bold">
                    {session.numeroRg || "Não Informado"}
                  </span>
                </div>

                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    CPF
                  </span>
                  <span className="text-slate-700 font-bold">
                    {session.numeroCpf || "Não Informado"}
                  </span>
                </div>

                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Data de Nascimento
                  </span>
                  <span className="text-slate-700 font-bold">
                    {formatarData(session.dataNascimento)}
                  </span>
                </div>

                <div className="flex flex-col p-4 bg-[#008060]/5 rounded-2xl border border-[#008060]/10 sm:col-span-2">
                  <span className="text-[10px] font-black text-[#008060]/60 uppercase tracking-widest mb-1">
                    Curso
                  </span>
                  <span className="text-[#008060] font-black uppercase tracking-tight">
                    {session.curso || "Não Informado"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Repositório de Documentos Atualizado */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="size-2 bg-[#008060] rounded-full"></div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Repositório de Documentos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loop Dinâmico para RG, CPF, Residência */}
            {Object.entries(TIPOS_DOCS).map(([key, config]) => {
              const doc = documentos.find((d) => d.tipo === key);
              const estaOk = !!doc;
              const estaEnviando = uploading === key;

              // Definição de Cores: Verde (Emerald) se OK, Vermelho (Red) se Pendente
              const corBase = estaOk ? "emerald" : "red";
              const classeBorda = estaOk
                ? "border-emerald-50 shadow-emerald-50/50"
                : "border-red-50 shadow-red-50/50";
              const classeIconeBg = estaOk
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-600";
              const classeBadge = estaOk
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-600";
              const classeBotao = estaOk
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                : "bg-red-600 hover:bg-red-700 shadow-red-100";
              const bgBlob = estaOk ? "bg-emerald-50/50" : "bg-red-50/50";

              return (
                <div
                  key={key}
                  className={`bg-white p-7 rounded-[2rem] border-2 shadow-lg relative overflow-hidden group flex flex-col justify-between min-h-[280px] ${classeBorda}`}
                >
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-10 -mt-10 ${bgBlob}`}
                  ></div>

                  <div>
                    <div className="flex justify-between items-start mb-6 relative">
                      <span className={`p-3 rounded-2xl ${classeIconeBg}`}>
                        <span className="material-symbols-outlined text-2xl">
                          {config.icon}
                        </span>
                      </span>
                      <span
                        className={`font-black text-[10px] px-3 py-1 rounded-full tracking-widest uppercase ${classeBadge}`}
                      >
                        {estaOk ? "Válido" : "Pendente"}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                      {config.label}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">
                      {config.description}
                    </p>
                    {estaOk && (
                      <p
                        className="text-[10px] text-slate-400 mt-1 truncate"
                        title={doc.nomeOriginal}
                      >
                        Arquivo: {doc.nomeOriginal}
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    {estaOk ? (
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className={`w-full py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-colors shadow-md ${classeBotao}`}
                      >
                        Visualizar Documento
                      </button>
                    ) : (
                      <>
                        <input
                          type="file"
                          hidden
                          accept="application/pdf,image/*"
                          ref={(el) => {
                            fileInputRefs.current[key] = el;
                          }}
                          onChange={(e) => handleFileUpload(e, key)}
                        />
                        <button
                          onClick={() => fileInputRefs.current[key]?.click()}
                          disabled={!!uploading}
                          className={`w-full py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-colors shadow-md flex justify-center items-center gap-2 ${classeBotao} ${!!uploading ? "opacity-70 cursor-wait" : ""}`}
                        >
                          {estaEnviando ? "Enviando..." : "Enviar Agora"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
