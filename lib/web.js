const express = require("express")
const path = require("path")
const { spawn } = require('child_process');
const os = require('os');

const app = express()
app.use(express.static(path.join(__dirname, "..", "pub")));

var svobj = null

app.get("/info", (req, res) => {
    const uptime = process.uptime()

    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60)

    const m = String(minutes).padStart(2, '0'); 
    const h = String(hours).padStart(2, '0'); 
    const s = String(seconds).padStart(2,'0')

    return res.status(200).json({ hs: { seconds, minutes, hours, formated: `${h}:${m}:${s}` }, name: svobj.name, port: svobj.port })
})

function getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;
    cpus.forEach(core => {
        for (let type in core.times) totalTick += core.times[type];
        totalIdle += core.times.idle;
    });
    return { totalIdle, totalTick };
}
let startCPU = getCPUUsage();

app.get('/metrics', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const interval = setInterval(() => {
        const endCPU = getCPUUsage();
        const idleDifference = endCPU.totalIdle - startCPU.totalIdle;
        const totalDifference = endCPU.totalTick - startCPU.totalTick;
        const cpuPercentage = 100 - Math.floor((100 * idleDifference) / totalDifference);
        startCPU = endCPU;

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const ramPercentage = Math.floor(((totalMem - freeMem) / totalMem) * 100);

        const dados = JSON.stringify({
            cpu: cpuPercentage,
            ram: ramPercentage,
            time: new Date().toLocaleTimeString()
        });
        
        res.write(`data: ${dados}\n\n`);
    }, 2000);
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});

function listen(port) {
    app.listen(port)
    console.log("\e[1;31mplugin@server:~#\e[0m : Web live in: " + port)
}
function op(server) {
    svobj = server
}

module.exports = { listen, op }