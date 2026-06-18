const ProductService = {

    async getProducts() {

        const response =
            await fetch(
                window.UniMartConfig.getEndpoint(
                    "products"
                )
            );

        if (!response.ok) {
            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const envelope =
            await response.json();

        return envelope.data || envelope;
    },

    async getProductById(id) {

        const response =
            await fetch(
                `${window.UniMartConfig.getEndpoint(
                    "products"
                )}/${id}`
            );

        if (!response.ok) {
            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const envelope =
            await response.json();

        return envelope.data || envelope;
    }

};

window.ProductService =
    ProductService;

    