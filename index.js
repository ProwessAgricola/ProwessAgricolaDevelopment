import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./src/routes.js";

const app = express();
app.use(express.json({ limit: '50mb' }));

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

dotenv.config();
const port = process.env.PORT || 5000;
app.setMaxListeners(0);

// Obtener Rutas
app.use("/", routes);

// Ruta principal
app.get("/", (req, res) => {
  res.send("¡Bienvenido, PGA!");
});

app.post("/", (req, res) => {
  res.send("¡Bienvenido, PGA!");
});

app.put("/", (req, res) => {
  res.send("¡Bienvenido, PGA!");
});

app.delete("/", (req, res) => {
  res.send("¡Bienvenido, PGA!");
});

app.use((req, res) => {
  res.status(404).send("Error 404 Not Found");
});

app.listen(port, () => {
  console.log(`Servidor iniciado exitosamente`);
});
