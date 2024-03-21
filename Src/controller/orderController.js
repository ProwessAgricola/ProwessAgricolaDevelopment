import "firebase/database";
import * as firestore from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { fs } from "../database/firebase.js"; 

// Agregar una nueva orden
/*
// Create an order in the Firebase Realtime Database
export const createOrder = async (req, res) => {
    try {
      const newOrderRef = database.ref('orden').push();
      const newOrder = {
        id: newOrderRef.key,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phone: req.body.phone,
        sellerId: req.body.sellerId,
        itemsPrice: req.body.itemsPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        isPaid: req.body.isPaid,
        isDelivered: req.body.isDelivered,
        deliveredAt: req.body.deliveredAt,
        paidAt: req.body.paidAt,
      };
      await newOrderRef.set(newOrder);
      return res.status(201).send({ message: 'New Order Created', order: newOrder });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating order' });
    }
  };
*/
export const createOrder = async (req, res) => {
  try {
    const newOrder2tData = req.body; // Los datos de la nueva orden deben estar en el cuerpo de la solicitud (request body)

    const docRef = await firestore.addDoc(
      firestore.collection(fs, "orden"),
      newOrder2tData
    );
    res.json({ id: docRef.id, ...newOrder2tData });
  } catch (error) {
    console.error("Error al crear el order:", error);
    res.status(500).json({ error: "Error al crear el order." });
  }
};

/*
Modelo crear orden PostMan

{
  "name": "Nombre de la orden 5",
  "email": "correo@ejemplo.com",
  "address": "Dirección del orden 1",
  "phone": "1234567890",
  "sellerId": "ID 1 del vendedor",
  "itemsPrice": 100,
  "taxPrice": 10,
  "totalPrice": 110,
  "isPaid": true,
  "isDelivered": false,
  "deliveredAt": null
}

*/

// Obtenga todos los pedidos para un ID de usuario determinado de Firebase Realtime Database
export const getMyOrders = async (req, res) => {
  try {
    const userId = String(req.params.userId);
    const ordenesCollection = firestore.collection(fs, "orden");

    // Consulta las órdenes que tienen el mismo userId
    const querySnapshot = await firestore.getDocs(
      firestore.query(
        ordenesCollection,
        firestore.where("userId", "==", userId)
      )
    );

    const ordenes = [];
    querySnapshot.forEach((ordenDoc) => {
      ordenes.push({ id: ordenDoc.id, ...ordenDoc.data() });
    });

    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
    res.status(500).json({ error: "Error al obtener las órdenes." });
  }
};

// Eliminar un pedido de Firebase Realtime Database
/*
  export const deleteOrder = async (req, res) => {
    try {
      const { id } = req.params;
      await database.ref('orders').child(id).remove();
      res.json({ message: 'Order deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
*/
export const deleteOrder = async (req, res) => {
  try {
    const ordenId = req.params.id;
    await firestore.deleteDoc(firestore.doc(fs, "orden", ordenId));
    res.json({ id: ordenId, message: "Orden eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar el orden:", error);
    res.status(500).json({ error: "Error al eliminar el Orden." });
  }
};

export const getAll = async (req, res) => {
  try {
    const ordenesCollectionRef = collection(fs, "orden");
    const querySnapshot = await getDocs(ordenesCollectionRef);
    const ordenes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener todas las órdenes:", error);
    res.status(500).json({ error: "Error al obtener todas las órdenes." });
  }
};
