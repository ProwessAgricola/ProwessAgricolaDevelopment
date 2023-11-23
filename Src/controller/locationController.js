import * as firebase from "firebase/app";
import * as firestore from "firebase/firestore";
import 'firebase/storage';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { query, where, getDocs, collection } from "firebase/firestore";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {fs,storage} from '../database/firebase.js';
import * as fils from 'fs';


const exportProvinces = async (req, res) => {
    const provincia = req.params.province;
    fils.readFile('src/data/locations.json', (err, data) => {
        if (err) throw err;
        const jsonData = JSON.parse(data);
        var cantones = [];
        var state = false;
        // Recorremos las claves del objeto JSON para extraer la propiedad "provincia"
        for (const key in jsonData) {
          if (jsonData.hasOwnProperty(key)) {
            const caso = jsonData[key];
            if (caso.provincia === provincia) {
                cantones = caso.cantones;
                state = true;
            }
        }
    }
        if(cantones.length>0){
        }
        if(state===true){
            return res.status(200).send({ message: cantones });
        }
        return res.status(404).send({ message: "No se encontraron provincias" });
});
}

export {exportProvinces};