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
      window.renderRibbons = renderRibbons;