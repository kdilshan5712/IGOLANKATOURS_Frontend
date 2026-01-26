import { Filter, RotateCcw } from "lucide-react";
import "./FilterPanel.css";

const FilterPanel = ({
  selectedCategory,
  setSelectedCategory,
  selectedBudget,
  setSelectedBudget,
  selectedDuration,
  setSelectedDuration,
  selectedHotel,
  setSelectedHotel,
  onReset,
}) => {
  const filters = [
    {
      label: "Category",
      value: selectedCategory,
      onChange: setSelectedCategory,
      options: [
        { value: "all", label: "All categories" },
        { value: "Cultural", label: "Cultural" },
        { value: "Adventure", label: "Adventure" },
        { value: "Beach", label: "Beach" },
        { value: "Wildlife", label: "Wildlife" },
        { value: "Luxury", label: "Luxury" },
      ],
    },
    {
      label: "Budget",
      value: selectedBudget,
      onChange: setSelectedBudget,
      options: [
        { value: "all", label: "Any budget" },
        { value: "budget", label: "$400 – $600" },
        { value: "mid", label: "$600 – $1000" },
        { value: "luxury", label: "$1000+" },
      ],
    },
    {
      label: "Duration",
      value: selectedDuration,
      onChange: setSelectedDuration,
      options: [
        { value: "all", label: "Any duration" },
        { value: "short", label: "1 – 5 days" },
        { value: "medium", label: "5 – 7 days" },
        { value: "long", label: "7+ days" },
      ],
    },
    {
      label: "Hotel level",
      value: selectedHotel,
      onChange: setSelectedHotel,
      options: [
        { value: "all", label: "Any level" },
        { value: "3-star", label: "3 Star" },
        { value: "4-star", label: "4 Star" },
        { value: "5-star", label: "5 Star" },
      ],
    },
  ];

  return (
    <aside className="filter-panel">
      {/* Header */}
      <div className="filter-header">
        <Filter size={18} />
        <h3 className="filter-title">
          Filter tours
        </h3>
      </div>

      {/* Filters */}
      <div className="filter-groups">
        {filters.map((filter) => (
          <div key={filter.label} className="filter-group">
            <label className="filter-label">
              {filter.label}
            </label>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="filter-select"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="filter-reset"
      >
        <RotateCcw size={14} />
        Reset filters
      </button>
    </aside>
  );
};

export default FilterPanel;
