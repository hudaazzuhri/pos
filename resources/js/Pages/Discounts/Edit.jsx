import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DiscountForm from "@/Pages/Discounts/DiscountForm";
import PageHeader from "@/Components/PageHeader";
import { Head, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function DiscountsEdit({ discount, products = [] }) {
    const [productSearch, setProductSearch] = useState("");
    const { data, setData, put, processing, errors } = useForm({
        name: discount.name ?? "",
        type: discount.type === "fixed_amount" ? "fixed" : discount.type,
        value: discount.value ?? "",
        scope: discount.scope === "transaction" ? "global" : discount.scope,
        product_ids: discount.products?.map((product) => product.id) ?? [],
        min_purchase_amount: discount.min_purchase_amount ?? "",
        max_discount_amount: discount.max_discount_amount ?? "",
        start_date: toDateTimeLocal(discount.start_date),
        end_date: toDateTimeLocal(discount.end_date),
        is_active: Boolean(discount.is_active),
    });
    const filteredProducts = useMemo(
        () => filterProducts(products, productSearch),
        [products, productSearch],
    );

    const submit = (event) => {
        event.preventDefault();
        put(route("discounts.update", discount.id));
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
            <Head title={`Edit Diskon: ${discount.name}`} />
            <PageHeader
                title="Edit Diskon"
                subtitle={`Perbarui aturan promo ${discount.name}.`}
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
                editing
                onSubmit={submit}
                submitLabel="Simpan Perubahan"
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

function toDateTimeLocal(value) {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
