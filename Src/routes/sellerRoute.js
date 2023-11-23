import * as vendedor from '../controller/sellerController.js';
import express from 'express';
import multer from 'multer';

const sellerRoute = express.Router();
// Crear nuevo vendedor
sellerRoute.post('/createSeller', vendedor.createSeller);

//Obtener todos los vendedores.
sellerRoute.get('/getSeller', vendedor.getSeller);

// Obtener un vendedor específico
sellerRoute.get('/getSeller/:id', vendedor.getSellerByID);

// Actualizar el vendedor
sellerRoute.put('/updateSeller/:id', vendedor.updateSeller);

// Eliminar el vendedor
sellerRoute.delete('/deleteSeller/:id', vendedor.deleteSeller);

export default sellerRoute;