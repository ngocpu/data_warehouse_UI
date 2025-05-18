import React from 'react';

interface Filter {
  dimension: string;
  value: string | number;
}

interface OlapFilterProps {
  filters: Filter[];
  dimensions: { dimension: string }[];
  onAddFilter: () => void;
  onRemoveFilter: (index: number) => void;
  onFilterChange: (index: number, field: 'dimension' | 'value', value: string) => void;
}

const OlapFilter: React.FC<OlapFilterProps> = ({
  filters,
  dimensions,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
}) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">Bộ lọc</label>
      
      {filters.map((filter, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div className="flex-1">
            <select
              className="w-full border rounded-md p-2"
              value={filter.dimension}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFilterChange(index, 'dimension', e.currentTarget.value)}
            >
              <option value="">Chọn chiều</option>
              {dimensions.map((dim, idx) => (
                <option key={idx} value={dim.dimension}>
                  {dim.dimension}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <input
              type="text"
              className="w-full border rounded-md p-2"
              value={filter.value.toString()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterChange(index, 'value', e.currentTarget.value)}
              placeholder="Giá trị"
            />
          </div>
          
          <button
            className="px-3 py-2 bg-red-500 text-white rounded"
            onClick={() => onRemoveFilter(index)}
            disabled={filters.length <= 1}
            type="button"
          >
            X
          </button>
        </div>
      ))}
      
      <button
        className="px-3 py-2 bg-blue-500 text-white rounded"
        onClick={onAddFilter}
        type="button"
      >
        Thêm bộ lọc
      </button>
    </div>
  );
};

export default OlapFilter; 