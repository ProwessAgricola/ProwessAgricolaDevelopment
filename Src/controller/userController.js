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
      if(userData.categoriaUsuario == "Administrador"){
       console.log("Registra como administrador");
       return res.status(401).send({ message: "No tienes permisos para registrar un administrador" });
      }
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
    if (querySnapshot.empty) {
      return res.status(401).send({ message: "Email o Contraseña Inválidos", estado: false  });
    }
    const user = querySnapshot.docs[0].data();
    user.id = querySnapshot.docs[0].id;
    const secret = process.env.JWT_SECRET
    if (bcrypt.compareSync(req.body.password, user.claveUsuario)) {
      const token = jwt.sign({ id: user.id, rol: user.categoriaUsuario}, secret, {
        expiresIn: "20h",
      });
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
    return res.status(200).json({message:"Usuarios Encontrados",users})
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener la lista de usuarios" });
  }
};


// Metodo PUT para actualizar usuarios
const updateUser = async (req, res) => {
  const { id } = req.user;
  const userData = req.body;
  try {
    const docRef = firestore.doc(fs, "usuario", id);
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists()) {
      const user = docSnap.data();
      user.id = docSnap.id;
      delete user.claveUsuario;
      firestore.updateDoc(docRef, userData);
      return res.status(200).json("Data Registrada");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar el usuario" });
  }
};

const updateUserById = async (req, res) => {
  const userData = req.body;
  try {
    const docRef = firestore.doc(fs, "usuario", userData.id);
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists()) {
      const user = docSnap.data();
      user.id = docSnap.id;
      delete user.claveUsuario;
      return res.status(200).json("Data Registrada");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar el usuario" });
  }

}

const deleteUser = async (req, res) => {
  const { id } = req.user;
  const userData = req.body;
  try {
    const docRef = firestore.doc(fs, "usuario", id);
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists()) {
      const user = docSnap.data();
      user.id = docSnap.id;
      delete user.claveUsuario;
      firestore.deleteDoc(docRef);
      return res.status(200).json("Data Registrada");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar el usuario" });
  }
}
  const deleteUserById = async (req, res) => {
    const userData = req.body;
    try {
      const docRef = firestore.doc(fs, "usuario", userData.id);
      const docSnap = await firestore.getDoc(docRef);
      if (docSnap.exists()) {
        const user = docSnap.data();
        user.id = docSnap.id;
        delete user.claveUsuario;
        firestore.deleteDoc(docRef);
        return res.status(200).json("Data Eliminada");
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar el usuario" });
    }
  }

  const actualizarDatos = async (req, res) => {
    try {
      const snapshot = await firestore.getDocs(firestore.collection(fs, "usuario"));
      const users = [];
      snapshot.forEach((doc) => {
        const user = doc.data();
        user._id = doc.id;
        if(user.coords){
          
        }
        delete user.claveUsuario;
        users.push(user);
      });
      return res.status(200).json({message:"Usuarios Encontrados",users})
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener la lista de usuarios" });
    }
  }

export { loginUser, registerUser,getUserById,requestPasswordReset,getUsers,updateUser,deleteUser,updateUserById,deleteUserById,actualizarDatos};
