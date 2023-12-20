import express from 'express';
import dotenv from 'dotenv';
import db from './connectDB/db.js';
import userRoutes from './routes/user-routes.js';
import adminRoutes from './routes/admin-routes.js';
import categoryRoutes from './routes/category-routes.js';
import productRoutes from './routes/product-routes.js';

dotenv.config();
const port = process.env.PORT
const app = express();

app.set('view engine', 'pug');
app.set('views', './view');
app.use('/', userRoutes);
app.use('/', adminRoutes);
app.use('/category', categoryRoutes)
app.use('/product', productRoutes)


app.listen(port,
    console.log(`server running at port number ${port}`)
)

