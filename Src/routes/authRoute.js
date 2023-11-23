import * as tokencontroller from "../middleware/verifyToken.js";
import express from 'express';

const authRoute = express.Router();
//Retornar Datos de Token
authRoute.get('/',tokencontroller.getUserDataFromToken);

export default authRoute;
