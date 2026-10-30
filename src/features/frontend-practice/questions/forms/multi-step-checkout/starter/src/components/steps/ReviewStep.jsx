// src/components/steps/ReviewStep.jsx — read-only summary shown before ordering.
export default function ReviewStep({ address, slot, items, total }) {
  return (
    <div className="space-y-3 text-sm">
      <p>
        <span className="font-semibold">Deliver to:</span> {address.name}, {address.street}, {address.city} {address.zip}
      </p>
      <p>
        <span className="font-semibold">Slot:</span> {slot}
      </p>
      <ul className="rounded-xl bg-app-cream p-3">
        {items.map((item) => (
          <li key={item.product._id} className="flex justify-between">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="font-bold text-app-green">Total ${total.toFixed(2)}</p>
    </div>
  );
}
