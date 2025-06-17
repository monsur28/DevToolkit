'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Activity, 
  MessageSquare, 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Send,
  LogOut,
  Settings,
  BarChart3,
  Calendar,
  Zap,
  Brain
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserData {
  _id: string;
  email: string;
  role: string;
  usage: {
    dailyCount: number;
    monthlyCount: number;
    totalCount: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
  status: {
    isActive: boolean;
    isSuspended: boolean;
  };
  profile: {
    firstName?: string;
    lastName?: string;
  };
  subscription: {
    plan: string;
  };
}

interface UsageHistory {
  _id: string;
  toolName: string;
  timestamp: string;
  success: boolean;
}

interface Suggestion {
  _id: string;
  type: 'feature' | 'improvement' | 'bug' | 'feedback';
  category: 'tool' | 'ui' | 'performance' | 'general';
  title: string;
  description: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'implemented';
  adminResponse?: {
    message: string;
    respondedAt: string;
  };
  metadata: {
    createdAt: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestionType, setSuggestionType] = useState<'feature' | 'improvement' | 'bug' | 'feedback'>('feature');
  const [suggestionCategory, setSuggestionCategory] = useState<'tool' | 'ui' | 'performance' | 'general'>('tool');
  const [suggestionTitle, setSuggestionTitle] = useState('');
  const [suggestionContent, setSuggestionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      // Get user data from token
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Fetch user details
      const userResponse = await fetch(`/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const userData = await userResponse.json();
      if (userData.success) {
        setUser(userData.user);
      } else {
        throw new Error(userData.message || 'Failed to fetch user data');
      }
      
      // Fetch usage history
      const usageResponse = await fetch('/api/user/usage-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!usageResponse.ok) {
        throw new Error('Failed to fetch usage history');
      }
      
      const usageData = await usageResponse.json();
      if (usageData.success) {
        setUsageHistory(usageData.history);
      }

      // Fetch suggestions
      const suggestionsResponse = await fetch('/api/user/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!suggestionsResponse.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const suggestionsData = await suggestionsResponse.json();
      if (suggestionsData.success) {
        setSuggestions(suggestionsData.suggestions);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
      
      // If there's an authentication error, redirect to login
      if (error instanceof Error && error.message.includes('token')) {
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionTitle.trim() || !suggestionContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch('/api/user/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: suggestionType,
          category: suggestionCategory,
          title: suggestionTitle,
          description: suggestionContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit suggestion');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `${suggestionType === 'feature' ? 'Feature request' : suggestionType} submitted successfully!`
        });
        setSuggestionTitle('');
        setSuggestionContent('');
        
        // Refresh suggestions
        const token = localStorage.getItem('token');
        if (token) {
          const suggestionsResponse = await fetch('/api/user/suggestions', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (suggestionsResponse.ok) {
            const suggestionsData = await suggestionsResponse.json();
            if (suggestionsData.success) {
              setSuggestions(suggestionsData.suggestions);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Failed to submit suggestion');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit suggestion",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to invalidate server-side session
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      // Clear client-side storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'implemented': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-green-100 text-green-800 border-green-200';
      case 'improvement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'bug': return 'bg-red-100 text-red-800 border-red-200';
      case 'feedback': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tool': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ui': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'performance': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'general': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUsagePercentage = () => {
    if (!user) return 0;
    return Math.round((user.usage.dailyCount / user.usage.dailyLimit) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {user.profile.firstName || user.email.split('@')[0]}!</h1>
              <p className="text-muted-foreground">Manage your AI tools usage and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/tools')}>
                <Brain className="h-4 w-4 mr-2" />
                Use AI Tools
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Daily Usage</p>
                    <p className="text-2xl font-bold">{user.usage.dailyCount}/{user.usage.dailyLimit}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getUsagePercentage()}% used</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Usage</p>
                    <p className="text-2xl font-bold">{user.usage.monthlyCount}/{user.usage.monthlyLimit}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((user.usage.monthlyCount / user.usage.monthlyLimit) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((user.usage.monthlyCount / user.usage.monthlyLimit) * 100)}% used
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Suggestions</p>
                    <p className="text-2xl font-bold">{suggestions.length}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-amber-500" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Pending: {suggestions.filter(s => s.status === 'pending').length}</span>
                    <span>Implemented: {suggestions.filter(s => s.status === 'implemented').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                    <p className="text-lg font-semibold text-green-600">
                      {user.status.isActive ? 'Active' : 'Inactive'}
                      {user.status.isSuspended && ' (Suspended)'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">{user.subscription.plan} Plan</Badge>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">
                    {user.subscription.plan === 'free' ? 
                      'Upgrade to Pro for increased usage limits and premium features' : 
                      'Thank you for being a premium subscriber!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="usage" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="usage">Usage History</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions & Feedback</TabsTrigger>
              <TabsTrigger value="submit">Submit New</TabsTrigger>
            </TabsList>

            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Usage History
                  </CardTitle>
                  <CardDescription>Your recent AI tool usage sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {usageHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No usage history yet</p>
                      <Button asChild className="mt-4">
                        <a href="/tools">Start Using AI Tools</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {usageHistory.slice(0, 10).map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${item.success ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <p className="font-medium">{item.toolName}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(item.timestamp)}
                              </p>
                            </div>
                          </div>
                          <Badge variant={item.success ? 'default' : 'destructive'}>
                            {item.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Your Suggestions & Feedback
                  </CardTitle>
                  <CardDescription>Track your submitted suggestions and admin responses</CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No suggestions submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion._id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(suggestion.status)}>
                                {suggestion.status}
                              </Badge>
                              <Badge className={getTypeColor(suggestion.type)}>
                                {suggestion.type}
                              </Badge>
                              <Badge className={getCategoryColor(suggestion.category)}>
                                {suggestion.category}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(suggestion.metadata.createdAt)}
                            </span>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                          </div>
                          
                          {suggestion.adminResponse && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-center mb-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span className="text-sm font-medium">Admin Response</span>
                                {suggestion.adminResponse.respondedAt && (
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {formatDate(suggestion.adminResponse.respondedAt)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{suggestion.adminResponse.message}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submit">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="h-5 w-5 mr-2" />
                    Submit Suggestion or Feedback
                  </CardTitle>
                  <CardDescription>Help us improve DevToolkit with your ideas and feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select value={suggestionType} onValueChange={(value: any) => setSuggestionType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="improvement">Improvement</SelectItem>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="feedback">General Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={suggestionCategory} onValueChange={(value: any) => setSuggestionCategory(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tool">Tool Specific</SelectItem>
                            <SelectItem value="ui">User Interface</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        placeholder={suggestionType === 'feature' ? 'e.g., Add a CSS Minifier Tool' : 
                                    suggestionType === 'bug' ? 'e.g., SQL Generator produces incorrect syntax' :
                                    'e.g., Improve UI Performance'}
                        value={suggestionTitle}
                        onChange={(e) => setSuggestionTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder={suggestionType === 'feature' 
                          ? 'Describe the feature you\'d like to see added and how it would be useful...'
                          : suggestionType === 'bug'
                          ? 'Describe the bug, steps to reproduce, and expected behavior...'
                          : 'Share your feedback about the platform, tools, or user experience...'
                        }
                        value={suggestionContent}
                        onChange={(e) => setSuggestionContent(e.target.value)}
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="h-4 w-4 mr-2" />
                          Submit {suggestionType === 'feature' ? 'Feature Request' : 
                                  suggestionType === 'improvement' ? 'Improvement' :
                                  suggestionType === 'bug' ? 'Bug Report' : 'Feedback'}
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}