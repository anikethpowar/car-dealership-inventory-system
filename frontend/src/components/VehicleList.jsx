import VehicleCard from './VehicleCard';

export default function VehicleList({
  vehicles = [],
  onPurchase,
  purchasingId = null,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onPurchase={onPurchase}
          isPurchasing={purchasingId === vehicle.id}
        />
      ))}
    </div>
  );
}

