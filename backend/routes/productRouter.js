const express = require('express');
const { listProducts, singleProduct, addProduct, removeProduct } = require('../controllers/productController');

const productRouter = express.Router();

productRouter.get('/list', listProducts);
productRouter.get('/:id', singleProduct);
productRouter.post('/add', addProduct);
productRouter.post('/remove', removeProduct);

module.exports = productRouter;
