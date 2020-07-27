const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'var.env' });
module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (authHeader) {
    //Obtener el token
    const token = authHeader.split(' ')[1];

    try {
      //comprobar el jwt
      const usuario = jwt.verify(token, process.env.SECRET);
      req.usuario = usuario;
    } catch (error) {
      console.log(error);
    }
  }

  return next();
};
