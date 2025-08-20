import placeholder from '../../public/tucheck.png'; // ✅ bundled asset

interface CouponCardProps {
  coupon: {
    id: string;
    title: string;
    description: string;
    code: string | null;
    endDate: string | null;
    imageUrl: string | null;
    category: string | null;
  };
  onClick: () => void;
}

export default function CouponCard({ coupon, onClick }: CouponCardProps) {
  const endDateLabel = coupon.endDate
    ? new Date(coupon.endDate).toLocaleDateString()
    : 'fecha desconocida';

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-200"
      role="button"
      aria-label={`Abrir cupón ${coupon.title}`}
    >
      <img
        src={coupon.imageUrl || placeholder}
        alt={coupon.title}
        className="w-full h-40 object-cover"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (img.dataset.fallbackApplied) return; // ✅ avoid loop
          img.dataset.fallbackApplied = '1';
          img.src = placeholder;
        }}
      />
      <div className="p-4 flex flex-col justify-between h-32">
        <h3 className="text-base font-semibold text-gray-800 truncate">{coupon.title}</h3>
        <p className="mt-1 text-sm text-gray-500 flex-1 truncate">{coupon.description}</p>
        <p className="mt-2 text-xs text-gray-400">Válido hasta {endDateLabel}</p>
      </div>
    </div>
  );
}
