(function () {
  const SITE_CONTENT_KEY = "sire-site-content-v2";
  const CART_STORAGE_KEY = "sire-cart";
  const LAST_ORDER_KEY = "sire-last-order";
  const SHIPPING_PRICE = 15000;
  const FREE_SHIPPING_THRESHOLD = 500000;
  const FEEDBACK_STORAGE_KEY = "sire-feedback";
  const PAYMENT_METHODS = {
    card: "Credit / Debit Card",
    gcash: "GCash",
    maya: "Maya",
    cod: "Cash on Delivery",
  };
  const SELLER_PAYMENT_INFO = {
    card: {
      method: "Credit / Debit Card",
      accountName: "SIRE Leather Studio",
      accountNumber: "BDO 0045-1234-8890",
      instructions: "Send your payment screenshot after checkout for confirmation.",
      requiresPopup: true,
    },
    gcash: {
      method: "GCash",
      accountName: "SIRE Leather Studio",
      accountNumber: "0917 555 0198",
      instructions: "Send your payment screenshot after checkout for confirmation.",
      requiresPopup: true,
    },
    maya: {
      method: "Maya",
      accountName: "SIRE Leather Studio",
      accountNumber: "0917 555 0198",
      instructions: "Send your payment screenshot after checkout for confirmation.",
      requiresPopup: true,
    },
    cod: {
      method: "Cash on Delivery",
      accountName: "Pay when your order arrives",
      accountNumber: "No advance payment required",
      instructions: "Prepare the exact amount for the delivery rider.",
      requiresPopup: false,
    },
  };
  const ORDER_PROCESS = ["Order Placed", "Processing", "Packed", "Shipped", "Delivered"];
  const DEFAULT_PRODUCTS = [
    {
      id: "topia-wallet",
      name: "Topia Wallet",
      price: 189000,
      collection: "bifold",
      color: "Brown",
      tags: ["brown", "minimal", "signature", "full grain"],
      rating: 4.8,
      image: "products images/topia.jpg",
      description:
        "A refined everyday wallet crafted for simplicity and elegance. Topia delivers a smooth leather finish with a timeless design built for those who move with quiet confidence.",
    },
    {
      id: "migem-wallet",
      name: "Migem Wallet",
      price: 180000,
      collection: "bifold",
      color: "Brown",
      tags: ["brown", "gift", "classic", "full grain"],
      rating: 4.9,
      image: "products images/migem.jpg",
      description:
        "Bold in detail, subtle in presence. Migem combines structured craftsmanship with modern edge, giving you a wallet that stands out without trying too hard.",
    },
    {
      id: "chagos-wallet",
      name: "Chagos Wallet",
      price: 185000,
      collection: "snap",
      color: "Black / Silver",
      tags: ["black", "silver", "secure", "snap", "full grain"],
      rating: 4.7,
      image: "products images/chagos.jpg",
      description:
        "Sleek, all-black authority. Chagos features a minimalist design with a signature silver buckle, made for precision, control, and a statement that does not need to be loud.",
    },
    {
      id: "capalot-long-wallet",
      name: "Capalot Long Wallet",
      price: 200000,
      collection: "long",
      color: "Brown",
      tags: ["brown", "long wallet", "gold detail", "full grain"],
      rating: 4.8,
      image: "products images/capalot.jpg",
      description:
        "A sleek dark brown leather long wallet designed for a premium look and everyday function. Finished with elegant gold curly detailing, it combines style, durability, and spacious storage in one refined piece.",
    },
    {
      id: "bards-cardholder",
      name: "Bards Cardholder",
      price: 170000,
      collection: "cardholder",
      color: "Black",
      tags: ["black", "cardholder", "atm cards", "compact"],
      rating: 4.6,
      image: "products images/bards.jpg",
      description:
        "A sleek and compact black leather cardholder designed for everyday convenience. The SIRE Bards wallet features a minimalist design with multiple card slots, durable stitching, and a smooth premium finish for carrying essential ATM cards in style.",
    },
  ];
  const DEFAULT_SITE_CONTENT = {
    brand: {
      name: "SIRE.",
      eyebrow: "SIRE full-grain leather goods",
      heroTitle: "Crafted by her, carried by him.",
      heroCopy:
        "A refined ordering system for SIRE wallets, built around full-grain leather, female artistry, and a clear path from browse to checkout.",
      heroImage: "products images/topia.jpg",
    },
    about: {
      image: "products images/aboutus.jpg",
      title: "Crafted by Her, for Him",
      copy:
        "At Sire, we believe in the quiet power of exceptional craftsmanship. Our story is rooted in a single studio, where female artistry meets the rugged traditions of leatherwork. We specialize in handcrafting men's essentials that balance a refined, meticulous touch with the enduring strength of premium full-grain leather.\n\nEvery Sire wallet is more than a utility. It is functional art designed for the man of character, built to evolve and develop a unique patina that tells your story over time. We do not believe in mass production. We believe in the legacy of a single, perfect stitch.",
    },
    products: DEFAULT_PRODUCTS,
  };

  const state = {
    siteContent: loadSiteContent(),
    selectedProduct: null,
    cart: loadStoredCart(),
    proofOfPayment: loadStoredProof(),
    lastOrder: loadStoredOrder(),
    feedback: loadStoredFeedback(),
  };
  let products = state.siteContent.products;
  state.selectedProduct = products[0];

  const selectors = {
    productGrid: "#productGrid",
    brandName: "#brandName",
    heroEyebrow: "#heroEyebrow",
    heroTitle: "#heroTitle",
    heroCopy: "#heroCopy",
    heroImage: "#heroImage",
    searchInput: "#searchInput",
    collectionFilter: "#collectionFilter",
    sortFilter: "#sortFilter",
    menuToggle: "#menuToggle",
    mobileMenu: "#mobileMenu",
    detailTitle: "#detailTitle",
    detailImage: "#detailImage",
    detailPrice: "#detailPrice",
    detailDescription: "#detailDescription",
    detailColor: "#detailColor",
    detailAddToCart: "#detailAddToCart",
    cartItems: "#cartItems",
    cartTotals: "#cartTotals",
    cartCount: "#cartCount",
    checkoutForm: "#checkoutForm",
    confirmation: "#confirmation",
    orderTotal: "#orderTotal",
    orderNumber: "#orderNumber",
    orderPayment: "#orderPayment",
    confirmationTitle: "#confirmationTitle",
    confirmationMessage: "#confirmationMessage",
    confirmationDetails: "#confirmationDetails",
    paymentModal: "#paymentModal",
    paymentMethodTitle: "#paymentMethodTitle",
    paymentAccountName: "#paymentAccountName",
    paymentAccountNumber: "#paymentAccountNumber",
    paymentInstruction: "#paymentInstruction",
    paymentProofStatus: "#paymentProofStatus",
    paymentClose: "#paymentClose",
    paymentDone: "#paymentDone",
    paymentProof: "#paymentProof",
    proofStatus: "#proofStatus",
    proofPreview: "#proofPreview",
    processTrack: "#processTrack",
    customerName: "#customerName",
    customerEmail: "#customerEmail",
    customerAddress: "#customerAddress",
    feedbackList: "#feedbackList",
    feedbackForm: "#feedbackForm",
    feedbackName: "#feedbackName",
    feedbackRating: "#feedbackRating",
    feedbackComment: "#feedbackComment",
    assistantToggle: "#assistantToggle",
    assistantClose: "#assistantClose",
    assistantPanel: "#assistantPanel",
    assistantForm: "#assistantForm",
    assistantInput: "#assistantInput",
    assistantLog: "#assistantLog",
    aboutImage: "#aboutImage",
    aboutTitle: "#aboutTitle",
    aboutCopy: "#aboutCopy",
  };
  const el = Object.fromEntries(
    Object.entries(selectors).map(([key, selector]) => [key, document.querySelector(selector)]),
  );

  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelector(`#${button.dataset.scroll}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  [el.searchInput, el.collectionFilter, el.sortFilter].forEach((control) => {
    control.addEventListener("input", renderProducts);
  });
  el.menuToggle.addEventListener("click", toggleMobileMenu);
  el.mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileMenu(false));
  });
  el.detailAddToCart.addEventListener("click", () => addProductToCart(state.selectedProduct.id));
  el.checkoutForm.addEventListener("submit", handleCheckout);
  el.checkoutForm.querySelectorAll("input[name='paymentMethod']").forEach((input) => {
    input.addEventListener("change", updateProofRequirement);
  });
  el.paymentProof.addEventListener("change", handleProofUpload);
  [el.paymentClose, el.paymentDone].forEach((button) => {
    button.addEventListener("click", () => {
      el.paymentModal.hidden = true;
    });
  });
  el.feedbackForm.addEventListener("submit", handleFeedback);
  el.assistantToggle.addEventListener("click", () => setAssistantPanel(el.assistantPanel.hidden));
  el.assistantClose.addEventListener("click", () => setAssistantPanel(false));
  el.assistantForm.addEventListener("submit", handleAssistantSubmit);
  document.querySelectorAll("[data-assistant-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      submitAssistantQuestion(button.dataset.assistantPrompt);
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== SITE_CONTENT_KEY) return;
    state.siteContent = loadSiteContent();
    products = state.siteContent.products;
    state.selectedProduct =
      products.find((product) => product.id === state.selectedProduct.id) || products[0];
    renderSiteContent();
    renderProducts();
    renderDetails();
  });

  function handleCheckout(event) {
    event.preventDefault();

    if (state.cart.length === 0) {
      el.cartItems.innerHTML = `<p class="empty cart-warning">Add a wallet before checking out.</p>`;
      document.querySelector("#catalog").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const paymentMethod =
      el.checkoutForm.querySelector("input[name='paymentMethod']:checked")?.value || "card";
    const paymentInfo = getSellerPaymentInfo(paymentMethod);

    if (paymentInfo.requiresPopup && !state.proofOfPayment) {
      renderPaymentDetails(paymentInfo);
      el.paymentModal.hidden = false;
      el.proofStatus.textContent =
        "Please attach your payment screenshot before placing the order.";
      el.proofStatus.classList.add("is-error");
      el.paymentProof.focus();
      return;
    }

    const order = createOrder({
      cart: state.cart,
      customer: {
        name: el.customerName.value,
        email: el.customerEmail.value,
        address: el.customerAddress.value,
      },
      paymentMethod,
    });
    order.proofOfPayment = state.proofOfPayment;

    el.orderTotal.textContent = formatMoney(order.total);
    el.orderNumber.textContent = `#${order.id}`;
    el.orderPayment.textContent = order.paymentMethod;
    renderOrderProcess(order.status);
    el.confirmation.hidden = false;
    renderPaymentDetails(paymentInfo);
    el.paymentModal.hidden = !paymentInfo.requiresPopup;
    state.lastOrder = order;
    state.cart = [];
    state.proofOfPayment = null;
    saveStoredOrder(order);
    saveStoredCart(state.cart);
    clearStoredProof();
    el.paymentProof.value = "";
    renderProofPreview();
    renderCart();
    el.confirmation.scrollIntoView({ behavior: "smooth" });
  }

  function toggleMobileMenu() {
    setMobileMenu(el.mobileMenu.hidden);
  }

  function setMobileMenu(isOpen) {
    el.mobileMenu.hidden = !isOpen;
    el.menuToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function handleProofUpload() {
    const [file] = el.paymentProof.files || [];

    if (!file) {
      state.proofOfPayment = null;
      clearStoredProof();
      renderProofPreview();
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      state.proofOfPayment = {
        name: file.name,
        dataUrl: reader.result,
      };
      saveStoredProof(state.proofOfPayment);
      renderProofPreview();
    });
    reader.readAsDataURL(file);
  }

  function updateProofRequirement() {
    const paymentMethod =
      el.checkoutForm.querySelector("input[name='paymentMethod']:checked")?.value || "card";
    const paymentInfo = getSellerPaymentInfo(paymentMethod);
    el.proofStatus.classList.remove("is-error");
    el.proofStatus.textContent = paymentInfo.requiresPopup
      ? "Attach a screenshot for online payment validation."
      : "No proof is needed for Cash on Delivery.";
  }

  function renderProofPreview() {
    if (!state.proofOfPayment) {
      el.proofPreview.hidden = true;
      el.proofPreview.removeAttribute("src");
      updateProofRequirement();
      return;
    }

    el.proofPreview.src = state.proofOfPayment.dataUrl;
    el.proofPreview.hidden = false;
    el.proofStatus.classList.remove("is-error");
    el.proofStatus.textContent = `Attached: ${state.proofOfPayment.name}`;
  }

  function handleFeedback(event) {
    event.preventDefault();
    state.feedback = addCustomerFeedback(state.feedback, {
      name: el.feedbackName.value,
      rating: el.feedbackRating.value,
      comment: el.feedbackComment.value,
    });
    el.feedbackComment.value = "";
    saveStoredFeedback(state.feedback);
    renderFeedback();
  }

  function handleAssistantSubmit(event) {
    event.preventDefault();
    submitAssistantQuestion(el.assistantInput.value);
  }

  function submitAssistantQuestion(question) {
    const trimmedQuestion = (question || "").trim();
    if (!trimmedQuestion) return;

    setAssistantPanel(true);
    appendAssistantMessage(trimmedQuestion, "user");
    appendAssistantMessage(getShopAssistantReply(products, trimmedQuestion), "bot");
    el.assistantInput.value = "";
    el.assistantInput.focus();
  }

  function setAssistantPanel(isOpen) {
    el.assistantPanel.hidden = !isOpen;
    el.assistantToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) el.assistantInput.focus();
  }

  function appendAssistantMessage(message, type = "bot") {
    const bubble = document.createElement("p");
    bubble.className = `assistant-message ${type}`;
    bubble.textContent = message;
    el.assistantLog.append(bubble);
    el.assistantLog.scrollTop = el.assistantLog.scrollHeight;
  }

  function renderSiteContent() {
    el.brandName.textContent = state.siteContent.brand.name;
    el.heroEyebrow.textContent = state.siteContent.brand.eyebrow;
    el.heroTitle.textContent = state.siteContent.brand.heroTitle;
    el.heroCopy.textContent = state.siteContent.brand.heroCopy;
    el.heroImage.src = state.siteContent.brand.heroImage;
    el.aboutImage.src = state.siteContent.about.image;
    el.aboutTitle.textContent = state.siteContent.about.title;
    el.aboutCopy.replaceChildren(
      ...state.siteContent.about.copy.split(/\n+/).map((paragraph) => {
        const node = document.createElement("p");
        node.textContent = paragraph;
        return node;
      }),
    );
  }

  function renderProducts() {
    const visibleProducts = getVisibleProducts(products, {
      collection: el.collectionFilter.value,
      query: el.searchInput.value,
      sort: el.sortFilter.value,
    });

    el.productGrid.innerHTML = visibleProducts
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

    el.productGrid.querySelectorAll("[data-product]").forEach((button) => {
      button.addEventListener("click", () => selectProduct(button.dataset.product));
    });
    el.productGrid.querySelectorAll("[data-add-product]").forEach((button) => {
      button.addEventListener("click", () => addProductToCart(button.dataset.addProduct));
    });
  }

  function selectProduct(productId) {
    state.selectedProduct = products.find((product) => product.id === productId) || products[0];
    renderDetails();
    document.querySelector("#details").scrollIntoView({ behavior: "smooth" });
  }

  function addProductToCart(productId) {
    const product = products.find((item) => item.id === productId) || state.selectedProduct;
    state.cart = upsertCartItem(state.cart, createCartItem(product));
    saveStoredCart(state.cart);
    renderCart();
    document.querySelector("#cart").scrollIntoView({ behavior: "smooth" });
  }

  function renderDetails() {
    el.detailTitle.textContent = state.selectedProduct.name;
    el.detailImage.src = state.selectedProduct.image;
    el.detailImage.alt = state.selectedProduct.name;
    el.detailPrice.textContent = formatMoney(state.selectedProduct.price);
    el.detailDescription.textContent = state.selectedProduct.description;
    el.detailColor.textContent = state.selectedProduct.color;
  }

  function renderCart() {
    el.cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (state.cart.length === 0) {
      el.cartItems.innerHTML = `<p class="empty">Your cart is ready for a wallet.</p>`;
    } else {
      el.cartItems.innerHTML = state.cart
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
                <button data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity">-</button>
                <span>${item.quantity}</span>
                <button data-qty="${item.id}" data-delta="1" aria-label="Increase quantity">+</button>
              </div>
            </article>
          `,
        )
        .join("");
    }

    el.cartItems.querySelectorAll("[data-qty]").forEach((button) => {
      button.addEventListener("click", () => {
        state.cart = updateCartQuantity(
          state.cart,
          button.dataset.qty,
          Number(button.dataset.delta),
        );
        saveStoredCart(state.cart);
        renderCart();
      });
    });

    const totals = calculateCartTotals(state.cart);
    el.cartTotals.innerHTML = `
      <div><span>Subtotal</span><strong>${formatMoney(totals.subtotal)}</strong></div>
      <div><span>Shipping</span><strong>${formatMoney(totals.shipping)}</strong></div>
      <div class="grand"><span>Total</span><strong>${formatMoney(totals.total)}</strong></div>
    `;
  }

  function renderPaymentDetails(paymentInfo) {
    el.paymentMethodTitle.textContent = paymentInfo.method;
    el.paymentAccountName.textContent = paymentInfo.accountName;
    el.paymentAccountNumber.textContent = paymentInfo.accountNumber;
    el.paymentInstruction.textContent = paymentInfo.instructions;
    el.paymentProofStatus.textContent = state.proofOfPayment
      ? state.proofOfPayment.name
      : "No proof attached yet.";
  }

  function renderOrderProcess(status = "Processing") {
    const activeIndex = Math.max(0, ORDER_PROCESS.indexOf(status));
    el.processTrack.innerHTML = ORDER_PROCESS.map((label, index) => {
      const stateName =
        index < activeIndex ? "done" : index === activeIndex ? "active" : "upcoming";
      return `
        <div class="process-step ${stateName}">
          <span></span>
          <strong>${label}</strong>
        </div>
      `;
    }).join("");
  }

  function renderFeedback() {
    el.feedbackList.innerHTML = state.feedback
      .map(
        (entry) => `
          <article class="feedback-card">
            <div class="stars" aria-label="${entry.rating} out of 5 stars">${"*".repeat(entry.rating)}</div>
            <p>${entry.comment}</p>
            <strong>${entry.name}</strong>
          </article>
        `,
      )
      .join("");
  }

  function createCartItem(product) {
    return {
      id: product.id,
      productId: product.id,
      name: product.name,
      image: product.image,
      color: product.color,
      price: product.price,
      quantity: 1,
    };
  }

  function upsertCartItem(cart, item) {
    const existing = cart.find((cartItem) => cartItem.id === item.id);
    if (!existing) return [...cart, item];

    return cart.map((cartItem) =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
        : cartItem,
    );
  }

  function updateCartQuantity(cart, itemId, delta) {
    return cart
      .map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      )
      .filter((item) => item.quantity > 0);
  }

  function calculateCartTotals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function createOrder({ cart, customer, paymentMethod }) {
    if (!cart.length) throw new Error("Cart is empty");
    return {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      customer,
      paymentMethod: PAYMENT_METHODS[paymentMethod],
      status: "Processing",
      items: cart,
      ...calculateCartTotals(cart),
    };
  }

  function getSellerPaymentInfo(paymentMethod) {
    return SELLER_PAYMENT_INFO[paymentMethod] || SELLER_PAYMENT_INFO.card;
  }

  function getShopAssistantReply(productList, message) {
    const question = normalizeAssistantText(message);
    const matchedProduct = findAssistantProduct(productList, question);

    if (matchedProduct) {
      return `${matchedProduct.name} is a ${matchedProduct.color} ${matchedProduct.collection} piece priced at ${formatMoney(matchedProduct.price)}. ${matchedProduct.description}`;
    }

    if (/\b(deliver|delivery|shipping|ship|arrival|arrive)\b/.test(question)) {
      return `Delivery usually takes 3 to 5 business days after payment validation. Shipping is ${formatMoney(SHIPPING_PRICE)}, and orders from ${formatMoney(FREE_SHIPPING_THRESHOLD)} ship free.`;
    }

    if (/\b(payment|pay|mop|gcash|maya|card|cod|proof|screenshot|receipt)\b/.test(question)) {
      return "SIRE accepts Credit / Debit Card, GCash, Maya, and Cash on Delivery. For online payments, attach your payment screenshot in checkout so the seller can validate the order.";
    }

    if (/\b(cart|checkout|order|buy|purchase|quantity|qty)\b/.test(question)) {
      return "Choose a wallet, press Add to Cart, adjust quantity in your cart, then complete the checkout form. Online payments need a proof-of-payment image before the order can be placed.";
    }

    if (/\b(product|wallet|catalog|available|list|price)\b/.test(question)) {
      const availableProducts = productList
        .map((product) => `${product.name} (${product.color}, ${formatMoney(product.price)})`)
        .join("; ");
      return `Available SIRE pieces: ${availableProducts}. Ask me the exact product name if you want details.`;
    }

    if (/\b(about|sire|leather|material|craft|handmade|artisan|full grain)\b/.test(question)) {
      return "SIRE wallets are handcrafted full-grain leather goods, crafted by her for him. Each piece is made for daily use, clean structure, and a patina that develops over time.";
    }

    return "I can help with SIRE product names, prices, colors, delivery, payment options, proof of payment, cart, and checkout. Try asking about Topia Wallet, Migem Wallet, Chagos Wallet, Capalot Long Wallet, or Bards Cardholder.";
  }

  function normalizeAssistantText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s/]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findAssistantProduct(productList, question) {
    return productList.find((product) => {
      const productName = normalizeAssistantText(product.name);
      const shortName = productName
        .replace(/\b(wallet|cardholder|long)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();

      return question.includes(productName) || (shortName && question.includes(shortName));
    });
  }

  function getVisibleProducts(productList, filters) {
    const collection = filters.collection || "all";
    const query = (filters.query || "").trim().toLowerCase();
    const visibleProducts = productList.filter((product) => {
      const matchesCollection = collection === "all" || product.collection === collection;
      const searchText = [
        product.name,
        product.collection,
        product.color,
        product.description,
        ...(product.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return matchesCollection && (!query || searchText.includes(query));
    });

    return [...visibleProducts].sort((a, b) => {
      if (filters.sort === "price-asc") return a.price - b.price;
      if (filters.sort === "price-desc") return b.price - a.price;
      return b.rating - a.rating;
    });
  }

  function addCustomerFeedback(existingFeedback, entry) {
    const comment = (entry.comment || "").trim();
    if (!comment) return existingFeedback;
    return [
      {
        name: (entry.name || "Anonymous").trim() || "Anonymous",
        rating: Math.min(5, Math.max(1, Number(entry.rating) || 5)),
        comment,
      },
      ...existingFeedback,
    ];
  }

  function loadStoredCart() {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }

  function saveStoredCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }

  function loadStoredProof() {
    try {
      return JSON.parse(localStorage.getItem("sire-payment-proof") || "null");
    } catch {
      return null;
    }
  }

  function saveStoredProof(proof) {
    localStorage.setItem("sire-payment-proof", JSON.stringify(proof));
  }

  function clearStoredProof() {
    localStorage.removeItem("sire-payment-proof");
  }

  function loadStoredOrder() {
    try {
      return JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || "null");
    } catch {
      return null;
    }
  }

  function saveStoredOrder(order) {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    try {
      const orders = JSON.parse(localStorage.getItem("sire-orders") || "[]");
      orders.unshift(order);
      localStorage.setItem("sire-orders", JSON.stringify(orders));
    } catch {}
  }

  function loadStoredFeedback() {
    try {
      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveStoredFeedback(feedback) {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
  }

  function loadSiteContent() {
    try {
      const raw = localStorage.getItem(SITE_CONTENT_KEY);
      return raw ? mergeSiteContent(JSON.parse(raw)) : DEFAULT_SITE_CONTENT;
    } catch {
      return DEFAULT_SITE_CONTENT;
    }
  }

  function mergeSiteContent(draft) {
    return {
      brand: { ...DEFAULT_SITE_CONTENT.brand, ...(draft.brand || {}) },
      about: { ...DEFAULT_SITE_CONTENT.about, ...(draft.about || {}) },
      products: DEFAULT_PRODUCTS.map((product) => ({
        ...product,
        ...((draft.products || []).find((draftProduct) => draftProduct.id === product.id) || {}),
      })),
    };
  }

  function formatMoney(cents) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(cents / 100);
  }

  renderSiteContent();
  renderProducts();
  renderDetails();
  renderCart();
  renderOrderProcess();
  renderProofPreview();
  renderFeedback();
  appendAssistantMessage(
    "Hi, I can answer product details, delivery, payment, proof-of-payment, cart, and checkout questions. Ask an exact product name for the fastest answer.",
  );
  if (state.lastOrder) {
    el.orderTotal.textContent = formatMoney(state.lastOrder.total);
    el.orderNumber.textContent = `#${state.lastOrder.id}`;
    el.orderPayment.textContent = state.lastOrder.paymentMethod;
    el.confirmation.hidden = false;
  }
})();
