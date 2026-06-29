"use client";

import { useState, useRef } from "react";
import { Upload, Camera, FileText, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FileUploadProps {
  onFileLoad: (data: string, name: string, type: string) => void;
  currentFile?: { name: string; type: string } | null;
  onClear?: () => void;
}

export default function FileUpload({
  onFileLoad,
  currentFile,
  onClear,
}: FileUploadProps) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const fileType = file.type.startsWith("image") ? "image" : "pdf";
        onFileLoad(data, file.name, fileType);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setLoading(false);
    }
  };

  if (currentFile) {
    return (
      <div className="flex items-center gap-3 p-3 bg-success-50 dark:bg-dark-success-100 border border-success-200 dark:border-dark-success-200 rounded-xl">
        <FileText
          size={20}
          className="text-success-600 dark:text-dark-success-600 shrink-0"
        />
        <span className="text-sm text-success-700 dark:text-dark-success-700 flex-1 truncate">
          {currentFile.name}
        </span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 p-1 hover:bg-success-200 dark:hover:bg-dark-success-200 rounded-lg transition-colors"
          >
            <X size={16} className="text-success-600" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-base-100 dark:bg-dark-base-200 border border-base-200 dark:border-dark-base-200 rounded-xl hover:border-primary-400 dark:hover:border-dark-primary-400 transition-colors"
      >
        <Upload size={18} className="text-base-500" />
        <span className="text-sm font-medium text-base-700 dark:text-dark-base-700">
          {t("reports.chooseFile")}
        </span>
      </button>

      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-base-100 dark:bg-dark-base-200 border border-base-200 dark:border-dark-base-200 rounded-xl hover:border-primary-400 dark:hover:border-dark-primary-400 transition-colors"
      >
        <Camera size={18} className="text-base-500" />
        <span className="text-sm font-medium text-base-700 dark:text-dark-base-700">
          {t("reports.takePhoto")}
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}
