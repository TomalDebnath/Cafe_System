const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// Menu data with free Unsplash images
const menuItems = [
{
    id: 1,
    name: 'Espresso',
    price: 350,
    description: 'Rich and bold single shot',
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400',
    category: 'Coffee',
    rating: 4.8
},
{
    id: 2,
    name: 'Latte',
    price: 420,
    description: 'Smooth espresso with steamed milk',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400',
    category: 'Coffee',
    rating: 4.7
},
{
    id: 3,
    name: 'Cappuccino',
    price: 400,
    description: 'Espresso with foamy milk',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
    category: 'Coffee',
    rating: 4.6
},
{
    id: 4,
    name: 'Mocha',
    price: 450,
    description: 'Chocolate flavored coffee',
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400',
    category: 'Coffee',
    rating: 4.9
},
{
    id: 5,
    name: 'Americano',
    price: 380,
    description: 'Espresso with hot water',
    image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400',
    category: 'Coffee',
    rating: 4.5
},
{
    id: 6,
    name: 'Green Tea',
    price: 250,
    description: 'Premium Japanese green tea',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    category: 'Tea',
    rating: 4.4
},
{
    id: 7,
    name: 'Masala Chai',
    price: 200,
    description: 'Traditional Indian spiced tea',
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400',
    category: 'Tea',
    rating: 4.7
},
{
    id: 8,
    name: 'Earl Grey',
    price: 280,
    description: 'Classic bergamot flavored tea',
    image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400',
    category: 'Tea',
    rating: 4.3
},
{
    id: 9,
    name: 'Croissant',
    price: 280,
    description: 'Buttery French pastry',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400',
    category: 'Pastry',
    rating: 4.8
},
{
    id: 10,
    name: 'Blueberry Muffin',
    price: 320,
    description: 'Fresh baked with real blueberries',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400',
    category: 'Pastry',
    rating: 4.6
},
{
    id: 11,
    name: 'Chocolate Cake',
    price: 350,
    description: 'Rich chocolate layer cake',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    category: 'Dessert',
    rating: 4.9
},
{
    id: 12,
    name: 'Tiramisu',
    price: 400,
    description: 'Classic Italian coffee dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    category: 'Dessert',
    rating: 4.7
}
];
// Cart storage with quantity tracking
let cart = [];
// API Routes
app.get('/api/menu', (req, res) =>
{
    res.json(menuItems);
});
app.get('/api/menu/:id', (req, res) =>
{
    const item = menuItems.find(item => item.id === parseInt(req.params.id));
    if (item)
    {
        res.json(item);
    }
    else
    {
        res.status(404).json(
        {
            error: 'Item not found'
        });
    }
});
app.get('/api/cart', (req, res) =>
{
    const cartWithDetails = cart.map(cartItem =>
    {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        return {
            ...cartItem,
            name: menuItem ? menuItem.name : 'Unknown Item',
            price: menuItem ? menuItem.price : 0,
            image: menuItem ? menuItem.image : '☕',
            description: menuItem ? menuItem.description : '',
            subtotal: (menuItem ? menuItem.price : 0) * cartItem.quantity
        };
    });
    const total = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);
    res.json(
    {
        items: cartWithDetails,
        total: total,
        totalItems: totalItems
    });
});
app.post('/api/cart/add', (req, res) =>
{
    const
    {
        id, quantity = 1
    }
    = req.body;
    const menuItem = menuItems.find(item => item.id === id);
    if (!menuItem)
    {
        return res.status(404).json( {
            
            error: 'Item not found'
        });
    }
    const existingItem = cart.find(item => item.id === id);
    if (existingItem)
    {
        existingItem.quantity += quantity;
    }
    else
    {
        cart.push(
        {
            id: id, quantity: quantity
        });
    }
    // Return updated cart
    const cartWithDetails = cart.map(cartItem =>
    {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        return {
            ...cartItem,
            name: menuItem ? menuItem.name : 'Unknown Item',
            price: menuItem ? menuItem.price : 0,
            image: menuItem ? menuItem.image : '☕',
            subtotal: (menuItem ? menuItem.price : 0) * cartItem.quantity
        };
    });
    const total = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);
    res.json(
    {
        items: cartWithDetails,
        total: total,
        totalItems: totalItems
    });
});
app.put('/api/cart/update/:id', (req, res) =>
{
    const itemId = parseInt(req.params.id);
    const
    {
        quantity
    }
    = req.body;
    const cartItem = cart.find(item => item.id === itemId);
    if (!cartItem)
    {
        return res.status(404).json( {
            
            error: 'Item not in cart'
        });
    }
    if (quantity <= 0)
    {
        cart = cart.filter(item => item.id !== itemId);
    }
    else
    {
        cartItem.quantity = quantity;
    }
    const cartWithDetails = cart.map(cartItem =>
    {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        return {
            ...cartItem,
            name: menuItem ? menuItem.name : 'Unknown Item',
            price: menuItem ? menuItem.price : 0,
            image: menuItem ? menuItem.image : '☕',
            subtotal: (menuItem ? menuItem.price : 0) * cartItem.quantity
        };
    });
    const total = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);
    res.json(
    {
        items: cartWithDetails,
        total: total,
        totalItems: totalItems
    });
});
app.delete('/api/cart/remove/:id', (req, res) =>
{
    const itemId = parseInt(req.params.id);
    cart = cart.filter(item => item.id !== itemId);
    const cartWithDetails = cart.map(cartItem =>
    {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        return {
            ...cartItem,
            name: menuItem ? menuItem.name : 'Unknown Item',
            price: menuItem ? menuItem.price : 0,
            image: menuItem ? menuItem.image : '☕',
            subtotal: (menuItem ? menuItem.price : 0) * cartItem.quantity
        };
    });
    const total = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);
    res.json(
    {
        items: cartWithDetails,
        total: total,
        totalItems: totalItems
    });
});
app.delete('/api/cart/clear', (req, res) =>
{
    cart = [];
    res.json(
    {
        items: [],
        total: 0,
        totalItems: 0,
        message: 'Cart cleared successfully'
    });
});
app.post('/api/order', (req, res) =>
{
    if (cart.length === 0)
    {
        return res.status(400).json( {
            
            error: 'Your cart is empty!'
        });
    }
    const cartWithDetails = cart.map(cartItem =>
    {
        const menuItem = menuItems.find(item => item.id === cartItem.id);
        return {
            ...cartItem,
            name: menuItem ? menuItem.name : 'Unknown Item',
            price: menuItem ? menuItem.price : 0,
            image: menuItem ? menuItem.image : '☕',
            subtotal: (menuItem ? menuItem.price : 0) * cartItem.quantity
        };
    });
    const orderTotal = cartWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = Math.floor(Math.random() * 10000) + 1;
    const orderConfirmation =
    {
        orderNumber: 'NE' + orderNumber,
        items: cartWithDetails,
        total: orderTotal,
        timestamp: new Date().toISOString(),
        estimatedTime: '15-20 minutes'
    };
    cart = []; // Clear cart after successful order
    res.json(orderConfirmation);
});
// Serve the main page
app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(PORT, () =>
{
    console.log('☕ North End Cafe server running at http://localhost:' + PORT);
    console.log('📋 Menu items available: ' + menuItems.length);
    console.log('🛒 Cart system ready');
});