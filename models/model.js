
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  date : String,
  name: String,
  email: String,
  password: String,
  phone: Number,
  address: {
    city: String,
    state: String,
    locality: String
  },
  roles: { type: mongoose.Schema.Types.ObjectId, ref: 'Role',
  required: true}
}, { timestamps: true });

const Model = mongoose.model('User', userSchema)

export default Model