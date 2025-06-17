'use client';

import { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Brain, Send, Trash2, BookOpen, Lightbulb, Code, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GeminiAPI } from '@/lib/gemini';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UsageStats {
  questionsToday: number;
  questionsThisMinute: number;
  dailyLimit: number;
  minuteLimit: number;
}

export default function LearningAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats>({
    questionsToday: 0,
    questionsThisMinute: 0,
    dailyLimit: 50,
    minuteLimit: 3
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const quickQuestions = [
    "What is the difference between let, const, and var in JavaScript?",
    "How does React's useEffect hook work?",
    "Explain the concept of closures in JavaScript",
    "What are the benefits of TypeScript over JavaScript?",
    "How do I optimize React component performance?",
    "What is the difference between SQL and NoSQL databases?",
    "Explain REST API best practices",
    "How does CSS Grid differ from Flexbox?",
  ];

  useEffect(() => {
    // Load usage stats from localStorage
    const today = new Date().toDateString();
    const currentMinute = Math.floor(Date.now() / 60000);
    
    const savedStats = localStorage.getItem('learning-assistant-usage');
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        if (parsed.date === today) {
          setUsageStats(prev => ({
            ...prev,
            questionsToday: parsed.questionsToday || 0,
            questionsThisMinute: parsed.minute === currentMinute ? (parsed.questionsThisMinute || 0) : 0
          }));
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateUsageStats = () => {
    const today = new Date().toDateString();
    const currentMinute = Math.floor(Date.now() / 60000);
    
    setUsageStats(prev => {
      const newStats = {
        questionsToday: prev.questionsToday + 1,
        questionsThisMinute: prev.minute === currentMinute ? prev.questionsThisMinute + 1 : 1,
        dailyLimit: prev.dailyLimit,
        minuteLimit: prev.minuteLimit,
        minute: currentMinute
      };
      
      // Save to localStorage
      localStorage.setItem('learning-assistant-usage', JSON.stringify({
        date: today,
        minute: currentMinute,
        ...newStats
      }));
      
      return newStats;
    });
  };

  const canAskQuestion = () => {
    const currentMinute = Math.floor(Date.now() / 60000);
    const isNewMinute = currentMinute !== usageStats.minute;
    
    return usageStats.questionsToday < usageStats.dailyLimit && 
           (isNewMinute || usageStats.questionsThisMinute < usageStats.minuteLimit);
  };

  const askQuestion = async (question: string) => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive"
      });
      return;
    }

    if (!canAskQuestion()) {
      toast({
        title: "Rate Limit Reached",
        description: usageStats.questionsThisMinute >= usageStats.minuteLimit 
          ? "You've reached the per-minute limit. Please wait a moment."
          : "You've reached the daily question limit.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    updateUsageStats();

    try {
      const gemini = new GeminiAPI();
      const response = await gemini.answerTechQuestion(question);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion(input);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ToolLayout
      title="Learning Assistant"
      description="Ask tech questions and get AI-powered explanations with daily usage limits"
      icon={<Brain className="h-8 w-8 text-purple-500" />}
    >
      <div className="space-y-6">
        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2 text-amber-500" />
              Usage Statistics
            </CardTitle>
            <CardDescription>Track your daily learning progress and rate limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{usageStats.questionsToday}</div>
                <div className="text-sm text-muted-foreground">Questions Today</div>
                <div className="text-xs text-muted-foreground">Limit: {usageStats.dailyLimit}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{usageStats.questionsThisMinute}</div>
                <div className="text-sm text-muted-foreground">This Minute</div>
                <div className="text-xs text-muted-foreground">Limit: {usageStats.minuteLimit}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{usageStats.dailyLimit - usageStats.questionsToday}</div>
                <div className="text-sm text-muted-foreground">Remaining Today</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${canAskQuestion() ? 'text-green-600' : 'text-red-600'}`}>
                  {canAskQuestion() ? '✓' : '✗'}
                </div>
                <div className="text-sm text-muted-foreground">Can Ask</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Learning Chat
                </CardTitle>
                <CardDescription>Ask any programming or technology question</CardDescription>
              </div>
              {messages.length > 0 && (
                <Button onClick={clearChat} size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="h-96 overflow-y-auto border rounded-lg p-4 mb-4 space-y-4 bg-muted/30">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ask me anything about programming, web development, or technology!</p>
                  <p className="text-sm mt-2">Try one of the quick questions below to get started.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {message.type === 'user' ? 'You' : 'AI Assistant'}
                        </Badge>
                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Ask a programming or technology question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || !canAskQuestion()}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !canAskQuestion() || !input.trim()}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Quick Questions */}
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Quick Questions:</h4>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => askQuestion(question)}
                    disabled={isLoading || !canAskQuestion()}
                    className="text-xs"
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {question.length > 30 ? question.substring(0, 30) + '...' : question}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Resources</CardTitle>
            <CardDescription>Recommended resources for developers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <Code className="h-4 w-4 mr-2 text-blue-500" />
                  Documentation
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <a href="https://developer.mozilla.org/en-US/" target="_blank" rel="noopener noreferrer" className="hover:underline">MDN Web Docs</a></li>
                  <li>• <a href="https://reactjs.org/docs/getting-started.html" target="_blank" rel="noopener noreferrer" className="hover:underline">React Documentation</a></li>
                  <li>• <a href="https://docs.python.org/3/" target="_blank" rel="noopener noreferrer" className="hover:underline">Python Documentation</a></li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                  Learning Platforms
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <a href="https://www.freecodecamp.org/" target="_blank" rel="noopener noreferrer" className="hover:underline">freeCodeCamp</a></li>
                  <li>• <a href="https://www.codecademy.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Codecademy</a></li>
                  <li>• <a href="https://www.udemy.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Udemy</a></li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                  Community
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <a href="https://stackoverflow.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Stack Overflow</a></li>
                  <li>• <a href="https://dev.to/" target="_blank" rel="noopener noreferrer" className="hover:underline">DEV Community</a></li>
                  <li>• <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}