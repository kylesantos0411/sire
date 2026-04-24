import {
  loadSiteContent,
  resetSiteContent,
  saveSiteContent,
  updateProductContent,
} from "./site-content.mjs";

let content = loadSiteContent();

const form = document.querySelector("#adminForm");
const status = document.querySelector("#adminStatus");
const productsContainer = document.querySelector("#adminProducts");

const fields = {
  brandName: document.querySelector("#adminBrandName"),
  heroEyebrow: document.querySelector("#adminHeroEyebrow"),
  heroTitle: document.querySelector("#adminHeroTitle"),
  heroCopy: document.querySelector("#adminHeroCopy"),
  heroImage: document.querySelector("#adminHeroImage"),
  heroPreview: document.querySelector("#adminHeroPreview"),
  aboutTitle: document.querySelector("#adminAboutTitle"),
  aboutCopy: document.querySelector("#adminAboutCopy"),
  aboutImage: document.querySelector("#adminAboutImage"),
  aboutPreview: document.querySelector("#adminAboutPreview"),
};

renderAdmin();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  content = readFormContent();
  saveSiteContent(content);
  status.textContent = "Saved. Open the store page to see the updates.";
});

document.querySelector("#resetAdmin").addEventListener("click", () => {
  resetSiteContent();
  content = loadSiteContent();
  renderAdmin();
  status.textContent = "Storefront reset to the default SIRE content.";
});

fields.heroImage.addEventListener("change", async () => {
  const image = await readSelectedImage(fields.heroImage);
  if (!image) return;
  content = {
    ...content,
    brand: { ...content.brand, heroImage: image },
  };
  fields.heroPreview.src = image;
});

fields.aboutImage.addEventListener("change", async () => {
  const image = await readSelectedImage(fields.aboutImage);
  if (!image) return;
  content = {
    ...content,
    about: { ...content.about, image },
  };
  fields.aboutPreview.src = image;
});

productsContainer.addEventListener("change", async (event) => {
  if (!event.target.matches("[data-product-image]")) return;
  const productId = event.target.dataset.productImage;
  const image = await readSelectedImage(event.target);
  if (!image) return;

  content = updateProductContent(content, productId, { image });
  productsContainer.querySelector(`[data-product-preview="${productId}"]`).src =
    image;
});

function renderAdmin() {
  fields.brandName.value = content.brand.name;
  fields.heroEyebrow.value = content.brand.eyebrow;
  fields.heroTitle.value = content.brand.heroTitle;
  fields.heroCopy.value = content.brand.heroCopy;
  fields.heroPreview.src = content.brand.heroImage;
  fields.aboutTitle.value = content.about.title;
  fields.aboutCopy.value = content.about.copy;
  fields.aboutPreview.src = content.about.image;

  productsContainer.innerHTML = content.products
    .map(
      (product) => `
        <article class="product-admin-card">
          <img data-product-preview="${product.id}" src="${product.image}" alt="${product.name}">
          <label>Name<input data-product-field="name" data-product-id="${product.id}" value="${product.name}"></label>
          <label>Price in USD<input data-product-field="price" data-product-id="${product.id}" type="number" min="0" step="1" value="${product.price / 100}"></label>
          <label>Description<textarea data-product-field="description" data-product-id="${product.id}">${product.description}</textarea></label>
          <label>Product image<input data-product-image="${product.id}" type="file" accept="image/*"></label>
        </article>
      `,
    )
    .join("");
}

function readFormContent() {
  let nextContent = {
    ...content,
    brand: {
      ...content.brand,
      name: fields.brandName.value.trim() || "SIRE.",
      eyebrow: fields.heroEyebrow.value.trim(),
      heroTitle: fields.heroTitle.value.trim(),
      heroCopy: fields.heroCopy.value.trim(),
    },
    about: {
      ...content.about,
      title: fields.aboutTitle.value.trim(),
      copy: fields.aboutCopy.value.trim(),
    },
  };

  productsContainer.querySelectorAll("[data-product-id]").forEach((input) => {
    const productId = input.dataset.productId;
    const field = input.dataset.productField;
    const value =
      field === "price" ? Math.max(0, Number(input.value) * 100) : input.value;
    nextContent = updateProductContent(nextContent, productId, { [field]: value });
  });

  return nextContent;
}

function readSelectedImage(input) {
  const [file] = input.files || [];
  if (!file) return Promise.resolve("");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}
