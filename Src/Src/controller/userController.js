import * as firebase from "firebase/app";
import * as firestore from "firebase/firestore";
import 'firebase/storage';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { query, where, getDocs, collection } from "firebase/firestore";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {fs,storage} from '../database/firebase.js';
import dotenv from 'dotenv';

dotenv.config();
const saltRounds = 10;

//Registro de usuario
const registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const imageFile = req.file;
    const jsonUser = {};
    if (imageFile) {
      const metadata = {
        contentType: imageFile.mimetype,
      };
      // ! La imagen se esta guardando como application/octet-stream, no como contentType: imagenFile.mimetype. NO AFECTA EL FUNCIONAMIENTO.
      //TODO 1: Comprobar si la imagen existe en el storage de Firebase, para evitar reemplazo de imágenes o asignar un nombre único a la imagen.
      const storageRef = ref(storage, `agricola/${imageFile.originalname}`,metadata);
      try {
        const uploadtask = await uploadBytes(storageRef, imageFile.buffer);
        console.log('Imagen cargada con éxito');
        try{
          const url = await getDownloadURL(uploadtask.ref);
          console.log(url);
          userData.imagenUsuario = url;
          console.log('URL de imagen obtenida con éxito');
        }
        catch(error){
          console.error('Error al obtener la URL de la imagen:', error);
        }
      } catch (error) {
        console.error('Error al cargar la imagen o obtener la URL de la imagen:', error);
      }
    }


    try {
      const snapshot = await query(
        firestore.collection(fs, "usuario"),
        where("correoUsuario", "==", userData.correoUsuario)
      );
      const querySnapshot = await getDocs(snapshot); //!Probar
      if (!querySnapshot.empty) {
        return res
          .status(401)
          .send({ message: "El correo electrónico ya está en uso" });
      }
      userData.claveUsuario = bcrypt.hashSync(userData.claveUsuario, saltRounds);

      for (const [key, value] of Object.entries(userData)) {
        if (value) {
          jsonUser[key] = value;
        }
      }
      var docRef = await firestore.addDoc(
        firestore.collection(fs, "usuario"),
        jsonUser
      );
      return res.status(201).json(jsonUser);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al crear el usuario", error: error.message });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al crear el usuario", error: error.message });
  }
};

// Inicio de sesion de usuario
const loginUser = async (req, res) => {
  try {
    const userData = req.body;
    const jsonUser = {};
    const snapshot = await query(
      firestore.collection(fs, "usuario"),
      where("correoUsuario", "==", userData.email)
    );
    const querySnapshot = await getDocs(snapshot);
    console.log(querySnapshot);
    if (querySnapshot.empty) {
      return res.status(401).send({ message: "Email o Contraseña Inválidos", estado: false  });
    }
    const user = querySnapshot.docs[0].data();
    user.id = querySnapshot.docs[0].id;
    const secret = process.env.JWT_SECRET
    if (bcrypt.compareSync(req.body.password, user.claveUsuario)) {
      const token = jwt.sign({ id: user.id, rol: user.categoriaUsuario}, secret );
      res.json({
        mensaje: "Usuario Logeado Correctamente",
        estado: true,
        usuario: {
          token
        }
      });
    } else {
      res.status(401).send({ message: "Email o Contraseña Inválidos", estado: false });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al crear el usuario", error: error.message , estado: false });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.user;
  try {
    const docRef = firestore.doc(fs, "usuario", id);
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists()) {
      const user = docSnap.data();
      user.id = docSnap.id;
      delete user.claveUsuario;
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener el usuario", error: error.message });
  }
  
};


// Solicitar reinicio de contraseña
const requestPasswordReset = async (req, res) => {
  const { id } = req.user;
  const {password, newPassword} = req.body;
  try {
    const docRef = firestore.doc(fs, "usuario", id);
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists()) {
      const user = docSnap.data();
      user.id = docSnap.id;
      if (bcrypt.compareSync(password, user.claveUsuario)) {
        const newHashedPassword = bcrypt.hashSync(newPassword, saltRounds);
        await firestore.updateDoc(docRef, {claveUsuario: newHashedPassword});
        return res.status(200).json({message: "Contraseña actualizada correctamente"});
      }else{
        return res.status(401).json({message: "Contraseña incorrecta"});
      }
    } else {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener el usuario", error: error.message });
  }
};

// Metodo GET
const getUsers = async (req, res) => {
  try {
    const snapshot = await firestore.getDocs(firestore.collection(fs, "usuario"));
    const users = [];
    snapshot.forEach((doc) => {
      const user = doc.data();
      user._id = doc.id;
      delete user.claveUsuario;
      users.push(user);
    });
    return res.status(301).json({message:"Usuarios Encontrados",users})
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener la lista de usuarios" });
  }
};

// Metodo PUT para actualizar usuarios
const updateUser = async (req, res) => {
  const user = req.body;

  try {
    const docRef = db.collection("usuario").doc(user.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Usuario no encontrado" });
    }
    const user = doc.data();
    if (!user.isAdmin) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "No tiene permisos para actualizar este usuario" });
    }

    const updateUser = {
      commission: req.body.commission ? req.body.commission : user.commission,
      name: req.body.name ? req.body.name : user.name,
      email: req.body.email ? req.body.email : user.email,
      address: req.body.address ? req.body.address : user.address,
      phone: req.body.phone ? req.body.phone : user.phone,
    };

    if (req.body.password) {
      updateUser.password = bcrypt.hashSync(req.body.password);
    }

    if (req.files?.image) {
      if (user.image?.public_id) {
        await deleteImageUser(user.image.public_id);
      }
      const result = await uploadImageUser(req.files.image.tempFilePath);
      updateUser.image = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
      await fs.unlink(req.files.image.tempFilePath);
    }

    await docRef.update(updateUser);
    return res.status(HTTP_STATUS.OK).json(updateUser);
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error al actualizar el usuario" });
  }
};
/*
// Metodo DELETE
const deleteUser = async (req, res) => {
  try {
    const docRef = db.collection("users").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Usuario no encontrado" });
    }
    const user = doc.data();
    if (!user.isAdmin) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "No tiene permisos para eliminar este usuario" });
    }

    if (user.image?.public_id) {
      await deleteImageUser(user.image.public_id);
    }

    await docRef.delete();
    return res.status(HTTP_STATUS.OK).json({ message: "Usuario eliminado" });
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Error al eliminar el usuario" });
  }
};*/

export { loginUser, registerUser,getUserById,requestPasswordReset,getUsers,updateUser/*,deleteUser*/};
