
import React, { useEffect, useContext } from 'react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { toast } from '@/components/ui/use-toast';
import { JarvisChatContext } from '@/contexts/JarvisChatProvider';
import { getNewsResponse } from '@/services/newsService';
import { processFileManagerCommand } from '@/services/fileManagerService';
import { processCalculation } from '@/services/calculatorService';
import { processWorldClockQuery, isWorldClockQuery } from '@/services/worldClockService';

interface JarvisVoiceCommandsProps {
  isListening: boolean;
  hackerModeActive?: boolean;
  onActivateHacker?: () => void;
}

const JarvisVoiceCommands: React.FC<JarvisVoiceCommandsProps> = ({ 
  isListening, 
  hackerModeActive = false,
  onActivateHacker
}) => {
  const { registerCommand, unregisterCommand } = useVoiceCommands(isListening);
  
  // Get chat context for messaging
  const jarvisChat = useContext(JarvisChatContext);
  const sendMessage = jarvisChat?.sendMessage;
  
  useEffect(() => {
    // Security commands
    registerCommand('securityScan', {
      pattern: /(run security scan|scan security|security scan)/i,
      handler: () => {
        if (window.JARVIS && window.JARVIS.security) {
          window.JARVIS.security.scan();
        }
        
        toast({
          title: "Security Scan",
          description: "Running security scan...",
        });
      },
      feedback: "Initiating security scan of all systems."
    });
    
    // Emergency mode
    registerCommand('emergencyMode', {
      pattern: /(emergency mode|activate emergency|emergency protocol)/i,
      handler: () => {
        if (window.JARVIS && window.JARVIS.security) {
          window.JARVIS.security.setEmergencyMode();
        }
        
        toast({
          title: "EMERGENCY MODE",
          description: "Emergency protocols activated!",
          variant: "destructive",
        });
      },
      feedback: "Emergency mode activated. All systems on high alert."
    });
    
    // Hacker mode
    registerCommand('hackerMode', {
      pattern: /(hacker mode|activate hacker|hacking mode|launch hacker)/i,
      handler: () => {
        if (onActivateHacker) {
          onActivateHacker();
        }
        
        toast({
          title: "HACKER MODE",
          description: "Initializing hacker mode...",
          variant: "default",
        });
      },
      feedback: "Hacker mode initialized. Security systems engaged."
    });
    
    // System updates
    registerCommand('checkUpdates', {
      pattern: /(check for updates|system updates|update status)/i,
      handler: () => {
        if (window.JARVIS && window.JARVIS.system) {
          const updateStatus = window.JARVIS.system.getUpdateStatus();
          
          let updateMessage = "System update status: ";
          Object.entries(updateStatus).forEach(([module, status]) => {
            updateMessage += `${module}: ${status}. `;
          });
          
          toast({
            title: "System Updates",
            description: updateMessage,
          });
        }
      },
      feedback: "Checking for system updates."
    });
    
    // World news command
    registerCommand('worldNews', {
      pattern: /(world news|global news|what's happening|news headlines|latest news)/i,
      handler: async () => {
        if (sendMessage) {
          await sendMessage("Show me the latest world news");
        } else {
          // Fallback if context not available
          const response = await getNewsResponse("world news");
          toast({
            title: "World News Headlines",
            description: response.text.substring(0, 100) + "...",
          });
        }
      },
      feedback: "Fetching the latest world news headlines."
    });
    
    // Tech news command
    registerCommand('techNews', {
      pattern: /(tech news|technology news|tech updates)/i,
      handler: async () => {
        if (sendMessage) {
          await sendMessage("Show me the latest tech news");
        } else {
          // Fallback if context not available
          const response = await getNewsResponse("tech news");
          toast({
            title: "Technology News",
            description: response.text.substring(0, 100) + "...",
          });
        }
      },
      feedback: "Fetching the latest technology news."
    });
    
    // India news command
    registerCommand('indiaNews', {
      pattern: /(india news|indian news|news from india)/i,
      handler: async () => {
        if (sendMessage) {
          await sendMessage("Show me the latest news from India");
        } else {
          // Fallback if context not available
          const response = await getNewsResponse("news in India");
          toast({
            title: "India News",
            description: response.text.substring(0, 100) + "...",
          });
        }
      },
      feedback: "Fetching the latest news from India."
    });
    
    // Custom topic news command
    registerCommand('customNews', {
      pattern: /news (about|on) ([a-zA-Z\s]+)/i,
      handler: async (transcript) => {
        const match = transcript.match(/news (about|on) ([a-zA-Z\s]+)/i);
        if (match && match[2]) {
          const topic = match[2].trim();
          if (sendMessage) {
            await sendMessage(`Show me news about ${topic}`);
          } else {
            // Fallback if context not available
            const response = await getNewsResponse(`news on ${topic}`);
            toast({
              title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} News`,
              description: response.text.substring(0, 100) + "...",
            });
          }
        }
      },
      feedback: "Searching for news on your requested topic."
    });
    
    // File management commands
    registerCommand('fileManager', {
      pattern: /(open|create|rename|move|delete|list) (file|folder|document)/i,
      handler: async (transcript) => {
        const response = processFileManagerCommand(transcript);
        if (response) {
          if (sendMessage) {
            await sendMessage(transcript);
          } else {
            toast({
              title: "File Manager",
              description: response.message,
              variant: response.success ? "default" : "destructive"
            });
          }
        }
      },
      feedback: "Processing file management request."
    });
    
    // Calculator commands
    registerCommand('calculator', {
      pattern: /(calculate|compute|what is|\d+\s*[\+\-\*\/]\s*\d+|convert)/i,
      handler: async (transcript) => {
        const result = processCalculation(transcript);
        if (sendMessage) {
          await sendMessage(transcript);
        } else {
          toast({
            title: "Calculator",
            description: result.error || `${result.expression} = ${result.result}`,
            variant: result.error ? "destructive" : "default"
          });
        }
      },
      feedback: "Calculating your request."
    });
    
    // World clock commands
    registerCommand('worldClock', {
      pattern: /(time|clock) in ([a-zA-Z\s]+)/i,
      handler: async (transcript) => {
        if (isWorldClockQuery(transcript)) {
          const worldClockResult = processWorldClockQuery(transcript);
          
          if (sendMessage) {
            await sendMessage(transcript);
          } else if (worldClockResult) {
            toast({
              title: `Time in ${worldClockResult.location}`,
              description: `${worldClockResult.time} (${worldClockResult.date})`,
            });
          }
        }
      },
      feedback: "Checking world clock information."
    });
    
    // Chat history commands
    registerCommand('chatHistory', {
      pattern: /(show|get) (my|the) (chat history|past questions|conversations|previous)/i,
      handler: async () => {
        if (sendMessage) {
          await sendMessage("Show my chat history");
        } else {
          toast({
            title: "Chat History",
            description: "Retrieving your chat history...",
          });
        }
      },
      feedback: "Retrieving your chat history."
    });
    
    return () => {
      // Cleanup
      unregisterCommand('securityScan');
      unregisterCommand('emergencyMode');
      unregisterCommand('hackerMode');
      unregisterCommand('checkUpdates');
      unregisterCommand('worldNews');
      unregisterCommand('techNews');
      unregisterCommand('indiaNews');
      unregisterCommand('customNews');
      unregisterCommand('fileManager');
      unregisterCommand('calculator');
      unregisterCommand('worldClock');
      unregisterCommand('chatHistory');
    };
  }, [registerCommand, unregisterCommand, hackerModeActive, onActivateHacker, sendMessage]);
  
  return null; // This is a non-visual component
};

export default JarvisVoiceCommands;
