import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";

// Interface para controle interno das linhas da tabela
interface ItemAtividade {
  data: string;
  descricao: string;
}

export function FormularioRelatorio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estado para a tabela dinâmica de atividades
  const [atividades, setAtividades] = useState<ItemAtividade[]>([
    { data: "", descricao: "" }
  ]);

  const [formData, setFormData] = useState({
    solicitacaoId: id || "",
    valorAjudaCusto: "",
    ajudaCustoExtenso: "",
    valorPassagens: "",
    passagensExtenso: "",
    numeroBilhetes: "",
    observacoes: ""
  });

  const adicionarLinha = () => {
    setAtividades([...atividades, { data: "", descricao: "" }]);
  };

  const removerLinha = (index: number) => {
    const novasAtividades = atividades.filter((_, i) => i !== index);
    setAtividades(novasAtividades);
  };

  const handleAtividadeChange = (index: number, campo: keyof ItemAtividade, valor: string) => {
    const novasAtividades = [...atividades];
    novasAtividades[index][campo] = valor;
    setAtividades(novasAtividades);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    /**
     * LÓGICA DE ESPAÇAMENTO PARA O PDF:
     * O .padEnd(20, ' ') garante que a data ocupe um espaço fixo.
     * Isso impede que a descrição "encoste" na data na impressão.
     */
    const descricaoFormatada = atividades
      .filter(item => item.data && item.descricao)
      .map(item => `${item.data.padEnd(20, ' ')} ${item.descricao}`)
      .join("\n");

    const payload = {
      ...formData,
      descricaoAtividades: descricaoFormatada
    };

    try {
      const res = await fetch(`${API_URL}/api/relatorios-discentes`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Relatório salvo com sucesso!");
        navigate(-1);
      } else {
        alert("Erro ao salvar relatório.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <button onClick={() => navigate(-1)} className="text-slate-500 flex items-center gap-2 mb-4 hover:text-slate-800 transition-colors group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> 
            Voltar
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Preencher Relatório</h2>
          <p className="text-slate-500 font-medium">Anexo VII - Informe as atividades e valores da viagem.</p>
        </div>
        <div className="bg-emerald-50 text-[#008060] px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-emerald-100 self-start">
          Solicitação: {id?.substring(0, 8)}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* TABELA DE ATIVIDADES MELHORADA */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-slate-50/50 border-b border-slate-200 px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#008060]">event_note</span>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-[0.2em]">Cronograma de Atividades</h3>
            </div>
            <button 
              type="button"
              onClick={adicionarLinha}
              className="text-xs bg-[#008060] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#006048] transition-all flex items-center gap-2 shadow-md shadow-emerald-100"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span> Adicionar Dia
            </button>
          </div>
          
          <div className="p-8">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                  <th className="px-4 w-44">Data</th>
                  <th className="px-4">Atividade Realizada</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {atividades.map((item, index) => (
                  <tr key={index} className="group animate-in slide-in-from-left-2 duration-300">
                    <td className="px-2">
                      <input 
                        type="text"
                        placeholder="Ex: 10/03/2026"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#008060] outline-none transition-all font-bold text-slate-700"
                        value={item.data}
                        onChange={(e) => handleAtividadeChange(index, "data", e.target.value)}
                        required
                      />
                    </td>
                    <td className="px-2">
                      <input 
                        type="text"
                        placeholder="Descreva o que foi feito neste dia..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#008060] outline-none transition-all text-slate-600"
                        value={item.descricao}
                        onChange={(e) => handleAtividadeChange(index, "descricao", e.target.value)}
                        required
                      />
                    </td>
                    <td className="text-center">
                      {atividades.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removerLinha(index)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-2"
                        >
                          <span className="material-symbols-outlined">delete_sweep</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO DE VALORES EM GRIDS LATERAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Ajuda de Custo */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-[#008060]">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">Ajuda de Custo</h4>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                <input
                  type="number"
                  name="valorAjudaCusto"
                  placeholder="0,00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-[#008060] outline-none font-bold"
                  onChange={handleChange}
                />
              </div>
              <textarea
                name="ajudaCustoExtenso"
                placeholder="Valor por extenso..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#008060] outline-none resize-none"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Card Passagens */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 text-purple-600">
              <div className="p-2 bg-purple-50 rounded-lg">
                <span className="material-symbols-outlined">confirmation_number</span>
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">Passagens e Bilhetes</h4>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                name="numeroBilhetes"
                placeholder="Números dos bilhetes/E-tickets"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                onChange={handleChange}
              />
              <textarea
                name="passagensExtenso"
                placeholder="Valor das passagens por extenso..."
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <span className="material-symbols-outlined text-lg">speaker_notes</span>
            <label className="text-xs font-black uppercase tracking-widest">Observações Adicionais</label>
          </div>
          <textarea
            name="observacoes"
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-slate-400 outline-none"
            placeholder="Caso precise detalhar algo sobre os valores ou ocorrências na viagem..."
            value={formData.observacoes}
            onChange={handleChange}
          />
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 disabled:opacity-50 active:scale-[0.98] mt-4"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <>
              <span className="material-symbols-outlined">task_alt</span>
              Finalizar Relatório
            </>
          )}
        </button>
      </form>
    </div>
  );
}