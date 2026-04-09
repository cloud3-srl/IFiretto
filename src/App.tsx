/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  Trophy, 
  MessageCircle, 
  Camera, 
  Bell, 
  CheckCircle2, 
  Circle, 
  X, 
  ChevronRight,
  Sparkles,
  Send,
  Loader2
} from 'lucide-react';
import { format, isToday, parseISO, addDays, differenceInDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from './lib/utils';
import { Fioretto, Reward, Category, Difficulty } from './types';
import { chatWithGemini, analyzeProgressImage } from './services/gemini';
import Markdown from 'react-markdown';

const CATEGORIES: { name: Category; icon: string; color: string }[] = [
  { name: 'Salute', icon: '🍎', color: 'bg-green-500' },
  { name: 'Spiritualità', icon: '✨', color: 'bg-purple-500' },
  { name: 'Relazioni', icon: '❤️', color: 'bg-red-500' },
  { name: 'Produttività', icon: '⚡', color: 'bg-orange-500' },
  { name: 'Altro', icon: '🏷️', color: 'bg-gray-500' },
];

const DIFFICULTIES: Difficulty[] = ['Leggero', 'Medio', 'Eroico'];

const Logo = () => {
  const words = ['fioretto', 'furetto', 'fumetto', 'folletto', 'faretto', 'filetto', 'fiorotto'];
  const [currentWord, setCurrentWord] = useState('fioretto');

  useEffect(() => {
    const interval = setInterval(() => {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(randomWord);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center font-bold text-xl tracking-tight">
      <span>a</span>
      <span className="text-ios-blue">i</span>
      <span className="ml-1.5">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={() => {}}
      className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Light Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [-20, 20, -20],
            y: [-20, 20, -20]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-ios-blue/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [20, -20, 20],
            y: [20, -20, 20]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-purple-500/10 blur-[120px] rounded-full"
        />
      </div>

      {/* Logo Container */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="relative group">
            <h1 className="text-5xl font-bold tracking-tighter text-white flex items-baseline">
              <span className="text-ios-blue relative">
                i
                <motion.span 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 ml-1">
                Fioretto
              </span>
            </h1>
            
            {/* Light Sweep Effect */}
            <motion.div 
              initial={{ x: '-150%' }}
              animate={{ x: '150%' }}
              transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
            />
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-4 text-[10px] uppercase tracking-[0.3em] font-medium text-white/80"
          >
            Premium Experience
          </motion.p>
        </motion.div>
      </div>

      {/* Loading Indicator */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ delay: 0.5, duration: 2, ease: "easeInOut" }}
        onAnimationComplete={() => setTimeout(onComplete, 500)}
        className="absolute bottom-20 h-[1px] bg-gradient-to-r from-transparent via-ios-blue to-transparent"
      />
    </motion.div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fioretti, setFioretti] = useState<Fioretto[]>(() => {
    const saved = localStorage.getItem('fioretti');
    return saved ? JSON.parse(saved) : [];
  });
  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('rewards');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'rewards' | 'ai'>('today');
  const [isAdding, setIsAdding] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string}[]>([]);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReward, setNewReward] = useState('');
  const [newDuration, setNewDuration] = useState(7);
  const [newCategory, setNewCategory] = useState<Category>('Altro');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Leggero');

  // AI state
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('fioretti', JSON.stringify(fioretti));
  }, [fioretti]);

  useEffect(() => {
    localStorage.setItem('rewards', JSON.stringify(rewards));
  }, [rewards]);

  const addNotification = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const calculateStreak = (completedDays: string[]): number => {
    if (completedDays.length === 0) return 0;
    const sortedDays = [...completedDays].sort((a, b) => parseISO(b).getTime() - parseISO(a).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    const todayStr = format(currentDate, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(currentDate, 1), 'yyyy-MM-dd');

    // If not completed today and not completed yesterday, streak is 0
    if (!completedDays.includes(todayStr) && !completedDays.includes(yesterdayStr)) {
      return 0;
    }

    // Start checking from the most recent completion
    let checkDate = completedDays.includes(todayStr) ? currentDate : subDays(currentDate, 1);
    
    while (completedDays.includes(format(checkDate, 'yyyy-MM-dd'))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }

    return streak;
  };

  const handleAddFioretto = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date();
    const end = addDays(start, newDuration);
    
    const newFioretto: Fioretto = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      description: newDesc,
      category: newCategory,
      difficulty: newDifficulty,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      completedDays: [],
      status: 'active',
      reward: newReward,
      currentStreak: 0,
      bestStreak: 0
    };

    setFioretti([newFioretto, ...fioretti]);
    setIsAdding(false);
    setNewTitle('');
    setNewDesc('');
    setNewReward('');
    setNewCategory('Altro');
    setNewDifficulty('Leggero');
    addNotification(`Fioretto "${newTitle}" impostato per ${newDuration} giorni!`);
  };

  const toggleDay = (fiorettoId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setFioretti(prev => prev.map(f => {
      if (f.id === fiorettoId) {
        const isCompleted = f.completedDays.includes(today);
        const newCompletedDays = isCompleted 
          ? f.completedDays.filter(d => d !== today)
          : [...f.completedDays, today];
        
        const newStreak = calculateStreak(newCompletedDays);
        const newBestStreak = Math.max(f.bestStreak, newStreak);

        // Check if finished
        const totalDays = differenceInDays(parseISO(f.endDate), parseISO(f.startDate)) + 1;
        if (newCompletedDays.length === totalDays && !isCompleted) {
          addNotification(`Complimenti! Hai completato il fioretto: ${f.title}`);
          const newReward: Reward = {
            id: Math.random().toString(36).substr(2, 9),
            title: f.reward || "Premio per la costanza",
            icon: "🏆",
            unlockedAt: new Date().toISOString()
          };
          setRewards(prevR => [newReward, ...prevR]);
          return { 
            ...f, 
            completedDays: newCompletedDays, 
            status: 'completed',
            currentStreak: newStreak,
            bestStreak: newBestStreak
          };
        }

        return { 
          ...f, 
          completedDays: newCompletedDays,
          currentStreak: newStreak,
          bestStreak: newBestStreak
        };
      }
      return f;
    }));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setIsChatLoading(true);

    try {
      const response = await chatWithGemini(userMsg, chatHistory);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response || "" }] }]);
    } catch (error) {
      addNotification("Errore nella comunicazione con l'AI");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const analysis = await analyzeProgressImage(base64, file.type);
        setChatHistory(prev => [
          ...prev, 
          { role: 'user', parts: [{ text: "[Immagine caricata]" }] },
          { role: 'model', parts: [{ text: analysis || "" }] }
        ]);
        setActiveTab('ai');
      } catch (error) {
        addNotification("Errore nell'analisi dell'immagine");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-ios-background overflow-hidden relative shadow-2xl">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Status Bar Mockup */}
      <div className="h-12 flex items-center justify-between px-6 pt-4 bg-transparent z-50">
        <div className="flex-1">
          <span className="text-sm font-semibold">9:41</span>
        </div>
        
        <div className="flex-1 flex justify-center scale-75 origin-center">
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-end gap-1.5">
          <div className="w-4 h-4 rounded-full border-2 border-black/20" />
          <div className="w-4 h-4 rounded-full border-2 border-black/20" />
          <div className="w-6 h-3 rounded-sm border border-black/20 relative">
            <div className="absolute left-0.5 top-0.5 bottom-0.5 right-1.5 bg-black rounded-xs" />
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 ios-blur sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTab === 'today' && "Oggi"}
            {activeTab === 'history' && "Cronologia"}
            {activeTab === 'rewards' && "Premi"}
            {activeTab === 'ai' && "Assistente AI"}
          </h1>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full bg-gray-100 text-ios-blue active:scale-90 transition-transform"
            >
              <Camera size={20} />
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="p-2 rounded-full bg-ios-blue text-white active:scale-90 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div 
              key="today"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Daily Summary Card */}
              <div className="bg-gradient-to-br from-ios-blue to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Progresso Odierno</p>
                    <h2 className="text-2xl font-bold">
                      {fioretti.filter(f => f.status === 'active' && f.completedDays.includes(format(new Date(), 'yyyy-MM-dd'))).length} / {fioretti.filter(f => f.status === 'active').length}
                    </h2>
                  </div>
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <Trophy size={20} />
                  </div>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000" 
                    style={{ 
                      width: `${fioretti.filter(f => f.status === 'active').length > 0 
                        ? (fioretti.filter(f => f.status === 'active' && f.completedDays.includes(format(new Date(), 'yyyy-MM-dd'))).length / fioretti.filter(f => f.status === 'active').length) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
                <p className="text-[10px] mt-2 text-blue-100 italic">
                  "Ogni piccolo passo conta per la tua crescita."
                </p>
              </div>

              {/* Upcoming Notifications Preview */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-ios-gray uppercase px-1">Prossime Notifiche</h2>
                <div className="space-y-2">
                  {fioretti.filter(f => f.status === 'active' && !f.completedDays.includes(format(new Date(), 'yyyy-MM-dd'))).slice(0, 2).map((f, i) => (
                    <div key={`notif-${f.id}`} className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                      <div className="bg-ios-blue/10 p-2 rounded-xl">
                        <Bell size={16} className="text-ios-blue" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold">Promemoria Fioretto</p>
                          <span className="text-[10px] text-ios-gray">{i === 0 ? "18:30" : "21:00"}</span>
                        </div>
                        <p className="text-xs text-ios-gray">Non dimenticare: {f.title}</p>
                      </div>
                    </div>
                  ))}
                  {fioretti.filter(f => f.status === 'active' && !f.completedDays.includes(format(new Date(), 'yyyy-MM-dd'))).length === 0 && (
                    <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 text-center">
                      <p className="text-xs text-ios-gray italic">Tutto completato per oggi! ✨</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xs font-bold text-ios-gray uppercase px-1">I tuoi fioretti</h2>
                {fioretti.filter(f => f.status === 'active').length === 0 ? (
                <div className="text-center py-20 text-ios-gray">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nessun fioretto attivo.</p>
                  <p className="text-sm">Inizia ora a migliorare te stesso!</p>
                </div>
              ) : (
                fioretti.filter(f => f.status === 'active').map(f => {
                  const category = CATEGORIES.find(c => c.name === f.category) || CATEGORIES[4];
                  return (
                    <div key={f.id} className="ios-card flex items-center justify-between group relative overflow-hidden">
                      <div className={cn("absolute left-0 top-0 bottom-0 w-1", category.color)} />
                      <div className="flex-1 pl-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{category.icon}</span>
                          <h3 className="font-semibold text-lg">{f.title}</h3>
                          {f.currentStreak > 1 && (
                            <div className="flex items-center gap-0.5 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <Sparkles size={10} fill="currentColor" />
                              {f.currentStreak} GIORNI
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-ios-gray line-clamp-1">{f.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-ios-blue transition-all duration-500" 
                              style={{ width: `${(f.completedDays.length / (differenceInDays(parseISO(f.endDate), parseISO(f.startDate)) + 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-ios-gray">
                            {f.completedDays.length}/{differenceInDays(parseISO(f.endDate), parseISO(f.startDate)) + 1}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleDay(f.id)}
                        className={cn(
                          "ml-4 p-2 rounded-full transition-colors",
                          f.completedDays.includes(format(new Date(), 'yyyy-MM-dd'))
                            ? "text-ios-green"
                            : "text-gray-200 hover:text-ios-blue"
                        )}
                      >
                        {f.completedDays.includes(format(new Date(), 'yyyy-MM-dd')) 
                          ? <CheckCircle2 size={32} /> 
                          : <Circle size={32} />}
                      </button>
                    </div>
                  );
                })
              )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {fioretti.map(f => {
                const category = CATEGORIES.find(c => c.name === f.category) || CATEGORIES[4];
                return (
                  <div key={f.id} className="ios-card opacity-80 relative overflow-hidden">
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", category.color)} />
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <h3 className="font-semibold">{f.title}</h3>
                        </div>
                        <p className="text-xs text-ios-gray">
                          {format(parseISO(f.startDate), 'd MMM', { locale: it })} - {format(parseISO(f.endDate), 'd MMM', { locale: it })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                          f.status === 'completed' ? "bg-ios-green/10 text-ios-green" : "bg-ios-blue/10 text-ios-blue"
                        )}>
                          {f.status}
                        </span>
                        <span className="text-[9px] text-ios-gray font-medium">Record: {f.bestStreak}d</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div 
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              {rewards.length === 0 ? (
                <div className="col-span-2 text-center py-20 text-ios-gray">
                  <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Ancora nessun premio.</p>
                  <p className="text-sm">Completa i tuoi fioretti per sbloccarli!</p>
                </div>
              ) : (
                rewards.map(r => (
                  <div key={r.id} className="ios-card flex flex-col items-center text-center p-6">
                    <span className="text-4xl mb-3">{r.icon}</span>
                    <h3 className="font-bold text-sm">{r.title}</h3>
                    <p className="text-[10px] text-ios-gray mt-1">
                      Sbloccato il {format(parseISO(r.unlockedAt), 'd MMM', { locale: it })}
                    </p>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-full"
            >
              <div className="flex-1 space-y-4 mb-4">
                {chatHistory.length === 0 && (
                  <div className="text-center py-10 text-ios-gray">
                    <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Ciao! Sono il tuo assistente.</p>
                    <p className="text-sm">Chiedimi consigli sui tuoi fioretti o mandami una foto dei tuoi progressi!</p>
                  </div>
                )}
                {chatHistory.map((chat, i) => (
                  <div key={i} className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm",
                    chat.role === 'user' 
                      ? "bg-ios-blue text-white ml-auto rounded-tr-none" 
                      : "bg-white text-black mr-auto rounded-tl-none shadow-sm"
                  )}>
                    <div className="markdown-body">
                      <Markdown>{chat.parts[0].text}</Markdown>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="bg-white text-black mr-auto p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-ios-blue" />
                    <span className="text-xs">L'AI sta pensando...</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Scrivi un messaggio..."
                  className="flex-1 bg-transparent px-3 py-2 outline-none text-sm"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="p-2 rounded-xl bg-ios-blue text-white disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tab Bar */}
      <nav className="h-20 ios-blur fixed bottom-0 left-0 right-0 max-w-md mx-auto flex items-center justify-around px-4 pb-4 z-40">
        <button 
          onClick={() => setActiveTab('today')}
          className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'today' ? "text-ios-blue" : "text-ios-gray")}
        >
          <Calendar size={24} />
          <span className="text-[10px] font-medium">Oggi</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'history' ? "text-ios-blue" : "text-ios-gray")}
        >
          <Bell size={24} />
          <span className="text-[10px] font-medium">Cronologia</span>
        </button>
        <button 
          onClick={() => setActiveTab('rewards')}
          className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'rewards' ? "text-ios-blue" : "text-ios-gray")}
        >
          <Trophy size={24} />
          <span className="text-[10px] font-medium">Premi</span>
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'ai' ? "text-ios-blue" : "text-ios-gray")}
        >
          <MessageCircle size={24} />
          <span className="text-[10px] font-medium">AI</span>
        </button>
      </nav>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Nuovo Fioretto</h2>
                <button onClick={() => setIsAdding(false)} className="p-1 rounded-full bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddFioretto} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-ios-gray uppercase mb-1 block">Titolo</label>
                  <input 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Es: Niente dolci"
                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-ios-blue outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ios-gray uppercase mb-1 block">Categoria</label>
                    <select 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as Category)}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-ios-blue outline-none appearance-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ios-gray uppercase mb-1 block">Difficoltà</label>
                    <select 
                      value={newDifficulty}
                      onChange={e => setNewDifficulty(e.target.value as Difficulty)}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-ios-blue outline-none appearance-none"
                    >
                      {DIFFICULTIES.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-ios-gray uppercase mb-1 block">Descrizione</label>
                  <textarea 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Perché lo fai?"
                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-ios-blue outline-none h-16 resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-ios-gray uppercase mb-1 block">Durata (Giorni)</label>
                    <input 
                      type="number"
                      min="1"
                      max="365"
                      value={newDuration}
                      onChange={e => setNewDuration(parseInt(e.target.value))}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-ios-blue outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-ios-gray uppercase mb-1 block">Premio</label>
                    <input 
                      value={newReward}
                      onChange={e => setNewReward(e.target.value)}
                      placeholder="Es: Una pizza"
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-ios-blue outline-none"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full ios-button-primary mt-4">
                  Inizia Fioretto
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="fixed top-14 left-0 right-0 px-4 z-[60] pointer-events-none space-y-2">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/90 backdrop-blur shadow-lg border border-gray-100 rounded-2xl p-4 flex items-center gap-3 max-w-sm mx-auto pointer-events-auto"
            >
              <div className="bg-ios-blue/10 p-2 rounded-full">
                <Bell size={18} className="text-ios-blue" />
              </div>
              <p className="text-sm font-medium">{n.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Analyzing Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70] flex flex-col items-center justify-center text-white"
          >
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="text-lg font-bold">Analisi in corso...</p>
            <p className="text-sm opacity-70">L'AI sta guardando la tua immagine</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
