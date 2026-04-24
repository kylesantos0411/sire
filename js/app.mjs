import {
  addCustomerFeedback,
  calculateCartTotals,
  createCartItem,
  createOrder,
  formatMoney,
  getOrderProcessSteps,
  getSellerPaymentInfo,
  getVisibleProducts,
  updateCartQuantity,
  upsertCartItem,
} from "./wallet-store.mjs";
import { loadSiteContent, SITE_CONTENT_KEY } from "./site-content.mjs";

const state = {
  siteContent: loadSiteContent(),
  selectedProduct: null,
  cart: [],
  feedback: [],
};

let products = state.siteContent.products;
state.selectedProduct = products[0];

const productGrid = document.querySelector("#productGrid");
const brandName = document.querySelector("#brandName");
const heroEyebrow = document.querySelector("#heroEyebrow");
const heroTitle = document.querySelector("#heroTitle");
const heroCopy = document.querySelector("#heroCopy");
const heroImage = document.querySelector("#heroImage");
const searchInput = document.querySelector("#searchInput");
const collectionFilter = document.querySelector("#collectionFilter");
const sortFilter = document.querySelector("#sortFilter");
const detailTitle = document.querySelector("#detailTitle");
const detailImage = document.querySelector("#detailImage");
const detailPrice = document.querySelector("#detailPrice");
const detailDescription = document.querySelector("#detailDescription");
const detailColor = document.querySelector("#detailColor");
const detailAddToCart = document.querySelector("#detailAddToCart");
const cartItems = document.querySelector("#cartItems");
const cartTotals = document.querySelector("#cartTotals");
const cartCount = document.querySelector("#cartCount");
const checkoutForm = document.querySelector("#checkoutForm");
const confirmation = document.querySelector("#confirmation");
const orderTotal = document.querySelector("#orderTotal");
const orderNumber = document.querySelector("#orderNumber");
const orderPayment = document.querySelector("#orderPayment");
const paymentModal = document.querySelector("#paymentModal");
const paymentMethodTitle = document.querySelector("#paymentMethodTitle");
const paymentAccountName = document.querySelector("#paymentAccountName");
const paymentAccountNumber = document.querySelector("#paymentAccountNumber");
const paymentInstruction = document.querySelector("#paymentInstruction");
const paymentClose = document.querySelector("#paymentClose");
const paymentDone = document.querySelector("#paymentDone");
const processTrack = document.querySelector("#processTrack");
const customerName = document.querySelector("#customerName");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const feedbackList = document.querySelector("#feedbackList");
const feedbackForm = document.querySelector("#feedbackForm");
const feedbackName = document.querySelector("#feedbackName");
const feedbackRating = document.querySelector("#feedbackRating");
const feedbackComment = document.querySelector("#feedbackComment");
const aboutImage = document.querySelector("#aboutImage");
const aboutTitle = document.querySelector("#aboutTitle");
const aboutCopy = document.querySelector("#aboutCopy");

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelector(`#${button.dataset.scroll}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

[searchInput, collectionFilter, sortFilter].forEach((control) => {
  control.addEventListener("input", renderProducts);
});

detailAddToCart.addEventListener("click", () => {
  addProductToCart(state.selectedProduct.id);
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.cart.length === 0) return;

  const paymentMethod =
    checkoutForm.querySelector("input[name='paymentMethod']:checked")?.value ||
    "card";
  const order = createOrder({
    cart: state.cart,
    customer: {
      name: customerName.value,
      email: customerEmail.value,
      address: customerAddress.value,
    },
    paymentMethod,
  });
  const paymentInfo = getSellerPaymentInfo(paymentMethod);

  orderTotal.textContent = formatMoney(order.total);
  orderNumber.textContent = `#${order.id}`;
  orderPayment.textContent = order.paymentMethod;
  renderOrderProcess(order.status);
  confirmation.hidden = false;
  renderPaymentDetails(paymentInfo);
  paymentModal.hidden = !paymentInfo.requiresPopup;
  confirmation.scrollIntoView({ behavior: "smooth" });
});

[paymentClose, paymentDone].forEach((button) => {
  button.addEventListener("click", () => {
    paymentModal.hidden = true;
  });
});

feedbackForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.feedback = addCustomerFeedback(state.feedback, {
    name: feedbackName.value,
    rating: feedbackRating.value,
    comment: feedbackComment.value,
  });
  feedbackComment.value = "";
  renderFeedback();
});

window.addEventListener("storage", (event) => {
  if (event.key !== SITE_CONTENT_KEY) return;
  state.siteContent = loadSiteContent();
  products = state.siteContent.products;
  state.selectedProduct =
    products.find((product) => product.id === state.selectedProduct.id) ||
    products[0];
  renderSiteContent();
  renderProducts();
  renderDetails();
});

function renderSiteContent() {
  brandName.textContent = state.siteContent.brand.name;
  heroEyebrow.textContent = state.siteContent.brand.eyebrow;
  heroTitle.textContent = state.siteContent.brand.heroTitle;
  heroCopy.textContent = state.siteContent.brand.heroCopy;
  heroImage.src = state.siteContent.brand.heroImage;
  aboutImage.src = state.siteContent.about.image;
  aboutTitle.textContent = state.siteContent.about.title;
  aboutCopy.replaceChildren(
    ...state.siteContent.about.copy.split(/\n+/).map((paragraph) => {
      const node = document.createElement("p");
      node.textContent = paragraph;
      return node;
    }),
  );
}

function renderProducts() {
  const visibleProducts = getVisibleProducts(products, {
    collection: collectionFilter.value,
    query: searchInput.value,
    sort: sortFilter.value,
  });

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <button class="product-select" data-product="${product.id}" aria-label="View ${product.name}">
            <img src="${product.image}" alt="${product.name}">
            <span>${product.collection}</span>
            <strong>${product.name}</strong>
            <small>Color: ${product.color}</small>
            <em>${formatMoney(product.price)}</em>
          </button>
          <button class="primary add-card-button" data-add-product="${product.id}" type="button">Add to Cart</button>
        </article>
      `,
    )
    .join("");

  productGrid.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => selectProduct(button.dataset.product));
  });
  productGrid.querySelectorAll("[data-add-product]").forEach((button) => {
    button.addEventListener("click", () => addProductToCart(button.dataset.addProduct));
  });
}

function selectProduct(productId) {
  state.selectedProduct =
    products.find((product) => product.id === productId) || products[0];
  renderDetails();
  document.querySelector("#details").scrollIntoView({ behavior: "smooth" });
}

function addProductToCart(productId) {
  const product = products.find((item) => item.id === productId) || state.selectedProduct;
  state.cart = upsertCartItem(state.cart, createCartItem(product));
  renderCart();
  document.querySelector("#cart").scrollIntoView({ behavior: "smooth" });
}

function renderDetails() {
  detailTitle.textContent = state.selectedProduct.name;
  detailImage.src = state.selectedProduct.image;
  detailImage.alt = state.selectedProduct.name;
  detailPrice.textContent = formatMoney(state.selectedProduct.price);
  detailDescription.textContent = state.selectedProduct.description;
  detailColor.textContent = state.selectedProduct.color;
}

function renderCart() {
  cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  if (state.cart.length === 0) {
    cartItems.innerHTML = `<p class="empty">Your cart is ready for a wallet.</p>`;
  } else {
    cartItems.innerHTML = state.cart
      .map(
        (item) => `
          <article class="cart-row">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <strong>${item.name}</strong>
              <span>Color: ${item.color}</span>
              <em>${formatMoney(item.price)}</em>
            </div>
            <div class="qty">
              <button data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button data-qty="${item.id}" data-delta="1" aria-label="Increase quantity">+</button>
            </div>
          </article>
        `,
      )
      .join("");
  }

  cartItems.querySelectorAll("[data-qty]").forEach((button) => {
    button.addEventListener("click", () => {
      state.cart = updateCartQuantity(
        state.cart,
        button.dataset.qty,
        Number(button.dataset.delta),
      );
      renderCart();
    });
  });

  const totals = calculateCartTotals(state.cart);
  cartTotals.innerHTML = `
    <div><span>Subtotal</span><strong>${formatMoney(totals.subtotal)}</strong></div>
    <div><span>Shipping</span><strong>${formatMoney(totals.shipping)}</strong></div>
    <div class="grand"><span>Total</span><strong>${formatMoney(totals.total)}</strong></div>
  `;
}

function renderPaymentDetails(paymentInfo) {
  paymentMethodTitle.textContent = paymentInfo.method;
  paymentAccountName.textContent = paymentInfo.accountName;
  paymentAccountNumber.textContent = paymentInfo.accountNumber;
  paymentInstruction.textContent = paymentInfo.instructions;
}

function renderOrderProcess(status = "Processing") {
  processTrack.innerHTML = getOrderProcessSteps(status)
    .map(
      (step) => `
        <div class="process-step ${step.state}">
          <span></span>
          <strong>${step.label}</strong>
        </div>
      `,
    )
    .join("");
}

function renderFeedback() {
  feedbackList.innerHTML = state.feedback
    .map(
      (entry) => `
        <article class="feedback-card">
          <div class="stars" aria-label="${entry.rating} out of 5 stars">${"★".repeat(entry.rating)}${"☆".repeat(5 - entry.rating)}</div>
          <p>${entry.comment}</p>
          <strong>${entry.name}</strong>
        </article>
      `,
    )
    .join("");
}

renderSiteContent();
renderProducts();
renderDetails();
renderCart();
renderOrderProcess();
renderFeedback();
