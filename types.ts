
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  status: TaskStatus;
  rewardPoints: number; // Points awarded when this specific sub-task is completed
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
