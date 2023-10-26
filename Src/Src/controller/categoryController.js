import 'firebase/database';
import * as firebase from 'firebase/app';
import * as firestore from 'firebase/firestore';
import {fs,storage} from '../database/firebase.js';
// Crear una nueva categoria
const createCategory=  async (req, res) => {
    try {
      const newCategoryData = req.body;
      console.log(newCategoryData);
      const docRef = await firestore.addDoc(firestore.collection(fs, 'categoria'), newCategoryData);
      res.json({ id: docRef.id, ...newCategoryData });
    } catch (error) {
      console.error('Error al crear el categoria:', error);
      res.status(500).json({ error: 'Error al crear el categoria.' });
    }
  };

  //Obtener todas las categorias.
const getCategories =  async (req, res) => {
  try {
    const querySnapshot = await firestore.getDocs(firestore.collection(fs, 'categoria'));
    const categorias = [];
    querySnapshot.forEach((doc) => {
      categorias.push({ id: doc.id, ...doc.data() });
    });

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorias:', error);
    res.status(500).json({ error: 'Error al obtener categorias.' });
  }
};

// Obtener una categoria en específico
const getCategoryByID = async (req, res) => {
  try {
    const categoryId = req.params.id;
    console.log(categoryId)
    const categoryDoc = await firestore.getDoc(firestore.doc(fs, 'categoria', categoryId));
    if (categoryDoc.exists()) {
      res.json({ id: categoryDoc.id, ...categoryDoc.data() });
    } else {
      res.status(404).json({ error: 'Categoria no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener el categoria:', error);
    res.status(500).json({ error: 'Error al obtener el categoria.' });
  }
};


// Actualizar la categoria
const updateCategory = async (req, res) => {
  try {
    const CategoryId = req.params.id;
    const updatedCategoryData = req.body; // Los datos actualizados deben estar en el cuerpo de la solicitud (request body)
    await firestore.updateDoc(firestore.doc(fs, 'categoria', CategoryId), updatedCategoryData);
    res.json({ id: CategoryId, ...updatedCategoryData });
  } catch (error) {
    console.error('Error al actualizar ka categoria:', error);
    res.status(500).json({ error: 'Error al actualizar la categoria.' });
  }
};

// Eliminar
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    await firestore.deleteDoc(firestore.doc(fs, 'categoria', categoryId));
    res.json({ id: categoryId, message: 'Categoria eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el categoria:', error);
    res.status(500).json({ error: 'Error al eliminar el categoria.' });
  }
};

export {createCategory, getCategories, getCategoryByID, updateCategory, deleteCategory};