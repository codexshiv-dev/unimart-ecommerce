// ==========================================
// 🏬 UNIMART CENTRAL PRODUCT VIEW ENGINE
// ==========================================
if (window.location.pathname.includes("product.html")) {
    initializeProductPage();
}
async function initializeProductPage() {

    setupBackButton();

    const params =
        new URLSearchParams(window.location.search);

    const productId =
        params.get("id");

    if (!productId) {

        alert("No product selected.");

        window.location.href =
            "index.html";

        return;
    }

    await  loadProduct(productId);

}

async function loadRelatedProducts(product){

    try{


      
        const response =
            await fetch(
                window.UniMartConfig.getEndpoint('products')
            );


       if (!response.ok) {

       throw new Error(
           `HTTP error! Status: ${response.status}`
       );

      }

        const envelope =
            await response.json();

        const allProducts =
            envelope.data || envelope;

        const related =
            allProducts.filter(p =>
                p._id !== product._id &&
                p.category?.toLowerCase() ===
                product.category?.toLowerCase() &&
                p.status !== "inactive"
            );

        renderRelatedProducts(
            related.slice(0,6)
        );

    }

    catch(err){

        console.error(
            "Related products error:",
            err
        );

    }

}
async function loadProduct(productId) {

    try {

        const response =
            await fetch(
                `${window.UniMartConfig.getEndpoint('products')}/${productId}`
            );

        if (!response.ok) {

            throw new Error(
                `HTTP error! Status: ${response.status}`
            );

        }

        const envelope =
            await response.json();

        const product =
            envelope.data || envelope;

            if (!product || !product._id) {

             throw new Error(
                "Invalid product data received"
             );

}

         await   processProduct(product);

    }

    catch (err) {

        console.error(err);

        alert("Error loading product");

        window.location.href =
            "index.html";

    }

}
async function processProduct(product) {

      // Block access to inactive products
      if (product.status === 'inactive') {
        alert("This product is currently unavailable.");
        window.location.href = "index.html";
        return;
      }
     

        //calling
        const zoomImage = document.getElementById("zoomImage");
         const isOutOfStock = renderStockInfo(product);

         
        //  renderStockInfo(product);
         renderGallery(product, zoomImage);
         renderRating(product);
         renderTags(product);
         renderRibbons(product);
        
         setupCartActions(product, isOutOfStock);
         setupShareButton(product);
        await loadRelatedProducts(product);
         renderProductInfo(product);
      
    
}

      function renderGallery(product,
    zoomImage) {
         // Images & Thumbnails
      const mainImg = document.getElementById("productImg");
      const thumbs = document.getElementById("thumbs");
      const images = (product.images && product.images.length > 0) ? product.images : ["../assets/images/no-image.png"];

      if (mainImg) {
        mainImg.src = images[0];
        mainImg.alt = product.name || "Product image";
      }
      
      if (thumbs) {
        thumbs.innerHTML = "";
      
        images.forEach((src, index) => {
          const t = document.createElement("img");
      
          t.src = src;
          t.className = "thumb";
      
          if (index === 0) {
            t.classList.add("active");
          }
      
          t.onclick = () => {
      
            if (mainImg) {
              mainImg.src = src;
            }
      
            if (zoomImage) {
              zoomImage.style.backgroundImage = `url(${src})`;
            }
      
            thumbs.querySelectorAll(".thumb")
              .forEach(img => img.classList.remove("active"));
      
            t.classList.add("active");
          };
      
          thumbs.appendChild(t);
        });
      }

      // PLACE ZOOM LOGIC HERE (After images are loaded)
      initSmoothZoom(mainImg, zoomImage);

      }
      function renderRating(product) {
         // RATING ⭐
         const ratingBox = document.getElementById("productRating");
   
           if (ratingBox &&
           product.ratings !== undefined &&
           product.ratings !== null) {
   
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


      }
      function renderTags(product) {
         // TAGS container
        const tagsList = document.getElementById("productTags");
        if (tagsList) {
          tagsList.innerHTML = "";
          if (product.tags && product.tags.length > 0) {
            product.tags.forEach(tag => {
              const li = document.createElement("li");
              li.textContent = tag;
              tagsList.appendChild(li);
            });
            tagsList.style.display = "flex"; 
          } else {
            tagsList.style.display = "none"; 
          }
        }

      }
      function renderRibbons(product) {
         // RIBBON (PRODUCT PAGE)
          let ribbon = "";
          if (product.isNew) ribbon += `<span class="ribbon new">NEW</span>`;
          if (product.isFeatured) ribbon += `<span class="ribbon featured">FEATURED</span>`;
          if (product.isBestSeller) ribbon += `<span class="ribbon best-seller">BESTSELLER</span>`;
          
         const mainImageBox =
           document.querySelector(".main-image");
         
          if (mainImageBox) {
         
           mainImageBox
             .querySelector(".ribbon-group")
             ?.remove();
         
           if (ribbon) {
         
             mainImageBox.insertAdjacentHTML(
               "beforeend",
               `<div class="ribbon-group">${ribbon}</div>`
             );
         
           }
    
          }
      }
      function setupCartActions( product, isOutOfStock ){
             // CART & WHATSAPP BUTTON LOGIC 
             const quantity = 1;   
             const btnCart = document.querySelector(".btn-cart");
             const whatsappBtn = document.getElementById("whatsappBtn");
             const cart = JSON.parse(localStorage.getItem("cart")) || [];
             const isInCart = cart.some(item => item._id === product._id);

            if (isOutOfStock) {
             
               if (btnCart) {
                 btnCart.disabled = true;
                 btnCart.textContent = "Out of Stock";
               }
             
               if (whatsappBtn) {
                 whatsappBtn.style.display = "none";
               }
             
             } else {
             
               if (btnCart) {
             
                 if (isInCart) {
             
                   btnCart.textContent = "Go to Cart";
             
                   btnCart.onclick = () => {
                     window.location.href = "/pages/cart.html";
                   };
             
                 } else {
             
                   btnCart.onclick = () => {
             
                     if (typeof addToCart === "function") {
     
                       addToCart(product,  quantity);
                        updateCartCount();
                     
                     }
             
                     showToast("Added to cart! 🛍️");
             
                     btnCart.innerHTML =
                       `<i class="fa-solid fa-check"></i> Added`;
             
                     btnCart.style.background = "#19af50";
             
                     setTimeout(() => {
             
                       btnCart.textContent = "Go to Cart";
             
                       btnCart.style.background = "";
             
                       btnCart.onclick = () => {
                         window.location.href = "/pages/cart.html";
                       
                       };
             
                     }, 1000);
                   };
                 }
               }
             
                  if (whatsappBtn) {

                       whatsappBtn.onclick = e => {
                   
                           e.preventDefault();
                   
                          if (typeof addToCart === "function") {

                              addToCart(product, quantity);
                          
                              updateCartCount();
                          }
                           window.location.href =
                               "/pages/checkout.html";
                          
                   
                       };

                     }   
             }
      }

      function setupShareButton(product) {
         // SHARE LOGIC
          const shareBtn = document.getElementById("shareBtn");
          if(shareBtn) {
            shareBtn.onclick = () => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              } else {
               navigator.clipboard
                  .writeText(window.location.href)
                  .then(() => {
                
                    alert("Link copied!");
                
                  })
                  .catch(() => {
                
                    alert("Unable to copy link.");
                
                  });
              }
            };
          }
   

      }
      function renderRelatedProducts(products) {
              // RELATED PRODUCTS
         const container = document.getElementById("relatedProducts");
              
          if (!container) return;
        
         container.innerHTML = "";
         // RESTORED FALLBACK LOGIC
         if (!products.length) {

         container.innerHTML =
            "<p>No related products found</p>";
      
         return;
        }
        // if (!products.length) {
        //    fetch(window.UniMartConfig.getEndpoint('products'))
        //      .then(res => {
           
        //        if (!res.ok) {
        //          throw new Error(`HTTP error! Status: ${res.status}`);
        //        }
           
        //        return res.json();
           
        //      })
             
             
        //      .then(allEnvelope => {
        //        const all = allEnvelope.data ? allEnvelope.data : allEnvelope;
        //        const featured = all.filter(p => p.isFeatured).slice(0, 4);
        //        const title = document.querySelector(".related-section h2");
        //        // if (title) title.textContent = "Featured for You";
        //        if (title) {
        //          title.textContent = "Related Products";
        //        }
        //        if(featured.length > 0) renderRelatedProducts(featured);
        //      });
      
             
        //    return;
        //  }
        
         products.forEach(product => {
      
           if (product.status === 'inactive') return;
           const card = document.createElement("article");
           card.className = "product-card";
      
           // 2. Safe image selection: Check if images array exists and has length
      
         //  const productImage = (product.images && product.images.length > 0) ? product.images[0] : "../assets/images/no-image.png";
         const productImage = product.images?.[0]
         || '../assets/images/no-image.png';
      
           let ribbon = "";
           if (product.isNew) ribbon += `<span class="ribbon new">NEW</span>`;
           if (product.isFeatured) ribbon += `<span class="ribbon featured">FEATURED</span>`;
           if (product.isBestSeller) ribbon += `<span class="ribbon best-seller">BESTSELLER</span>`;
      
           let stars = "";
           if (product.ratings) {
             const fullStars = Math.floor(product.ratings);
             const halfStar = product.ratings % 1 >= 0.5 ? 1 : 0;
             const emptyStars = 5 - fullStars - halfStar;
             stars = `<div class="rating">${'★'.repeat(fullStars)}${halfStar ? "½" : ""}${'☆'.repeat(emptyStars)}</div>`;
             
           }
      
           card.innerHTML = `
             <div class="product-img">
               ${ribbon}
              <img src="${productImage}" alt="${product.name}">
             </div>
        
             <div class="product-info">
               <h3 class="product-title">${product.name}</h3>
               <p class="short-desc">${product.description || ''}</p>
               <div class="price-row">
                 <span class="price">Rs. ${(product.price || 0).toLocaleString('en-NP')}</span>
                 ${product.oldPrice ? `<span class="old-price">Rs. ${product.oldPrice.toLocaleString('en-NP')}</span>` : ''}
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
      // THE SMOOTH ZOOM FUNCTION
     function initSmoothZoom(mainImg, zoomImage) {
     
       if (!mainImg) return;
     
       const zoomContainer =
         document.getElementById("zoomContainer");
     
       if (
         !zoomContainer ||
         !zoomImage ||
         window.innerWidth <= 768
       ) {
         return;
       }
     
       if (zoomContainer.dataset.zoomInitialized) {
         return;
       }
     
       zoomContainer.dataset.zoomInitialized = "true";
     
       zoomContainer.addEventListener("mouseenter", () => {
     
         zoomImage.style.display = "block";
     
         zoomImage.style.backgroundImage =
           `url(${mainImg.src})`;
     
         zoomImage.style.backgroundSize = "250%";
     
       });
     
       zoomContainer.addEventListener("mousemove", e => {
     
         const rect =
           zoomContainer.getBoundingClientRect();
     
         const x =
           ((e.clientX - rect.left) / rect.width) * 100;
     
         const y =
           ((e.clientY - rect.top) / rect.height) * 100;
     
         zoomImage.style.backgroundPosition =
           `${x}% ${y}%`;
     
       });
     
       zoomContainer.addEventListener("mouseleave", () => {
     
         zoomImage.style.display = "none";
     
       });
     
     }


       // CART COUNT UPDATE
      function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
      
        const el = document.getElementById("cartCount");
        if (el) el.textContent = total;
      }
      
      // toast message
      function showToast(msg) {
        const toast = document.getElementById("toast");
        if (!toast) return;
      
        toast.textContent = msg;
        toast.classList.add("show");
      
        setTimeout(() => {
          toast.classList.remove("show");
        }, 2000);
      }

      function setupBackButton() {
      
          const backBtn =
              document.getElementById("back-shop");
      
          if (!backBtn) return;
      
          backBtn.addEventListener("click", e => {
      
              e.preventDefault();
      
              if (window.history.length > 1) {
      
                  window.history.back();
      
              } else {
      
                  window.location.replace("index.html");
      
              }
      
          });
      
      }
      function renderStockInfo(product) {

          const stockEl = document.getElementById("productStock");
          const skuEl = document.getElementById("productSKU");
          const currentStock = product.stockQuantity ?? 0; 
          const isOutOfStock = currentStock <= 0;  
          
          if (skuEl) skuEl.textContent = `SKU: ${product.sku || 'N/A'}`;
          if (stockEl) {
            stockEl.textContent = isOutOfStock ? "Availability: Out of Stock" : `Availability: In Stock (${currentStock} units)`;
            stockEl.className = isOutOfStock ? "out-stock" : "in-stock";
          }
    
          return isOutOfStock;
       }
      function renderProductInfo(product){
             // PRODUCT INFO & NATIVE NEPALESE LOCALIZATION TEXT FIXES
      document.getElementById("productName")?.textContent = product.name || "Unnamed Product";
      document.getElementById("productPrice")?.textContent = `Rs. ${(product.price ?? 0).toLocaleString('en-NP')}`;
      document.getElementById("oldPrice")?.textContent = product.oldPrice ? `Rs. ${product.oldPrice.toLocaleString('en-NP')}` : "";
      document.getElementById("discount")?.textContent = product.discount ? `${product.discount}% OFF` : "";
      document.getElementById("productDesc")?.textContent = product.description || "No description available.";
     
       }