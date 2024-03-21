import * as firebase from "firebase/app";
import * as firestore from "firebase/firestore";
import "firebase/storage";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  query,
  doc,
  where,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { sendEmail } from "../helpers/mailer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fs, storage } from "../database/firebase.js";
import dotenv from "dotenv";

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
      const storageRef = ref(
        storage,
        agricola / `${imageFile.originalname}`,
        metadata
      );
      try {
        const uploadtask = await uploadBytes(storageRef, imageFile.buffer);
        console.log("Imagen cargada con éxito");
        try {
          const url = await getDownloadURL(uploadtask.ref);
          userData.imagenUsuario = url;
          console.log("URL de imagen obtenida con éxito");
        } catch (error) {
          console.error("Error al obtener la URL de la imagen:", error);
        }
      } catch (error) {
        console.error(
          "Error al cargar la imagen o obtener la URL de la imagen:",
          error
        );
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
      userData.claveUsuario = bcrypt.hashSync(
        userData.claveUsuario,
        saltRounds
      );
      if (userData.categoriaUsuario == "Administrador") {
        console.log("Registra como administrador");
        return res.status(401).send({
          message: "No tienes permisos para registrar un administrador",
        });
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
      return res
        .status(401)
        .send({ message: "Email o Contraseña Inválidos", estado: false });
    }
    const user = querySnapshot.docs[0].data();
    user.id = querySnapshot.docs[0].id;
    const secret = process.env.JWT_SECRET;
    if (bcrypt.compareSync(req.body.password, user.claveUsuario)) {
      const token = jwt.sign(
        { id: user.id, rol: user.categoriaUsuario },
        secret,
        {
          expiresIn: "20h",
        }
      );
      res.json({
        mensaje: "Usuario Logeado Correctamente",
        estado: true,
        usuario: {
          token,
        },
      });
    } else {
      res
        .status(401)
        .send({ message: "Email o Contraseña Inválidos", estado: false });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear el usuario",
      error: error.message,
      estado: false,
    });
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
  const { password, newPassword } = req.body;
  try {
    const docRef = firestore.doc(fs, "usuario", id);
    const docSnap = await firestore.getDoc(docRef);
    if (docSnap.exists()) {
      const user = docSnap.data();
      user.id = docSnap.id;
      if (bcrypt.compareSync(password, user.claveUsuario)) {
        const newHashedPassword = bcrypt.hashSync(newPassword, saltRounds);
        await firestore.updateDoc(docRef, { claveUsuario: newHashedPassword });
        return res
          .status(200)
          .json({ message: "Contraseña actualizada correctamente" });
      } else {
        return res.status(401).json({ message: "Contraseña incorrecta" });
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
  console.log("Obteniendo usuarios");
  try {
    const snapshot = await firestore.getDocs(
      firestore.collection(fs, "usuario")
    );
    const users = [];
    snapshot.forEach((doc) => {
      const user = doc.data();
      user._id = doc.id;
      user.claveUsuario;
      users.push(user);
    });
    return res.status(200).json({ message: "Usuarios Encontrados", users });
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
    return res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

const updateUserById = async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  console.log(userData);

  if (!id) {
    return res.status(400).json({ message: "El ID del usuario es requerido" });
  }

  try {
    const docRef = firestore.doc(fs, "usuario", id);
    const docSnap = await firestore.getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await firestore.updateDoc(docRef, userData);

    return res.status(200).json({ message: "Usuario actualizado con éxito" });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return res
      .status(500)
      .json({
        message: "Error al actualizar el usuario",
        error: error.message,
      });
  }
};

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
    return res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

const deleteUserById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "El ID del usuario es requerido" });
  }

  try {
    const docRef = firestore.doc(fs, "usuario", id); 
    const docSnap = await firestore.getDoc(docRef); 

    if (!docSnap.exists()) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await firestore.deleteDoc(docRef);

    return res.status(200).json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
  }
};



const sendRecoveryCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Correo no proporcionado" });
  }

  try {
    const usersRef = collection(fs, "usuario");
    const querySnapshot = await getDocs(
      query(usersRef, where("correoUsuario", "==", email))
    );

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userDoc = querySnapshot.docs[0];
    const recoveryCode = Math.random().toString(36).substr(2, 8); // Genera un código simple

    await updateDoc(doc(fs, "usuario", userDoc.id), {
      recoveryCode: recoveryCode,
    });

    const subject = "Recuperación de Contraseña";
    const htmlContent = `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; padding: 0; color: #333; }
            .container { max-width: 600px; margin: auto; background: #f8f8f8; padding: 20px; border-radius: 10px; border: 1px solid #eee; }
            h2 { color: #4CAF50; }
            p { margin: 20px 0; }
            .code { font-size: 24px; font-weight: bold; color: #4CAF50; }
            .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #999; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Recuperación de Contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Usa el siguiente código para continuar el proceso en nuestra aplicación:</p>
            <p class="code">${recoveryCode}</p>
            <p>Si no has solicitado cambiar tu contraseña, por favor ignora este correo electrónico o ponte en contacto con nosotros si tienes alguna duda.</p>
            <div class="footer">
                <p>Gracias por usar nuestra aplicación.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    sendEmail(email, subject, htmlContent, (error, info) => {
      if (error) {
        console.error("Error al enviar email:", error);
        res
          .status(500)
          .json({ message: "Error al enviar el código de recuperación" });
      } else {
        res.json({ message: "Código de recuperación enviado" });
      }
    });
  } catch (error) {
    console.error("Error al enviar el código de recuperación: ", error);
    res
      .status(500)
      .json({ message: "Error al enviar el código de recuperación" });
  }
};

const verifyRecoveryCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const usersRef = collection(fs, "usuario");
    const querySnapshot = await getDocs(
      query(usersRef, where("correoUsuario", "==", email))
    );

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    if (user.recoveryCode === code) {
      await updateDoc(doc(fs, "usuario", userDoc.id), {
        recoveryCode: null,
      });

      res.status(200).json({ message: "Código verificado correctamente" });
    } else {
      res.status(400).json({ message: "Código inválido o expirado" });
    }
  } catch (error) {
    console.error("Error al verificar el código de recuperación: ", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

const recoverAccountByCedula = async (req, res) => {
  const { cedula } = req.body;

  if (!cedula) {
    return res.status(400).json({ error: "Cédula no proporcionada" });
  }

  try {
    const usersRef = collection(fs, "usuario");
    const querySnapshot = await getDocs(
      query(usersRef, where("cedulaUsuario", "==", cedula))
    );

    if (querySnapshot.empty) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado con esa cédula" });
    }

    const userDoc = querySnapshot.docs[0];
    const userEmail = userDoc.data().correoUsuario;

    const subject = "Recuperación de Cuenta";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              /* Tus estilos aquí */
          </style>
      </head>
      <body>
          <div>
              <h2>Recuperación de Cuenta</h2>
              <p>Hola,</p>
              <p>Hemos recibido una solicitud para recuperar el acceso a tu cuenta asociada con la cédula: ${cedula}.</p>
              <p>Tu correo de usuario es: <strong>${userEmail}</strong></p>
              <p>Si no has solicitado esto, por favor ignora este correo electrónico o ponte en contacto con nosotros si tienes alguna duda.</p>
          </div>
      </body>
      </html>
    `;

    sendEmail(userEmail, subject, htmlContent, (error, info) => {
      if (error) {
        console.error("Error al enviar email:", error);
        res.status(500).json({
          message: "Error al enviar el correo de recuperación de cuenta",
        });
      } else {
        res.json({
          message: "Correo de recuperación de cuenta enviado con éxito",
        });
      }
    });
  } catch (error) {
    console.error("Error al recuperar la cuenta:", error);
    res.status(500).json({
      message: "Error al procesar la solicitud de recuperación de cuenta",
    });
  }
};

const updatePasswordWithRecoveryCode = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res
      .status(400)
      .json({ message: "Información faltante para actualizar la contraseña." });
  }

  try {
    const usersRef = collection(fs, "usuario");
    const querySnapshot = await getDocs(
      query(usersRef, where("correoUsuario", "==", email))
    );

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    if (user.recoveryCode === code) {
      const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
      await updateDoc(doc(fs, "usuario", userDoc.id), {
        claveUsuario: hashedPassword,
        recoveryCode: null,
      });

      res.json({ message: "La contraseña ha sido actualizada exitosamente." });
    } else {
      res
        .status(400)
        .json({ message: "Código de recuperación inválido o expirado." });
    }
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export {
  loginUser,
  registerUser,
  getUserById,
  requestPasswordReset,
  getUsers,
  updateUser,
  deleteUser,
  updateUserById,
  deleteUserById,
  sendRecoveryCode,
  verifyRecoveryCode,
  recoverAccountByCedula,
  updatePasswordWithRecoveryCode,
};
