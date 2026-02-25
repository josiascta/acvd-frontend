import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";

const aplicarMascaraCPF = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const aplicarMascaraRG = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{1,2})\d+?$/, "$1");
};

const aplicarMascaraTelefone = (value: string) => {
  if (!value) return "";
  let v = value.replace(/\D/g, "");
  v = v.slice(0, 11);

  if (v.length <= 10) {
    return v.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }

  return v.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const validarCPFMath = (cpf: string) => {
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

// Transformado em função para lidar com os campos opcionais
const getPerfilSchema = (isDiscente: boolean) => {
  const baseSchema = z.object({
    rg: z.string().min(4, "RG inválido (mínimo 4 dígitos)"),
    cpf: z
      .string()
      .regex(
        /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        "CPF incompleto. Digite os 11 números.",
      )
      .refine((val) => validarCPFMath(val), {
        message: "CPF inválido! Verifique os números.",
      }),
    matricula: z.string().min(4, "A matrícula é obrigatória."),
  });

  if (isDiscente) {
    return baseSchema.extend({
      telefone: z
        .string()
        .regex(
          /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
          "Telefone incompleto. Digite o DDD e o número.",
        ),
      dataNascimento: z.string().min(1, "A data de nascimento é obrigatória."),
      curso: z.string().min(1, "Por favor, selecione um curso."),
    });
  }

  return baseSchema.extend({
    telefone: z.string().optional(),
    dataNascimento: z.string().optional(),
    curso: z.string().optional(),
  });
};

type PerfilFormData = z.infer<ReturnType<typeof getPerfilSchema>>;

export function CompletarPerfil() {
  const navigate = useNavigate();
  const { save, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isDiscente: boolean = session?.role === "DISCENTE";
  const isEditing = !!session?.matricula;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(getPerfilSchema(isDiscente)), // Chamada dinâmica aqui
  });

  useEffect(() => {
    if (session) {
      reset({
        rg: session.numeroRg ? aplicarMascaraRG(session.numeroRg) : "",
        cpf: session.numeroCpf ? aplicarMascaraCPF(session.numeroCpf) : "",
        matricula: session.matricula || "",
        telefone: session.telefone
          ? aplicarMascaraTelefone(session.telefone)
          : "",
        curso: session.curso || "",
        dataNascimento: session.dataNascimento
          ? session.dataNascimento.split("T")[0]
          : "",
      });
    }
  }, [session, reset]);

  const onSubmit = async (data: PerfilFormData) => {
    if (!session?.email) {
      alert("Sessão inválida. Faça login novamente.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: session.email,
        matricula: data.matricula,
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : "", // Proteção contra undefined
        numeroCpf: data.cpf.replace(/\D/g, ""),
        numeroRg: data.rg.replace(/\D/g, ""),
        dataNascimento: data.dataNascimento || null,
        curso: data.curso || null,
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

      const resData = await response.json();
      if (resData.token) localStorage.setItem("token", resData.token);

      const updatedUser = {
        ...session,
        matricula: data.matricula,
        telefone: payload.telefone,
        numeroRg: payload.numeroRg,
        numeroCpf: payload.numeroCpf,
        dataNascimento: data.dataNascimento,
        curso: data.curso,
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

  const rgReg = register("rg");
  const cpfReg = register("cpf");
  const telefoneReg = register("telefone");

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <InputForm
              label="RG"
              placeholder="00.000.000-0"
              error={errors.rg?.message}
              {...rgReg}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = aplicarMascaraRG(e.target.value);
                rgReg.onChange(e);
              }}
            />

            <InputForm
              label="CPF"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              {...cpfReg}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = aplicarMascaraCPF(e.target.value);
                cpfReg.onChange(e);
              }}
            />

            <InputForm
              label={isDiscente ? "Matrícula" : "SIAPE"}
              placeholder="Ex: 2024101010"
              fontMono
              error={errors.matricula?.message}
              {...register("matricula")}
            />

            {isDiscente && (
              <InputForm
                label="Telefone"
                placeholder="(00) 00000-0000"
                fontMono
                error={errors.telefone?.message}
                {...telefoneReg}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = aplicarMascaraTelefone(e.target.value);
                  telefoneReg.onChange(e);
                }}
              />
            )}

            {isDiscente && (
              <InputForm
                type="date"
                label="Data de Nascimento"
                error={errors.dataNascimento?.message}
                {...register("dataNascimento")}
              />
            )}

            {isDiscente && (
              <SelectForm
                label="Curso"
                error={errors.curso?.message}
                options={[
                  "Análise e Desenvolvimento de Sistemas",
                  "Engenharia Civil",
                  "Música",
                ]}
                {...register("curso")}
              />
            )}
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

const InputForm = ({ label, error, fontMono, ...props }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      className={`w-full mt-1 px-5 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 transition-all text-slate-700 ${fontMono ? "font-mono font-bold" : "font-bold"} ${error ? "border-red-500 focus:border-red-500" : "border-slate-100 focus:border-[#008060]"}`}
      {...props}
    />
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);

const SelectForm = ({ label, error, options, ...props }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <select
      className={`w-full mt-1 px-5 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 transition-all font-bold text-slate-700 appearance-none cursor-pointer ${error ? "border-red-500 focus:border-red-500" : "border-slate-100 focus:border-[#008060]"}`}
      {...props}
    >
      <option value="" disabled hidden>
        Selecione seu curso
      </option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
  </div>
);
