const ICONS = {
  Bike: "🏍️",
  Mini: "🚗",
  Sedan: "🚙",
  SUV: "🚐",
};

export default function CabCard({ option, selected, onSelect }) {
  return (
    <div className={`cab-card${selected ? " selected" : ""}`} onClick={() => onSelect(option)}>
      <div className="cab-card-top">
        <div className="cab-icon">{ICONS[option.cabType] || "🚕"}</div>
        <div style={{ textAlign: "right" }}>
          <div className="cab-fare">₹{option.fare}</div>
          <div className="cab-eta">{option.eta} min away</div>
        </div>
      </div>
      <p className="cab-name">{option.cabType}</p>
      <div className="cab-meta">Up to {option.capacity} passengers</div>
      <div className="nearby-tag">{option.nearbyCabs} cabs nearby</div>
    </div>
  );
}
