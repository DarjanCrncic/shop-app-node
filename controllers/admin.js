const { deleteProduct } = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  User.findByPk(req.session.user.id).then(user => {
    return user;
  }).then(user => {
    return user.createProduct({
      title: title,
      imageUrl: imageUrl,
      description: description,
      price: price
    });
  }).then(result => {
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const productId = req.params.productId;
  Product.findByPk(productId).then(product => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedProduct = new Product(productId, req.body.title, req.body.imageUrl, req.body.description, req.body.price);
  
  Product.findByPk(productId).then(product => {
    product.title = req.body.title;
    product.description = req.body.description;
    product.price = req.body.price;
    product.imageUrl = req.body.imageUrl;
    return product.save();
  }).then(result => {
    console.log("Updated product");
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  })
};

exports.getProducts = (req, res, next) => {
  User.findByPk(req.session.user.id).then(user => {
    return user;
  }).then(user => { 
    return user.getProducts();
  }).then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  }).catch(err => {
    console.log(err);
  });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findByPk(productId).then(product => {
    return product.destroy();
  }).then(result => {
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  });
  
};