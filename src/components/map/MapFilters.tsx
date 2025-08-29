import React, { useState } from "react";
import allComp from "../../assets/icons/categories/map_categories/location.svg";
import allComp_white from "../../assets/icons/categories/map_categories/location_white.svg";
import general from "../../assets/icons/categories/map_categories/general.svg";
import gen_white from "../../assets/icons/categories/map_categories/general_white.svg";
import recycle from "../../assets/icons/categories/map_categories/recycle.svg";
import rec_white from "../../assets/icons/categories/map_categories/recycle_white.svg";
import food from "../../assets/icons/categories/map_categories/food.svg";
import food_white from "../../assets/icons/categories/map_categories/food_white.svg";
import others from "../../assets/icons/categories/map_categories/others.svg";
import oth_white from "../../assets/icons/categories/map_categories/others_white.svg";
import attention from "../../assets/icons/categories/map_categories/attention.svg";
import att_white from "../../assets/icons/categories/map_categories/attention_white.svg";
import DateRangePicker from "../common/DateRangePicker";
import type { DateRange } from "react-day-picker";

interface MapFiltersProps {
  sidebarOpen: boolean;
  // onFilterChange: (filter: FilterOptions) => void;
  // isLoading?: boolean;
}

// interface FilterOptions {
//   category?: 'food' | 'recycle' | 'general' | 'other';
//   dateRange?: {
//     start: Date;
//     end: Date;
//   };
//   area?: string;
//   status?: 'active' | 'resolved' | 'pending';
// }

const filterOptions = [
  {
    id: "all",
    label: "전체 민원 표시",
    icon: allComp,
    iconWhite: allComp_white,
  },
  { id: "general", label: "일반", icon: general, iconWhite: gen_white },
  { id: "recycle", label: "재활용", icon: recycle, iconWhite: rec_white },
  { id: "food", label: "음식물", icon: food, iconWhite: food_white },
  { id: "others", label: "기타", icon: others, iconWhite: oth_white },
  { id: "bad", label: "반복민원", icon: attention, iconWhite: att_white },
];

const MapFilters: React.FC<MapFiltersProps> = ({ sidebarOpen }) => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div
      className={`fixed top-4 z-50 ${sidebarOpen ? "left-[36rem]" : "left-24"}`}
    >
      <div className="flex gap-2 mb-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            className={`flex gap-x-2 border border-d9d9d9 rounded-full shadow-md font-semibold ${selectedFilter === option.id ? "bg-darker-green text-white" : "bg-white"}`}
            onClick={() => setSelectedFilter(option.id)}
          >
            <img
              src={
                selectedFilter === option.id ? option.iconWhite : option.icon
              }
              alt={`${option.label} 필터`}
            />
            {option.label}
          </button>
        ))}
      </div>
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        containerClassName="border border-d9d9d9 rounded-full px-4 py-1 bg-white shadow-md"
      />
    </div>
  );
};

export default MapFilters;
