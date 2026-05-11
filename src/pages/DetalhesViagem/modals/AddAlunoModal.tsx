import React, { useState } from "react";

type Props = {
  handleAddAlunoBase: (
    emailsStr: string,
    tipo: TipoAfastamento,
    inscricao: number,
  ) => Promise<boolean>;
  addLoading: boolean;
  onClose: () => void;
};

export function AddAlunoModal({
  handleAddAlunoBase,
  addLoading,
  onClose,
}: Props) {
  const [emailDiscente, setEmailDiscente] = useState("");
  const [tipoAfastamento, setTipoAfastamento] =
    useState<TipoAfastamento>("MENOR_04_HORAS");
  const [inscricaoValor, setInscricaoValor] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleAddAlunoBase(
      emailDiscente,
      tipoAfastamento,
      inscricaoValor,
    );
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Adicionar Aluno</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              E-mails dos Discentes (um por linha)
            </label>
            <textarea
              required
              rows={3}
              value={emailDiscente}
              onChange={(e) => setEmailDiscente(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none transition-colors"
              placeholder="aluno1@academico.ifpb.edu.br&#10;aluno2@academico.ifpb.edu.br"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tipo de Afastamento
            </label>
            <select
              value={tipoAfastamento}
              onChange={(e) =>
                setTipoAfastamento(e.target.value as TipoAfastamento)
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none bg-white transition-colors"
            >
              <option value="MENOR_04_HORAS">
                Até 4 horas (Sem ajuda de custo)
              </option>
              <option value="MAIOR_04_HORAS">De 4 a 8 horas (10%)</option>
              <option value="MAIOR_08_HORAS_ALIMENTACAO_OU_LOCOMOCAO">
                Mais de 8h - Alim. OU Loc. (15%)
              </option>
              <option value="MAIOR_08_HORAS_ALIMENTACAO_E_LOCOMOCAO">
                Mais de 8h - Alim. E Loc. (25%)
              </option>
              <option value="MAIOR_08_HORAS_ALIMENTACAO_E_HOSPEDAGEM">
                Mais de 8h - Alim. ou Loc. c/ Hospedagem (50%)
              </option>
              <option value="MAIOR_08_HORAS_ALIMENTACAO_E_HOSPEDAGEM_E_LOCOMOCAO">
                Mais de 8h - Tudo (60%)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Apoio para Inscrição no Evento (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={inscricaoValor}
              onChange={(e) => setInscricaoValor(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none transition-colors"
              placeholder="0.00"
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#008060] hover:bg-[#006048] rounded-lg transition-colors flex items-center"
            >
              {addLoading && (
                <span className="material-symbols-outlined animate-spin mr-1">
                  progress_activity
                </span>
              )}
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
