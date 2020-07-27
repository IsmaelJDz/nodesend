const multer = require("multer");
const shortid = require("shortid");
const fs = require("fs");
const Enlace = require("../models/Enlace");

exports.subirArchivo = async (req, res, next) => {
  //multipart form data
  //sibida de archivos
  const configurationMulter = {
    limits: { fileSize: req.usuario ? 1000000 : 1024 * 1024 },
    storage: (fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname + "/../uploads");
      },
      filename: (req, file, cb) => {
        const extension = file.originalname.substring(
          file.originalname.lastIndexOf("."),
          file.originalname.length
        );
        cb(null, `${shortid.generate()}${extension}`);
      }
      // filtrar extensiones
      // fileFilter: (req, file, cb) => {
      //   if (file.mimetype === "application/pdf") {
      //     return cb(null, true)
      //   }
      // }
    }))
  };

  const upload = multer(configurationMulter).single("archivo");

  upload(req, res, async error => {
    console.log(req.file);
    if (!error) {
      res.json({ archivo: req.file.filename });
    } else {
      console.log(error);
      return next();
    }
  });
};

exports.eliminarArchivo = async (req, res) => {
  try {
    fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
    console.log("Archivo eliminado");
  } catch (error) {
    console.log(error);
  }
};

//Descarga un archivo
exports.descargar = async (req, res, next) => {
  console.log(req.params);
  //Obtiene el enlace
  const { archivo } = req.params;
  console.log(archivo);

  const enlace = await Enlace.findOne({ nombre: archivo });
  console.log(enlace);

  const archivoDescarga = __dirname + "/../uploads/" + archivo;
  res.download(archivoDescarga);

  //Eliminar el archivo y la entrada de la base de datos
  //Si las descargas son igules a 1 - Borrar la entrada y borrar el archivo
  const { descargas, nombre } = enlace;

  if (descargas === 1) {
    // Eliminar el archivo
    req.archivo = nombre;

    //Eliminar la entrada a la db
    await Enlace.findOneAndRemove(enlace.id);

    next();
  } else {
    //Si las descargas son > a 1 - Restar - 1
    enlace.descargas--;
    await enlace.save();
  }
};
