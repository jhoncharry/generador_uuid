require("dotenv").config();

// Módulos requeridos
const express = require("express");
const cors = require("cors");

const http = require("http");
const https = require("https");
const fs = require("fs");

const helmet = require("helmet");
var compression = require("compression");
const { v4: uuidv4 } = require("uuid");

const httpsServerOptions = {
  key: fs.readFileSync(process.env.KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH),
};

const app = express();
app.use(helmet()); // Ayuda a proteger aplicaciones Express
app.use(compression());
app.use(cors());

// Servidor HTTP
const serverHttp = http.createServer(app);
serverHttp.listen(process.env.HTTP_PORT, process.env.IP);

// Servidor HTTPS
const serverHttps = https.createServer(httpsServerOptions, app);
serverHttps.listen(process.env.HTTPS_PORT, process.env.IP);

// Redirect to HTTPS
app.use((req, res, next) => {
  if (req.secure) next();
  else res.redirect(`https://${req.headers.host}${req.url}`);
});

// Contenido estático
app.use(express.static("./public"));

// API
app.get("/api/get-uuid", function (req, res) {
  res.send(uuidv4());
});

// SIMULAR ERROR, CAIDA DEL SERVIDOR
app.get("/tmp", function (req, res) {
  const options = {
    host: "google.com",
    path: "/",
  };

  const request = http.request(options, function (r) {
    let data = "";
    r.on("data", function (chunk) {
      data += chunk;
    });
    r.on("end", function (chunk) {
      throw new Error();
    });
  });

  request.on("error", function (e) {
    res.send("err");
  });
  request.end();
});

// 404
app.get("*", function (req, res) {
  res.status(404).send("Error 404 - Recurso no encontrado");
});
