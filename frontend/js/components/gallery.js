function renderGallery(product, zoomImage) {
    const mainImg = document.getElementById("productImg");
    const thumbs = document.getElementById("thumbs");

    // Always convert backend image objects into real URL strings.
    const images = Normalize.getAllImageUrls(product);

    if (!images || images.length === 0) {
        return;
    }

    // Main image
    if (mainImg) {
        mainImg.src = images[0];
        mainImg.alt = product?.name || "Product image";

        // If Cloudinary image fails, use local placeholder.
        mainImg.onerror = () => {
            mainImg.onerror = null;
            mainImg.src = Normalize.PLACEHOLDER_IMAGE;
        };
    }

    // Thumbnails
    if (thumbs) {
        thumbs.innerHTML = "";

        images.forEach((src, index) => {
            const thumbnail = document.createElement("img");

            thumbnail.src = src;
            thumbnail.alt = `${product?.name || "Product"} image ${index + 1}`;
            thumbnail.className = "thumb";

            if (index === 0) {
                thumbnail.classList.add("active");
            }

            thumbnail.onerror = () => {
                thumbnail.onerror = null;
                thumbnail.src = Normalize.PLACEHOLDER_IMAGE;
            };

            thumbnail.onclick = () => {
                if (mainImg) {
                    mainImg.src = src;

                    // Protect against broken Cloudinary image
                    mainImg.onerror = () => {
                        mainImg.onerror = null;
                        mainImg.src = Normalize.PLACEHOLDER_IMAGE;
                    };
                }

                if (zoomImage) {
                    zoomImage.style.backgroundImage = `url("${src}")`;
                }

                thumbs
                    .querySelectorAll(".thumb")
                    .forEach(img => img.classList.remove("active"));

                thumbnail.classList.add("active");
            };

            thumbs.appendChild(thumbnail);
        });
    }

    // Desktop zoom
    initSmoothZoom(mainImg, zoomImage);
}


function initSmoothZoom(mainImg, zoomImage) {
    if (!mainImg) return;

    const zoomContainer = document.getElementById("zoomContainer");

    // Zoom only on desktop
    if (
        !zoomContainer ||
        !zoomImage ||
        window.innerWidth <= 768
    ) {
        return;
    }

    // Prevent duplicate event listeners
    if (zoomContainer.dataset.zoomInitialized === "true") {
        return;
    }

    zoomContainer.dataset.zoomInitialized = "true";

    zoomContainer.addEventListener("mouseenter", () => {
        zoomImage.style.display = "block";

        zoomImage.style.backgroundImage =
            `url("${mainImg.src}")`;

        zoomImage.style.backgroundSize = "250%";
    });

    zoomContainer.addEventListener("mousemove", (e) => {
        const rect = zoomContainer.getBoundingClientRect();

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
