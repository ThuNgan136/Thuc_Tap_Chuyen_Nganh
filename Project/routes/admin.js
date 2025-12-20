var express = require('express');
var router = express.Router();

const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/Order'); // <-- quan trọng, thêm dòng này

/* SET ADMIN LAYOUT */
router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    next();
});

/* DASHBOARD */
router.get('/', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // khách hàng đã từng đặt hàng
        const customers = await Order.distinct('customer.name'); // dùng customer.name
        const totalCustomers = customers.length;

        // tổng doanh thu
        const revenueResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" } // dùng total, ko phải totalPrice
                }
            }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        res.render('admin/index', {
            title: 'Admin Dashboard',
            totalProducts,
            totalOrders,
            totalCustomers,
            totalRevenue
        });
    } catch (err) {
        console.error(err);
        res.render('admin/index', { title: 'Admin Dashboard' });
    }
});

/* PRODUCT PAGE */
router.get('/product', function (req, res) {
    res.render('admin/product/product-list', { title: 'Product' });
});

/* CREATE ORDER */
router.post('/', async (req,res)=>{
    console.log('req.body:', req.body);
    try{
        const { customer, items } = req.body;
        if(!customer || !items || items.length===0){
            console.log("Dữ liệu không hợp lệ");
            return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
        }

        const total = items.reduce((sum,i)=>sum+i.price*i.qty,0);
        const order = new Order({ customer, items, total });
        await order.save();
        console.log("Order saved:", order);
        res.json({ success: true, orderId: order._id });
    } catch(err){
        console.error("Lỗi server:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

/* LIST ORDERS */
router.get('/order', async (req, res) => {
    try {
        const orders = await Order.find({}).lean();
        console.log('Orders from DB:', orders); // debug
        res.render('admin/order/order', { orders });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).send('Lỗi server khi load đơn hàng');
    }
});

module.exports = router;
