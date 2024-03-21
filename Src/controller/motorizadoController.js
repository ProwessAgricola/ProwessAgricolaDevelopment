import "firebase/database";
import * as firestore from "firebase/firestore";
import { fs } from "../database/firebase.js";
import { getDoc, doc, deleteDoc } from "firebase/firestore";

// Crear un nuevo motorizado
const createMotorizado = async (req, res) => {
  try {
    const newMotorizadoData = req.body;
    const docRef = await firestore.addDoc(
      firestore.collection(fs, "motorizado"),
      newMotorizadoData
    );
    res.json({ id: docRef.id, ...newMotorizadoData });
  } catch (error) {
    console.error("Error al crear el motorizado:", error);
    res.status(500).json({ error: "Error al crear el motorizado." });
  }
};

// Obtener todos los motorizados
const getMotorizado = async (req, res) => {
  try {
    const querySnapshot = await firestore.getDocs(
      firestore.collection(fs, "motorizado")
    );
    const motorizados = [];
    querySnapshot.forEach((doc) => {
      motorizados.push({ id: doc.id, ...doc.data() });
    });

    res.json(motorizados);
  } catch (error) {
    console.error("Error al obtener motorizados:", error);
    res.status(500).json({ error: "Error al obtener motorizados." });
  }
};

// Obtener un motorizado específico
const getMotorizadoByID = async (req, res) => {
  try {
    const motorizadoId = req.params.id;
    const motorizadoDoc = await firestore.getDoc(
      firestore.doc(fs, "motorizado", motorizadoId)
    );
    if (motorizadoDoc.exists()) {
      res.json({ id: motorizadoDoc.id, ...motorizadoDoc.data() });
    } else {
      res.status(404).json({ error: "Motorizado no encontrado." });
    }
  } catch (error) {
    console.error("Error al obtener el motorizado:", error);
    res.status(500).json({ error: "Error al obtener el motorizado." });
  }
};

// Actualizar el motorizado
const updateMotorizado = async (req, res) => {
  try {
    const motorizadoId = req.params.id;
    const updatedMotorizadoData = req.body;
    await firestore.updateDoc(
      firestore.doc(fs, "motorizado", motorizadoId),
      updatedMotorizadoData
    );
    res.json({ id: motorizadoId, ...updatedMotorizadoData });
  } catch (error) {
    console.error("Error al actualizar el motorizado:", error);
    res.status(500).json({ error: "Error al actualizar el motorizado." });
  }
};

// Eliminar motorizado
const deleteMotorizado = async (req, res) => {
  try {
    const motorizadoId = req.params.id;
    const docRef = doc(fs, "motorizado", motorizadoId); 

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Motorizado no encontrado." });
    }

    await deleteDoc(docRef);
    res.json({
      id: motorizadoId,
      message: "Motorizado eliminado exitosamente.",
    });
  } catch (error) {
    console.error("Error al eliminar el motorizado:", error);
    res.status(500).json({ error: "Error al eliminar el motorizado." });
  }
};

export {
  createMotorizado,
  getMotorizado,
  getMotorizadoByID,
  updateMotorizado,
  deleteMotorizado,
};
