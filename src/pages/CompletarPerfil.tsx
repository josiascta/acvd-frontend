import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function CompletarPerfil() {
  const navigate = useNavigate();
  const { save, session } = useAuth();
  
  const [formData, setFormData] = useState({
    rg: "",
    cpf: "",
    matricula: "",
    curso: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!session) return;

  try {
    const token = localStorage.getItem("token");


    const response = await fetch("/api/users/me", {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        matricula: formData.matricula,
        // Falta colocar aqui o rg,cpf e curso quando o back aceitar
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar dados no servidor");
    }

   
    const updatedUser = {
      ...session,
      matricula: formData.matricula,
    };
    
    save(updatedUser); 

    // 3. Feedback e Redirecionamento
    alert("Dados salvos com sucesso!");
    navigate("/perfil");

  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Falha ao salvar os dados. Verifique sua conexão ou o servidor.");
  }
};
  return (
    <div className="min-h-screen bg-[#f8fcfb] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="size-16 bg-[#008060]/10 rounded-2xl flex items-center justify-center text-[#008060] mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Completar Perfil</h1>
          <p className="text-slate-500 text-sm font-medium mt-2">Precisamos de mais alguns dados para o seu acesso acadêmico.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RG</label>
            <input required className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-bold text-slate-700" 
              placeholder="00.000.000-0" onChange={(e) => setFormData({...formData, rg: e.target.value})} />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
            <input required className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-bold text-slate-700" 
              placeholder="000.000.000-00" onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Matrícula</label>
            <input required className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-mono font-bold text-slate-700" 
              placeholder="Ex: 2024101010" onChange={(e) => setFormData({...formData, matricula: e.target.value})} />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Curso</label>
            <select required className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-bold text-slate-700 appearance-none" 
              onChange={(e) => setFormData({...formData, curso: e.target.value})}>
              <option value="">Selecione seu curso</option>
              <option value="Sistemas de Informação">Análise e Desenvolvimento de Sistemas</option>
              <option value="Direito">Engenharia Civil</option>
              <option value="Administração">Música</option>
            </select>
          </div>

          <button type="submit" className="w-full mt-4 py-4 bg-[#008060] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00664d] transition-all shadow-lg shadow-[#008060]/20">
            Finalizar Cadastro
          </button>
        </form>
      </div>
    </div>
  );
}