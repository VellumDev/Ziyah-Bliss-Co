// 1. Initialize Cart
let cart = JSON.parse(localStorage.getItem('ziyahBox')) || [];

// 2. Add Item
function addItem(name, price, inputId = null, selectId = null) {
    let extraInfo = "";
    let noteText = "Standard";
    
    if (inputId) {
        const inputEl = document.getElementById(inputId);
        if (inputEl && inputEl.value.trim() !== "") {
            noteText = inputEl.value.trim();
            extraInfo = " - " + noteText;
        }
    }
    
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
    
    if (inputId && document.getElementById(inputId)) {
        document.getElementById(inputId).value = "";
    }
}

// 3. Save to Local Storage
function save() {
    localStorage.setItem('ziyahBox', JSON.stringify(cart));
}

// 4. Update Counter
function updateCartCounter() {
    const counter = document.getElementById('cart-count');
    if (counter) counter.innerText = cart.length;
}

// 5. Render Order Review Page
function renderOrderReview() {
    const display = document.getElementById('cart-display');
    if (!display) return; 

    if (cart.length === 0) {
        display.innerHTML = `<p style="text-align:center; padding: 20px;">Your box is empty. <a href="index.html" style="color: #d8bfd8; font-weight: bold;">Go shopping!</a></p>`;
        // Ensure totals reset to packaging-only if empty
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

// 6. FIXED: Integrated Totals & Shipping
function updateTotals() {
    const PACKAGING_FEE = 50.00;
    
    // Sum the items in the cart
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    
    const shippingSelect = document.getElementById('shipping-method');
    const shippingFee = (shippingSelect && shippingSelect.value) ? parseFloat(shippingSelect.value) : 0;
    
    // Update HTML elements
    const itemsTotalEl = document.getElementById('items-total');
    const shippingDisplayEl = document.getElementById('shipping-display');
    const finalTotalEl = document.getElementById('final-total');

    if (itemsTotalEl) itemsTotalEl.innerText = `R ${subtotal.toFixed(2)}`;
    if (shippingDisplayEl) shippingDisplayEl.innerText = `R ${shippingFee.toFixed(2)}`;
    
    const totalPayable = subtotal + PACKAGING_FEE + shippingFee;
    
    if (finalTotalEl) finalTotalEl.innerText = `R ${totalPayable.toFixed(2)}`;
}

// 7. Remove Item
function removeItem(index) {
    cart.splice(index, 1);
    save();
    updateCartCounter();
    renderOrderReview();
}

// 8. WhatsApp Integration
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

// 9. Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    renderOrderReview();
    
    const shipSelect = document.getElementById('shipping-method');
    if (shipSelect) {
        shipSelect.addEventListener('change', updateTotals);
    }
});