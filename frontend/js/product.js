// =====================
// PRODUCT PAGE LOGIC
// =====================
if (window.location.pathname.includes("product.html")) {

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const zoomImage = document.getElementById("zoomImage");

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
        : ["../assets/images/no-image.png"];

      mainImg.src = images[0];
      thumbs.innerHTML = "";

      images.forEach((src, index) => {
        const t = document.createElement("img");
        t.src = src;
        t.className = "thumb";

        if (index === 0) t.classList.add("active");

        t.onclick = () => {
          mainImg.src = src;

          if (zoomImage) {
             zoomImage.style.backgroundImage = `url(${src})`;
           }

          document.querySelectorAll(".thumb").forEach(img =>
            img.classList.remove("active")
          );

          t.classList.add("active");
        };

        thumbs.appendChild(t);
      });

      // 2. PLACE ZOOM LOGIC HERE (After images are loaded)
        initSmoothZoom(mainImg, zoomImage);
     
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

      
        // TAGS container (only show if tags exist, else hide to prevent empty space)
        const tagsList = document.getElementById("productTags");
        if (tagsList) {
            tagsList.innerHTML = "";
            if (product.tags && product.tags.length > 0) {
                product.tags.forEach(tag => {
                    const li = document.createElement("li");
                    li.textContent = tag;
                    tagsList.appendChild(li);
                });
                tagsList.style.display = "flex"; // Show if tags exist
            } else {
                tagsList.style.display = "none"; // Hide container so margin doesn't create a gap
            }
        }


       // ==========================================
      // UPGRADED ACTION BUTTONS (Cart & Buy)
      // ==========================================      
      const btnCart = document.querySelector(".btn-cart");
      const whatsappBtn = document.getElementById("whatsappBtn");

      if (product.stock === 0) {
        btnCart.disabled = true;
        btnCart.textContent = "Out of Stock";
        whatsappBtn.style.display = "none";
      } else {
        // Check if product is already in the cart
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const isInCart = cart.some(item => item._id === product._id);

        if (isInCart) {
          btnCart.textContent = "Go to Cart";
          btnCart.onclick = () => { window.location.href = "/pages/cart.html"; };
        } else {
          btnCart.onclick = () => {
            addToCart(product, quantity);
            btnCart.textContent = "Go to Cart";
            // After adding, change click behavior to go to cart
            btnCart.onclick = () => { window.location.href = "/pages/cart.html"; };
          };
        }

      // =====================
      // WHATSAPP
      // =====================
      // WhatsApp / Order Button (Direct Buy)
        whatsappBtn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Buy at ₹${product.price}`;
        whatsappBtn.onclick = (e) => {
          e.preventDefault();
          // Add to cart first so checkout page can see it
          addToCart(product, 1);
          // Redirect to the new separate checkout page
          window.location.href = "/pages/checkout.html";
        };
      }
      
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
    // If no related category items, fetch featured products instead
    fetch("https://unimart-ecommerce.onrender.com/api/products")
        .then(res => res.json())
        .then(all => {
            const featured = all.filter(p => p.isFeatured).slice(0, 4);
            if (featured.length > 0) {
                // Change the section title to "Featured for You"
                const title = document.querySelector(".related-section h2");
                if (title) title.textContent = "Featured for You";
                renderRelatedProducts(featured);
            } else {
                container.innerHTML = `
                    <div style="text-align:center; padding: 40px; color: #888; grid-column: 1/-1;">
                        <i class="fa-solid fa-bag-shopping" style="font-size: 2rem; margin-bottom: 10px;"></i>
                        <p>More products coming soon!</p>
                    </div>`;
            }
        });
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

// ==========================================
// THE SMOOTH ZOOM FUNCTION (Amazon Style)
// ==========================================
function initSmoothZoom(mainImg, zoomImage) {
    const zoomContainer = document.getElementById("zoomContainer");

    if (!zoomContainer || !zoomImage || window.innerWidth <= 768) return;

    zoomContainer.addEventListener("mouseenter", () => {
        zoomImage.style.display = "block";
        zoomImage.style.backgroundImage = `url(${mainImg.src})`;
        zoomImage.style.backgroundSize = "250%"; // Intensity of zoom
    });

    zoomContainer.addEventListener("mousemove", (e) => {
        const rect = zoomContainer.getBoundingClientRect();
        // Amazon Smoothness calculation
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Use backgroundPosition for the smooth slide effect
        zoomImage.style.backgroundPosition = `${x}% ${y}%`;
    });

    zoomContainer.addEventListener("mouseleave", () => {
        zoomImage.style.display = "none";
    });
}





// CART COUNT UPDATE
// =====================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.qty, 0);

  const el = document.getElementById("cartCount");
  if (el) el.textContent = total;
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