'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Copy, Trash2, Plus, Minus, Clock, CheckCircle, AlertCircle, BarChart3, Eye, Code, FileText, Zap, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  timestamp: Date;
  status?: number;
  duration?: number;
}

interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
  size: number;
}

interface ResponseAnalysis {
  structure: {
    type: string;
    keys?: string[];
    arrayLength?: number;
    depth: number;
  };
  insights: {
    hasErrors: boolean;
    errorFields: string[];
    dataTypes: Record<string, string>;
    nullFields: string[];
    patterns: string[];
  };
  performance: {
    responseTime: number;
    sizeCategory: string;
    recommendations: string[];
  };
  security: {
    sensitiveFields: string[];
    warnings: string[];
  };
}

export default function RestClientPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = useState<Header[]>([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<Response | null>(null);
  const [responseAnalysis, setResponseAnalysis] = useState<ResponseAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [activeTab, setActiveTab] = useState('response');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const addHeader = () => {
    const newHeader: Header = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true
    };
    setHeaders([...headers, newHeader]);
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  const updateHeader = (id: string, field: keyof Header, value: any) => {
    setHeaders(headers.map(h => 
      h.id === id ? { ...h, [field]: value } : h
    ));
  };

  const analyzeResponse = (responseData: any, duration: number, size: number): ResponseAnalysis => {
    const analysis: ResponseAnalysis = {
      structure: {
        type: Array.isArray(responseData) ? 'array' : typeof responseData,
        depth: getObjectDepth(responseData),
        ...(Array.isArray(responseData) && { arrayLength: responseData.length }),
        ...(typeof responseData === 'object' && responseData !== null && { keys: Object.keys(responseData) })
      },
      insights: {
        hasErrors: false,
        errorFields: [],
        dataTypes: {},
        nullFields: [],
        patterns: []
      },
      performance: {
        responseTime: duration,
        sizeCategory: size < 1024 ? 'small' : size < 10240 ? 'medium' : 'large',
        recommendations: []
      },
      security: {
        sensitiveFields: [],
        warnings: []
      }
    };

    // Analyze data structure and types
    if (typeof responseData === 'object' && responseData !== null) {
      analyzeObject(responseData, analysis, '');
    }

    // Performance recommendations
    if (duration > 2000) {
      analysis.performance.recommendations.push('Response time is slow (>2s). Consider optimizing the API.');
    }
    if (size > 50000) {
      analysis.performance.recommendations.push('Large response size. Consider pagination or data filtering.');
    }

    // Detect common patterns
    if (analysis.structure.keys?.includes('data') && analysis.structure.keys?.includes('meta')) {
      analysis.insights.patterns.push('Standard API wrapper pattern detected');
    }
    if (analysis.structure.keys?.includes('error') || analysis.structure.keys?.includes('errors')) {
      analysis.insights.hasErrors = true;
      analysis.insights.patterns.push('Error response pattern detected');
    }

    return analysis;
  };

  const analyzeObject = (obj: any, analysis: ResponseAnalysis, path: string) => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullPath = path ? `${path}.${key}` : key;
      
      // Track data types
      analysis.insights.dataTypes[fullPath] = Array.isArray(value) ? 'array' : typeof value;
      
      // Check for null values
      if (value === null) {
        analysis.insights.nullFields.push(fullPath);
      }
      
      // Check for error fields
      if (key.toLowerCase().includes('error') || key.toLowerCase().includes('message')) {
        analysis.insights.errorFields.push(fullPath);
      }
      
      // Check for sensitive fields
      const sensitiveKeywords = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
      if (sensitiveKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
        analysis.security.sensitiveFields.push(fullPath);
        analysis.security.warnings.push(`Potentially sensitive field detected: ${fullPath}`);
      }
      
      // Recursively analyze nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        analyzeObject(value, analysis, fullPath);
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        analyzeObject(value[0], analysis, `${fullPath}[0]`);
      }
    });
  };

  const getObjectDepth = (obj: any): number => {
    if (typeof obj !== 'object' || obj === null) return 0;
    
    let maxDepth = 0;
    Object.values(obj).forEach(value => {
      if (typeof value === 'object' && value !== null) {
        maxDepth = Math.max(maxDepth, 1 + getObjectDepth(value));
      }
    });
    
    return maxDepth;
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Prepare headers
      const requestHeaders: Record<string, string> = {};
      headers.forEach(header => {
        if (header.enabled && header.key && header.value) {
          requestHeaders[header.key] = header.value;
        }
      });

      // Prepare request options
      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }

      // Make the request
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Calculate response size (approximate)
      const size = new Blob([JSON.stringify(data)]).size;

      const responseData: Response = {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        duration,
        size
      };

      setResponse(responseData);
      
      // Analyze response
      const analysis = analyzeResponse(data, duration, size);
      setResponseAnalysis(analysis);
      
      setActiveTab('response');

      // Add to history
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        method,
        url,
        timestamp: new Date(),
        status: response.status,
        duration
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 requests

      toast({
        title: "Request Sent",
        description: `${response.status} ${response.statusText} (${duration}ms)`,
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Network error occurred",
        variant: "destructive"
      });

      // Add failed request to history
      const historyItem: RequestHistory = {
        id: Date.now().toString(),
        method,
        url,
        timestamp: new Date(),
        duration
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = async () => {
    if (response) {
      const text = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data, null, 2);
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
    }
  };

  const loadFromHistory = (item: RequestHistory) => {
    setMethod(item.method);
    setUrl(item.url);
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "History Cleared",
      description: "Request history has been cleared",
    });
  };

  const loadExample = () => {
    setMethod('GET');
    setUrl('https://jsonplaceholder.typicode.com/posts/1');
    setHeaders([
      { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
      { id: '2', key: 'Accept', value: 'application/json', enabled: true }
    ]);
    setBody('');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-muted-foreground';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    if (status >= 500) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const filteredResponseData = () => {
    if (!response?.data || typeof response.data !== 'object') return response?.data;
    
    if (!searchQuery) return response.data;
    
    // Simple search implementation
    const searchInObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return obj.toLowerCase().includes(searchQuery.toLowerCase()) ? obj : null;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(searchInObject).filter(item => item !== null);
      }
      
      if (typeof obj === 'object' && obj !== null) {
        const filtered: any = {};
        Object.entries(obj).forEach(([key, value]) => {
          if (key.toLowerCase().includes(searchQuery.toLowerCase())) {
            filtered[key] = value;
          } else {
            const searchResult = searchInObject(value);
            if (searchResult !== null) {
              filtered[key] = searchResult;
            }
          }
        });
        return Object.keys(filtered).length > 0 ? filtered : null;
      }
      
      return null;
    };
    
    return searchInObject(response.data) || response.data;
  };

  return (
    <ToolLayout
      title="REST API Client & Response Analyzer"
      description="Test REST APIs with intelligent response analysis, performance insights, and security scanning"
      icon={<Send className="h-8 w-8 text-blue-500" />}
    >
      <div className="space-y-6">
        {/* Request Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">HTTP Request</CardTitle>
                <CardDescription>Configure your API request with intelligent analysis</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadExample} variant="outline" size="sm">
                  Load Example
                </Button>
                <Button onClick={sendRequest} disabled={isLoading} className="flex items-center space-x-2">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send & Analyze</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Method and URL */}
            <div className="flex gap-2">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {httpMethods.map(m => (
                    <SelectItem key={m} value={m}>
                      <span className={`font-medium ${
                        m === 'GET' ? 'text-blue-600' :
                        m === 'POST' ? 'text-green-600' :
                        m === 'PUT' ? 'text-orange-600' :
                        m === 'DELETE' ? 'text-red-600' :
                        'text-purple-600'
                      }`}>
                        {m}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Enter API URL (e.g., https://api.example.com/users)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              />
            </div>

            <Tabs defaultValue="headers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Request Headers</Label>
                  <Button onClick={addHeader} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Header
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {headers.map((header) => (
                    <div key={header.id} className="flex items-center gap-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => updateHeader(header.id, 'enabled', e.target.checked)}
                        className="rounded"
                      />
                      <Input
                        placeholder="Header name"
                        value={header.key}
                        onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Header value"
                        value={header.value}
                        onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => removeHeader(header.id)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="body" className="space-y-4">
                <div className="space-y-2">
                  <Label>Request Body</Label>
                  <Textarea
                    placeholder={`Enter request body (JSON, XML, etc.)

Example JSON:
{
  "name": "John Doe",
  "email": "john@example.com"
}`}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    disabled={!['POST', 'PUT', 'PATCH'].includes(method)}
                  />
                  {!['POST', 'PUT', 'PATCH'].includes(method) && (
                    <p className="text-xs text-muted-foreground">
                      Request body is only available for POST, PUT, and PATCH methods
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Request History</Label>
                  {history.length > 0 && (
                    <Button onClick={clearHistory} size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear History
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No requests in history yet
                    </p>
                  ) : (
                    history.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={`${
                            item.method === 'GET' ? 'text-blue-600' :
                            item.method === 'POST' ? 'text-green-600' :
                            item.method === 'PUT' ? 'text-orange-600' :
                            item.method === 'DELETE' ? 'text-red-600' :
                            'text-purple-600'
                          }`}>
                            {item.method}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.url}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.status && (
                            <Badge variant="outline" className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          )}
                          {item.duration && (
                            <span className="text-xs text-muted-foreground">
                              {item.duration}ms
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Response with Analysis */}
        {response && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Response Data */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>Response</span>
                        <Badge variant="outline" className={getStatusColor(response.status)}>
                          {response.status} {response.statusText}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {response.duration}ms • {formatBytes(response.size)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyResponse} size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="response">Response Body</TabsTrigger>
                      <TabsTrigger value="response-headers">Headers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="response" className="space-y-4">
                      {/* Search and Filter */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search in response..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="strings">Strings</SelectItem>
                            <SelectItem value="numbers">Numbers</SelectItem>
                            <SelectItem value="objects">Objects</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Textarea
                        value={typeof filteredResponseData() === 'string' 
                          ? filteredResponseData() 
                          : JSON.stringify(filteredResponseData(), null, 2)
                        }
                        readOnly
                        className="min-h-[400px] font-mono text-sm bg-muted"
                      />
                    </TabsContent>

                    <TabsContent value="response-headers" className="space-y-4">
                      <div className="space-y-2">
                        {Object.entries(response.headers).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="font-medium text-sm">{key}:</span>
                            <span className="text-sm font-mono">{value}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Panel */}
            <div className="space-y-4">
              {responseAnalysis && (
                <>
                  {/* Quick Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Quick Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Response Type</span>
                        <Badge variant="outline">{responseAnalysis.structure.type}</Badge>
                      </div>
                      
                      {responseAnalysis.structure.arrayLength && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Array Length</span>
                          <Badge variant="outline">{responseAnalysis.structure.arrayLength}</Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Object Depth</span>
                        <Badge variant="outline">{responseAnalysis.structure.depth}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Performance</span>
                        <Badge variant={responseAnalysis.performance.responseTime < 1000 ? "default" : "destructive"}>
                          {responseAnalysis.performance.sizeCategory}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Data Structure */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Code className="h-4 w-4 mr-2" />
                        Data Structure
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {responseAnalysis.structure.keys && (
                        <div>
                          <p className="text-sm font-medium mb-2">Top-level Keys:</p>
                          <div className="flex flex-wrap gap-1">
                            {responseAnalysis.structure.keys.slice(0, 8).map(key => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}
                              </Badge>
                            ))}
                            {responseAnalysis.structure.keys.length > 8 && (
                              <Badge variant="outline" className="text-xs">
                                +{responseAnalysis.structure.keys.length - 8} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {responseAnalysis.insights.patterns.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Patterns:</p>
                          {responseAnalysis.insights.patterns.map((pattern, index) => (
                            <p key={index} className="text-xs text-muted-foreground">
                              • {pattern}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Performance Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Response Time</span>
                        <span className={`text-sm font-medium ${
                          responseAnalysis.performance.responseTime < 1000 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {responseAnalysis.performance.responseTime}ms
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Size Category</span>
                        <Badge variant={
                          responseAnalysis.performance.sizeCategory === 'small' ? 'default' :
                          responseAnalysis.performance.sizeCategory === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {responseAnalysis.performance.sizeCategory}
                        </Badge>
                      </div>
                      
                      {responseAnalysis.performance.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Recommendations:</p>
                          {responseAnalysis.performance.recommendations.map((rec, index) => (
                            <p key={index} className="text-xs text-muted-foreground">
                              • {rec}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Security Analysis */}
                  {(responseAnalysis.security.sensitiveFields.length > 0 || responseAnalysis.security.warnings.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                          Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {responseAnalysis.security.sensitiveFields.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Sensitive Fields:</p>
                            {responseAnalysis.security.sensitiveFields.map(field => (
                              <Badge key={field} variant="destructive" className="text-xs mr-1 mb-1">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {responseAnalysis.security.warnings.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Warnings:</p>
                            {responseAnalysis.security.warnings.map((warning, index) => (
                              <p key={index} className="text-xs text-orange-600">
                                ⚠️ {warning}
                              </p>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Data Quality */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Data Quality
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Null Fields</span>
                        <Badge variant={responseAnalysis.insights.nullFields.length === 0 ? "default" : "secondary"}>
                          {responseAnalysis.insights.nullFields.length}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Error Fields</span>
                        <Badge variant={responseAnalysis.insights.errorFields.length === 0 ? "default" : "destructive"}>
                          {responseAnalysis.insights.errorFields.length}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Types</span>
                        <Badge variant="outline">
                          {Object.keys(responseAnalysis.insights.dataTypes).length}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced REST Client Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">🔍 Response Analysis:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Automatic data structure detection</li>
                  <li>• Performance metrics and recommendations</li>
                  <li>• Security vulnerability scanning</li>
                  <li>• Data quality assessment</li>
                  <li>• Pattern recognition in API responses</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚡ Smart Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Real-time response search and filtering</li>
                  <li>• Intelligent error detection</li>
                  <li>• Response time optimization tips</li>
                  <li>• Sensitive data identification</li>
                  <li>• API pattern analysis</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">💡 Pro Tips:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Use the search feature to quickly find specific data in large responses</li>
                <li>• Check the security analysis for potential data exposure issues</li>
                <li>• Monitor performance metrics to optimize your API calls</li>
                <li>• Review data quality insights to improve API design</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}