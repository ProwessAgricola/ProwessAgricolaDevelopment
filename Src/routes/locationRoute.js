import * as ubicacion from '../controller/locationController.js';
import express from 'express';
import multer from 'multer';



const locationRoute = express.Router();

locationRoute.get('/:province',ubicacion.exportProvinces);

export default locationRoute;