import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";

export function FormularioAnexoVI() {
  const { id: viagemId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    coordenadoresDaAtividade: "",
    disciplinaOuProjeto: "",
    relatorio: "",
    consideracoesFinais: "",
    contatoDaInstituicao: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        viagemId,
        ...formData,
      };

      const res = await fetch(
        `${API_URL}/relatorio-atividade/gerar-e-salvar`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      // 🔥 salva no localStorage igual os outros
      localStorage.setItem(`anexovi_${viagemId}`, data.id);

      alert("Relatório gerado com sucesso!");
      navigate(`/viagem/${viagemId}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar relatório.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none transition-colors";

  const textareaStyle = `${inputStyle} resize-none`;

  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12">
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4"
          >
            ← Voltar
          </button>

          <h2 className="text-3xl font-black text-slate-900 uppercase">
            Relatório da Atividade
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Preencha o relatório final da visita técnica / atividade de campo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        >

          {/* Seção 1 */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Identificação
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Coordenadores da Atividade
                </label>
                <input
                  className={inputStyle}
                  value={formData.coordenadoresDaAtividade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordenadoresDaAtividade: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Disciplina / Projeto
                </label>
                <input
                  className={inputStyle}
                  value={formData.disciplinaOuProjeto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disciplinaOuProjeto: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <hr />

          {/* Seção 2 */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Relatório da Atividade
            </h3>

            <textarea
              rows={8}
              placeholder="Descreva como ocorreu a atividade, o que foi realizado, participação dos alunos, resultados obtidos..."
              className={textareaStyle}
              value={formData.relatorio}
              onChange={(e) =>
                setFormData({ ...formData, relatorio: e.target.value })
              }
              required
            />
          </div>

          <hr />

          {/* Seção 3 */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Considerações Finais
            </h3>

            <textarea
              rows={5}
              placeholder="Apresente as conclusões, aprendizados e impactos da atividade..."
              className={textareaStyle}
              value={formData.consideracoesFinais}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  consideracoesFinais: e.target.value,
                })
              }
              required
            />
          </div>

          <hr />

          {/* Seção 4 */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Contato da Instituição Visitada
            </h3>

            <input
              placeholder="Telefone, e-mail ou outro meio de contato"
              className={inputStyle}
              value={formData.contatoDaInstituicao}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contatoDaInstituicao: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Botões */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-semibold text-white bg-[#008060] hover:bg-[#006048] rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
              ) : (
                "Salvar e Gerar PDF"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}