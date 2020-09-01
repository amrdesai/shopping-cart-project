// Variables
const cartBtn = document.querySelector(".cart-btn"),
    closeCartBtn = document.querySelector(".close-cart"),
    clearCartBtn = document.querySelector(".clear-cart"),
    cartDOM = document.querySelector(".cart"),
    cartOverlay = document.querySelector(".cart-overlay"),
    cartItems = document.querySelector(".cart-items"),
    cartTotal = document.querySelector(".cart-total"),
    cartContent = document.querySelector(".cart-content"),
    productsDOM = document.querySelector(".products-center");

// Cart
let cart = [];
// buttons
let buttonsDOM = [];

// Getting the products
class Products {
    async getProducts() {
        try {
            // Using data from local JSON file
            const result = await fetch('products.json');
            const data = await result.json();
            let products = data.items;
            
            products = products.map((item) => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return {
                    title,
                    price,
                    id,
                    image,
                };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// UI
class UI {
    // Display products - DOM
    displayProducts(products) {
        let result = "";
        products.forEach((currentItem) => {
            result += `
                <article class="product">
                    <div class="img-container">
                        <img class="product-img" src="${currentItem.image}" alt="${currentItem.title} Image">
                        <button class="bag-btn" data-id="${currentItem.id}"><i class="fas fa-shopping-cart"></i>Add to Cart</button>
                    </div>
                    <h3>${currentItem.title}</h3>
                    <h4>$${currentItem.price}</h4>
                </article>`;
        });
        productsDOM.innerHTML = result;
    }

    // Get Buttons and addEventListener
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
            const id = button.dataset.id;
            let inCart = cart.find((item) => item.id === id);

            // If item already in cart, then show "In Cart" text and disable click
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }

            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // Get product from products
                const cartItem = { ...Storage.getProduct(id), amount: 1 };
                console.log(cartItem);
                // Add product to cart
                cart = [...cart, cartItem];
                // Save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValue(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            });
        });
    }

    // Set cart value
    setCartValue(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    // Add item to cart - DOM
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}"
                    alt="${item.title} Image">
            </div>
            <div>
                <h4>${item.title}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id="${item.id}">remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id="${item.id}"></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id="${item.id}"></i>
            </div>
        `;
        cartContent.appendChild(div);
    }

    // Show Cart
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    // Hide Cart
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    // Populate cart
    populateCart(cart) {
        cart.forEach((cartItem) => {
            this.addCartItem(cartItem);
        });
    }

    // Cart Logic
    cartLogic() {
        // Clear cart button
        clearCartBtn.addEventListener("click", () => this.clearCart());
        // Cart functionality
        cartContent.addEventListener("click", (e) => {
            e.preventDefault();
            // Remove button
            if (e.target.classList.contains("remove-item")) {
                const removeItem = e.target;
                const removeItemID = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(removeItemID);
                // Increase Button
            } else if (e.target.classList.contains("fa-chevron-up")) {
                const addAmount = e.target;
                const addAmountID = addAmount.dataset.id;
                const tempItem = cart.find((item) => item.id === addAmountID);
                tempItem.amount++;
                Storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
                // Decrease button
            } else if (e.target.classList.contains("fa-chevron-down")) {
                const lowerAmount = e.target;
                const lowerAmountID = lowerAmount.dataset.id;
                const tempItem = cart.find((item) => item.id === lowerAmountID);
                tempItem.amount--;

                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    lowerAmount.previousElementSibling.innerText =
                        tempItem.amount;
                } else {
                    cartContent.removeChild(
                        lowerAmount.parentElement.parentElement
                    );
                    this.removeItem(lowerAmountID);
                }

                Storage.saveCart(cart);
                this.setCartValue(cart);
            }
        });
    }

    // Clear Cart
    clearCart() {
        // Clear cart button
        const cartItems = cart.map((item) => item.id);
        // Clear cart functionality
        cartItems.forEach((id) => this.removeItem(id));
        // Remove all items from DOM
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    // Remove Item
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        const button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to cart`;
    }

    getSingleButton(id) {
        return buttonsDOM.find((button) => button.dataset.id === id);
    }

    // App Setup
    setupApp() {
        cart = Storage.getCart();
        this.setCartValue(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
}

// Local Storage
class Storage {
    // Save products to Local Storage
    static saveProducts(productsArr) {
        localStorage.setItem("products", JSON.stringify(productsArr));
    }

    // Get products from Local Storage
    static getProduct(id) {
        const products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }

    // Save cart to Local Storage
    static saveCart(cartArr) {
        localStorage.setItem("cart", JSON.stringify(cartArr));
    }

    // Get cart from Local Storage
    static getCart() {
        // If cart exists in local storage then return cart else return empty array
        return localStorage.getItem("cart")
            ? JSON.parse(localStorage.getItem("cart"))
            : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // Setup Application
    ui.setupApp();

    // Get all Products
    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagButtons();
            ui.cartLogic();
        });
});
