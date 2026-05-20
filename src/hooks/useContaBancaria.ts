import { useState, useCallback } from "react";
import { API_URL, getHeaders } from "../utils/api";

export function useContaBancaria() {
  const [contaBancaria, setContaBancaria] = useState<ContaBancariaDTO | null>(
    null,
  );
  const [isEditingConta, setIsEditingConta] = useState(false);

  const fetchContaBancaria = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/users/me/conta-bancaria`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.banco) {
          setContaBancaria(data);
        }
      }
    } catch (e) {
      console.error("Usuário ainda não possui conta bancária cadastrada.", e);
    }
  }, []);

  const handleSalvarConta = async (dados: ContaBancariaDTO) => {
    try {
      const res = await fetch(`${API_URL}/users/me/conta-bancaria`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(dados),
      });
      if (res.ok) {
        const data = await res.json();
        setContaBancaria(data);
        setIsEditingConta(false);
      } else {
        alert("Erro ao salvar conta bancária.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    }
  };

  return {
    contaBancaria,
    isEditingConta,
    setIsEditingConta,
    fetchContaBancaria,
    handleSalvarConta,
  };
}
