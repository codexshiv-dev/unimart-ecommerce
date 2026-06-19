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
      window.renderTags = renderTags;