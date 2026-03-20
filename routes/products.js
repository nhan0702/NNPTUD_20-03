var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let { data, generateId } = require('../utils/data');

router.get('/', function (req, res, next) {
  let titleQ = req.query.title ? req.query.title : '';
  let maxPrice = req.query.maxPrice ? req.query.maxPrice : 1E4;
  let minPrice = req.query.minPrice ? req.query.minPrice : 0;

  let result = data.products.filter(function (e) {
    return (!e.isDeleted) &&
      e.title.toLowerCase().includes(titleQ.toLowerCase())
      && e.price > minPrice
      && e.price < maxPrice
  });

  // Populate category manually
  let populatedResult = result.map(prod => {
    let cat = data.categories.find(c => c._id === prod.category);
    return { ...prod, category: cat || prod.category };
  });

  res.send(populatedResult);
});

router.get('/slug/:slug', function (req, res, next) {
  let slug = req.params.slug;
  let result = data.products.find(p => p.slug === slug && !p.isDeleted);

  if (result) {
    let cat = data.categories.find(c => c._id === result.category);
    res.status(200).send({ ...result, category: cat || result.category });
  } else {
    res.status(404).send({ message: "SLUG NOT FOUND" });
  }
});

router.get('/:id', function (req, res, next) {
  let result = data.products.find(p => p._id === req.params.id && !p.isDeleted);
  if (result) {
    res.status(200).send(result);
  } else {
    res.status(404).send({ message: "ID NOT FOUND" });
  }
});

router.post('/', function (req, res, next) {
  try {
    let newObj = {
      _id: generateId(),
      title: req.body.title,
      slug: slugify(req.body.title, { replacement: '-', lower: true, locale: 'vi' }),
      price: req.body.price,
      description: req.body.description,
      category: req.body.categoryId,
      images: req.body.images || ["https://smithcodistributing.com/wp-content/themes/hello-elementor/assets/default_product.png"],
      isDeleted: false,
      createdAt: new Date()
    };

    data.products.push(newObj);

    // Create corresponding inventory
    let newInventory = {
      _id: generateId(),
      product: newObj._id,
      stock: 0,
      reserved: 0,
      soldCount: 0,
      createdAt: new Date()
    };
    data.inventories.push(newInventory);

    res.send(newObj);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put('/:id', function (req, res, next) {
  let index = data.products.findIndex(p => p._id === req.params.id && !p.isDeleted);
  if (index !== -1) {
    data.products[index] = { ...data.products[index], ...req.body };
    res.status(200).send(data.products[index]);
  } else {
    res.status(404).send({ message: "ID NOT FOUND" });
  }
});

router.delete('/:id', function (req, res, next) {
  let index = data.products.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    data.products[index].isDeleted = true;
    res.status(200).send(data.products[index]);
  } else {
    res.status(404).send({ message: "ID NOT FOUND" });
  }
});

module.exports = router;
