import Product from '../models/product.js';
import Category from '../models/category.js';
import Inventory from '../models/inventory.js';


export const createCategory = async (req, res) => {
    try {
        const { category } = req.body;

        const userData = req.userData 
        const existingCategory = await Category.findOne({ name: category });

        return existingCategory
            ? res.status(400).json({ message: "Category already exists. Please add products to this category." })
            : res.status(200).json({
                message: `${category} created. Now you can add products to this category.`,
                category: await new Category({ name: category, createdBy: userData.user_id }).save(),
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;

        const products = await Product.find({ categoryId : categoryId });

        for(let product of products) {
     
          await Inventory.deleteMany({ productId: product._id });
        }
        await Product.deleteMany({ categoryId: categoryId });

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category and associated products deleted successfully' });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

