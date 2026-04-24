export const SHIPPING_PRICE = 15000;
export const FREE_SHIPPING_THRESHOLD = 500000;
export const CART_STORAGE_KEY = "sire-cart";
export const PAYMENT_METHODS = {
  card: "Credit / Debit Card",
  gcash: "GCash",
  maya: "Maya",
  cod: "Cash on Delivery",
};

export const SELLER_PAYMENT_INFO = {
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

const ORDER_PROCESS = [
  "Order Placed",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
];

export function formatMoney(cents) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

export function getVisibleProducts(products, filters = {}) {
  const collection = filters.collection || "all";
  const query = (filters.query || "").trim().toLowerCase();
  const sort = filters.sort || "popular";

  const visible = products.filter((product) => {
    const matchesCollection =
      collection === "all" || product.collection === collection;
    const haystack = [
      product.name,
      product.collection,
      ...(product.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return matchesCollection && (!query || haystack.includes(query));
  });

  return [...visible].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return b.rating - a.rating;
  });
}

export function createCartItem(product) {
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

export function updateCartQuantity(cart, itemId, delta) {
  return cart
    .map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item,
    )
    .filter((item) => item.quantity > 0);
}

export function loadStoredCart(storage = globalThis.localStorage) {
  if (!storage) return [];

  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    const cart = raw ? JSON.parse(raw) : [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(cart, storage = globalThis.localStorage) {
  if (!storage) return;
  storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function clearStoredCart(storage = globalThis.localStorage) {
  if (!storage) return;
  storage.removeItem(CART_STORAGE_KEY);
}

export function upsertCartItem(cart, item) {
  const existing = cart.find((cartItem) => cartItem.id === item.id);

  if (!existing) {
    return [...cart, item];
  }

  return cart.map((cartItem) =>
    cartItem.id === item.id
      ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
      : cartItem,
  );
}

export function calculateCartTotals(cart) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

export function createOrder({ cart, customer, paymentMethod }) {
  if (!cart?.length) {
    throw new Error("Cart is empty");
  }

  if (!PAYMENT_METHODS[paymentMethod]) {
    throw new Error("Unsupported payment method");
  }

  const totals = calculateCartTotals(cart);

  return {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString(),
    customer,
    paymentMethod: PAYMENT_METHODS[paymentMethod],
    status: "Processing",
    items: cart,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
  };
}

export function getSellerPaymentInfo(paymentMethod) {
  return SELLER_PAYMENT_INFO[paymentMethod] || SELLER_PAYMENT_INFO.card;
}

export function getOrderProcessSteps(status = "Processing") {
  const activeIndex = Math.max(0, ORDER_PROCESS.indexOf(status));

  return ORDER_PROCESS.map((label, index) => ({
    label,
    state:
      index < activeIndex ? "done" : index === activeIndex ? "active" : "upcoming",
  }));
}

export function getShopAssistantReply(products, message) {
  const question = normalizeAssistantText(message);
  const matchedProduct = findAssistantProduct(products, question);

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
    const productList = products
      .map((product) => `${product.name} (${product.color}, ${formatMoney(product.price)})`)
      .join("; ");
    return `Available SIRE pieces: ${productList}. Ask me the exact product name if you want details.`;
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

function findAssistantProduct(products, question) {
  return products.find((product) => {
    const productName = normalizeAssistantText(product.name);
    const shortName = productName
      .replace(/\b(wallet|cardholder|long)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return question.includes(productName) || (shortName && question.includes(shortName));
  });
}

export function addCustomerFeedback(existingFeedback, entry) {
  const name = (entry.name || "Anonymous").trim() || "Anonymous";
  const comment = (entry.comment || "").trim();
  const rating = Math.min(5, Math.max(1, Number(entry.rating) || 5));

  if (!comment) {
    throw new Error("Feedback comment is required");
  }

  return [{ name, rating, comment }, ...existingFeedback];
}
