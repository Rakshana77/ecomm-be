const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
});

const Product = mongoose.model('Product', productSchema);

// Cart Schema
const cartSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
});

const Cart = mongoose.model('Cart', cartSchema);

// Routes
// Get all products
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get all cart items
app.get('/cart', async (req, res) => {
  const cart = await Cart.find().populate('product');
  res.json(cart);
});

// Add to cart
app.post('/cart', async (req, res) => {
  const { productId } = req.body;
  let cartItem = await Cart.findOne({ product: productId });
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cartItem = new Cart({ product: productId, quantity: 1 });
  }
  await cartItem.save();
  res.json(cartItem);
});

// Update cart item quantity
app.put('/cart/:id', async (req, res) => {
  const { action } = req.body;
  const cartItem = await Cart.findById(req.params.id);
  if (action === 'increment') {
    cartItem.quantity += 1;
  } else if (action === 'decrement' && cartItem.quantity > 1) {
    cartItem.quantity -= 1;
  }
  await cartItem.save();
  res.json(cartItem);
});

// Delete cart item
app.delete('/cart/:id', async (req, res) => {
  await Cart.findByIdAndDelete(req.params.id);
  res.json({ message: 'Cart item deleted' });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
