import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, getHeaders } from "../utils/api";
// Para mostrar um carregando, se quiser
// Interface baseada no seu Record Java/DTO
interface SolicitacaoIndividualCompleta {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  curso: string;
  campus: string;
  email: string;
  telefone?: string;
  endereco?: string;
  justificativa: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  dataSaida: string;
  horaSaida: string;
  dataChegada: string;
  horaChegada: string;
  relatorioEntregue?: boolean;
}

export function DetalhesIndividual() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"DADOS" | "DOCUMENTOS">("DADOS");
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<SolicitacaoIndividualCompleta | null>(null);
  const [relatorioEntregueLocal, setRelatorioEntregueLocal] = useState(() => {
  return localStorage.getItem(`relatorio_${id}`) === 'true';
});
const [showModal, setShowModal] = useState(false);
const [isDeleting, setIsDeleting] = useState(false); 
  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        // Busca todas as solicitações do discente e filtra pelo ID da URL
        const res = await fetch(`${API_URL}/solicitacoes-individuais/minhas`, {
          headers: getHeaders(),
        });
        
        if (res.ok) {
          const lista: SolicitacaoIndividualCompleta[] = await res.json();
          const encontrada = lista.find((s) => s.id === id);
          setDados(encontrada || null);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id]);

  // Componente interno para padronizar os blocos de informação
  const InfoBlock = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-slate-900 font-semibold">{value || "---"}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-[#008060] text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Solicitação não encontrada.
      </div>
    );
  }
  // Verifica se a viagem já terminou (Data Atual >= Data Chegada)
const viagemFinalizada = dados.dataChegada ? new Date() >= new Date(dados.dataChegada) : false;

// Função para lidar com o clique no Anexo VII
const handleRelatorio = () => {
  if (!viagemFinalizada) {
    alert("O Relatório de Viagem (Anexo VII) só pode ser preenchido após o término da viagem.");
    return;
  }
  
  // 1. Muda o estado para a cor mudar agora
  setRelatorioEntregueLocal(true);
  
  // 2. Grava no disco do navegador para nunca mais esquecer
  localStorage.setItem(`relatorio_${id}`, 'true');
  
  navigate(`/relatorio-discente/preencher/${id}`);
};

const baixarArquivo = async (endpoint: string, nomeAmigavel: string) => {
  try {
    // Usamos o fetch para poder enviar o Header de autorização
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(), // Aqui vai o seu Token
    });

    if (!response.ok) throw new Error("Arquivo não encontrado ou erro no servidor");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nomeAmigavel}.pdf`; // Nome que o arquivo terá ao baixar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Não foi possível baixar o arquivo. Verifique se ele já foi gerado.");
  }
};

const confirmarExclusao = async () => {
  setIsDeleting(true);
  try {
    const res = await fetch(`${API_URL}/solicitacoes-individuais/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (res.ok) {
      setIsSuccess(true); // Ativa a tela de sucesso no modal
      
      // Aguarda 2 segundos para o usuário ler e depois navega
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } else {
      alert("Erro ao excluir.");
      setShowModal(false);
    }
  } catch (err) {
    console.error(err);
    setShowModal(false);
  } finally {
    setIsDeleting(false);
  }
};
  return (
    <div className="flex-grow w-full bg-[#f9fafb] min-h-[calc(100vh-64px)] pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
       {/* HEADER COM LIXEIRA */}
<div className="flex justify-between items-start">
  <div>
    <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4">
      <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
      Voltar
    </button>
    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Detalhes da Solicitação</h2>
    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px]">fingerprint</span>
      ID: {id}
    </p>
  </div>

  {/* BOTÃO LIXEIRA */}
 <button 
  onClick={() => setShowModal(true)} // Apenas abre o modal
  className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-3 rounded-xl transition-all shadow-sm flex items-center justify-center group active:scale-95"
>
  <span className="material-symbols-outlined text-[28px]">delete</span>
</button>
</div>

        {/* TABS - Estilo DetalhesViagem */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("DADOS")}
              className={`${activeTab === "DADOS" ? "border-[#008060] text-[#008060]" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"} whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              Dados Gerais
            </button>
            <button
              onClick={() => setActiveTab("DOCUMENTOS")}
              className={`${activeTab === "DOCUMENTOS" ? "border-[#008060] text-[#008060]" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"} whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all`}
            >
              <span className="material-symbols-outlined text-[20px]">folder</span>
              Documentos
            </button>
          </nav>
        </div>

        {/* CONTEÚDO DA ABA: DADOS GERAIS */}
        {activeTab === "DADOS" && (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Card Principal */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-[#008060] mb-6 uppercase tracking-[0.2em] border-b pb-2 flex items-center gap-2">
                 Informações Acadêmicas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
                <InfoBlock label="Nome Completo" value={dados.nome} />
                <InfoBlock label="Matrícula" value={dados.matricula} />
                <InfoBlock label="CPF" value={dados.cpf} />
                <InfoBlock label="Curso" value={dados.curso} />
                <InfoBlock label="E-mail" value={dados.email} />
                <InfoBlock label="Telefone" value={dados.telefone} />
                <InfoBlock label="Campus" value={dados.campus} />
                <InfoBlock label="Endereço" value={dados.endereco} />
              </div>
            </div>

            {/* Grid Inferior: Banco e Justificativa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card Bancário */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-[#008060] mb-6 uppercase tracking-[0.2em]">Dados para Pagamento</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                  <InfoBlock label="Instituição Bancária" value={dados.banco} />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoBlock label="Agência" value={dados.agencia} />
                    <InfoBlock label="Conta" value={dados.conta} />
                  </div>
                </div>
              </div>

              {/* Card Justificativa */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-black text-[#008060] mb-6 uppercase tracking-[0.2em]">Justificativa da Viagem</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 min-h-[120px]">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{dados.justificativa}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

     {activeTab === "DOCUMENTOS" && (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
    
    {/* ANEXO II e V - PADRÃO (AMARELO E VERDE) */}
    {[
      { label: "ANEXO II", desc: "Solicitação Individual de Ajuda de Custo", endpoint: "download-solicitacao" },
      { label: "ANEXO V", desc: "Termo de Compromisso e Responsabilidade", endpoint: "download-termo" }
    ].map((doc) => (
      <div key={doc.label} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-50 text-slate-400">
            <span className="material-symbols-outlined text-3xl">description</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{doc.label}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{doc.desc}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Botão Editar Amarelo */}
          <button 
            onClick={() => navigate("/solicitacao-individual", { state: { edicao: dados } })}
            className="bg-amber-500 hover:bg-amber-600 text-white h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          {/* Botão Baixar Verde */}
          <button 
            onClick={() => baixarArquivo(`/solicitacoes-individuais/${id}/${doc.endpoint}`, doc.label)}
            className="bg-[#008060] hover:bg-[#006048] text-white h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Baixar PDF
          </button>
        </div>
      </div>
    ))}

   {/* ANEXO VII - COM AVISO VISÍVEL ABAIXO DO TEXTO */}
<div className={`bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between transition-all ${
    !viagemFinalizada ? 'bg-slate-50/50' : 'shadow-sm'
  }`}>
  <div className="flex items-center gap-4">
    <div className={`p-3 rounded-lg ${relatorioEntregueLocal ? 'bg-slate-50 text-slate-400' : 'bg-purple-50 text-purple-600'}`}>
      <span className="material-symbols-outlined text-3xl">assignment_turned_in</span>
    </div>
    <div>
      <h4 className="font-bold text-slate-900">ANEXO VII</h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Relatório de Viagem do Discente</p>
      
      {/* AFIRMAÇÃO EM BAIXO - SÓ APARECE SE A VIAGEM NÃO TERMINOU */}
      {!viagemFinalizada && (
        <p className="text-[10px] text-amber-600 font-black uppercase mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">info</span>
          Liberado apenas após o término da viagem
        </p>
      )}
    </div>
  </div>

  <div className="flex gap-2">
    {/* Botão Editar (Amarelo) */}
    {relatorioEntregueLocal && (
      <button 
        onClick={() => navigate(`/relatorio-discente/preencher/${id}`, { state: { edicao: true } })}
        className="bg-amber-500 hover:bg-amber-600 text-white h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
      >
        <span className="material-symbols-outlined text-[20px]">edit</span>
      </button>
    )}

    {/* Botão de Ação */}
    <button 
      onClick={() => {
        if (relatorioEntregueLocal) {
          baixarArquivo(`/api/relatorios-discentes/solicitacao/${id}/pdf`, "ANEXO-VII");
        } else {
          handleRelatorio();
        }
      }}
      disabled={!viagemFinalizada}
      className={`h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
        !viagemFinalizada 
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
          : relatorioEntregueLocal 
            ? 'bg-[#008060] hover:bg-[#006048] text-white' 
            : 'bg-purple-600 hover:bg-purple-700 text-white'
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {relatorioEntregueLocal ? 'download' : 'edit_note'}
      </span>
      {relatorioEntregueLocal ? "Baixar PDF" : "Preencher Relatório"}
    </button>
  </div>
</div>
{/* MODAL DE CONFIRMAÇÃO */}
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300">
      
      {isSuccess ? (
        /* CONTEÚDO DE SUCESSO */
        <div className="flex flex-col items-center text-center animate-in zoom-in duration-300">
          <div className="bg-green-50 text-green-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 scale-110">
            <span className="material-symbols-outlined text-5xl">check_circle</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Excluído!</h3>
          <p className="text-slate-500 text-sm">
            A solicitação e os arquivos foram removidos com sucesso. Redirecionando...
          </p>
        </div>
      ) : (
        /* CONTEÚDO DE PERGUNTA (O que você já tinha) */
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl">delete_forever</span>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 mb-2">Tem certeza?</h3>
          <p className="text-slate-500 text-sm mb-8">
            Você está prestes a excluir esta solicitação e todos os seus anexos.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarExclusao}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
            >
              {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
            </button>
          </div>
        </div>
      )}

    </div>
  </div>
)}
  </div>
)}
      </main>
    </div>
  );
}