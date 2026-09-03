import React, { useState, useEffect } from 'react';
import { Volume2, Mic, MicOff, ArrowLeft, Sparkles, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { categories as initialCategories } from './data';

export default function ListeningTalk({ onBack, isDarkMode }) {
  const [mode, setMode] = useState('menu'); // 'menu', 'listening', 'talk'
  const [currentList, setCurrentList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // State untuk mode Listening
  const [userListenInput, setUserListenInput] = useState('');
  const [listenFeedback, setListenFeedback] = useState(null); // 'correct', 'incorrect'

  // State untuk mode Talk (Speech Recognition)
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [talkFeedback, setTalkFeedback] = useState(null);

  // Ambil semua kata dari kategori untuk latihan
  const loadWords = () => {
    let allWords = [];
    Object.values(initialCategories).forEach(cat => {
      if (cat.words) {
        allWords = [...allWords, ...cat.words];
      }
    });
    // Acak 10 kata untuk sesi latihan
    return allWords.sort(() => Math.random() - 0.5).slice(0, 10);
  };

  const startListeningSession = () => {
    setCurrentList(loadWords());
    setCurrentIndex(0);
    setScore(0);
    setUserListenInput('');
    setListenFeedback(null);
    setIsFinished(false);
    setMode('listening');
  };

  const startTalkSession = () => {
    setCurrentList(loadWords());
    setCurrentIndex(0);
    setScore(0);
    setSpokenText('');
    setTalkFeedback(null);
    setIsFinished(false);
    setMode('talk');
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handler Mode Listening
  const handleCheckListening = (e) => {
    e.preventDefault();
    if (!userListenInput.trim()) return;

    const currentWord = currentList[currentIndex][0].toLowerCase();
    const isCorrect = userListenInput.trim().toLowerCase() === currentWord;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setListenFeedback('correct');
    } else {
      setListenFeedback('incorrect');
    }

    setTimeout(() => {
      setListenFeedback(null);
      setUserListenInput('');
      if (currentIndex + 1 < currentList.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  // Handler Mode Talk (Speech Recognition)
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Maaf, browser kamu tidak mendukung fitur pengenalan suara (Speech Recognition). Coba gunakan Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListeningMic(true);
      setSpokenText('Mendengarkan suara kamu...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setSpokenText(transcript);
      
      const targetWord = currentList[currentIndex][0].toLowerCase();
      // Cek kecocokan (bisa menggunakan includes atau exact match)
      if (transcript.includes(targetWord)) {
        setTalkFeedback('correct');
        setScore(prev => prev + 1);
      } else {
        setTalkFeedback('incorrect');
      }
    };

    recognition.onerror = () => {
      setSpokenText('Gagal mendengarkan suara. Coba lagi.');
      setIsListeningMic(false);
    };

    recognition.onend = () => {
      setIsListeningMic(false);
      setTimeout(() => {
        setTalkFeedback(null);
        setSpokenText('');
        if (currentIndex + 1 < currentList.length) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsFinished(true);
        }
      }, 1500);
    };

    recognition.start();
  };

  const theme = {
    card: isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900',
    subText: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    inputBg: isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    btnSecondary: isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header Menu */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (mode === 'menu') onBack();
            else setMode('menu');
          }}
          className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition ${theme.btnSecondary}`}
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">Fitur Listening & Talk</span>
      </div>

      {/* Tampilan Menu Utama Modul */}
      {mode === 'menu' && (
        <div className="space-y-4">
          <div className={`${theme.card} border p-6 rounded-3xl text-center space-y-3 shadow-sm`}>
            <div className="w-12 h-12 bg-teal-500/20 text-teal-500 rounded-2xl mx-auto flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold">Modul Mendengarkan (Listening)</h3>
            <p className={`text-xs ${theme.subText}`}>Dengarkan audio pelafalan kata bahasa Inggris, lalu ketik ejaannya dengan benar.</p>
            <button
              onClick={startListeningSession}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
            >
              Mulai Latihan Listening
            </button>
          </div>

          <div className={`${theme.card} border p-6 rounded-3xl text-center space-y-3 shadow-sm`}>
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl mx-auto flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold">Modul Berbicara (Talk / Speaking)</h3>
            <p className={`text-xs ${theme.subText}`}>Ucapkan kosakata bahasa Inggris melalui mikrofon untuk menguji pelafalanmu.</p>
            <button
              onClick={startTalkSession}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
            >
              Mulai Latihan Talk
            </button>
          </div>
        </div>
      )}

      {/* Sesi Latihan Listening */}
      {mode === 'listening' && !isFinished && currentList.length > 0 && (
        <div className={`${theme.card} border p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm text-center`}>
          <div className="flex justify-between items-center text-xs font-bold text-teal-500">
            <span>Soal {currentIndex + 1} dari {currentList.length}</span>
            <span>Skor: {score}</span>
          </div>

          <div className="py-6 space-y-4">
            <button
              onClick={() => speakText(currentList[currentIndex][0])}
              className="p-6 bg-teal-500 text-slate-950 rounded-full mx-auto flex items-center justify-center shadow-lg hover:scale-105 transition transform"
              title="Putar Audio"
            >
              <Volume2 className="w-10 h-10" />
            </button>
            <p className={`text-xs ${theme.subText}`}>Klik ikon di atas untuk mendengarkan kata, lalu ketik ejaannya di bawah ini!</p>
            <p className="text-xs font-semibold text-teal-400">Petunjuk Arti: "{currentList[currentIndex][1]}"</p>
          </div>

          <form onSubmit={handleCheckListening} className="space-y-4">
            <input
              type="text"
              placeholder="Ketik kata yang kamu dengar..."
              value={userListenInput}
              onChange={(e) => setUserListenInput(e.target.value)}
              disabled={listenFeedback !== null}
              className={`w-full px-4 py-3 border rounded-xl text-xs text-center font-bold uppercase tracking-wider focus:outline-none transition ${theme.inputBg}`}
              autoFocus
            />
            <button
              type="submit"
              disabled={listenFeedback !== null}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
            >
              Periksa Jawaban
            </button>
          </form>

          {listenFeedback === 'correct' && (
            <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-xs bg-emerald-500/10 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4" /> Benar sekali! Hebat!
            </div>
          )}
          {listenFeedback === 'incorrect' && (
            <div className="flex items-center justify-center gap-2 text-rose-500 font-bold text-xs bg-rose-500/10 py-2 rounded-xl">
              <XCircle className="w-4 h-4" /> Kurang tepat. Jawabannya: {currentList[currentIndex][0]}
            </div>
          )}
        </div>
      )}

      {/* Sesi Latihan Talk (Speaking) */}
      {mode === 'talk' && !isFinished && currentList.length > 0 && (
        <div className={`${theme.card} border p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm text-center`}>
          <div className="flex justify-between items-center text-xs font-bold text-emerald-500">
            <span>Soal {currentIndex + 1} dari {currentList.length}</span>
            <span>Skor: {score}</span>
          </div>

          <div className="py-4 space-y-2">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${theme.subText}`}>Ucapkan kata ini:</span>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 uppercase">
              {currentList[currentIndex][0]}
            </h2>
            <p className={`text-xs ${theme.subText}`}>Artinya: <strong>{currentList[currentIndex][1]}</strong></p>
          </div>

          <div className="py-4 flex flex-col items-center justify-center space-y-4">
            <button
              onClick={startSpeechRecognition}
              disabled={isListeningMic || talkFeedback !== null}
              className={`p-6 rounded-full text-slate-950 shadow-lg transition transform hover:scale-105 ${
                isListeningMic ? 'bg-rose-500 animate-pulse text-white' : 'bg-gradient-to-tr from-teal-500 to-emerald-400'
              }`}
            >
              {isListeningMic ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
            <span className={`text-xs font-medium ${theme.subText}`}>
              {isListeningMic ? 'Sedang mendengarkan... (Silakan bicara)' : 'Tekan mikrofon lalu ucapkan kata di atas'}
            </span>
          </div>

          {spokenText && (
            <div className={`p-3 rounded-xl border text-xs font-medium ${theme.inputBg}`}>
              Deteksi Suara: "<span className="font-bold text-teal-500">{spokenText}</span>"
            </div>
          )}

          {talkFeedback === 'correct' && (
            <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold text-xs bg-emerald-500/10 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4" /> Pelafalan Benar!
            </div>
          )}
          {talkFeedback === 'incorrect' && (
            <div className="flex items-center justify-center gap-2 text-rose-500 font-bold text-xs bg-rose-500/10 py-2 rounded-xl">
              <XCircle className="w-4 h-4" /> Belum tepat, coba lebih jelas lagi ya!
            </div>
          )}
        </div>
      )}

      {/* Tampilan Selesai Sesi */}
      {isFinished && (
        <div className={`${theme.card} border rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-sm`}>
          <h2 className="text-2xl font-bold">Latihan Selesai! 🎉</h2>
          <div className="py-2">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
              {Math.round((score / currentList.length) * 100)}%
            </div>
            <p className={`text-xs ${theme.subText} mt-2 font-medium`}>
              Skor benar kamu: <span className="font-bold text-teal-500">{score}</span> dari {currentList.length} soal
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setMode('menu')}
              className={`flex-1 py-3 border rounded-xl text-xs font-bold transition ${theme.btnSecondary}`}
            >
              Pilih Menu Lain
            </button>
            <button
              onClick={() => {
                if (mode === 'listening') startListeningSession();
                else startTalkSession();
              }}
              className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
            >
              Ulangi Latihan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}