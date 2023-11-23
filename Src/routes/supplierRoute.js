import * as proveedor from '../controller/supplierController.js';
import express from 'express';
import multer from 'multer';
const supplierRoute = express.Router();
// Crear un nuevo proveedor
supplierRoute.post('/post', proveedor.createSupplier);

// Obtener todos los proveedores
supplierRoute.get('/get', proveedor.getSupplier);

// Obtener un proveedor específico
supplierRoute.get('/get/:id', proveedor.getSupplierByID);

// Actualizar el proveedor
supplierRoute.put('/update/:id', proveedor.updateSupplier);

// Eliminar el proveedor
supplierRoute.delete('/delete/:id', proveedor.deleteSupplier);

export default supplierRoute;