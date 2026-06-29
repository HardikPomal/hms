import { getDB } from "./db";

export interface ActionPlanFoodStatus {
  foodId: string;
  status: "pending" | "taken" | "declined";
}

export interface ActionPlanState {
  generatedAt: string;
  latestReportId: string | null;
  foodStatuses: ActionPlanFoodStatus[];
  trackingDate: string;
}

const ACTION_PLAN_KEY = "action_plan_state";

export async function getActionPlanState(): Promise<ActionPlanState | null> {
  const db = await getDB();
  const data = await db.get("settings", ACTION_PLAN_KEY);
  if (!data) return null;
  return data.value as ActionPlanState;
}

export async function saveActionPlanState(state: ActionPlanState): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key: ACTION_PLAN_KEY, value: state });
}

export async function markActionPlanFood(foodId: string, status: "pending" | "taken" | "declined"): Promise<ActionPlanState | null> {
  const state = await getActionPlanState();
  if (!state) return null;
  const food = state.foodStatuses.find(f => f.foodId === foodId);
  if (food) {
    food.status = status;
  }
  await saveActionPlanState(state);
  return state;
}
