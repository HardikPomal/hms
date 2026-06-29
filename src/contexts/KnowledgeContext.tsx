"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllParameters } from "@/lib/db/knowledge";
import type { ParameterDef } from "@/types";

interface KnowledgeContextType {
  parameters: ParameterDef[];
  knownTerms: string[];
  refreshKnowledge: () => Promise<void>;
  loading: boolean;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [parameters, setParameters] = useState<ParameterDef[]>([]);
  const [knownTerms, setKnownTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshKnowledge = async () => {
    try {
      setLoading(true);
      const data = await getAllParameters();
      setParameters(data);
      setKnownTerms(data.map((p) => p.name.toLowerCase().trim()));
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
