const life = document.querySelectorAll(".life")
const name = document.querySelectorAll(".name")

async function getime() {
    const response = await fetch("/info")
    const json = await response.json()

    var format = json.hs.formated
    console.log(json)

    life.forEach(element => {
        element.textContent = format
    });
    name.forEach(element => {
        element.textContent = json.name
    });

}
getime()