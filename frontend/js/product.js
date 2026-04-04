// =====================
// PRODUCT PAGE LOGIC
// =====================
if (window.location.pathname.includes("product.html")) {

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

   if (!productId) {
    alert("No product selected.");
    window.location.href = "index.html";
    
  }

  // FETCH PRODUCT
  fetch(`https://unimart-ecommerce.onrender.com/api/products/${productId}`)
    .then(res => res.json())
    .then(product => {

    let quantity = 1;
      // RELATED PRODUCTS 
      fetch("https://unimart-ecommerce.onrender.com/api/products")
        .then(res => res.json())
        .then(allProducts => {

          const related = allProducts.filter(p =>
            p._id !== product._id &&
            p.category?.toLowerCase() === product.category?.toLowerCase()
          );

          renderRelatedProducts(related.slice(0, 6));
        });


 
     
      // IMAGE + THUMB
      const mainImg = document.getElementById("productImg");
      const thumbs = document.getElementById("thumbs");

      const images = product.images?.length
        ? product.images
        : ["./images/no-image.png"];

      mainImg.src = images[0];

      thumbs.innerHTML = "";

      images.forEach((src, index) => {
        const t = document.createElement("img");
        t.src = src;
        t.className = "thumb";

        if (index === 0) t.classList.add("active");

        t.onclick = () => {
          mainImg.src = src;

          document.querySelectorAll(".thumb").forEach(img =>
            img.classList.remove("active")
          );

          t.classList.add("active");
        };

        thumbs.appendChild(t);
      });

     
      // RIBBON (PRODUCT PAGE)
      let ribbon = "";
      
      if (product.isNew) ribbon += `<span class="ribbon new">NEW</span>`;
      if (product.isFeatured) ribbon += `<span class="ribbon featured">FEATURED</span>`;
      if (product.isBestSeller) ribbon += `<span class="ribbon best-seller">BESTSELLER</span>`;
      
      const mainImageBox = document.querySelector(".main-image");

      if (mainImageBox && ribbon) {
        mainImageBox.insertAdjacentHTML(
          "beforeend",
          `<div class="ribbon-group">${ribbon}</div>`
        );
      }

       // =====================
       // RATING ⭐
       // =====================
          const ratingBox = document.getElementById("productRating");

           if (ratingBox && product.ratings) {
             const full = Math.floor(product.ratings);
             const half = product.ratings % 1 >= 0.5 ? 1 : 0;
             const empty = 5 - full - half;
           
             ratingBox.innerHTML = `
               <div class="stars">
                 ${"★".repeat(full)}
                 ${half ? "½" : ""}
                 ${"☆".repeat(empty)}
                 <span>(${product.ratings})</span>
               </div>
             `;
           }
           
      // PRODUCT INFO
      document.getElementById("productName").textContent = product.name;
      document.getElementById("productPrice").textContent = `Rs. ${product.price}`;
      document.getElementById("oldPrice").textContent =
        product.oldPrice ? `Rs. ${product.oldPrice}` : "";
      document.getElementById("discount").textContent =
        product.discount ? `${product.discount}% OFF` : "";
      document.getElementById("productDesc").textContent = product.description;

      document.getElementById("productStock").textContent =
        product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock";

      document.getElementById("productSKU").textContent =
        `SKU: ${product.sku || "-"}`;

      
      // TAGS
      const tagsList = document.getElementById("productTags");
      tagsList.innerHTML = "";

      product.tags?.forEach(tag => {
        const li = document.createElement("li");
        li.textContent = tag;
        tagsList.appendChild(li);
      });

      
      // CART BUTTON
      const btnCart = document.querySelector(".btn-cart");

      if (product.stock === 0) {
        btnCart.disabled = true;
        btnCart.textContent = "Out of Stock";
      } else {
        btnCart.disabled = false;

        btnCart.onclick = () => {
          btnCart.textContent = "Adding...";

          addToCart(product, quantity);
          setTimeout(() => {
            btnCart.textContent = "Add to Cart";
  
          }, 800);
        };
      }

      // =====================
      // WHATSAPP
      // =====================
      document.getElementById("whatsappBtn").href =
        `https://wa.me/9779700013011?text=${encodeURIComponent(
          `Hello 👋 I want to order ${product.name} - Rs.${product.price}`
        )}`;

      
      // SHARE
      document.getElementById("shareBtn").onclick = () => {
        if (navigator.share) {
          navigator.share({
            title: product.name,
            url: window.location.href
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied!");
        }
      };


      
    })
    .catch(err => {
      console.error(err);
      alert("Error loading product");
      window.location.href = "index.html";
    });

    // RELATED PRODUCTS (USE SAME CARD AS INDEX)
    function renderRelatedProducts(products) {
      const container = document.getElementById("relatedProducts");
    
      if (!container) {
        console.error("❌ relatedProducts container NOT FOUND");
        return;
      }
    
      container.innerHTML = "";
    
      if (!products.length) {
        container.innerHTML = "<p>No related products found</p>";
        return;
      }
    
      products.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";
        
        //ribbon (new,featured,bestseller)
        let ribbon = "";
        if (product.isNew) ribbon += `<span class="ribbon new">NEW</span>`;
        if (product.isFeatured) ribbon += `<span class="ribbon featured">FEATURED</span>`;
        if (product.isBestSeller) ribbon += `<span class="ribbon best-seller">BESTSELLER</span>`;

        // Star ratings
         let stars = "";
         if (product.ratings) {
           const fullStars = Math.floor(product.ratings);
           const halfStar = product.ratings % 1 >= 0.5 ? 1 : 0;
           const emptyStars = 5 - fullStars - halfStar;
           stars += '<div class="rating">';
           stars += '★'.repeat(fullStars);
           stars += '½'.repeat(halfStar);
           stars += '☆'.repeat(emptyStars);
           stars += '</div>';
         }

    
        card.innerHTML = `
          <div class="product-img">
            ${ribbon}
            <img src="${product.images?.[0] || '../assets/images/no-image.png'}">
          </div>
    
          <div class="product-info">
              <h3 class="product-title">${product.name}</h3>
              <p class="short-desc">${product.description}</p>
            <div class="price-row">
                <span class="price">₹${product.price}</span>
                ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ''}
                ${product.discount ? `<span class="discount">${product.discount}% OFF</span>` : ''}
           </div>
             ${stars}

          </div>
        `;
    
        card.onclick = () => {
          window.location.href = `product.html?id=${product._id}`;
        };
    
        container.appendChild(card);
      });
    }
       
  
} 



// CART COUNT UPDATE
// =====================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.qty, 0);

  const el = document.getElementById("cartCount");
  if (el) el.textContent = total;
}

 // for Zoom 
const zoomContainer = document.getElementById("zoomContainer");
const zoomImage = document.getElementById("zoomImage");
const mainImg = document.getElementById("productImg");

if (zoomContainer && window.innerWidth > 768) {

  zoomContainer.addEventListener("mouseenter", () => {
    zoomImage.style.backgroundSize = "140%";
    zoomImage.style.display = "block";
    zoomImage.style.backgroundImage = `url(${mainImg.src})`;
  });

  zoomContainer.addEventListener("mousemove", (e) => {
    const rect = zoomContainer.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    zoomImage.style.backgroundPosition = `${x}% ${y}%`;
  });

  zoomContainer.addEventListener("mouseleave", () => {
    zoomImage.style.display = "none";
  });
}

//toast message
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

const backBtn = document.getElementById("back-shop");

backBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  if (window.history.length > 1) {
    window.history.back();
  } else {
    // fallback
    window.location.replace("index.html"); // better than href
  }
});