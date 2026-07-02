"use client";

import { Sparkles } from "lucide-react";

interface GenericMarkdownFormProps {
  notes: string;
  onChange: (notes: string) => void;
}

export default function GenericMarkdownForm({
  notes,
  onChange,
}: GenericMarkdownFormProps) {
  const inputCls =
    "w-full px-4 py-3 bg-white dark:bg-dark-base-100 border-2 border-base-200 dark:border-dark-base-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 transition-colors";

  return (
    <div className="card-elevated relative overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-primary-50/50 to-transparent dark:from-dark-primary-100/50 pointer-events-none" />

      <div className="relative space-y-4">
        <h3 className="font-bold text-primary-700 dark:text-dark-primary-600 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Sparkles size={16} />
          Your Notes (Markdown Supported) *
        </h3>

        <p className="text-sm text-base-600 dark:text-dark-base-500 leading-relaxed">
          Paste your detailed research, textbook excerpts, or articles here.
          The AI will read these notes, format them beautifully, and
          automatically extract medical relationships for your Brain graph.
        </p>

        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Hemoglobin\n\nHemoglobin is a complex protein...\n\n### Normal Ranges\n- Men: 13.5-17.5 g/dL"
          className={`${inputCls} min-h-[250px] font-mono text-sm leading-relaxed`}
        />
      </div>
    </div>
  );
}
