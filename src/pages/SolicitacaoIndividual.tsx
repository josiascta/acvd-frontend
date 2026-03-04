import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// --- Tipagens e Esquema de Validação (Zod) ---
const auxilioOptions = [
  { id: "INSCRICAO", label: "Inscrição", icon: "contract" },
  { id: "HOSPEDAGEM", label: "Hospedagem", icon: "hotel" },
  { id: "LOCOMOCAO", label: "Locomoção", icon: "directions_car" },
  { id: "ALIMENTACAO", label: "Alimentação", icon: "restaurant" },
  { id: "PASSAGEM", label: "Passagem", icon: "flight" },
] as const;

const solicitacaoSchema = z
  .object({
    auxilios: z
      .array(z.string())
      .min(1, "Selecione pelo menos um tipo de auxílio."),
    destino: z.string().min(3, "O destino deve ter no mínimo 3 caracteres."),
    dataPartida: z
      .string()
      .min(1, "A data e hora de partida são obrigatórias."),
    dataRetorno: z
      .string()
      .min(1, "A data e hora de retorno são obrigatórias."),
    justificativa: z
      .string()
      .min(15, "A justificativa deve ser mais detalhada (mín. 15 caracteres)."),
  })
  .refine(
    (data) => {
      if (!data.dataPartida || !data.dataRetorno) return true;
      return new Date(data.dataRetorno) >= new Date(data.dataPartida);
    },
    {
      message: "A data/hora de retorno não pode ser anterior à partida.",
      path: ["dataRetorno"],
    },
  );

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

// --- Componente Principal ---
export function SolicitacaoIndividual() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
    defaultValues: {
      auxilios: [],
    },
  });

  const selectedAuxilios = watch("auxilios");

  const onSubmit = async (data: SolicitacaoFormData) => {
    try {
      // Simulação de chamada à API
      console.log("Dados da solicitação:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Solicitação salva com sucesso! (Navegar para a próxima etapa)");
      // navigate("/proxima-etapa");
    } catch (error) {
      console.error(error);
      alert("Erro ao processar a solicitação.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fcfb] flex flex-col items-center py-10 px-4">
      <div className="max-w-2xl w-full">
        {/* Header da Tela */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center size-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#008060] hover:border-[#008060] transition-colors shadow-sm"
            title="Voltar"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Solicitação Individual
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Preencha os dados básicos e os auxílios necessários para a sua
              viagem.
            </p>
          </div>
        </div>

        {/* Formulário / Card Principal */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10"
        >
          {/* SEÇÃO 1: Tipo de Auxílio */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#008060] bg-[#008060]/10 p-1.5 rounded-lg text-[20px]">
                category
              </span>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Tipo de Auxílio Solicitado
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Pode selecionar mais de uma opção conforme a necessidade do seu
              deslocamento.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {auxilioOptions.map((option) => {
                const isSelected = selectedAuxilios?.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? "border-[#008060] bg-[#008060]/5 text-[#008060]"
                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option.id}
                      className="sr-only"
                      {...register("auxilios")}
                    />
                    <span className="material-symbols-outlined mb-2 text-[28px]">
                      {option.icon}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-center">
                      {option.label}
                    </span>
                    {/* Indicador visual de check */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 size-4 bg-[#008060] rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[12px] font-bold">
                          check
                        </span>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
            {errors.auxilios && (
              <span className="block mt-2 text-xs font-bold text-red-500">
                {errors.auxilios.message}
              </span>
            )}
          </section>

          <hr className="border-slate-100 mb-10" />

          {/* SEÇÃO 2: Detalhes do Deslocamento */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#008060] bg-[#008060]/10 p-1.5 rounded-lg text-[20px]">
                map
              </span>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Detalhes do Deslocamento
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <InputForm
                  label="Destino (Cidade/UF)"
                  placeholder="Ex: Recife/PE"
                  error={errors.destino?.message}
                  {...register("destino")}
                />
              </div>

              {/* Alterado de date para datetime-local */}
              <InputForm
                type="datetime-local"
                label="Data e Hora de Partida"
                error={errors.dataPartida?.message}
                {...register("dataPartida")}
              />

              {/* Alterado de date para datetime-local */}
              <InputForm
                type="datetime-local"
                label="Data e Hora de Retorno"
                error={errors.dataRetorno?.message}
                {...register("dataRetorno")}
              />

              <div className="md:col-span-2">
                <TextareaForm
                  label="Justificativa da Viagem"
                  placeholder="Descreva detalhadamente o motivo da viagem, evento em que irá participar, etc..."
                  error={errors.justificativa?.message}
                  rows={4}
                  {...register("justificativa")}
                />
              </div>
            </div>
          </section>

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-10 py-4 bg-[#008060] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00664d] transition-all shadow-lg shadow-[#008060]/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
                A processar...
              </>
            ) : (
              <>
                Continuar
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Sub-componentes Modulares de Formulário ---

const InputForm = ({ label, error, fontMono, ...props }: any) => (
  <div className="w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      className={`w-full mt-1 px-5 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 transition-all text-slate-700 ${
        fontMono ? "font-mono font-bold" : "font-bold"
      } ${
        error
          ? "border-red-500 focus:border-red-500"
          : "border-slate-100 focus:border-[#008060]"
      }`}
      {...props}
    />
    {error && (
      <span className="block text-xs text-red-500 mt-1 ml-1">{error}</span>
    )}
  </div>
);

const TextareaForm = ({ label, error, ...props }: any) => (
  <div className="w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <textarea
      className={`w-full mt-1 px-5 py-3.5 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008060]/20 transition-all text-slate-700 font-medium resize-y ${
        error
          ? "border-red-500 focus:border-red-500"
          : "border-slate-100 focus:border-[#008060]"
      }`}
      {...props}
    />
    {error && (
      <span className="block text-xs text-red-500 mt-1 ml-1">{error}</span>
    )}
  </div>
);
