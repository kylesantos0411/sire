import { products } from "./sire-products.mjs";

export const SITE_CONTENT_KEY = "sire-site-content-v2";

export const DEFAULT_SITE_CONTENT = {
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
  products,
};

export function mergeSiteContent(draft = {}) {
  return {
    brand: {
      ...DEFAULT_SITE_CONTENT.brand,
      ...(draft.brand || {}),
    },
    about: {
      ...DEFAULT_SITE_CONTENT.about,
      ...(draft.about || {}),
    },
    products: mergeProducts(draft.products),
  };
}

export function updateProductContent(content, productId, updates) {
  return {
    ...content,
    products: content.products.map((product) =>
      product.id === productId ? { ...product, ...updates } : product,
    ),
  };
}

export function loadSiteContent(storage = globalThis.localStorage) {
  if (!storage) return DEFAULT_SITE_CONTENT;

  try {
    const raw = storage.getItem(SITE_CONTENT_KEY);
    return raw ? mergeSiteContent(JSON.parse(raw)) : DEFAULT_SITE_CONTENT;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export function saveSiteContent(content, storage = globalThis.localStorage) {
  if (!storage) return;
  storage.setItem(SITE_CONTENT_KEY, JSON.stringify(mergeSiteContent(content)));
}

export function resetSiteContent(storage = globalThis.localStorage) {
  if (!storage) return;
  storage.removeItem(SITE_CONTENT_KEY);
}

function mergeProducts(draftProducts = []) {
  return DEFAULT_SITE_CONTENT.products.map((product) => ({
    ...product,
    ...(draftProducts.find((draft) => draft.id === product.id) || {}),
  }));
}
