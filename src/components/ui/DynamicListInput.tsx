"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface DynamicListInputProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  // Future proofing for graph-based autocomplete
  suggestions?: string[];
}

export default function DynamicListInput({
  label,
  value,
  onChange,
  placeholder = "Add item...",
  suggestions,
}: DynamicListInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
  };

  const handleRemove = (itemToRemove: string) => {
    onChange(value.filter((item) => item !== itemToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const inputCls =
    "flex-1 px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls =
    "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  return (
    <div className="space-y-2">
      {label && <label className={labelCls}>{label}</label>}
      
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputCls}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="px-4 py-3 bg-primary-100 dark:bg-dark-primary-100 text-primary-700 dark:text-dark-primary-700 rounded-xl font-bold hover:bg-primary-200 dark:hover:bg-dark-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-base-100 dark:bg-dark-base-200 border border-base-200 dark:border-dark-base-300 rounded-full text-sm font-medium text-base-700 dark:text-dark-base-700"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="text-base-400 hover:text-red-500 transition-colors"
                aria-label={`Remove ${item}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
