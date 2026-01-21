export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  status: TaskStatus;
  rewardPoints: number; // Points awarded when this specific sub-task is completed
  dueDate?: string; // Optional deadline for the sub-task
  notes?: string; // Comentário ou observação sobre a micro-tarefa
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  estimatedTime: number; // in minutes
  category: string;
  completed: boolean;
  subTasks: SubTask[];
  rewardPoints: number; // Bonus points for completing the whole macro project
  totalTimeSpent?: number; // Total focused time in minutes
  completedAt?: string; // ISO string date
  links?: ProjectLink[]; // Links para documentos, escopos, etc.
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
}

export interface UserStats {
  points: number;
  tasksCompleted: number;
  streak: number;
}