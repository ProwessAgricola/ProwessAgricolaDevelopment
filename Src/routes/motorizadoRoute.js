import * as motorizado from '../controller/motorizadoController.js';
import express from 'express';

const motorizadoRoute = express.Router();

// Crear un nuevo motorizado
motorizadoRoute.post('/', motorizado.createMotorizado);

// Obtener todos los motorizados
motorizadoRoute.get('/', motorizado.getMotorizado);

// Obtener un motorizado específico
motorizadoRoute.get('/:id', motorizado.getMotorizadoByID);

// Actualizar un motorizado
motorizadoRoute.put('/:id', motorizado.updateMotorizado);

// Eliminar un motorizado
motorizadoRoute.delete('/:id', motorizado.deleteMotorizado);

export default motorizadoRoute;