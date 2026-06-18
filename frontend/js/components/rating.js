 
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