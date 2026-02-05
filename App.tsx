
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Plus, 
  CheckCircle2, 
  Zap, 
  X,
  GripVertical,
  Layout,
  Gift,
  PlusCircle,
  Briefcase,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Timer,
  ChevronRight,
  Pencil,
  Trash2,
  Lightbulb,
  AlertCircle,
  Calendar,
  History,
  Clock,
  Sun,
  Moon,
  ArrowLeft,
  MessageSquare,
  Info,
  Save,
  Star,
  BellRing,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Link2,
  ExternalLink,
  FileText,
  Settings,
  CalendarCheck,
  Check,
  Archive,
  Download,
  Upload,
  Undo2,
  ShoppingBag,
  TrendingUp,
  Maximize2,
  ChevronDown,
  Copy,
  CalendarDays
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, UserStats, Reward, SubTask, TaskStatus, ProjectLink, MonthlyGoal, RedeemedReward } from './types';

// Constantes para LocalStorage
const STORAGE_KEYS = {
  TASKS: 'guiflow_tasks_v2',
  COMPLETED_TASKS: 'guiflow_completed_tasks_v2',
  REWARDS: 'guiflow_rewards_v2',
  REDEEMED_REWARDS: 'guiflow_redeemed_rewards_v2',
  STATS: 'guiflow_stats_v2',
  THEME: 'guiflow_theme_v2',
  MONTHLY_GOALS: 'guiflow_monthly_goals_v2'
};

const MOTIVATION_QUOTES = [
  "Progresso, não perfeição.",
  "Um pequeno passo ainda é movimento para frente.",
  "Sua mente funciona de forma única, e isso é seu superpoder.",
  "Respire. Uma coisa de cada vez.",
  "Comemore as pequenas vitórias de hoje!",
  "Feito é melhor que perfeito.",
  "Você está indo muito bem, continue!",
  "Sua jornada é única, não se compare aos outros.",
  "Pequenas vitórias são o combustível para grandes mudanças.",
  "O caos externo não define sua paz interna.",
  "Seu cérebro é um motor de Ferrari com freios de bicicleta; aprendendo a dirigir com cuidado.",
  "A distração é apenas sua curiosidade explorando o mundo.",
  "Mudar a estratégia é sinal de inteligência, não de desistência.",
  "Respeite seu ritmo; até a lua tem fases.",
  "Focar no 'como' é mais importante do que focar no 'quanto'.",
  "A paralisia da análise resolve-se com o primeiro movimento.",
  "Você não é preguiçoso, você está gerenciando uma carga cognitiva imensa.",
  "Hoje é um novo dia para tentar de um jeito diferente.",
  "A criatividade é o seu superpoder secreto.",
  "Organização é uma ferramenta, não um destino final.",
  "Perdoe-se pelos dias de neblina mental.",
  "A clareza vem da ação, não do pensamento excessivo.",
  "Simplifique até que pareça impossível errar.",
  "Sua mente hiperfocada pode mover montanhas.",
  "O 'perfeito' é o inimigo do 'feito'.",
  "Dê a si mesmo a permissão para ser um iniciante.",
  "Cada tarefa concluída é um voto de confiança em você mesmo.",
  "Transforme 'eu tenho que' em 'eu escolho'.",
  "Sua neurodivergência traz cores que o mundo precisa ver.",
  "O cansaço mental é real; descanse sem culpa.",
  "Um ambiente acolhedor é metade do caminho para o foco.",
  "Você é mais do que sua produtividade.",
  "Celebre o esforço, o resultado virá naturalmente.",
  "Quebre o silêncio da procrastinação com uma música que te anime.",
  "Sua intuição costuma ser sua melhor bússola.",
  "Não lute contra seu cérebro, trabalhe com ele.",
  "Você sobreviveu a 100% dos seus dias difíceis até agora."
];

const EMOJI_OPTIONS = [
  '🎁', '🍫', '🍦', '🍕', '🎮', '🎬', '📺', '📱', '🛌', '🧘', 
  '🛀', '🛀', '📚', '🎨', '🎧', '🎸', '🎧', '🛹', '🍦', '🧁', '🍕',
  '☕', '🍵', '🍷', '🍺', '🏖️', '⛰️', '🎡', '🎢', '💎', '💰'
];

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', title: '15 min de descanso total', cost: 50, icon: '🧘' },
  { id: 'r2', title: 'Comer um doce', cost: 100, icon: '🍫' },
  { id: 'r3', title: 'Episódio de série', cost: 300, icon: '📺' },
];

const COMPLEXITY_LEVELS = [
  { id: 'simple', label: 'Simples', points: 5, icon: <BatteryLow size={14} />, example: 'Ex: Responder e-mail, lavar louça' },
  { id: 'medium', label: 'Intermediária', points: 10, icon: <BatteryMedium size={14} />, example: 'Ex: Cadastro no sistema, relatório' },
  { id: 'complex', label: 'Complexa', points: 20, icon: <BatteryFull size={14} />, example: 'Ex: Resolver bug difícil, estudar' }
];

const playAlertSound = (type: 'work-end' | 'break-end') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'work-end') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.5); // C6
    } else {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4
    }

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio Context não suportado ou bloqueado pelo navegador.");
  }
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : [];
  });

  const [completedTasks, setCompletedTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
    return saved ? JSON.parse(saved) : [];
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REWARDS);
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REDEEMED_REWARDS);
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : { points: 0, tasksCompleted: 0, streak: 1 };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'light' | 'dark') || 'light';
  });

  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY_GOALS);
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'global' | 'local' | 'rewards' | 'history' | 'metrics'>('global');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [motivation, setMotivation] = useState("");
  const [draggedSubTaskId, setDraggedSubTaskId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<{points: number} | null>(null);

  // Estados Pomodoro Customizáveis
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(45);
  const [cyclesUntilLongBreak, setCyclesUntilLongBreak] = useState(4);

  const [timerSeconds, setTimerSeconds] = useState(workDuration * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [timerFlash, setTimerFlash] = useState(false);
  const [timerBoundTaskId, setTimerBoundTaskId] = useState<string | null>(null);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  
  // Métricas: Filtro de Mês
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeModal, setActiveModal] = useState<'macro' | 'task' | 'reward' | 'edit-macro' | 'edit-task' | 'link' | 'monthly' | 'settings' | 'duplicate-task' | 'move-task' | null>(null);
  const [taskToMove, setTaskToMove] = useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [taskToProject, setTaskToProject] = useState({ title: "", notes: "", link: "", points: 5, projectId: "", dueDate: "" });
  const [newReward, setNewReward] = useState({ title: "", cost: 50, icon: "🎁" });
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [newMonthlyGoal, setNewMonthlyGoal] = useState("");

  const [editingMacro, setEditingMacro] = useState<Task | null>(null);
  const [editingSubTask, setEditingSubTask] = useState<{taskId: string, subTask: SubTask} | null>(null);
  const [taskToDuplicate, setTaskToDuplicate] = useState<{taskId: string, subTask: SubTask} | null>(null);
  
  const [undoToast, setUndoToast] = useState<{ message: string; onUndo: () => void } | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(completedTasks)); }, [completedTasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards)); }, [rewards]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REDEEMED_REWARDS, JSON.stringify(redeemedRewards)); }, [redeemedRewards]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.THEME, theme); }, [theme]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MONTHLY_GOALS, JSON.stringify(monthlyGoals)); }, [monthlyGoals]);

  useEffect(() => {
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    setMotivation(randomQuote);
  }, [stats.tasksCompleted, view, tasks.length]);

  const sortByDueDate = (a: { dueDate?: string }, b: { dueDate?: string }) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  };

  // Temporizador com lógica de sincronização por Delta de tempo
  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      lastTickRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        const secondsElapsed = Math.floor(delta / 1000);
        
        if (secondsElapsed >= 1) {
          lastTickRef.current += secondsElapsed * 1000;
          
          setTimerSeconds(prev => {
            const actualSub = Math.min(prev, secondsElapsed);
            const nextVal = prev - actualSub;
            
            // Se estiver em modo TRABALHO e houver uma tarefa vinculada, atualizamos o tempo real dela
            if (timerMode === 'work' && timerBoundTaskId) {
              setTasks(currentTasks => currentTasks.map(t => 
                t.id === timerBoundTaskId 
                  ? { ...t, totalTimeSpent: (t.totalTimeSpent || 0) + (actualSub / 60) } 
                  : t
              ));
            }
            
            return nextVal;
          });
        }
      }, 500); // Checagem frequente para alta precisão
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerActive, timerMode, timerBoundTaskId]);

  useEffect(() => {
    if (timerSeconds === 0 && isTimerActive) {
      handleTimerComplete();
    }
  }, [timerSeconds, isTimerActive]);

  const toggleTimer = () => {
    if (!isTimerActive && timerMode === 'work' && activeTaskId) {
      setTimerBoundTaskId(activeTaskId);
    }
    setIsTimerActive(!isTimerActive);
  };

  const handleTimerComplete = () => {
    setIsTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerFlash(true);
    setTimeout(() => setTimerFlash(false), 3000);

    if (timerMode === 'work') {
      const nextCycles = cyclesCompleted + 1;
      setCyclesCompleted(nextCycles);
      playAlertSound('work-end');
      
      setTimerMode('break');
      // Lógica de ciclo de pausa longa configurável
      if (nextCycles % cyclesUntilLongBreak === 0) {
        setTimerSeconds(longBreakDuration * 60); 
        alert(`🎉 ${cyclesUntilLongBreak}º CICLO CONCLUÍDO! Você merece um descanso longo de ${longBreakDuration} minutos. Recarregue as energias!`);
      } else {
        setTimerSeconds(shortBreakDuration * 60);
        alert(`⚡ Foco concluído (Ciclo ${nextCycles % cyclesUntilLongBreak}/${cyclesUntilLongBreak})! Hora de ${shortBreakDuration} minutos de pausa. Beba água!`);
      }
    } else {
      playAlertSound('break-end');
      setTimerMode('work');
      setTimerSeconds(workDuration * 60);
      alert("🚀 Pausa concluída! Pronto para mais um período de clareza?");
    }
  };

  const handleResetTimer = () => {
    setIsTimerActive(false);
    setTimerMode('work');
    setTimerSeconds(workDuration * 60);
    setCyclesCompleted(0);
  };

  const handleCreateMacro = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      notes: "",
      priority: 'medium',
      status: 'todo',
      dueDate: newTaskDate || new Date().toISOString().split('T')[0],
      estimatedTime: 30,
      category: 'Geral',
      completed: false,
      subTasks: [],
      rewardPoints: 50,
      totalTimeSpent: 0,
      links: []
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDate("");
    setActiveModal(null);
  };

  const handleOpenEditMacro = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMacro({ ...task });
    setActiveModal('edit-macro');
  };

  const handleUpdateMacro = () => {
    if (!editingMacro || !editingMacro.title.trim()) return;
    setTasks(tasks.map(t => t.id === editingMacro.id ? editingMacro : t));
    setEditingMacro(null);
    setActiveModal(null);
  };

  const handleDeleteMacro = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente excluir este objetivo e todas as suas tarefas?")) {
      setTasks(tasks.filter(t => t.id !== id));
      if (activeTaskId === id) setActiveTaskId(null);
    }
  };

  const handleDeleteHistoryTask = (id: string) => {
    if (confirm("Deseja realmente remover este registro do histórico?")) {
      setCompletedTasks(prev => prev.filter(t => t.id !== id));
    }
  };
  
  const handleReactivateTask = (id: string) => {
    const task = completedTasks.find(t => t.id === id);
    if (!task) return;

    // Remove from completed
    setCompletedTasks(prev => prev.filter(t => t.id !== id));
    
    // Add back to active
    const activeTask: Task = { ...task, status: 'todo', completed: false, completedAt: undefined };
    setTasks(prev => [...prev, activeTask]);
    
    // Reverse points
    setStats(prev => ({
      ...prev,
      points: Math.max(0, prev.points - task.rewardPoints),
      tasksCompleted: Math.max(0, prev.tasksCompleted - 1)
    }));

    setView('local');
    setActiveTaskId(task.id);

    setUndoToast({
      message: "Tarefa reativada com sucesso!",
      onUndo: () => {
        setTasks(prev => prev.filter(t => t.id !== id));
        setCompletedTasks(prev => [task, ...prev]);
        setStats(prev => ({
            ...prev,
            points: prev.points + task.rewardPoints,
            tasksCompleted: prev.tasksCompleted + 1
        }));
        setView('history');
        setActiveTaskId(null);
      }
    });

    setTimeout(() => setUndoToast(null), 5000);
  };

  const handleRedeemReward = (reward: Reward) => {
    if (stats.points < reward.cost) return;

    const redemption: RedeemedReward = {
      id: Date.now().toString(),
      title: reward.title,
      cost: reward.cost,
      icon: reward.icon,
      redeemedAt: new Date().toISOString()
    };

    setStats(s => ({ ...s, points: s.points - reward.cost }));
    setRedeemedRewards(prev => [redemption, ...prev]);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#6366f1']
    });

    alert(`🎉 Parabéns! Você resgatou: ${reward.title}. Aproveite seu prêmio, você mereceu!`);
  };

  const handleDeleteRedeemed = (id: string) => {
    if (confirm("Remover este registro do histórico de resgates?")) {
      setRedeemedRewards(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleAddTaskToProject = () => {
    const targetId = taskToProject.projectId || activeTaskId;
    if (!taskToProject.title.trim() || !targetId) return;

    const newSub: SubTask = { 
      id: Math.random().toString(36).substr(2, 9), 
      title: taskToProject.title, 
      notes: taskToProject.notes,
      link: taskToProject.link,
      completed: false, 
      status: 'todo',
      rewardPoints: taskToProject.points,
      dueDate: taskToProject.dueDate
    };

    setTasks(prev => prev.map(t => t.id === targetId ? { ...t, subTasks: [...t.subTasks, newSub] } : t));
    setTaskToProject({ title: "", notes: "", link: "", points: 5, projectId: "", dueDate: "" });
    setActiveModal(null);
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim() || !activeTaskId) return;
    
    let url = newLink.url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const link: ProjectLink = {
      id: Date.now().toString(),
      title: newLink.title.trim(),
      url
    };

    setTasks(prev => prev.map(t => {
      if (t.id === activeTaskId) {
        return { ...t, links: [...(t.links || []), link] };
      }
      return t;
    }));

    setNewLink({ title: "", url: "" });
    setActiveModal(null);
  };

  const handleDeleteLink = (linkId: string) => {
    if (!activeTaskId) return;
    setTasks(prev => prev.map(t => {
      if (t.id === activeTaskId) {
        return { ...t, links: (t.links || []).filter(l => l.id !== linkId) };
      }
      return t;
    }));
  };

  const handleOpenEditSubTask = (taskId: string, subTask: SubTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSubTask({ taskId, subTask: { ...subTask } });
    setActiveModal('edit-task');
  };

  const handleOpenDuplicateSubTask = (taskId: string, subTask: SubTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTaskToDuplicate({ taskId, subTask: { ...subTask } });
    setActiveModal('duplicate-task');
  };

  const handleConfirmDuplicate = (targetTaskId: string) => {
    if (!taskToDuplicate) return;

    const newSubTask: SubTask = {
      ...taskToDuplicate.subTask,
      id: Math.random().toString(36).substr(2, 9),
      completed: false,
      status: 'todo',
      archived: false
    };

    setTasks(prev => prev.map(t => t.id === targetTaskId ? { ...t, subTasks: [...t.subTasks, newSubTask] } : t));
    setTaskToDuplicate(null);
    setActiveModal(null);
    
    const targetProject = tasks.find(t => t.id === targetTaskId);
    setUndoToast({
      message: `Tarefa duplicada para "${targetProject?.title}"`,
      onUndo: () => {
        setTasks(prev => prev.map(t => t.id === targetTaskId ? { ...t, subTasks: t.subTasks.filter(st => st.id !== newSubTask.id) } : t));
      }
    });
    setTimeout(() => setUndoToast(null), 5000);
  };

  const handleUpdateSubTask = () => {
    if (!editingSubTask || !editingSubTask.subTask.title.trim()) return;
    setTasks(prev => prev.map(t => {
      if (t.id === editingSubTask.taskId) {
        return {
          ...t,
          subTasks: t.subTasks.map(st => st.id === editingSubTask.subTask.id ? editingSubTask.subTask : st)
        };
      }
      return t;
    }));
    setEditingSubTask(null);
    setActiveModal(null);
  };

  const changeSubTaskStatus = (taskId: string, subId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks.map(st => {
            if (st.id === subId) {
              const wasDone = st.status === 'done';
              const isNowDone = newStatus === 'done';
              if (!wasDone && isNowDone) setStats(s => ({ ...s, points: s.points + st.rewardPoints }));
              if (wasDone && !isNowDone) setStats(s => ({ ...s, points: Math.max(0, s.points - st.rewardPoints) }));
              return { ...st, status: newStatus, completed: isNowDone };
            }
            return st;
          })
        };
      }
      return t;
    }));
  };

  const handleDeleteSubTask = (taskId: string, subId: string) => {
    if (confirm("Remover esta etapa da lista?")) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, subTasks: t.subTasks.filter(st => st.id !== subId) };
        }
        return t;
      }));
    }
  };

  const handleArchiveDoneSubTasks = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks.map(st => st.status === 'done' ? { ...st, archived: true } : st)
        };
      }
      return t;
    }));
  };

  const handleAddMonthlyGoal = () => {
    if (!newMonthlyGoal.trim()) return;
    const goal: MonthlyGoal = {
      id: Date.now().toString(),
      text: newMonthlyGoal.trim(),
      completed: false
    };
    setMonthlyGoals([...monthlyGoals, goal]);
    setNewMonthlyGoal("");
  };

  const toggleMonthlyGoal = (id: string) => {
    setMonthlyGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteMonthlyGoal = (id: string) => {
    setMonthlyGoals(prev => prev.filter(g => g.id !== id));
  };

  const finishMacroProject = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const finalizedTask: Task = {
      ...task,
      status: 'done',
      completed: true,
      completedAt: new Date().toISOString()
    };
    triggerCelebration(task.rewardPoints);
    setStats(s => ({ ...s, points: s.points + task.rewardPoints, tasksCompleted: s.tasksCompleted + 1 }));
    setCompletedTasks([finalizedTask, ...completedTasks]);
    setTasks(prev => prev.filter(t => t.id !== id));
    setActiveTaskId(null);
  };

  const triggerCelebration = (points: number) => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#10b981', '#fbbf24']
    });

    setShowCelebration({ points });
    setTimeout(() => {
      setShowCelebration(null);
      setView('history');
    }, 4000);
  };

  const handleCreateReward = () => {
    if (!newReward.title.trim()) return;
    const reward: Reward = { id: Date.now().toString(), ...newReward };
    setRewards([...rewards, reward]);
    setNewReward({ title: "", cost: 50, icon: "🎁" });
    setActiveModal(null);
  };

  const handleDeleteReward = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  const handleExportData = () => {
    const data = {
      tasks,
      completedTasks,
      rewards,
      redeemedRewards,
      stats,
      monthlyGoals,
      theme,
      exportDate: new Date().toISOString(),
      version: '2.1'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guitask-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("Backup concluído! Guarde este arquivo em um local seguro.");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Validação mínima para garantir que o arquivo é do Guitask
        if (!data.tasks || !data.stats) {
          throw new Error("Arquivo inválido");
        }

        if (confirm("Isso substituirá todos os seus dados atuais pelos dados do backup. Continuar?")) {
          setTasks(data.tasks);
          setCompletedTasks(data.completedTasks || []);
          setRewards(data.rewards || INITIAL_REWARDS);
          setRedeemedRewards(data.redeemedRewards || []);
          setStats(data.stats);
          setMonthlyGoals(data.monthlyGoals || []);
          if (data.theme) setTheme(data.theme);
          
          alert("Dados restaurados com sucesso!");
          setActiveModal(null);
        }
      } catch (err) {
        alert("Erro ao importar: O arquivo selecionado não é um backup válido do Guitask.");
      }
    };
    reader.readAsText(file);
    // Limpar o input para permitir importar o mesmo arquivo novamente se necessário
    e.target.value = "";
  };

  const handleMoveTaskToMonth = (taskId: string, targetMonthStr: string) => {
    const targetDate = `${targetMonthStr}-01`;
    
    // Check in active tasks
    if (tasks.some(t => t.id === taskId)) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate: targetDate } : t));
    } 
    // Check in completed tasks
    else if (completedTasks.some(t => t.id === taskId)) {
      setCompletedTasks(prev => prev.map(t => t.id === taskId ? { ...t, completedAt: `${targetDate}T12:00:00.000Z` } : t));
    }
    
    setActiveModal(null);
    setTaskToMove(null);
  };

  const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId) || null, [tasks, activeTaskId]);

  const isProjectReadyToFinish = useMemo(() => {
    if (!activeTask || activeTask.subTasks.length === 0) return false;
    return activeTask.subTasks.every(st => st.status === 'done');
  }, [activeTask]);

  const onDrop = (status: TaskStatus) => {
    if (draggedSubTaskId && activeTask) {
      changeSubTaskStatus(activeTask.id, draggedSubTaskId, status);
      setDraggedSubTaskId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  const formatFullDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeSpent = (minutes: number = 0) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    if (minutes < 60) return `${Math.floor(minutes)}m ${Math.round((minutes % 1) * 60)}s`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(23, 59, 59, 999); 
    return date < today;
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const bgMain = theme === 'light' ? 'bg-slate-50' : 'bg-slate-950';
  const bgCard = theme === 'light' ? 'bg-white' : 'bg-slate-900';
  const textMain = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const textMuted = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const borderMain = theme === 'light' ? 'border-slate-200' : 'border-slate-800';
  const borderCard = theme === 'light' ? 'border-slate-100' : 'border-slate-800';

  // Filtro de métricas avançado: Garantindo que o que foi feito no mês X apareça no mês X
  const filteredMetrics = useMemo(() => {
    const combinedTasks = [...tasks, ...completedTasks];
    const filtered = combinedTasks.filter(t => {
      const dateToCheck = t.completed ? t.completedAt : t.dueDate;
      if (!dateToCheck) return false;
      return dateToCheck.startsWith(selectedMonth);
    });
    
    if (filtered.length === 0) return { tasks: [], totalMinutes: 0, completedCount: 0 };
    
    const completedCount = filtered.filter(t => t.completed).length;
    const totalMinutes = filtered.reduce((acc, t) => acc + (t.totalTimeSpent || 0), 0);
    const maxTime = Math.max(...filtered.map(t => t.totalTimeSpent || 0), 1);
    
    return {
      totalMinutes,
      completedCount,
      tasks: filtered.map(t => ({
        title: t.title,
        time: t.totalTimeSpent || 0,
        percentage: ((t.totalTimeSpent || 0) / maxTime) * 100,
        completed: t.completed
      }))
    };
  }, [tasks, completedTasks, selectedMonth]);

  const monthOptions = useMemo(() => {
    const combined = [...tasks, ...completedTasks];
    const months = new Set<string>();
    
    const now = new Date();
    months.add(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
    
    combined.forEach(t => {
      const date = t.completedAt || t.dueDate;
      if (date) {
        months.add(date.substring(0, 7));
      }
    });
    
    return Array.from(months).sort().reverse();
  }, [tasks, completedTasks]);

  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className={`min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col transition-colors duration-300 ${bgMain} ${textMain}`}>
      {/* Sidebar */}
      <nav className={`fixed bottom-0 left-0 w-full h-16 ${bgCard} border-t ${borderMain} flex items-center justify-around z-50 md:top-0 md:left-0 md:w-64 md:h-full md:flex-col md:justify-start md:p-6 md:border-r shadow-2xl transition-colors duration-300`}>
        <div className="hidden md:flex items-start justify-between mb-10 w-full">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg mt-1"><Zap size={22} fill="currentColor" /></div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tighter leading-none">GUITASK</h1>
                <span className="text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">beta</span>
              </div>
              <p className={`text-[10px] font-bold tracking-tight mt-1 ${textMuted}`}>Clareza para mentes inquietas</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setActiveModal('settings')} className={`p-2 rounded-xl transition-colors ${theme === 'light' ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-slate-800 text-slate-500'}`}>
              <Settings size={20} />
            </button>
            <button onClick={toggleTheme} className={`p-2 rounded-xl transition-colors ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-amber-400'}`}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
        
        <div className="flex w-full justify-around md:flex-col md:gap-4">
          <NavItem active={view === 'global'} onClick={() => setView('global')} icon={<LayoutDashboard size={20} />} label="Geral" theme={theme} />
          <NavItem active={view === 'local'} onClick={() => setView('local')} icon={<Target size={20} />} label="Foco" theme={theme} />
          <NavItem active={view === 'rewards'} onClick={() => setView('rewards')} icon={<Trophy size={20} />} label="Prêmios" theme={theme} />
          <NavItem active={view === 'metrics'} onClick={() => setView('metrics')} icon={<TrendingUp size={20} />} label="Métricas" theme={theme} />
          <NavItem active={view === 'history'} onClick={() => setView('history')} icon={<History size={20} />} label="Histórico" theme={theme} />
          
          <button onClick={() => setActiveModal('settings')} className="md:hidden flex flex-col items-center gap-1 px-4 py-2 text-slate-400">
             <Settings size={20} />
             <span className="text-[9px] uppercase font-bold tracking-tight">Config</span>
          </button>
        </div>

        <div className="hidden md:mt-auto md:block w-full">
          <div className="bg-slate-900 dark:bg-black p-5 rounded-[2rem] text-white shadow-xl border border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Pontos Atuais</p>
            <div className="text-3xl font-black text-indigo-400 flex items-baseline gap-1">
              {stats.points} <span className="text-xs text-slate-400">pts</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 w-full max-w-[1200px] mx-auto pt-16">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight">
              {view === 'global' ? 'Visão Geral' : view === 'local' ? 'Foco Local' : view === 'rewards' ? 'Recompensas' : view === 'metrics' ? 'Métricas de Foco' : 'Histórico de Conquistas'}
            </h2>
            <div className={`flex items-center gap-2 ${textMuted}`}>
              <Lightbulb size={16} className="text-amber-500" />
              <p className="text-sm font-medium italic">{motivation}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
             {view === 'global' && (
               <>
                <button onClick={() => setActiveModal('monthly')} className={`px-6 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${theme === 'light' ? 'bg-white text-indigo-600 border border-indigo-100 shadow-indigo-100/50' : 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-black/20'}`}>
                  <CalendarCheck size={20} /> Objetivos do Mês
                </button>
                <button onClick={() => setActiveModal('macro')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-200/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={20} /> Novo Objetivo
                </button>
               </>
             )}
             {view === 'rewards' && (
                <button onClick={() => setActiveModal('reward')} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-purple-200/50 hover:scale-105 transition-all flex items-center gap-2">
                  <Gift size={20} /> Novo Prêmio
                </button>
             )}
          </div>
        </header>

        {/* Render Views */}
        {view === 'global' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {tasks
              .filter(t => !t.completed)
              .sort(sortByDueDate)
              .map(task => (
                <MacroCard 
                  key={task.id} 
                  task={task} 
                  theme={theme} 
                  onFocus={() => { setActiveTaskId(task.id); setView('local'); }} 
                  onEdit={(e: React.MouseEvent) => handleOpenEditMacro(task, e)}
                  onDelete={(e: React.MouseEvent) => handleDeleteMacro(task.id, e)} 
                  formatDate={formatDate} 
                  isOverdue={isOverdue} 
                  formatTimeSpent={formatTimeSpent}
                />
            ))}
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className={`col-span-full py-24 text-center ${bgCard} rounded-[3rem] border-2 border-dashed ${borderMain} flex flex-col items-center`}>
                 <div className={`w-20 h-20 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'} rounded-full flex items-center justify-center mb-4`}><AlertCircle size={40} className="text-slate-400" /></div>
                 <h3 className={`text-xl font-black ${textMuted} mb-2`}>Sem objetivos ativos.</h3>
                 <button onClick={() => setActiveModal('macro')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black">Começar Agora</button>
              </div>
            )}
          </div>
        )}

        {view === 'local' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {activeTask ? (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                  <div className={`${bgCard} xl:col-span-3 p-8 rounded-[3rem] border ${borderCard} shadow-sm transition-all`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <button onClick={() => setView('global')} className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'light' ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            <ArrowLeft size={10} /> Voltar
                          </button>
                          <span className="bg-indigo-600/10 text-indigo-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Foco Atual</span>
                          {activeTask.dueDate && (
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOverdue(activeTask.dueDate) ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              <Calendar size={10} /> Prazo: {formatDate(activeTask.dueDate)}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'}`}>
                            <Clock size={10} /> Tempo Total: {formatTimeSpent(activeTask.totalTimeSpent)}
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-2 leading-tight">{activeTask.title}</h2>
                        {activeTask.description && <p className={`mb-6 italic text-sm ${textMuted}`}>"{activeTask.description}"</p>}
                        
                        <div className="mt-8">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                              <Link2 size={14} /> Links e Referências
                            </h4>
                            <button onClick={() => setActiveModal('link')} className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white' : 'bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white'}`}>
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {activeTask.links && activeTask.links.length > 0 ? (
                              activeTask.links.map(link => (
                                <div key={link.id} className={`group flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-100 hover:border-indigo-200' : 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50'}`}>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-bold text-sm">
                                    <span className="max-w-[150px] truncate">{link.title}</span>
                                    <ExternalLink size={12} className="opacity-40 group-hover:opacity-100" />
                                  </a>
                                  <button onClick={() => handleDeleteLink(link.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <X size={12} />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className={`text-[10px] font-medium italic ${textMuted}`}>Nenhum recurso anexado.</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => finishMacroProject(activeTask.id)} 
                        className={`whitespace-nowrap px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl ${isProjectReadyToFinish ? 'scale-110' : ''} ${theme === 'light' ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-indigo-600 text-white shadow-indigo-900/40'} ${!isProjectReadyToFinish ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                      >
                        <CheckCircle2 size={20} className={theme === 'light' ? 'text-indigo-400' : 'text-white'} /> Finalizar Objetivo (+{activeTask.rewardPoints} pts)
                      </button>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="xl:col-span-1 flex flex-col gap-4">
                    <div className={`p-6 md:p-8 rounded-[3rem] border-2 shadow-sm flex flex-col items-center justify-center transition-all relative overflow-hidden ${timerFlash ? 'animate-pulse scale-105' : ''} ${timerMode === 'work' ? (theme === 'light' ? 'bg-rose-50 border-rose-100' : 'bg-rose-950/20 border-rose-900/50') : (theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-950/20 border-emerald-900/50')}`}>
                      
                      <button 
                        onClick={() => setShowTimerSettings(!showTimerSettings)}
                        className={`absolute top-6 right-6 p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-white/60 text-slate-400 hover:text-indigo-600' : 'bg-black/20 text-slate-500 hover:text-indigo-400'}`}
                      >
                        <Settings size={18} />
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                         {timerMode === 'work' ? <Timer className="text-rose-500" size={16} /> : <Coffee className="text-emerald-500" size={16} />}
                         <span className={`text-[10px] font-black uppercase tracking-widest ${timerMode === 'work' ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {timerMode === 'work' ? `Foco Profundo` : 'Pausa'}
                         </span>
                      </div>

                      <div className="flex gap-1 mb-2">
                        {Array.from({ length: cyclesUntilLongBreak }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full transition-all ${
                              i < (cyclesCompleted % cyclesUntilLongBreak) 
                                ? (timerMode === 'work' ? 'bg-rose-500' : 'bg-emerald-500') 
                                : (theme === 'light' ? 'bg-slate-200' : 'bg-slate-800')
                            }`} 
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest mb-2 opacity-60 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Ciclo {(cyclesCompleted % cyclesUntilLongBreak) + 1} de {cyclesUntilLongBreak}
                      </span>

                      <div className="text-5xl font-black tabular-nums tracking-tighter mb-4">{Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}</div>
                      
                      {showTimerSettings && (
                        <div className={`w-full mb-6 p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-200 ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-800'}`}>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest opacity-60">Foco (min)</label>
                              <input 
                                type="number" 
                                value={workDuration} 
                                onChange={(e) => setWorkDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                className={`w-full p-2 text-xs font-black rounded-lg border outline-none ${theme === 'light' ? 'bg-slate-50 border-slate-100 focus:border-indigo-200' : 'bg-slate-800 border-slate-700 focus:border-indigo-500'}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest opacity-60">Pausa C. (min)</label>
                              <input 
                                type="number" 
                                value={shortBreakDuration} 
                                onChange={(e) => setShortBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                className={`w-full p-2 text-xs font-black rounded-lg border outline-none ${theme === 'light' ? 'bg-slate-50 border-slate-100 focus:border-indigo-200' : 'bg-slate-800 border-slate-700 focus:border-indigo-500'}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest opacity-60">Pausa L. (min)</label>
                              <input 
                                type="number" 
                                value={longBreakDuration} 
                                onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                className={`w-full p-2 text-xs font-black rounded-lg border outline-none ${theme === 'light' ? 'bg-slate-50 border-slate-100 focus:border-indigo-200' : 'bg-slate-800 border-slate-700 focus:border-indigo-500'}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black uppercase tracking-widest opacity-60">Ciclos p/ L.</label>
                              <input 
                                type="number" 
                                value={cyclesUntilLongBreak} 
                                onChange={(e) => setCyclesUntilLongBreak(Math.max(1, parseInt(e.target.value) || 1))}
                                className={`w-full p-2 text-xs font-black rounded-lg border outline-none ${theme === 'light' ? 'bg-slate-50 border-slate-100 focus:border-indigo-200' : 'bg-slate-800 border-slate-700 focus:border-indigo-500'}`}
                              />
                            </div>
                          </div>
                          <button 
                            onClick={() => { setShowTimerSettings(false); handleResetTimer(); }}
                            className="w-full mt-3 py-2 text-[8px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                          >
                            Aplicar e Reiniciar
                          </button>
                        </div>
                      )}

                      <div className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-2xl ${theme === 'light' ? 'bg-white/40' : 'bg-black/20'}`}>
                        <Briefcase size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Acumulado: {formatTimeSpent(activeTask.totalTimeSpent)}</span>
                      </div>

                      <div className="flex gap-3 w-full">
                         <button 
                           onClick={toggleTimer} 
                           className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${timerMode === 'work' ? 'bg-rose-600 shadow-rose-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}
                         >
                           {isTimerActive ? (
                             <><Pause size={20} fill="currentColor" /><span className="text-xs uppercase tracking-widest">Pausar</span></>
                           ) : (
                             <><Play size={20} fill="currentColor" /><span className="text-xs uppercase tracking-widest">Continuar</span></>
                           )}
                         </button>
                         <button onClick={handleResetTimer} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-sm ${theme === 'light' ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}><RotateCcw size={20} /></button>
                      </div>
                    </div>
                    <button onClick={() => setActiveModal('task')} className="bg-emerald-600 text-white px-6 py-4 rounded-[2rem] font-black shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                      <PlusCircle size={22} /> Nova micro-tarefa
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
                  <KanbanCol 
                    title="A Fazer" 
                    theme={theme} 
                    tasks={activeTask.subTasks.filter(s => s.status === 'todo').sort(sortByDueDate)} 
                    onDrop={() => onDrop('todo')} 
                    onDragOver={(e: React.DragEvent) => e.preventDefault()} 
                    onDragStart={setDraggedSubTaskId} 
                    onEditSubTask={(st: SubTask, e: any) => handleOpenEditSubTask(activeTask.id, st, e)} 
                    onDuplicateSubTask={(st: SubTask, e: any) => handleOpenDuplicateSubTask(activeTask.id, st, e)}
                    onDeleteSubTask={(subId: string) => handleDeleteSubTask(activeTask.id, subId)} 
                    formatDate={formatDate} 
                    isOverdue={isOverdue} 
                  />
                  <KanbanCol 
                    title="Fazendo" 
                    theme={theme} 
                    tasks={activeTask.subTasks.filter(s => s.status === 'doing').sort(sortByDueDate)} 
                    onDrop={() => onDrop('doing')} 
                    onDragOver={(e: React.DragEvent) => e.preventDefault()} 
                    onDragStart={setDraggedSubTaskId} 
                    onEditSubTask={(st: SubTask, e: any) => handleOpenEditSubTask(activeTask.id, st, e)} 
                    onDuplicateSubTask={(st: SubTask, e: any) => handleOpenDuplicateSubTask(activeTask.id, st, e)}
                    onDeleteSubTask={(subId: string) => handleDeleteSubTask(activeTask.id, subId)} 
                    formatDate={formatDate} 
                    isOverdue={isOverdue} 
                    highlight 
                  />
                  <KanbanCol 
                    title="Concluído" 
                    theme={theme} 
                    tasks={activeTask.subTasks.filter(s => s.status === 'done' && !s.archived).sort(sortByDueDate)} 
                    onDrop={() => onDrop('done')} 
                    onDragOver={(e: React.DragEvent) => e.preventDefault()} 
                    onDragStart={setDraggedSubTaskId} 
                    onEditSubTask={(st: SubTask, e: any) => handleOpenEditSubTask(activeTask.id, st, e)} 
                    onDuplicateSubTask={(st: SubTask, e: any) => handleOpenDuplicateSubTask(activeTask.id, st, e)}
                    onDeleteSubTask={(subId: string) => handleDeleteSubTask(activeTask.id, subId)} 
                    formatDate={formatDate} 
                    isOverdue={isOverdue} 
                    onArchive={() => handleArchiveDoneSubTasks(activeTask.id)}
                  />
                </div>
              </>
            ) : (
              <div className={`text-center py-32 ${bgCard} rounded-[3rem] border-2 border-dashed ${borderMain}`}>
                <Target size={54} className="text-slate-200 mx-auto mb-6" />
                <button onClick={() => setView('global')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black">Ver Objetivos</button>
              </div>
            )}
          </div>
        )}

        {view === 'rewards' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className={`${theme === 'light' ? 'bg-slate-900' : 'bg-black'} rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-slate-800`}>
               <div>
                  <p className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-2">Saldo de Recompensas</p>
                  <h3 className="text-6xl font-black tabular-nums">{stats.points} <span className="text-xl text-slate-500 uppercase">pts</span></h3>
               </div>
               <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center rotate-6 shadow-xl"><Trophy size={48} /></div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-600/10 text-indigo-500 rounded-xl"><Gift size={24} /></div>
                 <h3 className="text-2xl font-black">Recompensas Disponíveis</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map(reward => (
                  <div key={reward.id} className={`${bgCard} p-8 rounded-[2.5rem] border-2 transition-all relative group flex flex-col justify-between ${stats.points >= reward.cost ? 'border-indigo-600/20 shadow-md' : `${borderCard} opacity-60`}`}>
                    <button onClick={() => handleDeleteReward(reward.id)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    <div className="text-5xl mb-6">{reward.icon}</div>
                    <div>
                      <h4 className="text-xl font-black mb-1">{reward.title}</h4>
                      <p className="text-indigo-500 font-black text-sm uppercase tracking-wider">{reward.cost} pontos</p>
                    </div>
                    <button 
                      disabled={stats.points < reward.cost}
                      onClick={() => handleRedeemReward(reward)}
                      className={`mt-8 w-full py-4 rounded-2xl font-black transition-all ${stats.points >= reward.cost ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/20' : (theme === 'light' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-slate-600 cursor-not-allowed')}`}
                    >Resgatar</button>
                  </div>
                ))}
                <button onClick={() => setActiveModal('reward')} className={`p-8 h-full min-h-[250px] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all group ${bgCard} ${borderMain} ${textMuted} hover:border-purple-600/40 hover:text-purple-500`}>
                   <PlusCircle size={32} />
                   <span className="font-bold text-xs uppercase mt-3 tracking-widest">Novo Prêmio</span>
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl"><ShoppingBag size={24} /></div>
                   <h3 className="text-2xl font-black">Histórico de prêmios</h3>
                </div>
                {redeemedRewards.length > 0 && (
                  <button onClick={() => { if(confirm("Deseja limpar todo o histórico?")) setRedeemedRewards([]); }} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${theme === 'light' ? 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500' : 'bg-slate-800 text-slate-500 hover:bg-rose-900/20 hover:text-rose-400'}`}>Limpar Tudo</button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {redeemedRewards.length > 0 ? (
                  redeemedRewards.map(record => (
                    <div key={record.id} className={`${bgCard} p-5 rounded-[2rem] border ${borderCard} flex items-center gap-4 group relative`}>
                      <div className="text-3xl p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">{record.icon}</div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-sm truncate">{record.title}</h4>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-indigo-500 uppercase">{record.cost} pts</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><Clock size={10} /> {formatFullDate(record.redeemedAt)}</span>
                         </div>
                      </div>
                      <button onClick={() => handleDeleteRedeemed(record.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                    </div>
                  ))
                ) : (
                  <div className={`col-span-full py-16 text-center ${bgCard} rounded-[3rem] border-2 border-dashed ${borderMain}`}>
                     <ShoppingBag size={40} className="text-slate-200 mx-auto mb-4" />
                     <p className={`text-sm font-bold ${textMuted}`}>Você ainda não resgatou nenhum prêmio. Comece a acumular pontos!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'metrics' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className={`${bgCard} p-8 rounded-[3rem] border ${borderCard} shadow-sm`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/10 text-indigo-500 rounded-xl"><TrendingUp size={24} /></div>
                    <h3 className="text-xl font-black tracking-tight">Análise Mensal de Desempenho</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Filtrar Mês:</label>
                    <div className="relative group">
                      <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl border-2 font-black text-xs outline-none transition-all cursor-pointer ${theme === 'light' ? 'bg-white border-slate-100 hover:border-indigo-200' : 'bg-slate-800 border-slate-700 hover:border-indigo-500'}`}
                      >
                        {monthOptions.map(m => (
                          <option key={m} value={m}>{formatMonthName(m)}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                   <div className={`p-8 rounded-[2.5rem] border ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-indigo-950/20 border-indigo-900/40'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Foco Acumulado no Mês</span>
                      </div>
                      <div className="text-4xl font-black text-indigo-500 tabular-nums">
                        {formatTimeSpent(filteredMetrics.totalMinutes)}
                      </div>
                   </div>
                   <div className={`p-8 rounded-[2.5rem] border ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-emerald-950/20 border-emerald-900/40'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Objetivos Concluídos no Mês</span>
                      </div>
                      <div className="text-4xl font-black text-emerald-500 tabular-nums">
                        {filteredMetrics.completedCount}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1 mb-4">Distribuição de Foco</h4>
                  {filteredMetrics.tasks.length > 0 ? filteredMetrics.tasks.map((item, idx) => (
                    <div key={idx} className="space-y-2 group">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 max-w-[70%]">
                           {item.completed ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Clock size={12} className="text-indigo-400" />}
                           <span className="text-xs font-black truncate">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => { setTaskToMove(item.id); setActiveModal('move-task'); }}
                             className={`p-1.5 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all opacity-0 group-hover:opacity-100`}
                             title="Mover para outro mês"
                           >
                             <CalendarDays size={14} />
                           </button>
                           <span className="text-[10px] font-bold text-indigo-500">{formatTimeSpent(item.time)}</span>
                        </div>
                      </div>
                      <div className={`w-full h-4 rounded-full p-0.5 border ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700'}`}>
                        <div className={`h-full rounded-full transition-all duration-500 ${item.completed ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${Math.max(item.percentage, 2)}%` }} />
                      </div>
                    </div>
                  )) : <div className="text-center py-20 opacity-40 uppercase font-black text-xs">Sem atividades neste mês.</div>}
                </div>
             </div>
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8"><div className="p-2 bg-indigo-600/10 text-indigo-500 rounded-xl"><CheckCircle2 size={24} /></div><h3 className="text-xl font-black tracking-tight">Galeria de Objetivos Concluídos</h3></div>
            {completedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedTasks.map(task => {
                  const totalEarnedPoints = (task.rewardPoints || 0) + (task.subTasks || []).reduce((acc, st) => acc + (st.rewardPoints || 0), 0);
                  return (
                    <div key={task.id} onClick={() => handleReactivateTask(task.id)} className={`${bgCard} p-8 rounded-[3rem] border ${borderCard} shadow-sm flex flex-col justify-between group relative cursor-pointer hover:border-indigo-500 transition-all`}>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteHistoryTask(task.id); }} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> Concluído</span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>{task.completedAt ? new Date(task.completedAt).toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                        <h3 className="text-xl font-black mb-3 pr-8">{task.title}</h3>
                        <div className={`flex items-center gap-4 ${textMuted}`}>
                          <div className="flex items-center gap-1 text-[11px] font-bold"><Clock size={14} className="text-indigo-500" /><span>Tempo Focado: {formatTimeSpent(task.totalTimeSpent)}</span></div>
                        </div>
                      </div>
                      <div className={`mt-6 pt-6 border-t ${borderCard} flex items-center justify-between`}>
                         <div className="flex flex-col">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Recompensa Ganha:</span>
                           <span className="text-[8px] font-medium opacity-40 uppercase tracking-tighter">(Objetivo + Micro-tarefas)</span>
                         </div>
                         <div className="flex items-center gap-1 text-indigo-500 font-black"><Zap size={14} fill="currentColor" /> +{totalEarnedPoints} pts</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-32 ${bgCard} rounded-[3rem] border-2 border-dashed ${borderMain}`}>
                <History size={54} className="text-slate-200 mx-auto mb-6" />
                <button onClick={() => setView('global')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black">Começar uma Jornada</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Undo Toast Notification */}
      {undoToast && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5">
          <div className={`${theme === 'light' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4`}>
             <span className="text-sm font-bold">{undoToast.message}</span>
             <button 
               onClick={() => {
                 undoToast.onUndo();
                 setUndoToast(null);
               }}
               className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${theme === 'light' ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'}`}
             >
               <Undo2 size={14} /> Desfazer
             </button>
             <button onClick={() => setUndoToast(null)} className="opacity-50 hover:opacity-100"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md animate-in fade-in duration-300" />
           <div className={`relative p-12 rounded-[4rem] text-center shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col items-center border ${theme === 'light' ? 'bg-white border-white' : 'bg-slate-900 border-slate-800'}`}>
              <div className="w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce"><Star size={48} className="text-white" fill="currentColor" /></div>
              <h2 className="text-4xl font-black tracking-tighter mb-2">OBJETIVO ALCANÇADO!</h2>
              <div className="bg-indigo-700 text-white px-8 py-4 rounded-3xl flex items-center gap-3 shadow-lg shadow-indigo-900/30">
                 <Zap size={32} fill="currentColor" />
                 <div className="text-left"><span className="text-[10px] font-black uppercase tracking-widest opacity-70">Recompensa Extra</span><div className="text-2xl font-black leading-none">+{showCelebration.points} PONTOS</div></div>
              </div>
           </div>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'move-task' && taskToMove && (
        <Modal title="Remanejar para outro Mês" onClose={() => { setActiveModal(null); setTaskToMove(null); }} theme={theme}>
          <div className="space-y-4">
            <p className="text-xs italic opacity-60 mb-6">Mover este registro alterará seu prazo planejado ou sua data de conclusão histórica.</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {monthOptions.map(month => (
                <button
                  key={month}
                  onClick={() => handleMoveTaskToMonth(taskToMove, month)}
                  className={`w-full p-4 rounded-2xl border-2 font-black text-sm text-left transition-all flex items-center justify-between group ${selectedMonth === month ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-indigo-200'}`}
                >
                  {formatMonthName(month)}
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setActiveModal(null); setTaskToMove(null); }}
              className="w-full mt-4 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-2xl"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'macro' && (
        <Modal title="Novo Objetivo Macro" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Título do Objetivo</label>
              <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Ex: Organizar o Escritório" className={`w-full p-4 border-2 rounded-2xl font-bold text-lg outline-none focus:border-indigo-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Contexto Rápido</label>
              <input value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} placeholder="Por que isso é importante?" className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Prazo Final</label>
              <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <button onClick={handleCreateMacro} disabled={!newTaskTitle.trim()} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-900/20 hover:scale-[1.02] transition-all disabled:opacity-50">Começar Projeto</button>
          </div>
        </Modal>
      )}

      {activeModal === 'monthly' && (
        <Modal title="Objetivos do Mês" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-6">
            <p className={`text-xs italic ${textMuted}`}>Orientação estratégica para seus objetivos macro.</p>
            
            <div className="flex gap-2">
              <input 
                autoFocus 
                value={newMonthlyGoal} 
                onChange={e => setNewMonthlyGoal(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleAddMonthlyGoal()}
                placeholder="Adicionar item..." 
                className={`flex-1 p-3 border-2 rounded-xl font-bold text-sm outline-none focus:border-indigo-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} 
              />
              <button 
                onClick={handleAddMonthlyGoal} 
                disabled={!newMonthlyGoal.trim()}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {monthlyGoals.length > 0 ? (
                monthlyGoals.map(goal => (
                  <div key={goal.id} className={`flex items-center gap-3 p-3 rounded-xl border group transition-all ${goal.completed ? (theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-950/20 border-emerald-900/40') : (theme === 'light' ? 'bg-white border-slate-100' : 'bg-slate-800/50 border-slate-700')}`}>
                    <button 
                      onClick={() => toggleMonthlyGoal(goal.id)}
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${goal.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (theme === 'light' ? 'border-slate-300 hover:border-indigo-400' : 'border-slate-600 hover:border-indigo-500')}`}
                    >
                      {goal.completed && <Check size={14} />}
                    </button>
                    <span className={`flex-1 text-sm font-bold ${goal.completed ? 'line-through opacity-50' : ''}`}>
                      {goal.text}
                    </span>
                    <button 
                      onClick={() => deleteMonthlyGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-40">
                  <FileText size={40} className="mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhum foco definido para este mês.</p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setActiveModal(null)} 
              className="w-full bg-slate-900 dark:bg-black text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg"
            >
              Fechar Revisão
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'task' && (
        <Modal title="Nova Micro-tarefa" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>O que precisa ser feito?</label>
              <input autoFocus value={taskToProject.title} onChange={e => setTaskToProject({...taskToProject, title: e.target.value})} placeholder="Ex: Tirar o lixo da mesa" className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-4 block ${textMuted}`}>Nível de Esforço</label>
              <div className="grid grid-cols-1 gap-3">
                {COMPLEXITY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setTaskToProject({ ...taskToProject, points: level.points })}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                      taskToProject.points === level.points 
                        ? (theme === 'light' ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-indigo-400 bg-indigo-900/20 shadow-sm') 
                        : (theme === 'light' ? 'border-slate-100 bg-slate-50 hover:border-slate-200' : 'border-slate-800 bg-slate-800 hover:border-slate-700')
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${taskToProject.points === level.points ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      {level.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-sm">{level.label}</span>
                        <span className={`text-[10px] font-black ${taskToProject.points === level.points ? 'text-indigo-500' : 'text-slate-400'}`}>+{level.points} PTS</span>
                      </div>
                      <p className={`text-[10px] opacity-60 leading-tight ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{level.example}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Prazo da Tarefa (Opcional)</label>
              <input type="date" value={taskToProject.dueDate} onChange={e => setTaskToProject({...taskToProject, dueDate: e.target.value})} className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Observação (Opcional)</label>
              <textarea value={taskToProject.notes} onChange={e => setTaskToProject({...taskToProject, notes: e.target.value})} placeholder="Algo para não esquecer..." className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 resize-none h-20 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Link (Opcional)</label>
              <input value={taskToProject.link} onChange={e => setTaskToProject({...taskToProject, link: e.target.value})} placeholder="https://..." className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>

            <button onClick={handleAddTaskToProject} disabled={!taskToProject.title.trim()} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all disabled:opacity-50">Adicionar à Lista</button>
          </div>
        </Modal>
      )}

      {activeModal === 'edit-macro' && editingMacro && (
        <Modal title="Editar Objetivo" onClose={() => { setActiveModal(null); setEditingMacro(null); }} theme={theme}>
          <div className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Título do Objetivo</label>
              <input autoFocus value={editingMacro.title} onChange={e => setEditingMacro({...editingMacro, title: e.target.value})} className={`w-full p-4 border-2 rounded-2xl font-bold text-lg outline-none focus:border-indigo-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Contexto Rápido</label>
              <input value={editingMacro.description} onChange={e => setEditingMacro({...editingMacro, description: e.target.value})} className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Prazo Final</label>
              <input type="date" value={editingMacro.dueDate} onChange={e => setEditingMacro({...editingMacro, dueDate: e.target.value})} className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <button onClick={handleUpdateMacro} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all">Salvar Alterações</button>
          </div>
        </Modal>
      )}

      {activeModal === 'edit-task' && editingSubTask && (
        <Modal title="Editar Micro-tarefa" onClose={() => { setActiveModal(null); setEditingSubTask(null); }} theme={theme}>
          <div className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Título da Tarefa</label>
              <input autoFocus value={editingSubTask.subTask.title} onChange={e => setEditingSubTask({...editingSubTask, subTask: {...editingSubTask.subTask, title: e.target.value}})} className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-4 block ${textMuted}`}>Nível de Esforço</label>
              <div className="grid grid-cols-1 gap-2">
                {COMPLEXITY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setEditingSubTask({...editingSubTask, subTask: {...editingSubTask.subTask, rewardPoints: level.points}})}
                    className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${
                      editingSubTask.subTask.rewardPoints === level.points 
                        ? (theme === 'light' ? 'border-indigo-600 bg-indigo-50' : 'border-indigo-400 bg-indigo-900/20') 
                        : (theme === 'light' ? 'border-slate-100 bg-slate-50' : 'border-slate-800 bg-slate-800')
                    }`}
                  >
                    <div className="flex-1 font-bold text-sm">{level.label}</div>
                    <div className="text-[10px] font-black text-indigo-500">+{level.points} PTS</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Prazo (Opcional)</label>
              <input type="date" value={editingSubTask.subTask.dueDate || ""} onChange={e => setEditingSubTask({...editingSubTask, subTask: {...editingSubTask.subTask, dueDate: e.target.value}})} className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Link (Opcional)</label>
              <input 
                value={editingSubTask.subTask.link || ""} 
                onChange={e => setEditingSubTask({...editingSubTask, subTask: {...editingSubTask.subTask, link: e.target.value}})} 
                placeholder="https://..." 
                className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} 
              />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Comentários / Notas</label>
              <textarea 
                value={editingSubTask.subTask.notes || ""} 
                onChange={e => setEditingSubTask({...editingSubTask, subTask: {...editingSubTask.subTask, notes: e.target.value}})} 
                placeholder="Adicione observações para esta micro-tarefa..." 
                className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 resize-none h-24 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} 
              />
            </div>

            <button onClick={handleUpdateSubTask} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all"><Save size={20} className="inline mr-2" /> Atualizar Tarefa</button>
          </div>
        </Modal>
      )}

      {activeModal === 'duplicate-task' && taskToDuplicate && (
        <Modal title="Duplicar para outro Objetivo" onClose={() => { setActiveModal(null); setTaskToDuplicate(null); }} theme={theme}>
          <div className="space-y-4">
            <p className={`text-xs italic mb-6 ${textMuted}`}>Selecione o destino desta micro-tarefa:</p>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.filter(t => !t.completed && t.id !== taskToDuplicate.taskId).length > 0 ? (
                tasks.filter(t => !t.completed && t.id !== taskToDuplicate.taskId).map(target => (
                  <button 
                    key={target.id}
                    onClick={() => handleConfirmDuplicate(target.id)}
                    className={`w-full p-5 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between group ${theme === 'light' ? 'bg-slate-50 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/30' : 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/20'}`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="block font-black text-sm truncate">{target.title}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest opacity-40`}>{target.subTasks.length} sub-tarefas</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="text-center py-12 opacity-40">
                  <AlertCircle size={40} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Nenhum outro objetivo ativo encontrado.</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => { setActiveModal(null); setTaskToDuplicate(null); }} 
              className="w-full mt-4 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-2xl transition-all"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'link' && (
        <Modal title="Anexar Link de Referência" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Nome do Link</label>
              <input autoFocus value={newLink.title} onChange={e => setNewLink({...newLink, title: e.target.value})} placeholder="Ex: Referência Visual" className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>URL (Link Completo)</label>
              <input value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} placeholder="Ex: google.com" className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <button onClick={handleAddLink} disabled={!newLink.title.trim() || !newLink.url.trim()} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50">Salvar Link</button>
          </div>
        </Modal>
      )}

      {activeModal === 'reward' && (
        <Modal title="Criar Recompensa" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-6">
             <div className={`grid grid-cols-6 gap-2 p-4 rounded-3xl max-h-40 overflow-y-auto ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
               {EMOJI_OPTIONS.map(emoji => (
                 <button key={emoji} onClick={() => setNewReward({...newReward, icon: emoji})} className={`text-2xl p-2 rounded-xl transition-all ${newReward.icon === emoji ? 'bg-white shadow-md scale-110 border-2 border-purple-200' : 'hover:bg-black/5'}`}>{emoji}</button>
               ))}
             </div>
             <input autoFocus value={newReward.title} onChange={e => setNewReward({...newReward, title: e.target.value})} placeholder="Nome do Prêmio" className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-purple-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
             <input type="number" value={newReward.cost} onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value) || 0})} className={`w-full p-4 border-2 rounded-2xl font-black text-center text-2xl text-purple-500 outline-none ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700'}`} />
             <button onClick={handleCreateReward} disabled={!newReward.title.trim()} className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all">Criar Prêmio</button>
          </div>
        </Modal>
      )}

      {activeModal === 'settings' && (
        <Modal title="Configurações e Backup" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Segurança dos Dados</h4>
              <p className="text-xs leading-relaxed opacity-70">Baixe um backup completo para restaurar seus dados em outro navegador.</p>
              
              <div className="grid grid-cols-1 gap-3">
                <button onClick={handleExportData} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-indigo-600/20 bg-indigo-600/5 hover:bg-indigo-600/10 transition-all group">
                  <div className="flex items-center gap-3">
                    <Download size={20} className="text-indigo-600" />
                    <span className="font-bold text-sm">Baixar Backup</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-600/20 bg-emerald-600/5 hover:bg-emerald-600/10 transition-all group">
                  <div className="flex items-center gap-3">
                    <Upload size={20} className="text-emerald-600" />
                    <span className="font-bold text-sm">Restaurar de Arquivo</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, theme }: any) => {
  const isActive = active;
  const isLight = theme === 'light';
  return (
    <button onClick={onClick} className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 w-full px-4 py-2 md:py-4 rounded-2xl transition-all ${isActive ? (isLight ? 'text-indigo-600 bg-indigo-50 font-black' : 'text-indigo-400 bg-indigo-950/30 font-black') : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50')}`}>
      {icon}
      <span className="text-[9px] md:text-sm uppercase md:capitalize font-bold tracking-tight">{label}</span>
    </button>
  );
};

const MacroCard = ({ task, onFocus, onEdit, onDelete, formatDate, isOverdue, theme, formatTimeSpent }: any) => {
  const completed = task.subTasks.filter((s:any) => s.completed).length;
  const total = task.subTasks.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const isLight = theme === 'light';

  // Verifica se há alguma sub-tarefa ativa com data de hoje
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  const hasTaskForToday = task.subTasks.some((st: any) => st.dueDate === todayStr && !st.completed);

  return (
    <div onClick={onFocus} className={`p-8 rounded-[3rem] border-2 transition-all cursor-pointer shadow-sm group relative flex flex-col justify-between h-72 ${isLight ? 'bg-white border-slate-50 hover:border-indigo-100' : 'bg-slate-900 border-slate-800 hover:border-indigo-500/30'}`}>
      <div className="absolute top-6 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={16} /></button>
        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
      </div>
      <div>
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${isLight ? 'bg-slate-50 text-slate-400' : 'bg-slate-800 text-slate-500'}`}>Projeto</span>
          
          {hasTaskForToday && (
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" title="Tem micro-tarefa para hoje!" />
          )}

          {(task.totalTimeSpent || 0) > 0 && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-900/30 text-indigo-400'}`}>
              <Timer size={10} /> {formatTimeSpent(task.totalTimeSpent)}
            </span>
          )}
          {task.dueDate && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 ${isOverdue(task.dueDate) ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <Calendar size={10} /> {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <h3 className={`text-xl font-black leading-tight group-hover:text-indigo-500 transition-colors line-clamp-2 pr-12 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{task.title}</h3>
      </div>
      <div className="mt-auto pt-6">
        <div className="flex justify-between items-end mb-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{completed}/{total} tarefas</span>
          <span className="text-sm font-black text-indigo-500">{Math.round(pct)}%</span>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700'}`}>
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

const KanbanCol = ({ title, tasks, onDrop, onDragOver, onDragStart, onEditSubTask, onDuplicateSubTask, onDeleteSubTask, formatDate, isOverdue, highlight, theme, onArchive }: any) => {
  const isLight = theme === 'light';
  return (
    <div className={`flex flex-col h-full rounded-[3rem] p-5 border-2 border-dashed ${highlight ? (isLight ? 'bg-indigo-50/20 border-indigo-100' : 'bg-indigo-950/10 border-indigo-900/30') : (isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/20 border-slate-800/50')}`} onDrop={onDrop} onDragOver={onDragOver}>
      <div className="flex items-center justify-between mb-6 px-3">
         <div className="flex flex-col">
            <h4 className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>{title}</h4>
            {title === "Concluído" && tasks.length > 0 && (
              <button onClick={onArchive} className={`mt-1 flex items-center gap-1 text-[9px] font-bold uppercase transition-colors ${isLight ? 'text-indigo-400 hover:text-indigo-600' : 'text-indigo-500 hover:text-indigo-400'}`}><Archive size={10} /> Arquivar</button>
            )}
         </div>
         <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border shadow-sm ${isLight ? 'bg-white text-slate-400 border-slate-100' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{tasks.length}</span>
      </div>
      <div className="flex-1 space-y-4">
        {tasks.map((t: any) => (
          <div key={t.id} draggable onDragStart={() => onDragStart(t.id)} onClick={() => onEditSubTask(t)} className={`p-5 rounded-3xl shadow-sm border cursor-pointer hover:shadow-lg transition-all group relative ${t.completed ? 'opacity-50' : ''} ${isLight ? 'bg-white border-slate-100 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-200'}`}>
            <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={(e) => onDuplicateSubTask(t, e)} title="Duplicar para outro objetivo" className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Copy size={12} /></button>
              <button onClick={(e) => onEditSubTask(t, e)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Pencil size={12} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteSubTask(t.id); }} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
            </div>
            <div className="flex items-start gap-3">
               <GripVertical size={16} className={`${isLight ? 'text-slate-200 group-hover:text-slate-400' : 'text-slate-700 group-hover:text-slate-500'} mt-0.5`} />
               <div className="flex-1">
                  <p className={`font-bold leading-tight pr-8 ${t.completed ? 'line-through' : ''}`}>{t.title}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {t.notes && (
                      <div className="flex items-start gap-1">
                        <MessageSquare size={10} className="mt-1 flex-shrink-0 text-indigo-400" />
                        <p className={`text-[10px] italic leading-tight ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{t.notes}</p>
                      </div>
                    )}
                    {t.link && (
                      <a href={t.link.startsWith('http') ? t.link : `https://${t.link}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:underline"><Link2 size={10} /> Link de Referência</a>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase"><Zap size={10} fill="currentColor" /> +{t.rewardPoints} pts</div>
                    {t.dueDate && !t.completed && (
                      <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${isOverdue(t.dueDate) ? 'text-rose-500' : 'text-emerald-500'}`}><Calendar size={10} /> {formatDate(t.dueDate)}</div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className={`h-24 border-2 border-dashed rounded-3xl flex items-center justify-center ${isLight ? 'border-slate-100' : 'border-slate-800'}`}><span className={`text-[8px] font-black uppercase tracking-widest ${isLight ? 'text-slate-200' : 'text-slate-700'}`}>Solte aqui</span></div>}
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children, theme }: any) => {
  const isLight = theme === 'light';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-sm:max-w-none max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 border overflow-y-auto max-h-[90vh] ${isLight ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-800'}`}>
        <button onClick={onClose} className={`absolute right-8 top-8 transition-colors ${isLight ? 'text-slate-300 hover:text-slate-600' : 'text-slate-600 hover:text-slate-300'}`}><X size={28} /></button>
        <h3 className={`text-2xl font-black mb-8 tracking-tighter ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default App;
