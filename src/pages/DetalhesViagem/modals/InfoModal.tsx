import React from "react";

type Props = {
  selectedReq: RequisicaoDetalhesDTO;
  onClose: () => void;
};

const formatarData = (dataStr?: string) => {
  if (!dataStr) return "Não informada";
  const [year, month, day] = dataStr.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

const isMenorDeIdade = (dataNascimentoStr?: string) => {
  if (!dataNascimentoStr) return false;
  const hoje = new Date();
  const dataNascimento = new Date(dataNascimentoStr);
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const m = hoje.getMonth() - dataNascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }
  return idade < 18;
};

export function InfoModal({ selectedReq, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-full overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
          <h3 className="font-bold text-lg text-slate-800">
            Informações Complementares
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <section>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
              Dados do Discente
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="font-semibold text-slate-700">Nome:</span>{" "}
                {selectedReq.discente.nome}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Matrícula:</span>{" "}
                {selectedReq.discente.matricula}
              </div>
              <div>
                <span className="font-semibold text-slate-700">E-mail:</span>{" "}
                {selectedReq.discente.email}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Telefone:</span>{" "}
                {selectedReq.discente.telefone}
              </div>
              <div>
                <span className="font-semibold text-slate-700">CPF:</span>{" "}
                {selectedReq.discente.cpf}
              </div>
              <div>
                <span className="font-semibold text-slate-700">RG:</span>{" "}
                {selectedReq.discente.rg || "Não informado"}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Data de Nasc.:</span>{" "}
                {formatarData(selectedReq.discente.dataNascimento)}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Curso:</span>{" "}
                {selectedReq.discente.curso}
              </div>
            </div>
          </section>

          {isMenorDeIdade(selectedReq.discente.dataNascimento) &&
            selectedReq.responsavelLegal && (
              <section>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Responsável legal
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-700">Nome:</span>{" "}
                    {selectedReq.responsavelLegal.nome}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">CPF:</span>{" "}
                    {selectedReq.responsavelLegal.cpf}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Contato:</span>{" "}
                    {selectedReq.responsavelLegal.contato}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">RG:</span>{" "}
                    {selectedReq.responsavelLegal.rg}
                  </div>
                </div>
              </section>
            )}

          {selectedReq.contaBancaria && (
            <section>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                Conta Bancária
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-700">Banco:</span>{" "}
                  {selectedReq.contaBancaria.banco}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Agência:</span>{" "}
                  {selectedReq.contaBancaria.agencia}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Conta:</span>{" "}
                  {selectedReq.contaBancaria.numero}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Operação:</span>{" "}
                  {selectedReq.contaBancaria.operacao}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
