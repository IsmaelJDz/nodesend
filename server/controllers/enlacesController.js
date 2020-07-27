const shortid = require("shortid");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const Enlaces = require("../models/Enlace");

exports.nuevoEnlace = async (req, res, next) => {
  //Revisar si hay errores
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  //Crear un objeto de enlace
  const { nombre_original, nombre } = req.body;

  const enlace = new Enlaces();
  enlace.url = shortid.generate();
  enlace.nombre = nombre;
  enlace.nombre_original = nombre_original;

  //Si el usuario esta autenticado
  if (req.usuario) {
    const { password, descargas } = req.body;

    //Asignar a enlace el numero de descargas
    if (descargas) {
      enlace.descargas = descargas;
    }

    //Asignar un password
    if (password) {
      const salt = await bcrypt.genSaltSync(10);
      enlace.password = await bcrypt.hash(password, salt);
    }

    //Asignar el autor
    enlace.autor = req.usuario.id;
  }

  try {
    //Almacenar en la db
    await enlace.save();
    return res.json({ msg: `${enlace.url}` });
    next();
  } catch (error) {
    console.error(error);
  }
};

//Obtiene un listado de todos los enlaces
exports.todosEnlaces = async (req, res) => {
  try {
    const enlaces = await Enlaces.find({}).select("url -_id");
    res.json({ enlaces });
  } catch (error) {
    console.error(error);
  }
};

//Retorna si el enlace tiene password o no
exports.tienePassword = async (req, res, next) => {
  const { url } = req.params;

  //Verificar si existe el enlace
  const enlace = await Enlaces.findOne({ url });
  if (!enlace) {
    res.status(400).json({
      msg: "Este enlace no existe!"
    });
    return next();
  }

  if (enlace.password) {
    return res.json({ password: true, enlace: enlace.url });
  }

  return next();
};

//Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
  const { url } = req.params;

  //Verificar si existe el enlace
  const enlace = await Enlaces.findOne({ url: url });
  if (!enlace) {
    res.status(400).json({ msg: "Este enlace no existe!" });
    return next();
  }

  //Si enlace existe
  console.log(enlace);
  res.json({ archivo: enlace.nombre, password: false });
  next();
};

//Verifica si el password es correcto
exports.verificarPassword = async (req, res, next) => {
  const { url } = req.params;
  const { password } = req.body;
  //Consultar por enlace
  const enlace = await Enlaces.findOne({ url: url });

  //Verificar el password
  if (bcrypt.compareSync(password, enlace.password)) {
    //Permitir descargar el archivo
    next();
  } else {
    return res.status(401).json({ msg: "Password incorrecto" });
  }
};
