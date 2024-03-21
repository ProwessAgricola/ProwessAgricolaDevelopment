import * as order from '../controller/orderController.js';
import express from 'express';

const orderRoute = express.Router();

//Obtener todas las rutas
orderRoute.get('/', order.getAll);
// Ruta para manejar la creación de un pedido usando el método HTTP POST
orderRoute.post('/', order.createOrder);

// Ruta para manejar la obtención de los pedidos relacionados con un usuario específico usando el método HTTP GET
orderRoute.get('/getMyOrders/:id', order.getMyOrders);

// Ruta para manejar la eliminación de un pedido usando el método HTTP DELETE
orderRoute.delete('/:id', order.deleteOrder);


export default orderRoute;