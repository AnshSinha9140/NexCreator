export type HealthStatus = "Healthy" | "Warning" | "Critical";

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  message: string;
  available: boolean;
}

export interface AdminSystemHealth {
  overallStatus: HealthStatus;
  overallScore: number;
  components: ComponentHealth[];
  explanations: string[];
}

export interface AdminOverviewMetrics {
  totalCreators: number;
  approvedCreators: number;
  pendingVerifications: number;
  currentlyLive: number;
  todaysNewCreators: number;
  aiRequestsToday: number;
  systemUptime: string;
  errorsToday: number;
}

export interface AdminCreatorSummary {
  total: number;
  verified: number;
  pending: number;
  todayNew: number;
  recentCreators: Array<{
    id: string;
    email: string;
    displayName: string;
    status: string;
    createdAt: string;
  }>;
}

export interface AdminVerificationSection {
  pendingCount: number;
  pendingCreators: Array<{
    id: string;
    email: string;
    displayName: string;
    appliedAt: string;
    platform: string;
  }>;
}

export interface AdminLiveSessionsSection {
  activeCount: number;
  totalToday: number;
  sessions: Array<{
    id: string;
    creatorEmail: string;
    platform: string;
    streamTitle: string;
    currentViewers: number;
    startedAt: string;
    status: string;
  }>;
}

export interface AdminCollectorsSection {
  activeCount: number;
  status: HealthStatus;
  items: Array<{
    name: string;
    platform: string;
    status: string;
    activeSessions: number;
  }>;
}

export interface AdminWorkersSection {
  activeCount: number;
  status: HealthStatus;
  latencyMs: number;
  activeProvider: string;
}

export interface AdminQueueItem {
  name: string;
  pending: number;
  active: number;
  completed: number;
  failed: number;
  status: string;
}

export interface AdminQueuesSection {
  totalPending: number;
  activeJobs: number;
  queues: AdminQueueItem[];
}

export interface AdminMongoDbSection {
  status: HealthStatus;
  latencyMs: number;
  collections: Record<string, number>;
}

export interface AdminNotificationsSection {
  unreadCount: number;
  alertsCount: number;
  items: Array<{
    id: string;
    type: string;
    message: string;
    read: boolean;
    timestamp: string;
  }>;
}

export interface AdminFeatureFlagsSection {
  count: number;
  activeFlags: Record<string, boolean>;
}

export interface AdminAiOperationsSection {
  requestsToday: number;
  avgLatencyMs: number;
  loadPercentage: string;
  fallbackCount: number;
  activeProvider: string;
  hourlyThroughput: Array<{ label: string; value: number }>;
}

export interface AdminCostsSection {
  estimatedCostToday: number;
  currency: string;
  breakdownByProvider: Record<string, number>;
}

export interface AdminAlertsSection {
  unreadAlertsCount: number;
  activeAlerts: Array<{
    id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    message: string;
    timestamp: string;
  }>;
}

export interface AdminAuditSection {
  recentActivity: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: string;
  }>;
}

export interface AdminTelemetrySection {
  bufferSize: number;
  totalMessagesProcessed: number;
  totalSnapshots: number;
}

export interface AdminDashboardBundle {
  systemHealth: AdminSystemHealth;
  overview: AdminOverviewMetrics;
  creators: AdminCreatorSummary;
  verification: AdminVerificationSection;
  liveSessions: AdminLiveSessionsSection;
  collectors: AdminCollectorsSection;
  workers: AdminWorkersSection;
  queues: AdminQueuesSection;
  mongodb: AdminMongoDbSection;
  notifications: AdminNotificationsSection;
  featureFlags: AdminFeatureFlagsSection;
  aiOperations: AdminAiOperationsSection;
  costs: AdminCostsSection;
  alerts: AdminAlertsSection;
  audit: AdminAuditSection;
  telemetry: AdminTelemetrySection;

  metadata: {
    generatedAt: string;
    buildDurationMs: number;
    isPartial: boolean;
    errors: string[];
  };
}

export interface AdminDebugDiagnostics {
  buildTimeMs: number;
  queryCount: number;
  collectionsQueried: string[];
  bundleSizeBytes: number;
  pollingStatus: "active" | "idle" | "error";
  refreshDurationMs: number;
  mongoDbStatus: HealthStatus;
  collectorStatus: HealthStatus;
  workerStatus: HealthStatus;
  queueStatus: HealthStatus;
  errors: string[];
  warnings: string[];
  cacheStatus: string;
  lastRefreshTimestamp: string;
}
