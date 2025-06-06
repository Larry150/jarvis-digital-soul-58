
import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import IronManBackground from './chat/IronManBackground';

interface VoiceActivationProps {
  onCommandReceived?: (command: string) => void;
  isListening?: boolean;
  toggleListening?: () => void;
  isSpeaking?: boolean;
  hackerMode?: boolean;
}

const VoiceActivation: React.FC<VoiceActivationProps> = ({
  onCommandReceived,
  isListening = false,
  toggleListening = () => {},
  isSpeaking = false,
  hackerMode = false
}) => {
  // The Iron Man should glow when Jarvis is speaking or actively processing
  const isJarvisActive = isSpeaking;
  
  return (
    <div className="flex flex-col items-center gap-3 relative">
      {/* Iron Man Background positioned to fill the space */}
      <div className="mb-4 relative w-full h-40">
        <IronManBackground isGlowing={isJarvisActive} hackerMode={hackerMode} />
      </div>
      
      <button
        onClick={toggleListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          hackerMode 
            ? `${isListening ? 'bg-red-500/30 border-2 border-red-500' : 'bg-black/30 border border-red-500/30'}`
            : `${isListening ? 'bg-[#33c3f0]/30 border-2 border-[#33c3f0]' : 'bg-black/30 border border-[#33c3f0]/30'}`
        }`}
      >
        {isListening ? (
          <Mic className={`h-6 w-6 ${hackerMode ? 'text-red-400' : 'text-white'} animate-pulse`} />
        ) : (
          <MicOff className={`h-6 w-6 ${hackerMode ? 'text-red-400/50' : 'text-white/50'}`} />
        )}
      </button>
      
      {isSpeaking && (
        <div className="flex items-center space-x-1 mt-2">
          <div className={`h-1 w-1 ${hackerMode ? 'bg-red-400' : 'bg-white'} rounded-full animate-pulse`}></div>
          <div className={`h-1 w-1 ${hackerMode ? 'bg-red-400' : 'bg-white'} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
          <div className={`h-1 w-1 ${hackerMode ? 'bg-red-400' : 'bg-white'} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
      
      <div className={`text-xs ${hackerMode ? 'text-red-400/70' : 'text-white/70'}`}>
        {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Click to activate"}
      </div>
    </div>
  );
};

export default VoiceActivation;
