
import React, { useState, useEffect, useRef } from 'react';
import { AppDefinition, SystemState, SettingsState, TweaksState } from '../types';
import { AppIcon } from './Icon';
import { generateResponse, generateImage, editImage } from '../services/geminiService';
import { playClick, playType, playError } from '../services/soundService';

// --- Helper Hook for Virtual Keyboard ---
const useVirtualKeyboard = (onEnter?: () => void) => {
  const [input, setInput] = useState('');
  
  useEffect(() => {
    const handleVirtualKey = (e: CustomEvent<string>) => {
      const key = e.detail;
      if (key === 'DEL') {
        setInput(prev => prev.slice(0, -1));
      } else if (key === 'ENTER') {
        if (onEnter) onEnter();
      } else if (key === 'SPACE') {
        setInput(prev => prev + ' ');
      } else if (key.length === 1) { // Normal chars
        setInput(prev => prev + key);
      }
    };

    window.addEventListener('virtual-keypress' as any, handleVirtualKey as any);
    return () => {
      window.removeEventListener('virtual-keypress' as any, handleVirtualKey as any);
    };
  }, [onEnter]);

  return { input, setInput };
};

// --- Shared Layout for 2.3 Apps ---
const AppLayout: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  bgClass?: string;
  icsTheme?: boolean;
}> = ({ title, icon, children, actions, bgClass = "bg-black", icsTheme = false }) => (
  <div className={`flex flex-col h-full ${bgClass} text-white font-sans overflow-hidden`}>
    {icsTheme ? (
        // ICS Holo Dark Header
        <div className="bg-[#111] p-2 flex items-center justify-between border-b-2 border-[#33B5E5] shadow-md z-10 h-14 shrink-0">
             <div className="flex items-center gap-3 pl-2">
                <AppIcon name={icon} size={24} ics={true} />
                <span className="font-bold text-lg text-[#33B5E5] uppercase">{title}</span>
             </div>
             <div className="flex gap-2 pr-1">{actions}</div>
        </div>
    ) : (
        // Gingerbread Header
        <div className="bg-gradient-to-b from-[#666] via-[#444] to-[#333] p-1 flex items-center justify-between border-b-2 border-black/50 shadow-md z-10 h-14 shrink-0 relative">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10"></div>
          <div className="flex items-center gap-2 pl-2">
             <div className="p-0.5"><AppIcon name={icon} size={22} /></div>
             <span className="font-bold text-lg tracking-wide text-white drop-shadow-md font-sans-condensed">{title}</span>
          </div>
          <div className="flex gap-2 pr-1">{actions}</div>
        </div>
    )}
    <div className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {children}
    </div>
  </div>
);

// --- MARKET APP ---
interface MarketProps {
  apps: AppDefinition[];
  installApp: (id: string) => void;
  openApp: (id: string) => void;
  icsTheme?: boolean;
}

export const MarketApp: React.FC<MarketProps> = ({ apps, installApp, openApp, icsTheme }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleAction = (app: AppDefinition) => {
    playClick();
    if (app.installed) {
      openApp(app.id);
    } else {
      setDownloading(app.id);
      setTimeout(() => {
        installApp(app.id);
        setDownloading(null);
      }, 2000);
    }
  };

  return (
    <AppLayout title="Market" icon="market" bgClass="bg-[#111]" icsTheme={icsTheme}>
      <div className={`${icsTheme ? 'bg-[#333] text-[#33B5E5] border-[#33B5E5]' : 'bg-gradient-to-b from-[#A4C639] to-[#88a530] text-black border-[#556b1f]'} px-3 py-1 text-xs font-bold border-b shadow-sm flex justify-between items-center relative z-10`}>
        <span>Featured Apps</span>
        <span className="text-[10px] opacity-80 font-mono">v2.3.6</span>
      </div>
      <div className="p-2 space-y-2">
        {apps.filter(a => !a.system).map(app => (
          <div key={app.id} className="flex items-center p-2 bg-gradient-to-b from-[#333] to-[#222] border border-[#444] rounded hover:bg-[#333] transition-colors shadow-sm group">
            <div className="mr-3 transform scale-90 group-hover:scale-100 transition-transform">
               <AppIcon name={app.icon} size={36} ics={icsTheme} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">{app.name}</div>
              <div className="text-[10px] text-gray-400">{app.version} • {app.size}</div>
              <div className="flex items-center gap-1 mt-1">
                 {[1,2,3,4,5].map(s => <div key={s} className={`w-2 h-2 ${icsTheme ? 'bg-[#33B5E5]' : 'bg-orange-500'} rounded-sm text-[6px] border border-black/20`} />)}
              </div>
            </div>
            <button 
              onClick={() => handleAction(app)}
              disabled={downloading === app.id}
              className={`px-3 py-1 text-xs font-bold rounded border shadow-sm ${
                app.installed 
                  ? 'bg-gradient-to-b from-gray-600 to-gray-700 text-gray-300 border-gray-600' 
                  : (icsTheme 
                      ? 'bg-gradient-to-b from-[#33B5E5] to-[#0099CC] text-white border-[#0099CC]' 
                      : 'bg-gradient-to-b from-[#A4C639] to-[#6d8a14] text-white border-green-800 active:from-green-500 active:to-green-700')
              }`}
            >
              {downloading === app.id ? '...' : (app.installed ? 'OPEN' : 'FREE')}
            </button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

// --- GEMINI APP ---
export const GeminiApp: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    {role: 'model', text: 'Hello. I am Gemini 3.0 Pro. How can I assist you on this legacy device?'}
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const send = async () => {
    if (!input.trim()) return;
    const prompt = input;
    setInput('');
    playClick(); // Sound
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setLoading(true);

    const response = await generateResponse(prompt);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  const { input, setInput } = useVirtualKeyboard(send);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <AppLayout title="Gemini AI" icon="gemini" bgClass="bg-[#121212]">
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#121212]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 shadow-md text-sm border-t border-white/10 ${
                m.role === 'user' 
                  ? 'bg-gradient-to-b from-[#33B5E5] to-[#0099CC] text-white border-l border-r border-b border-[#0099CC] rounded-l-lg rounded-tr-lg' 
                  : 'bg-gradient-to-b from-[#444] to-[#333] border-l border-r border-b border-[#555] text-gray-200 rounded-r-lg rounded-tl-lg'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-[#33B5E5] animate-pulse ml-2">Processing...</div>}
          <div ref={bottomRef} />
        </div>
        
        {/* Input Area */}
        <div className="p-2 bg-[#222] border-t border-[#333] flex gap-2">
          <div className="flex-1 bg-[#111] border border-[#444] rounded px-2 py-1 text-white text-sm h-8 flex items-center overflow-hidden shadow-inner">
             {input || <span className="text-gray-500 italic">Type message...</span>}
             <span className="w-0.5 h-4 bg-[#A4C639] ml-0.5 animate-pulse"></span>
          </div>
          <button onClick={send} className="bg-gradient-to-b from-[#33B5E5] to-[#0099CC] px-3 py-1 rounded text-white font-bold text-xs hover:brightness-110 border border-blue-800 shadow-sm">
            SEND
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

// --- GALLERY APP ---
export const GalleryApp: React.FC<{
  images: string[];
  addImage: (img: string) => void;
  setWallpaper: (img: string) => void;
}> = ({ images, addImage, setWallpaper }) => {
  const [view, setView] = useState<'grid' | 'create' | 'view'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // For Create Mode input
  const handleGenerate = async () => {
    if (!input) return;
    playClick();
    setLoading(true);
    const result = await generateImage(input);
    setLoading(false);
    if (result) {
      addImage(result);
      setSelectedImage(result);
      setView('view');
      setInput('');
    }
  };
  
  const { input, setInput } = useVirtualKeyboard(handleGenerate);

  const renderContent = () => {
    if (view === 'grid') {
      return (
        <div className="p-2 grid grid-cols-3 gap-1">
          <button 
            onClick={() => setView('create')}
            className="aspect-square bg-gradient-to-br from-[#333] to-[#111] border border-[#333] flex flex-col items-center justify-center active:bg-[#A4C639] group shadow-inner"
          >
            <AppIcon name="plus" size={24} className="text-gray-400 group-active:text-black" />
            <span className="text-[10px] text-gray-400 group-active:text-black mt-1">CREATE</span>
          </button>
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => { playClick(); setSelectedImage(img); setView('view'); }}
              className="aspect-square bg-black border border-[#333] overflow-hidden shadow-sm hover:border-[#A4C639]"
            >
              <img src={img} alt={`img-${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      );
    }
    if (view === 'create') {
      return (
        <div className="p-4 flex flex-col gap-4">
          <div className="text-[#A4C639] text-xs uppercase font-bold tracking-widest border-b border-[#333] pb-1">AI Studio</div>
          
          <div className="w-full h-32 bg-[#222] border border-[#444] p-2 text-white text-sm focus:border-[#A4C639] rounded-none shadow-inner font-mono">
             {input} <span className="animate-pulse">_</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setInput("Android 2.3 wallpaper, green abstract tech")} className="bg-[#333] text-[10px] p-2 text-gray-300 border border-[#444] hover:bg-[#444]">Preset: Wall</button>
            <button onClick={() => setInput("Android 2.3 glossy icon set")} className="bg-[#333] text-[10px] p-2 text-gray-300 border border-[#444] hover:bg-[#444]">Preset: Icons</button>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`py-3 font-bold text-sm uppercase tracking-wide border border-black ${loading ? 'bg-gray-700 text-gray-500' : 'bg-gradient-to-b from-[#A4C639] to-[#6d8a14] text-white shadow-[0_2px_4px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-0.5'}`}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <button onClick={() => setView('grid')} className="text-xs text-center text-gray-500 underline">Cancel</button>
        </div>
      );
    }
    if (view === 'view' && selectedImage) {
      return (
        <div className="flex flex-col h-full">
           <img src={selectedImage} className="flex-1 object-contain bg-black" />
           <div className="bg-[#222] p-2 flex gap-2 border-t border-[#333]">
             <button onClick={() => { playClick(); setWallpaper(selectedImage); }} className="flex-1 bg-gradient-to-b from-gray-600 to-gray-700 py-2 text-xs font-bold text-white rounded border border-gray-500 shadow-sm active:bg-gray-800">Set Wallpaper</button>
             <button onClick={() => { playClick(); setView('grid'); }} className="bg-[#333] px-4 py-2 text-xs font-bold text-gray-300 rounded border border-gray-500 shadow-sm">Back</button>
           </div>
        </div>
      );
    }
    return null;
  };

  return <AppLayout title="Gallery" icon="gallery">{renderContent()}</AppLayout>;
};

// --- SETTINGS APP ---
export const SettingsApp: React.FC<{ 
  settings: SettingsState, 
  setSettings: (s: SettingsState) => void, 
  close: () => void,
  icsTheme?: boolean
}> = ({ settings, setSettings, close, icsTheme }) => {

  const SectionHeader = ({ title }: { title: string }) => (
    <div className={`${icsTheme ? 'bg-[#333] text-[#33B5E5]' : 'bg-gradient-to-r from-[#333] to-[#222] text-gray-300'} px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-inner border-b border-[#000] border-t border-[#444] mt-2`}>
      {title}
    </div>
  );

  const SettingItem = ({ title, sub, onClick, toggle }: { title: string, sub?: string, onClick?: () => void, toggle?: boolean }) => (
    <div onClick={onClick} className="p-3 border-b border-[#222] flex items-center justify-between active:bg-[#A4C639] active:text-black group transition-colors cursor-pointer">
       <div className="flex flex-col">
          <span className="text-sm font-bold">{title}</span>
          {sub && <span className="text-[10px] text-gray-500 group-active:text-black">{sub}</span>}
       </div>
       {toggle !== undefined && (
          <div className={`w-4 h-4 border ${toggle ? (icsTheme ? 'bg-[#33B5E5] border-blue-300' : 'bg-green-500 border-green-300') : 'bg-black border-gray-500'}`}></div>
       )}
    </div>
  );

  return (
    <AppLayout title="Settings" icon="settings" icsTheme={icsTheme}>
      <div className="flex flex-col bg-[#111]">
        
        <SectionHeader title="Wireless & Networks" />
        <SettingItem title="Wi-Fi" sub="Turn on Wi-Fi" toggle={settings.wifi} onClick={() => { playClick(); setSettings({...settings, wifi: !settings.wifi}); }} />
        <SettingItem title="Bluetooth" sub="Turn on Bluetooth" toggle={false} onClick={playClick} />
        <SettingItem title="Tethering & portable hotspot" sub="Share your phone's mobile data connection" onClick={playClick} />

        <SectionHeader title="Sound" />
        <div className="p-3 border-b border-[#222] flex flex-col gap-1">
          <span className="text-sm font-bold">Sound Profile</span>
          <select 
            value={settings.soundProfile}
            onChange={(e) => { playClick(); setSettings({...settings, soundProfile: e.target.value as any}); }}
            className="bg-[#333] border border-[#555] text-white text-xs p-2 rounded shadow-sm outline-none focus:border-[#A4C639]"
          >
            <option>Normal</option>
            <option>Vibrate</option>
            <option>Silent</option>
          </select>
        </div>
        <SettingItem title="Volume" sub="Set volume for incoming calls and media" onClick={playClick} />

        <SectionHeader title="Display" />
        <div className="p-3 border-b border-[#222]">
           <span className="text-sm block mb-1 font-bold">Brightness</span>
           <input 
            type="range" min="0" max="100" 
            value={settings.brightness} 
            onChange={(e) => setSettings({...settings, brightness: parseInt(e.target.value)})}
            className={`w-full ${icsTheme ? 'accent-[#33B5E5]' : 'accent-[#A4C639]'}`}
          />
        </div>
        <SettingItem title="Auto-rotate screen" sub="Switch orientation automatically" toggle={true} onClick={playClick} />
        <SettingItem title="Animation" sub="All window animations are shown" onClick={playClick} />

        <SectionHeader title="Personal" />
        <SettingItem title="Location & security" sub="My Location, Screen unlock" onClick={playClick} />
        <SettingItem title="Applications" sub="Manage applications, Development" onClick={playClick} />
        <SettingItem title="Accounts & sync" sub="Manage accounts and synchronization" onClick={playClick} />
        <SettingItem title="Privacy" sub="Factory data reset" onClick={playClick} />
        <SettingItem title="Storage" sub="Available space, unmount SD card" onClick={playClick} />
        <SettingItem title="Language & keyboard" sub="Select language, user dictionary" onClick={playClick} />
        <SettingItem title="Voice input & output" sub="Voice recognizer settings" onClick={playClick} />
        <SettingItem title="Accessibility" sub="Accessibility options" onClick={playClick} />

        <SectionHeader title="System" />
        <SettingItem title="Date & time" sub="Set date, time, time zone" onClick={playClick} />
        <SettingItem title="About phone" sub="Status, Battery, Legal info, Model" onClick={playClick} />
        
        <div className="p-4 text-center text-xs text-gray-500 mt-4 font-mono">
          Nexus One Emulator<br/>Android 2.3.7<br/>Kernel 2.6.35.7-ge382d80
        </div>
      </div>
    </AppLayout>
  );
};

// --- RECORDER APP ---
export const RecorderApp: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (recording) {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <AppLayout title="Sound Recorder" icon="recorder" bgClass="bg-[#222]">
      <div className="flex flex-col items-center justify-center h-full p-4">
         <div className="w-full h-32 bg-[#111] border-2 border-[#333] rounded-lg mb-8 flex items-center justify-center relative overflow-hidden shadow-inner">
             {/* Simple Visualization */}
             {recording ? (
               <div className="flex items-end gap-1 h-full py-4 opacity-70">
                 {[...Array(20)].map((_, i) => (
                   <div key={i} className="w-2 bg-[#A4C639] animate-pulse transition-all duration-100" style={{ height: `${Math.random() * 80}%` }}></div>
                 ))}
               </div>
             ) : (
               <span className="text-gray-600 font-mono">Ready to Record</span>
             )}
         </div>

         <div className="text-5xl font-mono text-white mb-8 drop-shadow-md">
           {formatTime(duration)}
         </div>

         <button 
           onClick={() => { playClick(); setRecording(!recording); }}
           className={`w-24 h-24 rounded-full border-4 border-[#333] flex items-center justify-center shadow-lg active:scale-95 transition-all ${recording ? 'bg-gray-800' : 'bg-[#cc0000]'}`}
         >
            {recording ? (
               <div className="w-8 h-8 bg-white rounded-sm"></div>
            ) : (
               <div className="w-8 h-8 bg-white rounded-full"></div>
            )}
         </button>
         <span className="mt-4 text-gray-400 text-sm uppercase font-bold tracking-widest">{recording ? 'Recording...' : 'Record'}</span>
      </div>
    </AppLayout>
  );
};


// --- GEOMETRY DASH APP (Mini-Game) ---
export const GeometryDashApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let playerY = 150;
    let playerVelocity = 0;
    let obstacles: { x: number, width: number, height: number }[] = [];
    let frame = 0;
    let currentScore = 0;
    
    const GRAVITY = 0.6;
    const JUMP_STRENGTH = -8;
    const SPEED = 4;

    const reset = () => {
      playerY = 150;
      playerVelocity = 0;
      obstacles = [];
      frame = 0;
      currentScore = 0;
      setScore(0);
    };

    const jump = () => {
      if (playerY >= 140) { // On ground
         playerVelocity = JUMP_STRENGTH;
         playClick();
      }
    };

    // Global click listener for jump
    const handleClick = () => {
      if (gameState === 'PLAYING') jump();
      else if (gameState === 'START') { setGameState('PLAYING'); reset(); }
      else if (gameState === 'GAME_OVER') { setGameState('PLAYING'); reset(); }
    };

    canvas.addEventListener('mousedown', handleClick);
    canvas.addEventListener('touchstart', handleClick);

    const loop = () => {
      if (gameState !== 'PLAYING') return;

      // Update
      playerVelocity += GRAVITY;
      playerY += playerVelocity;
      
      // Ground collision
      if (playerY > 150) {
        playerY = 150;
        playerVelocity = 0;
      }

      // Obstacles
      if (frame % 100 === 0) {
         obstacles.push({ x: 300, width: 20, height: 20 + Math.random() * 20 });
      }

      obstacles.forEach(obs => {
        obs.x -= SPEED;
      });
      
      // Remove off-screen
      if (obstacles.length > 0 && obstacles[0].x < -20) {
        obstacles.shift();
        currentScore++;
        setScore(currentScore);
      }

      // Collision Check
      const playerRect = { x: 50, y: playerY, w: 20, h: 20 };
      for (const obs of obstacles) {
        if (
          playerRect.x < obs.x + obs.width &&
          playerRect.x + playerRect.w > obs.x &&
          playerRect.y < 170 && // Ground y is 170
          playerRect.y + playerRect.h > 170 - obs.height
        ) {
           setGameState('GAME_OVER');
           playError();
        }
      }

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 300, 300); // BG

      // Ground
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 170, 300, 130);
      ctx.strokeStyle = '#A4C639';
      ctx.beginPath();
      ctx.moveTo(0, 170);
      ctx.lineTo(300, 170);
      ctx.stroke();

      // Player
      ctx.fillStyle = '#FFEB3B';
      ctx.fillRect(50, playerY, 20, 20);
      ctx.strokeStyle = '#F57F17';
      ctx.strokeRect(50, playerY, 20, 20);

      // Obstacles
      ctx.fillStyle = '#F44336';
      obstacles.forEach(obs => {
        // Draw spikes
        ctx.beginPath();
        ctx.moveTo(obs.x, 170);
        ctx.lineTo(obs.x + obs.width/2, 170 - obs.height);
        ctx.lineTo(obs.x + obs.width, 170);
        ctx.fill();
      });

      frame++;
      animationId = requestAnimationFrame(loop);
    };

    if (gameState === 'PLAYING') {
      loop();
    } else {
      // Draw Start/End screens
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#FFF';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      if (gameState === 'START') {
        ctx.fillText('GEOMETRY DASH', 150, 100);
        ctx.fillStyle = '#A4C639';
        ctx.fillText('Tap to Start', 150, 150);
      } else {
        ctx.fillText('GAME OVER', 150, 100);
        ctx.fillText(`Score: ${score}`, 150, 130);
        ctx.fillStyle = '#A4C639';
        ctx.fillText('Tap to Retry', 150, 180);
      }
    }

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', handleClick);
      canvas.removeEventListener('touchstart', handleClick);
    };
  }, [gameState]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
       <canvas ref={canvasRef} width={300} height={300} className="bg-black" />
    </div>
  );
};


// --- Cydia (Tweaks) ---
export const CydiaApp: React.FC<{ 
  tweaks: TweaksState, 
  setTweaks: (t: TweaksState) => void 
}> = ({ tweaks, setTweaks }) => {
  const availableTweaks = [
    { id: 'winterboard', name: 'WinterBoard', desc: 'Enable Flat Theme', active: tweaks.flatIcons },
    { id: 'battery', name: 'BatteryPercentage', desc: 'Show % in Status Bar', active: tweaks.showBatteryPercent },
    { id: 'darkmode', name: 'Eclipse', desc: 'System Dark Mode', active: tweaks.darkMode },
    { id: 'ics', name: 'ICS Theme', desc: 'Android 4.0 Holo Style', active: tweaks.icsTheme }
  ];

  const toggleTweak = (id: string) => {
    playClick();
    if (id === 'winterboard') setTweaks({ ...tweaks, flatIcons: !tweaks.flatIcons });
    if (id === 'battery') setTweaks({ ...tweaks, showBatteryPercent: !tweaks.showBatteryPercent });
    if (id === 'darkmode') setTweaks({ ...tweaks, darkMode: !tweaks.darkMode });
    if (id === 'ics') setTweaks({ ...tweaks, icsTheme: !tweaks.icsTheme });
  };

  return (
    <AppLayout title="Cydia" icon="cydia" bgClass="bg-[#222]">
      <div className="bg-gradient-to-b from-[#444] to-[#222] text-white p-2 text-xs font-bold uppercase text-center mb-2 shadow border-b border-black">
        SHSH: 2.3.7 Verified • Cydia 1.1.9
      </div>
      <div className="px-2">
        <div className="text-[#A4C639] text-xs font-bold mb-1 ml-1 uppercase">Installed Tweaks</div>
        {availableTweaks.map(tweak => (
          <div key={tweak.id} className="bg-[#333] border border-[#444] p-3 mb-2 rounded shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm border border-blue-400">
                 {tweak.name[0]}
               </div>
               <div>
                 <div className="text-white font-bold text-sm">{tweak.name}</div>
                 <div className="text-gray-400 text-[10px]">{tweak.desc}</div>
               </div>
            </div>
            <button 
              onClick={() => toggleTweak(tweak.id)}
              className={`px-3 py-1 rounded text-xs font-bold border shadow-sm ${tweak.active ? 'bg-red-600 text-white border-red-800' : 'bg-gray-200 text-black border-gray-400'}`}
            >
              {tweak.active ? 'Remove' : 'Install'}
            </button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};


// --- OTHER APPS ---
export const ContactsApp: React.FC = () => {
  const contacts = [
    { name: 'John Doe', number: '555-0123' },
    { name: 'Jane Smith', number: '555-0199' },
    { name: 'Emergency', number: '911' },
    { name: 'Voicemail', number: '123' }
  ];
  return (
    <AppLayout title="Contacts" icon="contacts">
      <div className="divide-y divide-gray-700">
        {contacts.map((c, i) => (
          <div key={i} className="p-3 bg-gradient-to-b from-[#333] to-[#222] flex items-center gap-3">
             <div className="w-10 h-10 bg-gray-500 rounded-sm flex items-center justify-center text-xl font-bold border border-gray-400 text-white text-shadow-sm">{c.name[0]}</div>
             <div>
                <div className="font-bold text-white text-lg">{c.name}</div>
                <div className="text-gray-400 text-sm">{c.number}</div>
             </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export const CameraApp: React.FC<{ addImage: (img: string) => void }> = ({ addImage }) => {
  const [flash, setFlash] = useState(false);
  
  const takePicture = () => {
    setFlash(true);
    playClick();
    setTimeout(() => setFlash(false), 100);
    // Simulate saving a picture
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0,0,300,300);
      ctx.fillStyle = '#A4C639';
      ctx.font = '30px monospace';
      ctx.fillText('Photo ' + new Date().toLocaleTimeString(), 20, 150);
      addImage(canvas.toDataURL());
    }
  };

  return (
    <div className="w-full h-full bg-black relative flex flex-col">
       <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
          <div className="text-gray-500">Camera Viewfinder</div>
          <AppIcon name="camera" size={64} className="text-[#333] opacity-20 absolute" />
          
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
             <div className="border-r border-white/10"></div>
             <div className="border-r border-white/10"></div>
             <div></div>
             <div className="border-r border-white/10 border-t"></div>
             <div className="border-r border-white/10 border-t"></div>
             <div className="border-t border-white/10"></div>
             <div className="border-r border-white/10 border-t"></div>
             <div className="border-r border-white/10 border-t"></div>
             <div className="border-t border-white/10"></div>
          </div>

          {flash && <div className="absolute inset-0 bg-white z-50 animate-ping"></div>}
       </div>
       <div className="h-20 bg-gradient-to-t from-black to-[#222] flex items-center justify-center border-t border-[#333] relative z-10">
          <button 
            onClick={takePicture}
            className="w-16 h-16 rounded-full bg-gray-300 border-4 border-gray-500 shadow-inner flex items-center justify-center active:bg-gray-400"
          >
             <AppIcon name="camera" size={32} className="text-gray-700" />
          </button>
       </div>
    </div>
  );
};

export const MapsApp: React.FC = () => {
  return (
    <AppLayout title="Maps" icon="maps">
       <div className="w-full h-full bg-[#e3e0d6] relative overflow-hidden flex items-center justify-center">
          {/* Simulated Map */}
          <div className="grid grid-cols-4 grid-rows-4 gap-1 w-[150%] h-[150%] opacity-50 transform rotate-12">
             {[...Array(16)].map((_, i) => (
                <div key={i} className="border border-gray-400 bg-[#f0ede5]"></div>
             ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse ring-4 ring-blue-500/30"></div>
          </div>
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
             <button className="bg-white/90 p-2 border border-gray-400 shadow text-black font-bold">+</button>
             <button className="bg-white/90 p-2 border border-gray-400 shadow text-black font-bold">-</button>
          </div>
          <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 border border-gray-400 shadow text-xs font-bold text-black">
             Mountain View, CA
          </div>
       </div>
    </AppLayout>
  );
};

export const EmailApp: React.FC = () => {
  return (
    <AppLayout title="Email" icon="email">
       <div className="flex flex-col h-full bg-white text-black">
         {[
           { from: 'Google Team', subject: 'Welcome to Android', date: '10:00 AM' },
           { from: 'Andy Rubin', subject: 'Project Updates', date: 'Yesterday' },
           { from: 'Newsletter', subject: 'Tech Weekly', date: 'Oct 20' }
         ].map((mail, i) => (
           <div key={i} className={`p-3 border-b border-gray-200 ${i === 0 ? 'font-bold bg-gray-50' : ''}`}>
              <div className="flex justify-between text-sm mb-1">
                 <span className={`${i===0 ? 'text-black' : 'text-gray-800'}`}>{mail.from}</span>
                 <span className="text-blue-600 text-xs">{mail.date}</span>
              </div>
              <div className="text-sm text-gray-600">{mail.subject}</div>
           </div>
         ))}
       </div>
    </AppLayout>
  );
};

export const CalendarApp: React.FC = () => {
  return (
    <AppLayout title="Calendar" icon="calendar" bgClass="bg-white">
       <div className="flex flex-col h-full">
          <div className="flex bg-[#eee] border-b border-gray-300 p-1 text-xs font-bold text-center text-gray-600">
             {['S','M','T','W','T','F','S'].map(d => <div key={d} className="flex-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 flex-1 content-start">
             {[...Array(31)].map((_, i) => (
                <div key={i} className={`h-16 border-r border-b border-gray-200 p-1 text-xs text-black relative ${i===15 ? 'bg-blue-100' : ''}`}>
                   {i+1}
                   {i === 15 && <div className="mt-1 bg-blue-500 text-white text-[8px] px-1 rounded">Meeting</div>}
                </div>
             ))}
          </div>
       </div>
    </AppLayout>
  );
};

export const ClockApp: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
     <div className="w-full h-full bg-black flex flex-col items-center justify-center">
        <div className="text-[#A4C639] text-6xl font-thin tracking-tighter mb-4 font-mono">
           {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
        <div className="text-gray-500 text-xl uppercase tracking-widest">
           {time.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})}
        </div>
        <div className="mt-12 flex gap-8">
           <div className="flex flex-col items-center gap-2">
              <AppIcon name="clock" size={32} className="text-gray-400" />
              <span className="text-xs text-gray-500 uppercase">Alarm</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <AppIcon name="image" size={32} className="text-gray-400" />
              <span className="text-xs text-gray-500 uppercase">Slideshow</span>
           </div>
        </div>
     </div>
  );
};

export const PhoneApp: React.FC = () => {
  const [number, setNumber] = useState('');
  const [calling, setCalling] = useState(false);

  const press = (d: string) => {
    playType();
    setNumber(prev => prev + d);
  };

  if (calling) {
    return (
      <div className="h-full bg-black flex flex-col items-center pt-20 relative overflow-hidden font-sans">
        <div className="w-24 h-24 bg-[#222] rounded-lg flex items-center justify-center mb-4 border border-[#333] shadow-[0_0_20px_rgba(164,198,57,0.3)]">
          <AppIcon name="user" size={48} className="text-gray-500" />
        </div>
        <div className="text-2xl text-white font-light mb-2 tracking-widest">{number}</div>
        <div className="text-[#A4C639] text-sm animate-pulse">Dialing...</div>
        <button 
          onClick={() => { playClick(); setCalling(false); }}
          className="absolute bottom-10 w-full h-16 bg-gradient-to-t from-red-800 to-red-600 text-white font-bold text-lg flex items-center justify-center border-t border-red-500 shadow-[0_-2px_10px_rgba(0,0,0,0.5)]"
        >
          End Call
        </button>
      </div>
    );
  }

  return (
    <AppLayout title="Phone" icon="phone">
      <div className="h-full flex flex-col">
        <div className="h-16 bg-[#222] flex items-center justify-center text-3xl text-white font-light tracking-widest border-b border-[#333] shadow-inner font-mono">
          {number}
        </div>
        <div className="flex-1 bg-black grid grid-cols-3">
          {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map((d) => (
            <button 
              key={d} 
              onClick={() => press(d.toString())}
              className="border border-[#111] text-2xl text-white active:bg-[#A4C639] active:text-black flex items-center justify-center font-bold bg-gradient-to-br from-[#1a1a1a] to-black"
            >
              {d}
            </button>
          ))}
        </div>
        <button 
          onClick={() => { if(number) { playClick(); setCalling(true); } }}
          className="h-16 bg-gradient-to-t from-green-700 to-green-600 text-white font-bold text-xl flex items-center justify-center active:from-green-600 active:to-green-500 border-t border-green-500 shadow-lg"
        >
          <AppIcon name="phone" size={24} className="mr-2 fill-current" /> Call
        </button>
      </div>
    </AppLayout>
  );
};

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [reset, setReset] = useState(false);

  const handle = (val: string) => {
    playClick();
    if (val === 'C') {
      setDisplay('0');
      setReset(false);
    } else if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        setDisplay(eval(display.replace('x', '*')).toString());
        setReset(true);
      } catch {
        setDisplay('Error');
        setReset(true);
      }
    } else {
      if (display === '0' || reset) {
        setDisplay(val);
        setReset(false);
      } else {
        setDisplay(display + val);
      }
    }
  };

  const btns = [
    '7','8','9','/',
    '4','5','6','x',
    '1','2','3','-',
    'C','0','=','+'
  ];

  return (
    <AppLayout title="Calculator" icon="calculator">
       <div className="h-full flex flex-col">
         <div className="h-24 bg-[#111] text-right p-4 text-4xl text-white font-mono flex items-end justify-end break-all border-b border-[#333]">
           {display}
         </div>
         <div className="flex-1 grid grid-cols-4 gap-[1px] bg-[#333]">
           {btns.map(b => (
             <button 
                key={b} 
                onClick={() => handle(b)}
                className={`text-xl font-bold flex items-center justify-center shadow-inner ${['/','x','-','+','='].includes(b) ? 'bg-gradient-to-b from-[#A4C639] to-[#6d8a14] text-white border border-[#444]' : 'bg-gradient-to-b from-[#333] to-[#222] text-white active:bg-[#444]'}`}
             >
               {b}
             </button>
           ))}
         </div>
       </div>
    </AppLayout>
  );
};

// 6. WhatsApp
export const WhatsAppApp: React.FC = () => {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [chatLog, setChatLog] = useState<string[]>(["Hey! Is that a Nexus One?", "Yeah! Running Android 2.3. Still works!"]);
  
  const sendMessage = () => {
     if (input.trim()) {
       playClick();
       setChatLog([...chatLog, input]);
       setInput('');
     }
  };
  
  const { input, setInput } = useVirtualKeyboard(sendMessage);
  
  if (view === 'chat') {
     return (
       <div className="h-full bg-[#E5DDD5] flex flex-col font-sans">
          <div className="bg-[#075E54] p-2 flex items-center text-white shadow">
             <button onClick={() => setView('list')} className="mr-2"><AppIcon name="back" size={20}/></button>
             <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 border border-white/50"></div>
             <div className="font-bold text-sm text-shadow">John Doe</div>
          </div>
          <div className="flex-1 p-2 space-y-2 overflow-y-auto">
             {chatLog.map((msg, i) => (
                <div key={i} className={`p-2 rounded-lg shadow-sm max-w-[80%] text-sm text-black border-b border-black/10 ${i % 2 === 0 ? 'bg-white self-start' : 'bg-[#DCF8C6] self-end ml-auto'}`}>
                  {msg}
                </div>
             ))}
          </div>
          <div className="p-2 bg-white flex gap-2 border-t border-gray-300">
             <div className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm text-black bg-white flex items-center overflow-hidden h-8 shadow-inner">
               {input || <span className="text-gray-400">Type a message</span>} <span className="animate-pulse">|</span>
             </div>
             <button onClick={sendMessage} className="w-8 h-8 bg-[#075E54] rounded-full flex items-center justify-center text-white shadow-md active:scale-95">
                <AppIcon name="send" size={16} />
             </button>
          </div>
       </div>
     )
  }

  return (
    <AppLayout title="WhatsApp" icon="whatsapp" bgClass="bg-white">
      <div className="bg-[#075E54] text-white flex text-xs font-bold uppercase shadow-md">
         <div className="flex-1 py-3 text-center border-b-4 border-white">Chats</div>
         <div className="flex-1 py-3 text-center opacity-70">Status</div>
         <div className="flex-1 py-3 text-center opacity-70">Calls</div>
      </div>
      <div className="divide-y divide-gray-200">
        {[1].map(i => (
          <div key={i} onClick={() => { playClick(); setView('chat'); }} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer">
             <div className="w-12 h-12 bg-gray-300 rounded-full mr-3 border border-gray-200"></div>
             <div className="flex-1">
                <div className="flex justify-between">
                   <span className="font-bold text-black text-sm">John Doe</span>
                   <span className="text-gray-400 text-[10px]">12:30 PM</span>
                </div>
                <div className="text-gray-500 text-xs truncate">Yeah! Running Android 2.3...</div>
             </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

// 8. Browser
export const BrowserApp: React.FC = () => {
  const [history, setHistory] = useState<string[]>([]);
  const go = () => {
     if (input.trim()) {
       playClick();
       setHistory([input, ...history]);
       setInput('');
     }
  }
  const { input, setInput } = useVirtualKeyboard(go);

  return (
    <div className="flex flex-col h-full bg-white font-sans">
       <div className="bg-[#ddd] p-1 flex items-center gap-1 border-b border-gray-400 shadow-sm">
          <div className="flex-1 bg-white border border-gray-400 rounded h-8 flex items-center px-2 text-xs text-black shadow-inner overflow-hidden">
             {input || "http://www.google.com"} <span className="animate-pulse">|</span>
          </div>
          <button onClick={go} className="p-1 bg-gradient-to-b from-[#f9f9f9] to-[#e0e0e0] rounded border border-gray-500 text-black font-bold text-xs shadow-sm active:bg-[#ccc]">Go</button>
       </div>
       <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white">
          <span className="text-4xl font-bold text-blue-600 mb-2 drop-shadow-sm font-serif">Google</span>
          <div className="border border-gray-400 px-2 py-1 w-full max-w-[200px] h-8 shadow-inner bg-white rounded-none"></div>
          <div className="flex gap-2 mt-2">
             <button className="bg-[#f8f8f8] border border-[#c6c6c6] px-2 py-1 text-xs text-black font-bold rounded-sm shadow-sm">Google Search</button>
          </div>
          
          {history.length > 0 && (
             <div className="mt-8 w-full border-t pt-4">
                <div className="text-xs font-bold text-gray-500 mb-2">History:</div>
                {history.map((h, i) => (
                   <div key={i} className="text-xs text-blue-800 underline mb-1">{h}</div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

// 7. VK
export const VKApp: React.FC = () => {
  return (
    <AppLayout title="VKontakte" icon="vk" bgClass="bg-[#edeef0]">
       <div className="bg-[#4c75a3] h-12 flex items-center px-3 justify-between shadow-md border-b border-[#3a587a]">
          <span className="font-bold text-white text-shadow-sm">News</span>
          <AppIcon name="search" size={20} className="text-white opacity-80" />
       </div>
       <div className="p-2 space-y-3">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-sm p-3 shadow border border-gray-300">
               <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-200 rounded-sm mr-2"></div>
                  <div>
                     <div className="text-[#2b587a] font-bold text-sm">Pavel Durov</div>
                     <div className="text-gray-400 text-xs">two hours ago</div>
                  </div>
               </div>
               <div className="text-sm text-black mb-2 font-sans">
                  Check out this new update for Android 2.3! #android #legacy
               </div>
               <div className="flex text-[#2b587a] text-xs font-bold gap-4 border-t border-gray-100 pt-2">
                  <span>Like</span>
                  <span>Comment</span>
                  <span>Share</span>
               </div>
            </div>
          ))}
       </div>
    </AppLayout>
  );
};

// Launcher 4.4 (Full Screen App)
export const Launcher44App: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-900 to-black flex flex-col relative font-roboto">
       {/* KitKat Status Bar Imitation */}
       <div className="h-6 w-full bg-black/20 backdrop-blur-sm flex justify-end px-2 items-center text-xs text-white">
          <span>12:00</span>
       </div>
       
       {/* Search Bar */}
       <div className="mx-4 mt-8 bg-white/20 rounded-sm h-10 flex items-center px-4 backdrop-blur-md border border-white/30 shadow-lg">
          <span className="text-white/80 italic text-lg font-light">Google</span>
       </div>

       {/* Icons Grid */}
       <div className="flex-1 grid grid-cols-4 gap-4 p-4 content-end mb-16">
          {['Chrome', 'Gmail', 'Photos', 'Maps'].map(i => (
             <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-black font-bold text-xs">{i[0]}</div>
                <span className="text-white text-xs drop-shadow-md">{i}</span>
             </div>
          ))}
       </div>

       {/* Dock */}
       <div className="h-20 bg-white/10 flex items-center justify-around px-4">
          <div className="w-10 h-10 bg-green-500 rounded-full shadow-lg"></div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-80 shadow-lg"><div className="w-2 h-2 bg-gray-500 rounded-full mx-[1px]" /><div className="w-2 h-2 bg-gray-500 rounded-full mx-[1px]" /></div>
          <div className="w-10 h-10 bg-blue-500 rounded-full shadow-lg"></div>
       </div>
    </div>
  );
};

// Holo Launcher (Android 4.0 ICS Style)
export const HoloLauncherApp: React.FC = () => {
    return (
      <div className="w-full h-full bg-[url('https://wallpaperaccess.com/full/156340.jpg')] bg-cover flex flex-col relative font-sans text-white">
         <div className="h-6 w-full bg-black/50 flex justify-end px-2 items-center text-xs">
            <span className="text-[#33B5E5] font-bold">12:30</span>
         </div>
         
         <div className="mx-2 mt-4 flex items-center bg-black/40 rounded p-2 border border-white/20">
            <span className="text-white/60 italic text-sm">Google Search</span>
         </div>
  
         <div className="flex-1"></div>
  
         <div className="h-20 bg-black/60 flex items-center justify-between px-6 border-t border-[#33B5E5]">
            <AppIcon name="phone" size={32} ics={true} />
            <div className="p-2 border border-white/30 rounded-full bg-black/50">
                <AppIcon name="list" size={24} ics={true} />
            </div>
            <AppIcon name="browser" size={32} ics={true} />
         </div>
      </div>
    );
  };

// Magisk Manager
export const MagiskApp: React.FC = () => {
  const [root, setRoot] = useState(false);
  const [safetynet, setSafetynet] = useState(false);

  return (
    <AppLayout title="Magisk Manager" icon="magisk" bgClass="bg-[#212121]">
      <div className="p-4">
        <div className="bg-[#303030] rounded p-4 shadow-lg mb-4 flex items-center justify-between border-l-4 border-green-500">
           <div>
             <div className="text-white font-bold text-lg">Magisk</div>
             <div className="text-gray-400 text-xs">Installed: v23.0 (23000)</div>
           </div>
           <div className="h-10 w-10 rounded-full border-4 border-green-500 flex items-center justify-center text-green-500 font-bold bg-black/50">✔</div>
        </div>

        <div className="bg-[#303030] rounded p-4 shadow-lg mb-4">
           <div className="text-white font-bold mb-2">Superuser</div>
           <div 
             className="flex items-center justify-between p-2 bg-[#424242] rounded mb-2 active:bg-[#505050]" 
             onClick={() => { playClick(); setRoot(!root); }}
           >
              <span className="text-sm">Superuser Access</span>
              <div className={`w-10 h-4 rounded-full relative transition-colors ${root ? 'bg-green-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-[-2px] h-5 w-5 rounded-full bg-white shadow transition-all ${root ? 'left-5' : 'left-0'}`}></div>
              </div>
           </div>
        </div>

        <button 
           onClick={() => { playClick(); setSafetynet(true); }}
           className="w-full bg-[#009688] text-white py-3 rounded shadow font-bold active:bg-[#00796b]"
        >
          {safetynet ? 'SafetyNet Check Passed' : 'Check SafetyNet'}
        </button>
      </div>
    </AppLayout>
  );
};

// Music App
export const MusicApp: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  
  return (
    <AppLayout title="Music" icon="music" bgClass="bg-[#111]">
      <div className="flex flex-col h-full items-center justify-center p-4">
         <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-black border-2 border-[#333] rounded shadow-lg flex items-center justify-center mb-6 relative overflow-hidden">
            <AppIcon name="music" size={64} className="text-gray-600" />
            {playing && (
               <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center gap-1 p-2 opacity-50">
                  {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="w-4 bg-[#A4C639] animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                  ))}
               </div>
            )}
         </div>
         <div className="text-white font-bold text-lg mb-1">Unknown Artist</div>
         <div className="text-gray-400 text-sm mb-8">Track 01</div>
         
         <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white"><AppIcon name="skip-back" size={32} /></button>
            <button 
              onClick={() => { playClick(); setPlaying(!playing); }}
              className="w-16 h-16 rounded-full bg-gradient-to-b from-[#A4C639] to-[#6d8a14] flex items-center justify-center shadow-lg active:scale-95 border-2 border-green-800"
            >
               <AppIcon name={playing ? "pause" : "play"} size={32} className="text-white fill-white" />
            </button>
            <button className="text-gray-400 hover:text-white"><AppIcon name="skip-fwd" size={32} /></button>
         </div>
      </div>
    </AppLayout>
  );
};

// Messages App
export const MessagesApp: React.FC = () => {
  const [msgs, setMsgs] = useState(["Welcome to Android!"]);
  const { input, setInput } = useVirtualKeyboard(() => {
     if (input.trim()) {
       playClick();
       setMsgs([...msgs, input]);
       setInput('');
     }
  });

  return (
    <AppLayout title="Messaging" icon="messages" bgClass="bg-black">
      <div className="flex-1 p-2 space-y-2">
         {msgs.map((m, i) => (
            <div key={i} className="bg-[#222] border border-[#333] p-2 rounded text-sm text-gray-200 shadow-sm relative">
               <span className="font-bold text-[#A4C639] text-xs block mb-1">Me:</span>
               {m}
               <div className="absolute top-2 right-2 text-[8px] text-gray-500">10:00</div>
            </div>
         ))}
      </div>
      <div className="p-2 border-t border-[#333] flex gap-2">
         <div className="flex-1 bg-[#222] border border-[#444] h-8 flex items-center px-2 text-sm">
            {input} <span className="animate-pulse">|</span>
         </div>
         <button className="bg-[#A4C639] text-black text-xs font-bold px-3 rounded shadow-sm">Send</button>
      </div>
    </AppLayout>
  );
};
