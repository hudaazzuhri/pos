import ProductForm from "@/Pages/Products/ProductForm";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function ProductEdit({ product, categories = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: product?.name ?? "",
        category_id: product?.category_id ?? "",
        sku: product?.sku ?? "",
        barcode: product?.barcode ?? "",
        buy_price: product?.buy_price ?? "",
        sell_price: product?.sell_price ?? "",
        stock: product?.stock ?? "",
        min_stock_alert: product?.min_stock_alert ?? "",
        is_active: product?.is_active ?? true,
        variants: (product?.variants ?? []).map((variant) => ({
            id: variant.id,
            name: variant.name ?? "",
            sku: variant.sku ?? "",
            barcode: variant.barcode ?? "",
            buy_price: variant.buy_price ?? "",
            sell_price: variant.sell_price ?? "",
            stock: variant.stock ?? "",
            is_active: variant.is_active ?? true,
        })),
    });

    const submit = (event) => {
        event.preventDefault();

        put(route("products.update", product.id));
    };

    return (
        <AuthenticatedLayout title="Edit Produk">
            <Head title="Edit Produk" />

            <PageHeader
                title="Edit Produk"
                subtitle="Form untuk memperbarui data produk"
                backAction={true}
            />

            <ProductForm
                categories={categories}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
                submitLabel="Update Produk"
            />
        </AuthenticatedLayout>
    );
}
