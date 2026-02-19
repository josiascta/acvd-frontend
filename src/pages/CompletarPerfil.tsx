import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function CompletarPerfil() {
  const navigate = useNavigate();
  const { save, session } = useAuth();

  const isEditing = !!session?.matricula;

  const [formData, setFormData] = useState({
    rg: "",
    cpf: "",
    matricula: "",
    curso: "",
    dataNascimento: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData({
        rg: session.numeroRg ? aplicarMascaraRG(session.numeroRg) : "",
        cpf: session.numeroCpf ? aplicarMascaraCPF(session.numeroCpf) : "",
        matricula: session.matricula || "",
        curso: session.curso || "",
        dataNascimento: session.dataNascimento
          ? session.dataNascimento.split("T")[0]
          : "",
      });
    }
  }, [session]);

  const validarCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;
    let soma = 0,
      resto;
    for (let i = 1; i <= 9; i++)
      soma += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCPF.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCPF.substring(10, 11))) return false;
    return true;
  };

  const aplicarMascaraCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const aplicarMascaraRG = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{1,2})\d+?$/, "$1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.email) {
      alert("Sessão inválida. Faça login novamente.");
      return;
    }

    if (!validarCPF(formData.cpf)) {
      alert("CPF inválido! Por favor, verifique os números.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: session.email,
        matricula: formData.matricula,
        numeroCpf: formData.cpf.replace(/\D/g, ""),
        numeroRg: formData.rg.replace(/\D/g, ""),
        dataNascimento: formData.dataNascimento || null,
        curso: formData.curso,
      };

      const response = await fetch(
        "http://localhost:8080/auth/complete-register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      if (data.token) localStorage.setItem("token", data.token);

      const updatedUser = {
        ...session,
        matricula: formData.matricula,
        numeroRg: payload.numeroRg,
        numeroCpf: payload.numeroCpf,
        dataNascimento: formData.dataNascimento,
        curso: formData.curso,
      };

      save(updatedUser);
      alert(
        isEditing
          ? "Perfil atualizado com sucesso!"
          : "Perfil completado com sucesso!",
      );
      navigate("/perfil");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar dados.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fcfb] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 relative">
        {isEditing && (
          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="absolute top-6 left-6 text-slate-400 hover:text-[#008060] transition-colors"
            title="Voltar para o perfil"
            aria-label="Voltar para o perfil"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
        )}

        <div className="text-center mb-8">
          <div className="size-16 bg-[#008060]/10 rounded-2xl flex items-center justify-center text-[#008060] mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">
              {isEditing ? "manage_accounts" : "person_add"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {isEditing ? "Editar Perfil" : "Completar Perfil"}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">
            {isEditing
              ? "Mantenha seus dados acadêmicos sempre atualizados."
              : "Dados obrigatórios para o sistema acadêmico."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* RG */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                RG
              </label>
              <input
                required
                className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-bold text-slate-700"
                placeholder="00.000.000-0"
                value={formData.rg}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rg: aplicarMascaraRG(e.target.value),
                  })
                }
              />
            </div>

            {/* CPF */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                CPF
              </label>
              <input
                required
                className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-bold text-slate-700"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cpf: aplicarMascaraCPF(e.target.value),
                  })
                }
              />
            </div>

            {/* Matrícula - Edição Liberada */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nº Matrícula
              </label>
              <input
                required
                className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-mono font-bold text-slate-700"
                placeholder="Ex: 2024101010"
                value={formData.matricula}
                onChange={(e) =>
                  setFormData({ ...formData, matricula: e.target.value })
                }
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Data de Nascimento
              </label>
              <input
                required
                type="date"
                className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-bold text-slate-700"
                value={formData.dataNascimento}
                onChange={(e) =>
                  setFormData({ ...formData, dataNascimento: e.target.value })
                }
              />
            </div>

            {/* Curso */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Curso
              </label>
              <select
                required
                className="w-full mt-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                value={formData.curso}
                onChange={(e) =>
                  setFormData({ ...formData, curso: e.target.value })
                }
              >
                <option value="">Selecione seu curso</option>
                <option value="Análise e Desenvolvimento de Sistemas">
                  Análise e Desenvolvimento de Sistemas
                </option>
                <option value="Engenharia Civil">Engenharia Civil</option>
                <option value="Música">Música</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-4 bg-[#008060] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00664d] transition-all shadow-lg shadow-[#008060]/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading
              ? "Salvando..."
              : isEditing
                ? "Salvar Alterações"
                : "Finalizar e Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}
