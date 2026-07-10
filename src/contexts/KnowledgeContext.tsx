"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllEntities } from "@/lib/db/knowledge";
import type { MedicalEntity } from "@/types";

interface KnowledgeContextType {
  parameters: MedicalEntity[];
  knownTerms: string[];
  refreshKnowledge: () => Promise<void>;
  loading: boolean;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [parameters, setParameters] = useState<MedicalEntity[]>([]);
  const [knownTerms, setKnownTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshKnowledge = async () => {
    try {
      setLoading(true);
      const data = await getAllEntities();
      setParameters(data);
      const terms = new Set<string>();
      data.forEach(p => {
        terms.add(p.name.toLowerCase().trim());
        if (p.nameGu) terms.add(p.nameGu.toLowerCase().trim());
        p.alternativeNames?.forEach(alt => terms.add(alt.toLowerCase().trim()));
      });
      setKnownTerms(Array.from(terms));
    } catch (e) {
      console.error("Failed to load parameters", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshKnowledge();
  }, []);

  return (
    <KnowledgeContext.Provider
      value={{
        parameters,
        knownTerms,
        refreshKnowledge,
        loading,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledgeContext() {
  const context = useContext(KnowledgeContext);
  if (context === undefined) {
    throw new Error("useKnowledgeContext must be used within a KnowledgeProvider");
  }
  return context;
}
