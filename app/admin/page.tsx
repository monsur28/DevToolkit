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
  Users, 
  Activity, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Send,
  LogOut,
  Settings,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Mail
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface User {
  id: string;
  email: string;
  role: string;
  usageCount: number;
  dailyUsageLimit: number;
  monthlyUsageLimit: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  totalUsage: number;
  toolUsage: Record<string, number>;
  recentUsage: any[];
}

interface Suggestion {
  id: string;
  userId: string;
  userEmail?: string;
  type: 'suggestion' | 'feedback';
  title: string;
  content: string;
  status: 'pending' | 'reviewed' | 'implemented';
  adminResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all users
      const usersResponse = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

      // Fetch suggestions
      const suggestionsResponse = await fetch('/api/admin/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const suggestionsData = await suggestionsResponse.json();
      if (suggestionsData.success) {
        setSuggestions(suggestionsData.suggestions);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, isActive })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `User ${isActive ? 'activated' : 'suspended'} successfully`
        });
        fetchAdminData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateUserLimits = async (userId: string, dailyLimit: number, monthlyLimit: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users/limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, dailyLimit, monthlyLimit })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'User limits updated successfully'
        });
        fetchAdminData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user limits',
        variant: 'destructive'
      });
    }
  };

  const handleRespondToSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuggestion || !adminResponse.trim()) return;

    setIsResponding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/suggestions/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          suggestionId: selectedSuggestion.id,
          adminResponse
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Response sent successfully'
        });
        setSelectedSuggestion(null);
        setAdminResponse('');
        fetchAdminData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send response',
        variant: 'destructive'
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'implemented': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, analytics, and platform settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/tools')}>
                <Eye className="h-4 w-4 mr-2" />
                View Platform
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{analytics.activeUsers}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total API Usage</p>
                    <p className="text-2xl font-bold">{analytics.totalUsage}</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Suggestions</p>
                    <p className="text-2xl font-bold">{suggestions.filter(s => s.status === 'pending').length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Tool Usage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.toolUsage).map(([tool, count]) => (
                        <div key={tool} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{tool}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.min((count / Math.max(...Object.values(analytics.toolUsage))) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.recentUsage.slice(0, 10).map((usage, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{usage.toolName}</span>
                          <span className="text-muted-foreground">
                            {new Date(usage.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    User Management
                  </CardTitle>
                  <CardDescription>Manage user accounts, limits, and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-sm text-muted-foreground">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                              {user.isVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Active' : 'Suspended'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium">Usage: {user.usageCount}/{user.dailyUsageLimit}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.min((user.usageCount / user.dailyUsageLimit) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={(checked) => handleUserStatusToggle(user.id, checked)}
                            />
                            <span className="text-sm">Active</span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              placeholder="Daily limit"
                              defaultValue={user.dailyUsageLimit}
                              className="w-20"
                              onBlur={(e) => {
                                const dailyLimit = parseInt(e.target.value);
                                if (dailyLimit !== user.dailyUsageLimit) {
                                  handleUpdateUserLimits(user.id, dailyLimit, user.monthlyUsageLimit);
                                }
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Monthly limit"
                              defaultValue={user.monthlyUsageLimit}
                              className="w-24"
                              onBlur={(e) => {
                                const monthlyLimit = parseInt(e.target.value);
                                if (monthlyLimit !== user.monthlyUsageLimit) {
                                  handleUpdateUserLimits(user.id, user.dailyUsageLimit, monthlyLimit);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      User Suggestions & Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {suggestions.map((suggestion) => (
                        <div 
                          key={suggestion.id} 
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedSuggestion?.id === suggestion.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedSuggestion(suggestion)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(suggestion.status)}>
                                {suggestion.status}
                              </Badge>
                              <Badge variant="outline">
                                {suggestion.type}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(suggestion.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {suggestion.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            From: {suggestion.userEmail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Send className="h-5 w-5 mr-2" />
                      Respond to Suggestion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSuggestion ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getStatusColor(selectedSuggestion.status)}>
                              {selectedSuggestion.status}
                            </Badge>
                            <Badge variant="outline">
                              {selectedSuggestion.type}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{selectedSuggestion.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedSuggestion.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            From: {selectedSuggestion.userEmail} • {new Date(selectedSuggestion.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {selectedSuggestion.adminResponse ? (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm font-medium">Previous Response</span>
                            </div>
                            <p className="text-sm">{selectedSuggestion.adminResponse}</p>
                          </div>
                        ) : (
                          <form onSubmit={handleRespondToSuggestion} className="space-y-4">
                            <Textarea
                              placeholder="Write your response to the user..."
                              value={adminResponse}
                              onChange={(e) => setAdminResponse(e.target.value)}
                              className="min-h-[120px]"
                              required
                            />
                            <Button type="submit" disabled={isResponding} className="w-full">
                              {isResponding ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Sending Response...
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Response
                                </div>
                              )}
                            </Button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Select a suggestion to respond</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription>Configure platform-wide settings and limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Default User Limits</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Daily Usage Limit</label>
                            <Input type="number" defaultValue="50" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Monthly Usage Limit</label>
                            <Input type="number" defaultValue="1000" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Email Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email Verification Required</span>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Send Welcome Emails</span>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Send Usage Notifications</span>
                            <Switch />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <Button>Save Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}