"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface DynamicListInputProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export default function DynamicListInput({
  label,
  value,
  onChange,
  placeholder = "Add item...",
  suggestions = [],
}: DynamicListInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAdd = (itemToAdd: string) => {
    const trimmed = itemToAdd.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const handleRemove = (itemToRemove: string) => {
    onChange(value.filter((item) => item !== itemToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
        handleAdd(filteredSuggestions[activeIndex]);
      } else {
        handleAdd(inputValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showSuggestions) {
        setActiveIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else {
        setShowSuggestions(true);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (showSuggestions) {
        setActiveIndex((prev) => (prev > -1 ? prev - 1 : prev));
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const inputCls =
    "flex-1 px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";
  const labelCls =
    "text-xs font-bold text-base-500 dark:text-dark-base-500 block mb-1.5 uppercase tracking-wide";

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      {label && <label className={labelCls}>{label}</label>}
      
      <div className="flex gap-2 relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full ${inputCls}`}
          />
          {showSuggestions && inputValue.trim().length > 0 && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-base-100 border border-base-200 dark:border-dark-base-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleAdd(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    index === activeIndex
                      ? "bg-primary-50 dark:bg-dark-primary-100 text-primary-700 dark:text-dark-primary-700"
                      : "text-base-700 dark:text-dark-base-700 hover:bg-base-50 dark:hover:bg-dark-base-200"
                  }`}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={() => handleAdd(inputValue)}
          disabled={!inputValue.trim()}
          className="px-4 py-3 bg-primary-100 dark:bg-dark-primary-100 text-primary-700 dark:text-dark-primary-700 rounded-xl font-bold hover:bg-primary-200 dark:hover:bg-dark-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
