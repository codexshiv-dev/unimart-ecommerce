// ==========================================
// 🏬 UNIMART CENTRAL PRODUCT VIEW ENGINE
// ==========================================
if (window.location.pathname.includes("product.html")) {
    initializeProductPage();
}
function setupBackButton() {
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.onclick = () => window.history.back();
    }
}
window.setupBackButton = setupBackButton; // Ensure it's available globally
     
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
async function loadProduct(productId) {
    try {

        const product =
            await ProductService.getProductById(productId);

        if (!product || !product._id) {
            throw new Error("Invalid product data received");
        }

        await processProduct(product);

    } catch (err) {

        console.error(err);

        alert("Error loading product");

        window.location.href = "index.html";
    }
}

   
async function loadRelatedProducts(product){

    try{


      
      const allProducts =await ProductService.getProducts();

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
     


      
     

     