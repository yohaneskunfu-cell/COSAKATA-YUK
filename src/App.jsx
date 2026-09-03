import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, ArrowLeft, GraduationCap, Hash, Play, Plus, Trash2, Sun, Moon, Sparkles, ChevronRight, LogOut, User, Menu, X, Settings, Home, BookOpen, MessageSquare, Shield, Activity, Users, Database, Loader2 } from 'lucide-react';
import { categories as initialCategories } from './data';
import ChatAssistant from './ChatAssistant';
import { pekerjaanData } from './data/Pekerjaan';
import { transportasiData } from "./data/transportasi";
import { rumahData } from "./data/rumah";
import { jurusanVocab } from "./data/jurusan";

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
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('kosakata_is_admin') === 'true');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // Durasi ikon loading di atas selama 5 detik
    return () => clearTimeout(timer);
  }, []);

  const [loginInput, setLoginInput] = useState('');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  
  // Sinkronisasi state log aktivitas dengan localStorage
  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('kosakata_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [studentReports, setStudentReports] = useState(() => {
    const saved = localStorage.getItem('kosakata_reports');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [screen, setScreen] = useState(() => {
    return localStorage.getItem('kosakata_is_admin') === 'true' ? 'admin_dashboard' : 'home';
  });
  
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);
  
  const [categories, setCategories] = useState(() => {
    let baseCategories = { ...initialCategories };
    if (pekerjaanData) baseCategories.pekerjaan = pekerjaanData;
    if (transportasiData) baseCategories.transportasi = transportasiData;
    if (rumahData) baseCategories.rumah = rumahData;
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

  // Listener real-time antar tab/window untuk Admin & Siswa
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'kosakata_logs' && e.newValue) {
        setActivityLogs(JSON.parse(e.newValue));
      }
      if (e.key === 'kosakata_reports' && e.newValue) {
        setStudentReports(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logActivity = (actionText, customUser = null) => {
    const currentUser = customUser || user || localStorage.getItem('kosakata_user') || 'Tamu';
    const newLog = {
      id: Date.now() + Math.random(),
      user: currentUser,
      action: actionText,
      time: new Date().toLocaleTimeString() + ' - ' + new Date().toLocaleDateString()
    };
    setActivityLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('kosakata_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const saveQuizReport = (finalScore, totalQ, resultsArr, quizTitle) => {
    const currentUser = user || localStorage.getItem('kosakata_user') || 'Siswa';
    const reportItem = {
      id: Date.now(),
      user: currentUser,
      title: quizTitle,
      score: finalScore,
      total: totalQ,
      percentage: Math.round((finalScore / totalQ) * 100),
      details: resultsArr,
      time: new Date().toLocaleTimeString() + ' - ' + new Date().toLocaleDateString()
    };
    setStudentReports(prev => {
      const updated = [reportItem, ...prev];
      localStorage.setItem('kosakata_reports', JSON.stringify(updated));
      return updated;
    });
    logActivity(`Menyelesaikan ${quizTitle} dengan skor ${finalScore}/${totalQ}`, currentUser);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginInput.trim()) return;
    const username = loginInput.trim();
    localStorage.setItem('kosakata_user', username);
    setUser(username);
    setLoginInput('');
    setScreen('home');
    logActivity(`Login ke aplikasi`, username);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === '1234') {
      setIsAdmin(true);
      localStorage.setItem('kosakata_is_admin', 'true');
      setShowAdminLoginModal(false);
      setAdminPinInput('');
      setScreen('admin_dashboard');
      logActivity(`Admin masuk ke Panel Dashboard`, 'Administrator');
    } else {
      alert('PIN Admin Salah! (Gunakan: 1234)');
    }
  };

  const handleLogout = () => {
    logActivity(`Keluar dari akun`, user || 'Siswa');
    localStorage.removeItem('kosakata_user');
    localStorage.removeItem('kosakata_is_admin');
    setUser(null);
    setIsAdmin(false);
    setScreen('home');
    setIsSidebarOpen(false);
  };

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.split('/')[0].trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateOptionsForQuestion = (currentQ, pool) => {
    const wrongOptions = shuffle(pool.filter(a => a !== currentQ.answer)).slice(0, 3);
    return shuffle([...wrongOptions, currentQ.answer]);
  };

  const getActiveWordsAndDetails = () => {
    if (activeCategoryKey?.startsWith('jurusan_')) {
      const subKey = activeCategoryKey.replace('jurusan_', '');
      const subData = jurusanVocab?.categories?.[subKey];
      return {
        name: subData?.name || "Kosakata Jurusan",
        emoji: subData?.emoji || "🎓",
        words: subData?.words || []
      };
    }
    const cat = categories[activeCategoryKey];
    return {
      name: cat?.name || "",
      emoji: cat?.emoji || "📁",
      words: cat?.words || []
    };
  };

  const startCategoryQuiz = (catKey) => {
    let wordsList = [];
    let titleName = "";

    if (catKey.startsWith('jurusan_')) {
      const subKey = catKey.replace('jurusan_', '');
      const subData = jurusanVocab?.categories?.[subKey];
      wordsList = subData?.words || [];
      titleName = subData?.name || "Jurusan";
    } else {
      wordsList = categories[catKey]?.words || [];
      titleName = categories[catKey]?.name || "Kategori";
    }

    const questions = shuffle(wordsList.map(w => ({ question: w[0], answer: w[1] }))).slice(0, 10);
    const allOptionsPool = wordsList.map(w => w[1]);
    const firstOptions = generateOptionsForQuestion(questions[0], allOptionsPool);

    setQuizState({
      title: `Tes Kategori ${titleName}`,
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
    logActivity(`Memulai kuis kategori: ${titleName}`);
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
    logActivity(`Memulai kuis Angka 1-100`);
  };

  const handleAnswer = (option) => {
    if (quizState.answered) return;
    const currentQ = quizState.questions[quizState.idx];
    const isCorrect = option === currentQ.answer;

    const updatedResults = [
      ...quizState.results,
      { question: currentQ.question, chosen: option, correct: currentQ.answer, isCorrect }
    ];

    const newScore = isCorrect ? quizState.score + 1 : quizState.score;

    setQuizState(prev => ({
      ...prev,
      answered: true,
      selectedOption: option,
      score: newScore,
      results: updatedResults
    }));

    if (quizState.idx + 1 >= quizState.questions.length) {
      saveQuizReport(newScore, quizState.questions.length, updatedResults, quizState.title);
    }
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

    if (activeCategoryKey.startsWith('jurusan_')) {
      const subKey = activeCategoryKey.replace('jurusan_', '');
      if (jurusanVocab?.categories?.[subKey]) {
        jurusanVocab.categories[subKey].words.push([newEnWord.trim().toLowerCase(), newIdWord.trim().toLowerCase()]);
      }
    } else {
      const updatedWords = [...categories[activeCategoryKey].words, [newEnWord.trim().toLowerCase(), newIdWord.trim().toLowerCase()]];
      setCategories(prev => ({
        ...prev,
        [activeCategoryKey]: {
          ...prev[activeCategoryKey],
          words: updatedWords
        }
      }));
    }

    logActivity(`Menambahkan kosakata baru: '${newEnWord}'`);
    setNewEnWord('');
    setNewIdWord('');
  };

  const handleDeleteWord = (indexToDelete) => {
    if (!activeCategoryKey) return;
    if (activeCategoryKey.startsWith('jurusan_')) {
      const subKey = activeCategoryKey.replace('jurusan_', '');
      if (jurusanVocab?.categories?.[subKey]) {
        jurusanVocab.categories[subKey].words = jurusanVocab.categories[subKey].words.filter((_, idx) => idx !== indexToDelete);
      }
    } else {
      const updatedWords = categories[activeCategoryKey].words.filter((_, idx) => idx !== indexToDelete);
      setCategories(prev => ({
        ...prev,
        [activeCategoryKey]: {
          ...prev[activeCategoryKey],
          words: updatedWords
        }
      }));
    }
    logActivity(`Menghapus kosakata`);
    setActiveCategoryKey(prev => prev);
  };

  const theme = {
    bg: isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800',
    headerBg: isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200/80',
    card: isDarkMode 
      ? 'bg-slate-900/90 border-slate-800 hover:border-teal-500/50' 
      : 'bg-white border-slate-200/80 hover:border-teal-400 shadow-sm hover:shadow-md',
    cardStatic: isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80 shadow-sm',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    titleText: isDarkMode ? 'text-white' : 'text-slate-900',
    inputBg: isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    btnSecondary: isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200',
    sidebarBg: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
  };

  if (!user && !isAdmin) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme.bg} font-sans flex items-center justify-center p-4 relative`}>
        {isLoading && (
          <div className="absolute top-4 bg-teal-500 text-slate-950 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce z-50">
            <Loader2 className="w-4 h-4 animate-spin" /> Memuat Aplikasi...
          </div>
        )}

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
            <p className={`text-xs ${theme.subText} mt-1.5`}>Masukkan nama siswa untuk mulai belajar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className={`block text-xs font-bold ${theme.subText} mb-1.5`}>Nama Siswa / Pengguna</label>
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
              Mulai Belajar <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className={`w-full py-2.5 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${theme.btnSecondary}`}
            >
              <Shield className="w-4 h-4 text-teal-500" /> Masuk Panel Admin
            </button>
          </div>

          {showAdminLoginModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={`${theme.cardStatic} border max-w-sm w-full p-6 rounded-2xl space-y-4 text-left shadow-2xl`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold text-sm ${theme.titleText} flex items-center gap-2`}>
                    <Shield className="w-4 h-4 text-teal-500" /> Login Admin
                  </h3>
                  <button onClick={() => setShowAdminLoginModal(false)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div>
                    <label className={`block text-[10px] font-bold ${theme.subText} mb-1`}>PIN Admin (Default: 1234)</label>
                    <input
                      type="password"
                      placeholder="Masukkan PIN"
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-none ${theme.inputBg}`}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs transition"
                  >
                    Masuk Sebagai Admin
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg} font-sans pb-12 flex relative overflow-x-hidden`}>
      
      {isLoading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl animate-pulse z-[100]">
          <Loader2 className="w-4 h-4 animate-spin" /> Memuat Sesi Aplikasi...
        </div>
      )}

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-950/50 z-40 backdrop-blur-sm md:hidden" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r ${theme.sidebarBg} transition-transform duration-300 flex flex-col justify-between ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl`}>
        <div className="p-5 border-b border-slate-500/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setScreen(isAdmin ? 'admin_dashboard' : 'home'); setIsSidebarOpen(false); }}>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm">
              {isAdmin ? '🛡️' : user?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className={`text-[10px] uppercase font-bold ${theme.subText} block`}>{isAdmin ? 'Status' : 'Siswa Aktif'}</span>
              <span className={`text-xs font-bold ${theme.titleText} truncate block`}>{isAdmin ? 'Administrator' : user}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <span className={`px-3 text-[10px] font-extrabold uppercase tracking-wider ${theme.subText} block mb-2`}>Menu Utama</span>
            {isAdmin ? (
              <button
                onClick={() => { setScreen('admin_dashboard'); setIsSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 shadow-sm"
              >
                <Activity className="w-4 h-4" /> Panel Pantau Siswa
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setScreen('home'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${screen === 'home' ? 'bg-teal-500 text-slate-950' : `${theme.subText}`}`}
                >
                  <Home className="w-4 h-4" /> Beranda
                </button>
                <button
                  onClick={() => { setIsChatOpen(true); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition mt-1 ${theme.subText}`}
                >
                  <MessageSquare className="w-4 h-4 text-teal-500" /> AI Asisten Chat
                </button>
              </>
            )}
          </div>

          {!isAdmin && (
            <div>
              <span className={`px-3 text-[10px] font-extrabold uppercase tracking-wider ${theme.subText} block mb-2`}>Modul Belajar</span>
              <div className="space-y-1">
                <button
                  onClick={() => { setScreen('numbers'); setActiveCategoryKey(null); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${screen === 'numbers' ? 'bg-teal-500/20 text-teal-500' : `${theme.subText}`}`}
                >
                  <div className="flex items-center gap-2.5"><span className="text-base">#</span><span>Angka 1-100</span></div>
                </button>
                <button
                  onClick={() => { setScreen('jurusan_menu'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition ${screen === 'jurusan_menu' ? 'bg-teal-500/20 text-teal-500' : `${theme.subText}`}`}
                >
                  <div className="flex items-center gap-2.5"><span className="text-base">🎓</span><span>Kosakata Jurusan SMK</span></div>
                </button>
              </div>
            </div>
          )}

          <div>
            <span className={`px-3 text-[10px] font-extrabold uppercase tracking-wider ${theme.subText} block mb-2`}>Tampilan</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${theme.subText}`}
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span>Mode Gelap</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded border border-slate-500/20">{isDarkMode ? 'Aktif' : 'Mati'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-500/10 space-y-3 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" /> Keluar Sesi
          </button>
        </div>
      </aside>

      <div className="flex-1 md:pl-72 flex flex-col min-h-screen">
        <header className={`sticky top-0 z-35 backdrop-blur-md border-b ${theme.headerBg} transition-colors px-4 sm:px-8 py-3.5 mb-8 flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className={`p-2.5 rounded-xl border md:hidden ${theme.btnSecondary}`}>
              <Menu className="w-4 h-4" />
            </button>
            <span className={`text-xs font-bold ${theme.titleText}`}>
              {isAdmin && 'Dashboard Pantau Administrator'}
              {!isAdmin && screen === 'home' && 'Beranda Siswa'}
              {!isAdmin && screen === 'jurusan_menu' && 'Pilih Jurusan SMK'}
              {!isAdmin && screen === 'category_detail' && 'Daftar Kosakata'}
              {!isAdmin && screen === 'numbers' && 'Modul Angka'}
              {!isAdmin && screen === 'quiz' && 'Sesi Ujian / Kuis'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isAdmin && (
              <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 transition">
                <MessageSquare className="w-3.5 h-3.5" /> AI Chat
              </button>
            )}
            {screen !== 'home' && !isAdmin && (
              <button onClick={() => setScreen('home')} className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border ${theme.btnSecondary}`}>
                <ArrowLeft className="w-3.5 h-3.5" /> Beranda
              </button>
            )}
          </div>
        </header>

        <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 flex-1">

          {/* ADMIN DASHBOARD */}
          {isAdmin && (
            <div className="space-y-6">
              <div className={`${theme.cardStatic} p-6 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${theme.titleText} flex items-center gap-2`}>
                    <Shield className="w-6 h-6 text-teal-500" /> Panel Pantau Nilai & Aktivitas Siswa
                  </h2>
                  <p className={`text-xs ${theme.subText} mt-1`}>Semua aktivitas login, latihan, hingga detail benar/salah kuis siswa terekam otomatis di sini.</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('kosakata_logs');
                    localStorage.removeItem('kosakata_reports');
                    setActivityLogs([]);
                    setStudentReports([]);
                  }}
                  className="px-4 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition"
                >
                  Reset Semua Data Log
                </button>
              </div>

              {/* Rekap Nilai Kuis Siswa */}
              <div className={`${theme.cardStatic} border rounded-2xl overflow-hidden`}>
                <div className="p-4 border-b border-slate-500/10 flex justify-between items-center bg-teal-500/5">
                  <h3 className={`font-bold text-xs uppercase tracking-wider text-teal-500 flex items-center gap-2`}>
                    <GraduationCap className="w-4 h-4" /> Hasil Tes & Kuis Siswa (Nilai & Analisis Salah/Benar)
                  </h3>
                  <span className={`text-[10px] ${theme.subText}`}>{studentReports.length} Laporan Kuis</span>
                </div>

                <div className="divide-y divide-slate-500/10 max-h-[400px] overflow-y-auto">
                  {studentReports.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className={`text-xs ${theme.subText}`}>Belum ada siswa yang menyelesaikan kuis/tes.</p>
                    </div>
                  ) : (
                    studentReports.map((report) => (
                      <div key={report.id} className="p-4 space-y-3 hover:bg-slate-500/5 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 bg-teal-500 text-slate-950 rounded-lg text-xs font-black">{report.user}</span>
                            <div>
                              <h4 className={`text-xs font-bold ${theme.titleText}`}>{report.title}</h4>
                              <span className={`text-[10px] ${theme.subText}`}>{report.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs font-bold text-teal-500 block">Skor: {report.score}/{report.total}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">{report.percentage}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="pl-3 border-l-2 border-teal-500/30 space-y-1 pt-1">
                          <span className={`text-[10px] font-bold ${theme.subText} block mb-1`}>Analisis Per Soal:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {report.details.map((item, idx) => (
                              <div key={idx} className={`p-2 rounded-xl text-[11px] border flex items-center justify-between ${item.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                <span className="font-bold capitalize text-slate-700 dark:text-slate-300">Soal: {item.question}</span>
                                <div className="text-right">
                                  <span className={`block font-semibold ${item.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {item.isCorrect ? 'Benar ✅' : `Salah ❌ (Jawab: ${item.chosen})`}
                                  </span>
                                  {!item.isCorrect && <span className="text-[9px] text-slate-400">Kunci: {item.correct}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Log Aktivitas Umum */}
              <div className={`${theme.cardStatic} border rounded-2xl overflow-hidden`}>
                <div className="p-4 border-b border-slate-500/10 flex justify-between items-center">
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${theme.titleText}`}>Log Aktivitas Real-Time (Login, Buka Kategori, dll)</h3>
                  <span className={`text-[10px] ${theme.subText}`}>{activityLogs.length} Aktivitas</span>
                </div>

                <div className="divide-y divide-slate-500/10 max-h-[300px] overflow-y-auto">
                  {activityLogs.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className={`text-xs ${theme.subText}`}>Belum ada aktivitas terekam.</p>
                    </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-500/5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-teal-500/10 text-teal-500 rounded font-bold text-[10px]">{log.user}</span>
                          <span className={theme.titleText}>{log.action}</span>
                        </div>
                        <span className={`text-[10px] ${theme.subText}`}>{log.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: HOME SISWA */}
          {screen === 'home' && !isAdmin && (
            <div className="space-y-8">
              <div className={`${theme.cardStatic} border p-6 sm:p-8 rounded-3xl shadow-sm flex items-center justify-between`}>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider text-teal-500 block mb-1`}>Dashboard Siswa</span>
                  <h2 className={`text-2xl sm:text-3xl font-extrabold ${theme.titleText} capitalize`}>
                    Halo, {user} 👋
                  </h2>
                  <p className={`text-xs sm:text-sm ${theme.subText} mt-2 max-w-md`}>
                    Pilih kategori kosakata atau kerjakan kuis. Seluruh aktivitas belajar dan nilai kuis kamu akan otomatis terpantau oleh Admin!
                  </p>
                </div>
              </div>

              <div>
                <h2 className={`text-xs font-extrabold ${theme.subText} tracking-wider uppercase mb-4`}>Modul Pelajaran Tersedia</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => { setScreen('jurusan_menu'); logActivity(`Membuka menu Kosakata Jurusan SMK`); }}
                    className={`${theme.card} border p-5 rounded-2xl cursor-pointer transition-all text-left flex flex-col justify-between group hover:-translate-y-1 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border-teal-500/30`}
                  >
                    <div>
                      <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">🎓</span>
                      <h4 className={`font-bold ${theme.titleText} text-sm`}>Kosakata Jurusan SMK</h4>
                      <p className={`text-xs ${theme.subText} mt-1`}>DKV, RPL, TP, Kuliner, dll</p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-500">
                      <span>Pilih Jurusan</span> <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div
                    onClick={() => { setScreen('numbers'); logActivity(`Membuka modul Angka 1-100`); }}
                    className={`${theme.card} border p-5 rounded-2xl cursor-pointer transition-all text-left flex flex-col justify-between group hover:-translate-y-1`}
                  >
                    <div>
                      <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform font-black text-teal-500">#</span>
                      <h4 className={`font-bold ${theme.titleText} text-sm`}>Angka 1-100</h4>
                      <p className={`text-xs ${theme.subText} mt-1`}>Latihan angka bahasa Inggris</p>
                    </div>
                  </div>

                  {Object.entries(categories).map(([key, cat]) => (
                    <div
                      key={key}
                      onClick={() => { setActiveCategoryKey(key); setScreen('category_detail'); logActivity(`Membuka kategori ${cat.name}`); }}
                      className={`${theme.card} border p-5 rounded-2xl cursor-pointer transition-all text-left flex flex-col justify-between group hover:-translate-y-1`}
                    >
                      <div>
                        <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{cat.emoji}</span>
                        <h4 className={`font-bold ${theme.titleText} text-sm`}>{cat.name}</h4>
                        <p className={`text-xs ${theme.subText} mt-1`}>{cat.words.length} kosakata</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: JURUSAN MENU */}
          {screen === 'jurusan_menu' && !isAdmin && (
            <div className="space-y-6">
              <div className={`${theme.cardStatic} p-6 border rounded-2xl flex items-center justify-between`}>
                <div>
                  <h2 className={`text-2xl font-bold ${theme.titleText} flex items-center gap-2.5`}>
                    <span>🎓</span> Kosakata Jurusan SMK
                  </h2>
                  <p className={`text-xs ${theme.subText} mt-1`}>Pilih jurusan untuk mulai belajar kosakata kejuruan</p>
                </div>
                <button onClick={() => setScreen('home')} className={`px-4 py-2 rounded-xl text-xs font-bold border ${theme.btnSecondary}`}>
                  Kembali
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jurusanVocab?.categories && Object.entries(jurusanVocab.categories).map(([subKey, subData]) => (
                  <div
                    key={subKey}
                    onClick={() => {
                      setActiveCategoryKey(`jurusan_${subKey}`);
                      setScreen('category_detail');
                      logActivity(`Membuka Jurusan: ${subData.name}`);
                    }}
                    className={`${theme.card} border p-6 rounded-2xl cursor-pointer transition-all flex items-center justify-between group`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl group-hover:scale-110 transition-transform">{subData.emoji}</span>
                      <div>
                        <h4 className={`font-bold ${theme.titleText} text-sm sm:text-base`}>{subData.name}</h4>
                        <p className={`text-xs ${theme.subText} mt-1`}>{subData.words.length} Kosakata</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-teal-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN: CATEGORY DETAIL */}
          {screen === 'category_detail' && activeCategoryKey && !isAdmin && (
            <div className="space-y-6">
              {(() => {
                const activeData = getActiveWordsAndDetails();
                return (
                  <>
                    <div className={`${theme.cardStatic} p-6 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                      <div>
                        <h2 className={`text-2xl font-bold ${theme.titleText} flex items-center gap-2.5`}>
                          <span>{activeData.emoji}</span> {activeData.name}
                        </h2>
                        <p className={`text-xs ${theme.subText} mt-1`}>{activeData.words.length} Kosakata</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (activeCategoryKey.startsWith('jurusan_')) setScreen('jurusan_menu');
                            else setScreen('home');
                          }}
                          className={`px-4 py-3 border rounded-xl text-xs font-bold ${theme.btnSecondary}`}
                        >
                          Kembali
                        </button>
                        <button
                          onClick={() => startCategoryQuiz(activeCategoryKey)}
                          className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
                        >
                          <Play className="w-4 h-4 fill-current" /> Mulai Tes / Kuis
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleAddWord} className={`${theme.cardStatic} p-3.5 border rounded-2xl flex flex-col sm:flex-row gap-2.5`}>
                      <input
                        type="text"
                        placeholder="Inggris (contoh: design)"
                        value={newEnWord}
                        onChange={(e) => setNewEnWord(e.target.value)}
                        className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-none ${theme.inputBg}`}
                      />
                      <input
                        type="text"
                        placeholder="Indonesia (contoh: desain)"
                        value={newIdWord}
                        onChange={(e) => setNewIdWord(e.target.value)}
                        className={`flex-1 px-4 py-2.5 border rounded-xl text-xs font-medium focus:outline-none ${theme.inputBg}`}
                      />
                      <button type="submit" className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
                        <Plus className="w-4 h-4" /> Tambah Kata
                      </button>
                    </form>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {activeData.words.map(([en, id], idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            setSelectedWord({ en, id, emoji: activeData.emoji });
                            speakWord(en);
                            logActivity(`Mempelajari kata: '${en}'`);
                          }}
                          className={`${theme.cardStatic} p-4 border rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-105 transition`}
                        >
                          <div>
                            <span className="text-base font-bold text-teal-500 capitalize">{en}</span>
                            <p className={`text-xs ${theme.subText} mt-0.5 capitalize`}>{id}</p>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-500/10" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleDeleteWord(idx)} className="text-slate-400 hover:text-red-500 p-1" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => speakWord(en)} className="text-slate-400 hover:text-teal-500 p-1" title="Suara">
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* SCREEN: NUMBERS */}
          {screen === 'numbers' && !isAdmin && (
            <div className="space-y-6">
              <div className={`${theme.cardStatic} p-6 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div>
                  <h2 className={`text-2xl font-bold ${theme.titleText}`}>Modul Angka 1-100</h2>
                  <p className={`text-xs ${theme.subText} mt-1`}>Dengarkan pelafalan angka dalam bahasa Inggris</p>
                </div>
                <button onClick={startNumberQuiz} className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm">
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
                      className={`${theme.cardStatic} p-4 border rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-105 transition`}
                    >
                      <span className="text-2xl font-black text-teal-500">{n}</span>
                      <div className="flex justify-between items-end mt-2" onClick={(e) => e.stopPropagation()}>
                        <span className={`text-xs font-semibold ${theme.subText} capitalize`}>{textWord}</span>
                        <button onClick={() => speakWord(textWord)} className="text-slate-400 hover:text-teal-500 p-1">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN: QUIZ */}
          {screen === 'quiz' && !isAdmin && (
            <div className="max-w-2xl mx-auto">
              {quizState.idx >= quizState.questions.length ? (
                <div className={`${theme.cardStatic} border rounded-2xl p-6 sm:p-8 text-center space-y-6`}>
                  <h2 className={`text-2xl font-bold ${theme.titleText}`}>{quizState.title} Selesai! 🎉</h2>
                  
                  <div className="py-2">
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                      {Math.round((quizState.score / quizState.questions.length) * 100)}%
                    </div>
                    <p className={`text-xs sm:text-sm ${theme.subText} mt-2 font-medium`}>
                      Skor Anda: <span className={`${theme.titleText} font-bold`}>{quizState.score}</span> dari {quizState.questions.length} benar
                    </p>
                  </div>

                  <button onClick={() => setScreen('home')} className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs shadow-sm">
                    Kembali ke Beranda
                  </button>
                </div>
              ) : (
                <div className={`${theme.cardStatic} border rounded-2xl p-6 sm:p-8 space-y-6`}>
                  <div className="flex justify-between items-center text-xs font-bold text-teal-500">
                    <span>Soal {quizState.idx + 1} dari {quizState.questions.length}</span>
                    <span>Skor Sementara: {quizState.score}</span>
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
                          btnStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-500';
                        } else if (opt === quizState.selectedProfile || opt === quizState.selectedOption) {
                          btnStyle = 'bg-rose-500 text-white font-bold border-rose-500';
                        } else {
                          btnStyle = `${theme.btnSecondary} opacity-50`;
                        }
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          disabled={quizState.answered}
                          className={`p-4 border rounded-xl text-xs font-bold transition text-center capitalize ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizState.answered && (
                    <div className="pt-4 flex justify-end">
                      <button onClick={nextQuestion} className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm">
                        {quizState.idx + 1 >= quizState.questions.length ? 'Lihat Hasil Selesai' : 'Soal Berikutnya'} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <ChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} isDarkMode={isDarkMode} />
    </div>
  );
}