import React, { useState } from "react";
import { validationItems } from "../../../hooks/useViagemActions";

type Props = {
  reqToValidate: RequisicaoDetalhesDTO;
  submittingEval: boolean;
  submitValidationBase: (
    reqId: string,
    checkedItems: string[],
    otherObservation: string
  ) => Promise<boolean>;
  onClose: () => void;
};

export function ValidateRequisicaoModal({
  reqToValidate,
  submittingEval,
  submitValidationBase,
  onClose,
}: Props) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [otherObservation, setOtherObservation] = useState("");

  const handleSelectAll = () => {
    if (checkedItems.length === validationItems.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(validationItems.map((item) => item.id));
    }
  };

  const submitValidation = async () => {
    const success = await submitValidationBase(
      reqToValidate.requisicaoId,
      checkedItems,
      otherObservation
    );
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">
              fact_check
            </span>
            Validar Documentação
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 mb-4">
            Marque os itens que estão <strong>corretos</strong> na
            documentação de <strong>{reqToValidate.discente.nome}</strong>.
          </p>

          <button
            onClick={handleSelectAll}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {checkedItems.length === validationItems.length ? "deselect" : "checklist"}
            </span>
            {checkedItems.length === validationItems.length
              ? "Desmarcar todos"
              : "Selecionar todos"}
          </button>

          <div className="space-y-3 mb-6">
            {validationItems.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  checked={checkedItems.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked)
                      setCheckedItems([...checkedItems, item.id]);
                    else
                      setCheckedItems(checkedItems.filter((id) => id !== item.id));
                  }}
                />
                <span
                  className={
                    checkedItems.includes(item.id)
                      ? "text-slate-900 font-medium"
                      : "text-slate-600"
                  }
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {checkedItems.length !== validationItems.length && (
            <div className="animate-fade-in border-t border-slate-100 pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Outras observações / Motivos de reprovação:
              </label>
              <textarea
                rows={3}
                value={otherObservation}
                onChange={(e) => setOtherObservation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Se houver algo mais a corrigir além dos itens desmarcados acima, descreva aqui..."
              />
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px]">
                  warning
                </span>
                A requisição será REPROVADA e o aluno receberá um aviso do que
                precisa consertar.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={submitValidation}
            disabled={submittingEval}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2
              ${
                checkedItems.length === validationItems.length
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
          >
            {submittingEval && (
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
            )}
            {checkedItems.length === validationItems.length
              ? "Aprovar Requisição"
              : "Reprovar Requisição"}
          </button>
        </div>
      </div>
    </div>
  );
}
