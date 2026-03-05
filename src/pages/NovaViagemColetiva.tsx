import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";

export function NovaViagemColetiva() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    dataPartida: "",
    dataRetorno: "",
    prazoAnexosDiscentes: "",
    valorDiariaCnpq: "",
  });

  // Estado dinâmico para os itinerários
  const [itinerarios, setItinerarios] = useState([
    { horarioEntrada: "", horarioSaida: "", local: "" },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItinerarioChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const novosItinerarios = [...itinerarios];
    novosItinerarios[index] = { ...novosItinerarios[index], [field]: value };
    setItinerarios(novosItinerarios);
  };

  const adicionarItinerario = () => {
    setItinerarios([
      ...itinerarios,
      { horarioEntrada: "", horarioSaida: "", local: "" },
    ]);
  };

  const removerItinerario = (index: number) => {
    if (itinerarios.length > 1) {
      setItinerarios(itinerarios.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    const payload = {
      ...formData,
      valorDiariaCnpq: parseFloat(formData.valorDiariaCnpq),
      tipoViagem: "COLETIVA",
      itinerarios: itinerarios.map((it) => ({
        ...it,
        // O input datetime-local nativo já formata para a ISO (ex: "2024-10-12T09:00:00")
        // O backend (LocalDateTime) aceita esse padrão
      })),
    };

    try {
      const response = await fetch(`${API_URL}/viagens`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erro ao criar a viagem.");
      }

      // Voltar para a Home após sucesso
      navigate("/");
    } catch (error: any) {
      setErro(error.message);
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Nova Viagem Coletiva
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Preencha os dados abaixo para registrar uma nova viagem e seus
            itinerários.
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <p className="font-medium text-sm">{erro}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        >
          {/* Dados Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Data de Partida
              </label>
              <input
                type="date"
                name="dataPartida"
                required
                value={formData.dataPartida}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Data de Retorno
              </label>
              <input
                type="date"
                name="dataRetorno"
                required
                value={formData.dataRetorno}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Prazo para Anexos (Discentes)
              </label>
              <input
                type="date"
                name="prazoAnexosDiscentes"
                required
                value={formData.prazoAnexosDiscentes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Valor da Diária (CNPq)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="valorDiariaCnpq"
                  required
                  value={formData.valorDiariaCnpq}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Itinerários */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Itinerários</h3>
              <button
                type="button"
                onClick={adicionarItinerario}
                className="text-sm font-semibold text-[#008060] hover:text-[#006048] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_circle
                </span>
                Adicionar Destino
              </button>
            </div>

            <div className="space-y-4">
              {itinerarios.map((it, index) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative group"
                >
                  {itinerarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerItinerario(index)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remover itinerário"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Local / Destino
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Campus IFPB - João Pessoa"
                        value={it.local}
                        onChange={(e) =>
                          handleItinerarioChange(index, "local", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Horário de Entrada
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={it.horarioEntrada}
                        onChange={(e) =>
                          handleItinerarioChange(
                            index,
                            "horarioEntrada",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Horário de Saída
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={it.horarioSaida}
                        onChange={(e) =>
                          handleItinerarioChange(
                            index,
                            "horarioSaida",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-[#008060] focus:border-[#008060] text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#008060] rounded-lg hover:bg-[#006048] disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[140px]"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
              ) : (
                "Salvar Viagem"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
