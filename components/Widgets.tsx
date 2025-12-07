import React, { useState, useEffect } from 'react';
import { AppIcon } from './Icon';
import { WidgetInstance } from '../types';

interface WidgetProps {
  data: WidgetInstance;
  onRemove: () => void;
}

export const SearchWidget: React.FC<WidgetProps> = ({ onRemove }) => {
  return (
    <div className="w-full h-12 bg-white/10 backdrop-blur-sm rounded-sm border border-white/20 flex items-center px-2 shadow-lg relative group mb-4">
      <AppIcon name="gemini" size={24} className="text-white mr-2" />
      <div className="flex-1 text-white/50 italic text-sm font-serif">Google Search...</div>
      <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <AppIcon name="close" size={10} className="text-white" />
      </button>
    </div>
  );
};

export const AnalogClockWidget: React.FC<WidgetProps> = ({ onRemove }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const secondsRatio = time.getSeconds() / 60;
  const minutesRatio = (secondsRatio + time.getMinutes()) / 60;
  const hoursRatio = (minutesRatio + time.getHours()) / 12;

  return (
    <div className="w-32 h-32 relative mx-auto my-4 group">
       <div className="w-full h-full rounded-full border-4 border-gray-300 bg-white/10 backdrop-blur-md shadow-2xl relative">
          {/* Clock Face Markers */}
          {[...Array(12)].map((_, i) => (
             <div key={i} className="absolute w-1 h-2 bg-white left-1/2 top-1 origin-bottom transform -translate-x-1/2" style={{ transform: `translateX(-50%) rotate(${i * 30}deg) translateY(2px)` }} />
          ))}
          
          {/* Hands */}
          <div className="absolute left-1/2 bottom-1/2 w-1 h-8 bg-black origin-bottom transform -translate-x-1/2 rounded-full" style={{ transform: `translateX(-50%) rotate(${hoursRatio * 360}deg)` }} />
          <div className="absolute left-1/2 bottom-1/2 w-0.5 h-12 bg-black origin-bottom transform -translate-x-1/2 rounded-full" style={{ transform: `translateX(-50%) rotate(${minutesRatio * 360}deg)` }} />
          <div className="absolute left-1/2 bottom-1/2 w-0.5 h-14 bg-red-600 origin-bottom transform -translate-x-1/2" style={{ transform: `translateX(-50%) rotate(${secondsRatio * 360}deg)` }} />
          
          <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm" />
       </div>
       <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <AppIcon name="close" size={10} className="text-white" />
      </button>
    </div>
  );
};

export const PowerControlWidget: React.FC<WidgetProps> = ({ onRemove }) => {
  const [toggles, setToggles] = useState([true, false, true, false, true]);
  const icons = ['wifi', 'bluetooth', 'gps', 'sync', 'sun']; // Mapped in Icon.tsx or generic
  
  const toggle = (i: number) => {
    const newToggles = [...toggles];
    newToggles[i] = !newToggles[i];
    setToggles(newToggles);
  };

  return (
    <div className="w-full h-14 bg-[#111] border border-[#333] rounded-sm shadow-lg flex divide-x divide-[#333] relative group mb-4">
      {icons.map((icon, i) => (
        <button 
          key={i} 
          onClick={() => toggle(i)}
          className={`flex-1 flex items-center justify-center transition-colors ${toggles[i] ? 'bg-[#A4C639]' : 'bg-[#111]'}`}
        >
          <AppIcon name={icon === 'bluetooth' ? 'signal' : icon === 'gps' ? 'map' : icon === 'sync' ? 'refresh' : icon === 'sun' ? 'settings' : icon} size={20} className={toggles[i] ? 'text-black' : 'text-gray-500'} />
        </button>
      ))}
       <button onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <AppIcon name="close" size={10} className="text-white" />
      </button>
    </div>
  );
};
