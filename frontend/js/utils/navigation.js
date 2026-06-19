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
     
  window.setupBackButton = setupBackButton;