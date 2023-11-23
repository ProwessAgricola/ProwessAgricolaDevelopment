import express from 'express';
import multer from 'multer';

const productoRouter = express.Router();
const almacenamiento = multer.memoryStorage();
const upload = multer({ storage: almacenamiento });
import { verifyToken } from '../middleware/verifyToken.js';
import * as producto from '../controller/productController.js';
// Configuración de Firebase (reemplaza con la configuración real de tu proyecto)
//Obtener todos los productos.
productoRouter.get('/get', producto.getProducts);

// Obtener un producto específico
productoRouter.get('/get/:id', producto.getProductByID);

// Agregar un nuevo producto
productoRouter.post('/post',upload.single('pro_imagen'),producto.createProduct);

// Actualizar el producto
productoRouter.put('/update/:id', producto.updateProduct);

// Obtener productos por categoria
productoRouter.get('/getByCategory/:category', producto.getProductsByCategory);

// Eliminar
productoRouter.delete('/delete/:id', producto.deleteProduct);

export default productoRouter;