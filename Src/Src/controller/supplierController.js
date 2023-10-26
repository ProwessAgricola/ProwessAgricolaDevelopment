import 'firebase/database';
import * as firebase from 'firebase/app';
import * as firestore from 'firebase/firestore';
import {fs,storage} from '../database/firebase.js';

// Crear un nuevo proveedor

const createSupplier=  async (req, res) => {
    try {
      const newSupplierData = req.body; // Los datos del nuevo vendedor deben estar en el cuerpo de la solicitud (request body)
      console.log(newSupplierData);
      const docRef = await firestore.addDoc(firestore.collection(fs, 'proveedor'), newSupplierData);
      res.json({ id: docRef.id, ...newSupplierData });
    } catch (error) {
      console.error('Error al crear el proveedor:', error);
      res.status(500).json({ error: 'Error al crear el proveedor.' });
    }
  };

  //Obtener todos los proveedor.
const getSupplier =  async (req, res) => {
  try {
    const querySnapshot = await firestore.getDocs(firestore.collection(fs, 'proveedor'));
    const supplier = [];
    querySnapshot.forEach((doc) => {
      supplier.push({ id: doc.id, ...doc.data() });
    });

    res.json(supplier);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error al obtener proveedores.' });
  }
};

// Obtener un proveedor en específico
const getSupplierByID = async (req, res) => {
  try {
    const supplierId = req.params.id;
    console.log(supplierId)
    const supplierDoc = await firestore.getDoc(firestore.doc(fs, 'proveedor', supplierId));
    if (supplierDoc.exists()) {
      res.json({ id: supplierDoc.id, ...supplierDoc.data() });
    } else {
      res.status(404).json({ error: 'Proveedor no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener el proveedor:', error);
    res.status(500).json({ error: 'Error al obtener el proveedor.' });
  }
};


// Actualizar un proveedor
const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const updatedsupplierData = req.body; // Los datos actualizados deben estar en el cuerpo de la solicitud (request body)
    await firestore.updateDoc(firestore.doc(fs, 'proveedor', supplierId), updatedsupplierData);
    res.json({ id: supplierId, ...updatedsupplierData });
  } catch (error) {
    console.error('Error al actualizar el proveedor:', error);
    res.status(500).json({ error: 'Error al actualizar el proveedor.' });
  }
};

// Eliminar
const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    await firestore.deleteDoc(firestore.doc(fs, 'proveedor', supplierId));
    res.json({ id: supplierId, message: 'Proveedor eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el proveedor:', error);
    res.status(500).json({ error: 'Error al eliminar el proveedor.' });
  }
};

  export {createSupplier, getSupplier, getSupplierByID, updateSupplier, deleteSupplier};