import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TripCard } from "../components/TripCard";
import { FabButton } from "../components/FabButton";
import { useAuth } from "../hooks/useAuth";
import { API_URL, getHeaders } from "../utils/api";
// Importar tipos conforme a organização do seu projeto
// import { ViagemDTO } from "../dtos/viagem";
// import { RequisicaoResumoDTO } from "../dtos/requisicao";

// Adicionamos a propriedade `status` ao tipo base
type HomeItem = {
  viagem: ViagemDTO;
  requisicaoId?: string;
  status?: string; // <-- NOVO
};

export function Home() {
  const [items, setItems] = useState<HomeItem[]>([]);
  const [busca, setBusca] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (session?.role === "SERVIDOR") {
          // Lógica do Servidor: Busca as próprias viagens
          const res = await fetch(`${API_URL}/viagens/minhas`, {
            headers: getHeaders(),
          });
          if (!res.ok) throw new Error("Falha ao buscar viagens");

          const data: ViagemDTO[] = await res.json();
          // Servidor não envia 'status' para a HomeItem
          setItems(data.map((v) => ({ viagem: v })));
        } else if (session?.role === "DISCENTE") {
          // Lógica do Discente: Busca as requisições vinculadas a ele
          const res = await fetch(`${API_URL}/requisicoes/minhas`, {
            headers: getHeaders(),
          });
          if (!res.ok) throw new Error("Falha ao buscar requisições");

          const reqs: RequisicaoResumoDTO[] = await res.json();

          // Faz o fetch dos dados da viagem e anexa o req.status no HomeItem
          const itemsPromises = reqs.map(async (req) => {
            const vRes = await fetch(`${API_URL}/viagens/${req.viagemId}`, {
              headers: getHeaders(),
            });
            const viagemData: ViagemDTO = await vRes.json();
            return {
              viagem: viagemData,
              requisicaoId: req.id,
              status: req.status, // <-- INJETAMOS O STATUS AQUI
            };
          });

          const combinedItems = await Promise.all(itemsPromises);
          setItems(combinedItems);
        }
      } catch (err: any) {
        setErro(
          "Não foi possível carregar os dados. Tente novamente mais tarde.",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.role) {
      fetchData();
    }
  }, [session?.role]);

  const itemsFiltrados = items.filter((item) => {
    if (busca.trim() === "") return true;

    const localFinal =
      item.viagem.itinerarios.length > 0
        ? item.viagem.itinerarios[item.viagem.itinerarios.length - 1].local
        : "";

    return localFinal.toLowerCase().includes(busca.toLowerCase());
  });

  const handleNovaViagemClick = () => {
    if (session?.role === "SERVIDOR") {
      navigate("/nova-viagem-coletiva");
    } else {
      navigate("/solicitacao-individual");
    }
  };

  const handleCardClick = (item: HomeItem) => {
    if (session?.role === "SERVIDOR") {
      navigate(`/viagem/${item.viagem.id}`);
    } else {
      navigate(`/minha-requisicao/${item.requisicaoId}`);
    }
  };

  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Minhas Viagens
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl">
              Acompanhe suas solicitações de viagens, roteiros e prazos.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full md:max-w-xs transition-colors focus-within:border-[#008060] focus-within:ring-1 focus-within:ring-[#008060]">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por destino..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0 p-0"
            />
          </div>
        </div>

        {/* Listagem / Loading / Erros */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-[#008060]">
              progress_activity
            </span>
            <p className="font-medium">Carregando viagens...</p>
          </div>
        ) : erro ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            <span className="material-symbols-outlined text-3xl mb-2">
              error
            </span>
            <p className="font-medium">{erro}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsFiltrados.length > 0 ? (
              itemsFiltrados.map((item) => (
                <TripCard
                  key={item.requisicaoId || item.viagem.id}
                  trip={item.viagem}
                  statusRequisicao={item.status} // <-- Repassando o status para o card
                  onClick={() => handleCardClick(item)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                Nenhuma viagem encontrada.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Botão Flutuante (FAB) */}
      <FabButton
        label="Nova Viagem"
        icon="add"
        onClick={handleNovaViagemClick}
      />
    </div>
  );
}
