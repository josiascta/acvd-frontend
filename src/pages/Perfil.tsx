import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// --- TIPAGENS ---
interface DocumentoResponseDTO {
  id: string;
  nomeOriginal: string;
  tamanho: string;
  hash: string;
  dataUpload: string;
}

interface ContaBancariaDTO {
  id?: string;
  banco: string;
  numero: string;
  agencia: string;
  operacao: string;
}

interface ResponsavelLegalDTO {
  id?: string;
  nome: string;
  cpf: string;
  rg: string;
  contato: string;
  documento?: DocumentoResponseDTO;
}

function isMenorDeIdade(dataNascimento?: string): boolean {
  if (!dataNascimento) return false;
  const birthDate = new Date(dataNascimento);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 18;
}

export function Perfil() {
  const navigate = useNavigate();
  const { session, isLoadingSession } = useAuth();
  const API_URL = "http://localhost:8080";

  // --- ESTADOS ---
  const [documentoUser, setDocumentoUser] =
    useState<DocumentoResponseDTO | null>(null);
  const [uploadingUserDoc, setUploadingUserDoc] = useState(false);

  // Conta Bancária
  const [contaBancaria, setContaBancaria] = useState<ContaBancariaDTO | null>(
    null,
  );
  const [isEditingConta, setIsEditingConta] = useState(false);
  const [formConta, setFormConta] = useState<ContaBancariaDTO>({
    banco: "",
    agencia: "",
    numero: "",
    operacao: "",
  });

  // Responsável Legal
  const [responsavel, setResponsavel] = useState<ResponsavelLegalDTO | null>(
    null,
  );
  const [isEditingResp, setIsEditingResp] = useState(false);
  const [formResp, setFormResp] = useState<ResponsavelLegalDTO>({
    nome: "",
    cpf: "",
    rg: "",
    contato: "",
  });
  const [uploadingRespDoc, setUploadingRespDoc] = useState(false);

  const fileInputUserRef = useRef<HTMLInputElement | null>(null);
  const fileInputRespRef = useRef<HTMLInputElement | null>(null);

  const isMenor = isMenorDeIdade(session?.dataNascimento);

  // --- EFEITOS ---
  useEffect(() => {
    if (!isLoadingSession && !session) {
      navigate("/login");
    } else if (!isLoadingSession && session && !session.matricula) {
      navigate("/completar-perfil");
    }
  }, [isLoadingSession, session, navigate]);

  useEffect(() => {
    if (session) {
      fetchDocumentoUser();
      fetchContaBancaria();
      if (isMenor) {
        fetchResponsavel();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isMenor]);

  // --- FETCHERS ---
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchDocumentoUser = async () => {
    try {
      const res = await fetch(`${API_URL}/documentos`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) setDocumentoUser(data);
      }
    } catch (e) {
      console.error("Erro ao buscar documento do usuário", e);
    }
  };

  const fetchContaBancaria = async () => {
    try {
      const res = await fetch(`${API_URL}/users/me/conta-bancaria`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        // Se a API retornar 200 OK, tenta ler o JSON
        const data = await res.json();
        // Checagem de segurança caso retorne um objeto vazio
        if (data && data.banco) {
          setContaBancaria(data);
          setFormConta(data);
        }
      }
    } catch (e) {
      console.error("Usuário ainda não possui conta bancária cadastrada.", e);
    }
  };

  const fetchResponsavel = async () => {
    try {
      const res = await fetch(`${API_URL}/users/me/responsavel-legal`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.nome) {
          setResponsavel(data);
          setFormResp(data);
        }
      }
    } catch (e) {
      console.error(
        "Usuário ainda não possui responsável legal cadastrado.",
        e,
      );
    }
  };

  // --- HANDLERS CONTA BANCÁRIA ---
  const handleSalvarConta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users/me/conta-bancaria`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(formConta),
      });
      if (res.ok) {
        const data = await res.json();
        setContaBancaria(data);
        setIsEditingConta(false);
      } else {
        alert("Erro ao salvar conta bancária.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  // --- HANDLERS RESPONSÁVEL ---
  const handleSalvarResponsavel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users/me/responsavel-legal`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(formResp),
      });
      if (res.ok) {
        const data = await res.json();
        setResponsavel(data);
        setIsEditingResp(false);
      } else {
        alert("Erro ao salvar responsável.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  const handleUploadDocResp = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingRespDoc(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${API_URL}/users/me/responsavel-legal/documento`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        },
      );
      if (res.ok) {
        await fetchResponsavel();
      } else {
        alert(
          "Erro ao enviar o documento do responsável. Verifique se os dados já foram salvos.",
        );
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setUploadingRespDoc(false);
      if (fileInputRespRef.current) fileInputRespRef.current.value = "";
    }
  };

  // --- HANDLERS DOCUMENTO USUÁRIO ---
  const handleUploadUserDoc = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingUserDoc(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/documentos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (res.ok) await fetchDocumentoUser();
      else alert("Erro ao enviar o documento.");
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setUploadingUserDoc(false);
      if (fileInputUserRef.current) fileInputUserRef.current.value = "";
    }
  };

  const handleViewDocument = async (docId: string) => {
    try {
      const res = await fetch(`${API_URL}/documentos/${docId}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        window.open(window.URL.createObjectURL(blob), "_blank");
      } else alert("Não foi possível abrir o documento.");
    } catch (error) {
      console.error(error);
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
      return new Date(
        dataString.split("T")[0] + "T12:00:00",
      ).toLocaleDateString("pt-BR");
    } catch {
      return "Data Inválida";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fcfb] text-slate-900 font-sans antialiased pb-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* CARD PRINCIPAL: PERFIL + DOCUMENTO DO USUÁRIO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#008060]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative flex flex-col md:flex-row items-start gap-8">
            {/* Foto */}
            <div className="relative group cursor-pointer self-center md:self-start shrink-0">
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
            </div>

            {/* Dados do Usuário */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Telefone
                  </span>
                  <span className="text-slate-700 font-bold">
                    {session.telefone || "Não informado"}
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

              {/* Documento Embutido */}
              <div
                className={`mt-6 p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${documentoUser ? "bg-emerald-50/50 border-emerald-100" : "bg-orange-50/50 border-orange-100"}`}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${documentoUser ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}
                  >
                    <span className="material-symbols-outlined">
                      {documentoUser ? "check_circle" : "warning"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-800 uppercase tracking-tight">
                      Documento Oficial (Frente/Verso)
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      {documentoUser
                        ? documentoUser.nomeOriginal
                        : "Nenhum documento anexado."}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex-shrink-0">
                  {documentoUser ? (
                    <button
                      onClick={() => handleViewDocument(documentoUser.id)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors shadow-md shadow-emerald-600/20"
                    >
                      Visualizar
                    </button>
                  ) : (
                    <>
                      <input
                        type="file"
                        hidden
                        accept="application/pdf,image/*"
                        ref={fileInputUserRef}
                        onChange={handleUploadUserDoc}
                      />
                      <button
                        onClick={() => fileInputUserRef.current?.click()}
                        disabled={uploadingUserDoc}
                        className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors shadow-md shadow-orange-600/20 disabled:opacity-50"
                      >
                        {uploadingUserDoc ? "Enviando..." : "Anexar Documento"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEÇÃO: CONTA BANCÁRIA */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#008060] bg-[#008060]/10 p-2 rounded-lg">
                account_balance
              </span>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Dados Bancários
              </h2>
            </div>
            {contaBancaria && !isEditingConta && (
              <button
                onClick={() => setIsEditingConta(true)}
                className="text-xs font-bold text-[#008060] uppercase tracking-widest hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {!contaBancaria && !isEditingConta ? (
            <button
              onClick={() => setIsEditingConta(true)}
              className="w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-[#008060] hover:text-[#008060] transition-colors cursor-pointer group"
            >
              <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">
                add_circle
              </span>
              <span className="text-sm font-bold uppercase tracking-widest">
                Adicionar Conta Bancária
              </span>
            </button>
          ) : isEditingConta ? (
            <form
              onSubmit={handleSalvarConta}
              className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Banco
                  </label>
                  <input
                    required
                    value={formConta.banco}
                    onChange={(e) =>
                      setFormConta({ ...formConta, banco: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] font-bold text-slate-700"
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Agência
                  </label>
                  <input
                    required
                    value={formConta.agencia}
                    onChange={(e) =>
                      setFormConta({ ...formConta, agencia: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] font-bold text-slate-700"
                    placeholder="Ex: 0000-0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Número da Conta
                  </label>
                  <input
                    required
                    value={formConta.numero}
                    onChange={(e) =>
                      setFormConta({ ...formConta, numero: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] font-bold text-slate-700"
                    placeholder="Ex: 00000-0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Operação
                  </label>
                  <input
                    required
                    value={formConta.operacao}
                    onChange={(e) =>
                      setFormConta({ ...formConta, operacao: e.target.value })
                    }
                    className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] font-bold text-slate-700"
                    placeholder="Ex: Conta Corrente (001)"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#008060] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#00664d] transition-colors"
                >
                  Salvar Conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingConta(false);
                    setFormConta(
                      contaBancaria || {
                        banco: "",
                        agencia: "",
                        numero: "",
                        operacao: "",
                      },
                    );
                  }}
                  className="px-6 py-2.5 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Banco
                </span>
                <span className="font-bold text-slate-700">
                  {contaBancaria?.banco}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Agência
                </span>
                <span className="font-bold text-slate-700">
                  {contaBancaria?.agencia}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Conta
                </span>
                <span className="font-bold text-slate-700">
                  {contaBancaria?.numero}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Operação
                </span>
                <span className="font-bold text-slate-700">
                  {contaBancaria?.operacao}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* SEÇÃO: RESPONSÁVEL LEGAL (Exibida apenas se for menor de idade) */}
        {isMenor && (
          <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600 bg-indigo-600/10 p-2 rounded-lg">
                  supervisor_account
                </span>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  Responsável Legal
                </h2>
              </div>
              {responsavel && !isEditingResp && (
                <button
                  onClick={() => setIsEditingResp(true)}
                  className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  Editar
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium mb-6">
              Como você é menor de idade, é obrigatório preencher os dados do
              seu responsável legal.
            </p>

            {!responsavel && !isEditingResp ? (
              <button
                onClick={() => setIsEditingResp(true)}
                className="w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-600 hover:text-indigo-600 transition-colors cursor-pointer group"
              >
                <span className="material-symbols-outlined text-3xl mb-2 group-hover:scale-110 transition-transform">
                  person_add
                </span>
                <span className="text-sm font-bold uppercase tracking-widest">
                  Adicionar Responsável
                </span>
              </button>
            ) : isEditingResp ? (
              <form
                onSubmit={handleSalvarResponsavel}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Nome Completo
                    </label>
                    <input
                      required
                      value={formResp.nome}
                      onChange={(e) =>
                        setFormResp({ ...formResp, nome: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      CPF
                    </label>
                    <input
                      required
                      value={formResp.cpf}
                      onChange={(e) =>
                        setFormResp({ ...formResp, cpf: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      RG
                    </label>
                    <input
                      required
                      value={formResp.rg}
                      onChange={(e) =>
                        setFormResp({ ...formResp, rg: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-700"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Contato (Telefone/Celular)
                    </label>
                    <input
                      required
                      value={formResp.contato}
                      onChange={(e) =>
                        setFormResp({ ...formResp, contato: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Salvar Dados
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingResp(false);
                      setFormResp(
                        responsavel || {
                          nome: "",
                          cpf: "",
                          rg: "",
                          contato: "",
                        },
                      );
                    }}
                    className="px-6 py-2.5 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Nome Completo
                    </span>
                    <span className="font-bold text-slate-700">
                      {responsavel?.nome}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      CPF
                    </span>
                    <span className="font-bold text-slate-700">
                      {responsavel?.cpf}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      RG
                    </span>
                    <span className="font-bold text-slate-700">
                      {responsavel?.rg}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Contato
                    </span>
                    <span className="font-bold text-slate-700">
                      {responsavel?.contato}
                    </span>
                  </div>
                </div>

                {/* Documento do Responsável */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${responsavel?.documento ? "bg-indigo-50/50 border-indigo-100" : "bg-red-50/50 border-red-100"}`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${responsavel?.documento ? "bg-indigo-100 text-indigo-600" : "bg-red-100 text-red-600"}`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {responsavel?.documento ? "description" : "warning"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-black text-xs text-slate-800 uppercase tracking-tight">
                        Cópia do Documento Oficial
                      </h3>
                      <p className="text-[10px] font-medium text-slate-500">
                        {responsavel?.documento
                          ? responsavel.documento.nomeOriginal
                          : "Pendente envio."}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex-shrink-0">
                    {responsavel?.documento ? (
                      <button
                        onClick={() =>
                          handleViewDocument(responsavel.documento!.id)
                        }
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-sm shadow-indigo-600/20"
                      >
                        Visualizar
                      </button>
                    ) : (
                      <>
                        <input
                          type="file"
                          hidden
                          accept="application/pdf,image/*"
                          ref={fileInputRespRef}
                          onChange={handleUploadDocResp}
                        />
                        <button
                          onClick={() => fileInputRespRef.current?.click()}
                          disabled={uploadingRespDoc}
                          className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-sm shadow-red-600/20 disabled:opacity-50"
                        >
                          {uploadingRespDoc ? "Enviando..." : "Anexar Doc"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
