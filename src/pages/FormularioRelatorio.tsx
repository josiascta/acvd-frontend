import { useState, } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";

export function FormularioRelatorio() {
  const { id } = useParams<{ id: string }>(); // ID da Solicitação
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estado do formulário baseado no seu DTO
  const [formData, setFormData] = useState({
    solicitacaoId: id || "",
    descricaoAtividades: "",
    valorAjudaCusto: "",
    ajudaCustoExtenso: "",
    valorPassagens: "",
    passagensExtenso: "",
    numeroBilhetes: "",
    observacoes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/relatorios-discentes`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Relatório salvo com sucesso!");
        navigate(-1); // Volta para a tela de detalhes
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
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <header>
        <button onClick={() => navigate(-1)} className="text-slate-500 flex items-center gap-2 mb-4 hover:text-slate-800 transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Voltar
        </button>
        <h2 className="text-3xl font-black text-slate-900">Preencher Relatório (Anexo VII)</h2>
        <p className="text-slate-500">Descreva as atividades realizadas e informe os valores utilizados.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        
        {/* Descrição das Atividades */}
        <div>
          <label className="block text-xs font-black text-[#008060] uppercase tracking-widest mb-2">
            Descrição Sucinta das Atividades (por dia)
          </label>
          <textarea
            name="descricaoAtividades"
            required
            rows={6}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#008060] outline-none transition-all"
            placeholder="Ex: 10/03 - Chegada e credenciamento&#10;11/03 - Apresentação do trabalho na sala 04..."
            value={formData.descricaoAtividades}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ajuda de Custo */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase border-b pb-1">Ajuda de Custo</h4>
            <input
              type="number"
              name="valorAjudaCusto"
              placeholder="Valor (R$)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
              onChange={handleChange}
            />
            <input
              type="text"
              name="ajudaCustoExtenso"
              placeholder="Valor por extenso"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
              onChange={handleChange}
            />
          </div>

          {/* Passagens */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase border-b pb-1">Passagens / Bilhetes</h4>
            <input
              type="text"
              name="numeroBilhetes"
              placeholder="Nº dos Bilhetes"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
              onChange={handleChange}
            />
            <input
              type="text"
              name="passagensExtenso"
              placeholder="Valor das passagens por extenso"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Observações Adicionais</label>
          <textarea
            name="observacoes"
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm"
            value={formData.observacoes}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#008060] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#006048] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {loading ? "Salvando..." : (
            <>
              <span className="material-symbols-outlined">save</span>
              Salvar Relatório e Finalizar
            </>
          )}
        </button>
      </form>
    </div>
  );
}