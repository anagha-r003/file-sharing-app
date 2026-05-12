function SummaryCards() {
  const cards = [
    {
      label: "TOTAL ASSETS",
      value: 0,
      sub: "Your uploaded files",
      icon: "inventory_2",
      color: "text-emerald-400",
    },
    {
      label: "ACTIVE SHARES",
      value: 0,
      sub: "Currently active links",
      icon: "hub",
      color: "text-orange-400",
    },
    {
      label: "TOTAL ACCESSES",
      value: 0,
      sub: "All-time link opens",
      icon: "visibility",
      color: "text-violet-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      {cards.map((card) => (
        <div key={card.label} className="custom-card p-4 md:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {card.label}
            </span>
            <span className={`material-symbols-outlined ${card.color}`}>
              {card.icon}
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-black text-white mb-1">
            {card.value}
          </div>
          <p className="text-slate-500 text-sm">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;