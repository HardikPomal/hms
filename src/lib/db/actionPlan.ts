import { getDB } from "./db";

export interface ActionPlanItemStatus {
  itemId: string;
  category: string; // "food", "exercise", "treatment", "medicine", "general"
  status: "pending" | "taken" | "declined";
}

export interface ActionPlanState {
  generatedAt: string;
  latestReportId: string | null;
  items: ActionPlanItemStatus[];
  trackingDate: string;
  version?: string;
}

const ACTION_PLAN_KEY = "action_plan_state";

export async function getActionPlanState(): Promise<ActionPlanState | null> {
  const db = await getDB();
  const data = await db.get("settings", ACTION_PLAN_KEY);
  if (!data) return null;
  
  // Migration for old schema
  const plan = data.value as any;
  if (plan.foodStatuses && !plan.items) {
    plan.items = plan.foodStatuses.map((f: any) => ({
      itemId: f.foodId,
      category: "food",
      status: f.status
    }));
    delete plan.foodStatuses;
  }
  
  return plan as ActionPlanState;
}

export async function saveActionPlanState(state: ActionPlanState): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key: ACTION_PLAN_KEY, value: state });
}

export async function markActionPlanItem(itemId: string, status: "pending" | "taken" | "declined"): Promise<ActionPlanState | null> {
  const state = await getActionPlanState();
  if (!state) return null;
  const item = state.items.find(i => i.itemId === itemId);
  if (item) {
    item.status = status;
  }
  await saveActionPlanState(state);
  return state;
}
