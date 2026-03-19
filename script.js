// --- 1. INITIALIZE DATA ---
// Load cart from storage or start with empty array
let cart = JSON.parse(localStorage.getItem('ziyahBox')) || [];

// --- 2. SHOPPING CART CORE ---

// Function to add items to the box
function addItem(name, price, inputId = null, selectId = null) {
    let extraInfo = "";
    let noteText = "Standard";
    
    // Check for text inputs (like custom messages)
    if (inputId) {
        const inputEl = document.getElementById(inputId);
        if (inputEl && inputEl.value.trim() !== "") {
            noteText = inputEl.value.trim();
            extraInfo = " - " + noteText;
        }
    }
    
    // Check for dropdown selections (variants/flavors/scents)
    if (selectId) {
        const selectEl = document.getElementById(selectId);
        if (selectEl) {
            extraInfo = " (" + selectEl.value + ")";
        }
    }

    const item = { 
        id: Date.now(), 
        name: name + extraInfo, 
        price: parseFloat(price), 
        note: noteText 
    };

    cart.push(item);
    save();
    updateCartCounter();
    alert(`${item.name} has been added to your box!`);
}

// Save cart to browser memory
function save() {
    localStorage.setItem('ziyahBox', JSON.stringify(cart));
}

// Update the (0) number in the navigation bar
function updateCartCounter() {
    const counter = document.getElementById('cart-count');
    if (counter) counter.innerText = cart.length;
}

// --- 3. FILTER LOGIC (For Shop Page) ---

function filterCategory(cat, btn) {
    // Switch 'active' class on buttons
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/Hide cards based on category class
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (cat === 'all' || card.classList.contains(cat)) {
            card.style.display = 'block'; // Ensures it follows grid rules
        } else {
            card.style.display = 'none';
        }
    });
}

// --- 4. ORDER REVIEW & TOTALS (For faq.html / Review Box) ---

function renderOrderReview() {
    const display = document.getElementById('cart-display');
    if (!display) return; 

    if (cart.length === 0) {
        display.innerHTML = `<p style="text-align:center; padding: 20px;">Your box is empty. <a href="shop.html" style="color: #d8bfd8; font-weight: bold;">Go shopping!</a></p>`;
        updateTotals();
        return;
    }

    display.innerHTML = cart.map((item, index) => `
        <div class="summary-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 15px 0;">
            <div class="item-details">
                <h4 style="margin: 0; color: #57534e;">${item.name}</h4>
                <p style="font-size: 0.85rem; color: #666; margin: 5px 0;">Note: ${item.note}</p>
                <button class="btn-remove" onclick="removeItem(${index})" style="background: none; border: none; color: #ff6b6b; cursor: pointer; padding: 0; font-size: 0.8rem; text-decoration: underline;">Remove Item</button>
            </div>
            <div class="item-price" style="font-weight: 600;">R ${item.price.toFixed(2)}</div>
        </div>
    `).join('');

    updateTotals();
}

function updateTotals() {
    const PACKAGING_FEE = 50.00;
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    
    const shippingSelect = document.getElementById('shipping-method');
    const shippingFee = (shippingSelect && shippingSelect.value) ? parseFloat(shippingSelect.value) : 0;
    
    const itemsTotalEl = document.getElementById('items-total');
    const shippingDisplayEl = document.getElementById('shipping-display');
    const finalTotalEl = document.getElementById('final-total');

    if (itemsTotalEl) itemsTotalEl.innerText = `R ${subtotal.toFixed(2)}`;
    if (shippingDisplayEl) shippingDisplayEl.innerText = `R ${shippingFee.toFixed(2)}`;
    
    const totalPayable = subtotal + PACKAGING_FEE + shippingFee;
    if (finalTotalEl) finalTotalEl.innerText = `R ${totalPayable.toFixed(2)}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    save();
    updateCartCounter();
    renderOrderReview();
}

// --- 5. WHATSAPP CHECKOUT ---

function sendWhatsApp() {
    const PACKAGING_FEE = 50.00;
    const nameInput = document.getElementById('cust-name');
    const addressInput = document.getElementById('cust-address');
    const shippingMethod = document.getElementById('shipping-method');
    
    const name = nameInput ? nameInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    
    if (!name || !address || !shippingMethod || shippingMethod.selectedIndex === 0) {
        alert("Please provide your name, address, and select a shipping method.");
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const shipText = shippingMethod.options[shippingMethod.selectedIndex].text;
    const shippingCost = parseFloat(shippingMethod.value) || 0;
    const finalTotal = subtotal + PACKAGING_FEE + shippingCost;
    
    const itemsList = cart.map(i => `- ${i.name} (R${i.price.toFixed(2)})`).join('%0A');
    
    const message = `*ZIYAH BLISS CO. ORDER*%0A%0A` +
                    `*Customer:* ${name}%0A` +
                    `*Address:* ${address}%0A%0A` +
                    `*Items:*%0A${itemsList}%0A%0A` +
                    `*Subtotal:* R${subtotal.toFixed(2)}%0A` +
                    `*Packaging:* R${PACKAGING_FEE.toFixed(2)}%0A` +
                    `*Shipping:* ${shipText}%0A%0A` +
                    `*TOTAL PAYABLE:* R${finalTotal.toFixed(2)}`;

    window.open(`https://wa.me/27662452548?text=${message}`, '_blank');
}

// --- 6. PAGE LOAD INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    
    // Only runs if the review elements exist (Review Box page)
    if (document.getElementById('cart-display')) {
        renderOrderReview();
    }
    
    // Listen for shipping changes to update price instantly
    const shipSelect = document.getElementById('shipping-method');
    if (shipSelect) {
        shipSelect.addEventListener('change', updateTotals);
    }
});
