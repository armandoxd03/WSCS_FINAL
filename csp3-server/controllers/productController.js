const Product = require("../models/Product");

module.exports.getAll = (req,res) => {
    return Product.find()
    .then(products => res.status(200).send( products ))
    .catch(err => res.status(500).send({ error: "Error in Find", details: err}))
}

module.exports.getAllActive = (req,res) => {
    return Product.find({isActive : true})
    .then(products => res.status(200).send( products ))
    .catch(err => res.status(500).send({ error: "Error in Find", details: err}))
}

module.exports.addProduct = (req,res) => {
    let newProduct = new Product({
        name : req.body.name,
        description : req.body.description,
        price : req.body.price,
        imageUrl: req.body.imageUrl
    });

    return newProduct.save()
    .then((product) => res.status(201).send( product ))
    .catch(err => res.status(500).send({ error: "Error in Save", details: err}))  
}

module.exports.getProduct = (req,res) => {
    return Product.findById(req.params.productId)
    .then(product  => res.status(200).send( product ))
    .catch(err => res.status(500).send({ error: "Error in Find", details: err}))  
}

module.exports.updateProduct = (req, res) => {
    let updatedProduct = {
        name : req.body.name,
        description    : req.body.description,
        price : req.body.price,
        imageUrl: req.body.imageUrl
    }

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then((product) => res.status(200).send({ 
        message: 'Product updated successfully', 
        updatedProduct: product 
    }))
    .catch(err => res.status(500).send({ error: "Error in Saving", details: err}))
}

module.exports.archiveProduct = (req, res) => {
    let updateActiveField = {
        isActive : false
    }

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then((archiveProduct) => res.status(200).send({ 
        message: 'Product archived successfully', 
        archiveProduct: archiveProduct 
    }))
    .catch(err => res.status(500).send({ error: "Error in Saving", details: err}))  
}

module.exports.activateProduct = (req, res) => {
    let updateActiveField = {
        isActive : true
    }

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then((activateProduct) => res.status(200).send({ 
        message: 'Product activated successfully', 
        activateProduct: activateProduct 
    }))
    .catch(err => res.status(500).send({ error: "Error in Saving", details: err}))  
}

module.exports.searchByProductName = (req, res) => {
  const searchName = req.body.name;
  const regex = new RegExp(searchName, 'i');
  Product.find({ name: regex })
    .then((products) => res.status(200).send(products))
    .catch((err) => res.status(500).send({ error: 'Error in Find', details: err }));
};

module.exports.searchByProductPrice = (req,res) => {
    return Product.find({
        price: {
          $gte: req.body.minPrice,
          $lte: req.body.maxPrice,
        }
      })
    .then((products)  => res.status(200).send({products}))
    .catch(err => res.status(500).send({ error: "Error in Find", details: err}))  
}