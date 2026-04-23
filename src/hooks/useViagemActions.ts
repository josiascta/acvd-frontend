import { useState } from "react";
import { API_URL, getHeaders } from "../utils/api";

type ValidationItem = {
  id: string;
  label: string;
  errorMsg: string;
};

export const validationItems: ValidationItem[] = [
  {
    id: "doc_discente",
    label: "Documento de identificação do discente correto e legível",
    errorMsg: "Documento de identificação do discente ilegível ou incorreto",
  },
  {
    id: "doc_responsavel",
    label: "Documento do responsável legal correto e legível",
    errorMsg: "Documento do responsável legal ilegível ou incorreto",
  },
  {
    id: "info_responsavel",
    label: "Informações do responsável legal consistentes e completas",
    errorMsg:
      "Informações do responsável legal estão divergentes ou incompletas",
  },
  {
    id: "dados_pessoais",
    label: "Dados pessoais do discente compatíveis com a documentação",
    errorMsg: "Dados pessoais do discente divergentes da documentação",
  },
  {
    id: "assinaturas",
    label: "Assinaturas e formatação dos documentos válidas",
    errorMsg:
      "Falta de assinatura ou formatação inválida nos documentos exigidos",
  },
  {
    id: "anexo_v",
    label: "Termo de Compromisso (Anexo V) preenchido corretamente",
    errorMsg:
      "Termo de Compromisso (Anexo V) ausente ou preenchido incorretamente",
  },
];

export function useViagemActions(id?: string, fetchRequisicoes?: () => void) {
  const [addLoading, setAddLoading] = useState(false);
  const [submittingEval, setSubmittingEval] = useState(false);

  const handleAddAlunoBase = async (emailsStr: string) => {
    if (!id) return false;
    setAddLoading(true);

    const emails = emailsStr
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email !== "");

    if (emails.length === 0) {
      alert("Por favor, insira pelo menos um e-mail válido.");
      setAddLoading(false);
      return false;
    }

    try {
      const promises = emails.map(async (email) => {
        const payload = {
          emailDiscente: email,
          valorDiaria: 0,
          inscricaoValor: 0,
        };
        try {
          const res = await fetch(
            `${API_URL}/requisicoes/viagens/${id}/adicionar-discente/email`,
            {
              method: "POST",
              headers: getHeaders(),
              body: JSON.stringify(payload),
            },
          );
          if (!res.ok) {
            return { success: false, email };
          }
          return { success: true, email };
        } catch (error) {
          return { success: false, email };
        }
      });

      const results = await Promise.all(promises);
      const sucessos = results.filter((r) => r.success);
      const falhas = results.filter((r) => !r.success);

      if (falhas.length > 0) {
        const falhasEmails = falhas.map((f) => f.email).join("\n- ");
        alert(
          `Processo concluído com ressalvas:\n\n` +
            `${sucessos.length} aluno(s) adicionado(s) com sucesso.\n\n` +
            `Falha ao adicionar os seguintes e-mails:\n- ${falhasEmails}\n\n` +
            `Motivo provável: O aluno não possui cadastro no sistema ou já está na viagem.`,
        );
      }

      if (sucessos.length > 0 || falhas.length === 0) {
        if (fetchRequisicoes) fetchRequisicoes();
        return true; // Indicador de sucesso para fechar o modal
      }
      return false;
    } catch (error) {
      alert("Falha inesperada ao tentar adicionar alunos.");
      return false;
    } finally {
      setAddLoading(false);
    }
  };

  const submitValidationBase = async (
    reqId: string,
    checkedItems: string[],
    otherObservation: string,
  ) => {
    setSubmittingEval(true);
    const isAllChecked = checkedItems.length === validationItems.length;

    try {
      if (isAllChecked) {
        // APROVAR
        const res = await fetch(`${API_URL}/requisicoes/${reqId}/avaliar`, {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            status: "APROVADA",
            motivoReprovacao: null,
          }),
        });
        if (!res.ok) throw new Error("Erro ao aprovar");
      } else {
        // REPROVAR
        const missingItems = validationItems.filter(
          (item) => !checkedItems.includes(item.id),
        );
        let finalMotivo = missingItems.map((item) => item.errorMsg).join(" | ");

        if (otherObservation.trim() !== "") {
          finalMotivo += finalMotivo
            ? ` | Outras observações: ${otherObservation.trim()}`
            : `Outras observações: ${otherObservation.trim()}`;
        }
        if (finalMotivo.trim() === "") {
          finalMotivo = "Documentação incompleta ou inválida.";
        }

        const res = await fetch(`${API_URL}/requisicoes/${reqId}/avaliar`, {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            status: "REPROVADO",
            motivoReprovacao: finalMotivo,
          }),
        });
        if (!res.ok) throw new Error("Erro ao reprovar");
      }
      if (fetchRequisicoes) fetchRequisicoes();
      return true;
    } catch (err) {
      alert("Falha ao avaliar requisição.");
      return false;
    } finally {
      setSubmittingEval(false);
    }
  };

  // Altere a função no seu hook para receber o ID como parâmetro
  const handleDownloadAnexoI = async (solicitacaoColetivaId?: string) => {
    // Se não existir o ID, significa que o usuário ainda não preencheu e salvou no banco
    if (!solicitacaoColetivaId) {
      alert("Você precisa preencher (Editar) o Anexo I antes de baixá-lo.");
      return;
    }

    try {
      // Usamos o ID que veio por parâmetro
      const res = await fetch(
        `${API_URL}/solicitacoes-coletivas/${solicitacaoColetivaId}/download`,
        { method: "GET", headers: getHeaders() },
      );

      if (!res.ok) throw new Error("Arquivo não encontrado no servidor.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Anexo_I_Viagem_${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar Anexo I:", error);
      alert(
        "Falha ao baixar o Anexo I. Verifique se o documento já foi gerado.",
      );
    }
  };

  const handleDownloadAnexoIV = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/pdf/viagens/${id}/discentes-participantes`,
        { method: "GET", headers: getHeaders() },
      );
      if (!res.ok) throw new Error("Erro ao baixar o arquivo");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Anexo_IV_Discentes_Participantes_${id}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar Anexo IV:", error);
      alert(
        "Falha ao baixar o documento. Verifique se há alunos na viagem ou tente novamente mais tarde.",
      );
    }
  };

  const handleDeleteAluno = (reqId: string) => {
    alert("Fazer ainda.");
  };

  return {
    addLoading,
    submittingEval,
    handleAddAlunoBase,
    submitValidationBase,
    handleDownloadAnexoI,
    handleDownloadAnexoIV,
    handleDeleteAluno,
  };
}
