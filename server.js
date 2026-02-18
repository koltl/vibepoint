const http = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { attachSocketHandler } = require("./server/socket-handler.js");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    if (req.url && req.url.startsWith("/api/socket")) return;
    handle(req, res);
  });
  const io = new Server(server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });
  attachSocketHandler(io);

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
