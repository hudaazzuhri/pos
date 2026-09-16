import { ImagePlus } from "lucide-react";
import { ErrorMessage, FieldLabel, inputClassName } from "./FormField";

export default function ProfileSettings({ data, errors, logoPreview, onChange, onLogoChange }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-4">
                <div>
                    <FieldLabel>Nama Toko</FieldLabel>
                    <input
                        value={data.store_name}
                        onChange={(event) =>
                            onChange("store_name", event.target.value)
                        }
                        className={inputClassName}
                        placeholder="Contoh: Kedai Kopi Senja"
                    />
                    <ErrorMessage error={errors.store_name} />
                </div>
                <div>
                    <FieldLabel>No. HP / WhatsApp</FieldLabel>
                    <input
                        value={data.phone}
                        onChange={(event) =>
                            onChange("phone", event.target.value)
                        }
                        className={inputClassName}
                        placeholder="08xxxxxxxxxx"
                    />
                    <ErrorMessage error={errors.phone} />
                </div>
                <div>
                    <FieldLabel>Alamat Header Struk</FieldLabel>
                    <textarea
                        value={data.address_header}
                        onChange={(event) =>
                            onChange("address_header", event.target.value)
                        }
                        rows={4}
                        className={`${inputClassName} h-32 py-3`}
                        placeholder="Alamat yang tampil di bagian atas struk"
                    />
                    <ErrorMessage error={errors.address_header} />
                </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
                <FieldLabel>Logo Toko</FieldLabel>
                <label className="mt-2 h-56 flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30">
                    {logoPreview ? (
                        <img
                            src={logoPreview}
                            alt="Preview logo toko"
                            className="h-full w-full object-contain p-5"
                        />
                    ) : (
                        <span className="space-y-2 px-4">
                            <ImagePlus className="mx-auto h-8 w-8 text-slate-400" />
                            <span className="block text-xs font-medium text-slate-500">
                                Upload logo
                            </span>
                        </span>
                    )}
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={onLogoChange}
                        className="sr-only"
                    />
                </label>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                    PNG, JPG, atau WEBP. Maksimal 2 MB.
                </p>
                <ErrorMessage error={errors.logo} />
            </div>
        </div>
    );
}