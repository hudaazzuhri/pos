import ProductForm from "@/Pages/Products/ProductForm";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function ProductsCreate({ categories = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category_id: "",
        sku: "",
        barcode: "",
        buy_price: "",
        sell_price: "",
        stock: "",
        is_active: true,
        variants: [],
    });

    const submit = (event) => {
        event.preventDefault();

        post(route("products.store"));
    };

    return (
        <AuthenticatedLayout title="Tambah Produk">
            <Head title="Tambah Produk" />

            <PageHeader
                title="Tambah Produk"
                subtitle="Form untuk menambahkan produk baru"
                backAction={true}
            />

            <ProductForm
                categories={categories}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onSubmit={submit}
            />
        </AuthenticatedLayout>
    );
}
