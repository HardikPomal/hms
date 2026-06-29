import { useState } from "react";
import { Info, HelpCircle, BookOpen } from "lucide-react";
import { useKnowledgeContext } from "@/contexts/KnowledgeContext";
import QuickViewKnowledge from "./QuickViewKnowledge";
import QuickAddKnowledge from "./QuickAddKnowledge";
import Link from "next/link";

interface KnowledgeLinkProps {
  term: string;
  fallback?: React.ReactNode;
}

export default function KnowledgeLink({ term, fallback }: KnowledgeLinkProps) {
  const { parameters, knownTerms, refreshKnowledge } = useKnowledgeContext();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const termLower = term.toLowerCase().trim();
  const isKnown = knownTerms.includes(termLower);
  const parameter = parameters.find((p) => p.name.toLowerCase().trim() === termLower) || null;

  if (!isKnown) {
    return (
      <>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-base-500 hover:text-base-700 transition-colors group text-left"
          title="Knowledge Missing. Click to add."
        >
          <span>{fallback || term}</span>
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-base-200 text-base-500 group-hover:bg-base-300">
            <HelpCircle size={10} />
          </span>
        </button>

        <QuickAddKnowledge
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          initialTitle={term}
          onSuccess={() => {
            setIsAddModalOpen(false);
            refreshKnowledge();
          }}
        />
      </>
    );
  }

  const status = parameter?.knowledgeStatus || "unknown";

  if (status === "advanced") {
    return (
      <Link
        href={`/knowledge/${parameter?.id}`}
        className="inline-flex items-center gap-1.5 text-success-600 dark:text-dark-success-500 font-bold hover:text-success-700 transition-colors group text-left"
        title="Advanced Knowledge available"
      >
        <span className="border-b-2 border-dashed border-success-300 dark:border-dark-success-300 group-hover:border-success-500 transition-colors">
          {term}
        </span>
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-success-100 text-success-600">
          <BookOpen size={10} />
        </span>
      </Link>
    );
  }

  // Basic knowledge (status === "basic" or "unknown" but parameter exists)
  return (
    <>
      <button
        onClick={() => setIsViewModalOpen(true)}
        className="inline-flex items-center gap-1.5 text-warning-600 dark:text-warning-500 font-bold hover:text-warning-700 transition-colors group text-left"
        title="Basic Knowledge available"
      >
        <span className="border-b-2 border-dashed border-warning-300 group-hover:border-warning-500 transition-colors">
          {term}
        </span>
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-warning-100 text-warning-600">
          <Info size={10} />
        </span>
      </button>

      {parameter && (
        <QuickViewKnowledge
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          parameter={parameter}
        />
      )}
    </>
  );
}
