import OrderCard from './OrderCard';

const COLUMNS = [
  { status: 'CONFIRMED', title: 'New / Confirmed' },
  { status: 'PREPARING', title: 'Preparing' },
  { status: 'READY', title: 'Ready for pickup' }
];

export default function OrderQueue({ orders, onAdvanceStatus, onCancel, advancingOrderId }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const columnOrders = orders.filter((o) => o.status === col.status);
        return (
          <div key={col.status} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-gray-700">{col.title}</h3>
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">
                {columnOrders.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {columnOrders.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">
                  No orders here
                </p>
              )}
              {columnOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAdvanceStatus={onAdvanceStatus}
                  onCancel={onCancel}
                  advancing={advancingOrderId === order.id}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
