import Product from '../models/product.js';
import Category from '../models/category.js';
import Inventory from '../models/inventory.js';

export const addProduct = async (req, res) => {
    try {
        const { name, price, categoryId, quantity } = req.body;

        const addProductManually = async (id) => {
            let existingProduct = await Product.findOne({ name: name })

            if (!existingProduct) {
                const newProduct = new Product({
                    name,
                    price,
                    categoryId: id,
                });
                const savedProduct = await newProduct.save();
                const newInventory = new Inventory({
                    productId: savedProduct._id,
                    quantity: parseInt(quantity, 10),
                });
                await newInventory.save();

                res.status(201).json({ "product details": savedProduct, });
            } else {
                res.status(500).json({ "product details": "product already exists" });
            }
        }
        
        let existingCategory = await Category.findOne({ _id: categoryId })
       
        !existingCategory? res.status(404).json({ "msg": 'category not exist!! please add first' }): addProductManually(existingCategory._id)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }


};

export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        await Inventory.findOneAndDelete({ productId: productId });

        const deletedProduct = await Product.findByIdAndDelete(productId)

        deletedProduct ? res.status(200).json({
            "msg": `Product Named {${deletedProduct.name}} is deleted with associated inventory`
        }) : res.status(404).json({ "msg": `following id (${productId}) is not found` })

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
