async function auth() {
    const senha = prompt("Typing password:");

    if (!senha) {
        alert("Senha não fornecida.");
        return;
    }

    try {
        const resposta = await fetch("/app/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ pass: senha })
        });

        if (!resposta.ok) {
            alert("Incorrect.");
            return;
        }

        window.location.href = "/dash.html"

    } catch (erro) {
        console.error("Error:", erro);
    }
}
auth();