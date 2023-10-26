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
    res.status(400).json({ mensaje: "Debes enviar un token" });
  }
};

const getUserDataFromToken = (req,res) => {
  const token = req.headers["token"];
  const secret = process.env.JWT_SECRET;
  console.log(token);
  try {
    const data = jwt.verify(token, secret);
    return res.status(200).json({data});
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ mensaje: "Token invalido AQUI" });
  }
};

export { verifyToken, getUserDataFromToken};