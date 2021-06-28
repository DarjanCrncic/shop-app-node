const Product = require('../models/product');
const User = require("../models/user");

exports.getProducts = (req, res, next) => {
  Product.findAll().then((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findByPk(productId).then(product => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getIndex = (req, res, next) => {
  Product.findAll().then((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCart = (req, res, next) => {
  User.findByPk(req.session.user.id).then(user => {
    return user;
  }).then(user => {
    return user.getCart();
  }).then(cart => {
    return cart.getProducts();
  }).then(products => {
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: products
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })


};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  User.findByPk(req.session.user.id).then(user => {
    return user;
  }).then(user => {
    return user.getCart();
  }).then(cart => {
    fetchedCart = cart;
    return cart.getProducts({ where: { id: productId } });
  }).then(products => {
    
    let product = (products.length > 0) ? products[0] : null;
    if (product) {
      const oldQuantity = product.cart_item.quantity;
      newQuantity = oldQuantity + 1;
    }
    return Product.findByPk(productId);

  }).then(prod => {
    return fetchedCart.addProduct(prod, { through: { quantity: newQuantity } });
  }).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postOrder = (req, res, next) => {
  let cartProducts;
  let fetchedCart;
  let currentUser;
  User.findByPk(req.session.user.id).then(user => {
    currentUser = user;
    return user;
  }).then(user => {
    return user.getCart();
  }).then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  }).then(products => {
    cartProducts = products;
    return currentUser.createOrder();
  }).then(order => {
    return order.addProducts(cartProducts.map(product => {
      product.order_item = { quantity: product.cart_item.quantity };
      return product;
    }));
  }).then(result => {
    return fetchedCart.setProducts(null);
  }).then(result => {
    res.redirect('/orders');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getOrders = (req, res, next) => {
  User.findByPk(req.session.user.id).then(user => {
    currentUser = user;
    return user;
  }).then(user => {
    return user.getOrders({include: ['products']});
  }).then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  
  User.findByPk(req.session.user.id).then(user => {
    return user;
  }).then(user => {
    return user.getCart();
  }).then(cart => {
    return cart.getProducts({where: {id: productId}});
  }).then(products => {
    const product = products[0];
    return product.cart_item.destroy();
  }).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};