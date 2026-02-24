import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fcfb] flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-[#008060]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] pointer-events-none"></div>

      <main className="relative z-10 max-w-lg w-full flex flex-col items-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter drop-shadow-sm">
            404
          </h1>
          <div className="h-1.5 w-24 bg-[#008060] rounded-full mx-auto"></div>
        </div>

        <div className="space-y-3 px-4">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Ops! Você se perdeu no campus.
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-500 leading-relaxed">
            A página que você está procurando pode ter sido removida, mudou de
            nome ou o link está incorreto.
          </p>
        </div>

        <div className="pt-8 w-full sm:w-auto">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#008060] text-white text-sm font-bold uppercase tracking-widest rounded-2xl hover:bg-[#00664d] transition-all shadow-lg shadow-[#008060]/30 hover:shadow-[#008060]/50 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#008060]/20"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
            Voltar para o Início
          </button>
        </div>
      </main>
    </div>
  );
}
