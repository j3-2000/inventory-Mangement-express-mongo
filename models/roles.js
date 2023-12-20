import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: { type: String ,
        required: true,
        unique: false}
});

let Role = mongoose.model('Role', roleSchema);



export default Role