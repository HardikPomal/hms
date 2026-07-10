/**
 * Parses the rich description format used in the knowledge base.
 * Content is wrapped in <en>...</en> and <gu>...</gu> XML tags.
 * Inside, markdown-lite formatting is used: ### for headings, - for bullets.
 */

interface RichDescriptionProps {
  text: string;
  language?: string;
  className?: string;
}

function extractSection(raw: string, lang: string): string {
  const tag = lang === "gu" ? "gu" : "en";
  const match = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (match) return match[1].trim();
  // Fallback: try English
  const enMatch = raw.match(/<en>([\s\S]*?)<\/en>/i);
  if (enMatch) return enMatch[1].trim();
  // Final fallback: strip all tags
  return raw.replace(/<[^>]+>/g, "").trim();
}

function parseMarkdownLite(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("### ")) {
      nodes.push(
        <h4
          key={i}
          className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-dark-primary-500 mt-4 mb-1 first:mt-0"
        >
          {line.replace(/^###\s+/, "")}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={i} className="text-sm font-bold text-base-800 dark:text-dark-base-800 mt-3 mb-1">
          {line.replace(/^##\s+/, "")}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      nodes.push(
        <div key={i} className="flex gap-2 text-sm text-base-700 dark:text-dark-base-600 leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-400 dark:bg-dark-primary-400 shrink-0" />
          <span>{line.replace(/^-\s+/, "")}</span>
        </div>
      );
    } else if (line.trim() === "") {
      // small spacer for blank lines (only between content blocks)
      if (i > 0 && i < lines.length - 1) {
        nodes.push(<div key={i} className="h-1" />);
      }
    } else {
      nodes.push(
        <p key={i} className="text-sm text-base-700 dark:text-dark-base-600 leading-relaxed">
          {line}
        </p>
      );
    }

    i++;
  }

  return nodes;
}

import React from "react";

export default function RichDescription({ text, language = "en", className = "" }: RichDescriptionProps) {
  if (!text) return null;
  const section = extractSection(text, language);
  const nodes = parseMarkdownLite(section);
  return <div className={`space-y-0.5 ${className}`}>{nodes}</div>;
}
