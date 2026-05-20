import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { formatarData } from "../../../utils/date";
import { handleViewDocument } from "../../../utils/api";
import { useDocumentoUsuario } from "../../../hooks/useDocumentoUsuario";
import type { UserResponse } from "../../../dtos/user";

interface UserProfileCardProps {
  session: UserResponse;
}

export function UserProfileCard({ session }: UserProfileCardProps) {
  const navigate = useNavigate();
  const fileInputUserRef = useRef<HTMLInputElement | null>(null);
  const {
    documentoUser,
    uploadingUserDoc,
    fetchDocumentoUser,
    handleUploadUserDoc,
  } = useDocumentoUsuario();

  useEffect(() => {
    fetchDocumentoUser();
  }, [fetchDocumentoUser]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUploadUserDoc(e.target.files[0]);
    }
    if (fileInputUserRef.current) fileInputUserRef.current.value = "";
  };

  return (
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
              <span>{session.nome ? session.nome[0].toUpperCase() : "?"}</span>
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
            {/* Componentizei visualmente os blocos de informação apenas com o map mental, mas mantive a estrutura */}
            <InfoBlock label="E-mail Acadêmico" value={session.email} />
            <InfoBlock
              label={session.role === "SERVIDOR" ? "SIAPE" : "Matrícula"}
              value={session.matricula || "Não Informado"}
              isMono
            />
            <InfoBlock label="RG" value={session.numeroRg || "Não Informado"} />
            <InfoBlock
              label="CPF"
              value={session.numeroCpf || "Não Informado"}
            />
            {session.role === "DISCENTE" && (
              <InfoBlock
                label="Data de Nascimento"
                value={formatarData(session.dataNascimento)}
              />
            )}
            {(session.role === "DISCENTE" || session.role === "SERVIDOR") && (
              <InfoBlock
                label="Telefone"
                value={session.telefone || "Não informado"}
              />
            )}
            {session.role === "DISCENTE" && (
              <InfoBlock 
                label="Turma / Período" 
                value={session.turmaPeriodo || "Não Informado"} 
              />
            )}

            {session.role === "DISCENTE" && (
              <div className="flex flex-col p-4 bg-[#008060]/5 rounded-2xl border border-[#008060]/10 sm:col-span-2">
                <span className="text-[10px] font-black text-[#008060]/60 uppercase tracking-widest mb-1">
                  Curso
                </span>
                <span className="text-[#008060] font-black uppercase tracking-tight">
                  {session.curso || "Não Informado"}
                </span>
              </div>
            )}
          </div>

          {/* Documento Embutido */}
          {session.role === "DISCENTE" && (
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
                      onChange={onFileChange}
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
          )}
        </div>
      </div>
    </section>
  );
}

// Sub-componente apenas para organizar os blocos
function InfoBlock({
  label,
  value,
  isMono = false,
}: {
  label: string;
  value: string;
  isMono?: boolean;
}) {
  return (
    <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </span>
      <span
        className={`text-slate-700 ${isMono ? "font-mono font-black text-base" : "font-bold truncate"}`}
      >
        {value}
      </span>
    </div>
  );
}
