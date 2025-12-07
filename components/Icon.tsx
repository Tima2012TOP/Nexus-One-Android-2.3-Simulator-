
import React from 'react';
import { 
  Phone, MessageSquare, Globe, Settings, Camera, Music, 
  Map, Calendar, Clock, Calculator, ShoppingBag, Shield, Search,
  Wifi, Battery, BatteryCharging, Signal, ArrowLeft, Menu as MenuIcon, Home as HomeIcon,
  User, Video, Bot, Volume2, VolumeX, Smartphone, Play, Pause, SkipForward, SkipBack, X, Send,
  RefreshCw, Lock, Unlock, List, Star, Mic, Image as ImageIcon, Mail, HardDrive, Square, Mic2, Disc, Sliders, Info
} from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  flat?: boolean; // For WinterBoard tweak
  ics?: boolean; // For ICS Theme tweak
}

export const AppIcon: React.FC<IconProps> = ({ name, size = 36, className = "", flat = false, ics = false }) => {
  const commonProps = { size, className: `${className} drop-shadow-sm` };

  // --- Android 2.3 Gingerbread Icon Generator ---
  const GingerIcon = ({ 
    children, 
    bgGradient, 
    shape = "rounded-md" 
  }: { 
    children: React.ReactNode, 
    bgGradient: string,
    shape?: string
  }) => (
    <div 
      className={`
        relative flex items-center justify-center 
        ${shape} 
        ${flat 
          ? 'shadow-sm border border-black/20' 
          : 'shadow-[0_3px_5px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] border-t border-l border-white/20 border-b border-r border-black/50'
        }
        ${flat ? bgGradient.replace('bg-gradient-to-br', 'bg') : bgGradient}
        overflow-hidden
      `}
      style={{ width: size, height: size }}
    >
      {/* 3D Glass Gloss Effect - Hidden if flat mode is on */}
      {!flat && <div className={`absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-white/40 to-white/5 ${shape === 'rounded-full' ? 'rounded-t-full' : 'rounded-t-md'} pointer-events-none`} />}
      
      {/* Icon Content */}
      <div className={`relative z-10 ${!flat ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : ''}`}>
        {children}
      </div>
    </div>
  );

  // ICS (Holo) icons tend to be simpler, blue accented, or flat with specific designs
  if (ics && !name.startsWith('sound') && !['battery', 'wifi', 'signal'].includes(name)) {
     // Simplified rendering for ICS mode overrides
     // Note: Real ICS icons were still detailed, but let's give them a "Holo" tint
  }

  switch (name) {
    // --- System Apps ---
    case 'phone': 
      return (
        <GingerIcon bgGradient={ics ? "bg-gradient-to-br from-[#0099CC] to-[#006699]" : "bg-gradient-to-br from-[#8CC63F] to-[#558B2F]"}>
          <Phone size={size * 0.6} className="text-white fill-current" />
        </GingerIcon>
      );
    case 'contacts': 
      return (
        <GingerIcon bgGradient={ics ? "bg-gradient-to-br from-[#0099CC] to-[#006699]" : "bg-gradient-to-br from-[#5D4037] to-[#3E2723]"} shape="rounded-t-md rounded-b-sm">
          <User size={size * 0.6} className={ics ? "text-white fill-white" : "text-blue-200 fill-blue-900"} />
        </GingerIcon>
      );
    case 'messages': 
      return (
        <GingerIcon bgGradient={ics ? "bg-gradient-to-br from-[#0099CC] to-[#006699]" : "bg-gradient-to-br from-[#7CB342] to-[#558B2F]"}>
          <MessageSquare size={size * 0.6} className="text-white fill-white" />
          {!ics && <div className="absolute -bottom-0.5 -right-0.5 text-[6px] font-bold bg-red-600 text-white px-0.5 rounded border border-white">1</div>}
        </GingerIcon>
      );
    case 'browser': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#4FC3F7] to-[#0288D1]">
          <Globe size={size * 0.6} className="text-white" />
        </GingerIcon>
      );
    case 'settings': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#78909C] to-[#455A64]">
          <Settings size={size * 0.6} className="text-gray-100" />
        </GingerIcon>
      );
    case 'recorder':
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#D84315] to-[#BF360C]">
           <Mic2 size={size * 0.6} className="text-white" />
        </GingerIcon>
      );
    case 'camera': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#424242] to-[#212121]">
          <div className="bg-gradient-to-b from-gray-700 to-black rounded-full p-1.5 border border-gray-500 shadow-inner">
             <Camera size={size * 0.4} className="text-gray-300" />
          </div>
        </GingerIcon>
      );
    case 'gallery': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#FFB74D] to-[#F57C00]">
          <ImageIcon size={size * 0.6} className="text-white rotate-[-5deg]" />
          <div className="absolute inset-0 border-[3px] border-white/20 rounded-md pointer-events-none"></div>
        </GingerIcon>
      );
    case 'music': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#FF7043] to-[#D84315]" shape="rounded-full">
          <Disc size={size * 0.6} className="text-white fill-current" />
        </GingerIcon>
      );
    case 'maps': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#42A5F5] to-[#1565C0]">
          <Map size={size * 0.6} className="text-white" />
          <div className="absolute bottom-0.5 right-0.5 text-red-500 font-bold text-[8px] drop-shadow-md">A</div>
        </GingerIcon>
      );
    case 'email': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#FFCA28] to-[#FF6F00]">
          <Mail size={size * 0.6} className="text-white fill-white/50" />
        </GingerIcon>
      );
    case 'calendar': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#26C6DA] to-[#00838F]">
          <Calendar size={size * 0.6} className="text-white" />
          <div className="absolute top-1.5 text-[6px] font-bold text-black/50">31</div>
        </GingerIcon>
      );
    case 'clock': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#5C6BC0] to-[#283593]">
          <Clock size={size * 0.6} className="text-white" />
        </GingerIcon>
      );
    case 'calculator': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#424242] to-[#000000]">
          <Calculator size={size * 0.6} className="text-[#A4C639]" />
        </GingerIcon>
      );
    case 'market': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#A4C639] to-[#689F38]">
          <ShoppingBag size={size * 0.6} className="text-white fill-white/90" />
        </GingerIcon>
      );

    // --- Third Party Apps ---
    case 'geometry': 
        return (
          <GingerIcon bgGradient="bg-gradient-to-br from-yellow-400 to-yellow-600">
             <div className="flex items-center justify-center">
                <Square size={size * 0.5} className="text-black fill-black" />
                <div className="absolute text-white font-bold text-[8px] bottom-0.5">DASH</div>
             </div>
          </GingerIcon>
        );
    case 'launcher44': 
      return (
        <div className="relative flex items-center justify-center bg-gradient-to-t from-gray-200 to-white rounded-full shadow-md border border-gray-300" style={{ width: size, height: size }}>
           <div className="bg-gradient-to-br from-blue-400 to-red-400 p-0.5 rounded-full">
             <HomeIcon size={size * 0.6} className="text-white drop-shadow-sm" />
           </div>
        </div>
      );
    case 'holo': 
      return (
        <div className="relative flex items-center justify-center bg-[#111] border border-[#33B5E5] rounded shadow-md" style={{ width: size, height: size }}>
             <HomeIcon size={size * 0.6} className="text-[#33B5E5] drop-shadow-[0_0_5px_rgba(51,181,229,0.8)]" />
        </div>
      );
    case 'magisk': 
      return (
        <div className="relative flex items-center justify-center bg-[#1f2d33] rounded-full border border-[#00e5bf] shadow-md" style={{ width: size, height: size }}>
           <Shield size={size * 0.6} className="text-[#00e5bf] drop-shadow-[0_0_5px_rgba(0,229,191,0.8)]" />
        </div>
      );
    case 'cydia': 
      return (
        <GingerIcon bgGradient="bg-[#8B4513] border-yellow-900">
           <div className="font-serif font-bold text-white text-lg italic drop-shadow-md">C</div>
        </GingerIcon>
      );
    case 'whatsapp': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#4CD964] to-[#2E7D32]" shape="rounded-lg">
          <Phone size={size * 0.6} className="text-white fill-white transform rotate-[-10deg]" />
        </GingerIcon>
      );
    case 'vk': 
      return (
        <GingerIcon bgGradient="bg-gradient-to-br from-[#5181b8] to-[#345376]" shape="rounded-md">
          <span className="font-bold text-white text-xs">VK</span>
        </GingerIcon>
      );
    case 'gemini': 
      return (
        <div className="relative flex items-center justify-center rounded-md bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 shadow-md border-t border-white/40 border-b border-black/50" style={{ width: size, height: size }}>
          <Bot size={size * 0.6} className="text-white drop-shadow-md relative z-10" />
        </div>
      );
    
    // --- UI Icons ---
    case 'search': return <Search {...commonProps} />;
    case 'wifi': return <Wifi {...commonProps} />;
    case 'battery': return <Battery {...commonProps} />;
    case 'battery-charging': return <BatteryCharging {...commonProps} />;
    case 'signal': return <Signal {...commonProps} />;
    case 'back': return <ArrowLeft {...commonProps} />;
    case 'menu': return <MenuIcon {...commonProps} />;
    case 'home': return <HomeIcon {...commonProps} />;
    case 'user': return <User {...commonProps} />;
    case 'video': return <Video {...commonProps} />;
    case 'close': return <X {...commonProps} />;
    case 'play': return <Play {...commonProps} />;
    case 'pause': return <Pause {...commonProps} />;
    case 'skip-fwd': return <SkipForward {...commonProps} />;
    case 'skip-back': return <SkipBack {...commonProps} />;
    case 'send': return <Send {...commonProps} />;
    case 'refresh': return <RefreshCw {...commonProps} />;
    case 'lock': return <Lock {...commonProps} />;
    case 'unlock': return <Unlock {...commonProps} />;
    case 'list': return <List {...commonProps} />;
    case 'star': return <Star {...commonProps} />;
    case 'mic': return <Mic {...commonProps} />;
    case 'hard-drive': return <HardDrive {...commonProps} />;
    case 'sliders': return <Sliders {...commonProps} />;
    case 'info': return <Info {...commonProps} />;
    
    // Sound Profiles
    case 'sound-normal': return <Volume2 {...commonProps} />;
    case 'sound-silent': return <VolumeX {...commonProps} />;
    case 'sound-vibrate': return <Smartphone {...commonProps} />;
    
    case 'plus': return <div className="text-2xl font-bold leading-none text-white drop-shadow-md">+</div>;
    case 'circle': return <div className="rounded-full bg-gray-500 w-full h-full border border-white/30 shadow-inner"></div>;

    default: return <div className={`bg-gray-500 rounded-md ${className}`} style={{width: size, height: size}} />;
  }
};
