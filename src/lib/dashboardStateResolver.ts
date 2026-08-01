export enum DashboardState {
  FIRST_STREAM = "FIRST_STREAM",
  ACTIVE = "ACTIVE",
  ESTABLISHED = "ESTABLISHED",
  ADVANCED = "ADVANCED"
}

export function resolveDashboardState(completedSessionsCount: number): DashboardState {
  if (completedSessionsCount >= 20) {
    return DashboardState.ADVANCED;
  }
  if (completedSessionsCount >= 5) {
    return DashboardState.ESTABLISHED;
  }
  if (completedSessionsCount >= 1) {
    return DashboardState.ACTIVE;
  }
  return DashboardState.FIRST_STREAM;
}
