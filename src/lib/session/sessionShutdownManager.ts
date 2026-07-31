import clientPromise from "@/lib/mongodb";
import { SessionFinalizer } from "./finalizer";
import { SessionFinalizationValidator, FinalizationValidationResult } from "./sessionFinalizationValidator";
import { TimelinePublisher } from "@/lib/timeline/publisher";

export type SessionShutdownReason =
  | "CreatorRequested"
  | "AdminRequested"
  | "StreamEnded"
  | "CollectorTimeout"
  | "PlatformDisconnected"
  | "FatalError";

export type FinalizationStep =
  | "IDLE"
  | "STOPPING"
  | "FREEZING_COLLECTOR"
  | "FLUSHING_BUFFER"
  | "CREATING_FINAL_SNAPSHOT"
  | "RUNNING_AI_PRODUCER"
  | "GENERATING_INTELLIGENCE"
  | "BUILDING_BUNDLE"
  | "VALIDATING_BUNDLE"
  | "PERSISTING_BUNDLE"
  | "MARKING_COMPLETED"
  | "COMPLETED"
  | "FAILED";

export interface FinalizationStateTelemetry {
  sessionId: string;
  shutdownReason: SessionShutdownReason;
  currentStep: FinalizationStep;
  progressPct: number;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  bufferFlushed: boolean;
  finalSnapshotCreated: boolean;
  bundleBuilt: boolean;
  bundlePersisted: boolean;
  validationResult: FinalizationValidationResult | null;
  error: string | null;
}

class SessionShutdownManagerRegistry {
  private activeShutdowns: Map<string, FinalizationStateTelemetry> = new Map();

  public getTelemetry(sessionId?: string): FinalizationStateTelemetry | FinalizationStateTelemetry[] {
    if (sessionId) {
      return this.activeShutdowns.get(sessionId) || {
        sessionId,
        shutdownReason: "CreatorRequested",
        currentStep: "IDLE",
        progressPct: 0,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        bufferFlushed: false,
        finalSnapshotCreated: false,
        bundleBuilt: false,
        bundlePersisted: false,
        validationResult: null,
        error: null,
      };
    }
    return Array.from(this.activeShutdowns.values());
  }

  public async shutdownSession(
    sessionId: string,
    reason: SessionShutdownReason = "CreatorRequested"
  ): Promise<{ success: boolean; summary?: any; validation?: FinalizationValidationResult; error?: string }> {
    const nowIso = new Date().toISOString();

    const telemetry: FinalizationStateTelemetry = {
      sessionId,
      shutdownReason: reason,
      currentStep: "STOPPING",
      progressPct: 10,
      startedAt: nowIso,
      updatedAt: nowIso,
      completedAt: null,
      bufferFlushed: false,
      finalSnapshotCreated: false,
      bundleBuilt: false,
      bundlePersisted: false,
      validationResult: null,
      error: null,
    };
    this.activeShutdowns.set(sessionId, telemetry);

    console.log(`[SessionShutdownManager] 🛑 Initiating unified graceful shutdown for session '${sessionId}' (Reason: ${reason})...`);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    try {
      // Step 1: Update session status to STOPPING & FINALIZING
      await db.collection("monitoring_sessions").updateOne(
        { id: sessionId },
        {
          $set: {
            status: "stopping",
            shutdownReason: reason,
            stoppingAt: nowIso,
            updatedAt: nowIso,
          },
        }
      );

      // Step 2: Transition to FINALIZING
      telemetry.currentStep = "FREEZING_COLLECTOR";
      telemetry.progressPct = 25;
      telemetry.updatedAt = new Date().toISOString();
      this.activeShutdowns.set(sessionId, telemetry);

      await db.collection("monitoring_sessions").updateOne(
        { id: sessionId },
        {
          $set: {
            status: "finalizing",
            finalizingAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      );

      // Step 3: Run Atomic Session Finalizer Pipeline
      telemetry.currentStep = "FLUSHING_BUFFER";
      telemetry.progressPct = 40;
      this.activeShutdowns.set(sessionId, telemetry);

      const summary = await SessionFinalizer.finalizeSession(sessionId);
      telemetry.bufferFlushed = true;
      telemetry.finalSnapshotCreated = true;

      // Step 4: Validate CompletedSessionBundle
      telemetry.currentStep = "VALIDATING_BUNDLE";
      telemetry.progressPct = 80;
      this.activeShutdowns.set(sessionId, telemetry);

      const completedBundle: any = await db.collection("completed_session_bundle").findOne({ sessionId });
      const validation = SessionFinalizationValidator.validateBundle(completedBundle);

      telemetry.validationResult = validation;
      telemetry.bundleBuilt = !!completedBundle;
      telemetry.bundlePersisted = validation.isValid;

      if (!validation.isValid) {
        console.error(`[SessionShutdownManager] ❌ Bundle validation failed for session '${sessionId}':`, validation.errors);
        await db.collection("monitoring_sessions").updateOne(
          { id: sessionId },
          {
            $set: {
              status: "finalization_failed",
              finalizationErrors: validation.errors,
              missingSections: validation.missingSections,
              updatedAt: new Date().toISOString(),
            },
          }
        );

        telemetry.currentStep = "FAILED";
        telemetry.error = validation.errors.join("; ");
        this.activeShutdowns.set(sessionId, telemetry);

        return {
          success: false,
          summary,
          validation,
          error: `Finalization failed bundle validation: ${validation.errors.join(", ")}`,
        };
      }

      // Step 5: Mark Session COMPLETED
      telemetry.currentStep = "MARKING_COMPLETED";
      telemetry.progressPct = 95;
      this.activeShutdowns.set(sessionId, telemetry);

      const completionTime = new Date().toISOString();
      await db.collection("monitoring_sessions").updateOne(
        { id: sessionId },
        {
          $set: {
            status: "completed",
            completedAt: completionTime,
            updatedAt: completionTime,
          },
        }
      );

      // Step 6: Broadcast Completion
      await TimelinePublisher.publish(
        sessionId,
        summary.platform || "kick",
        "SESSION_COMPLETED",
        "🏁 Unified Shutdown Pipeline Completed",
        `Graceful session finalization complete (${reason}). All 8 bundle sections verified 100% complete.`,
        "success"
      ).catch(() => {});

      telemetry.currentStep = "COMPLETED";
      telemetry.progressPct = 100;
      telemetry.completedAt = completionTime;
      this.activeShutdowns.set(sessionId, telemetry);

      console.log(`[SessionShutdownManager] ✅ Session '${sessionId}' successfully finalized and marked COMPLETED.`);

      return {
        success: true,
        summary,
        validation,
      };
    } catch (err: any) {
      console.error(`[SessionShutdownManager] 💥 Error shutting down session '${sessionId}':`, err.message);

      await db.collection("monitoring_sessions").updateOne(
        { id: sessionId },
        {
          $set: {
            status: "finalization_failed",
            finalizationError: err.message,
            updatedAt: new Date().toISOString(),
          },
        }
      ).catch(() => {});

      telemetry.currentStep = "FAILED";
      telemetry.error = err.message;
      this.activeShutdowns.set(sessionId, telemetry);

      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export const SessionShutdownManager = new SessionShutdownManagerRegistry();
