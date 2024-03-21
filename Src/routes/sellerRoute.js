import * as vendedor from '../controller/sellerController.js';
import express from 'express';

const sellerRoute = express.Router();
// Crear nuevo vendedor
sellerRoute.post('/', vendedor.createSeller);

//Obtener todos los vendedores.
sellerRoute.get('/', vendedor.getSeller);

// Obtener un vendedor específico
sellerRoute.get('/:id', vendedor.getSellerByID);

// Actualizar el vendedor
sellerRoute.put('/:id', vendedor.updateSeller);

// Eliminar el vendedor
sellerRoute.delete('/:id', vendedor.deleteSeller);

export default sellerRoute;