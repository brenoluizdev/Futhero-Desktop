import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Gamepad2, Zap } from "lucide-react";
import type { ElectronAPI } from "@/types/electron";

interface GameInfo {
  id: "bonk" | "haxball";
  name: string;
  icon: string;
  description: string;
  color: string;
  url: string;
}

const games: GameInfo[] = [
  {
    id: "bonk",
    name: "Bonk.io",
    icon: "🎯",
    description: "Jogo de combate multiplayer em tempo real",
    color: "from-orange-500 to-orange-600",
    url: "https://bonk.io",
  },
  {
    id: "haxball",
    name: "Haxball",
    icon: "⚽",
    description: "Futebol multiplayer com física realista",
    color: "from-green-500 to-green-600",
    url: "https://haxball.com",
  },
];

export default function GameLauncher() {
  const [selectedGame, setSelectedGame] = useState<"bonk" | "haxball" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appVersion, setAppVersion] = useState("1.0.0");
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    // Obter versão do app
    const electronAPI = window.electronAPI as ElectronAPI | undefined;
    if (electronAPI) {
      electronAPI.getAppVersion().then((result) => {
        setAppVersion(result.version);
      });

      // Verificar atualizações
      electronAPI.checkForUpdates().then((result) => {
        setHasUpdate(result.hasUpdate);
      });
    }
  }, []);

  const handlePlayGame = async (gameId: "bonk" | "haxball") => {
    setIsLoading(true);
    setSelectedGame(gameId);

    try {
      const electronAPI = window.electronAPI as ElectronAPI | undefined;
      if (electronAPI) {
        await electronAPI.openGame(gameId);
      }
    } catch (error) {
      console.error("Erro ao abrir jogo:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-orange-500/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🎮</div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Game Launcher</h1>
                  <p className="text-orange-400 text-sm">Bonk.io & Haxball</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">v{appVersion}</p>
                {hasUpdate && (
                  <div className="flex items-center gap-2 text-yellow-400 text-sm mt-1">
                    <Zap size={16} />
                    Atualização disponível
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Título e descrição */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Bem-vindo ao Game Launcher
              </h2>
              <p className="text-gray-400 text-lg">
                Escolha um jogo e comece a jogar agora. Acesse o menu do launcher
                durante o jogo pressionando o botão no canto inferior direito.
              </p>
            </div>

            {/* Grid de jogos */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className={`relative overflow-hidden border-2 border-orange-500/30 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 cursor-pointer group bg-gradient-to-br ${game.color}/5`}
                      onClick={(e) => {
                        e.preventDefault();
                        !isLoading && handlePlayGame(game.id);
                      }}
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  ></div>

                  {/* Conteúdo */}
                  <div className="relative p-8">
                    <div className="text-6xl mb-4">{game.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
                    <p className="text-gray-400 mb-6">{game.description}</p>

                    <Button
                      className={`w-full bg-gradient-to-r ${game.color} text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}
                      disabled={isLoading}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePlayGame(game.id);
                      }}
                      type="button"
                    >
                      {isLoading && selectedGame === game.id ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <Gamepad2 size={20} />
                          Jogar {game.name}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Border animada */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-500/50 rounded-lg pointer-events-none transition-colors duration-300"></div>
                </Card>
              ))}
            </div>

            {/* Informações adicionais */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/30 rounded-lg p-8">
              <h3 className="text-xl font-bold text-white mb-4">ℹ️ Como Usar</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">1.</span>
                  <span>Clique em um dos jogos acima para começar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">2.</span>
                  <span>Durante o jogo, procure pelo botão ⚙️ no canto inferior direito</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">3.</span>
                  <span>Use o menu para mudar de jogo, acessar configurações ou apoiar o projeto</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">4.</span>
                  <span>Pressione ESC para fechar o menu</span>
                </li>
              </ul>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-orange-500/20 backdrop-blur-sm mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <p>© 2024 Game Launcher. Todos os direitos reservados.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-orange-400 transition-colors">
                  GitHub
                </a>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Suporte
                </a>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Sobre
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
