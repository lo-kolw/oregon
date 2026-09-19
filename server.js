const EventEmitter = require('events');
const crypto = require('crypto');
const webSocket = require('ws');
const readline = require('readline');

// cowebs

const web = require("./lib/web.js")

class CommandExtender {
    constructor(server) {
        this.server = server;
    }

    active() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on('line', (input) => {
            const args = input.trim().split(' ');
            const comando = args[0].toLowerCase();

            switch (comando) {
                case 'status':
                    console.log(`[s+] Ok ${this.server ? this.server.name : ''}`);
                    break;

                case 'kick': {
                    const playerKick = args[1];
                    if (!playerKick) {
                        console.log(' Correct Use: <nome>');
                    } else {
                        console.log(`[KICK] Kicking client: ${playerKick}`);

                        if (this.server && this.server.wss) {
                            this.server.wss.clients.forEach(client => {
                                if (client.name === playerKick) {
                                    client.send(JSON.stringify({ type: "notification", message: "Your kicked by operator." }));
                                    client.close();
                                }
                            });

                            this.server.clients = this.server.clients.filter(c => c.name !== playerKick);
                        }
                    }
                }
                case 'restart':
                    console.log("\n[Sistemy/Oragon] Restarting you server...");
                    const child = spawn(process.argv[0], process.argv.slice(1), {
                        detached: true,
                        stdio: 'inherit'
                    });

                    child.unref();
                    process.exit(0);
                case 'ban': {
                    const playerBan = args[1];
                    if (!playerBan) {
                        console.log(' Uso correto: ban <nome>');
                    } else {
                        console.log(`[BAN] Banindo jogador: ${playerBan}`);

                        if (this.server && this.server.wss) {
                            this.server.wss.clients.forEach(client => {
                                if (client.name === playerBan) {
                                    client.send(JSON.stringify({ type: "notification", message: "Você foi banido." }));
                                    client.close();
                                }
                            });
                            this.server.clients = this.server.clients.filter(c => c.name !== playerBan);
                        }
                    };
                    break;
                }
                case 'sair':
                    console.log('Encerrando o leitor de comandos...');
                    rl.close();
                    process.exit(0);
                    break;

                default:
                    if (comando.length > 0) {
                        console.log(` Comando "${comando}" não reconhecido.`);
                        break;
                    }
            }
        })
    }
};

class Server extends EventEmitter {
    constructor(opt) {
        super();
        this.wss = null;
        this.port = opt.port;
        this.proxy = opt.proxy;
        this.name = opt.name;
        this.clients = [];
        this.img = opt.img;
        this.type = opt.type || "server";
        this.webhooks = opt.webhooks;
        this.messages = []
        this.clusterMode = opt.clusterMode;
    }

    listen() {
        const wss = new webSocket.Server({ port: this.port });
        this.wss = wss;

        wss.on('connection', ws => {
            ws.id = crypto.randomUUID();

            ws.on("message", (msgbr) => {
                try {
                    const msg = JSON.parse(msgbr);

                    if (msg.type === "join") {
                        ws.name = msg.name;
                        this.clients.push({ uuid: ws.id, name: ws.name, role: "member" });
                        this.emit('connection', { id: ws.id, name: ws.name });
                        const payload = JSON.stringify({
                            type: "join",
                            client: ws.name || msg.name,
                            skin: msg.skin,
                            role: this.clients.find(c => c.name == msg.name).role || "member"
                        });
                        this.broadcast(payload)
                    }
                    if (msg.type === "message") {
                        ws.name = msg.name
                        var mesg = { type: "message", name: msg.name, message: msg.message, role: this.clients.find(c => c.name == msg.name).role || "member" }
                        this.messages.push(mesg);
                        this.emit('connection', { id: ws.id, name: ws.name });
                        if (msg.job) { this.broadcast(mesg) }
                    }


                } catch (err) {
                    console.error("Erro ao processar mensagem JSON:", err.message);
                }
            });

            ws.on('close', () => {
                this.clients = this.clients.filter(c => c.uuid !== ws.id);
                this.emit('disconnect', { id: ws.id, name: ws.name || "Player" });
            });
        });

        this.emit('listen', { name: this.name, port: this.port });
    }
    broadcast(message) {
        this.wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify(message))
            }
        });
    }
}

module.exports = { Server, CommandExtender, web };