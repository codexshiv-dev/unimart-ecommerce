/**
 * UNiMART — Data normalization
 *
 * Centralizes backend → frontend data normalization.
 *
 * Backend product shape:
 *   images: [{ url, publicId }]
 *   category: { _id, name, slug } | null
 *
 * UI code should use Normalize instead of reading
 * product.images / product.category directly.
 *
 * Responsibilities:
 * - Normalize product data
 * - Provide safe image URLs
 * - Provide safe category values
 * - Provide a single image fallback handler
 */

const Normalize = (() => {
    /**
     * Resolve the frontend root correctly for:
     *
     * Local:
     *   http://127.0.0.1:5501/frontend/
 *
     * Production:
     *   https://your-vercel-domain/
     *
     * This prevents relative asset paths from escaping /frontend/
     * during local development.
     */
    const getFrontendRoot = () => {
        const pathname = window.location.pathname;

        return pathname.startsWith("/frontend/")
            ? "/frontend/"
            : "/";
    };

    /**
     * Single frontend placeholder image.
     */
    const PLACEHOLDER_IMAGE =
        `${getFrontendRoot()}assets/images/no-image.png`;

    /**
     * Get one product image.
     */
    const getImageUrl = (product, index = 0) => {
        return (
            product?.images?.[index]?.url ||
            PLACEHOLDER_IMAGE
        );
    };

    /**
     * Get all product image URLs.
     *
     * Missing/invalid images automatically receive
     * the placeholder.
     */
    const getAllImageUrls = (product) => {
        if (
            !Array.isArray(product?.images) ||
            product.images.length === 0
        ) {
            return [PLACEHOLDER_IMAGE];
        }

        return product.images.map(
            (image) =>
                image?.url || PLACEHOLDER_IMAGE
        );
    };

    /**
     * Get a safe category name.
     */
    const getCategoryName = (product) => {
        return product?.category?.name || "Uncategorized";
    };

    /**
     * Get a safe category slug.
     */
    const getCategorySlug = (product) => {
        return product?.category?.slug || null;
    };

    /**
     * Normalize a raw backend product.
     *
     * Existing UI receives convenient flat properties while
     * the original backend data remains available.
     */
    const product = (raw) => {
        if (!raw) return null;

        return {
            ...raw,
            imageUrl: getImageUrl(raw),
            imageUrls: getAllImageUrls(raw),
            categoryName: getCategoryName(raw),
            categorySlug: getCategorySlug(raw),
        };
    };

    /**
     * Safe image fallback.
     *
     * Important:
     * Setting onerror = null BEFORE assigning the fallback
     * prevents an infinite error loop if the placeholder itself
     * ever fails.
     */
    const applyImageFallback = (img) => {
        if (!img) return;

        img.onerror = () => {
            img.onerror = null;
            img.src = PLACEHOLDER_IMAGE;
        };
    };

    return {
        PLACEHOLDER_IMAGE,
        getImageUrl,
        getAllImageUrls,
        getCategoryName,
        getCategorySlug,
        product,
        applyImageFallback,
    };
})();

window.Normalize = Normalize;

