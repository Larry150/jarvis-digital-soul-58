
import { getTimeCalendarResponse } from './timeCalendarService';
import { getWeatherResponse } from './weatherService';
import { getNewsResponse } from './newsService';
import { getDailyBriefing } from './dailyBriefingService';
import { processCalculation, isCalculationRequest } from './calculatorService';
import { processWorldClockQuery, isWorldClockQuery } from './worldClockService';
import { processHistoryQuery } from './chatHistoryService';
import { toast } from '@/components/ui/use-toast';

export interface SkillResponse {
  text: string;
  shouldSpeak?: boolean;
  data?: any;
  skillType?: string;
}

// Check if a message is a skill command
export const isSkillCommand = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  
  const matchResult = Boolean(lowerMessage.match(/what('s| is) happening/i));
  
  return (
    // Time related
    lowerMessage.includes('what time') || 
    lowerMessage.includes('current time') ||
    lowerMessage.includes('what is the time') ||
    isWorldClockQuery(message) ||
    
    // Date related
    lowerMessage.includes('what day') ||
    lowerMessage.includes('today\'s date') || 
    lowerMessage.includes('what is the date') ||
    lowerMessage.includes('what is today') ||
    
    // Weather related
    lowerMessage.includes('weather') ||
    lowerMessage.includes('temperature') ||
    lowerMessage.includes('forecast') ||
    
    // News related
    lowerMessage.includes('news') ||
    lowerMessage.includes('headlines') ||
    lowerMessage.includes('updates') ||
    matchResult ||
    
    // Briefing related
    lowerMessage.includes('brief me') ||
    lowerMessage.includes('daily briefing') ||
    lowerMessage.includes('morning update') ||
    lowerMessage.includes('summary for today') ||
    
    // Calendar related
    lowerMessage.includes('schedule') ||
    lowerMessage.includes('calendar') ||
    lowerMessage.includes('events') ||
    
    // Calculator related
    isCalculationRequest(message) ||
    
    // Chat history related
    lowerMessage.includes('chat history') ||
    lowerMessage.includes('past questions') ||
    lowerMessage.includes('asked earlier') ||
    lowerMessage.includes('previous conversations')
  );
};

// Process a skill command and return appropriate response
export const processSkillCommand = async (message: string): Promise<SkillResponse> => {
  const lowerMessage = message.toLowerCase();
  
  try {
    // Time and Calendar Commands
    if (
      lowerMessage.includes('time') || 
      lowerMessage.includes('date') || 
      lowerMessage.includes('day') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('calendar') ||
      lowerMessage.includes('events')
    ) {
      // Check for world clock query first
      if (isWorldClockQuery(message)) {
        const worldClockResponse = processWorldClockQuery(message);
        if (worldClockResponse) {
          return {
            text: `The current time in ${worldClockResponse.location} is ${worldClockResponse.time} (${worldClockResponse.date}). It's currently ${worldClockResponse.dayPeriod} there.`,
            shouldSpeak: true,
            data: worldClockResponse,
            skillType: 'worldClock'
          };
        }
      }
      
      // Default time calendar response
      const response = await getTimeCalendarResponse(message);
      return {
        text: response.text,
        shouldSpeak: true,
        data: response.data,
        skillType: 'timeCalendar'
      };
    }
    
    // Weather Commands
    if (
      lowerMessage.includes('weather') ||
      lowerMessage.includes('temperature') ||
      lowerMessage.includes('forecast')
    ) {
      const response = await getWeatherResponse(message);
      return {
        text: response.text,
        shouldSpeak: true,
        data: response.data,
        skillType: 'weather'
      };
    }
    
    // News Commands
    if (
      lowerMessage.includes('news') || 
      lowerMessage.includes('headlines') ||
      lowerMessage.includes('updates') ||
      Boolean(lowerMessage.match(/what('s| is) happening/i))
    ) {
      const response = await getNewsResponse(message);
      return {
        text: response.text,
        shouldSpeak: true,
        data: response.articles,
        skillType: 'news'
      };
    }
    
    // Daily Briefing
    if (
      lowerMessage.includes('brief me') ||
      lowerMessage.includes('daily briefing') ||
      lowerMessage.includes('morning update') ||
      lowerMessage.includes('summary for today')
    ) {
      const response = await getDailyBriefing();
      return {
        text: response.text,
        shouldSpeak: true,
        data: response.briefing,
        skillType: 'briefing'
      };
    }
    
    // Calculator
    if (isCalculationRequest(message)) {
      const calculationResult = processCalculation(message);
      
      let responseText = '';
      if (calculationResult.error) {
        responseText = `I couldn't calculate that. ${calculationResult.error}`;
      } else {
        responseText = `The result of ${calculationResult.expression} is ${calculationResult.result}`;
        if (calculationResult.steps) {
          responseText += `. Here are the steps: ${calculationResult.steps.join(', ')}`;
        }
      }
      
      return {
        text: responseText,
        shouldSpeak: true,
        data: calculationResult,
        skillType: 'calculator'
      };
    }
    
    // Chat History
    const historyResponse = processHistoryQuery(message);
    if (historyResponse) {
      return {
        text: historyResponse[0].content,
        shouldSpeak: true,
        data: historyResponse[0].data,
        skillType: 'history'
      };
    }
    
    // Default fallback
    return {
      text: "I'm not sure how to process that command.",
      shouldSpeak: false
    };
  } catch (error) {
    console.error('Error processing skill command:', error);
    toast({
      title: "Error",
      description: "Failed to process your command.",
      variant: "destructive",
    });
    
    return {
      text: "I apologize, but I encountered an error while processing your request.",
      shouldSpeak: true
    };
  }
};
