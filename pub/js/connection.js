const ws = new WebSocket("localhost:25565")
const form = document.getElementById("name")

ws.onopen = () => {
    console.log("Conexão aberta!")
}
ws.onclose = () => {
    console.log("Conexão encerrada.")
}

form.addEventListener("submit", (e) => {
    e.preventDefault()
    const data = new FormData(form)
    ws.send({ name: data.name, skin: "your.png" })
})