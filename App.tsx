
import React, { useState, useEffect, useRef } from 'react';
import { HardwareKey, SystemState, AppDefinition, SettingsState, WidgetInstance, WidgetType, TweaksState } from './types';
import { AppIcon } from './components/Icon';
import { 
  MarketApp, GeminiApp, SettingsApp, GalleryApp, 
  PhoneApp, CalculatorApp, Launcher44App, MagiskApp, 
  CydiaApp, WhatsAppApp, VKApp, BrowserApp, MusicApp, MessagesApp,
  ContactsApp, CameraApp, MapsApp, EmailApp, CalendarApp, ClockApp, GeometryDashApp,
  RecorderApp, HoloLauncherApp
} from './components/Apps';
import { SearchWidget, AnalogClockWidget, PowerControlWidget } from './components/Widgets';
import { playClick, playType, playUnlock } from './services/soundService';

// --- Constants & Data ---

const INITIAL_APPS: AppDefinition[] = [
  { id: 'phone', name: 'Phone', icon: 'phone', installed: true, system: true },
  { id: 'contacts', name: 'Contacts', icon: 'contacts', installed: true, system: true },
  { id: 'browser', name: 'Browser', icon: 'browser', installed: true, system: true },
  { id: 'messages', name: 'Messaging', icon: 'messages', installed: true, system: true },
  { id: 'market', name: 'Market', icon: 'market', installed: true, system: true },
  { id: 'settings', name: 'Settings', icon: 'settings', installed: true, system: true },
  { id: 'camera', name: 'Camera', icon: 'camera', installed: true, system: true },
  { id: 'gallery', name: 'Gallery', icon: 'gallery', installed: true, system: true },
  { id: 'music', name: 'Music', icon: 'music', installed: true, system: true },
  { id: 'maps', name: 'Maps', icon: 'maps', installed: true, system: true },
  { id: 'email', name: 'Email', icon: 'email', installed: true, system: true },
  { id: 'calendar', name: 'Calendar', icon: 'calendar', installed: true, system: true },
  { id: 'clock', name: 'Clock', icon: 'clock', installed: true, system: true },
  { id: 'calculator', name: 'Calculator', icon: 'calculator', installed: true, system: true },
  { id: 'recorder', name: 'Recorder', icon: 'recorder', installed: true, system: true },
  { id: 'launcher44', name: 'Launcher 4.4', icon: 'launcher44', installed: false, system: false, version: '1.0.2', size: '4.2MB' },
  { id: 'holo', name: 'Holo Launcher', icon: 'holo', installed: false, system: false, version: '1.0', size: '2.5MB' },
  { id: 'magisk', name: 'Magisk', icon: 'magisk', installed: false, system: false, version: 'v23.0', size: '8.5MB' },
  { id: 'cydia', name: 'Cydia', icon: 'cydia', installed: false, system: false, version: '1.1', size: '2.1MB' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp', installed: false, system: false, version: '2.11', size: '15MB' },
  { id: 'vk', name: 'VK', icon: 'vk', installed: false, system: false, version: '3.0', size: '12MB' },
  { id: 'gemini', name: 'Gemini 3.0', icon: 'gemini', installed: false, system: false, version: '3.0-preview', size: '1.5MB' },
  { id: 'geometry', name: 'Geometry Dash', icon: 'geometry', installed: false, system: false, version: '1.0', size: '48MB' },
];

const DEFAULT_SETTINGS: SettingsState = {
  wallpaper: 'bg-black',
  ringtone: 'Nexus',
  wifi: true,
  brightness: 80,
  soundProfile: 'Normal'
};

const DEFAULT_TWEAKS: TweaksState = {
  showBatteryPercent: false,
  flatIcons: false,
  darkMode: true,
  icsTheme: false
};

// --- Sub-components (UI Elements) ---

const StatusBar = ({ 
  battery, isCharging, soundProfile, time, showPercent, onClick, icsTheme 
}: { 
  battery: number, isCharging: boolean, soundProfile: string, time: string, showPercent: boolean, onClick: () => void, icsTheme: boolean 
}) => (
  <div onClick={onClick} className={`h-6 w-full ${icsTheme ? 'bg-[#000] border-b border-[#33B5E5]' : 'bg-gradient-to-b from-[#111] to-black border-b border-[#333]'} flex items-center justify-between px-1 text-xs text-white z-50 select-none cursor-pointer active:bg-gray-800`}>
    <div className="flex items-center gap-1">
      {soundProfile === 'Vibrate' && <AppIcon name="sound-vibrate" size={12} className="text-gray-300" />}
      {soundProfile === 'Silent' && <AppIcon name="sound-silent" size={12} className="text-gray-300" />}
      {!['Vibrate', 'Silent'].includes(soundProfile) && <AppIcon name="signal" size={14} className={icsTheme ? "text-[#33B5E5]" : "text-[#A4C639]"} />}
    </div>
    
    <div className="flex items-center gap-2">
      <AppIcon name="wifi" size={14} className={icsTheme ? "text-[#33B5E5]" : "text-[#A4C639]"} />
      <span className={`font-bold text-gray-200 text-shadow-sm font-sans ${icsTheme ? 'text-[#33B5E5]' : ''}`}>{time}</span>
      <div className="relative flex items-center">
        {showPercent && <span className="text-[10px] mr-1 text-gray-300 font-bold">{battery}%</span>}
        <div className="relative">
             <AppIcon name="battery" size={16} className="text-gray-400 transform rotate-180" />
             <div 
                className={`absolute top-[4px] right-[2px] h-[8px] rounded-[1px] transition-colors duration-300 ${isCharging ? 'bg-yellow-400' : (battery < 20 ? 'bg-red-500' : (icsTheme ? 'bg-[#33B5E5]' : 'bg-[#A4C639]'))}`} 
                style={{width: `${Math.max(0, (battery / 100) * 8)}px`}}
             />
        </div>
      </div>
    </div>
  </div>
);

// Improved Android 2.3 Keyboard Style
const Keyboard = ({ onHide, icsTheme }: { onHide: () => void, icsTheme: boolean }) => {
  const rows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m', 'DEL'],
    ['?123', ',', 'SPACE', '.', 'ENTER']
  ];

  const handleKey = (key: string) => {
    if (key === 'HIDE') {
       onHide();
       return;
    }
    playType();
    const event = new CustomEvent('virtual-keypress', { detail: key });
    window.dispatchEvent(event);
  };

  return (
    <div className={`absolute bottom-0 left-0 w-full ${icsTheme ? 'bg-[#000]' : 'bg-[#0a0a0a]'} p-1 pb-2 shadow-[0_-4px_10px_rgba(0,0,0,0.8)] z-50 border-t ${icsTheme ? 'border-[#333]' : 'border-[#333]'}`}>
      <div className={`flex justify-center ${icsTheme ? 'bg-[#1a1a1a]' : 'bg-[#222]'} mb-1 py-1 rounded-sm border ${icsTheme ? 'border-[#333]' : 'border-[#333]'} relative`}>
        <span className="text-xs text-gray-400 italic">Predictive text...</span>
        <button onClick={onHide} className="absolute right-1 top-0 bottom-0 text-gray-500 hover:text-white px-2">▼</button>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center w-full mb-1 gap-1">
          {row.map(key => (
            <button
              key={key}
              onMouseDown={(e) => { e.preventDefault(); handleKey(key); }}
              className={`
                rounded shadow-sm text-white font-bold text-sm
                ${key === 'SPACE' ? 'flex-grow mx-4' : 'w-8'}
                ${key === 'ENTER' || key === 'DEL' || key === '?123' ? 'bg-gradient-to-b from-[#444] to-[#222] px-2 text-[10px]' : 'bg-gradient-to-b from-[#555] to-[#333]'}
                h-10 border-b border-black
                ${icsTheme ? 'active:bg-[#33B5E5] active:text-black' : 'active:from-orange-500 active:to-orange-600 active:text-black active:border-orange-800'}
                relative
              `}
            >
              {key === 'SPACE' ? ' ' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

// Notification Shade (Pull down)
const NotificationShade = ({ 
  isOpen, onClose, time, date, icsTheme 
}: { 
  isOpen: boolean, onClose: () => void, time: string, date: string, icsTheme: boolean 
}) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[60] flex flex-col animate-slide-down">
            {/* Shade Header */}
            <div className={`h-12 ${icsTheme ? 'bg-[#000] border-b border-[#33B5E5]' : 'bg-[#111] border-b border-gray-600'} flex items-center justify-between px-4`}>
                 <div className="flex flex-col">
                    <span className={`text-xl font-bold ${icsTheme ? 'text-[#33B5E5]' : 'text-white'}`}>{time}</span>
                    <span className="text-[10px] text-gray-400">{date}</span>
                 </div>
                 <button onClick={onClose} className={`px-4 py-1 ${icsTheme ? 'bg-[#1a1a1a] border border-[#33B5E5] text-[#33B5E5]' : 'bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-500 text-white'} rounded text-xs font-bold`}>
                    Clear
                 </button>
            </div>
            
            {/* Notifications List */}
            <div className="flex-1 bg-black/90 backdrop-blur-sm p-2 space-y-1">
                <div className="bg-[#1a1a1a] p-2 flex gap-3 items-center border-l-2 border-[#A4C639]">
                    <AppIcon name="hard-drive" size={24} className="text-white" />
                    <div>
                        <div className="text-sm font-bold text-white">USB Connected</div>
                        <div className="text-xs text-gray-400">Select to copy files to/from your computer.</div>
                    </div>
                </div>
                <div className="bg-[#1a1a1a] p-2 flex gap-3 items-center border-l-2 border-[#A4C639]">
                    <AppIcon name="gemini" size={24} className="text-white" />
                    <div>
                        <div className="text-sm font-bold text-white">USB Debugging connected</div>
                        <div className="text-xs text-gray-400">Select to disable USB debugging.</div>
                    </div>
                </div>
            </div>

            {/* Handle */}
            <div onClick={onClose} className="h-8 bg-gradient-to-b from-gray-700 to-black flex items-center justify-center cursor-pointer border-t border-gray-600">
                <div className="w-8 h-1 bg-gray-500 rounded-full"></div>
            </div>
        </div>
    );
};

// --- Screens ---

const CWMRecovery = ({ onBoot }: { onBoot: () => void }) => {
  const [selected, setSelected] = useState(0);
  const options = [
    "reboot system now",
    "apply update from sdcard",
    "wipe data/factory reset",
    "wipe cache partition",
    "install zip from sdcard",
    "backup and restore",
    "mounts and storage",
    "advanced"
  ];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') setSelected(prev => Math.max(0, prev - 1));
      if (e.key === 'ArrowDown') setSelected(prev => Math.min(options.length - 1, prev + 1));
      if (e.key === 'Enter') {
        if (selected === 0) onBoot();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, onBoot]);

  return (
    <div className="w-full h-full bg-black font-mono text-sm p-4 overflow-hidden">
      <div className="text-orange-500 font-bold mb-4">
        CWM-based Recovery v5.0.2.7<br/>
        <span className="text-xs font-normal">Use Vol Up/Down to scroll, Power to select</span>
      </div>
      <div className="space-y-1">
        {options.map((opt, i) => (
          <div key={i} className={`${selected === i ? 'bg-orange-500 text-black' : 'text-blue-400'}`}>
            - {opt}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 w-full text-center text-gray-500 text-xs">
        <div className="border-t border-gray-800 pt-2">Nexus One</div>
      </div>
    </div>
  );
};

const SetupWizard = ({ onFinish }: { onFinish: () => void }) => (
  <div className="w-full h-full bg-[#111] flex flex-col items-center pt-10 px-4 text-center font-sans border-t-4 border-[#A4C639]">
    <div className="text-[#A4C639] mb-6">
       <AppIcon name="gemini" size={80} className="text-[#A4C639]" />
    </div>
    <h1 className="text-2xl font-bold text-gray-200 mb-2">Welcome to Nexus One</h1>
    <p className="text-gray-400 text-sm mb-10">Touch the android to begin.</p>
    <button 
      onClick={() => { playUnlock(); onFinish(); }}
      className="bg-[#A4C639] text-black px-8 py-3 rounded shadow font-bold active:bg-green-500"
    >
      Start
    </button>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [systemState, setSystemState] = useState<SystemState>(SystemState.RECOVERY);
  const [apps, setApps] = useState<AppDefinition[]>(INITIAL_APPS);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [tweaks, setTweaks] = useState<TweaksState>(DEFAULT_TWEAKS);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isShadeOpen, setIsShadeOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([
    { id: '1', type: 'search', x: 0, y: 0 }
  ]);
  
  // Battery & Time State
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [currentTime, setCurrentTime] = useState("12:00");
  const [currentDate, setCurrentDate] = useState("Mon, Oct 20");

  useEffect(() => {
    const timeInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    }, 1000);

    const batteryInterval = setInterval(() => {
       if (isCharging) {
         setBatteryLevel(prev => Math.min(100, prev + 1));
       } else {
         setBatteryLevel(prev => Math.max(0, prev - 1));
       }
    }, isCharging ? 500 : 25000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(batteryInterval);
    };
  }, [isCharging]);

  useEffect(() => {
    if (batteryLevel === 0 && systemState !== SystemState.OFF && systemState !== SystemState.RECOVERY) {
       setSystemState(SystemState.OFF);
       setCurrentAppId(null);
    }
  }, [batteryLevel, systemState]);

  // Handle virtual keyboard request via clicking input areas
  useEffect(() => {
    const appsWithKeyboard = ['gemini', 'browser', 'whatsapp', 'messages', 'gallery'];
    if (currentAppId && appsWithKeyboard.includes(currentAppId)) {
        setIsKeyboardOpen(true);
    } else {
        setIsKeyboardOpen(false);
    }
  }, [currentAppId]);

  const handleHardwareKey = (key: HardwareKey) => {
    playClick(); // Sound for hardware buttons

    if (systemState === SystemState.OFF) {
       if (key === 'POWER') {
         if (batteryLevel > 0) {
            setSystemState(SystemState.BOOT_LOGO);
            setTimeout(() => setSystemState(SystemState.BOOT_ANIMATION), 2000);
            setTimeout(() => { 
                playUnlock(); 
                setSystemState(SystemState.HOME); 
            }, 6000);
         } else {
            alert("Battery is empty. Please connect charger.");
         }
       }
       return;
    }

    if (systemState === SystemState.RECOVERY) {
       if (key === 'POWER') {
         setSystemState(SystemState.BOOT_LOGO);
         setTimeout(() => setSystemState(SystemState.BOOT_ANIMATION), 2000);
         setTimeout(() => setSystemState(SystemState.SETUP_WIZARD), 6000);
       }
       return;
    }

    switch (key) {
      case 'HOME':
        setCurrentAppId(null);
        setIsAppDrawerOpen(false);
        setIsMenuOpen(false);
        setIsShadeOpen(false);
        break;
      case 'BACK':
        if (isShadeOpen) setIsShadeOpen(false);
        else if (isMenuOpen) setIsMenuOpen(false);
        else if (currentAppId) setCurrentAppId(null);
        else if (isAppDrawerOpen) setIsAppDrawerOpen(false);
        break;
      case 'MENU':
        if (!currentAppId) {
            setIsMenuOpen(!isMenuOpen);
        }
        break;
      case 'POWER':
        setSystemState(SystemState.OFF);
        break;
    }
  };

  const handleLongPress = () => {
    if (systemState === SystemState.HOME && !currentAppId && !isAppDrawerOpen && !isShadeOpen) {
      playClick();
      setIsMenuOpen(true);
    }
  };
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPress = () => {
    timerRef.current = setTimeout(handleLongPress, 800);
  };
  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const installApp = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, installed: true } : a));
  };

  const addWidget = (type: WidgetType) => {
    const newWidget: WidgetInstance = {
      id: Math.random().toString(),
      type: type,
      x: 0,
      y: 0
    };
    setWidgets([...widgets, newWidget]);
    setIsMenuOpen(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const getWallpaperStyle = () => {
    // Override wallpaper if ICS theme is active
    if (tweaks.icsTheme) {
       return { backgroundImage: `url('https://wallpaperaccess.com/full/156340.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }

    const wp = settings.wallpaper;
    if (wp.startsWith('data:')) {
      return { backgroundImage: `url(${wp})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  };

  const renderActiveApp = () => {
    switch (currentAppId) {
      case 'market': return <MarketApp apps={apps} installApp={installApp} openApp={setCurrentAppId} icsTheme={tweaks.icsTheme} />;
      case 'gemini': return <GeminiApp />;
      case 'settings': return <SettingsApp settings={settings} setSettings={setSettings} close={() => setCurrentAppId(null)} icsTheme={tweaks.icsTheme} />;
      case 'gallery': return <GalleryApp images={galleryImages} addImage={(img) => setGalleryImages(prev => [img, ...prev])} setWallpaper={(img) => setSettings({...settings, wallpaper: img})} />;
      case 'phone': return <PhoneApp />;
      case 'calculator': return <CalculatorApp />;
      case 'browser': return <BrowserApp />;
      case 'launcher44': return <Launcher44App />;
      case 'holo': return <HoloLauncherApp />;
      case 'magisk': return <MagiskApp />;
      case 'cydia': return <CydiaApp tweaks={tweaks} setTweaks={setTweaks} />;
      case 'whatsapp': return <WhatsAppApp />;
      case 'vk': return <VKApp />;
      case 'music': return <MusicApp />;
      case 'messages': return <MessagesApp />;
      case 'contacts': return <ContactsApp />;
      case 'camera': return <CameraApp addImage={(img) => setGalleryImages(prev => [img, ...prev])} />;
      case 'maps': return <MapsApp />;
      case 'email': return <EmailApp />;
      case 'calendar': return <CalendarApp />;
      case 'clock': return <ClockApp />;
      case 'geometry': return <GeometryDashApp />;
      case 'recorder': return <RecorderApp />;
      default: 
        return (
          <div className="flex flex-col h-full bg-black text-white">
             <div className="bg-gradient-to-b from-[#444] to-[#222] p-2 flex items-center gap-2 border-b border-black">
               <AppIcon name={apps.find(a => a.id === currentAppId)?.icon || 'circle'} size={20}/>
               <span className="font-bold text-sm">{apps.find(a => a.id === currentAppId)?.name}</span>
             </div>
             <div className="flex-1 flex items-center justify-center text-gray-600">
               Application not fully simulated yet.
             </div>
          </div>
        );
    }
  };

  const renderScreenContent = () => {
    switch (systemState) {
      case SystemState.OFF: 
        if (isCharging) {
           return (
             <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="flex flex-col items-center animate-pulse">
                   <AppIcon name="battery-charging" size={64} className="text-[#A4C639] mb-2" />
                   <span className="text-[#A4C639] font-mono font-bold text-xl">{batteryLevel}%</span>
                </div>
             </div>
           );
        }
        return <div className="w-full h-full bg-[#050505]" />;
      case SystemState.RECOVERY: return <CWMRecovery onBoot={() => handleHardwareKey('POWER')} />;
      case SystemState.BOOT_LOGO: 
        return <div className="w-full h-full bg-black flex items-center justify-center"><h1 className="text-white text-3xl font-bold tracking-widest">Google</h1></div>;
      case SystemState.BOOT_ANIMATION:
         return (
             <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
                 <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-[#A4C639] rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-black rounded-full h-20 w-20 flex items-center justify-center border-4 border-[#A4C639]">
                        <div className="text-[#A4C639] font-bold text-xs">X</div>
                    </div>
                 </div>
             </div>
         );
      case SystemState.SETUP_WIZARD:
        return <SetupWizard onFinish={() => setSystemState(SystemState.HOME)} />;
      case SystemState.HOME:
      case SystemState.APP_OPEN:
        return (
          <div 
             className={`w-full h-full relative flex flex-col ${(!settings.wallpaper.startsWith('data:') && !tweaks.icsTheme) ? settings.wallpaper : ''}`}
             style={getWallpaperStyle()}
             onMouseDown={startPress} onMouseUp={endPress} onTouchStart={startPress} onTouchEnd={endPress}
          >
            <StatusBar 
                battery={batteryLevel} 
                isCharging={isCharging} 
                soundProfile={settings.soundProfile} 
                time={currentTime} 
                showPercent={tweaks.showBatteryPercent} 
                onClick={() => setIsShadeOpen(!isShadeOpen)}
                icsTheme={tweaks.icsTheme}
            />
            
            <NotificationShade 
                isOpen={isShadeOpen} 
                onClose={() => setIsShadeOpen(false)} 
                time={currentTime}
                date={currentDate}
                icsTheme={tweaks.icsTheme}
            />

            {/* Desktop Workspace */}
            <div className="flex-1 relative p-2 flex flex-col">
               {/* Widgets Area */}
               <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto scrollbar-hide">
                 {!currentAppId && !isAppDrawerOpen && !isShadeOpen && widgets.map(widget => (
                   <div key={widget.id} className="w-full max-w-[280px]">
                     {widget.type === 'search' && <SearchWidget data={widget} onRemove={() => removeWidget(widget.id)} />}
                     {widget.type === 'clock' && <AnalogClockWidget data={widget} onRemove={() => removeWidget(widget.id)} />}
                     {widget.type === 'power' && <PowerControlWidget data={widget} onRemove={() => removeWidget(widget.id)} />}
                   </div>
                 ))}
               </div>

               {/* Shortcuts */}
               {!currentAppId && !isAppDrawerOpen && !isShadeOpen && (
                 <div className="grid grid-cols-3 gap-2 mt-auto mb-2 px-2">
                    {['phone', 'camera', 'browser'].map(id => {
                       const app = apps.find(a => a.id === id);
                       return app ? (
                         <div key={id} onClick={() => { playClick(); setCurrentAppId(id); }} className="flex flex-col items-center justify-center gap-1 active:opacity-70 group">
                           <AppIcon name={app.icon} size={48} flat={tweaks.flatIcons} ics={tweaks.icsTheme} />
                           <span className="text-[10px] text-white drop-shadow-md text-center leading-tight font-bold tracking-tight shadow-black bg-black/20 px-1 rounded group-active:text-[#A4C639]">{app.name}</span>
                         </div>
                       ) : null;
                    })}
                 </div>
               )}
               
               {/* Context Menu Overlay */}
               {isMenuOpen && !currentAppId && (
                 <div className="absolute bottom-0 left-0 w-full bg-[#1a1a1a] border-t-2 border-[#A4C639] grid grid-cols-4 text-white z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.8)]">
                   <div onClick={() => { playClick(); setSettings({...settings, wallpaper: settings.wallpaper === 'bg-black' ? 'bg-gradient-to-br from-blue-900 to-black' : 'bg-black'}); setIsMenuOpen(false); }} className="h-16 flex flex-col items-center justify-center active:bg-[#A4C639] active:text-black hover:bg-[#222] transition-colors">
                      <AppIcon name="image" size={20} className="mb-1 text-gray-400" />
                      <span className="text-[10px] font-bold uppercase">Wall</span>
                   </div>
                   <div onClick={() => { playClick(); addWidget('clock'); }} className="h-16 flex flex-col items-center justify-center active:bg-[#A4C639] active:text-black hover:bg-[#222] transition-colors">
                      <AppIcon name="clock" size={20} className="mb-1 text-gray-400" />
                      <span className="text-[10px] font-bold uppercase">Clock</span>
                   </div>
                   <div onClick={() => { playClick(); addWidget('power'); }} className="h-16 flex flex-col items-center justify-center active:bg-[#A4C639] active:text-black hover:bg-[#222] transition-colors">
                      <AppIcon name="battery" size={20} className="mb-1 text-gray-400" />
                      <span className="text-[10px] font-bold uppercase">Toggle</span>
                   </div>
                   <div onClick={() => { playClick(); setCurrentAppId('settings'); setIsMenuOpen(false); }} className="h-16 flex flex-col items-center justify-center active:bg-[#A4C639] active:text-black hover:bg-[#222] transition-colors">
                      <AppIcon name="settings" size={20} className="mb-1 text-gray-400" />
                      <span className="text-[10px] font-bold uppercase">Set</span>
                   </div>
                 </div>
               )}
            </div>

            {/* App Drawer */}
            {isAppDrawerOpen && !currentAppId && (
              <div className="absolute inset-0 top-6 bg-black z-30 p-4 grid grid-cols-4 gap-4 content-start overflow-y-auto animate-slide-up">
                 {apps.filter(a => a.installed).map(app => (
                    <div key={app.id} onClick={() => { playClick(); setCurrentAppId(app.id); setIsAppDrawerOpen(false); }} className="flex flex-col items-center gap-2 mb-2 active:opacity-50">
                       <AppIcon name={app.icon} size={36} flat={tweaks.flatIcons} ics={tweaks.icsTheme} />
                       <span className="text-xs text-white text-center font-bold">{app.name}</span>
                    </div>
                 ))}
              </div>
            )}

            {/* Active App Window */}
            {currentAppId && (
              <div className="absolute inset-0 top-6 bottom-[0%] bg-black z-20 flex flex-col h-[calc(100%-1.5rem)] shadow-2xl">
                 {renderActiveApp()}
              </div>
            )}

            {/* Dock */}
            {!currentAppId && !isAppDrawerOpen && (
              <div className={`h-14 w-full bg-gradient-to-t from-black to-transparent flex items-center justify-between px-6 pb-2 z-10 ${tweaks.icsTheme ? 'bg-[#111] border-t border-[#33B5E5]' : ''}`}>
                 <button onClick={() => { playClick(); setCurrentAppId('phone'); }} className="active:scale-95 transition-transform bg-gradient-to-b from-[#333] to-[#111] p-2 rounded-lg border border-[#333] shadow-lg"><AppIcon name="phone" size={28} flat={tweaks.flatIcons} ics={tweaks.icsTheme} /></button>
                 <button onClick={() => { playClick(); setIsAppDrawerOpen(true); }} className="active:scale-95 transition-transform p-2 bg-gradient-to-b from-[#444] to-[#222] rounded-t-lg border border-[#555] shadow-lg -mt-4">
                   <AppIcon name="list" size={28} className={tweaks.icsTheme ? "text-[#33B5E5]" : "text-white"} flat={tweaks.flatIcons} />
                 </button>
                 <button onClick={() => { playClick(); setCurrentAppId('browser'); }} className="active:scale-95 transition-transform bg-gradient-to-b from-[#333] to-[#111] p-2 rounded-lg border border-[#333] shadow-lg"><AppIcon name="browser" size={28} flat={tweaks.flatIcons} ics={tweaks.icsTheme} /></button>
              </div>
            )}

            {/* Virtual Keyboard */}
            {isKeyboardOpen && <Keyboard onHide={() => setIsKeyboardOpen(false)} icsTheme={tweaks.icsTheme} />}

          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4 relative font-sans">
      {/* Nexus One Hardware Frame */}
      <div className="relative w-[340px] h-[660px] bg-[#1a1a1a] rounded-[40px] shadow-2xl border-4 border-[#0a0a0a] flex flex-col items-center overflow-hidden shrink-0 select-none">
        
        {/* Top Speaker/Sensors */}
        <div className="h-10 w-full flex justify-center items-center space-x-4">
           <div className="w-16 h-1.5 bg-[#0f0f0f] rounded-full border border-gray-700 shadow-inner"></div>
           <div className="w-2 h-2 bg-[#000] rounded-full border border-gray-800"></div>
        </div>

        {/* Screen Area */}
        <div className="w-[300px] h-[500px] bg-black overflow-hidden relative border-2 border-[#111]">
           {renderScreenContent()}
        </div>

        {/* Nexus One Branding */}
        <div className="mt-1 mb-2 text-gray-600 font-sans text-[10px] font-bold tracking-widest uppercase opacity-60">Nexus One</div>

        {/* Capacitive Buttons Area */}
        <div className="w-full px-8 flex justify-between items-center mb-4">
           {['BACK', 'MENU', 'HOME', 'SEARCH'].map((key) => (
             <button 
               key={key}
               onClick={() => handleHardwareKey(key as HardwareKey)}
               className="text-gray-500 hover:text-white active:text-[#A4C639] transition-colors"
             >
               <AppIcon name={key.toLowerCase()} size={18} />
             </button>
           ))}
        </div>

        {/* Trackball */}
        <div 
          onClick={() => handleHardwareKey('POWER')}
          className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-black border border-gray-600 shadow-inner hover:ring-2 ring-white/20 cursor-pointer animate-pulse"
        ></div>
        
        {/* Hardware Volume Keys */}
        <div className="absolute -right-[4px] top-32 w-1 h-20 bg-gray-600 rounded-l flex flex-col gap-1 py-1">
            <button onClick={() => handleHardwareKey('VOL_UP')} className="flex-1 bg-gray-500 hover:bg-gray-400 rounded-sm mx-[1px]" />
            <button onClick={() => handleHardwareKey('VOL_DOWN')} className="flex-1 bg-gray-500 hover:bg-gray-400 rounded-sm mx-[1px]" />
        </div>
        
         {/* Hardware Power Key */}
         <div className="absolute top-[-4px] right-10 w-12 h-1 bg-gray-600 rounded-b">
            <button onClick={() => handleHardwareKey('POWER')} className="w-full h-full hover:bg-gray-400" />
        </div>

      </div>
      
      {/* External Controls */}
      <div className="hidden lg:block ml-8 text-white max-w-xs text-sm">
        <h2 className="font-bold text-lg mb-2 text-[#A4C639]">Nexus One Emulator</h2>
        <p className="text-gray-400 mb-4 text-xs">Running Android 2.3.7 (Gingerbread)</p>
        
        {/* Battery Simulation Control */}
        <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
           <h3 className="font-bold mb-2 flex items-center text-gray-300"><AppIcon name="battery" size={16} className="mr-2"/> Charger</h3>
           <button 
             onClick={() => { playClick(); setIsCharging(!isCharging); }}
             className={`w-full py-2 rounded font-bold transition-colors text-xs uppercase tracking-wide ${isCharging ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
           >
             {isCharging ? 'Disconnect Cable' : 'Connect Cable'}
           </button>
           <div className="mt-2 text-xs text-gray-500 font-mono">
             Current: {batteryLevel}% <br/>
             Status: {batteryLevel === 0 ? 'EMPTY' : isCharging ? 'CHARGING' : 'DRAINING'}
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;
