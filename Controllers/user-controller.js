import Model from '../models/model.js';
import Role from '../models/roles.js';
import Product from '../models/product.js';
import bcrypt from 'bcrypt';
import date from '../helper/date.js';
import mail from '../helper/mailSender.js';
import  { signToken}  from '../middlewares/token.js';
import Inventory from '../models/inventory.js';
import Order from '../models/order.js';
import Category from '../models/category.js';

export const signup = async (req, res) => {

    try {
        const saltRounds = 5;
        const userData = req.body;
        const existingUser = await Model.findOne({ email: userData.email });

        const saveData = async (roleId) => {
            const hash = await bcrypt.hash(userData.password, saltRounds);
            const dataToSave = new Model({
                ...userData,
                password: hash,
                date: date,
                roles: roleId,
            });
            await dataToSave.save();
            res.status(200).json({ message: `'welcome !! ${dataToSave.name}'`, details: dataToSave });
        }

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        } else {
            const userRole = await Role.findOne({ name: 'user' }) || await Role.create({ name: 'user' });
            const adminRole = await Role.findOne({ name: 'admin' }) || await Role.create({ name: 'admin' });

            if (!userRole._id) {
                await userRole.save();
            }
            if (!adminRole._id) {
                await adminRole.save();
            }
            // await userRole.save();
            // await adminRole.save();

            userData.role == "admin" ? saveData(adminRole._id) : saveData(userRole._id)
        }
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }


};

export const login = async (req, res) => {
    try {
        const login_data = req.body;
        const data = await Model.findOne({ email: login_data.email.toLowerCase() });

        if (!data) {
            res.status(400).json({ message: 'User not exist' });
        } else {
            const passwordsMatch = await bcrypt.compare(login_data.password, data.password);

            if (!passwordsMatch) {
                res.status(400).json({ message: 'Incorrect password' });
            } else {
                const generatedToken = signToken({ data: { user_id: data._id, user_email: login_data.email.toLowerCase() } });
                res.cookie('token', generatedToken, { httpOnly: true });
                res.status(200).json({ message: `Welcome back ${data.name}`, loggedInUser: { name: data.name, email: data.email }, token: [generatedToken] });
            }
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updated_data = req.body;
        const userData = req.userData
        const user_email = userData.user_email;
        const updateUser = await Model.findOneAndUpdate({ email: user_email.toLowerCase() }, updated_data, { new: true });

        if (updateUser) {
            res.status(200).json({ message: 'Profile updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error processing the PUT request:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
}

export const forgotPassword = async function (req, res) {
    try {
        const forgot_email = req.body;
        const data = await Model.findOne({
            email: forgot_email.email.toLowerCase(),
        });

        if (data) {

            const generatedToken = signToken({ data: { user_email: forgot_email.email.toLowerCase() } });
            // const token = signToken({ data: { user_email: forgot_email.email.toLowerCase() } })
            await mail(forgot_email.email.toLowerCase(), generatedToken);
            res.status(200).json({ message: "link to change password is send :expires in 2 min", token: generatedToken });
        } else {
            res.status(400).json({ message: "email not exist in database" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const userData = req.userData
        const reset_mail = userData.user_email;
        const entered_password = req.body
        const hash = await bcrypt.hash(entered_password.password, 5);
        const updateUser = await Model.findOneAndUpdate({ email: reset_mail }, { password: hash }, { new: true })
        if (updateUser) {
            res.status(200).json({ message: ` Your password has been updated` });
        } else {
            res.status(404).json({ message: 'user not found' })
        }
    } catch (error) {
        console.error('Error processing the PUT request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const displayProducts = async (req, res) => {
    try {
        const products = await Inventory.find().populate('productId')

        const allProducts = products.map(product => ({
            name: product.productId.name,
            price: product.productId.price,
            quantity: product.quantity,
        }));

        res.status(200).json(allProducts);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const displayCategoryProducts = async (req, res) => {
    try {
        const { categoryId } = req.body;

        const categoryProducts = await Product.find({ categoryId: categoryId });
        const categoryName = await Category.findOne({ _id : categoryId });

        if (categoryProducts.length === 0) {
            return res.status(404).json({ error: 'No products found in the specified category.' });
        }

        const allProducts = [];

        for (const product of categoryProducts) {

            const inventory = await Inventory.findOne({ productId: product._id }).populate('productId');

            if (inventory) {

                const productDetails = {
                    id: inventory.productId._id,
                    name: inventory.productId.name,
                    price: inventory.productId.price,
                    quantity: inventory.quantity,
                };
                allProducts.push(productDetails);
            }
        }

        res.status(200).json({message : `All Products of ${categoryName.name} category`, products : allProducts});

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const orderProducts = async (req, res) => {
    try {
        const { productId, quantity } = req.body
        const userData = req.userData
        const inventory = await Inventory.findOne({ productId: productId }).populate("productId");

        if (!inventory) {
            return res.status(404).json({ error: 'Inventory not found for the specified product.' });
        }

        if (inventory.quantity < quantity) {
            return res.status(400).json({ error: 'Insufficient quantity in the inventory.' });
        }
     
        inventory.quantity -= quantity;
        await inventory.save();

        const orderDetails = new Order({
            productId: productId,
            userId: userData.user_id,
            quantity: quantity,
            cartPrice : inventory.productId.price * quantity
        });

        await orderDetails.save();

        res.status(200).json({ product_name : inventory.productId.name ,details: orderDetails });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
