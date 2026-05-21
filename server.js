const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// MongoDB Atlas connection string — reemplaza con la tuya
const MONGO_URI = process.env.MONGO_URI || 'TU_CONNECTION_STRING_AQUI';
const DB_NAME = 'tododb';

let db;

async function conectar() {
  const client = await MongoClient.connect(MONGO_URI);
  db = client.db(DB_NAME);
  console.log('✅ Conectado a MongoDB Atlas');
}

// GET todas las tareas
app.get('/api/tareas', async (req, res) => {
  const tareas = await db.collection('tareas').find().sort({ _id: -1 }).toArray();
  res.json(tareas);
});

// POST nueva tarea
app.post('/api/tareas', async (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: 'El texto es requerido' });

  const resultado = await db.collection('tareas').insertOne({
    texto,
    completada: false,
    fecha: new Date()
  });
  res.json({ _id: resultado.insertedId, texto, completada: false });
});

// PUT actualizar tarea (marcar completada)
app.put('/api/tareas/:id', async (req, res) => {
  const { id } = req.params;
  const { completada } = req.body;
  await db.collection('tareas').updateOne(
    { _id: new ObjectId(id) },
    { $set: { completada } }
  );
  res.json({ ok: true });
});

// DELETE eliminar tarea
app.delete('/api/tareas/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('tareas').deleteOne({ _id: new ObjectId(id) });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
conectar().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
});
