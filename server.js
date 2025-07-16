const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Soporte para JSON (fetch)
app.use(express.json());

// Soporte para formularios tradicionales (opcional)
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('public'));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/encuesta_umar', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Esquema flexible
const Encuesta = mongoose.model('Encuesta', {
  datos: mongoose.Schema.Types.Mixed,
  fecha: { type: Date, default: Date.now }
});

// POST: guardar datos de la encuesta
app.post('/encuesta', (req, res) => {
  const nueva = new Encuesta({ datos: req.body });

  nueva.save()
    .then(() => {
      console.log('✅ Encuesta guardada');
      res.json({ mensaje: '¡Gracias por participar!' });
    })
    .catch(err => {
      console.error('❌ Error al guardar:', err);
      res.status(500).json({ error: 'Error al guardar datos.' });
    });
});

// Vista de administración
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API para obtener respuestas
app.get('/api/respuestas', async (req, res) => {
  try {
    const datos = await Encuesta.find().sort({ fecha: -1 });
    res.json(datos);
  } catch (err) {
    console.error('❌ Error al obtener respuestas:', err);
    res.status(500).json({ error: 'Error al obtener respuestas' });
  }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
