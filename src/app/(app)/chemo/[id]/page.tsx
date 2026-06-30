"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import {
  Trash2,
  TestTube2,
  Stethoscope,
  FileSignature,
  Syringe,
  Pill,
  LogOut,
  CheckCircle2,
  Clock,
  Play,
  Square,
  Plus,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getChemoSessionById,
  deleteChemoSession,
  updateChemoSession,
} from "@/lib/db/chemo";
import { getAllReports } from "@/lib/db/reports";
import { getAllParameters } from "@/lib/db/knowledge";
import { analyzeDischargeDocument } from "@/app/actions/ai";
import type {
  ChemoSession,
  ChemoSessionStatus,
  ChemoMedicine,
  MedicalReport,
  ParameterDef,
} from "@/types";
import { generateId } from "@/lib/db/db";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const STAGES: { id: ChemoSessionStatus; icon: any; label: string }[] = [
  { id: "scheduled", icon: Clock, label: "Scheduled" },
  { id: "blood_test_pending", icon: TestTube2, label: "Blood Test" },
  { id: "doctor_consult", icon: Stethoscope, label: "Doctor Consult" },
  { id: "approval_pending", icon: FileSignature, label: "Approval" },
  { id: "treatment_active", icon: Syringe, label: "Treatment" },
  { id: "discharge", icon: LogOut, label: "Discharge" },
  { id: "completed", icon: CheckCircle2, label: "Completed" },
];

export default function ChemoActiveTrackerPage() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<ChemoSession | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [kbParams, setKbParams] = useState<ParameterDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Local state for active inputs
  const [selectedReportId, setSelectedReportId] = useState("");
  const [doctorDecision, setDoctorDecision] = useState<
    "full" | "half" | "delay"
  >("full");
  const [consultNotes, setConsultNotes] = useState("");
  const [newMedName, setNewMedName] = useState("");
  const [newMedDuration, setNewMedDuration] = useState("");
  const [nextApptDate, setNextApptDate] = useState("");
  const [dischargeText, setDischargeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState("");
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<
    { role: "user" | "model"; text: string }[]
  >([]);

  useEffect(() => {
    Promise.all([getChemoSessionById(id), getAllReports(), getAllParameters()]).then(([s, r, p]) => {
      setSession(s ?? null);
      setReports(r);
      setKbParams(p);
      setLoading(false);
      if (s) {
        setSelectedReportId(s.cbcReportId || "");
        setDoctorDecision(s.doctorDecision || "full");
        setConsultNotes(s.consultNotes || "");
        setNextApptDate(s.nextAppointmentDate || "");
      }
    });
  }, [id, refreshTrigger]);

  if (loading)
    return (
      <AppShell showBack>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  if (!session)
    return (
      <AppShell showBack title="Not Found">
        <p className="text-center py-8 text-base-400">{t("common.noData")}</p>
      </AppShell>
    );

  const updateStatus = async (
    newStatus: ChemoSessionStatus,
    extraData: Partial<ChemoSession> = {},
  ) => {
    if (!session) return;
    await updateChemoSession(session.id, { status: newStatus, ...extraData });
    setRefreshTrigger((p) => p + 1);
  };

  const handleDelete = async () => {
    await deleteChemoSession(id);
    router.replace("/chemo");
  };

  const handleAddBottle = async () => {
    if (!session || !newMedName) return;
    const med: ChemoMedicine = {
      id: generateId(),
      name: newMedName,
      duration: newMedDuration,
      dosage: "",
      purpose: "",
      sideEffects: "",
      notes: "",
    };
    await updateChemoSession(session.id, {
      medicines: [...session.medicines, med],
    });
    setNewMedName("");
    setNewMedDuration("");
    setRefreshTrigger((p) => p + 1);
  };

  const toggleBottleTimer = async (medId: string) => {
    if (!session) return;
    const now = new Date().toISOString();
    const updatedMeds = session.medicines.map((m) => {
      if (m.id === medId) {
        if (!m.startTime) return { ...m, startTime: now };
        if (!m.endTime) return { ...m, endTime: now };
      }
      return m;
    });
    await updateChemoSession(session.id, { medicines: updatedMeds });
    setRefreshTrigger((p) => p + 1);
  };

  const handleAnalyzeDischarge = async (
    history: { role: "user" | "model"; text: string }[] = [],
  ) => {
    if (!session || !dischargeText.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeDischargeDocument(dischargeText, history);
      if (result) {
        if (result.type === "clarification_needed") {
          setClarificationQuestion(result.message);
          setAiChatHistory(
            history.concat({ role: "model", text: result.message }),
          );
        } else if (result.type === "success") {
          const data = result.data;
          const newMeds: ChemoMedicine[] = data.medicines.map((m) => ({
            id: generateId(),
            name: m.name,
            dosage: m.dosage,
            duration: m.duration,
            purpose: m.purpose,
            notes: m.notes,
            sideEffects: "",
          }));

          await updateChemoSession(session.id, {
            medicines: [...session.medicines, ...newMeds],
            notes: (session.notes ? session.notes + "\n\n" : "") + data.notes,
            nextAppointmentDate:
              data.nextAppointmentDate || session.nextAppointmentDate,
            nextAppointmentNotes:
              data.nextAppointmentNotes || session.nextAppointmentNotes,
            followUpTests: data.followUpTests || session.followUpTests,
          });

          if (data.nextAppointmentDate)
            setNextApptDate(data.nextAppointmentDate);

          setDischargeText(""); // Clear on success
          setClarificationQuestion("");
          setClarificationAnswer("");
          setAiChatHistory([]);
          setRefreshTrigger((p) => p + 1);
        }
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClarificationSubmit = async () => {
    if (!clarificationAnswer.trim()) return;
    const newHistory = aiChatHistory.concat({
      role: "user",
      text: clarificationAnswer,
    });
    setAiChatHistory(newHistory);
    setClarificationAnswer("");
    await handleAnalyzeDischarge(newHistory);
  };

  // UI Helpers
  const currentStageIndex = STAGES.findIndex((s) => s.id === session.status);
  const inputCls =
    "w-full px-4 py-3 bg-base-50 dark:bg-dark-base-200 border border-base-200 dark:border-dark-base-200 rounded-xl text-sm outline-none focus:border-primary-500 transition-colors";

  return (
    <AppShell
      title={`Cycle ${session.cycleNumber} Tracker`}
      showBack
      rightAction={
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-danger-50 transition-colors"
        >
          <Trash2 size={18} className="text-danger-500" />
        </button>
      }
    >
      <div className="space-y-6 pb-24">
        {/* Timeline Header */}
        <div className="card-elevated flex items-center justify-between overflow-x-auto gap-2 py-4 px-2 custom-scrollbar">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isActive = currentStageIndex === idx;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center gap-1 min-w-[60px] opacity-100 shrink-0"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? "bg-primary-500 border-primary-500 text-white"
                      : isActive
                        ? "bg-primary-100 border-primary-500 text-primary-700 shadow-md shadow-primary-500/20"
                        : "bg-base-100 border-base-200 text-base-300"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[10px] font-bold text-center ${isActive ? "text-primary-600" : "text-base-400"}`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ACTIVE STAGE CONTENT */}

        {/* 1. Scheduled */}
        {session.status === "scheduled" && (
          <div className="card-elevated space-y-4 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="text-primary-500" /> Start Session
            </h2>
            <p className="text-sm text-base-600">
              Arrived at {session.hospital}? Start the session flow.
            </p>
            <button
              onClick={() => updateStatus("blood_test_pending")}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold"
            >
              Start Hospital Visit
            </button>
          </div>
        )}

        {/* 2. Blood Test */}
        {session.status === "blood_test_pending" && (
          <div className="card-elevated space-y-4 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TestTube2 className="text-primary-500" /> Blood Test (CBC)
            </h2>
            <p className="text-sm text-base-600">
              Provide blood for CBC report. Once you've added the CBC to your
              reports, link it here:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-base-500 uppercase">
                Link Report (Optional)
              </label>
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className={inputCls}
              >
                <option value="">No report linked</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reportDate} - {r.hospitalName} ({r.format})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() =>
                updateStatus("doctor_consult", {
                  cbcReportId: selectedReportId || undefined,
                })
              }
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold mt-2"
            >
              Results Received - Go to Doctor
            </button>
          </div>
        )}

        {/* 3. Doctor Consult */}
        {session.status === "doctor_consult" && (
          <div className="card-elevated space-y-4 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Stethoscope className="text-primary-500" /> Doctor Meeting
            </h2>
            <p className="text-sm text-base-600 mb-2">
              Based on the CBC, what is the doctor's decision?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDoctorDecision("full")}
                className={`flex-1 py-2 rounded-lg font-bold text-sm border-2 ${doctorDecision === "full" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-base-200 text-base-500"}`}
              >
                Full Chemo
              </button>
              <button
                onClick={() => setDoctorDecision("half")}
                className={`flex-1 py-2 rounded-lg font-bold text-sm border-2 ${doctorDecision === "half" ? "border-warning-500 bg-warning-50 text-warning-700" : "border-base-200 text-base-500"}`}
              >
                Half Chemo
              </button>
              <button
                onClick={() => setDoctorDecision("delay")}
                className={`flex-1 py-2 rounded-lg font-bold text-sm border-2 ${doctorDecision === "delay" ? "border-danger-500 bg-danger-50 text-danger-700" : "border-base-200 text-base-500"}`}
              >
                Delay
              </button>
            </div>

            <textarea
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              placeholder="Doctor's notes or instructions..."
              className={inputCls}
              rows={2}
            />

            <button
              onClick={() =>
                updateStatus(
                  doctorDecision === "delay" ? "delayed" : "approval_pending",
                  { doctorDecision, consultNotes },
                )
              }
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold"
            >
              {doctorDecision === "delay"
                ? "End & Delay Session"
                : "Proceed to Approval"}
            </button>
          </div>
        )}

        {/* 4. Approval Pending */}
        {session.status === "approval_pending" && (
          <div className="card-elevated space-y-4 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileSignature className="text-primary-500" /> Chemo Approval
            </h2>
            <p className="text-sm text-base-600">
              Waiting for hospital administration / insurance approval for the
              chemo drugs.
            </p>
            <button
              onClick={() => updateStatus("treatment_active")}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold"
            >
              Approval Received - Go to Nursing
            </button>
          </div>
        )}

        {/* 5. Treatment Active */}
        {session.status === "treatment_active" && (
          <div className="card-elevated space-y-4 animate-in fade-in zoom-in-95 border-2 border-primary-200">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Syringe className="text-primary-500" /> Active Treatment
            </h2>
            <p className="text-sm text-base-600">
              Nurse is preparing and administering IV bottles.
            </p>

            <div className="space-y-3">
              {session.medicines.map((med) => (
                <div
                  key={med.id}
                  className="p-3 bg-base-50 dark:bg-dark-base-200 rounded-xl border border-base-200 flex items-center justify-between"
                >
                  <div>
                    {(() => {
                      const kbMatch = kbParams.find((p) => 
                        p.name.toLowerCase() === med.name.toLowerCase() || 
                        (p.nameGu && p.nameGu.toLowerCase() === med.name.toLowerCase()) ||
                        p.alternativeNames.some(a => a.toLowerCase() === med.name.toLowerCase())
                      );
                      if (kbMatch) {
                        return (
                          <Link href={`/knowledge/${kbMatch.id}`} className="font-bold text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1.5 transition-colors">
                            <BookOpen size={14} className="shrink-0" />
                            {med.name}
                          </Link>
                        );
                      }
                      return <p className="font-bold text-base-900">{med.name}</p>;
                    })()}
                    <p className="text-xs text-base-500">
                      Duration: {med.duration || "N/A"}
                    </p>
                    {med.startTime && (
                      <p className="text-xs text-primary-600 font-mono">
                        Started:{" "}
                        {new Date(med.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {med.endTime && (
                      <p className="text-xs text-success-600 font-mono">
                        Finished:{" "}
                        {new Date(med.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleBottleTimer(med.id)}
                    disabled={!!med.endTime}
                    className={`p-3 rounded-full ${med.endTime ? "bg-success-100 text-success-600" : med.startTime ? "bg-warning-100 text-warning-600 animate-pulse" : "bg-primary-100 text-primary-600"}`}
                  >
                    {med.endTime ? (
                      <CheckCircle2 size={24} />
                    ) : med.startTime ? (
                      <Square size={24} />
                    ) : (
                      <Play size={24} fill="currentColor" />
                    )}
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="Bottle/Drug Name"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm"
                />
                <input
                  value={newMedDuration}
                  onChange={(e) => setNewMedDuration(e.target.value)}
                  placeholder="Duration (e.g. 1hr)"
                  className="w-24 px-3 py-2 rounded-lg border text-sm"
                />
                <button
                  onClick={handleAddBottle}
                  className="p-2 bg-base-200 rounded-lg"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <button
              onClick={() => updateStatus("discharge")}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold mt-4"
            >
              All Bottles Finished - Go to Discharge
            </button>
          </div>
        )}

        {/* 6. Discharge */}
        {session.status === "discharge" && (
          <div className="card-elevated space-y-4 animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <LogOut className="text-primary-500" /> Discharge Process
            </h2>

            <div className="p-4 bg-linear-to-br from-primary-50 to-white dark:from-dark-primary-200 dark:to-dark-base-100 border border-primary-200 dark:border-dark-primary-300 rounded-xl">
              <h3 className="font-bold text-primary-800 dark:text-dark-primary-700 flex items-center gap-2 mb-2">
                ✨ Magic Extract Discharge
              </h3>
              <p className="text-xs text-primary-700 dark:text-dark-primary-600 mb-3">
                Paste the text from your hospital discharge document below. AI
                will automatically extract the process details, medicines given,
                and next appointment!
              </p>

              {clarificationQuestion ? (
                <div className="bg-warning-50 border border-warning-200 rounded-xl p-3 mb-3">
                  <p className="text-sm font-bold text-warning-800 mb-2">
                    Wait, I need clarification:
                  </p>
                  <p className="text-sm text-warning-900 mb-3">
                    {clarificationQuestion}
                  </p>
                  <textarea
                    value={clarificationAnswer}
                    onChange={(e) => setClarificationAnswer(e.target.value)}
                    className={`${inputCls} min-h-[80px] mb-2`}
                    placeholder="Provide context or answer here..."
                  />
                  <button
                    onClick={handleClarificationSubmit}
                    disabled={isAnalyzing || !clarificationAnswer.trim()}
                    className="w-full py-2 bg-warning-500 text-white rounded-lg font-bold text-sm disabled:opacity-50"
                  >
                    {isAnalyzing ? "Analyzing..." : "Submit Answer"}
                  </button>
                </div>
              ) : (
                <>
                  <textarea
                    value={dischargeText}
                    onChange={(e) => setDischargeText(e.target.value)}
                    placeholder="Paste discharge document text here..."
                    className={`${inputCls} min-h-[120px] mb-3`}
                  />
                  <button
                    onClick={() => handleAnalyzeDischarge([])}
                    disabled={isAnalyzing || !dischargeText.trim()}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {isAnalyzing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                  </button>
                </>
              )}
            </div>

            <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-xl">
              <h3 className="font-bold text-secondary-800 flex items-center gap-2">
                <Pill size={16} /> Home Medicines
              </h3>
              <p className="text-sm text-secondary-700 my-2">
                Did the nurse provide tablets to eat at home?
              </p>
              <button
                onClick={() => router.push("/medicines/add")}
                className="px-4 py-2 bg-secondary-500 text-white text-sm font-bold rounded-lg"
              >
                + Add Home Medicines to Reminders
              </button>
            </div>

            {session.doctorDecision === "half" && (
              <div className="p-3 bg-warning-50 border border-warning-200 rounded-xl">
                <h3 className="font-bold text-warning-800">
                  Second Half Needed
                </h3>
                <p className="text-sm text-warning-700 my-2">
                  Doctor decided on a half-dose. Schedule the second half now.
                </p>
                <button
                  onClick={() =>
                    router.push(`/chemo/add?cycle=${session.cycleNumber}`)
                  }
                  className="px-4 py-2 bg-warning-500 text-white text-sm font-bold rounded-lg"
                >
                  Schedule 2nd Half Session
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-base-500 uppercase">
                Next Appointment Date
              </label>
              <input
                type="date"
                value={nextApptDate}
                onChange={(e) => setNextApptDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              onClick={() =>
                updateStatus("completed", {
                  nextAppointmentDate: nextApptDate,
                  homeMedicinesPrescribed: true,
                })
              }
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold"
            >
              Complete & Go Home
            </button>
          </div>
        )}

        {/* 7. Completed / Delayed */}
        {(session.status === "completed" || session.status === "delayed") && (
          <div className="card-elevated text-center space-y-2 py-8">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${session.status === "completed" ? "bg-success-100 text-success-500" : "bg-danger-100 text-danger-500"}`}
            >
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold">
              Session {session.status === "completed" ? "Completed" : "Delayed"}
            </h2>
            <p className="text-sm text-base-500">
              {session.status === "completed"
                ? "Great job today. Rest well at home."
                : "Session delayed per doctor's orders."}
            </p>
          </div>
        )}
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white dark:bg-dark-base-100 rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-semibold mb-4">
              {language === "gu" ? "આ સત્ર ભૂંસો?" : "Delete this session?"}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-3 bg-base-100 dark:bg-dark-base-200 rounded-xl text-sm font-medium"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-danger-500 text-white rounded-xl text-sm font-medium"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
