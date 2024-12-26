const express = require('express');
const app = express();
const port = 8000;
const mongoose = require('mongoose');
const cors = require('cors');

app.use(express.json());
app.use(cors());

const connect = () => {
  mongoose.connect('mongodb://13.54.105.133:27017/devopsAssignment', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));
}

const Product = mongoose.model('Product', {
  name: String,
  price: Number,
});

app.get('/', (req, res) => {
  res.send('DevOps Assignment!');
});

app.get('/api/v1/products', (req, res) => {
  Product.find()
    .then(products => res.json({
      status: 'success',
      data: products
    }))
    .catch(error => res.status(500).json({ error }));
});

app.post('/api/v1/products', (req, res) => {
  const product = new Product(req.body);
  product.save()
    .then(product => res.json({
      status: 'success',
      data: product
    }))
    .catch(error => res.status(500).json({ error }));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connect();
});