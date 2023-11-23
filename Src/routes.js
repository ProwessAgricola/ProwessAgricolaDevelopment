import express from 'express';
import categoriaroute from './routes/categoryRoute.js';
import locationRoute from './routes/locationRoute.js';
//import motorizadoRoute from './motorizadoRoute.js';
import orderRoute from './routes/orderRoute.js';
import productoroute from './routes/productRoute.js';
import sellerRoute from './routes/sellerRoute.js';
import supplierRoute from './routes/supplierRoute.js';
import userRoute from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';
import * as tokencontroller from './middleware/verifyToken.js';
const routes = express.Router();

routes.use('/fb/categoria', categoriaroute);
routes.use('/fb/ubicacion', locationRoute);
//routes.use('/fb/motorizado', motorizadoRoute);
routes.use('/fb/pedido', orderRoute);
routes.use('/fb/producto', productoroute);
routes.use('/fb/vendedor',sellerRoute);
routes.use('/fb/proveedor',supplierRoute);
routes.use('/fb/usuario',userRoute);
routes.use('/fb/auth',authRoute);

export default routes;