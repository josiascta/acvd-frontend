import { useState, useCallback } from "react";
import { API_URL, getHeaders } from "../utils/api";

export function useDocumentoUsuario() {
  const [documentoUser, setDocumentoUser] =
    useState<DocumentoResponseDTO | null>(null);
  const [uploadingUserDoc, setUploadingUserDoc] = useState(false);

  const fetchDocumentoUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/documentos`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) setDocumentoUser(data);
      }
    } catch (e) {
      console.error("Erro ao buscar documento do usuário", e);
    }
  }, []);

  const handleUploadUserDoc = async (file: File) => {
    setUploadingUserDoc(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/documentos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      if (res.ok) await fetchDocumentoUser();
      else alert("Erro ao enviar o documento.");
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setUploadingUserDoc(false);
    }
  };

  return {
    documentoUser,
    uploadingUserDoc,
    fetchDocumentoUser,
    handleUploadUserDoc,
  };
}
