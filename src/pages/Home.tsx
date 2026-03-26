import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TripCard } from "../components/TripCard";
import { FabButton } from "../components/FabButton";
import { useAuth } from "../hooks/useAuth";
import { API_URL, getHeaders } from "../utils/api";
import type { ViagemDTO } from "../dtos/viagem";

interface SolicitacaoIndividualResumo {
  id: string;
  viagemId: string;
  viagem?: ViagemDTO;
  nome: string;
}

type HomeItem = {
  viagem: ViagemDTO;
  requisicaoId?: string;
  status?: string;
};

export function Home() {
  const [items, setItems] = useState<HomeItem[]>([]);
  const [busca, setBusca] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODAS");
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados dos Popups
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showPendingModal, setShowPendingModal] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (session?.role === "SERVIDOR") {
          const res = await fetch(`${API_URL}/viagens/minhas`, {
            headers: getHeaders(),
          });
          if (!res.ok) throw new Error("Falha ao buscar viagens");
          const data: ViagemDTO[] = await res.json();
          setItems(data.map((v) => ({ viagem: v })));
        } else if (session?.role === "DISCENTE") {
          // 1. Verifica se o perfil do aluno está completo
          const userRes = await fetch(`${API_URL}/users/meComplete`, {
            headers: getHeaders(),
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            // Regra básica: se faltar CPF ou Conta Bancária, pede pra completar
            if (!userData.numeroCpf || !userData.contaBancaria) {
              setShowProfileModal(true);
            }
          }

          // 2. Busca as viagens e requisições
          const [resReq, resInd] = await Promise.all([
            fetch(`${API_URL}/requisicoes/minhas`, { headers: getHeaders() }),
            fetch(`${API_URL}/solicitacoes-individuais/minhas`, {
              headers: getHeaders(),
            }),
          ]);

          const reqs = resReq.ok ? await resReq.json() : [];
          const individuais: SolicitacaoIndividualResumo[] = resInd.ok
            ? await resInd.json()
            : [];

          const coletivasPromises = reqs.map(
            async (req: { id: string; viagemId: string; status: string }) => {
              const vRes = await fetch(`${API_URL}/viagens/${req.viagemId}`, {
                headers: getHeaders(),
              });
              const viagemData: ViagemDTO = await vRes.json();
              return {
                viagem: { ...viagemData, solicitacaoId: req.id },
                requisicaoId: req.id,
                status: req.status,
              };
            },
          );

          const individuaisPromises = individuais.map(async (sol) => {
            let viagemData = sol.viagem;

            if (!viagemData && sol.viagemId) {
              const vRes = await fetch(`${API_URL}/viagens/${sol.viagemId}`, {
                headers: getHeaders(),
              });
              if (vRes.ok) {
                viagemData = await vRes.json();
              }
            }

            return {
              viagem: {
                ...viagemData,
                solicitacaoId: sol.id,
                atividadeEvento:
                  (sol as any).atividadeEvento || (sol as any).nomeEvento,
                tipoViagem: "INDIVIDUAL" as const,
              } as ViagemDTO,
              requisicaoId: sol.id,
              status: "GERADA",
            };
          });

          const [coletivasItems, itensIndividuais] = await Promise.all([
            Promise.all(coletivasPromises),
            Promise.all(individuaisPromises),
          ]);

          const listaFinal = [...coletivasItems, ...itensIndividuais].filter(
            (item) => item.viagem && item.viagem.itinerarios,
          );

          setItems(listaFinal);

          // 3. Verifica pendências após montar a lista
          const pendentes = listaFinal.filter(
            (i) => i.status === "AGUARDANDO_ENVIO" || i.status === "REPROVADO",
          ).length;

          if (pendentes > 0) {
            setPendingCount(pendentes);
            // Só mostra o popup de pendências se não estiver mostrando o de perfil
            if (!showProfileModal) {
              setShowPendingModal(true);
            }
          }
        }
      } catch (err: unknown) {
        setErro("Não foi possível carregar os dados.");
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
    // Filtro por texto
    const localFinal =
      item.viagem.itinerarios.length > 0
        ? item.viagem.itinerarios[item.viagem.itinerarios.length - 1].local
        : "";
    const matchBusca =
      busca.trim() === "" ||
      localFinal.toLowerCase().includes(busca.toLowerCase());

    // Filtro por status
    let matchStatus = true;
    if (filtroStatus === "PENDENTES") {
      matchStatus =
        item.status === "AGUARDANDO_ENVIO" || item.status === "REPROVADO";
    } else if (filtroStatus === "CONCLUIDAS") {
      matchStatus = item.status === "APROVADA";
    }

    return matchBusca && matchStatus;
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
      if (item.viagem.tipoViagem === "INDIVIDUAL") {
        navigate(`/minha-solicitacao-individual/${item.viagem.solicitacaoId}`);
      } else {
        navigate(`/minha-requisicao/${item.requisicaoId}`);
      }
    }
  };

  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12 relative">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Minhas Viagens
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl">
              Acompanhe suas solicitações, roteiros e prazos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Filtro de Status */}
            {session?.role === "DISCENTE" && (
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] shadow-sm cursor-pointer"
              >
                <option value="TODAS">Todas as Viagens</option>
                <option value="PENDENTES">Aguardando Envio</option>
                <option value="CONCLUIDAS">Concluídas</option>
              </select>
            )}

            {/* Input de Busca */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm w-full sm:w-64 focus-within:border-[#008060] focus-within:ring-1 focus-within:ring-[#008060]">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por destino..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-transparent border-none text-sm text-slate-700 focus:outline-none p-0"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-[#008060]">
              progress_activity
            </span>
            <p className="font-medium">Carregando viagens...</p>
          </div>
        ) : erro ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            <p className="font-medium">{erro}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsFiltrados.length > 0 ? (
              itemsFiltrados.map((item) => (
                <TripCard
                  key={item.requisicaoId || item.viagem.id}
                  trip={item.viagem}
                  statusRequisicao={item.status}
                  onClick={() => handleCardClick(item)}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                Nenhuma viagem encontrada para o filtro selecionado.
              </div>
            )}
          </div>
        )}
      </main>

      <FabButton
        label="Nova Viagem"
        icon="add"
        onClick={handleNovaViagemClick}
      />

      {/* MODAL GIGANTE DE PERFIL INCOMPLETO */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-amber-500 p-8 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-white text-6xl mb-4">
                manage_accounts
              </span>
              <h2 className="text-3xl font-black text-white">
                Complete seu Perfil!
              </h2>
            </div>
            <div className="p-8 text-center space-y-4">
              <p className="text-lg text-slate-700 font-medium">
                Identificamos que faltam dados importantes no seu cadastro (como{" "}
                <strong>CPF</strong> ou <strong>Dados Bancários</strong>).
              </p>
              <p className="text-slate-500">
                Para solicitar viagens, gerar formulários automaticamente e
                receber seus auxílios sem atrasos, é obrigatório que seu perfil
                esteja 100% preenchido.
              </p>
              <div className="pt-6 flex justify-center gap-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Fazer isso depois
                </button>
                <button
                  onClick={() => navigate("/completar-perfil")}
                  className="px-8 py-3 bg-[#008060] hover:bg-[#006048] text-white text-base font-bold rounded-xl shadow-lg transition-all"
                >
                  Completar Perfil Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DE PENDÊNCIAS */}
      {showPendingModal && !showProfileModal && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-l-4 border-amber-500 shadow-2xl rounded-xl p-5 w-80 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500">
                notification_important
              </span>
              Atenção
            </h3>
            <button
              onClick={() => setShowPendingModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>
          <p className="text-sm text-slate-600">
            Você possui <strong>{pendingCount}</strong> requisição(ões) de
            viagem com pendências. Verifique a lista e envie seus documentos
            para não perder o prazo!
          </p>
          <button
            onClick={() => {
              setFiltroStatus("PENDENTES");
              setShowPendingModal(false);
            }}
            className="mt-4 w-full text-center py-2 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg hover:bg-amber-100 transition-colors"
          >
            Ver viagens pendentes
          </button>
        </div>
      )}
    </div>
  );
}
