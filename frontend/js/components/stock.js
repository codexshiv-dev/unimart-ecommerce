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