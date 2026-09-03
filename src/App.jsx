import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, ArrowLeft, GraduationCap, Hash, Play, Plus, Trash2, Sun, Moon, Sparkles, ChevronRight, LogOut, User, Menu, X, Settings, Home, BookOpen, MessageSquare } from 'lucide-react';
import { categories as initialCategories } from './data';
import ChatAssistant from './ChatAssistant'; // Import komponen ChatAssistant
import { pekerjaanData } from './data/Pekerjaan';
import { transportasiData } from './data/transportasi';
import { rumahData } from './data/rumah';

const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numberToWords(n) {
  if (n === 0) return "zero";
  if (n === 100) return "one hundred";
  let str = "";
  if (n >= 20) {
    str += tens[Math.floor(n / 10)];
    if (n % 10 > 0) str += "-" + ones[n % 10];
  } else {
    str += ones[n];
  }
  return str.trim();
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('kosakata_user') || null);
  const [loginInput, setLoginInput] = useState('');
  
  const [screen, setScreen] = useState('home');
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);
  
  // Menggabungkan kategori awal dengan pekerjaanData, transportasiData, & rumahData
  const [categories, setCategories] = useState(() => {
    const baseCategories = { ...initialCategories };
    
    // Tambahkan Pekerjaan
    if (pekerjaanData) {
      baseCategories.pekerjaan = pekerjaanData;
    } else {
      baseCategories.pekerjaan = {
        name: "Pekerjaan",
        emoji: "💼",
        words: [
          ["teacher", "guru"],
          ["doctor", "dokter"],
          ["engineer", "insinyur"],
          ["nurse", "perawat"],
          ["police officer", "polisi"],
          ["chef", "koki"],
          ["driver", "sopir"],
          ["artist", "seniman"],
          ["programmer", "pemrogram"],
          ["firefighter", "pemadam kebakaran"]
        ]
      };
    }

    // Tambahkan Transportasi
    if (transportasiData) {
      baseCategories.transportasi = transportasiData;
    } else {
      baseCategories.transportasi = {
        name: "Transportasi",
        emoji: "🚗",
        words: [
          ["car", "mobil"],
          ["motorcycle", "sepeda motor"],
          ["bicycle", "sepeda"],
          ["bus", "bus"],
          ["train", "kereta api"]
        ]
      };
    }

    // Tambahkan Rumah & Ruangan
    if (rumahData) {
      baseCategories.rumah = rumahData;
    } else {
      baseCategories.rumah = {
        name: "Rumah & Ruangan",
        emoji: "🏠",
        words: [
          ["house", "rumah"],
          ["room", "ruangan"],
          ["living room", "ruang tamu"],
          ["bedroom", "kamar tidur"],
          ["kitchen", "dapur"]
        ]
      };
    }

    return baseCategories;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [newEnWord, setNewEnWord] = useState('');
  const [newIdWord, setNewIdWord] = useState('');

  const [selectedWord, setSelectedWord] = useState(null);

  const [quizState, setQuizState] = useState({
    title: '',
    questions: [],
    allOptionsPool: [],
    idx: 0,
    score: 0,
    answered: false,
    selectedOption: null,
    currentOptions: [],
    results: []
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginInput.trim()) return;
    const username = loginInput.trim();
    localStorage.setItem('kosakata_user', username);
    setUser(username);
    setLoginInput('');
    setScreen('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('kosakata_user');
    setUser(null);
    setScreen('home');
    setIsSidebarOpen(false);
  };

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateOptionsForQuestion = (currentQ, pool) => {
    const wrongOptions = shuffle(pool.filter(a => a !== currentQ.answer)).slice(0, 3);
    return shuffle([...wrongOptions, currentQ.answer]);
  };

  const startCategoryQuiz = (catKey) => {
    const category = categories[catKey];
    const questions = shuffle(category.words.map(w => ({ question: w[0], answer: w[1] }))).slice(0, 10);
    const allOptionsPool = category.words.map(w => w[1]);
    const firstOptions = generateOptionsForQuestion(questions[0], allOptionsPool);

    setQuizState({
      title: `Tes Kategori ${category.name}`,
      questions,
      allOptionsPool,
      idx: 0,
      score: 0,
      answered: false,
      selectedOption: null,
      currentOptions: firstOptions,
      results: []
    });
    setScreen('quiz');
  };

  const startNumberQuiz = () => {
    let questions = [];
    while (questions.length < 10) {
      let n = Math.floor(Math.random() * 100) + 1;
      if (!questions.some(q => q.question === String(n))) {
        questions.push({ question: String(n), answer: numberToWords(n) });
      }
    }
    const allOptionsPool = Array.from({ length: 100 }, (_, i) => numberToWords(i + 1));
    const firstOptions = generateOptionsForQuestion(questions[0], allOptionsPool);

    setQuizState({
      title: 'Tes Angka 1-100',
      questions,
      allOptionsPool,
      idx: 0,
      score: 0,
      answered: false,
      selectedOption: null,
      currentOptions: firstOptions,
      results: []
    });
    setScreen('quiz');
  };

  const handleAnswer = (option) => {
    if (quizState.answered) return;

    const currentQ = quizState.questions[quizState.idx];
    const isCorrect = option === currentQ.answer;

    setQuizState(prev => ({
      ...prev,
      answered: true,
      selectedOption: option,
      score: isCorrect ? prev.score + 1 : prev.score,
      results: [
        ...prev.results,
        { question: currentQ.question, chosen: option, correct: currentQ.answer, isCorrect }
      ]
    }));
  };

  const nextQuestion = () => {
    const nextIdx = quizState.idx + 1;
    if (nextIdx < quizState.questions.length) {
      const nextQ = quizState.questions[nextIdx];
      const nextOptions = generateOptionsForQuestion(nextQ, quizState.allOptionsPool);

      setQuizState(prev => ({
        ...prev,
        idx: nextIdx,
        answered: false,
        selectedOption: null,
        currentOptions: nextOptions
      }));
    } else {
      setQuizState(prev => ({ ...prev, idx: nextIdx }));
    }
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    if (!newEnWord.trim() || !newIdWord.trim() || !activeCategoryKey) return;

    const updatedWords = [...categories[activeCategoryKey].words, [newEnWord.trim().toLowerCase(), newIdWord.trim().toLowerCase()]];
    
    setCategories(prev => ({
      ...prev,
      [activeCategoryKey]: {
        ...prev[activeCategoryKey],
        words: updatedWords
      }
    }));

    setNewEnWord('');
    setNewIdWord('');
  };

  const handleDeleteWord = (indexToDelete) => {
    if (!activeCategoryKey) return;
    const updatedWords = categories[activeCategoryKey].words.filter((_, idx) => idx !== indexToDelete);

    setCategories(prev => ({
      ...prev,
      [activeCategoryKey]: {
        ...prev[activeCategoryKey],
        words: updatedWords
      }
    }));
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800',
    headerBg: isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/80',
    card: isDarkMode 
      ? 'bg-slate-900/90 border-slate-800 hover:border-teal-500/50 hover:shadow-teal-950/30' 
      : 'bg-white border-slate-200/80 hover:border-teal-400 shadow-sm hover:shadow-md',
    cardStatic: isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    titleText: isDarkMode ? 'text-white' : 'text-slate-900',
    inputBg: isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500',
    btnSecondary: isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200',
    quizBox: isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200',
    sidebarBg: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  };

  if (!user) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme.bg} font-sans flex items-center justify-center p-4`}>
        <div className={`max-w-md w-full ${theme.cardStatic} border p-8 rounded-3xl shadow-xl space-y-6 text-center`}>
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-2xl text-slate-950 shadow-md">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400">
              Kosakata Yuk
            </h1>
            <p className={`text-xs ${theme.subText} mt-1.5`}>Silakan masukkan nama kamu untuk mulai belajar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className={`block text-xs font-bold ${theme.subText} mb-1.5`}>Nama Pengguna</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-xs font-medium focus:outline-none transition ${theme.inputBg}`}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
            >
              Masuk Aplikasi <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-500/10 text-center">
            <span className={`text-[10px] ${theme.subText}`}>Web Creator: <strong className="text-teal-500 uppercase">yohanis bawon</strong></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg} font-sans pb-12 flex relative overflow-x-hidden`}>
      
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/50 z-40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r ${theme.sidebarBg} transition-transform duration-300 flex flex-col justify-between ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl md:shadow-none`}>
        
        <div className="p-5 border-b border-slate-500/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setScreen('home'); setIsSidebarOpen(false); }}>
              <div className="p-2 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl text-slate-950 shadow-sm">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-lg font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400">
                Kosakata Yuk
              </h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 md:hidden text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`p-3.5 rounded-2xl border ${theme.btnSecondary} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-sm">
              {user.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className={`text-[10px] uppercase tracking-wider font-bold ${theme.subText} block`}>Pengguna</span>
              <span className={`text-xs font-bold ${theme.titleText} truncate block`}>{user}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <span className={`px-3 text-[10px] font-extrabold uppercase tracking-wider ${theme.subText} block mb-2`}>Menu Utama</span>
            <button
              onClick={() => { setScreen('home'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${screen === 'home' ? 'bg-teal-500 text-slate-950 shadow-sm' : `${theme.subText} hover:${theme.titleText} hover:bg-slate-500/10`}`}
            >
              <Home className="w-4 h-4" /> Beranda
            </button>
            <button
              onClick={() => { setIsChatOpen(true); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition mt-1 ${theme.subText} hover:${theme.titleText} hover:bg-slate-500/10`}
            >
              <MessageSquare className="w-4 h-4 text-teal-500" /> AI Asisten Chat
            </button>
          </div>

          <div>
            <span className={`px-3 text-[10px] font-extrabold uppercase tracking-wider ${theme.subText} block mb-2`}>Kategori Kosakata</span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setScreen('numbers');
                  setActiveCategoryKey(null);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  screen === 'numbers' 
                    ? 'bg-teal-500/20 text-teal-500 border border-teal-500/30' 
                    : `${theme.subText} hover:${theme.titleText} hover:bg-slate-500/10`
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-base">#</span>
                  <span className="truncate">Angka 1-100</span>
                </div>
                <span className="text-[10px] opacity-70 font-normal">100</span>
              </button>

              {Object.entries(categories).map(([key, cat]) => {
                const isActive = screen === 'category_detail' && activeCategoryKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCategoryKey(key);
                      setScreen('category_detail');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      isActive 
                        ? 'bg-teal-500/20 text-teal-500 border border-teal-500/30' 
                        : `${theme.subText} hover:${theme.titleText} hover:bg-slate-500/10`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{cat.emoji}</span>
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-[10px] opacity-70 font-normal">{cat.words.length}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={`px-3 text-[10px] font-extrabold uppercase tracking-wider ${theme.subText} block mb-2`}>Pengaturan</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${theme.subText} hover:${theme.titleText} hover:bg-slate-500/10`}
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span>Mode Tampilan</span>
              </div>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded border border-slate-500/20">{isDarkMode ? 'Malam' : 'Siang'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-500/10 space-y-3 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" /> Keluar Akun
          </button>

          <div className="pt-2 text-center border-t border-slate-500/10">
            <p className={`text-[10px] ${theme.subText} font-medium`}>
              Created by <span className="font-bold text-teal-500 uppercase">yohanis bawon</span>
            </p>
          </div>
        </div>

      </aside>

      <div className="flex-1 md:pl-72 flex flex-col min-h-screen">
        
        <header className={`sticky top-0 z-35 backdrop-blur-md border-b ${theme.headerBg} transition-colors px-4 sm:px-8 py-3.5 mb-8 flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2.5 rounded-xl border md:hidden transition ${theme.btnSecondary}`}
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className={`text-xs font-bold ${theme.titleText}`}>
              {screen === 'home' && 'Beranda'}
              {screen === 'category_detail' && 'Detail Kosakata'}
              {screen === 'numbers' && 'Modul Angka 1-100'}
              {screen === 'quiz' && 'Sesi Kuis & Tes'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChatOpen(true)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 transition shadow-sm`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> AI Chat
            </button>
            {screen !== 'home' && (
              <button
                onClick={() => setScreen('home')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition ${theme.btnSecondary}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Beranda
              </button>
            )}
          </div>
        </header>

        <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 flex-1">

          {screen === 'home' && (
            <div className="space-y-8">
              <div className={`${theme.cardStatic} border p-6 sm:p-8 rounded-3xl shadow-sm flex items-center justify-between`}>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider text-teal-500 block mb-1`}>Dashboard Pembelajaran</span>
                  <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.titleText} capitalize`}>
                    Welcome, {user} 👋
                  </h2>
                  <p className={`text-xs sm:text-sm ${theme.subText} mt-2 max-w-md`}>
                    Pilih kategori kosakata, modul angka, atau gunakan AI Chat Asisten untuk membantu proses belajar bahasa Inggris kamu hari ini!
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xs font-extrabold ${theme.subText} tracking-wider uppercase`}>Daftar Kategori Kosakata</h2>
                  <span className={`text-xs ${theme.subText} font-medium`}>{Object.keys(categories).length} Modul Tersedia</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div
                    onClick={() => setScreen('numbers')}
                    className={`${theme.card} border p-4.5 rounded-2xl cursor-pointer transition-all duration-300 text-left flex flex-col justify-between group hover:-translate-y-1`}
                  >
                    <div>
                      <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform origin-left font-black text-teal-500">#</span>
                      <h4 className={`font-bold ${theme.titleText} text-sm line-clamp-1`}>Angka 1-100</h4>
                      <p className={`text-xs ${theme.subText} mt-1 font-medium`}>100 angka</p>
                    </div>
                  </div>

                  {Object.entries(categories).map(([key, cat]) => (
                    <div
                      key={key}
                      onClick={() => { setActiveCategoryKey(key); setScreen('category_detail'); }}
                      className={`${theme.card} border p-4.5 rounded-2xl cursor-pointer transition-all duration-300 text-left flex flex-col justify-between group hover:-translate-y-1`}
                    >
                      <div>
                        <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform origin-left">{cat.emoji}</span>
                        <h4 className={`font-bold ${theme.titleText} text-sm line-clamp-1`}>{cat.name}</h4>
                        <p className={`text-xs ${theme.subText} mt-1 font-medium`}>{cat.words.length} kata</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {screen === 'category_detail' && activeCategoryKey && categories[activeCategoryKey] && (
            <div className="space-y-6">
              <div className={`${theme.cardStatic} p-6 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div>
                  <h2 className={`text-2xl font-bold ${theme.titleText} flex items-center gap-2.5`}>
                    <span>{categories[activeCategoryKey].emoji}</span> {categories[activeCategoryKey].name}
                  </h2>
                  <p className={`text-xs ${theme.subText} mt-1`}>{categories[activeCategoryKey].words.length} Kosakata Pelajaran</p>
                </div>
                <button
                  onClick={() => startCategoryQuiz(activeCategoryKey)}
                  className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" /> Tes Kategori Ini
                </button>
              </div>

              <form onSubmit={handleAddWord} className={`${theme.cardStatic} p-3.5 border rounded-2xl flex flex-col sm:flex-row gap-2.5`}>
                <input
                  type="text"
                  placeholder="Inggris (contoh: apple)"
                  value={newEnWord}
                  onChange={(e) => setNewEnWord(e.target.value)}
                  className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-none transition ${theme.inputBg}`}
                />
                <input
                  type="text"
                  placeholder="Indonesia (contoh: apel)"
                  value={newIdWord}
                  onChange={(e) => setNewIdWord(e.target.value)}
                  className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-none transition ${theme.inputBg}`}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Tambah Kata
                </button>
              </form>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {categories[activeCategoryKey].words.map(([en, id], idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setSelectedWord({ 
                        en, 
                        id, 
                        emoji: categories[activeCategoryKey].emoji,
                        categoryKey: activeCategoryKey 
                      });
                      speakWord(en);
                    }}
                    className={`${theme.cardStatic} p-4 border rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-105 transition transform duration-200`}
                  >
                    <div>
                      <span className="text-base font-bold text-teal-500 capitalize">{en}</span>
                      <p className={`text-xs ${theme.subText} mt-0.5 capitalize`}>{id}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-500/10" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteWord(idx)}
                        className="text-slate-400 hover:text-red-500 transition p-1"
                        title="Hapus Kata"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => speakWord(en)}
                        className="text-slate-400 hover:text-teal-500 transition p-1"
                        title="Dengarkan Suara"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screen === 'numbers' && (
            <div className="space-y-6">
              <div className={`${theme.cardStatic} p-6 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div>
                  <h2 className={`text-2xl font-bold ${theme.titleText}`}>Modul Angka 1-100</h2>
                  <p className={`text-xs ${theme.subText} mt-1`}>Klik icon suara untuk mendengar pelafalan angka</p>
                </div>
                <button
                  onClick={startNumberQuiz}
                  className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" /> Tes Angka
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-h-[550px] overflow-y-auto pr-1">
                {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
                  const textWord = numberToWords(n);
                  return (
                    <div 
                      key={n} 
                      onClick={() => {
                        setSelectedWord({ en: textWord, id: String(n), emoji: '#' });
                        speakWord(textWord);
                      }}
                      className={`${theme.cardStatic} p-4 border rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-105 transition transform duration-200`}
                    >
                      <span className="text-2xl font-black text-teal-500">{n}</span>
                      <div className="flex justify-between items-end mt-2" onClick={(e) => e.stopPropagation()}>
                        <span className={`text-xs font-semibold ${theme.subText} capitalize`}>{textWord}</span>
                        <button
                          onClick={() => speakWord(textWord)}
                          className="text-slate-400 hover:text-teal-500 transition p-1"
                          title="Dengarkan Suara"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {screen === 'quiz' && (
            <div className="max-w-2xl mx-auto">
              {quizState.idx >= quizState.questions.length ? (
                <div className={`${theme.cardStatic} border rounded-2xl p-6 sm:p-8 text-center space-y-6`}>
                  <h2 className={`text-2xl font-bold ${theme.titleText}`}>{quizState.title} Selesai! 🎉</h2>
                  
                  <div className="py-2">
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                      {Math.round((quizState.score / quizState.questions.length) * 100)}%
                    </div>
                    <p className={`text-xs sm:text-sm ${theme.subText} mt-2 font-medium`}>
                      Skor kamu: <span className={`${theme.titleText} font-bold`}>{quizState.score}</span> dari {quizState.questions.length} benar
                    </p>
                  </div>

                  <button
                    onClick={() => setScreen('home')}
                    className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              ) : (
                <div className={`${theme.cardStatic} border rounded-2xl p-6 sm:p-8 space-y-6`}>
                  <div className="flex justify-between items-center text-xs font-bold text-teal-500">
                    <span>Soal {quizState.idx + 1} dari {quizState.questions.length}</span>
                    <span>Skor: {quizState.score}</span>
                  </div>

                  <div className="text-center py-6">
                    <h3 className={`text-3xl font-extrabold ${theme.titleText} capitalize`}>
                      {quizState.questions[quizState.idx].question}
                    </h3>
                    <p className={`text-xs ${theme.subText} mt-2`}>Pilih terjemahan yang benar:</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quizState.currentOptions.map((opt, i) => {
                      let btnStyle = theme.btnSecondary;
                      if (quizState.answered) {
                        if (opt === quizState.questions[quizState.idx].answer) {
                          btnStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-600';
                        } else if (opt === quizState.selectedOption) {
                          btnStyle = 'bg-rose-500 text-white font-bold border-rose-600';
                        }
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          disabled={quizState.answered}
                          className={`p-4 rounded-xl text-xs font-bold border transition text-center capitalize ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizState.answered && (
                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={nextQuestion}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
                      >
                        Selanjutnya <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {isChatOpen && (
        <ChatAssistant 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          isDarkMode={isDarkMode} 
        />
      )}

    </div>
  );
}