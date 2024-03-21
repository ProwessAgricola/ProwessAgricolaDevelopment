import * as ubicacion from '../controller/locationController.js';
import express from 'express';



const locationRoute = express.Router();

locationRoute.get('/', ubicacion.getAll);

locationRoute.get('/:province',ubicacion.exportProvinces);

export default locationRoute;