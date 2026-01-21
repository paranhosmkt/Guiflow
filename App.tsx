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
  Moon
} from 'lucide-react';
import { Task, UserStats, Reward, SubTask, TaskStatus } from './types';

// Constantes para LocalStorage
const STORAGE_KEYS = {
  TASKS: 'guiflow_tasks_v2',
  COMPLETED_TASKS: 'guiflow_completed_tasks_v2',
  REWARDS: 'guiflow_rewards_v2',
  STATS: 'guiflow_stats_v2',
  THEME: 'guiflow_theme_v2'
};

const MOTIVATION_QUOTES = [
  "Progresso, não perfeição.",
  "Um pequeno passo ainda é movimento para frente.",
  "Sua mente funciona de forma única, e isso é seu superpoder.",
  "Respire. Uma coisa de cada vez.",
  "Comemore as pequenas vitórias de hoje!",
  "Feito é melhor que perfeito.",
  "Você está indo muito bem, continue!"
];

const EMOJI_OPTIONS = [
  '🎁', '🍫', '🍦', '🍕', '🎮', '🎬', '📺', '📱', '🛌', '🧘', 
  '🛀', '🚶', '📚', '🎨', '🎧', '🎸', '🛹', '🍦', '🧁', '🍕',
  '☕', '🍵', '🍷', '🍺', '🏖️', '⛰️', '🎡', '🎢', '💎', '💰'
];

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', title: '15 min de descanso total', cost: 50, icon: '🧘' },
  { id: 'r2', title: 'Comer um doce', cost: 100, icon: '🍫' },
  { id: 'r3', title: 'Episódio de série', cost: 300, icon: '📺' },
];

const App: React.FC = () => {
  // Estados com carregamento do LocalStorage
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

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : { points: 0, tasksCompleted: 0, streak: 1 };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as 'light' | 'dark') || 'light';
  });

  const [view, setView] = useState<'global' | 'local' | 'rewards' | 'history'>('global');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [motivation, setMotivation] = useState("");
  const [draggedSubTaskId, setDraggedSubTaskId] = useState<string | null>(null);

  // Pomodoro Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Modais
  const [activeModal, setActiveModal] = useState<'macro' | 'task' | 'reward' | null>(null);

  // Forms
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [taskToProject, setTaskToProject] = useState({ title: "", points: 20, projectId: "", dueDate: "" });
  const [newReward, setNewReward] = useState({ title: "", cost: 50, icon: "🎁" });

  // Sincronização LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(completedTasks)); }, [completedTasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards)); }, [rewards]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.THEME, theme); }, [theme]);

  useEffect(() => {
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    setMotivation(randomQuote);
  }, [stats.tasksCompleted, view]);

  // Timer Logic
  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      timerRef.current = window.setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerActive, timerSeconds]);

  const handleTimerComplete = () => {
    setIsTimerActive(false);
    if (timerMode === 'work') {
      const nextCycles = cyclesCompleted + 1;
      setCyclesCompleted(nextCycles);
      setStats(s => ({ ...s, points: s.points + 15 }));
      
      // Adicionar tempo focado ao objetivo ativo
      if (activeTaskId) {
        setTasks(prev => prev.map(t => 
          t.id === activeTaskId 
            ? { ...t, totalTimeSpent: (t.totalTimeSpent || 0) + 25 } 
            : t
        ));
      }

      setTimerMode('break');
      if (nextCycles % 6 === 0) {
        setTimerSeconds(45 * 60); 
        alert("Ciclo 6 concluído! Hora de um descanso longo (45 min). Ganhou 15 pontos e registrou 25 min de foco.");
      } else {
        setTimerSeconds(5 * 60);
        alert(`Bloco de foco ${nextCycles}/6 concluído! Ganhou 15 pontos e registrou 25 min de foco.`);
      }
    } else {
      setTimerMode('work');
      setTimerSeconds(25 * 60);
      alert("Pausa concluída! Pronto para o próximo bloco de foco?");
    }
  };

  const handleCreateMacro = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "",
      priority: 'medium',
      status: 'todo',
      dueDate: newTaskDate || new Date().toISOString().split('T')[0],
      estimatedTime: 30,
      category: 'Geral',
      completed: false,
      subTasks: [],
      rewardPoints: 50,
      totalTimeSpent: 0
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDate("");
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

  const handleAddTaskToProject = () => {
    const targetId = taskToProject.projectId || activeTaskId;
    if (!taskToProject.title.trim() || !targetId) return;

    const newSub: SubTask = { 
      id: Math.random().toString(36).substr(2, 9), 
      title: taskToProject.title, 
      completed: false, 
      status: 'todo',
      rewardPoints: taskToProject.points,
      dueDate: taskToProject.dueDate
    };

    setTasks(prev => prev.map(t => t.id === targetId ? { ...t, subTasks: [...t.subTasks, newSub] } : t));
    setTaskToProject({ title: "", points: 20, projectId: "", dueDate: "" });
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
          return {
            ...t,
            subTasks: t.subTasks.filter(st => st.id !== subId)
          };
        }
        return t;
      }));
    }
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

    setStats(s => ({ ...s, points: s.points + task.rewardPoints, tasksCompleted: s.tasksCompleted + 1 }));
    setCompletedTasks([finalizedTask, ...completedTasks]);
    setTasks(prev => prev.filter(t => t.id !== id));
    setView('history');
    setActiveTaskId(null);
  };

  const handleCreateReward = () => {
    if (!newReward.title.trim()) return;
    const reward: Reward = {
      id: Date.now().toString(),
      ...newReward
    };
    setRewards([...rewards, reward]);
    setNewReward({ title: "", cost: 50, icon: "🎁" });
    setActiveModal(null);
  };

  const handleDeleteReward = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
  };

  const activeTask = useMemo(() => tasks.find(t => t.id === activeTaskId) || null, [tasks, activeTaskId]);

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

  const formatTimeSpent = (minutes: number = 0) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
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

  // Classes dinâmicas baseadas no tema
  const bgMain = theme === 'light' ? 'bg-slate-50' : 'bg-slate-950';
  const bgCard = theme === 'light' ? 'bg-white' : 'bg-slate-900';
  const textMain = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const textMuted = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const borderMain = theme === 'light' ? 'border-slate-200' : 'border-slate-800';
  const borderCard = theme === 'light' ? 'border-slate-100' : 'border-slate-800';

  return (
    <div className={`min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col transition-colors duration-300 ${bgMain} ${textMain}`}>
      {/* Sidebar */}
      <nav className={`fixed bottom-0 left-0 w-full h-16 ${bgCard} border-t ${borderMain} flex items-center justify-around z-50 md:top-0 md:left-0 md:w-64 md:h-full md:flex-col md:justify-start md:p-6 md:border-r shadow-2xl transition-colors duration-300`}>
        <div className="hidden md:flex items-start justify-between mb-10 w-full">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg mt-1"><Zap size={22} fill="currentColor" /></div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">GUIFLOW</h1>
              <p className={`text-[10px] font-bold tracking-tight mt-1 ${textMuted}`}>Clareza para mentes inquietas</p>
            </div>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-xl transition-colors ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-amber-400'}`}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <div className="flex w-full justify-around md:flex-col md:gap-4">
          <NavItem active={view === 'global'} onClick={() => setView('global')} icon={<LayoutDashboard size={20} />} label="Geral" theme={theme} />
          <NavItem active={view === 'local'} onClick={() => setView('local')} icon={<Target size={20} />} label="Foco" theme={theme} />
          <NavItem active={view === 'rewards'} onClick={() => setView('rewards')} icon={<Trophy size={20} />} label="Prêmios" theme={theme} />
          <NavItem active={view === 'history'} onClick={() => setView('history')} icon={<History size={20} />} label="Histórico" theme={theme} />
          
          {/* Mobile Theme Toggle */}
          <button onClick={toggleTheme} className="md:hidden flex flex-col items-center gap-1 px-4 py-2 text-slate-400">
             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-amber-400" />}
             <span className="text-[9px] uppercase font-bold tracking-tight">Tema</span>
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
              {view === 'global' ? 'Visão Geral' : view === 'local' ? 'Foco Local' : view === 'rewards' ? 'Recompensas' : 'Histórico de Conquistas'}
            </h2>
            <div className={`flex items-center gap-2 ${textMuted}`}>
              <Lightbulb size={16} className="text-amber-500" />
              <p className="text-sm font-medium italic">{motivation}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
             {view === 'global' && (
                <button onClick={() => setActiveModal('macro')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-200/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={20} /> Novo Objetivo
                </button>
             )}
             {view === 'rewards' && (
                <button onClick={() => setActiveModal('reward')} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-purple-200/50 hover:scale-105 transition-all flex items-center gap-2">
                  <Gift size={20} /> Novo Prêmio
                </button>
             )}
          </div>
        </header>

        {/* Views */}
        {view === 'global' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {tasks.filter(t => !t.completed).map(task => (
              <MacroCard key={task.id} task={task} theme={theme} onFocus={() => { setActiveTaskId(task.id); setView('local'); }} onDelete={(e: React.MouseEvent) => handleDeleteMacro(task.id, e)} formatDate={formatDate} isOverdue={isOverdue} />
            ))}
            
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className={`col-span-full py-24 text-center ${bgCard} rounded-[3rem] border-2 border-dashed ${borderMain} flex flex-col items-center`}>
                 <div className={`w-20 h-20 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'} rounded-full flex items-center justify-center mb-4`}><AlertCircle size={40} className="text-slate-400" /></div>
                 <h3 className={`text-xl font-black ${textMuted} mb-2`}>Sem objetivos ativos.</h3>
                 <p className={`${textMuted} mb-8 max-w-xs`}>Que tal criar seu primeiro objetivo macro agora?</p>
                 <button onClick={() => setActiveModal('macro')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black">Começar Agora</button>
              </div>
            )}
          </div>
        )}

        {view === 'local' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {activeTask ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Project Summary Card */}
                  <div className={`${bgCard} p-8 rounded-[3rem] border ${borderCard} shadow-sm flex flex-col justify-between`}>
                    <div className="lg:col-span-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-indigo-600/10 text-indigo-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Foco Atual</span>
                        {activeTask.dueDate && (
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOverdue(activeTask.dueDate) ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            <Calendar size={10} /> Prazo: {formatDate(activeTask.dueDate)}
                          </span>
                        )}
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'}`}>
                          <Clock size={10} /> Focado: {formatTimeSpent(activeTask.totalTimeSpent)}
                        </span>
                      </div>
                      <h2 className="text-3xl font-black mb-2">{activeTask.title}</h2>
                      <p className={textMuted}>Mova as tarefas entre as colunas conforme progride.</p>
                    </div>
                    <div className="mt-8 flex gap-3">
                      <button onClick={() => finishMacroProject(activeTask.id)} className={`px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-2 shadow-xl ${theme === 'light' ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-indigo-600 text-white shadow-indigo-900/40'}`}>
                        <CheckCircle2 size={20} className={theme === 'light' ? 'text-indigo-400' : 'text-white'} /> Finalizar Objetivo (+{activeTask.rewardPoints} pts)
                      </button>
                    </div>
                  </div>

                  {/* Pomodoro Timer Container */}
                  <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className={`p-8 rounded-[3rem] border-2 shadow-sm flex flex-col items-center justify-center transition-all relative overflow-hidden ${timerMode === 'work' ? (theme === 'light' ? 'bg-rose-50 border-rose-100' : 'bg-rose-950/20 border-rose-900/50') : (theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-950/20 border-emerald-900/50')}`}>
                      <div className={`absolute top-4 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'bg-white/50 text-slate-500' : 'bg-black/20 text-slate-400'}`}>
                        Ciclo {(cyclesCompleted % 6) + 1}/6
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                         {timerMode === 'work' ? <Timer className="text-rose-500" size={18} /> : <Coffee className="text-emerald-500" size={18} />}
                         <span className={`text-xs font-black uppercase tracking-widest ${timerMode === 'work' ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {timerMode === 'work' ? 'Foco Profundo' : (cyclesCompleted % 6 === 0 ? 'Pausa Longa' : 'Pausa')}
                         </span>
                      </div>
                      <div className="text-6xl font-black tabular-nums tracking-tighter mb-8">{Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}</div>
                      <div className="flex gap-4">
                         <button onClick={() => setIsTimerActive(!isTimerActive)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${timerMode === 'work' ? 'bg-rose-600 shadow-rose-900/20' : 'bg-emerald-600 shadow-emerald-900/20'} hover:scale-110 active:scale-90 transition-all`}>
                           {isTimerActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                         </button>
                         <button onClick={() => { setIsTimerActive(false); setTimerSeconds(25 * 60); setTimerMode('work'); setCyclesCompleted(0); }} className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-sm ${theme === 'light' ? 'bg-white border-slate-200 text-slate-400 hover:text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}><RotateCcw size={24} /></button>
                      </div>
                    </div>
                    {/* Botão de Nova Tarefa */}
                    <button onClick={() => setActiveModal('task')} className="bg-emerald-600 text-white px-6 py-4 rounded-[2rem] font-black shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                      <PlusCircle size={22} /> Nova tarefa
                    </button>
                  </div>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
                  <KanbanCol title="A Fazer" theme={theme} tasks={activeTask.subTasks.filter(s => s.status === 'todo')} onDrop={() => onDrop('todo')} onDragOver={(e: React.DragEvent) => e.preventDefault()} onDragStart={setDraggedSubTaskId} onDeleteSubTask={(subId: string) => handleDeleteSubTask(activeTask.id, subId)} formatDate={formatDate} isOverdue={isOverdue} />
                  <KanbanCol title="Fazendo" theme={theme} tasks={activeTask.subTasks.filter(s => s.status === 'doing')} onDrop={() => onDrop('doing')} onDragOver={(e: React.DragEvent) => e.preventDefault()} onDragStart={setDraggedSubTaskId} onDeleteSubTask={(subId: string) => handleDeleteSubTask(activeTask.id, subId)} formatDate={formatDate} isOverdue={isOverdue} highlight />
                  <KanbanCol title="Concluído" theme={theme} tasks={activeTask.subTasks.filter(s => s.status === 'done')} onDrop={() => onDrop('done')} onDragOver={(e: React.DragEvent) => e.preventDefault()} onDragStart={setDraggedSubTaskId} onDeleteSubTask={(subId: string) => handleDeleteSubTask(activeTask.id, subId)} formatDate={formatDate} isOverdue={isOverdue} />
                </div>
              </>
            ) : (
              <div className={`text-center py-32 ${bgCard} rounded-[3rem] border-2 border-dashed ${borderMain}`}>
                <Target size={54} className="text-slate-200 mx-auto mb-6" />
                <h3 className={`text-xl font-black ${textMuted} mb-2`}>Nenhum foco selecionado.</h3>
                <p className={`${textMuted} mb-8`}>Volte para a visão Geral e selecione um objetivo para detalhar.</p>
                <button onClick={() => setView('global')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black">Ver Objetivos</button>
              </div>
            )}
          </div>
        )}

        {view === 'rewards' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className={`${theme === 'light' ? 'bg-slate-900' : 'bg-black'} rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-slate-800`}>
               <div className="text-center md:text-left">
                  <p className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-2">Economia de Recompensas</p>
                  <h3 className="text-6xl font-black tabular-nums">{stats.points} <span className="text-xl text-slate-500 uppercase">pts</span></h3>
               </div>
               <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center rotate-6 shadow-xl"><Trophy size={48} /></div>
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
                    onClick={() => { setStats(s => ({ ...s, points: s.points - reward.cost })); alert(`Parabéns! Você resgatou: ${reward.title}`); }}
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
        )}

        {view === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {completedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedTasks.map(task => (
                  <div key={task.id} className={`${bgCard} p-8 rounded-[3rem] border ${borderCard} shadow-sm flex flex-col justify-between group relative`}>
                    <button 
                      onClick={() => handleDeleteHistoryTask(task.id)} 
                      className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} /> Concluído
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black mb-3 pr-8">{task.title}</h3>
                      <div className={`flex items-center gap-4 ${textMuted}`}>
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <Clock size={14} className="text-indigo-500" />
                          <span>Focado: {formatTimeSpent(task.totalTimeSpent)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <Briefcase size={14} />
                          <span>{task.subTasks.length} tarefas realizadas</span>
                        </div>
                      </div>
                    </div>
                    <div className={`mt-6 pt-6 border-t ${borderCard} flex items-center justify-between`}>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>Recompensa Ganha:</span>
                       <div className="flex items-center gap-1 text-indigo-500 font-black">
                         <Zap size={14} fill="currentColor" /> +{task.rewardPoints} pts
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-32 ${bgCard} rounded-[3rem] border-2 border-dashed ${borderMain}`}>
                <History size={54} className="text-slate-200 mx-auto mb-6" />
                <h3 className={`text-xl font-black ${textMuted} mb-2`}>Histórico vazio.</h3>
                <p className={`${textMuted} mb-8`}>Conclua seu primeiro objetivo macro para vê-lo aqui!</p>
                <button onClick={() => setView('global')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black">Ver Objetivos</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modais */}
      {activeModal === 'macro' && (
        <Modal title="Novo Objetivo Macro" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Título do Objetivo</label>
              <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Ex: Organizar o Escritório" className={`w-full p-4 border-2 rounded-2xl font-bold text-lg outline-none focus:border-indigo-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Prazo Final</label>
              <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-indigo-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <button onClick={handleCreateMacro} disabled={!newTaskTitle.trim()} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">Começar Projeto</button>
          </div>
        </Modal>
      )}

      {activeModal === 'task' && (
        <Modal title="Nova Tarefa" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-6">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>O que precisa ser feito?</label>
              <input autoFocus value={taskToProject.title} onChange={e => setTaskToProject({...taskToProject, title: e.target.value})} placeholder="Ex: Tirar o lixo da mesa" className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <div>
              <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Prazo da Tarefa (Opcional)</label>
              <input type="date" value={taskToProject.dueDate} onChange={e => setTaskToProject({...taskToProject, dueDate: e.target.value})} className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-emerald-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
            </div>
            <div className={`flex justify-between items-center p-4 rounded-2xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
              <span className={`text-xs font-black uppercase tracking-widest ${textMuted}`}>Valor da Recompensa:</span>
              <div className="flex items-center gap-2">
                <input type="number" value={taskToProject.points} onChange={e => setTaskToProject({...taskToProject, points: parseInt(e.target.value) || 0})} className={`w-16 p-2 text-center border-2 font-black rounded-xl text-indigo-500 outline-none ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-700'}`} />
                <span className={`text-xs font-bold ${textMuted}`}>pts</span>
              </div>
            </div>
            <button onClick={handleAddTaskToProject} disabled={!taskToProject.title.trim()} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all disabled:opacity-50">Adicionar à Lista</button>
          </div>
        </Modal>
      )}

      {activeModal === 'reward' && (
        <Modal title="Criar Recompensa" onClose={() => setActiveModal(null)} theme={theme}>
          <div className="space-y-6">
             <div>
               <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block text-center ${textMuted}`}>Escolha um Ícone</label>
               <div className={`grid grid-cols-6 gap-2 p-4 rounded-3xl max-h-40 overflow-y-auto ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
                 {EMOJI_OPTIONS.map(emoji => (
                   <button 
                    key={emoji} 
                    onClick={() => setNewReward({...newReward, icon: emoji})}
                    className={`text-2xl p-2 rounded-xl transition-all ${newReward.icon === emoji ? `${theme === 'light' ? 'bg-white shadow-md border-purple-200' : 'bg-slate-700 border-purple-500'} scale-110 border-2` : 'hover:bg-black/5'}`}
                   >
                     {emoji}
                   </button>
                 ))}
               </div>
             </div>
             
             <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${textMuted}`}>Nome do Prêmio</label>
                <input autoFocus value={newReward.title} onChange={e => setNewReward({...newReward, title: e.target.value})} placeholder="Ex: Assistir Anime" className={`w-full p-4 border-2 rounded-2xl font-bold outline-none focus:border-purple-600 ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700 text-white'}`} />
             </div>
             
             <div>
               <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block text-center ${textMuted}`}>Custo em Pontos</label>
               <input type="number" value={newReward.cost} onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value) || 0})} className={`w-full p-4 border-2 rounded-2xl font-black text-center text-2xl text-purple-500 outline-none ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700'}`} />
             </div>
             
             <button onClick={handleCreateReward} disabled={!newReward.title.trim()} className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-900/20 active:scale-95 transition-all">Criar Prêmio</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// UI Components
const NavItem = ({ active, onClick, icon, label, theme }: any) => {
  const isActive = active;
  const isLight = theme === 'light';
  
  return (
    <button onClick={onClick} className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 w-full px-4 py-2 md:py-4 rounded-2xl transition-all ${isActive ? (isLight ? 'text-indigo-600 bg-indigo-50 font-black' : 'text-indigo-400 bg-indigo-950/30 font-black') : (isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50')}`}>
      <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</div>
      <span className="text-[9px] md:text-sm uppercase md:capitalize font-bold tracking-tight">{label}</span>
    </button>
  );
};

const MacroCard = ({ task, onFocus, onDelete, formatDate, isOverdue, theme }: any) => {
  const completed = task.subTasks.filter((s:any) => s.completed).length;
  const total = task.subTasks.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const isLight = theme === 'light';

  return (
    <div onClick={onFocus} className={`p-8 rounded-[3rem] border-2 transition-all cursor-pointer shadow-sm group relative flex flex-col justify-between h-64 ${isLight ? 'bg-white border-slate-50 hover:border-indigo-100' : 'bg-slate-900 border-slate-800 hover:border-indigo-500/30'}`}>
      <button onClick={onDelete} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${isLight ? 'bg-slate-50 text-slate-400' : 'bg-slate-800 text-slate-500'}`}>Projeto</span>
          {task.dueDate && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 ${isOverdue(task.dueDate) ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <Calendar size={10} /> {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <h3 className={`text-xl font-black leading-tight group-hover:text-indigo-500 transition-colors line-clamp-2 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{task.title}</h3>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-end mb-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{completed}/{total} tarefas</span>
          <span className="text-sm font-black text-indigo-500">{Math.round(pct)}%</span>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-800 border-slate-700'}`}>
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(79,70,229,0.4)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

const KanbanCol = ({ title, tasks, onDrop, onDragOver, onDragStart, onDeleteSubTask, formatDate, isOverdue, highlight, theme }: any) => {
  const isLight = theme === 'light';
  
  return (
    <div className={`flex flex-col h-full rounded-[3rem] p-5 border-2 border-dashed ${highlight ? (isLight ? 'bg-indigo-50/20 border-indigo-100' : 'bg-indigo-950/10 border-indigo-900/30') : (isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/20 border-slate-800/50')}`} onDrop={onDrop} onDragOver={onDragOver}>
      <div className="flex items-center justify-between mb-6 px-3">
         <h4 className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>{title}</h4>
         <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border shadow-sm ${isLight ? 'bg-white text-slate-400 border-slate-100' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{tasks.length}</span>
      </div>
      <div className="flex-1 space-y-4">
        {tasks.map((t: any) => (
          <div key={t.id} draggable onDragStart={() => onDragStart(t.id)} className={`p-5 rounded-3xl shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group relative ${t.completed ? 'opacity-50' : ''} ${isLight ? 'bg-white border-slate-100 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-200'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteSubTask(t.id); }} 
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
            >
              <Trash2 size={14} />
            </button>
            <div className="flex items-start gap-3">
               <GripVertical size={16} className={`${isLight ? 'text-slate-200 group-hover:text-slate-400' : 'text-slate-700 group-hover:text-slate-500'} mt-0.5`} />
               <div className="flex-1">
                  <p className={`font-bold leading-tight pr-4 ${t.completed ? 'line-through' : ''}`}>{t.title}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase">
                      <Zap size={10} fill="currentColor" /> +{t.rewardPoints} pts
                    </div>
                    {t.dueDate && !t.completed && (
                      <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${isOverdue(t.dueDate) ? 'text-rose-500' : 'text-emerald-500'}`}>
                        <Calendar size={10} /> {formatDate(t.dueDate)}
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
           <div className={`h-24 border-2 border-dashed rounded-3xl flex items-center justify-center ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest ${isLight ? 'text-slate-200' : 'text-slate-700'}`}>Solte aqui</span>
           </div>
        )}
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, children, theme }: any) => {
  const isLight = theme === 'light';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 border ${isLight ? 'bg-white border-slate-100' : 'bg-slate-900 border-slate-800'}`}>
        <button onClick={onClose} className={`absolute right-8 top-8 transition-colors ${isLight ? 'text-slate-300 hover:text-slate-600' : 'text-slate-600 hover:text-slate-300'}`}><X size={28} /></button>
        <h3 className={`text-2xl font-black mb-8 tracking-tighter ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default App;