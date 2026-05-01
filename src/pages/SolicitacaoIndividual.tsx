import React, { forwardRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
<<<<<<< Updated upstream
import { useAuth } from "../hooks/useAuth";
import { useContaBancaria } from "../hooks/useContaBancaria";
=======
import { useContaBancaria } from "../hooks/useContaBancaria";
import { useAuth } from "../hooks/useAuth";
>>>>>>> Stashed changes


// --- Opções de Auxílio ---
const auxilioOptions = [
  { id: "INSCRICAO", label: "Inscrição", icon: "contract" },
  { id: "HOSPEDAGEM", label: "Hospedagem", icon: "hotel" },
  { id: "LOCOMOCAO", label: "Locomoção", icon: "directions_car" },
  { id: "ALIMENTACAO", label: "Alimentação", icon: "restaurant" },
  { id: "PASSAGEM", label: "Passagem", icon: "flight" },
] as const;

// --- Esquema de Validação Zod ---
const solicitacaoSchema = z.object({
  nome: z.string().min(3, "Nome completo obrigatório"),
  cpf: z.string().min(11, "CPF inválido"),
  matricula: z.string().min(1, "Matrícula obrigatória"),
  curso: z.string().min(1, "Curso obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(8, "Telefone obrigatório"),
  // AJUSTE AQUI: Campos que vêm do banco e não têm input devem ser opcionais no Zod
  endereco: z.string().optional().or(z.null()),
  campus: z.string().min(1, "Campus obrigatório"),
  turmaPeriodo: z.string().optional().or(z.null()),
  banco: z.string().optional().or(z.null()),
  agencia: z.string().optional().or(z.null()),
  conta: z.string().optional().or(z.null()),
  auxilios: z.array(z.string()).min(1, "Selecione pelo menos um auxílio"),
  destino: z.string().optional(),
  dataPartida: z.string().min(1, "Data de saída obrigatória"),
  dataRetorno: z.string().min(1, "Data de retorno obrigatória"),
  justificativa: z.string().min(15, "Justificativa muito curta"),
  atividadeEvento: z.string().min(3, "Nome do evento obrigatório"),
  localidadeEvento: z.string().min(3, "Local do evento obrigatório"),
  nomeFamiliar: z.string().min(3, "Nome do contato de emergência"),
  contatoFamiliar: z.string().min(8, "Telefone do contato de emergência"),
}).refine((data) => new Date(data.dataRetorno) >= new Date(data.dataPartida), {
  message: "Retorno não pode ser antes da partida",
  path: ["dataRetorno"],
});

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

export function SolicitacaoIndividual() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState<boolean>(false);
  const { session } = useAuth();
 const { contaBancaria: dadosBancariosHook } = useContaBancaria();
// ... dentro do componente SolicitacaoIndividual
const location = useLocation(); // Aqui ela deixa de ser "unused"
 const { session } = useAuth();
 const { contaBancaria: dadosBancariosHook } = useContaBancaria();
// Use o location.state para pegar os dados
const dadosParaEdicao = location.state?.edicao;
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
    defaultValues: { auxilios: [] },
  });

  const selectedAuxilios = watch("auxilios");

 useEffect(() => {
  const carregarDados = async () => {
    // 1. Caso seja EDIÇÃO (dados vindos via navigate state)
    if (dadosParaEdicao) {
      reset({
        ...dadosParaEdicao,
        // Concatena Data e Hora para o formato YYYY-MM-DDTHH:mm exigido pelo input datetime-local
        dataPartida: `${dadosParaEdicao.dataSaida}T${dadosParaEdicao.horaSaida}`,
        
        dataRetorno: `${dadosParaEdicao.dataChegada}T${dadosParaEdicao.horaChegada}`,
        
        // Mapeia os campos booleanos do banco de volta para o array 'auxilios' do formulário
        auxilios: [
          ...(dadosParaEdicao.solicitaInscricao ? ["INSCRICAO"] : []),
          ...(dadosParaEdicao.solicitaPassagem ? ["PASSAGEM"] : []),
          ...(dadosParaEdicao.solicitaHospedagem ? ["HOSPEDAGEM"] : []),
          ...(dadosParaEdicao.solicitaLocomocao ? ["LOCOMOCAO"] : []),
          ...(dadosParaEdicao.solicitaAlimentacao ? ["ALIMENTACAO"] : []),
        ],
      });
      return; // Interrompe aqui se for edição
    }

    // 2. Caso seja NOVA SOLICITAÇÃO (busca dados do perfil do usuário)
    if (token) {
      try {
        const response = await fetch("http://localhost:8080/users/meComplete", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("JSON REAL QUE SAIU DO JAVA:", data);
          reset({
            nome: data.nome,
            cpf: data.numeroCpf,
            matricula: data.matricula,
            curso: data.curso,
            email: data.email,
            telefone: data.telefone,
            endereco: "Rua Exemplo, 123", // Placeholder, pois o endereço não vem do perfil
            campus: "Monteiro",
            turmaPeriodo: data.turmaPeriodo || session?.turmaPeriodo,
            banco: data.contaBancaria?.banco || "",
            agencia: session?.contaBancaria?.agencia|| dadosBancariosHook?.agencia || data.contaBancaria?.agencia || "",
            conta: data.contaBancaria?.numero || dadosBancariosHook?.numero || session?.contaBancaria?.numero || "",
            nomeFamiliar: data.responsavelLegal?.nome || "",
            contatoFamiliar: data.responsavelLegal?.telefone || "",
            auxilios: [], // Começa vazio para nova solicitação
          });
        }
      } catch (error) {
        console.warn("Erro ao carregar perfil para nova solicitação:", error);
      }
    }
  };

  carregarDados();
}, [token, reset, dadosParaEdicao]);

<<<<<<< Updated upstream
 const onSubmit = async (values: SolicitacaoFormData) => {
  console.log("Valores que estão indo para o Java:", values);
  setLoading(true);
  try {
    
    let viagemId = dadosParaEdicao?.viagemId; // Tenta pegar o ID se for edição
=======
const onSubmit = async (values: SolicitacaoFormData) => {
  setLoading(true);
  try {
    let viagemId = dadosParaEdicao?.viagemId;
>>>>>>> Stashed changes

    // 1. CRIAÇÃO DA VIAGEM (Se não for edição)
    if (!dadosParaEdicao) {
      const viagemPayload = {
        local: values.localidadeEvento,
        dataPartida: values.dataPartida.split("T")[0],
        dataRetorno: values.dataRetorno.split("T")[0],
        prazoAnexosDiscentes: values.dataPartida.split("T")[0],
        valorDiariaCnpq: 100.0,
        tipoViagem: "INDIVIDUAL",
        itinerarios: [{
          local: values.localidadeEvento,
          horarioSaida: values.dataPartida,
          horarioEntrada: values.dataRetorno
        }]
      };

      const resViagem = await fetch("http://localhost:8080/viagens", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(viagemPayload),
      });

      if (!resViagem.ok) throw new Error("Erro ao criar viagem");
      const viagemCriada = await resViagem.json();
      viagemId = viagemCriada.id;
    }

    // 2. LÓGICA DE MAPEAMENTO PARA O ENUM TipoAfastamento
    // Mapeia conforme as constantes exatas que você mandou do Back-end
    let afastamentoEnum = "MAIOR_08_HORAS_ALIMENTACAO_E_LOCOMOCAO"; 
    if (values.auxilios.includes("HOSPEDAGEM")) {
      afastamentoEnum = values.auxilios.includes("LOCOMOCAO")
        ? "MAIOR_08_HORAS_ALIMENTACAO_E_HOSPEDAGEM_E_LOCOMOCAO"
        : "MAIOR_08_HORAS_ALIMENTACAO_E_HOSPEDAGEM";
    }

    // 3. MONTAGEM DO PAYLOAD (Alinhado com SolicitacaoIndividualDTO.java)
    const payloadSolicitacao = {
<<<<<<< Updated upstream
      ...values,
      viagemId: viagemId, 
      turmaPeriodo: values.turmaPeriodo, 
      curso: values.curso,
      campus: values.campus,// Usa o ID existente ou o novo
      solicitadoEm: new Date().toISOString(),
      
      // Mapeamentos que já corrigimos...
      afastamento: values.auxilios.includes("HOSPEDAGEM") 
        ? "MAIOR_08_HORAS_ALIMENTACAO_E_HOSPEDAGEM" 
        : "MAIOR_08_HORAS_ALIMENTACAO_E_LOCOMOCAO",
=======
      viagemId: viagemId,
      justificativa: values.justificativa,
      solicitadoEm: new Date(), // Atende ao @NotNull e @PastOrPresent Date
      data: new Date(),        // Atende ao campo 'Date data' do seu Record
      afastamento: afastamentoEnum,

      // Dados do Solicitante
      nome: values.nome,
      cpf: values.cpf,
      matricula: values.matricula,
      curso: values.curso || "Não informado",
      email: values.email,
      telefone: values.telefone || "",
      endereco: values.endereco || "Não informado",

      // Campos do Anexo V
      campus: values.campus || "Monteiro",
      turmaPeriodo: values.turmaPeriodo || "",
      atividadeEvento: values.atividadeEvento || "Evento para o ifpb",
      localidadeEvento: values.localidadeEvento,
      nomeFamiliar: values.nomeFamiliar,
      contatoFamiliar: values.contatoFamiliar,

      // Dados Bancários (Campo 'conta' conforme o seu Record Java)
      banco: values.banco || "",
      agencia: values.agencia || "",
      conta: values.conta ||  "", 

      // Auxílios (Booleanos)
>>>>>>> Stashed changes
      solicitaInscricao: values.auxilios.includes("INSCRICAO"),
      solicitaPassagem: values.auxilios.includes("PASSAGEM"),
      solicitaHospedagem: values.auxilios.includes("HOSPEDAGEM"),
      solicitaLocomocao: values.auxilios.includes("LOCOMOCAO"),
      solicitaAlimentacao: values.auxilios.includes("ALIMENTACAO"),

      // Período de Afastamento (Strings)
      dataSaida: values.dataPartida.split("T")[0],
      horaSaida: values.dataPartida.split("T")[1] || "00:00",
      dataChegada: values.dataRetorno.split("T")[0],
      horaChegada: values.dataRetorno.split("T")[1] || "00:00",
    };

    // 4. ENVIO PARA O BACK-END (SALVAR E GERAR ANEXO II)
    const resSolicitacao = await fetch("http://localhost:8080/solicitacoes-individuais/gerar-e-salvar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payloadSolicitacao),
    });

    if (!resSolicitacao.ok) {
      const errorData = await resSolicitacao.json();
      console.error("DETALHES DO ERRO 500:");
      console.table(errorData.errors || errorData); // Mostra os campos que falharam na validação
      throw new Error("Erro na validação da solicitação");
    }

    // 5. GERAÇÃO DO TERMO (ANEXO V) - Controller Separado
    const resTermo = await fetch("http://localhost:8080/api/pdf/termo-responsabilidade/individual", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payloadSolicitacao),
    });

    if (resTermo.ok) {
      const blob = await resTermo.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Anexo_V_Termo_${values.matricula}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setIsSuccess(true);
      setShowModal(true);
      setTimeout(() => navigate("/"), 2500);
    } else {
      throw new Error("Erro ao gerar o PDF do Termo (Anexo V)");
    }

  } catch (error) {
    console.error("Erro no processamento:", error);
    setIsSuccess(false);
    setShowModal(true);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
            Voltar
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Solicitação Individual
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Geração automática dos Anexos II e V com base nos dados do seu perfil.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <input type="hidden" {...register("turmaPeriodo")} />
            <h3 className="text-lg font-bold text-slate-800 mb-4">Auxílios Pretendidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {auxilioOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAuxilios?.includes(opt.id)
                      ? "border-[#008060] bg-[#008060]/5 text-[#008060]"
                      : "border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <input type="checkbox" value={opt.id} className="sr-only" {...register("auxilios")} />
                  <span className="material-symbols-outlined mb-1">{opt.icon}</span>
                  <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.auxilios && <span className="text-xs text-red-500 mt-2 block font-medium">{errors.auxilios.message}</span>}
          </div>

          <hr className="border-slate-100" />

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Dados do Discente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <InputForm label="Nome Completo" readOnly {...register("nome")} />
              </div>
              <InputForm label="CPF" readOnly {...register("cpf")} />
              <InputForm label="Matrícula" readOnly {...register("matricula")} />
              <InputForm label="Curso" readOnly {...register("curso")} />
              <InputForm label="Campus" readOnly {...register("campus")} />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Detalhes da Viagem e Emergência</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputForm label="Nome do Evento" error={errors.atividadeEvento?.message} {...register("atividadeEvento")} />
              <InputForm label="Local (Cidade/UF)" error={errors.localidadeEvento?.message} {...register("localidadeEvento")} />
              <InputForm type="datetime-local" label="Data/Hora Partida" error={errors.dataPartida?.message} {...register("dataPartida")} />
              <InputForm type="datetime-local" label="Data/Hora Retorno" error={errors.dataRetorno?.message} {...register("dataRetorno")} />
              <InputForm label="Responsável (Emergência)" error={errors.nomeFamiliar?.message} {...register("nomeFamiliar")} />
              <InputForm label="Telefone Emergência" error={errors.contatoFamiliar?.message} {...register("contatoFamiliar")} />
              <div className="md:col-span-2">
                <TextareaForm label="Justificativa da Viagem" error={errors.justificativa?.message} {...register("justificativa")} />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#008060] rounded-lg hover:bg-[#006048] disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[160px]"
            >
              {loading || isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                "Gerar Documentos"
              )}
            </button>
          {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300">
      
      {loading ? (
        /* ESTADO: ENVIANDO */
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-[#008060] rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold text-slate-900">Enviando</h3>
          <p className="text-slate-500 text-sm">Aguarde um momento...</p>
        </div>
      ) : isSuccess ? (
        /* ESTADO: SUCESSO */
        <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
          <div className="bg-green-50 text-green-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 scale-110">
            <span className="material-symbols-outlined text-5xl font-bold">check</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Concluído!</h3>
          <p className="text-slate-500 text-sm">Sua solicitação foi processada com sucesso.</p>
        </div>
      ) : (
        /* ESTADO: ERRO (O SEU ELSE) */
        <div className="flex flex-col items-center text-center animate-in shake duration-500">
          <div className="bg-red-50 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl font-bold">error</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Ops!</h3>
          <p className="text-slate-500 text-sm">Não foi possível processar a solicitação. Verifique os dados e tente novamente.</p>
          <button 
            onClick={() => setShowModal(false)}
            className="mt-6 w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

    </div>
  </div>
)}
          </div>
        </form>
      </main>
    </div>
  );
}

// --- Componentes Auxiliares ---
const InputForm = forwardRef<HTMLInputElement, { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, error, ...props }, ref) => (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm transition-all ${
          error ? "border-red-500" : "border-slate-300"
        } ${props.readOnly ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "text-slate-700"}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1 block font-medium">{error}</span>}
    </div>
  )
);
InputForm.displayName = "InputForm";

const TextareaForm = forwardRef<HTMLTextAreaElement, { label: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ label, error, ...props }, ref) => (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm transition-all ${
          error ? "border-red-500" : "border-slate-300"
        }`}
        rows={3}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1 block font-medium">{error}</span>}
    </div>
  )
);
TextareaForm.displayName = "TextareaForm";