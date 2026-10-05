let products = [];
async function loadProducts() {
    const response = await fetch("/api/products");
    products = await response.json();
    displayProducts(products);
}

loadProducts();

let cart = [];

function displayProducts(list) {
    const grid = document.getElementById("product-grid");

    document.getElementById("product-count").textContent =
        `${String(list.length).padStart(2, "0")} PRODUCTS`;

    grid.innerHTML = list.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}"
                     onerror="this.src='https://placehold.co/600x400/202024/ffffff?text=NOVA+Product'">
            </div>

            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <span style="color:#a78bfa">${product.description}</span>

                <div class="product-bottom">
                    <span class="price">₹${product.price.toLocaleString("en-IN")}</span>
                    <button class="add-btn" onclick="addToCart('${product._id}')">
                        + Add
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function filterProducts(category, button) {
    document.querySelectorAll(".category").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    const filtered = category === "All"
        ? products
        : products.filter(product => product.category === category);

    displayProducts(filtered);
}

function addToCart(id) {
    const product = products.find(item => item._id === id);
    const existing = cart.find(item => item._id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartCount();
    alert(`${product.name} added to your bag!`);
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = total;
}

function showCart() {
    if (cart.length === 0) {
        alert("Your shopping bag is empty!");
        return;
    }

    let message = "🛍️ YOUR NOVA BAG\n\n";
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        message += `${item.name}\n`;
        message += `Quantity: ${item.quantity}\n`;
        message += `Subtotal: ₹${subtotal.toLocaleString("en-IN")}\n\n`;
    });

    message += `TOTAL: ₹${total.toLocaleString("en-IN")}`;

    alert(message);
    if (confirm("Would you like to proceed to checkout?")) {
    checkout();
}
}
async function checkout() {
    if (cart.length === 0) {
        alert("Your bag is empty!");
        return;
    }

    const customerName = prompt("Enter your name:");
    if (!customerName) return;

    const address = prompt("Enter your delivery address:");
    if (!address) return;

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            customerName,
            address,
            items: cart,
            total
        })
    });

    const result = await response.json();

    if (response.ok) {
        alert("Order placed successfully! Thank you for shopping with NOVA.");
        cart = [];
        updateCartCount();
    } else {
        alert(result.message);
    }
}

async function showLogin() {
    const email = prompt("Enter your email:");
    if (!email) return;

    const password = prompt("Enter your password:");
    if (!password) return;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    const result = await response.json();

    if (response.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("userName", result.name);
        localStorage.setItem("userRole", result.role);

        alert("Login successful! Welcome " + result.name);
    } else {
        alert(result.message);
    }
}

function subscribe() {
    alert("Thank you for joining NOVA!");
}

displayProducts(products);
async function showAdminPanel() {
    const name = prompt("Enter Admin Name:");

    if (name !== "Admin") {
        alert("Access denied! Admin only.");
        return;
    }

    const productName = prompt("Enter product name:");
    if (!productName) return;

    const description = prompt("Enter product description:");
    const price = prompt("Enter product price:");
    const category = prompt("Enter category:");
    const image = prompt("Enter image URL:");

    const response = await fetch("/api/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: productName,
            description: description,
            price: Number(price),
            category: category,
            image: image,
            stock: 10
        })
    });

    const result = await response.json();

    if (response.ok) {
        alert("Product added successfully!");
        loadProducts();
    } else {
        alert(result.message);
    }
}
async function showRegister() {
    const name = prompt("Enter your name:");
    if (!name) return;

    const email = prompt("Enter your email:");
    if (!email) return;

    const password = prompt("Enter your password:");
    if (!password) return;

    const response = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    });

    const result = await response.json();

    if (response.ok) {
        alert("Registration successful! You can now login.");
    } else {
        alert(result.message);
    }
}