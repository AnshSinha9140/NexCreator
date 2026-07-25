export class DiagnosticsLogger {
  private static isDebugEnabled(): boolean {
    return process.env.DEBUG_PIPELINE === "true";
  }

  private static formatTime(date: Date = new Date()): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  public static log(component: string, stage: string, message: string) {
    if (!this.isDebugEnabled()) return;
    const time = this.formatTime();
    console.log(`[${time}] [${component}] [${stage}] ${message}`);
  }

  public static warn(component: string, stage: string, message: string) {
    if (!this.isDebugEnabled()) return;
    const time = this.formatTime();
    console.warn(`[${time}] [${component}] [${stage}] ⚠ ${message}`);
  }

  public static error(component: string, stage: string, message: string, error?: any) {
    if (!this.isDebugEnabled()) return;
    const time = this.formatTime();
    console.error(`[${time}] [${component}] [${stage}] ❌ ${message}`, error || "");
  }
}
