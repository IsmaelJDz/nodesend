const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'var.env' });
const { validationResult } = require('express-validator');

exports.autenticarUsuario = async (req, res, next) => {
  //Revisar si hay errores
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  //Buscar el usuario para ver si esta registrado
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    res.status(400).json({ msg: 'El usuario no existe!' });
    return next();
  }

  //Verificar el password y auntenticar el usuario
  if (bcrypt.compareSync(password, usuario.password)) {
    //Crear JSON WEB TOKEN
    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre
      },
      process.env.SECRET,
      {
        expiresIn: '5h'
      }
    );
    res.json({ token });
  } else {
    res.status(401).json({ msg: 'password incorrecto' });
  }
};

exports.usuarioAutenticado = async (req, res, next) => {
  res.json({ usuario: req.usuario });
};
