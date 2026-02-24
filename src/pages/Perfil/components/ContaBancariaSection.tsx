import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useContaBancaria } from "../../../hooks/useContaBancaria";

const BANCOS_DISPONIVEIS = [
  "Banco do Brasil (001)",
  "Caixa Econômica Federal (104)",
  "Nubank (260)",
  "Itaú Unibanco (341)",
  "Banco Bradesco (237)",
  "Banco Santander (033)",
  "Banco Inter (077)",
  "Banco C6 (336)",
  "Banco BTG Pactual (208)",
  "PicPay (380)",
  "Mercado Pago (323)",
  "Sicredi (748)",
  "Sicoob (756)",
] as const;

const contaSchema = z.object({
  banco: z.string().min(1, "Selecione um banco válido"),
  agencia: z.string().min(1, "Campo obrigatório"),
  numero: z.string().min(1, "Campo obrigatório"),
  operacao: z.string().min(1, "Campo obrigatório"),
});

type ContaFormData = z.infer<typeof contaSchema>;

export function ContaBancariaSection() {
  const {
    contaBancaria,
    isEditingConta,
    setIsEditingConta,
    fetchContaBancaria,
    handleSalvarConta,
  } = useContaBancaria();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContaFormData>({
    resolver: zodResolver(contaSchema),
  });

  useEffect(() => {
    fetchContaBancaria();
  }, [fetchContaBancaria]);

  useEffect(() => {
    if (contaBancaria) reset(contaBancaria);
  }, [contaBancaria, reset]);

  const onSubmit = async (data: ContaFormData) => {
    await handleSalvarConta(data);
  };

  return (
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
          onSubmit={handleSubmit(onSubmit)}
          className="bg-slate-50 p-6 rounded-2xl border border-slate-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectForm
              label="Banco"
              options={BANCOS_DISPONIVEIS}
              error={errors.banco?.message}
              {...register("banco")}
            />
            <InputForm
              label="Agência"
              placeholder="Ex: 0000-0"
              error={errors.agencia?.message}
              {...register("agencia")}
            />
            <InputForm
              label="Número da Conta"
              placeholder="Ex: 00000-0"
              error={errors.numero?.message}
              {...register("numero")}
            />
            <InputForm
              label="Operação"
              placeholder="Ex: Conta Corrente (001)"
              error={errors.operacao?.message}
              {...register("operacao")}
            />
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
                if (contaBancaria) reset(contaBancaria);
              }}
              className="px-6 py-2.5 bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <DataBlock label="Banco" value={contaBancaria?.banco} />
          <DataBlock label="Agência" value={contaBancaria?.agencia} />
          <DataBlock label="Conta" value={contaBancaria?.numero} />
          <DataBlock label="Operação" value={contaBancaria?.operacao} />
        </div>
      )}
    </section>
  );
}

const InputForm = ({ label, error, ...props }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      className={`w-full mt-1 px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-1 font-bold text-slate-700 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-[#008060] focus:ring-[#008060]"}`}
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
      className={`w-full mt-1 px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-1 font-bold text-slate-700 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-[#008060] focus:ring-[#008060]"}`}
      {...props}
    >
      <option value="" disabled hidden>
        Selecione um banco...
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

const DataBlock = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
      {label}
    </span>
    <span className="font-bold text-slate-700">{value}</span>
  </div>
);
