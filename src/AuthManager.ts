import { app, shell, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as http from 'http';
import * as url from 'url';

export class AuthManager {
    private tokenPath: string;
    private backendUrl: string = 'https://backend-launcher.vercel.app';
    private callbackPort: number = 5173;
    private authServer: http.Server | null = null;
    private mainWindow: BrowserWindow | null = null;

    constructor() {
        this.tokenPath = path.join(app.getPath('userData'), 'auth.json');
    }

    setMainWindow(window: BrowserWindow) {
        this.mainWindow = window;
    }

    getToken(): string | null {
        try {
            if (fs.existsSync(this.tokenPath)) {
                const data = JSON.parse(fs.readFileSync(this.tokenPath, 'utf-8'));
                return data.token;
            }
        } catch (error) {
            console.error('[AuthManager] Erro ao ler token:', error);
        }
        return null;
    }

    saveToken(token: string) {
        try {
            fs.writeFileSync(this.tokenPath, JSON.stringify({ token }), 'utf-8');
            console.log('[AuthManager] Token salvo com sucesso.');
        } catch (error) {
            console.error('[AuthManager] Erro ao salvar token:', error);
        }
    }

    logout() {
        try {
            if (fs.existsSync(this.tokenPath)) {
                fs.unlinkSync(this.tokenPath);
                console.log('[AuthManager] Token removido (logout).');
                return true;
            }
        } catch (error) {
            console.error('[AuthManager] Erro ao remover token:', error);
        }
        return false;
    }

    async validateToken(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await axios.get(`${this.backendUrl}/auth/validate`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.valid;
        } catch (error) {
            console.error('[AuthManager] Token inválido ou erro de conexão:', error);
            return false;
        }
    }

    async startLoginFlow() {
        // 1. Abrir navegador externo
        await shell.openExternal(`${this.backendUrl}/auth/discord`);

        // 2. Iniciar servidor local para escutar o callback
        this.startLocalServer();
    }

    private startLocalServer() {
        if (this.authServer) {
            this.authServer.close();
        }

        this.authServer = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url || '', true);
            
            // O backend redireciona para /auth-success?token=...
            if (parsedUrl.pathname === '/auth-success') {
                const token = parsedUrl.query.token as string;
                
                if (token) {
                    this.saveToken(token);
                    console.log('[AuthManager] Token recebido via servidor local.');
                    
                    // Notificar a janela principal para atualizar a UI
                    if (this.mainWindow) {
                        this.mainWindow.webContents.send('auth:success');
                    }

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Realizado - Futhero</title>
    <style>
        body {
            background-color: #0a0a0a;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
        }
        .container {
            padding: 40px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 24px;
            border: 1px solid rgba(249, 115, 22, 0.2);
            text-align: center;
            max-width: 90%;
            width: 400px;
            box-shadow: 0 0 40px rgba(0,0,0,0.5);
            animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        h1 { color: #f97316; margin: 20px 0 10px; font-size: 28px; }
        p { color: #888; margin-bottom: 20px; line-height: 1.5; }
        .icon { font-size: 64px; margin-bottom: 10px; animation: bounce 1s infinite alternate; }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">✨</div>
        <h1>Login Concluído!</h1>
        <p>Sua autenticação foi realizada com sucesso.</p>
        <p style="font-size: 14px;">Você já pode fechar esta aba e voltar para o launcher.</p>
    </div>
    <script>
        // Tenta fechar a janela automaticamente
        setTimeout(() => {
            window.opener = null;
            window.open('', '_self');
            window.close();
        }, 1500);
    </script>
</body>
</html>`;
                    res.end(html);
                    
                    // Fechar o servidor após sucesso
                    this.stopLocalServer();
                } else {
                    res.writeHead(400);
                    res.end('Token não encontrado.');
                }
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });

        this.authServer.listen(this.callbackPort, () => {
            console.log(`[AuthManager] Escutando callback na porta ${this.callbackPort}...`);
        });

        this.authServer.on('error', (err) => {
            console.error('[AuthManager] Erro no servidor local:', err);
        });
    }

    private stopLocalServer() {
        if (this.authServer) {
            this.authServer.close();
            this.authServer = null;
            console.log('[AuthManager] Servidor local encerrado.');
        }
    }
}
