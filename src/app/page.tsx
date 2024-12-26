'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import React, { ReactNode } from 'react';
import axios from 'axios';
import { ArrowTrendingUpIcon, CurrencyDollarIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface CoinData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
}

interface HighScore {
  multiplier: number;
  date: string;
  playerName: string;
}

const CoinList = ({ 
  coins, 
  title, 
  flashingCoins,
  onCoinSelect,
  isFutures = false 
}: { 
  coins: CoinData[], 
  title: string, 
  flashingCoins: {[key: string]: string},
  onCoinSelect: (symbol: string) => void,
  isFutures?: boolean 
}) => (
  <div className="flex-1 min-w-0">
    <h2 className="text-2xl font-bold mb-4 text-[#FCD535] flex items-center justify-center gap-2">
      <ArrowTrendingUpIcon className="h-6 w-6" />
      {title}
    </h2>
    <div className="grid grid-cols-2 gap-3">
      {coins.map((coin) => (
        <div
          key={coin.symbol}
          className={`relative rounded-lg p-3 hover:transform hover:scale-105 transition-all cursor-pointer group overflow-hidden`}
          style={{ 
            backgroundColor: flashingCoins[coin.symbol] || '#181818',
            transition: 'all 0.3s ease',
            boxShadow: flashingCoins[coin.symbol] 
              ? `0 0 20px ${flashingCoins[coin.symbol]}` 
              : 'none'
          }}
          onClick={() => onCoinSelect(coin.symbol)}
        >
          {/* Animated border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#02C076] via-[#FCD535] to-[#F6465D] opacity-0 group-hover:opacity-100 transition-all duration-300"
               style={{ animation: 'borderGlow 2s linear infinite' }}></div>
          
          {/* Content container with glass effect */}
          <div className="relative bg-[#181818] rounded-lg p-3 z-10 group-hover:bg-[#181818]/80 transition-all duration-300 backdrop-blur-sm">
            {/* Glowing corners */}
            <div className="absolute top-0 left-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FCD535] to-transparent opacity-20"></div>
            </div>
            <div className="absolute top-0 right-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#02C076] to-transparent opacity-20"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[#F6465D] to-transparent opacity-20"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-[#FCD535] to-transparent opacity-20"></div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <CurrencyDollarIcon className="h-4 w-4 text-[#FCD535] group-hover:animate-spin-slow" />
                <h2 className="text-base font-semibold group-hover:text-[#FCD535] transition-colors">
                  {coin.symbol.replace('USDT', '')}
                </h2>
              </div>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-md transition-all duration-300 ${
                parseFloat(coin.priceChangePercent) >= 0 
                ? 'text-[#02C076] bg-[#02C076]/10 group-hover:bg-[#02C076]/20' 
                : 'text-[#F6465D] bg-[#F6465D]/10 group-hover:bg-[#F6465D]/20'
              }`}>
                {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(coin.priceChangePercent).toFixed(2)}%
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Price:</span>
                <span className="font-mono text-white group-hover:text-[#FCD535] transition-colors">
                  ${parseFloat(coin.lastPrice).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Volume:</span>
                <span className="font-mono text-white group-hover:text-[#FCD535] transition-colors">
                  ${(parseFloat(coin.volume) * parseFloat(coin.lastPrice)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <style jsx>{`
      @keyframes borderGlow {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

const PlaneGame = ({ 
  highScores,
  setHighScores 
}: { 
  highScores: HighScore[];
  setHighScores: (scores: HighScore[]) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [planePosition, setPlanePosition] = useState(0);
  const [crashAnimation, setCrashAnimation] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Load high scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('highScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  // Save score when game ends
  const saveScore = useCallback(() => {
    if (multiplier > 1) {
      const newScore: HighScore = {
        multiplier: parseFloat(multiplier.toFixed(1)),
        date: new Date().toLocaleString(),
        playerName: playerName || 'Anonymous'
      };
      
      // Get existing scores from localStorage
      const existingScoresStr = localStorage.getItem('highScores');
      const existingScores: HighScore[] = existingScoresStr ? JSON.parse(existingScoresStr) : [];
      
      // Add new score to existing scores and sort by multiplier
      const updatedScores = [...existingScores, newScore]
        .sort((a, b) => b.multiplier - a.multiplier); // Tüm skorları kaydet, limit yok
      
      setHighScores(updatedScores);
      localStorage.setItem('highScores', JSON.stringify(updatedScores));
    }
  }, [multiplier, playerName]);

  // Save score when game ends
  useEffect(() => {
    if (gameOver || multiplier >= 100) {
      saveScore();
    }
  }, [gameOver, multiplier, saveScore]);

  // Ses efekti için ref
  const startSoundRef = useRef<HTMLAudioElement | null>(null);

  // Ses dosyasını önceden yükle
  useEffect(() => {
    try {
      const audioFile = '/Misha Xramovi - В Экстазе.mp3';
      const audio = new Audio();
      
      audio.preload = 'auto';
      audio.volume = 0.3;
      audio.playbackRate = 1.4;
      
      audio.oncanplaythrough = () => {
        setAudioLoaded(true);
        startSoundRef.current = audio;
      };
      
      audio.onerror = () => {
        console.error('Audio error occurred');
        setAudioLoaded(false);
      };

      audio.src = audioFile;
    } catch (e) {
      console.error('Audio setup error:', e);
      setAudioLoaded(false);
    }

    return () => {
      if (startSoundRef.current) {
        try {
          startSoundRef.current.pause();
          startSoundRef.current = null;
        } catch (e) {
          console.error('Audio cleanup error:', e);
        }
      }
    };
  }, []);

  const calculateCrashProbability = (currentMultiplier: number): boolean => {
    const random = Math.random() * 100; // 0-100 arası

    // 3x-30x arası: %90 düşme şansı
    if (currentMultiplier <= 30) {
      return random < 0.9; // Her 100ms'de %0.9 crash şansı
    }
    
    // 30x ve yukarısı: 200'de 1 ihtimal
    if (currentMultiplier <= 50) {
      return random < 0.5; // Her 100ms'de %0.5 crash şansı (200'de 1)
    }
    
    // 50x-90x arası: %93 düşme şansı
    if (currentMultiplier <= 90) {
      return random < 0.93; // Her 100ms'de %0.93 crash şansı
    }
    
    // 90x-97x arası: 400'de 1 ihtimal
    if (currentMultiplier <= 97) {
      return random < 0.25; // Her 100ms'de %0.25 crash şansı (400'de 1)
    }
    
    // 98x-99x arası: binde bir ihtimal
    if (currentMultiplier <= 99) {
      return random < 0.1; // Her 100ms'de %0.1 crash şansı (binde bir)
    }
    
    // 100x: on binde bir ihtimal
    return random < 0.09; // Her 100ms'de %0.09 crash şansı (on birde bir)
  };

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setMultiplier(1);
    setGameOver(false);
    setPlanePosition(0);
    setCrashAnimation(false);
  }, []);

  const handleClick = () => {
    if (!isPlaying && !gameOver) {
      if (!playerName && !showNameInput) {
        setShowNameInput(true);
        return;
      }
      
      if (showNameInput) {
        return;
      }

      // Oyun başlarken müzik çal
      if (startSoundRef.current) {
        startSoundRef.current.currentTime = 0;
        startSoundRef.current.play().catch(() => {});
      } else {
        // Eğer ref yoksa yeni audio oluştur
        const audio = new Audio('/Misha Xramovi - В Экстазе.mp3');
        audio.volume = 0.3;
        audio.playbackRate = 1.4;
        audio.play().catch(() => {});
        startSoundRef.current = audio;
      }
      setIsPlaying(true);
    } else if (gameOver || multiplier >= 100) {
      // Oyun resetlenirken müziği durdur
      if (startSoundRef.current) {
        startSoundRef.current.pause();
        startSoundRef.current.currentTime = 0;
      }
      resetGame();
    }
  };

  const handleStartGame = () => {
    if (playerName.trim()) {
      // İsim girildikten sonra müzik çal
      if (startSoundRef.current) {
        startSoundRef.current.currentTime = 0;
        startSoundRef.current.play().catch(() => {});
      } else {
        // Eğer ref yoksa yeni audio oluştur
        const audio = new Audio('/Misha Xramovi - В Экстазе.mp3');
        audio.volume = 0.3;
        audio.playbackRate = 1.4;
        audio.play().catch(() => {});
        startSoundRef.current = audio;
      }
      setShowNameInput(false);
      setIsPlaying(true);
    }
  };

  // Oyun durduğunda müziği durdur
  useEffect(() => {
    if (!isPlaying && startSoundRef.current) {
      try {
        startSoundRef.current.pause();
        startSoundRef.current.currentTime = 0;
      } catch (error) {
        // Ses durdurma hatalarını sessizce yoksay
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (startSoundRef.current) {
        startSoundRef.current.pause();
        startSoundRef.current.currentTime = 0;
      }
      return;
    }

    const gameInterval = setInterval(() => {
      setMultiplier(prev => {
        const increment = 0.1;
        const newValue = Math.round((prev + increment) * 10) / 10;

        if (newValue >= 100) {
          setIsPlaying(false);
          return 100;
        }

        if (calculateCrashProbability(newValue)) {
          setCrashAnimation(true);
          setTimeout(() => {
            setGameOver(true);
            setIsPlaying(false);
          }, 1000);
          return newValue;
        }

        return newValue;
      });

      setPlanePosition(prev => prev + 1);
    }, 100);

    return () => clearInterval(gameInterval);
  }, [isPlaying]);

  // Crash olduğunda müziği durdur
  useEffect(() => {
    if (gameOver && startSoundRef.current) {
      try {
        startSoundRef.current.pause();
        startSoundRef.current.currentTime = 0;
      } catch (error) {
        // Ses durdurma hatalarını sessizce yoksay
      }
    }
  }, [gameOver]);

  return (
    <div className="relative">
      <div className="relative h-40 w-3/4 mx-auto bg-[#181818] rounded-2xl overflow-hidden cursor-pointer mb-8 group"
           style={{
             boxShadow: '0 0 30px rgba(252, 213, 53, 0.15)',
             background: 'linear-gradient(145deg, rgba(24,24,24,1) 0%, rgba(18,18,18,1) 100%)',
             border: '1px solid rgba(252, 213, 53, 0.1)'
           }}
           onClick={handleClick}>
        {/* Animated gradient border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#02C076] via-[#FCD535] to-[#F6465D] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
             style={{ animation: 'borderAnimation 3s linear infinite' }}></div>
        
        {/* Main content container */}
        <div className="absolute inset-[1px] bg-[#181818] rounded-2xl overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(252, 213, 53, 0.03) 0%, transparent 50%)',
                 animation: 'pulse 4s ease-in-out infinite'
               }}></div>
          
          {/* Glowing corners */}
          <div className="absolute top-0 left-0 w-8 h-8">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FCD535] to-transparent opacity-20 rounded-tl-2xl"></div>
          </div>
          <div className="absolute top-0 right-0 w-8 h-8">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#02C076] to-transparent opacity-20 rounded-tr-2xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-8 h-8">
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[#F6465D] to-transparent opacity-20 rounded-bl-2xl"></div>
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8">
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-[#FCD535] to-transparent opacity-20 rounded-br-2xl"></div>
          </div>

          {/* Meme Token Background Pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="absolute text-lg opacity-5"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `float ${5 + Math.random() * 5}s infinite ease-in-out`
                }}
              >
                {['🐕 DOGE', '🐕 SHIB', '🐸 PEPE', '🦊 BONK', '🐱 MEME'][index % 5]}
              </div>
            ))}
          </div>

          <style jsx>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0) rotate(0deg);
              }
              50% {
                transform: translateY(-20px) rotate(10deg);
              }
            }
            @keyframes fadeOut {
              0% {
                opacity: 0.8;
                transform: translateX(0) scale(0.8);
              }
              100% {
                opacity: 0;
                transform: translateX(-20px) scale(0.2);
              }
            }
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.5;
                transform: scale(1.2);
              }
            }
            @keyframes borderAnimation {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>

          {/* Game content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {showNameInput ? (
              <div className="bg-[#181818]/90 backdrop-blur-sm p-6 rounded-xl border border-[#FCD535]/20 z-10" 
                   style={{boxShadow: '0 0 20px rgba(252, 213, 53, 0.1)'}}
                   onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-[#2B2B2B] text-white px-4 py-2 rounded-lg mb-4 w-full focus:outline-none focus:ring-2 focus:ring-[#FCD535] placeholder-gray-500"
                  maxLength={20}
                />
                <button
                  onClick={handleStartGame}
                  className="bg-[#FCD535] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#FCD535]/80 transition-all duration-300 w-full transform hover:scale-105"
                >
                  Start Game
                </button>
              </div>
            ) : (
              <>
                {!isPlaying && !gameOver && multiplier === 1 && (
                  <span className="text-[#FCD535] text-2xl font-bold animate-pulse">
                    PLAY
                  </span>
                )}
                {gameOver && (
                  <span className="text-[#F6465D] text-xl font-bold animate-bounce">
                    You can do it! Try again
                  </span>
                )}
                {multiplier >= 100 && (
                  <span className="text-[#02C076] text-2xl font-bold animate-pulse">
                    🐋 You are a Whale 🐋
                  </span>
                )}
              </>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#02C076] via-[#FCD535] to-[#F6465D]"
               style={{ 
                 width: `${(multiplier / 100) * 100}%`,
                 boxShadow: '0 0 10px rgba(252, 213, 53, 0.3)'
               }}>
          </div>

          {/* Airplane and smoke effect */}
          <div className="absolute transition-all duration-300 transform"
               style={{ 
                 left: `${(multiplier / 100) * 80 + 10}%`,
                 bottom: '50%',
                 transform: crashAnimation ? 'rotate(180deg) scale(0.8)' : gameOver ? 'rotate(180deg) translateY(100px)' : 'rotate(0deg)',
                 transition: crashAnimation ? 'transform 0.5s ease-in' : gameOver ? 'transform 1s ease-in' : 'all 0.3s ease-out',
                 opacity: gameOver ? 0 : 1
               }}>
            {/* Smoke particles */}
            {isPlaying && !gameOver && !crashAnimation && Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="absolute left-0 top-1/2"
                style={{
                  width: '8px',
                  height: '8px',
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                  borderRadius: '50%',
                  transform: `translateX(${-10 - index * 10}px)`,
                  opacity: 1 - (index * 0.2),
                  animation: 'fadeOut 1s infinite'
                }}
              />
            ))}
            <span className="text-4xl transform rotate-90 filter drop-shadow-[0_0_8px_rgba(252,213,53,0.5)]" role="img" aria-label="airplane">
              ✈️
            </span>
          </div>

          {/* Multiplier display */}
          <div className="absolute top-2 left-2 text-xl font-bold"
               style={{
                 background: 'linear-gradient(to right, #02C076, #FCD535)',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 filter: 'drop-shadow(0 0 8px rgba(252,213,53,0.3))'
               }}>
            {multiplier.toFixed(1)}x
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChartModalProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChartModal = ({ symbol, isOpen, onClose }: ChartModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] rounded-xl w-full max-w-5xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="h-[600px] w-full">
          <iframe
            key={symbol}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_cf8c3&symbol=BINANCE:${symbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=181818&studies=%5B%5D&theme=dark&style=1&timezone=exchange`}
            className="w-full h-full rounded-xl"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [spotGainers, setSpotGainers] = useState<CoinData[]>([]);
  const [futuresGainers, setFuturesGainers] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [flashingCoins, setFlashingCoins] = useState<{[key: string]: string}>({});
  const [prevSpotData, setPrevSpotData] = useState<{[key: string]: string}>({});
  const [prevFuturesData, setPrevFuturesData] = useState<{[key: string]: string}>({});
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Load high scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('highScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  // Veri çekme için useEffect
  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch spot data
        const spotResponse = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const spotData = spotResponse.data
          .filter((coin: CoinData) => coin.symbol.endsWith('USDT'))
          .sort((a: CoinData, b: CoinData) => 
            parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
          )
          .slice(0, 30);
        
        // Fetch futures data
        const futuresResponse = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr');
        const futuresData = futuresResponse.data
          .sort((a: CoinData, b: CoinData) => 
            parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent)
          )
          .slice(0, 30);

        // Check for price changes in each coin
        const newFlashingCoins: {[key: string]: string} = {};

        [...spotData, ...futuresData].forEach((coin: CoinData) => {
          const prevPrice = prevSpotData[coin.symbol] || prevFuturesData[coin.symbol];
          if (prevPrice && coin.lastPrice) {
            const change = (parseFloat(coin.lastPrice) - parseFloat(prevPrice)) / parseFloat(prevPrice) * 100;
            if (Math.abs(change) > 0.1) {
              newFlashingCoins[coin.symbol] = change > 0 ? '#02C07630' : '#F6465D30';
            }
          }
        });

        setFlashingCoins(newFlashingCoins);
        setTimeout(() => setFlashingCoins({}), 1000);

        // Update previous data
        const newSpotData: {[key: string]: string} = {};
        const newFuturesData: {[key: string]: string} = {};
        spotData.forEach((coin: CoinData) => {
          newSpotData[coin.symbol] = coin.lastPrice;
        });
        futuresData.forEach((coin: CoinData) => {
          newFuturesData[coin.symbol] = coin.lastPrice;
        });
        setPrevSpotData(newSpotData);
        setPrevFuturesData(newFuturesData);

        setSpotGainers(spotData);
        setFuturesGainers(futuresData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    if (!initialLoading) {
      fetchData();
      const interval = setInterval(fetchData, 4000);

      return () => {
        clearInterval(interval);
        abortController.abort();
      };
    }
  }, [initialLoading, prevSpotData, prevFuturesData]);

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-[#0C0C0C] flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-[#F6465D] text-4xl font-bold mb-2 animate-pulse">
            1 error
          </div>
          <div className="text-white text-2xl font-bold bg-gradient-to-r from-[#02C076] via-[#FCD535] to-[#F6465D] text-transparent bg-clip-text animate-pulse">
            NOThing
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0C0C0C] text-white relative">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <span className="text-6xl font-bold bg-gradient-to-r from-[#02C076] via-[#FCD535] to-[#F6465D] text-transparent bg-clip-text mb-8 cursor-pointer">
            AI CRYPTO FUN TOOL
          </span>
          <div className="relative flex flex-col items-center w-full gap-8">
            <div className="flex justify-between items-center w-full">
              <span className="text-5xl font-bold text-[#02C076] transition-all duration-300 hover:text-[#02C076] hover:drop-shadow-[0_0_30px_rgba(2,192,118,0.7)] cursor-pointer">
                When 100x
              </span>
              <span className="text-5xl font-bold text-[#F6465D] transition-all duration-300 hover:text-[#F6465D] hover:drop-shadow-[0_0_30px_rgba(246,70,93,0.7)] cursor-pointer">
                Wen Lambo
              </span>
            </div>
            
            {/* High Scores Table */}
            <div className="relative bg-[#181818] rounded-lg p-3 w-96 group hover:transform hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#02C076] via-[#FCD535] to-[#F6465D] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                   style={{ animation: 'borderGlow 2s linear infinite' }}></div>
              
              {/* Content container with glass effect */}
              <div className="relative bg-[#181818] rounded-lg p-3 z-10 group-hover:bg-[#181818]/90 transition-all duration-300 backdrop-blur-sm">
                {/* Glowing corners */}
                <div className="absolute top-0 left-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FCD535] to-transparent opacity-20"></div>
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#02C076] to-transparent opacity-20"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-[#F6465D] to-transparent opacity-20"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-[#FCD535] to-transparent opacity-20"></div>
                </div>

                <h3 className="text-sm font-bold text-[#FCD535] mb-2 flex items-center gap-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#02C076] group-hover:via-[#FCD535] group-hover:to-[#F6465D] transition-all duration-300">
                  <span className="group-hover:animate-bounce">🏆</span> High Scores
                </h3>
                <div className="overflow-auto max-h-60">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-[#181818] group-hover:bg-[#181818]/90">
                      <tr className="text-gray-400 border-b border-[#2B2B2B] group-hover:border-[#FCD535]/20">
                        <th className="pb-1 text-left group-hover:text-[#FCD535] transition-colors">#</th>
                        <th className="pb-1 text-left group-hover:text-[#FCD535] transition-colors">Player</th>
                        <th className="pb-1 text-right group-hover:text-[#FCD535] transition-colors">Score</th>
                        <th className="pb-1 text-right group-hover:text-[#FCD535] transition-colors">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highScores.map((score, index) => (
                        <tr key={index} className="border-b border-[#2B2B2B] last:border-0 group-hover:border-[#FCD535]/10">
                          <td className="py-1 text-[#FCD535]">{index + 1}</td>
                          <td className="py-1 text-white group-hover:text-[#FCD535] transition-colors">{score.playerName}</td>
                          <td className="py-1 text-[#02C076] text-right group-hover:text-[#02C076] transition-colors">{score.multiplier}x</td>
                          <td className="py-1 text-gray-400 text-right text-xs group-hover:text-gray-300 transition-colors">{score.date}</td>
                        </tr>
                      ))}
                      {highScores.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-2 text-center text-gray-400 group-hover:text-[#FCD535] transition-colors">
                            No scores yet 🚀
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PlaneGame 
          highScores={highScores} 
          setHighScores={setHighScores}
        />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6 text-[#FCD535]">
            Top 30 Gainers on Binance
          </h1>
          <p className="text-lg text-gray-300">
            24-hour price changes for top performing cryptocurrencies
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FCD535] border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CoinList
              coins={spotGainers}
              title="Spot Market"
              flashingCoins={flashingCoins}
              onCoinSelect={(symbol) => setSelectedCoin(symbol)}
            />
            
            <CoinList
              coins={futuresGainers}
              title="Futures Market"
              flashingCoins={flashingCoins}
              onCoinSelect={(symbol) => setSelectedCoin(symbol)}
              isFutures={true}
            />
          </div>
        )}

        <ChartModal
          symbol={selectedCoin || ''}
          isOpen={!!selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      </div>
    </main>
  );
}
