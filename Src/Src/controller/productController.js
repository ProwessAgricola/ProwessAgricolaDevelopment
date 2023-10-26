import * as firebase from 'firebase/app';
import * as firestore from 'firebase/firestore';
import 'firebase/storage';
import { query, where, getDocs, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {fs,storage} from '../database/firebase.js';

//import {fs} from "../../firebase.js";

// Agregar un nuevo producto
const createProduct = async (req, res) => {
  try {
    const newProductData = req.body; // Los datos del nuevo producto deben estar en el cuerpo de la solicitud (request body)
    const imageFile = req.file; // El archivo de imagen debe estar en el cuerpo de la solicitud (request body)
    const jsonProduct = {};
    newProductData.pro_imagen = null;

    if (imageFile) {
      const metadata = {
        contentType: imageFile.mimetype,
      };
      // ! La imagen se esta guardando como application/octet-stream, no como contentType: imagenFile.mimetype. NO AFECTA EL FUNCIONAMIENTO.
      //TODO 1: Comprobar si la imagen existe en el storage de Firebase, para evitar reemplazo de imágenes o asignar un nombre único a la imagen.
      const storageRef = ref(storage, `Productos Web Agricola/Imagenes_Agricola/${imageFile.originalname}`,metadata);
      try {
        const uploadtask = await uploadBytes(storageRef, imageFile.buffer);
        console.log('Imagen cargada con éxito');
        try{
          const url = await getDownloadURL(uploadtask.ref);
          console.log(url);
          newProductData.pro_imagen = url;
          console.log('URL de imagen obtenida con éxito');
        }
        catch(error){
          console.error('Error al obtener la URL de la imagen:', error);
        }
      } catch (error) {
        console.error('Error al cargar la imagen o obtener la URL de la imagen:', error);
      }
    }
    for(const [key,value] of Object.entries(newProductData)){
      if(value){
        jsonProduct[key] = value;
      }
    }
    // Agrega los datos del producto a Firestore
    try{
      const docRef = await firestore.addDoc(firestore.collection(fs, 'producto'), jsonProduct);
      res.json({ id: docRef.id, ...jsonProduct }); 
    }
    catch{
      console.error('Error al agregar el producto a la base de datos:', error);
      res.status(500).json({ error: 'Error al agregar el producto a la base de datos.' });
    }
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ error: 'Error al crear el producto.' });
  }
};


//Obtener todos los productos.
const getProducts =  async (req, res) => {
  try {
    const querySnapshot = await firestore.getDocs(firestore.collection(fs, 'producto'));
    const productos = [];
    querySnapshot.forEach((doc) => {
      productos.push({ id: doc.id, ...doc.data() });
    });

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos.' });
  }
};


// Obtener un producto específico
const getProductByID = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(productId)
    const productDoc = await firestore.getDoc(firestore.doc(fs, 'producto', productId));
    if (productDoc.exists()) {
      res.json({ id: productDoc.id, ...productDoc.data() });
    } else {
      res.status(404).json({ error: 'Producto no encontrado.' });
    }
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ error: 'Error al obtener el producto.' });
  }
};

// Obtener productos por categoría
const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
      // Consulta productos de una categoría específica
      const querySnapshot = await firestore.getDocs(query(firestore.collection(fs, 'producto'),where('pro_categoria', '==', category)));
      const productos = [];
      querySnapshot.forEach((doc) => {
        productos.push({ id: doc.id, ...doc.data() });
      });
  
      // Verifica si hay productos para la categoría solicitada
      if (productos.length === 0) {
          return res.status(404).json({ message: `No products found for category: ${category}` });
      }

      return res.status(200).json(productos);
  } catch (error) {
      return res.status(500).json({ message: "Error fetching products by category.", error: error.message });
  }
};

// Actualizar el producto
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProductData = req.body; // Los datos actualizados deben estar en el cuerpo de la solicitud (request body)
    await firestore.updateDoc(firestore.doc(fs, 'producto', productId), updatedProductData);
    res.json({ id: productId, ...updatedProductData });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto.' });
  }
};

// Eliminar
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    await firestore.deleteDoc(firestore.doc(fs, 'producto', productId));
    res.json({ id: productId, message: 'Producto eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto.' });
  }
};

export {getProducts,getProductByID,getProductsByCategory,createProduct,updateProduct,deleteProduct};