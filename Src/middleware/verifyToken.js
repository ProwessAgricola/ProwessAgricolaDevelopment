import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.headers["token"];
  const secret = process.env.JWT_SECRET;
  if (token) {
    jwt.verify(token, secret
    , (error, data) => {
      if (error) return res.status(400).json({ mensaje: "Token invalido" });
      else {
        req.user = data;
        next();
      }
    });
  } else {
    res.status(400).json({ mensaje: "Verificacion Token erronea, Debes enviar un token" });
  }
};

const getUserDataFromToken = (req,res) => {
  const token = req.headers["token"];
  const secret = process.env.JWT_SECRET;
  try {
    const data = jwt.verify(token, secret);
    return res.status(200).json({data});
  } catch (error) {
    res.status(400).json({ mensaje: "Token invalido AQUI" });
  }
};

const verifyTokenAdmin = (req,res,next) => {
  const token = req.headers["token"];
  const secret = process.env.JWT_SECRET;
  if (token) {
    jwt.verify(token, secret
    , (error, data) => {
      if (error) return res.status(400).json({ mensaje: "Token invalido" });
      else {
        req.user = data;
        if(req.user.rol !== "administrador"){
          return res.status(400).json({ mensaje: "No tienes permisos para realizar esta acción" });
        }
        next();
      }
    });
  } else {
    res.status(400).json({ mensaje: "Debes enviar un token" });
  }
}

export { verifyToken,verifyTokenAdmin, getUserDataFromToken};