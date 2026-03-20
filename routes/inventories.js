var express = require('express');
var router = express.Router();
let { data } = require('../utils/data');

// Populate helper
function populateProduct(inv) {
    let prod = data.products.find(p => p._id === inv.product);
    return { ...inv, product: prod || inv.product };
}

router.get('/', function (req, res, next) {
    let populated = data.inventories.map(populateProduct);
    res.status(200).send(populated);
});

router.get('/:id', function (req, res, next) {
    let result = data.inventories.find(i => i._id === req.params.id);
    if (result) {
        res.status(200).send(populateProduct(result));
    } else {
        res.status(404).send({ message: "INVENTORY NOT FOUND" });
    }
});

router.post('/add-stock', function (req, res, next) {
    const { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
        return res.status(400).send({ message: "Invalid product or quantity" });
    }

    let index = data.inventories.findIndex(i => i.product === product);
    if (index !== -1) {
        data.inventories[index].stock += quantity;
        res.status(200).send(data.inventories[index]);
    } else {
        res.status(404).send({ message: "Inventory for product not found" });
    }
});

router.post('/remove-stock', function (req, res, next) {
    const { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
        return res.status(400).send({ message: "Invalid product or quantity" });
    }

    let index = data.inventories.findIndex(i => i.product === product);
    if (index === -1) {
        return res.status(404).send({ message: "Inventory for product not found" });
    }

    if (data.inventories[index].stock < quantity) {
        return res.status(400).send({ message: "Not enough stock" });
    }

    data.inventories[index].stock -= quantity;
    res.status(200).send(data.inventories[index]);
});

router.post('/reservation', function (req, res, next) {
    const { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
        return res.status(400).send({ message: "Invalid product or quantity" });
    }

    let index = data.inventories.findIndex(i => i.product === product);
    if (index === -1) {
        return res.status(404).send({ message: "Inventory for product not found" });
    }

    if (data.inventories[index].stock < quantity) {
        return res.status(400).send({ message: "Not enough stock to reserve" });
    }

    data.inventories[index].stock -= quantity;
    data.inventories[index].reserved += quantity;
    res.status(200).send(data.inventories[index]);
});

router.post('/sold', function (req, res, next) {
    const { product, quantity } = req.body;
    if (!product || !quantity || quantity <= 0) {
        return res.status(400).send({ message: "Invalid product or quantity" });
    }

    let index = data.inventories.findIndex(i => i.product === product);
    if (index === -1) {
        return res.status(404).send({ message: "Inventory for product not found" });
    }

    if (data.inventories[index].reserved < quantity) {
        return res.status(400).send({ message: "Not enough reserved items" });
    }

    data.inventories[index].reserved -= quantity;
    data.inventories[index].soldCount += quantity;
    res.status(200).send(data.inventories[index]);
});

module.exports = router;
