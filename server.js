const connectLib = require("connect");
const http = require("http");
const slow = require("connect-slow");
const { launch, connect } = require("openfin-adapter");
const serveStatic = require("serve-static");
const fs = require("fs");
const path = require("path");

const appJson = "app.json";
const localJson = "local.json";
const serverParams = {
    root: path.resolve("./"),
    port: 5555,
    open: false,
    logLevel: 2,
    cache: -1,
};
//start the server
var app = connectLib();
app.use(
    slow({
        url: /\.html$/i,
        delay: 1000,
    })
).use(serveStatic("./"));

//If local.json exists, use it instead of app.json
const manifestFile = fs.existsSync(localJson) ? localJson : appJson;

//To Launch the OpenFin Application we need a manifestUrl.
const manifestUrl = `http://localhost:${serverParams.port}/${manifestFile}`;

console.time("Connecting to OpenFin");
http.createServer(app).listen(5555);
//server.listen(serverParams.port);
(async () => {
    try {
        console.log("Launching application from:", manifestUrl);
        //Once the server is running we can launch OpenFin and retrieve the port.
        const port = await launch({ manifestUrl });

        //We will use the port to connect from Node to determine when OpenFin exists.
        const fin = await connect({
            uuid: "server-connection", //Supply an addressable Id for the connection
            address: `ws://localhost:${port}`, //Connect to the given port.
            nonPersistent: true, //We want OpenFin to exit as our application exists.
        });

        //Once OpenFin exists we shut down the server.
        fin.once("disconnected", process.exit);
    } catch (err) {
        console.error(err);
    }
})();
