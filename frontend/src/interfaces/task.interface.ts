export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  created_at: string;
  description: string;
  due_date: string | null;
  id: string;
  priority: TaskPriority;
  status: TaskStatus;
  tag?:string;
  title: string;
  updated_at: string;
  user_id: string;
}
