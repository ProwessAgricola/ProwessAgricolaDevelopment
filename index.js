import express from "express";
import cors from "cors";
const app = express();
app.use(express.json())
app.use(cors());
const port = 5000;

import multer from 'multer';
const almacenamiento = multer.memoryStorage();
const upload = multer({ storage: almacenamiento });
// Import Firebase and Firestore
import * as producto from './Src/controller/productController.js';
// Configuración de Firebase (reemplaza con la configuración real de tu proyecto)
//Obtener todos los productos.
app.get('/fb/producto/get', producto.getProducts);

// Obtener un producto específico
app.get('/fb/producto/get/:id', producto.getProductByID);

// Agregar un nuevo producto
app.post('/fb/producto/post',upload.single('pro_imagen'),producto.createProduct);

// Actualizar el producto
app.put('/fb/producto/update/:id', producto.updateProduct);

// Obtener productos por categoria
app.get('/fb/producto/getByCategory/:category', producto.getProductsByCategory);

// Eliminar
app.delete('/fb/producto/delete/:id', producto.deleteProduct);


// Importar las funciones relacionadas con los pedidos desde './orders'
import * as order from './Src/controller/orderController.js';

// Configurar las rutas para las funciones relacionadas con pedidos

// Ruta para manejar la creación de un pedido usando el método HTTP POST
app.post('/fb/order/createOrder', order.createOrder);

// Ruta para manejar la obtención de los pedidos relacionados con un usuario específico usando el método HTTP GET
app.get('/fb/order/getMyOrders/:id', order.getMyOrders);

// Ruta para manejar la eliminación de un pedido usando el método HTTP DELETE
app.delete('/fb/order/deleteOrder/:id', order.deleteOrder);

// Ruta para manejar la obtención de un pedido específico por su ID usando el método HTTP GET
app.get('/fb/order/getOrder/:id', order.getOrder);

// Ruta para manejar la marca de un pedido como pagado usando el método HTTP PUT
app.put('/fb/order/paid/:id', order.paid);

// Ruta para manejar la marca de un pedido como entregado usando el método HTTP PUT
app.put('/fb/order/delivered/:id', order.delivered);

// Ruta para manejar la obtención de todos los pedidos relacionados con un usuario específico usando el método HTTP GET
app.get('/fb/order/getOrders/:id', order.getOrders);

// Iniciar el servidor y hacer que escuche en el puerto definido
app.listen(port,() =>{
  console.log("Servidor en operación (Puerto 5000).")
})

// CategoryController

import * as categoria from './Src/controller/categoryController.js';

// Crear categorías
app.post('/fb/categoria/post', categoria.createCategory);

// Obtener todas las categorías
app.get('/fb/categoria/get', categoria.getCategories);

// Obtener una categoría específica
app.get('/fb/categoria/get/:id', categoria.getCategoryByID);

// Actualizar la categoría
app.put('/fb/categoria/update/:id', categoria.updateCategory);

// Eliminar la categoría
app.delete('/fb/categoria/delete/:id', categoria.deleteCategory);

// Importar las funciones relacionadas con los VENDEDORES desde './sellerController'

import * as vendedor from './Src/controller/sellerController.js';

// Crear nuevo vendedor
app.post('/fb/vendedor/createSeller', vendedor.createSeller);

//Obtener todos los vendedores.
app.get('/fb/vendedor/getSeller', vendedor.getSeller);

// Obtener un vendedor específico
app.get('/fb/vendedor/getSeller/:id', vendedor.getSellerByID);

// Actualizar el vendedor
app.put('/fb/vendedor/updateSeller/:id', vendedor.updateSeller);

// Eliminar el vendedor
app.delete('/fb/vendedor/deleteSeller/:id', vendedor.deleteSeller);


//==================================//

// SupplierController
import * as proveedor from './Src/controller/supplierController.js';

// Crear un nuevo proveedor
app.post('/fb/proveedor/post', proveedor.createSupplier);

// Obtener todos los proveedores
app.get('/fb/proveedor/get', proveedor.getSupplier);

// Obtener un proveedor específico
app.get('/fb/proveedor/get/:id', proveedor.getSupplierByID);

// Actualizar el proveedor
app.put('/fb/proveedor/update/:id', proveedor.updateSupplier);

// Eliminar el proveedor
app.delete('/fb/proveedor/delete/:id', proveedor.deleteSupplier);

//==================================//

// Importar las funciones relacionadas con los usuarios desde './userController'
import * as usuario from './Src/controller/userController.js';
import * as tokencontroller from "./Src/middleware/verifyToken.js";

// Crear un nuevo usuario
app.post('/fb/usuario/login',upload.none(),usuario.loginUser);
app.get('/fb/usuario',tokencontroller.verifyToken,usuario.getUserById);
app.post('/fb/usuario/register', upload.single("imagenUsuario"), usuario.registerUser);
app.post('/fb/usuario/password',tokencontroller.verifyToken,usuario.requestPasswordReset);
app.get('/fb/usuarios',usuario.getUsers);
app.put('/fb/usuario/update',usuario.updateUser);

//Retornar Datos de Token
app.get('/fb/auth',tokencontroller.getUserDataFromToken);


//Importar las funciones relacionadas con la ubicación desde './locationController'

import * as ubicacion from './Src/controller/locationController.js';

