import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";

export function FormularioAnexoIII() {
  const { id: viagemId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    coordenadoresDaAtividade: "",
    coordenadoresDePesquisaExtensao: "",
    disciplina: "",
    curso: "",
    turma: "",
    metodologia: "",
    objetivos: "",
    cargaHorariaCompatibilidade: "",
    justificativaImportancia: "",
    numeroParticipantes: "",
    itensSeguranca: "",
    cargaHorariaNoDiarioDeClasse: "",
    contatoDosCoordenadores: "",
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
        `${API_URL}/planejamento-atividade/gerar-e-salvar`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      localStorage.setItem(`anexoIII_${viagemId}`, data.id);

      alert("Planejamento gerado com sucesso!");
      navigate(`/viagem/${viagemId}`);
    } catch {
      alert("Erro ao gerar planejamento.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none";

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
            Planejamento da Atividade
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Preencha as informações do planejamento da visita técnica.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        >

          {/* Seção 1 */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Informações Acadêmicas
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Disciplina</label>
                <input
                  className={inputStyle}
                  value={formData.disciplina}
                  onChange={(e) =>
                    setFormData({ ...formData, disciplina: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Curso</label>
                <input
                  className={inputStyle}
                  value={formData.curso}
                  onChange={(e) =>
                    setFormData({ ...formData, curso: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Turma</label>
                <input
                  className={inputStyle}
                  value={formData.turma}
                  onChange={(e) =>
                    setFormData({ ...formData, turma: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Nº Participantes</label>
                <input
                  type="number"
                  className={inputStyle}
                  value={formData.numeroParticipantes}
                  onChange={(e) => {
                    if (parseInt(e.target.value) >= 0 || e.target.value === "") {
                      setFormData({
                        ...formData,
                        numeroParticipantes: e.target.value,
                      });
                    } else {
                      alert("O número de participantes não pode ser negativo.");
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <hr />

          {/* Seção 2 */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Coordenação
            </h3>

            <div className="grid gap-4">
              <div>
                <label className="label">Coordenadores da Atividade</label>
                <input
                  className={inputStyle}
                  value={formData.coordenadoresDaAtividade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordenadoresDaAtividade: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">Pesquisa / Extensão</label>
                <input
                  className={inputStyle}
                  value={formData.coordenadoresDePesquisaExtensao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordenadoresDePesquisaExtensao: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">Contato</label>
                <input
                  className={inputStyle}
                  value={formData.contatoDosCoordenadores}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contatoDosCoordenadores: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <hr />

          {/* Seção 3 */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Planejamento Pedagógico
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">Metodologia</label>
                <textarea
                  rows={3}
                  className={textareaStyle}
                  value={formData.metodologia}
                  onChange={(e) =>
                    setFormData({ ...formData, metodologia: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Objetivos</label>
                <textarea
                  rows={3}
                  className={textareaStyle}
                  value={formData.objetivos}
                  onChange={(e) =>
                    setFormData({ ...formData, objetivos: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Justificativa</label>
                <textarea
                  rows={3}
                  className={textareaStyle}
                  value={formData.justificativaImportancia}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      justificativaImportancia: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <hr />

          {/* Seção 4 */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Informações Complementares
            </h3>

            <div className="space-y-4">
              <input
                placeholder="Carga horária compatível"
                className={inputStyle}
                value={formData.cargaHorariaCompatibilidade}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cargaHorariaCompatibilidade: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Itens de segurança"
                rows={3}
                className={textareaStyle}
                value={formData.itensSeguranca}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    itensSeguranca: e.target.value,
                  })
                }
              />

              <input
                placeholder="Carga horária no diário de classe"
                className={inputStyle}
                value={formData.cargaHorariaNoDiarioDeClasse}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cargaHorariaNoDiarioDeClasse: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Botões */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 text-sm font-semibold text-slate-700 border rounded-lg"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-semibold text-white bg-[#008060] hover:bg-[#006048] rounded-lg disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar e Gerar PDF"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}