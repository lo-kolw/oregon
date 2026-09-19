const pass = document.getElementById("npassbtn")
const cpass = document.getElementById("cpass")

pass.addEventListener("click", async (e) => {
    console.log("Here!")
    const currentPass = prompt("Atual Password:");
    if (!currentPass) return;

    const newPass = prompt("New Password:");
    if (!newPass) return;

    try {
        const resposta = await fetch("/app/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ currentPass, newPass })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert("Erro: " + (dados.erro || "Falha ao alterar senha."));
            return;
        }

        alert("Okay!");
    } catch (err) {
        console.error(err)

    }
})

function stops() {
    const confirmou = confirm("Stop?");
    if (!confirmou) return;
}