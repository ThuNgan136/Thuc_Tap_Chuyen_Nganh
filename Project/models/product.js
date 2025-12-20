const mongoose = require('mongoose');



const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    status: {
        type: Boolean,
        default: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
}, { timestamps: true });

module.exports = mongoose.model('product', ProductSchema);
