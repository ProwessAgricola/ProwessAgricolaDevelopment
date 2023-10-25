import 'firebase/database';
import * as firebase from 'firebase/app';
import * as firestore from 'firebase/firestore';
import {fs,storage} from '../database/firebase.js';

// Crear un nuevo vendedor

const createSeller=  async (req, res) => {
    try {
      const newSellerData = req.body; // Los datos del nuevo vendedor deben estar en el cuerpo de la solicitud (request body)
      console.log(newSellerData);
      const docRef = await firestore.addDoc(firestore.collection(fs, 'vendedor'), newSellerData);
      res.json({ id: docRef.id, ...newSellerData });
    } catch (error) {
      console.error('Error al crear el vendedor:', error);
      res.status(500).json({ error: 'Error al crear el vendedor.' });
    }
  };

//Obtener todos los vendedores.
const getSeller =  async (req, res) => {
    try {
      const querySnapshot = await firestore.getDocs(firestore.collection(fs, 'vendedor'));
      const vendedores = [];
      querySnapshot.forEach((doc) => {
        vendedores.push({ id: doc.id, ...doc.data() });
      });
  
      res.json(vendedores);
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      res.status(500).json({ error: 'Error al obtener vendedores.' });
    }
  };

// Obtener un vendedor específico
const getSellerByID = async (req, res) => {
    try {
      const sellerId = req.params.id;
      console.log(sellerId)
      const sellerDoc = await firestore.getDoc(firestore.doc(fs, 'vendedor', sellerId));
      if (sellerDoc.exists()) {
        res.json({ id: sellerDoc.id, ...sellerDoc.data() });
      } else {
        res.status(404).json({ error: 'vendedor no encontrado.' });
      }
    } catch (error) {
      console.error('Error al obtener el vendedor:', error);
      res.status(500).json({ error: 'Error al obtener el vendedor.' });
    }
  };
  
// Actualizar el vendedor
const updateSeller = async (req, res) => {
    try {
      const sellerId = req.params.id;
      const updatedSellerData = req.body; // Los datos actualizados deben estar en el cuerpo de la solicitud (request body)
      await firestore.updateDoc(firestore.doc(fs, 'vendedor', sellerId), updatedSellerData);
      res.json({ id: sellerId, ...updatedSellerData });
    } catch (error) {
      console.error('Error al actualizar el vendedor:', error);
      res.status(500).json({ error: 'Error al actualizar el vendedor.' });
    }
  };

  // Eliminar vendedor
const deleteSeller = async (req, res) => {
    try {
      const sellerId = req.params.id;
      await firestore.deleteDoc(firestore.doc(fs, 'vendedor', sellerId));
      res.json({ id: sellerId, message: 'Vendedor eliminado exitosamente.' });
    } catch (error) {
      console.error('Error al eliminar el vendedor:', error);
      res.status(500).json({ error: 'Error al eliminar el vendedor.' });
    }
  };

  export {createSeller, getSeller, getSellerByID, updateSeller, deleteSeller};