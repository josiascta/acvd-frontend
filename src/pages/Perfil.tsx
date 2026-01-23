import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Perfil() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const matriculaSalva = localStorage.getItem("user_matricula_temp");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      setEmail(payload.email || "");
      setMatricula(matriculaSalva || "");
    } catch (error) {
      console.error("Erro ao processar dados locais:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fcfb]">
      <div className="animate-spin size-8 border-4 border-[#008060] border-t-transparent rounded-full"></div>
    </div>
  );

  const nomeUsuario = email ? email.split('@')[0].split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ') : "Estudante";

  return (
    <div className="min-h-screen bg-[#f8fcfb] text-slate-900 font-sans antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
       
        <section className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#008060]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-center gap-8 text-center md:text-left">
            
            {/* Falta colocar o lapis pra ficar melhor */}
            <div className="relative group cursor-pointer">
              <div className="size-28 md:size-32 rounded-full border-4 border-white shadow-lg bg-[#008060] flex items-center justify-center text-white text-4xl font-black">
                {email ? email[0].toUpperCase() : "?"}
              </div>
              <div className="absolute bottom-1 right-1 size-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-400 group-hover:text-[#008060] transition-colors border border-slate-100">
                <span className="material-symbols-outlined text-lg">edit</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                {nomeUsuario}
              </h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm max-w-2xl">
                <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail Acadêmico</span>
                  <span className="text-slate-700 font-bold truncate">{email || "—"}</span>
                </div>
                <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nº Matrícula</span>
                  <span className="text-slate-700 font-mono font-black text-base">{matricula || "Não informada"}</span>
                </div>
              </div>
            </div>

            {/* Configurações falta o icone */}
            <button 
              className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-100 hover:text-[#008060] transition-all border border-slate-100 shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">settings</span>
              <span className="uppercase tracking-widest">Configurações</span>
            </button>
          </div>
        </section>

       {/* REPOSITÓRIO DE falta ajustar*/}
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="size-2 bg-[#008060] rounded-full"></div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Repositório de Documentos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* RG - Falta mudar a cor e colocar o icone do Symbols*/}
            <div className="bg-white p-7 rounded-[2rem] border-2 border-emerald-50 shadow-lg shadow-emerald-50/50 relative overflow-hidden group flex flex-col justify-between min-h-[280px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full -mr-10 -mt-10"></div>
              
              <div>
                <div className="flex justify-between items-start mb-6 relative">
                  <span className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                    <span className="material-symbols-outlined text-2xl">badge</span>
                  </span>
                  <span className="text-emerald-600 font-black text-[10px] bg-emerald-100 px-3 py-1 rounded-full tracking-widest uppercase">Válido</span>
                </div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Identidade (RG)</h3>
                <p className="text-xs font-bold text-slate-400 mt-2">Documento verificado e arquivado.</p>
              </div>

              <button className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-100">
                Visualizar Documento
              </button>
            </div>

            {/* CPF - Falta mudar a cor DAVi */}
            <div className="bg-white p-7 rounded-[2rem] border-2 border-red-50 shadow-lg shadow-red-50/50 relative overflow-hidden group flex flex-col justify-between min-h-[280px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 rounded-bl-full -mr-10 -mt-10"></div>
              
              <div>
                <div className="flex justify-between items-start mb-6 relative">
                  <span className="p-3 bg-red-100 rounded-2xl text-red-600">
                    <span className="material-symbols-outlined text-2xl">article</span>
                  </span>
                  <span className="text-red-600 font-black text-[10px] bg-red-100 px-3 py-1 rounded-full tracking-widest uppercase">Pendente</span>
                </div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">CPF</h3>
                <p className="text-xs font-bold text-slate-400 mt-2">O envio deste documento é obrigatório.</p>
              </div>

              <button className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-colors shadow-md shadow-red-100">
                Enviar Agora
              </button>
            </div>

            {/* Residência Falta mudar a cor DAvi*/}
            <div className="bg-white p-7 rounded-[2rem] border-2 border-orange-50 shadow-lg shadow-orange-50/50 relative overflow-hidden group flex flex-col justify-between min-h-[280px]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-bl-full -mr-10 -mt-10"></div>
              
              <div>
                <div className="flex justify-between items-start mb-6 relative">
                  <span className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                    <span className="material-symbols-outlined text-2xl">home</span>
                  </span>
                  <span className="text-orange-600 font-black text-[10px] bg-orange-100 px-3 py-1 rounded-full tracking-widest uppercase">Expira em breve</span>
                </div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Residência</h3>
                <p className="text-xs font-bold text-slate-400 mt-2">Mantenha seu endereço atualizado.</p>
              </div>

              <button className="w-full mt-6 py-3 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-700 transition-colors shadow-md shadow-orange-100">
                Atualizar 
              </button>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}