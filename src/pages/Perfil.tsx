import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Tipagem dos documentos de acordo com o novo backend
interface DocumentoResponseDTO {
  id: string;
  nomeOriginal: string;
  tamanho: string;
  hash: string;
  dataUpload: string;
}

export function Perfil() {
  const navigate = useNavigate();
  const { session, isLoadingSession } = useAuth();

  // O backend agora devolve somente um documento principal do usuário
  const [documento, setDocumento] = useState<DocumentoResponseDTO | null>(null);
  const [uploading, setUploading] = useState<string | null>(null); // Controla qual doc está sendo enviado ("USER" ou "RESPONSAVEL")

  const fileInputUserRef = useRef<HTMLInputElement | null>(null);
  const fileInputRespRef = useRef<HTMLInputElement | null>(null);

  const API_URL = "http://localhost:8080";

  // Redirecionamento de segurança
  useEffect(() => {
    if (!isLoadingSession && !session) {
      navigate("/login");
    } else if (!isLoadingSession && session && !session.matricula) {
      navigate("/completar-perfil");
    }
  }, [isLoadingSession, session, navigate]);

  // Busca o documento assim que a sessão existir
  useEffect(() => {
    if (session) {
      fetchDocumento();
    }
  }, [session]);

  // --- FUNÇÕES DE INTEGRAÇÃO COM BACKEND ---

  const fetchDocumento = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/documentos`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          setDocumento(data);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar documento:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    tipo: "USER" | "RESPONSAVEL"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Para o documento do responsável apenas simulamos e esvaziamos o input (conforme pedido)
    if (tipo === "RESPONSAVEL") {
      alert("Aviso: Lógica de envio do documento do responsável ainda em desenvolvimento no backend.");
      if (fileInputRespRef.current) fileInputRespRef.current.value = "";
      return;
    }

    setUploading(tipo);
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Endpoint alterado, agora só recebe multipart param
      const response = await fetch(`${API_URL}/documentos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        await fetchDocumento(); // Atualiza a visualização com o documento salvo
      } else {
        alert("Erro ao enviar o documento. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro de conexão.");
    } finally {
      setUploading(null);
      if (fileInputUserRef.current) {
        fileInputUserRef.current.value = ""; // Limpa o input
      }
    }
  };

  const handleViewDocument = async (doc: DocumentoResponseDTO) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Modificado para o novo endpoint de download
      const response = await fetch(`${API_URL}/documentos/${doc.id}/download`, {
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
        {/* Card Principal de Perfil */}
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

        {/* Repositório de Documentos */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="size-2 bg-[#008060] rounded-full"></div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Repositório de Documentos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 1: Documento de Identificação do Usuário */}
            <div className={`bg-white p-7 rounded-[2rem] border-2 shadow-lg relative overflow-hidden group flex flex-col justify-between min-h-[280px] ${documento ? "border-emerald-50 shadow-emerald-50/50" : "border-red-50 shadow-red-50/50"}`}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-10 -mt-10 ${documento ? "bg-emerald-50/50" : "bg-red-50/50"}`}></div>

              <div>
                <div className="flex justify-between items-start mb-6 relative">
                  <span className={`p-3 rounded-2xl ${documento ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                    <span className="material-symbols-outlined text-2xl">
                      badge
                    </span>
                  </span>
                  <span className={`font-black text-[10px] px-3 py-1 rounded-full tracking-widest uppercase ${documento ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                    {documento ? "Válido" : "Pendente"}
                  </span>
                </div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                  Documento de Identificação
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-2">
                  Documento de identificação oficial do usuário (frente e verso).
                </p>
                {documento && (
                  <p className="text-[10px] text-slate-400 mt-1 truncate" title={documento.nomeOriginal}>
                    Arquivo: {documento.nomeOriginal}
                  </p>
                )}
              </div>

              <div className="mt-6">
                {documento ? (
                  <button
                    onClick={() => handleViewDocument(documento)}
                    className="w-full py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-colors shadow-md bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                  >
                    Visualizar Documento
                  </button>
                ) : (
                  <>
                    <input
                      type="file"
                      hidden
                      accept="application/pdf,image/*"
                      ref={fileInputUserRef}
                      onChange={(e) => handleFileUpload(e, "USER")}
                    />
                    <button
                      onClick={() => fileInputUserRef.current?.click()}
                      disabled={uploading === "USER"}
                      className={`w-full py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-colors shadow-md flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 shadow-red-100 ${uploading === "USER" ? "opacity-70 cursor-wait" : ""}`}
                    >
                      {uploading === "USER" ? "Enviando..." : "Enviar Agora"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* CARD 2: Documento de Identificação do Responsável */}
            <div className={`bg-white p-7 rounded-[2rem] border-2 shadow-lg relative overflow-hidden group flex flex-col justify-between min-h-[280px] border-red-50 shadow-red-50/50`}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-10 -mt-10 bg-red-50/50"></div>

              <div>
                <div className="flex justify-between items-start mb-6 relative">
                  <span className="p-3 rounded-2xl bg-red-100 text-red-600">
                    <span className="material-symbols-outlined text-2xl">
                      supervisor_account
                    </span>
                  </span>
                  <span className="font-black text-[10px] px-3 py-1 rounded-full tracking-widest uppercase bg-red-100 text-red-600">
                    Pendente
                  </span>
                </div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
                  Documento do Responsável
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-2">
                  Documento de identificação oficial do responsável legal.
                </p>
              </div>

              <div className="mt-6">
                <input
                  type="file"
                  hidden
                  accept="application/pdf,image/*"
                  ref={fileInputRespRef}
                  onChange={(e) => handleFileUpload(e, "RESPONSAVEL")}
                />
                <button
                  onClick={() => fileInputRespRef.current?.click()}
                  disabled={uploading === "RESPONSAVEL"}
                  className={`w-full py-3 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-colors shadow-md flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 shadow-red-100 ${uploading === "RESPONSAVEL" ? "opacity-70 cursor-wait" : ""}`}
                >
                  {uploading === "RESPONSAVEL" ? "Enviando..." : "Enviar Agora"}
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}