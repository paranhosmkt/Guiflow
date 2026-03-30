export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
}

export interface MonthlyGoal {
  id: string;
  text: string;
  completed: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  status: TaskStatus;
  dueDate?: string; // Optional deadline for the sub-task
  urgency?: number; // Urgency level (e.g., 1 to 3)
  notes?: string; // Comentário ou observação sobre a micro-tarefa
  link?: string; // Link de referência para a micro-tarefa
  archived?: boolean; // Se a tarefa foi arquivada da visão local
}

export interface Task {
  id: string;
  title: string;
  description: string;
  notes?: string; // Notas detalhadas do objetivo macro
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  estimatedTime: number; // in minutes
  category: string;
  completed: boolean;
  subTasks: SubTask[];
  totalTimeSpent?: number; // Total focused time in minutes
  timeSpentByMonth?: Record<string, number>; // Tempo focado por mês (YYYY-MM)
  completedAt?: string; // ISO string date
  links?: ProjectLink[]; // Links para documentos, escopos, etc.
  pinned?: boolean; // Se a tarefa está fixada no topo
  postIt?: string; // Comentário temporário em destaque
}

export interface UserStats {
  tasksCompleted: number;
  streak: number;
}