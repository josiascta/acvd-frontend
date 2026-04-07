import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signInWithToken } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      const handleOAuthLogin = async () => {
        setIsLoggingIn(true);
        try {
          window.history.replaceState({}, document.title, "/login");
          const userJson = await signInWithToken(token);

          // REDIRECIONAMENTO INTELIGENTE AQUI:
          if (!userJson.matricula) {
            navigate("/completar-perfil", { replace: true });
          } else {
            navigate("/perfil", { replace: true });
          }
        } catch (error) {
          console.error("Erro ao processar login social:", error);
          navigate("/login", { replace: true });
        } finally {
          setIsLoggingIn(false);
        }
      };

      handleOAuthLogin();
    }
  }, [searchParams, navigate, signInWithToken]);
  const handleGoogleLogin = () => {
    // Redireciona para o fluxo do Google no Backend
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-[#f8fcfb] font-sans antialiased">
      {/* Background Decorativo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#008060]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#008060]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/5 overflow-hidden">
          <div className="h-2 w-full bg-[#008060]"></div>

          <div className="px-8 pt-12 pb-12 flex flex-col items-center text-center">
            {/* Logo IFPB Estilizada */}
            <div className="mb-10 flex items-center gap-3">
              <div className="grid grid-cols-3 gap-[3px] w-[36px]">
                <div className="w-2.5 h-2.5 bg-[#ce0e2d] rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
                <div className="opacity-0 w-2.5 h-2.5"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
                <div className="w-2.5 h-2.5 bg-[#329e41] rounded-[1.5px]"></div>
              </div>
              <div className="flex flex-col items-start leading-none pl-3 border-l-2 border-gray-100">
                <span className="font-black text-2xl tracking-tighter text-gray-900">
                  IFPB
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Monteiro
                </span>
              </div>
            </div>

            <h1 className="mb-2 text-5xl font-black tracking-tighter text-gray-900">
              ACVD
            </h1>
            <h2 className="mb-10 text-[11px] font-bold text-[#008060] uppercase tracking-[0.2em] leading-tight text-center">
              Ajuda de Custo de Viagem de Discentes
            </h2>

            <div className="w-full space-y-8">
              <p className="text-sm leading-relaxed text-gray-500 px-6">
                Bem-vindo ao portal. Utilize sua{" "}
                <strong>conta acadêmica</strong> oficial para realizar a
                solicitação.
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#008060] px-6 py-5 text-base font-bold text-white shadow-lg shadow-emerald-100 transition-all duration-200 hover:bg-[#00664d] hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span>Autenticando...</span>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-1 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 48 48">
                        <path
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          fill="#EA4335"
                        ></path>
                        <path
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          fill="#4285F4"
                        ></path>
                        <path
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          fill="#FBBC05"
                        ></path>
                        <path
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          fill="#34A853"
                        ></path>
                      </svg>
                    </div>
                    <span>Entrar com Google Acadêmico</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <span className="cursor-default"></span>
            </div>
          </div>

          <div className="bg-gray-50/50 px-8 py-5 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.3em]">
              © 2026 IFPB Campus Monteiro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
