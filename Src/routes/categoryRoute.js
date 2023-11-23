import express from 'express';
import multer from 'multer';
import * as categoria from '../controller/categoryController.js';
import * as tokencontroller from '../middleware/verifyToken.js';

const categoriaRouter = express.Router();
// Crear categorías
categoriaRouter.post('/post',tokencontroller.verifyTokenAdmin, categoria.createCategory);

// Obtener todas las categorías
categoriaRouter.get('/get',tokencontroller.verifyTokenAdmin, categoria.getCategories);

// Obtener una categoría específica
categoriaRouter.get('/get/:id', categoria.getCategoryByID);

// Actualizar la categoría
categoriaRouter.put('/update/:id', categoria.updateCategory);

// Eliminar la categoría
categoriaRouter.delete('/delete/:id', categoria.deleteCategory);

export default categoriaRouter;