const express = require("express");
const connectDB = require("./config/db");
const listEndpoints = require("express-list-endpoints");
const morgan = require("morgan");
const cors = require("cors");

// Crear server
const app = express();

// Conectar DB
connectDB();

// Habilitar cors
const opcionesCors = {
  origin: process.env.FRONTEND_URL
};
app.use(cors(opcionesCors));

//Puerto de la app
const port = process.env.PORT || 4000;

//Habilitar leer los valores de un body
app.use(express.json());
app.use(morgan("dev"));

// Habilitar carpeta publica
app.use(express.static("uploads"));

//Rutas
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/enlaces", require("./routes/enlaces"));
app.use("/api/archivos", require("./routes/archivos"));
console.log(listEndpoints(app));

app.listen(port, () => {
  console.log(`El servidor esta funcionado en el puerto ${port}`);
});
