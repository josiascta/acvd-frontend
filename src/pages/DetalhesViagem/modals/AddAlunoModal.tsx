import React, { useState } from "react";

type Props = {
  handleAddAlunoBase: (emailsStr: string) => Promise<boolean>;
  addLoading: boolean;
  onClose: () => void;
};

export function AddAlunoModal({
  handleAddAlunoBase,
  addLoading,
  onClose,
}: Props) {
  const [emailDiscente, setEmailDiscente] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleAddAlunoBase(emailDiscente);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Adicionar Aluno</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              E-mails dos Discentes (um por linha)
            </label>
            <textarea
              required
              rows={5}
              value={emailDiscente}
              onChange={(e) => setEmailDiscente(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#008060] focus:border-[#008060] outline-none transition-colors"
              placeholder="aluno1@academico.ifpb.edu.br&#10;aluno2@academico.ifpb.edu.br&#10;aluno3@academico.ifpb.edu.br"
            />
            <p className="text-xs text-slate-500 mt-1">
              Cole os e-mails separados por quebra de linha.
            </p>
          </div>
          <div className="pt-4 flex gap-3 justify-end">
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
