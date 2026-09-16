
## Badges
[![NPM](https://img.shields.io/badge/npm-pack-green?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/oregonserver)
[![GITHUB](https://shields.io/badge/github-repo-blue?style=for-the-badge&logo=github)](https://github.com/lo-kolw/oregon)
[![CONTRIBUTORS](https://img.shields.io/github/contributors/lo-kolw/oregon?style=for-the-badge)](https://github.com/lo-kolw/oregon)
[![Downloads](https://img.shields.io/npm/dm/oregonserver?style=for-the-badge)](https://github.com/lo-kolw/oregon)  
🙏🏻 Help us grow, too new
# Oragon Server

Oragon Servers is a live streaming API for clients; it is lightweight, compact, and very easy to install.

## Example code to listen:
```
const oregon = require("oregonserver")

// Create and insert basic info
const server = new oregon.Server({
    type: "server", 
    name: "SERVER",
    img: "NONE",
    webhooks: [],
    port: 25565,
    clusterMode: false,
    proxy: {
        host: "0.0.0.0",
        enabled: false
    }
})

// Sec for listen To listen
```

## With the web extension and commandLine:
```
const cmdLine = new oregon.CommandExtender(server)
cmdLine.active()

server.on('listen', sv => {
    console.log(`Servidor ${sv.name} ativo na porta ${sv.port}`)
})
server.on('connection', client => {
    console.log("[+] " + client.name)
})
server.on('disconnect', client => {
    console.log("[-] " + client.name)
})
```

## Package Config
```
oregon.web.op(server)
```

## To listen
```
// Server one
server.listen(

// web server
oregon.web.listen(25564)
```

## Recommended!

We utilize WebSocket concepts and the Express framework, employing a GitHub library licensed under the Free Software Foundation's GPL (2007) <[fsf.org](https://fsf.org)>. The system is suitable for applications such as chat services, games, and management tools; while other use cases are possible, these are the ones we recommend.

Happy coding!
