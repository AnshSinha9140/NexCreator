import {
  AdminSystemHealth,
  ComponentHealth,
  HealthStatus,
} from "@/types/adminDashboard";

export class AdminHealthEngine {
  public static evaluateHealth(components: ComponentHealth[]): AdminSystemHealth {
    if (!components || components.length === 0) {
      return {
        overallStatus: "Critical",
        overallScore: 0,
        components: [],
        explanations: ["No system components reported status"],
      };
    }

    const warningComponents = components.filter((c) => c.status === "Warning" && c.available);
    const criticalComponents = components.filter((c) => c.status === "Critical" || !c.available);

    const explanations: string[] = [];

    criticalComponents.forEach((c) => {
      explanations.push(`Critical issue in ${c.name}: ${c.message}`);
    });

    warningComponents.forEach((c) => {
      explanations.push(`Degraded performance in ${c.name}: ${c.message}`);
    });

    let overallStatus: HealthStatus = "Healthy";
    if (criticalComponents.length > 0) {
      overallStatus = criticalComponents.length >= 2 ? "Critical" : "Warning";
    } else if (warningComponents.length > 0) {
      overallStatus = "Warning";
    }

    // Calculate score strictly based on actual component status weightings
    const scoreSum = components.reduce((acc, c) => {
      if (!c.available || c.status === "Critical") return acc;
      if (c.status === "Warning") return acc + 60;
      return acc + 100;
    }, 0);

    const overallScore = Math.round(scoreSum / components.length);

    if (explanations.length === 0) {
      explanations.push("All operational subsystems performing within optimal parameters.");
    }

    return {
      overallStatus,
      overallScore,
      components,
      explanations,
    };
  }
}
