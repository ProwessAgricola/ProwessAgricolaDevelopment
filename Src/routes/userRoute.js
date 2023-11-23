// Importar las funciones relacionadas con los usuarios desde './userController'
import * as usuario from '../controller/userController.js';
import * as tokencontroller from '../middleware/verifyToken.js';
import express from 'express';
import multer from 'multer';

const userRoute = express.Router();
const almacenamiento = multer.memoryStorage();
const upload = multer({ storage: almacenamiento });

// Crear un nuevo usuario
userRoute.post('/login',upload.none(),usuario.loginUser);
userRoute.post('/register', upload.single("imagenUsuario"), usuario.registerUser);
userRoute.get('/',tokencontroller.verifyToken,usuario.getUserById);
userRoute.post('/password',tokencontroller.verifyToken,usuario.requestPasswordReset);
userRoute.get('/getAll',tokencontroller.verifyToken,usuario.getUsers);
userRoute.put('/update',upload.single("imagenUsuario"),tokencontroller.verifyToken,usuario.updateUser);
userRoute.put('/update/:id',tokencontroller.verifyTokenAdmin,usuario.updateUserById);
userRoute.delete('/delete',tokencontroller.verifyToken,usuario.deleteUser);
userRoute.delete('/delete/:id',tokencontroller.verifyTokenAdmin,usuario.deleteUserById);
userRoute.get('/actualizarDatos',usuario.actualizarDatos);

export default userRoute;