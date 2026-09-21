export default function FormSection({ title, description, children }) {
    return (
        <section className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-6">
                <div>
                    <h3 className="text-lg font-black text-gray-900">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}
