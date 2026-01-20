import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Flame,
  BrainCircuit,
  Settings,
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
  Trash2
} from 'lucide-react';
import { Task, UserStats, Reward, SubTask, TaskStatus } from './types';

// Constantes para LocalStorage
const STORAGE_KEYS = {
  TASKS: 'guiflow_tasks_v1',
  REWARDS: 'guiflow_rewards_v1',
  STATS: 'guiflow_stats_v1'
};

// Initial Data
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Exemplo de Projeto',
    description: 'Este é um projeto macro. Use o foco local para ver as tarefas menores.',
    priority: 'medium',
    status: 'todo',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedTime: 45,
    category: 'Geral',
    completed: false,
    subTasks: [
      { id: 's1', title: 'Tarefa de exemplo 1', completed: true, status: 'done', rewardPoints: 20 },
      { id: 's2', title: 'Tarefa de exemplo 2', completed: false, status: 'todo', rewardPoints: 30 }
    ],
    rewardPoints: 100
  }
];

const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', title: '15 min de videogame', cost: 100, icon: '🎮' },
  { id: 'r2', title: 'Comer um doce especial', cost: 200, icon: '🍫' },
];

const MOTIVATION_QUOTES = [
  "Progresso, não perfeição.",
  "Um pequeno passo ainda é movimento para frente.",
  "Sua mente funciona de forma única, e isso é seu superpoder.",
  "Respire. Uma coisa de cada vez.",
  "Comemore as pequenas vitórias de hoje!",
  "Você só consegue se tentar."
];

const App: React.FC = () => {
  // Estados com carregamento do LocalStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REWARDS);
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : { points: 50, tasksCompleted: 0, streak: 1 };
  });

  const [view, setView] = useState<'global' | 'local' | 'rewards'>('global');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [motivation, setMotivation] = useState("");
  const [draggedSubTaskId, setDraggedSubTaskId] = useState<string | null>(null);

  // Pomodoro Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const timerRef = useRef<number | null>(null);

  // Modals state
  const [activeModal, setActiveModal] = useState<'macro' | 'task' | 'reward' | null>(null);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskToProject, setTaskToProject] = useState({ title: "", points: 10, projectId: "" });
  const [newReward, setNewReward] = useState({ title: "", cost: 50 });

  // Salvar dados sempre que mudarem
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    setMotivation(randomQuote);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, timerSeconds]);

  const handleTimerComplete = () => {
    setIsTimerActive(false);
    if (timerMode === 'work') {
      alert("Bloco de foco concluído! Hora de uma pequena pausa.");
      setStats(s => ({ ...s, points: s.points + 10 }));
      setTimerMode('break');
      setTimerSeconds(5 * 60);
    } else {
      alert("Pausa concluída! Vamos voltar ao foco?");
      setTimerMode('work');
      setTimerSeconds(25 * 60);
    }
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimerMode('work');
    setTimerSeconds(25 * 60);
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateMacro = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "Novo projeto manual.",
      priority: 'medium',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedTime: 30,
      category: 'Geral',
      completed: false,
      subTasks: [],
      rewardPoints: 50
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setActiveModal(null);
  };

  const handleAddTaskToProject = () => {
    if (!taskToProject.title.trim() || !taskToProject.projectId) return;
    const newSub: SubTask = { 
      id: Math.random().toString(), 
      title: taskToProject.title, 
      completed: false, 
      status: 'todo',
      rewardPoints: taskToProject.points
    };
    setTasks(prev => prev.map(t => t.id === taskToProject.projectId ? { ...t, subTasks: [...t.subTasks, newSub] } : t));
    setTaskToProject({ title: "", points: 10, projectId: "" });
    setActiveModal(null);
  };

  const handleSaveReward = () => {
    if (!newReward.title.trim()) return;
    
    if (editingRewardId) {
      setRewards(prev => prev.map(r => r.id === editingRewardId ? { ...r, title: newReward.title, cost: newReward.cost } : r));
    } else {
      const reward: Reward = {
        id: Date.now().toString(),
        title: newReward.title,
        cost: newReward.cost,
        icon: '🎁'
      };
      setRewards([...rewards, reward]);
    }
    
    setNewReward({ title: "", cost: 50 });
    setEditingRewardId(null);
    setActiveModal(null);
  };

  const handleEditReward = (reward: Reward) => {
    setNewReward({ title: reward.title, cost: reward.cost });
    setEditingRewardId(reward.id);
    setActiveModal('reward');
  };

  const handleDeleteReward = (id: string) => {
    if (confirm("Deseja realmente remover esta recompensa?")) {
      setRewards(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleDeleteSubTask = (projectId: string, subId: string) => {
    if (confirm("Deseja remover este cartão do Kanban?")) {
      setTasks(prev => prev.map(t => {
        if (t.id === projectId) {
          return { ...t, subTasks: t.subTasks.filter(st => st.id !== subId) };
        }
        return t;
      }));
    }
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
              if (!wasDone && isNowDone) {
                setStats(s => ({ ...s, points: s.points + st.rewardPoints }));
              } else if (wasDone && !isNowDone) {
                setStats(s => ({ ...s, points: Math.max(0, s.points - st.rewardPoints) }));
              }
              return { ...st, status: newStatus, completed: isNowDone };
            }
            return st;
          })
        };
      }
      return t;
    }));
  };

  const finishMacroProject = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        setStats(s => ({ ...s, points: s.points + t.rewardPoints, tasksCompleted: s.tasksCompleted + 1 }));
        return { ...t, status: 'done', completed: true };
      }
      return t;
    }));
    setView('global');
  };

  const useReward = (reward: Reward) => {
    if (stats.points >= reward.cost) {
      setStats(s => ({ ...s, points: s.points - reward.cost }));
      alert(`Recompensa "${reward.title}" resgatada!`);
    }
  };

  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === activeTaskId) || tasks.find(t => t.status === 'doing' && !t.completed) || null;
  }, [tasks, activeTaskId]);

  const onDragStart = (subId: string) => setDraggedSubTaskId(subId);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (status: TaskStatus) => {
    if (draggedSubTaskId && activeTask) {
      changeSubTaskStatus(activeTask.id, draggedSubTaskId, status);
      setDraggedSubTaskId(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col transition-all duration-300">
      {/* Sidebar */}
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 md:top-0 md:left-0 md:w-64 md:h-full md:flex-col md:justify-start md:p-6 md:border-r md:border-t-0 shadow-lg">
        <div className="hidden md:flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Guiflow</h1>
        </div>
        <div className="flex w-full justify-around md:flex-col md:gap-4">
          <NavItem active={view === 'global'} onClick={() => setView('global')} icon={<LayoutDashboard size={20} />} label="Visão Global" />
          <NavItem active={view === 'local'} onClick={() => setView('local')} icon={<Target size={20} />} label="Foco Local" />
          <NavItem active={view === 'rewards'} onClick={() => setView('rewards')} icon={<Trophy size={20} />} label="Recompensas" />
        </div>
        <div className="hidden md:mt-auto md:block w-full">
          <div className="bg-indigo-50 p-4 rounded-2xl mb-4 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Saldo Atual</span>
              <Zap size={14} className="text-yellow-400 fill-current" />
            </div>
            <div className="text-2xl font-black text-indigo-700">{stats.points} <span className="text-xs">pts</span></div>
          </div>
        </div>
      </nav>

      {/* Action Bar */}
      <div className="fixed top-4 right-4 md:right-8 z-40 flex gap-2 sm:gap-4 scale-90 sm:scale-100 origin-right">
        <ActionButton onClick={() => { setActiveModal('macro'); setNewTaskTitle(""); }} icon={<Briefcase size={18} />} label="Novo Macro" color="bg-indigo-600" />
        <ActionButton onClick={() => { setActiveModal('task'); setTaskToProject({ title: "", points: 10, projectId: "" }); }} icon={<PlusCircle size={18} />} label="Add Tarefa" color="bg-emerald-600" />
        <ActionButton onClick={() => { setActiveModal('reward'); setEditingRewardId(null); setNewReward({ title: "", cost: 50 }); }} icon={<Gift size={18} />} label="Criar Recompensa" color="bg-purple-600" />
      </div>

      <main className="flex-1 p-4 md:p-8 w-full max-w-[1400px] mx-auto pt-20">
        <header className="mb-8">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Guiflow ADHD</h2>
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <Target className="text-indigo-600 shrink-0 mt-0.5" size={20} />
            <p className="text-indigo-800 text-sm italic font-medium">"{motivation}"</p>
          </div>
        </header>

        {/* Global View */}
        {view === 'global' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {tasks.filter(t => !t.completed).map(task => (
              <MacroProjectCard 
                key={task.id} 
                task={task} 
                onFocus={() => { setActiveTaskId(task.id); setView('local'); }}
              />
            ))}
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Layout className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-medium">Nenhum projeto macro ativo.</p>
              </div>
            )}
          </div>
        )}

        {/* Local View: Kanban + Pomodoro */}
        {view === 'local' && (
          <div className="h-full flex flex-col animate-in fade-in duration-300">
            {activeTask ? (
              <div className="flex flex-col h-full space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Project Info */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Foco Local</span>
                        <Target size={14} className="text-indigo-500" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">{activeTask.title}</h2>
                      <p className="text-slate-500 text-sm mt-1">{activeTask.description}</p>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      <button onClick={() => finishMacroProject(activeTask.id)} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100">
                        <CheckCircle2 size={20} /> Concluir Projeto (+{activeTask.rewardPoints})
                      </button>
                    </div>
                  </div>

                  {/* Pomodoro Timer */}
                  <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center transition-all ${timerMode === 'work' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      {timerMode === 'work' ? <Timer className="text-rose-500" size={20} /> : <Coffee className="text-emerald-500" size={20} />}
                      <span className={`text-xs font-black uppercase tracking-widest ${timerMode === 'work' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {timerMode === 'work' ? 'Foco Profundo' : 'Pausa Relaxante'}
                      </span>
                    </div>
                    <div className={`text-6xl font-black tabular-nums tracking-tighter mb-6 ${timerMode === 'work' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatTime(timerSeconds)}
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={toggleTimer} 
                        className={`p-4 rounded-2xl text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${timerMode === 'work' ? 'bg-rose-600 shadow-rose-200' : 'bg-emerald-600 shadow-emerald-200'}`}
                      >
                        {isTimerActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                      </button>
                      <button 
                        onClick={resetTimer} 
                        className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-50"
                      >
                        <RotateCcw size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
                  <SubKanbanColumn 
                    title="A Fazer" 
                    tasks={activeTask.subTasks.filter(st => st.status === 'todo')} 
                    onDrop={() => onDrop('todo')} 
                    onDragOver={onDragOver} 
                    onDragStart={onDragStart} 
                    onDelete={(subId) => handleDeleteSubTask(activeTask.id, subId)}
                  />
                  <SubKanbanColumn 
                    title="Fazendo" 
                    tasks={activeTask.subTasks.filter(st => st.status === 'doing')} 
                    onDrop={() => onDrop('doing')} 
                    onDragOver={onDragOver} 
                    onDragStart={onDragStart} 
                    onDelete={(subId) => handleDeleteSubTask(activeTask.id, subId)}
                    highlight 
                  />
                  <SubKanbanColumn 
                    title="Concluído" 
                    tasks={activeTask.subTasks.filter(st => st.status === 'done')} 
                    onDrop={() => onDrop('done')} 
                    onDragOver={onDragOver} 
                    onDragStart={onDragStart} 
                    onDelete={(subId) => handleDeleteSubTask(activeTask.id, subId)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <Target size={48} className="text-indigo-400 mb-4" />
                <h3 className="text-xl font-black text-slate-800">Selecione um projeto para focar.</h3>
                <button onClick={() => setView('global')} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Ver Projetos</button>
              </div>
            )}
          </div>
        )}

        {/* Rewards View */}
        {view === 'rewards' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white flex justify-between items-center shadow-xl">
               <div>
                  <p className="text-indigo-200 uppercase font-black tracking-widest text-xs">Progresso</p>
                  <h3 className="text-5xl font-black mt-2">{stats.points} pts</h3>
               </div>
               <Trophy size={64} className="opacity-20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => (
                <div key={reward.id} className={`bg-white p-6 rounded-3xl border-2 transition-all relative group ${stats.points >= reward.cost ? 'border-indigo-100 shadow-lg' : 'border-slate-50 opacity-70'}`}>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditReward(reward)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDeleteReward(reward.id)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-4xl mb-4">{reward.icon}</div>
                  <h4 className="text-xl font-black text-slate-800">{reward.title}</h4>
                  <div className="flex items-center justify-between mt-6">
                    <span className="font-bold text-indigo-600">{reward.cost} pts</span>
                    <button 
                      disabled={stats.points < reward.cost} 
                      onClick={() => useReward(reward)} 
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${stats.points >= reward.cost ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      Usar Pontos
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => { setEditingRewardId(null); setNewReward({ title: "", cost: 50 }); setActiveModal('reward'); }} className="p-6 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-300 transition-all gap-2">
                <Plus size={32} />
                <span className="font-black text-xs uppercase tracking-widest">Nova Recompensa</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {activeModal === 'macro' && (
        <Modal title="Novo Macro Projeto" onClose={() => setActiveModal(null)}>
          <textarea 
            value={newTaskTitle} 
            onChange={(e) => setNewTaskTitle(e.target.value)} 
            placeholder="O que você precisa realizar?" 
            className="w-full p-4 bg-slate-50 border rounded-2xl h-32 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg" 
          />
          <button onClick={handleCreateMacro} disabled={!newTaskTitle.trim()} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl mt-6 shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all">
            Criar Projeto
          </button>
        </Modal>
      )}

      {activeModal === 'task' && (
        <Modal title="Adicionar Tarefa" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase">Projeto</label>
              <select 
                value={taskToProject.projectId} 
                onChange={(e) => setTaskToProject({...taskToProject, projectId: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-1 font-bold text-slate-700"
              >
                <option value="">Selecione...</option>
                {tasks.filter(t => !t.completed).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase">Título</label>
              <input 
                type="text" 
                value={taskToProject.title} 
                onChange={(e) => setTaskToProject({...taskToProject, title: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-1 font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase">Pontos</label>
              <input 
                type="number" 
                value={taskToProject.points} 
                onChange={(e) => setTaskToProject({...taskToProject, points: parseInt(e.target.value) || 0})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-1 font-bold text-indigo-600"
              />
            </div>
            <button onClick={handleAddTaskToProject} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl mt-6 shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-all">
              Adicionar
            </button>
          </div>
        </Modal>
      )}

      {activeModal === 'reward' && (
        <Modal title={editingRewardId ? "Editar Recompensa" : "Nova Recompensa"} onClose={() => { setActiveModal(null); setEditingRewardId(null); }}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase">Nome</label>
              <input type="text" value={newReward.title} onChange={(e) => setNewReward({...newReward, title: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-1 font-bold" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase">Custo (pts)</label>
              <input type="number" value={newReward.cost} onChange={(e) => setNewReward({...newReward, cost: parseInt(e.target.value) || 0})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-1 font-bold" />
            </div>
            <button onClick={handleSaveReward} className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl mt-6 shadow-xl shadow-purple-100">
              Salvar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const ActionButton: React.FC<{ onClick: () => void, icon: React.ReactNode, label: string, color: string }> = ({ onClick, icon, label, color }) => (
  <button onClick={onClick} className={`${color} text-white px-5 py-3.5 rounded-[1.25rem] flex items-center gap-2 font-black shadow-lg hover:scale-105 transition-all text-sm`}>
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const Modal: React.FC<{ title: string, onClose: () => void, children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
      <button onClick={onClose} className="absolute right-8 top-8 text-slate-300 hover:text-slate-600"><X size={28} /></button>
      <h3 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">{title}</h3>
      {children}
    </div>
  </div>
);

const MacroProjectCard: React.FC<{ task: Task, onFocus: () => void }> = ({ task, onFocus }) => {
  const completedCount = task.subTasks.filter(st => st.completed).length;
  const totalCount = task.subTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  return (
    <div onClick={onFocus} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 hover:border-indigo-200 transition-all cursor-pointer shadow-sm group h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
           <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400">Projeto</span>
           <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-600" />
        </div>
        <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600">{task.title}</h3>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completedCount}/{totalCount} tarefas</span>
           <span className="text-[10px] font-black text-indigo-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
          <div className={`h-full transition-all duration-500 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

const SubKanbanColumn: React.FC<{ title: string, tasks: SubTask[], onDrop: () => void, onDragOver: (e: React.DragEvent) => void, onDragStart: (id: string) => void, onDelete: (id: string) => void, highlight?: boolean }> = ({ title, tasks, onDrop, onDragOver, onDragStart, onDelete, highlight }) => (
  <div className={`flex flex-col h-full rounded-[2.5rem] p-6 border-2 border-dashed transition-all ${highlight ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50/50 border-slate-100'}`} onDragOver={onDragOver} onDrop={onDrop}>
    <div className="flex items-center justify-between mb-6 px-2">
       <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{title}</h4>
       <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-400 border border-slate-100">{tasks.length}</span>
    </div>
    <div className="flex-1 space-y-4">
      {tasks.length === 0 ? (
        <div className="flex-1 h-20 border-2 border-slate-100/50 border-dashed rounded-3xl flex items-center justify-center">
           <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Vazio</span>
        </div>
      ) : tasks.map(task => (
        <div key={task.id} draggable onDragStart={() => onDragStart(task.id)} className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm cursor-grab active:cursor-grabbing group hover:shadow-md transition-all relative ${task.completed ? 'opacity-60' : ''}`}>
          <div className="flex items-start gap-3">
             <GripVertical size={16} className="text-slate-200 group-hover:text-slate-400 mt-0.5" />
             <div className="flex-1">
                <span className={`font-bold text-slate-700 text-sm leading-tight ${task.completed ? 'line-through text-slate-300' : ''}`}>{task.title}</span>
                <div className="flex items-center gap-1 text-[10px] font-black text-indigo-400 uppercase tracking-tighter mt-2">
                  <Zap size={10} /> +{task.rewardPoints} pts
                </div>
             </div>
             <div className="flex flex-col gap-2 items-center">
                {task.completed && <CheckCircle2 size={14} className="text-emerald-500" />}
                <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1.5 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
             </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 w-full px-4 py-2 md:py-4 rounded-2xl transition-all ${active ? 'text-indigo-600 md:bg-indigo-50 font-black' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
    {icon}
    <span className="text-[9px] md:text-xs uppercase md:capitalize font-bold">{label}</span>
  </button>
);

export default App;