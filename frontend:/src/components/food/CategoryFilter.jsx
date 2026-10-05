export default function CategoryFilter({ categories, active, onChange }) {
  if (!categories?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`chip border ${
          !active ? 'border-canteen-primary bg-canteen-okLight text-canteen-primaryDark' : 'border-canteen-border text-canteen-muted'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`chip border ${
            active === category
              ? 'border-canteen-primary bg-canteen-okLight text-canteen-primaryDark'
              : 'border-canteen-border text-canteen-muted'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
