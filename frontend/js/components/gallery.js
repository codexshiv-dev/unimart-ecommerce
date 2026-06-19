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
window.renderGallery = renderGallery;