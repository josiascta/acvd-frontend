import { useState, useCallback } from "react";
import { API_URL, getHeaders } from "../utils/api";

export function useResponsavelLegal() {
  const [responsavel, setResponsavel] = useState<ResponsavelLegalDTO | null>(
    null,
  );
  const [isEditingResp, setIsEditingResp] = useState(false);
  const [uploadingRespDoc, setUploadingRespDoc] = useState(false);

  const fetchResponsavel = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/users/me/responsavel-legal`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.nome) setResponsavel(data);
      }
    } catch (e) {
      console.error(
        "Usuário ainda não possui responsável legal cadastrado.",
        e,
      );
    }
  }, []);

  const handleSalvarResponsavel = async (dados: ResponsavelLegalDTO) => {
    try {
      const res = await fetch(`${API_URL}/users/me/responsavel-legal`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(dados),
      });
      if (res.ok) {
        const data = await res.json();
        setResponsavel(data);
        setIsEditingResp(false);
      } else {
        alert("Erro ao salvar responsável.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    }
  };

  const handleUploadDocResp = async (file: File) => {
    setUploadingRespDoc(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${API_URL}/users/me/responsavel-legal/documento`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        },
      );
      if (res.ok) {
        await fetchResponsavel();
      } else {
        alert(
          "Erro ao enviar o documento do responsável. Verifique se os dados já foram salvos.",
        );
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setUploadingRespDoc(false);
    }
  };

  return {
    responsavel,
    isEditingResp,
    setIsEditingResp,
    uploadingRespDoc,
    fetchResponsavel,
    handleSalvarResponsavel,
    handleUploadDocResp,
  };
}
