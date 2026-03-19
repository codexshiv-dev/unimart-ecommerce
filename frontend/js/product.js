// =====================
// GET URL PARAMS
// =====================
if (window.location.pathname.includes("product.html")) {

  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const price = params.get("price");
  const desc = params.get("desc");
  const img = params.get("img");

  if (!name || !price || !img) {
    alert("No product data found. Please go back to shop.");
    window.location.href = "index.html";
  }
// =====================
// MULTIPLE IMAGES (for demo)
// =====================
const images = [img, img, img];

// =====================
// SET PRODUCT DATA
// =====================

  document.getElementById("productName").textContent = name;
  document.getElementById("productPrice").textContent = "Rs. " + price;
  document.getElementById("oldPrice").textContent = "Rs. " + (price * 1.3).toFixed(0);
  document.getElementById("discount").textContent = "30% OFF";
  document.getElementById("productDesc").textContent = desc;


// =====================
// MAIN IMAGE & THUMBNAILS
// =====================
const mainImg = document.getElementById("productImg");
const thumbs = document.getElementById("thumbs");

mainImg.src = images[0];
thumbs.innerHTML = ""; // clear old thumbs

if (images.length > 1) {
  images.forEach(src => {
    const t = document.createElement("img");
    t.src = src;
    t.onclick = () => (mainImg.src = src);
    thumbs.appendChild(t);
  });
} else {
  thumbs.style.display = "none"; // hide thumbnails if only 1 image
}

// =====================
// WHATSAPP BUTTON
// =====================
const message = `Hello Unimart Team 👋
I want to order:

Product: ${name}
Price: Rs.${price}`;

document.getElementById("whatsappBtn").href =
  `https://wa.me/9779700013011?text=${encodeURIComponent(message)}`;

// =====================
// SHARE BUTTON
// =====================
const shareBtn = document.getElementById("shareBtn");

shareBtn.addEventListener("click", () => {
  if (navigator.share) {
      navigator.share({
        title: name,
        text: `Check this product: ${name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied!");
    }
});

// =====================
// RELATED PRODUCTS
// =====================
const relatedProducts = [
  { name: "Smart Watch", price: 2500, desc: "Bluetooth smart watch", img: "/images/img1.jpeg" },
  { name: "Moon Lamp", price: 699, desc: "3D moon night lamp", img: "/images/img2.jpeg" },
  { name: "Mini Projector", price: 3500, desc: "HD mini projector", img: "/images/img3.jpeg" }
];

const relatedDiv = document.getElementById("relatedProducts");
relatedDiv.innerHTML = "";

relatedProducts.forEach(p => {
  const card = document.createElement("article");
  card.className = "product-card";

  card.innerHTML = `
    <div class="product-img">
      <img src="${p.img}" alt="${p.name}">
    </div>

    <div class="product-info">
      <h3>${p.name}</h3>
      <p class="short-desc">${p.desc}</p>

      <div class="price-row">
        <span class="price">Rs. ${p.price}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    const url = `product.html?name=${encodeURIComponent(p.name)}
&price=${encodeURIComponent(p.price)}
&desc=${encodeURIComponent(p.desc)}
&img=${encodeURIComponent(p.img)}`;
    window.location.href = url;
  });

  relatedDiv.appendChild(card);
});

}