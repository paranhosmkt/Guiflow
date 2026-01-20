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
  AlertCircle
} from 'lucide-react';
import { Task, UserStats, Reward, SubTask, TaskStatus } from './types';

// Constantes para LocalStorage
const STORAGE_KEYS = {
  TASKS: 'guiflow_tasks_v2',
  REWARDS: 'guiflow_rewards_v2',
  STATS: 'guiflow_stats_v2'
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

  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REWARDS);
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : { points: 0, tasksCompleted: 0, streak: 1 };
  });

  const [view, setView] = useState<'global' | 'local' | 'rewards'>('global');
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
  const [taskToProject, setTaskToProject] = useState({ title: "", points: 20, projectId: "" });
  const [newReward, setNewReward] = useState({ title: "", cost: 50, icon: "🎁" });

  // Sincronização LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards)); }, [rewards]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)); }, [stats]);

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
      
      setTimerMode('break');
      if (nextCycles % 6 === 0) {
        setTimerSeconds(45 * 60); // Descanso longo de 45 minutos após 6 ciclos
        alert("Ciclo 6 concluído! Hora de um descanso longo (45 min). Ganhou 15 pontos.");
      } else {
        setTimerSeconds(5 * 60); // Descanso curto de 5 minutos
        alert(`Bloco de foco ${nextCycles}/6 concluído! Ganhou 15 pontos.`);
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

  const handleDeleteMacro = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente excluir este objetivo e todas as suas tarefas?")) {
      setTasks(tasks.filter(t => t.id !== id));
      if (activeTaskId === id) setActiveTaskId(null);
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
      rewardPoints: taskToProject.points
    };

    setTasks(prev => prev.map(t => t.id === targetId ? { ...t, subTasks: [...t.subTasks, newSub] } : t));
    setTaskToProject({ title: "", points: 20, projectId: "" });
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
    
    setStats(s => ({ ...s, points: s.points + task.rewardPoints, tasksCompleted: s.tasksCompleted + 1 }));
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done', completed: true } : t));
    setView('global');
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

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 md:top-0 md:left-0 md:w-64 md:h-full md:flex-col md:justify-start md:p-6 md:border-r shadow-2xl">
        <div className="hidden md:flex items-center gap-3 mb-10 w-full">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Zap size={22} fill="currentColor" /></div>
          <h1 className="text-xl font-black tracking-tighter">GUIFLOW</h1>
        </div>
        
        <div className="flex w-full justify-around md:flex-col md:gap-4">
          <NavItem active={view === 'global'} onClick={() => setView('global')} icon={<LayoutDashboard size={20} />} label="Geral" />
          <NavItem active={view === 'local'} onClick={() => setView('local')} icon={<Target size={20} />} label="Foco" />
          <NavItem active={view === 'rewards'} onClick={() => setView('rewards')} icon={<Trophy size={20} />} label="Prêmios" />
        </div>

        <div className="hidden md:mt-auto md:block w-full">
          <div className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-xl">
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
            <h2 className="text-3xl font-black tracking-tight">{view === 'global' ? 'Visão Geral' : view === 'local' ? 'Foco Local' : 'Recompensas'}</h2>
            <div className="flex items-center gap-2 text-slate-500">
              <Lightbulb size={16} className="text-amber-500" />
              <p className="text-sm font-medium italic">{motivation}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
             {view === 'global' && (
                <button onClick={() => setActiveModal('macro')} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={20} /> Novo Objetivo
                </button>
             )}
             {view === 'rewards' && (
                <button onClick={() => setActiveModal('reward')} className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-purple-200 hover:scale-105 transition-all flex items-center gap-2">
                  <Gift size={20} /> Novo Prêmio
                </button>
             )}
          </div>
        </header>

        {/* Views */}
        {view === 'global' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {tasks.filter(t => !t.completed).map(task => (
              <MacroCard key={task.id} task={task} onFocus={() => { setActiveTaskId(task.id); setView('local'); }} onDelete={(e) => handleDeleteMacro(task.id, e)} />
            ))}
            
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4"><AlertCircle size={40} className="text-slate-300" /></div>
                 <h3 className="text-xl font-black text-slate-400 mb-2">Sem objetivos ativos.</h3>
                 <p className="text-slate-400 mb-8 max-w-xs">Que tal criar seu primeiro objetivo macro agora?</p>
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
                  <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Foco Atual</span>
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 mb-2">{activeTask.title}</h2>
                      <p className="text-slate-500">Mova as tarefas entre as colunas conforme progride.</p>
                    </div>
                    <div className="mt-8 flex gap-3">
                      <button onClick={() => finishMacroProject(activeTask.id)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
                        <CheckCircle2 size={20} className="text-indigo-400" /> Finalizar Objetivo (+{activeTask.rewardPoints} pts)
                      </button>
                    </div>
                  </div>

                  {/* Pomodoro Timer Container */}
                  <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className={`p-8 rounded-[3rem] border-2 shadow-sm flex flex-col items-center justify-center transition-all relative overflow-hidden ${timerMode === 'work' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className="absolute top-4 right-6 bg-white/50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
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
                         <button onClick={() => setIsTimerActive(!isTimerActive)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${timerMode === 'work' ? 'bg-rose-600' : 'bg-emerald-600'} hover:scale-110 active:scale-90 transition-all`}>
                           {isTimerActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                         </button>
                         <button onClick={() => { setIsTimerActive(false); setTimerSeconds(25 * 60); setTimerMode('work'); setCyclesCompleted(0); }} className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-slate-600 transition-all shadow-sm"><RotateCcw size={24} /></button>
                      </div>
                    </div>
                    {/* Botão de Nova Tarefa movido para baixo do Pomodoro */}
                    <button onClick={() => setActiveModal('task')} className="bg-emerald-600 text-white px-6 py-4 rounded-[2rem] font-black shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                      <PlusCircle size={22} /> Nova tarefa
                    </button>
                  </div>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
                  <KanbanCol title="A Fazer" tasks={activeTask.subTasks.filter(s => s.status === 'todo')} onDrop={() => onDrop('todo')} onDragOver={(e) => e.preventDefault()} onDragStart={setDraggedSubTaskId} onDeleteSubTask={(subId) => handleDeleteSubTask(activeTask.id, subId)} />
                  <KanbanCol title="Fazendo" tasks={activeTask.subTasks.filter(s => s.status === 'doing')} onDrop={() => onDrop('doing')} onDragOver={(e) => e.preventDefault()} onDragStart={setDraggedSubTaskId} onDeleteSubTask={(subId) => handleDeleteSubTask(activeTask.id, subId)} highlight />
                  <KanbanCol title="Concluído" tasks={activeTask.subTasks.filter(s => s.status === 'done')} onDrop={() => onDrop('done')} onDragOver={(e) => e.preventDefault()} onDragStart={setDraggedSubTaskId} onDeleteSubTask={(subId) => handleDeleteSubTask(activeTask.id, subId)} />
                </div>
              </>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <Target size={54} className="text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-400 mb-2">Nenhum foco selecionado.</h3>
                <p className="text-slate-400 mb-8">Volte para a visão Geral e selecione um objetivo para detalhar.</p>
                <button onClick={() => setView('global')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black">Ver Objetivos</button>
              </div>
            )}
          </div>
        )}

        {view === 'rewards' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
               <div className="text-center md:text-left">
                  <p className="text-indigo-400 font-black uppercase tracking-widest text-xs mb-2">Economia de Recompensas</p>
                  <h3 className="text-6xl font-black tabular-nums">{stats.points} <span className="text-xl text-slate-500 uppercase">pts</span></h3>
               </div>
               <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center rotate-6 shadow-xl"><Trophy size={48} /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => (
                <div key={reward.id} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all relative group flex flex-col justify-between ${stats.points >= reward.cost ? 'border-indigo-100 shadow-md' : 'border-slate-50 opacity-60'}`}>
                  <button onClick={() => handleDeleteReward(reward.id)} className="absolute top-6 right-6 p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                  <div className="text-5xl mb-6">{reward.icon}</div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800 mb-1">{reward.title}</h4>
                    <p className="text-indigo-600 font-black text-sm uppercase tracking-wider">{reward.cost} pontos</p>
                  </div>
                  <button 
                    disabled={stats.points < reward.cost}
                    onClick={() => { setStats(s => ({ ...s, points: s.points - reward.cost })); alert(`Parabéns! Você resgatou: ${reward.title}`); }}
                    className={`mt-8 w-full py-4 rounded-2xl font-black transition-all ${stats.points >= reward.cost ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                  >Resgatar</button>
                </div>
              ))}
              <button onClick={() => setActiveModal('reward')} className="p-8 h-full min-h-[250px] rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-purple-200 hover:text-purple-400 transition-all bg-white/50 group">
                 <PlusCircle size={32} />
                 <span className="font-bold text-xs uppercase mt-3 tracking-widest">Novo Prêmio</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modais */}
      {activeModal === 'macro' && (
        <Modal title="Novo Objetivo Macro" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Título do Objetivo</label>
              <input autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Ex: Organizar o Escritório" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg outline-none focus:border-indigo-600 transition-colors" />
            </div>
            <button onClick={handleCreateMacro} disabled={!newTaskTitle.trim()} className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">Começar Projeto</button>
          </div>
        </Modal>
      )}

      {activeModal === 'task' && (
        <Modal title="Nova Tarefa" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">O que precisa ser feito?</label>
              <input autoFocus value={taskToProject.title} onChange={e => setTaskToProject({...taskToProject, title: e.target.value})} placeholder="Ex: Tirar o lixo da mesa" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-emerald-600 transition-colors" />
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Valor da Recompensa:</span>
              <div className="flex items-center gap-2">
                <input type="number" value={taskToProject.points} onChange={e => setTaskToProject({...taskToProject, points: parseInt(e.target.value) || 0})} className="w-16 p-2 text-center bg-white border-2 border-slate-100 font-black rounded-xl text-indigo-600 outline-none" />
                <span className="text-xs font-bold text-slate-400">pts</span>
              </div>
            </div>
            <button onClick={handleAddTaskToProject} disabled={!taskToProject.title.trim()} className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-all disabled:opacity-50">Adicionar à Lista</button>
          </div>
        </Modal>
      )}

      {activeModal === 'reward' && (
        <Modal title="Criar Recompensa" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
             <div>
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block text-center">Escolha um Ícone</label>
               <div className="grid grid-cols-6 gap-2 bg-slate-50 p-4 rounded-3xl max-h-40 overflow-y-auto">
                 {EMOJI_OPTIONS.map(emoji => (
                   <button 
                    key={emoji} 
                    onClick={() => setNewReward({...newReward, icon: emoji})}
                    className={`text-2xl p-2 rounded-xl transition-all ${newReward.icon === emoji ? 'bg-white shadow-md scale-110 border-2 border-purple-200' : 'hover:bg-white/50'}`}
                   >
                     {emoji}
                   </button>
                 ))}
               </div>
             </div>
             
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Nome do Prêmio</label>
                <input autoFocus value={newReward.title} onChange={e => setNewReward({...newReward, title: e.target.value})} placeholder="Ex: Assistir Anime" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-purple-600" />
             </div>
             
             <div>
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block text-center">Custo em Pontos</label>
               <input type="number" value={newReward.cost} onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value) || 0})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center text-2xl text-purple-600 outline-none" />
             </div>
             
             <button onClick={handleCreateReward} disabled={!newReward.title.trim()} className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-100 active:scale-95 transition-all">Criar Prêmio</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// UI Components
const NavItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 w-full px-4 py-2 md:py-4 rounded-2xl transition-all ${active ? 'text-indigo-600 md:bg-indigo-50 font-black' : 'text-slate-400 hover:text-slate-600 md:hover:bg-slate-50'}`}>
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</div>
    <span className="text-[9px] md:text-sm uppercase md:capitalize font-bold tracking-tight">{label}</span>
  </button>
);

const MacroCard = ({ task, onFocus, onDelete }: any) => {
  const completed = task.subTasks.filter((s:any) => s.completed).length;
  const total = task.subTasks.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div onClick={onFocus} className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 hover:border-indigo-100 transition-all cursor-pointer shadow-sm group relative flex flex-col justify-between h-56">
      <button onClick={onDelete} className="absolute top-6 right-6 p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
      <div>
        <div className="mb-4"><span className="text-[9px] font-black uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg text-slate-400">Projeto</span></div>
        <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{task.title}</h3>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completed}/{total} tarefas</span>
          <span className="text-sm font-black text-indigo-600">{Math.round(pct)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

const KanbanCol = ({ title, tasks, onDrop, onDragOver, onDragStart, onDeleteSubTask, highlight }: any) => (
  <div className={`flex flex-col h-full rounded-[3rem] p-5 border-2 border-dashed ${highlight ? 'bg-indigo-50/20 border-indigo-100' : 'bg-slate-50/50 border-slate-200'}`} onDrop={onDrop} onDragOver={onDragOver}>
    <div className="flex items-center justify-between mb-6 px-3">
       <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{title}</h4>
       <span className="bg-white px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-400 border border-slate-100 shadow-sm">{tasks.length}</span>
    </div>
    <div className="flex-1 space-y-4">
      {tasks.map((t: any) => (
        <div key={t.id} draggable onDragStart={() => onDragStart(t.id)} className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group relative ${t.completed ? 'opacity-50' : ''}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteSubTask(t.id); }} 
            className="absolute top-2 right-2 p-1.5 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
          >
            <Trash2 size={14} />
          </button>
          <div className="flex items-start gap-3">
             <GripVertical size={16} className="text-slate-200 group-hover:text-slate-400 mt-0.5" />
             <div className="flex-1">
                <p className={`font-bold text-slate-700 leading-tight pr-4 ${t.completed ? 'line-through' : ''}`}>{t.title}</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase mt-2">
                  <Zap size={10} fill="currentColor" /> +{t.rewardPoints} pts
                </div>
             </div>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
         <div className="h-24 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center">
            <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Solte aqui</span>
         </div>
      )}
    </div>
  </div>
);

const Modal = ({ title, onClose, children }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
      <button onClick={onClose} className="absolute right-8 top-8 text-slate-300 hover:text-slate-600 transition-colors"><X size={28} /></button>
      <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter">{title}</h3>
      {children}
    </div>
  </div>
);

export default App;