const express = require('express')
const app = express()
const cors = require('cors');
const session = require('express-session');

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./../wmc-webprojekt-firebase-key.json');

app.use(express.json());
app.use(cors());

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
// Routes
app.get('/', (req, res) => {
    res.send('Home Page');
});

app.get('/bikes', async (req, res) => {
    const bikes = await db.collection('bikes').get();
    let data = [];
    bikes.forEach(doc => {
      data.push(doc.id);
    });
    console.log(data);
    res.json(data);
})

app.get('/bikes/:type/:id', async (req, res) => {
    const bike = await db.collection('bikes').where('model', '==', req.params.type).where('id', '==', req.params.id).get();
    
    let data = [];
    bike.forEach(doc => {
        data.push(doc.data());
    });
    res.json(data);

    res.json(bike);
})

app.get('/bikes/:id', async (req, res) => {
    const bikes = await db.collection('bikes').where('model', '==', req.params.id).get();
    let data = [];
    bikes.forEach(doc => {
        data.push(doc.data());
    });
    res.json(data);
})

app.post('/bikes', async (req, res) => {
    const data = {          
        name: req.body.name,
        model: req.body.model,
        color: req.body.color,
        ccm: req.body.ccm,
        abs: req.body.abs,
        fuel_capacity: req.body.fuel_capacity,
        mass: req.body.mass,
        horse_power: req.body.horse_power,
        fuel_consumption: req.body.fuel_consumption,
        quick_shifter: req.body.quick_shifter,
        image: req.body.image,
        id: ((await db.collection('bikes').count().get()).data().count).toString()
    }

    await db.collection('bikes').doc(((await db.collection('bikes').count().get()).data().count).toString()).set(data);

    res.end();
})

module.exports = app;