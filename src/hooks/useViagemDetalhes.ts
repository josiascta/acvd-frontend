import { useState, useCallback, useEffect } from "react";
import { API_URL, getHeaders } from "../utils/api";
import type { ViagemDTO } from "../dtos/viagem";

export function useViagemDetalhes(id?: string) {
  const [viagem, setViagem] = useState<ViagemDTO | null>(null);
  const [requisicoes, setRequisicoes] = useState<RequisicaoDetalhesDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViagem = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/viagens/${id}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        setViagem((await res.json()) as ViagemDTO);
      }
    } catch (err) {
      console.error("Erro ao buscar viagem", err);
    }
  }, [id]);

  const fetchRequisicoes = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/requisicoes/viagens/${id}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const list: RequisicaoResumoDTO[] = await res.json();
        const detalhesPromises = list.map((req) =>
          fetch(`${API_URL}/requisicoes/${req.id}/detalhes`, {
            headers: getHeaders(),
          }).then((r) => (r.ok ? r.json() : null)),
        );
        const detalhadas = await Promise.all(detalhesPromises);
        setRequisicoes(detalhadas.filter((d) => d !== null) as RequisicaoDetalhesDTO[]);
      }
    } catch (err) {
      console.error("Erro ao buscar alunos", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchViagem();
    fetchRequisicoes();
  }, [fetchViagem, fetchRequisicoes]);

  return {
    viagem,
    requisicoes,
    loading,
    fetchViagem,
    fetchRequisicoes,
  };
}
