import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
    required: true
  },
  productCount : Number
});

const Category = mongoose.model('Category', categorySchema);

export default Category;