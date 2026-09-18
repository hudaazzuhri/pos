export default function TextDetail({label, value}){
    return (
        <div className="space-y-[2px]">
            <label className="text-sm text-gray-500">{label}</label>
            <div className="text-sm font-medium text-black">{value}</div>
        </div>
    );
}