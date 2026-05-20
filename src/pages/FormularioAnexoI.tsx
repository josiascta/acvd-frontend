import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";

export function FormularioAnexoI() {
  const { id: viagemId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    disciplinaOuProjeto: "DISCIPLINA",
    setorDepartamentoCurso: "",
    justificativa: "",
    inscricao: false,
    hospedagem: true,
    locomocaoUrbana: false,
    alimentacao: true,
    passagem: false,
    planejamentoVisitaTecnica: true,
    planilha: true,
    termoResponsabilidade: true,
    outrosDocumentos: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        viagemId,
        solicitadoEm: new Date().toISOString(),
        afastamento: "MAIOR_08_HORAS_ALIMENTACAO_E_HOSPEDAGEM",
        ...formData,
      };

      const res = await fetch(
        `${API_URL}/solicitacoes-coletivas/gerar-e-salvar`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        throw new Error("Falha ao salvar o Anexo I.");
      }

      const data = await res.json();

      alert("Anexo I gerado e salvo com sucesso!");
      navigate(`/viagem/${viagemId}`); // Volta para a tela de detalhes
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar o Anexo I. Verifique os dados e tente novamente.");
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
            <span className="material-symbols-outlined text-[18px] mr-1">
              arrow_back
            </span>
            Voltar
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Preencher Anexo I
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Formulário de Solicitação Coletiva de Ajuda de Custo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Informações da Solicitação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tipo de Atividade
                </label>
                <select
                  value={formData.disciplinaOuProjeto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disciplinaOuProjeto: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none transition-colors"
                  required
                >
                  <option value="DISCIPLINA">Disciplina</option>
                  <option value="PROJETO">Projeto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Setor / Departamento / Curso
                </label>
                <input
                  type="text"
                  value={formData.setorDepartamentoCurso}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      setorDepartamentoCurso: e.target.value,
                    })
                  }
                  placeholder="Ex: Coordenação de Informática"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none transition-colors"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Justificativa da Viagem
                </label>
                <textarea
                  rows={4}
                  value={formData.justificativa}
                  onChange={(e) =>
                    setFormData({ ...formData, justificativa: e.target.value })
                  }
                  placeholder="Descreva a justificativa para a solicitação da ajuda de custo..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Despesas */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Despesas Solicitadas
              </h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                {Object.entries({
                  inscricao: "Inscrição",
                  hospedagem: "Hospedagem",
                  locomocaoUrbana: "Locomoção Urbana",
                  alimentacao: "Alimentação",
                  passagem: "Passagem",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData[key as keyof typeof formData] as boolean
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.checked })
                      }
                      className="rounded text-[#008060] focus:ring-[#008060] w-4 h-4 mt-0.5"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Anexos */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Documentos Anexados
              </h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
                {Object.entries({
                  planejamentoVisitaTecnica:
                    "Planejamento Visita Técnica (Anexo III)",
                  planilha: "Planilha com Discentes (Anexo IV)",
                  termoResponsabilidade: "Termo de Responsabilidade (Anexo V)",
                  outrosDocumentos: "Outros Documentos",
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={
                        formData[key as keyof typeof formData] as boolean
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.checked })
                      }
                      className="rounded text-[#008060] focus:ring-[#008060] w-4 h-4 mt-0.5"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#008060] hover:bg-[#006048] rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm min-w-[180px] justify-center"
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
