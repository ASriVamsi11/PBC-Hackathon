export interface ActivityEvent {
  id: number;
  type: "earning" | "storage" | "reputation" | "system";
  title: string;
  description: string;
  timestamp: string;
}

class ActivityLog {
  private events: ActivityEvent[] = [];
  private counter = 0;

  add(type: ActivityEvent["type"], title: string, description: string): void {
    this.counter++;
    this.events.push({
      id: this.counter,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
    });
  }

  getAll(): ActivityEvent[] {
    return [...this.events].reverse();
  }

  getByType(type: ActivityEvent["type"]): ActivityEvent[] {
    return this.events.filter((e) => e.type === type).reverse();
  }
}

export const activityLog = new ActivityLog();
