import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResponsavelLegal } from "../../../hooks/useResponsavelLegal";
import { handleViewDocument } from "../../../utils/api";

const normalizeCPF = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const normalizeRG = (value: string) => {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, 9);
};

const normalizeTelefone = (value: string) => {
  if (!value) return "";
  const v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 10) {
    return v.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return v.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const respSchema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres"),
  cpf: z
    .string()
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      "CPF incompleto. Digite os 11 números.",
    ),
  rg: z.string().min(4, "RG inválido (mínimo 4 dígitos)"),
  contato: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      "Telefone incompleto. Digite o DDD e o número.",
    ),
});

type RespFormData = z.infer<typeof respSchema>;

export function ResponsavelLegalSection() {
  const {
    responsavel,
    isEditingResp,
    setIsEditingResp,
    uploadingRespDoc,
    fetchResponsavel,
    handleSalvarResponsavel,
    handleUploadDocResp,
  } = useResponsavelLegal();

  const fileInputRespRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RespFormData>({
    resolver: zodResolver(respSchema),
  });

  useEffect(() => {
    fetchResponsavel();
  }, [fetchResponsavel]);

  useEffect(() => {
    if (responsavel) {
      reset({
        ...responsavel,
        cpf: normalizeCPF(responsavel.cpf),
        rg: normalizeRG(responsavel.rg),
        contato: normalizeTelefone(responsavel.contato),
      });
    }
  }, [responsavel, reset]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleUploadDocResp(e.target.files[0]);
    if (fileInputRespRef.current) fileInputRespRef.current.value = "";
  };

  const onSubmit = (data: RespFormData) => {
    const payloadLimpo = {
      ...data,
      cpf: data.cpf.replace(/\D/g, ""),
      rg: data.rg.replace(/\D/g, ""),
      contato: data.contato.replace(/\D/g, ""),
    };

    handleSalvarResponsavel(payloadLimpo);
  };

  const cpfReg = register("cpf");
  const rgReg = register("rg");
  const contatoReg = register("contato");

  return (
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
        Como você é menor de idade, é obrigatório preencher os dados do seu
        responsável legal.
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
          onSubmit={handleSubmit(onSubmit)}
          className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputForm
                theme="indigo"
                label="Nome Completo"
                error={errors.nome?.message}
                {...register("nome")}
              />
            </div>

            <InputForm
              theme="indigo"
              label="CPF"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              {...cpfReg}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = normalizeCPF(e.target.value);
                cpfReg.onChange(e);
              }}
            />

            <InputForm
              theme="indigo"
              label="RG (Apenas Números)"
              placeholder="Ex: 123456789"
              error={errors.rg?.message}
              {...rgReg}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = normalizeRG(e.target.value);
                rgReg.onChange(e);
              }}
            />

            <div className="sm:col-span-2">
              <InputForm
                theme="indigo"
                label="Contato (Telefone/Celular)"
                placeholder="(00) 00000-0000"
                error={errors.contato?.message}
                {...contatoReg}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = normalizeTelefone(e.target.value);
                  contatoReg.onChange(e);
                }}
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
                if (responsavel) {
                  reset({
                    ...responsavel,
                    cpf: normalizeCPF(responsavel.cpf),
                    rg: normalizeRG(responsavel.rg),
                    contato: normalizeTelefone(responsavel.contato),
                  });
                }
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
              <DataBlock label="Nome Completo" value={responsavel?.nome} />
            </div>

            <DataBlock
              label="CPF"
              value={normalizeCPF(responsavel?.cpf || "")}
            />
            <DataBlock label="RG" value={normalizeRG(responsavel?.rg || "")} />
            <div className="sm:col-span-2">
              <DataBlock
                label="Contato"
                value={normalizeTelefone(responsavel?.contato || "")}
              />
            </div>
          </div>

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
                  onClick={() => handleViewDocument(responsavel.documento!.id)}
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
                    onChange={onFileChange}
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
  );
}

const InputForm = ({ label, error, theme = "emerald", ...props }: any) => {
  const colorClass =
    theme === "indigo"
      ? "focus:border-indigo-600 focus:ring-indigo-600"
      : "focus:border-[#008060] focus:ring-[#008060]";
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        className={`w-full mt-1 px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-1 font-bold text-slate-700 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : `border-slate-200 ${colorClass}`}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  );
};

const DataBlock = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
      {label}
    </span>
    <span className="font-bold text-slate-700">{value}</span>
  </div>
);
