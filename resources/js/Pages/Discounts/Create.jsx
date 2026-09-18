import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DiscountForm from "@/Pages/Discounts/DiscountForm";
import PageHeader from "@/Components/PageHeader";
import { Head, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

const emptyForm = {
    name: "",
    type: "percentage",
    value: "",
    scope: "global",
    product_ids: [],
    min_purchase_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    is_active: true,
};

export default function DiscountsCreate({ products = [] }) {
    const [productSearch, setProductSearch] = useState("");
    const { data, setData, post, processing, errors } = useForm(emptyForm);
    const filteredProducts = useMemo(
        () => filterProducts(products, productSearch),
        [products, productSearch],
    );

    const submit = (event) => {
        event.preventDefault();
        post(route("discounts.store"));
    };

    const toggleProduct = (id) => {
        const selected = data.product_ids.includes(id);
        setData(
            "product_ids",
            selected
                ? data.product_ids.filter((productId) => productId !== id)
                : [...data.product_ids, id],
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Diskon Baru" />
            <PageHeader
                title="Buat Diskon Baru"
                subtitle="Atur promo baru untuk transaksi atau produk tertentu."
                backAction
            />
            <DiscountForm
                data={data}
                setData={setData}
                errors={errors}
                products={filteredProducts}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                toggleProduct={toggleProduct}
                processing={processing}
                editing={false}
                onSubmit={submit}
                submitLabel="Simpan Diskon"
            />
        </AuthenticatedLayout>
    );
}

function filterProducts(products, search) {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
        [product.name, product.sku].some((value) =>
            String(value || "").toLowerCase().includes(term),
        ),
    );
}
