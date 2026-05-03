// Global state
let currentFilter = 'all';
let cartItems = [];
let menuItems = [];
// DOM Elements
const menuGrid = document.getElementById('menuGrid');
const cartContent = document.getElementById('cartContent');
const cartFooter = document.getElementById('cartFooter');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const cartCountMobile = document.getElementById('cartCountMobile');
const cartSidebar = document.getElementById('cartSidebar');
const orderModal = document.getElementById('orderModal');
const orderDetails = document.getElementById('orderDetails');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
// Initialize
document.addEventListener('DOMContentLoaded', () =>
{
    loadMenu();
    loadCart();
    initializeEventListeners();
});
// Event Listeners
function initializeEventListeners()
{
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn =>
    {
        btn.addEventListener('click', (e) =>
        {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            displayMenu(menuItems);
        });
    });
    // Cart toggle buttons
    document.getElementById('cartToggle').addEventListener('click', toggleCart);
    document.getElementById('mobileCartToggle').addEventListener('click', toggleCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    // Checkout and clear cart buttons
    document.getElementById('checkoutBtn').addEventListener('click', placeOrder);
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    // Modal close buttons
    document.querySelectorAll('.btn-close-modal').forEach(btn =>
    {
        btn.addEventListener('click', closeModal);
    });
    // Close modal on outside click
    orderModal.addEventListener('click', (e) =>
    {
        if (e.target === orderModal)
        {
            closeModal();
        }
    });
    // Close cart sidebar when clicking outside on mobile
    document.addEventListener('click', (e) =>
    {
        if (window.innerWidth <= 1024)
        {
            const isClickInside = cartSidebar.contains(e.target) ||
            e.target.closest('.mobile-cart-toggle') ||
            e.target.closest('.cart-toggle');
            if (!isClickInside && cartSidebar.classList.contains('active'))
            {
                closeCart();
            }
        }
    });
    // Handle window resize
    window.addEventListener('resize', () =>
    {
        if (window.innerWidth > 1024 && cartSidebar.classList.contains('active'))
        {
            cartSidebar.classList.remove('active');
        }
    });
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) =>
    {
        if (e.key === 'Escape')
        {
            closeModal();
            closeCart();
        }
    });
}
// Load Menu Items
async function loadMenu()
{
    try
    {
        const response = await fetch('/api/menu');
        if (!response.ok) throw new Error('Failed to load menu');
        menuItems = await response.json();
        displayMenu(menuItems);
    }
    catch (error)
    {
        showNotification('Error loading menu items. Please refresh the page.', 'error');
        console.error('Error:', error);
        menuGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 20px;"></i>
        <h3>Failed to load menu</h3>
        <p>Please check your connection and refresh the page</p>
        </div>
        `;
    }
}
// Display Menu Items
function displayMenu(items)
{
    if (!items || items.length === 0)
    {
        menuGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
        <i class="fas fa-coffee" style="font-size: 3em; margin-bottom: 20px;"></i>
        <h3>No items found</h3>
        <p>Try selecting a different category</p>
        </div>
        `;
        return;
    }
    const filteredItems = currentFilter === 'all'
    ? items
    : items.filter(item => item.category === currentFilter);
    if (filteredItems.length === 0)
    {
        menuGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
        <i class="fas fa-search" style="font-size: 3em; margin-bottom: 20px;"></i>
        <h3>No items in this category</h3>
        <p>Try selecting "All" to see all items</p>
        </div>
        `;
        return;
    }
    menuGrid.innerHTML = filteredItems.map(item => `
    <div class="menu-item" data-id="${item.id}" data-category="${item.category}">
    <div class="menu-item-image">
    $
    {
        item.image
    }
    </div>
    <div class="menu-item-content">
    <h3>$
    {
        item.name
    }
    </h3>
    <p class="description">$
    {
        item.description
    }
    </p>
    <div class="menu-item-footer">
    <span class="price">$
    {
        item.price
    }
    BDT</span>
    <button class="btn-add-to-cart" onclick="addToCart(${item.id})">
    <i class="fas fa-plus"></i> Add
    </button>
    </div>
    </div>
    </div>
    `).join('');
}
// Add to Cart
async function addToCart(itemId, quantity = 1)
{
    try
    {
        const button = document.querySelector(`[data-id="${itemId}"] .btn-add-to-cart`);
        if (button)
        {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        }
        const response = await fetch('/api/cart/add',
        {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
            {
                id: itemId, quantity
            })
        });
        if (!response.ok)
        {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add item');
        }
        const cartData = await response.json();
        updateCart(cartData);
        const item = menuItems.find(i => i.id === itemId);
        showNotification(`${item ? item.name : 'Item'} added to cart! 🛒`);
        if (button)
        {
            button.innerHTML = '<i class="fas fa-check"></i> Added!';
            button.style.background = '#219a52';
            setTimeout(() =>
            {
                button.innerHTML = '<i class="fas fa-plus"></i> Add';
                button.style.background = '';
                button.disabled = false;
            },
            1000);
        }
        if (window.innerWidth <= 1024)
        {
            setTimeout(() =>
            {
                cartSidebar.classList.add('active');
            },
            500);
        }
    }
    catch (error)
    {
        showNotification(error.message || 'Error adding item to cart', 'error');
        console.error('Error:', error);
        const button = document.querySelector(`[data-id="${itemId}"] .btn-add-to-cart`);
        if (button)
        {
            button.innerHTML = '<i class="fas fa-plus"></i> Add';
            button.style.background = '';
            button.disabled = false;
        }
    }
}
// Remove from Cart
async function removeFromCart(itemId)
{
    try
    {
        const response = await fetch(`/api/cart/remove/${itemId}`,
        {
            method: 'DELETE'
        });
        if (!response.ok)
        {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove item');
        }
        const cartData = await response.json();
        updateCart(cartData);
        showNotification('Item removed from cart');
    }
    catch (error)
    {
        showNotification('Error removing item from cart', 'error');
        console.error('Error:', error);
    }
}
// Update Quantity
async function updateQuantity(itemId, newQuantity)
{
    try
    {
        if (newQuantity < 1)
        {
            await removeFromCart(itemId);
            return;
        }
        const response = await fetch(`/api/cart/update/${itemId}`,
        {
            method: 'PUT',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
            {
                quantity: newQuantity
            })
        });
        if (!response.ok)
        {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update quantity');
        }
        const cartData = await response.json();
        updateCart(cartData);
    }
    catch (error)
    {
        showNotification('Error updating quantity', 'error');
        console.error('Error:', error);
    }
}
// Load Cart from Server
async function loadCart()
{
    try
    {
        const response = await fetch('/api/cart');
        if (!response.ok) throw new Error('Failed to load cart');
        const cartData = await response.json();
        updateCart(cartData);
    }
    catch (error)
    {
        console.error('Error loading cart:', error);
        showNotification('Error loading cart', 'error');
    }
}
// Update Cart Display
function updateCart(cartData)
{
    cartItems = cartData.items || [];
    const total = cartData.total || 0;
    const totalItems = cartData.totalItems || 0;
    cartCount.textContent = totalItems;
    cartCountMobile.textContent = totalItems;
    if (cartItems.length === 0)
    {
        cartContent.innerHTML = `
        <div class="empty-cart">
        <i class="fas fa-coffee"></i>
        <p>Your cart is empty</p>
        <p class="text-muted">Add items from our menu to get started</p>
        </div>
        `;
        cartFooter.style.display = 'none';
    }
    else
    {
        cartContent.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">$
        {
            item.image || '☕'
        }
        </div>
        <div class="cart-item-details">
        <h4>$
        {
            item.name
        }
        </h4>
        <div class="cart-item-price">$
        {
            item.price
        }
        BDT each</div>
        <div style="color: #666; font-size: 0.9em;">
        Subtotal: $
        {
            item.subtotal
        }
        BDT
        </div>
        </div>
        <div class="cart-item-actions">
        <div class="quantity-controls">
        <button class="btn-quantity" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
        <i class="fas fa-minus"></i>
        </button>
        <span class="quantity">$
        {
            item.quantity
        }
        </span>
        <button class="btn-quantity" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
        <i class="fas fa-plus"></i>
        </button>
        </div>
        <button class="btn-remove" onclick="removeFromCart(${item.id})" title="Remove item">
        <i class="fas fa-trash"></i>
        </button>
        </div>
        </div>
        `).join('');
        cartSubtotal.textContent = `${total} BDT`;
        cartTotal.textContent = `${total} BDT`;
        cartFooter.style.display = 'block';
    }
    if (cartItems.length === 0 && window.innerWidth <= 1024)
    {
        setTimeout(() =>
        {
            if (cartItems.length === 0)
            {
                closeCart();
            }
        },
        1000);
    }
}
// Place Order
async function placeOrder()
{
    if (cartItems.length === 0)
    {
        showNotification('Your cart is empty! Add items before placing an order.', 'error');
        return;
    }
    try
    {
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        const response = await fetch('/api/order',
        {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok)
        {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to place order');
        }
        const orderData = await response.json();
        // Display order confirmation with fixed template syntax
        displayOrderConfirmation(orderData);
        orderModal.classList.add('active');
        await loadCart();
        checkoutBtn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
        checkoutBtn.disabled = false;
        if (window.innerWidth <= 1024)
        {
            closeCart();
        }
    }
    catch (error)
    {
        showNotification(error.message || 'Error placing order. Please try again.', 'error');
        console.error('Error:', error);
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
        checkoutBtn.disabled = false;
    }
}
// Display Order Confirmation - FIXED VERSION
function displayOrderConfirmation(orderData)
{
    const orderTime = new Date(orderData.timestamp).toLocaleString();
    // Build order items HTML properly
    let orderItemsHTML = '';
    if (orderData.items && orderData.items.length > 0)
    {
        orderItemsHTML = orderData.items.map(item =>
        {
            const itemImage = item.image || '☕';
            const itemName = item.name || 'Unknown Item';
            const itemQuantity = item.quantity || 1;
            const itemSubtotal = item.subtotal || 0;
            return `
            <div class="order-item">
            <div>
            <span style="font-size: 1.2em; margin-right: 10px;">$
            {
                itemImage
            }
            </span>
            <strong>$
            {
                itemName
            }
            </strong>
            <span style="color: #666;"> x$
            {
                itemQuantity
            }
            </span>
            </div>
            <div>
            <span style="font-weight: bold;">$
            {
                itemSubtotal
            }
            BDT</span>
            </div>
            </div>
            `;
        })
        .join('');
    }
    orderDetails.innerHTML = `
    <div class="order-number">
    <div style="font-size: 0.9em; color: #666; margin-bottom: 5px;">Order Number</div>
    <div style="font-size: 1.5em; font-weight: bold; color: #2C1810;">
    $
    {
        orderData.orderNumber || 'N/A'
    }
    </div>
    </div>
    <div class="order-items">
    <h4 style="margin-bottom: 15px; color: #2C1810;">Order Details:</h4>
    $
    {
        orderItemsHTML
    }
    </div>
    <div class="order-total">
    Total Amount: $
    {
        orderData.total || 0
    }
    BDT
    </div>
    <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
    <div style="margin-bottom: 10px;">
    <i class="fas fa-clock" style="color: #D2691E; margin-right: 5px;"></i>
    <strong>Estimated Time:</strong> $
    {
        orderData.estimatedTime || '15-20 minutes'
    }
    </div>
    <div style="margin-bottom: 10px;">
    <i class="fas fa-calendar" style="color: #D2691E; margin-right: 5px;"></i>
    <strong>Order Time:</strong> $
    {
        orderTime
    }
    </div>
    <div>
    <i class="fas fa-check-circle" style="color: #27AE60; margin-right: 5px;"></i>
    <strong>Status:</strong> Confirmed
    </div>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #666; font-style: italic;">
    Thank you for your order! Your delicious items are being prepared.
    </div>
    `;
}
// Clear Cart
async function clearCart()
{
    if (cartItems.length === 0)
    {
        showNotification('Cart is already empty', 'error');
        return;
    }
    const confirmClear = confirm('Are you sure you want to clear your cart?');
    if (!confirmClear) return;
    try
    {
        const response = await fetch('/api/cart/clear',
        {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to clear cart');
        const cartData = await response.json();
        updateCart(cartData);
        showNotification('Cart cleared successfully');
        if (window.innerWidth <= 1024)
        {
            closeCart();
        }
    }
    catch (error)
    {
        showNotification('Error clearing cart', 'error');
        console.error('Error:', error);
    }
}
// Toggle Cart Sidebar
function toggleCart()
{
    if (window.innerWidth <= 1024)
    {
        cartSidebar.classList.toggle('active');
    }
}
// Close Cart Sidebar
function closeCart()
{
    cartSidebar.classList.remove('active');
}
// Close Order Modal
function closeModal()
{
    orderModal.classList.remove('active');
}
// Show Notification
function showNotification(message, type = 'success')
{
    if (notification.hideTimeout)
    {
        clearTimeout(notification.hideTimeout);
    }
    notificationMessage.textContent = message;
    notification.className = 'notification';
    if (type === 'error')
    {
        notification.classList.add('error');
    }
    notification.classList.add('show');
    notification.hideTimeout = setTimeout(() =>
    {
        notification.classList.remove('show');
    },
    3000);
}
// Add keyboard shortcut for search/filter
document.addEventListener('keydown', (e) =>
{
    if ((e.ctrlKey || e.metaKey) && e.key === 'f')
    {
        e.preventDefault();
        const searchTerm = prompt('Search menu items:');
        if (searchTerm)
        {
            currentFilter = 'all';
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const allFilterBtn = document.querySelector('[data-filter="all"]');
            if (allFilterBtn)
            {
                allFilterBtn.classList.add('active');
            }
            const filtered = menuItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            displayMenu(filtered);
            showNotification(`Found ${filtered.length} items matching "${searchTerm}"`);
        }
    }
});
// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
@keyframes fadeIn
{
    from
    {
        opacity: 0;
        transform: translateY(20px);
    }
    to
    {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes pulse
{
    0%
    {
        transform: scale(1);
    }
    50%
    {
        transform: scale(1.05);
    }
    100%
    {
        transform: scale(1);
    }
}
@keyframes slideIn
{
    from
    {
        transform: translateX(400px);
    }
    to
    {
        transform: translateX(0);
    }
}
.cart-item-enter
{
    animation: fadeIn 0.3s ease;
}
.notification.show
{
    animation: slideIn 0.3s ease;
}
`;
document.head.appendChild(style);
// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
console.log('🍵 North End Cafe - Management System Ready');
console.log('📋 Features: Menu Display | Cart Management | Order System');
console.log('💡 Tip: Use Ctrl+F to search menu items');