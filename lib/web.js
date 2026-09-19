const express = require("express");
const cors = require("cors")
const path = require("path");
const cp = require("cookie-parser")
const fs = require('fs/promises');
const os = require('os');
const crypto = require('crypto');

const app = express();
app.use(express.static(path.join(__dirname, "..", "pub")));

var svobj = null;

const MAX_HISTORY = 30;
const history = [];

app.use(cp())
app.use(express.json())
app.use(cors())

app.post('/app/login', async (req, res) => {
    const { pass } = req.body;

    if (!pass) { return res.status(400).json("400 Bad Request.") }
    const r = await fs.readFile(path.join(__dirname, "./json/system.json"))
    const jsn = JSON.parse(r)

    if (pass === jsn.join.password) {
        const token = crypto.randomBytes(32).toString('base64url');

        res.cookie('session_id', token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000
        });

        jsn.tokens.unique = token

        await fs.writeFile(path.join(__dirname, "./json/system.json"), JSON.stringify(jsn))
        return res.json({ ok: true });
    }

    return res.status(401).json({ erro: "Incorrect password." });
});

async function middle(req, res, next) {
    const r = await fs.readFile(path.join(__dirname, "./json/system.json"))
    const token = req.cookies.session_id;
    if (!token || token !== JSON.parse(r).tokens.unique) {
        return res.redirect('/login.html');
    }

    next();
}

app.use(middle)

app.use(express.static(path.join(__dirname, "..", "pri")))

app.post('/app/change-password', middle, async (req, res) => {
    try {
        const { currentPass, newPass } = req.body || {};

        if (!currentPass || !newPass) {
            return res.status(400).json({ erro: "Required inputs." });
        }

        const caminhoJson = path.join(__dirname, "./json/system.json");
        const content = await fs.readFile(caminhoJson, 'utf-8');
        const jsn = JSON.parse(content);

        if (currentPass !== jsn.join.password) {
            return res.status(401).json({ erro: "Current Password not okay." });
        }
        jsn.join.password = newPass;
        await fs.writeFile(caminhoJson, JSON.stringify(jsn, null, 4));

        return res.json({ ok: true, mensagem: "Ok!" });

    } catch (err) {
        console.error("Erro ao alterar senha:", err);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    }
});

app.get("/info", (req, res) => {
    const uptime = process.uptime();

    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const m = String(minutes).padStart(2, '0');
    const h = String(hours).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    return res.status(200).json({ hs: { seconds, minutes, hours, formated: `${h}:${m}:${s}` }, name: svobj ? svobj.name : '', port: svobj ? svobj.port : null });
});

function getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    cpus.forEach(core => {
        for (let type in core.times) totalTick += core.times[type];
        totalIdle += core.times.idle;
    });
    return { totalIdle, totalTick };
}

app.post("/stop", () => {process.exit(0)})

let startCPU = getCPUUsage();
setInterval(() => {
    const endCPU = getCPUUsage();
    const idleDifference = endCPU.totalIdle - startCPU.totalIdle;
    const totalDifference = endCPU.totalTick - startCPU.totalTick;
    const cpuPercentage = totalDifference > 0 ? 100 - Math.floor((100 * idleDifference) / totalDifference) : 0;
    startCPU = endCPU;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const ramPercentage = Math.floor(((totalMem - freeMem) / totalMem) * 100);

    const dataPoint = {
        cpu: cpuPercentage,
        ram: ramPercentage,
        time: new Date().toLocaleTimeString()
    };

    history.push(dataPoint);
    if (history.length > MAX_HISTORY) {
        history.shift();
    }
}, 2000);

app.get('/metrics', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`event: history\ndata: ${JSON.stringify(history)}\n\n`);

    const interval = setInterval(() => {
        const lastPoint = history[history.length - 1];
        if (lastPoint) {
            res.write(`data: ${JSON.stringify(lastPoint)}\n\n`);
        }
    }, 2000);

    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

function listen(port) {
    app.listen(port, '0.0.0.0');
    console.log("\x1b[1;31mplugin@server:~#\x1b[0m : Web live in: " + port);
}

function op(server) {
    svobj = server;
}

module.exports = { listen, op };