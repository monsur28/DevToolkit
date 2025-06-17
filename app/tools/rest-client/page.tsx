'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Copy, Trash2, Plus, Minus, Clock, CheckCircle, AlertCircle, BarChart3, Eye, Download, FileText, Zap, Brain, Search } from 'lucide-react';
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
    depth?: number;
  };
  insights: {
    dataTypes: Record<string, number>;
    nullValues: number;
    emptyValues: number;
    patterns: string[];
  };
  summary: string;
  recommendations: string[];
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
  const [showAnalysis, setShowAnalysis] = useState(false);
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

  const analyzeResponse = (data: any): ResponseAnalysis => {
    const analysis: ResponseAnalysis = {
      structure: {
        type: Array.isArray(data) ? 'array' : typeof data,
        depth: 0
      },
      insights: {
        dataTypes: {},
        nullValues: 0,
        emptyValues: 0,
        patterns: []
      },
      summary: '',
      recommendations: []
    };

    // Analyze structure
    if (Array.isArray(data)) {
      analysis.structure.arrayLength = data.length;
      analysis.structure.type = 'array';
      if (data.length > 0) {
        analysis.structure.keys = Object.keys(data[0]);
      }
    } else if (typeof data === 'object' && data !== null) {
      analysis.structure.keys = Object.keys(data);
      analysis.structure.type = 'object';
    }

    // Deep analysis function
    const analyzeValue = (value: any, depth: number = 0) => {
      analysis.structure.depth = Math.max(analysis.structure.depth, depth);
      
      const type = Array.isArray(value) ? 'array' : typeof value;
      analysis.insights.dataTypes[type] = (analysis.insights.dataTypes[type] || 0) + 1;

      if (value === null) {
        analysis.insights.nullValues++;
      } else if (value === '' || (Array.isArray(value) && value.length === 0)) {
        analysis.insights.emptyValues++;
      }

      if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(v => analyzeValue(v, depth + 1));
      }
    };

    analyzeValue(data);

    // Generate patterns
    if (analysis.structure.keys) {
      const commonPatterns = analysis.structure.keys.filter(key => 
        key.includes('id') || key.includes('name') || key.includes('email') || 
        key.includes('date') || key.includes('time') || key.includes('url')
      );
      analysis.insights.patterns = commonPatterns;
    }

    // Generate summary
    if (Array.isArray(data)) {
      analysis.summary = `Array containing ${data.length} items`;
      if (data.length > 0 && typeof data[0] === 'object') {
        analysis.summary += ` with ${Object.keys(data[0]).length} properties each`;
      }
    } else if (typeof data === 'object' && data !== null) {
      analysis.summary = `Object with ${Object.keys(data).length} properties`;
    } else {
      analysis.summary = `${typeof data} value`;
    }

    // Generate recommendations
    if (analysis.insights.nullValues > 0) {
      analysis.recommendations.push(`Consider handling ${analysis.insights.nullValues} null values`);
    }
    if (analysis.insights.emptyValues > 0) {
      analysis.recommendations.push(`Found ${analysis.insights.emptyValues} empty values that might need validation`);
    }
    if (analysis.structure.depth > 3) {
      analysis.recommendations.push('Deep nesting detected - consider flattening the structure');
    }
    if (Array.isArray(data) && data.length > 100) {
      analysis.recommendations.push('Large array detected - consider implementing pagination');
    }

    return analysis;
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
      
      // Analyze response if it's JSON
      if (typeof data === 'object') {
        const analysis = analyzeResponse(data);
        setResponseAnalysis(analysis);
        setShowAnalysis(true);
      } else {
        setResponseAnalysis(null);
        setShowAnalysis(false);
      }
      
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

  const downloadResponse = () => {
    if (!response) return;
    
    const content = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data, null, 2);
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-response-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Response downloaded successfully",
    });
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

  return (
    <ToolLayout
      title="REST API Client & Response Analyzer"
      description="Test REST APIs with full HTTP method support, headers, and intelligent response analysis"
      icon={<Send className="h-8 w-8 text-blue-500" />}
    >
      <div className="space-y-6">
        {/* Request Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  HTTP Request
                </CardTitle>
                <CardDescription>Configure your API request with intelligent response analysis</CardDescription>
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
                      <span>Send Request</span>
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

        {/* Response */}
        {response && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <span>Response</span>
                    <Badge variant="outline" className={getStatusColor(response.status)}>
                      {response.status} {response.statusText}
                    </Badge>
                    {showAnalysis && (
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Analyzed
                      </Badge>
                    )}
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
                  <Button onClick={downloadResponse} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className={`grid w-full ${showAnalysis ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <TabsTrigger value="response">Response Body</TabsTrigger>
                  <TabsTrigger value="response-headers">Headers</TabsTrigger>
                  {showAnalysis && (
                    <TabsTrigger value="analysis" className="flex items-center space-x-1">
                      <BarChart3 className="h-4 w-4" />
                      <span>Analysis</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="response" className="space-y-4">
                  <Textarea
                    value={typeof response.data === 'string' 
                      ? response.data 
                      : JSON.stringify(response.data, null, 2)
                    }
                    readOnly
                    className="min-h-[300px] font-mono text-sm bg-muted"
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

                {showAnalysis && responseAnalysis && (
                  <TabsContent value="analysis" className="space-y-6">
                    {/* Response Summary */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Eye className="h-5 w-5 mr-2 text-blue-600" />
                          Response Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-medium text-blue-800 dark:text-blue-200">
                          {responseAnalysis.summary}
                        </p>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Structure Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Structure Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Type:</span>
                            <Badge variant="outline">{responseAnalysis.structure.type}</Badge>
                          </div>
                          {responseAnalysis.structure.arrayLength && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Array Length:</span>
                              <Badge variant="secondary">{responseAnalysis.structure.arrayLength}</Badge>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Nesting Depth:</span>
                            <Badge variant="outline">{responseAnalysis.structure.depth}</Badge>
                          </div>
                          {responseAnalysis.structure.keys && (
                            <div>
                              <span className="text-sm font-medium">Properties:</span>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {responseAnalysis.structure.keys.slice(0, 6).map((key) => (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key}
                                  </Badge>
                                ))}
                                {responseAnalysis.structure.keys.length > 6 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{responseAnalysis.structure.keys.length - 6} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Data Insights */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Data Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="text-sm font-medium">Data Types:</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(responseAnalysis.insights.dataTypes).map(([type, count]) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}: {count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {responseAnalysis.insights.nullValues > 0 && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Null Values:</span>
                              <Badge variant="destructive" className="text-xs">
                                {responseAnalysis.insights.nullValues}
                              </Badge>
                            </div>
                          )}
                          {responseAnalysis.insights.emptyValues > 0 && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Empty Values:</span>
                              <Badge variant="secondary" className="text-xs">
                                {responseAnalysis.insights.emptyValues}
                              </Badge>
                            </div>
                          )}
                          {responseAnalysis.insights.patterns.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Common Patterns:</span>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {responseAnalysis.insights.patterns.map((pattern) => (
                                  <Badge key={pattern} variant="secondary" className="text-xs">
                                    {pattern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recommendations */}
                    {responseAnalysis.recommendations.length > 0 && (
                      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-amber-600" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {responseAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm text-amber-800 dark:text-amber-200">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Search className="h-5 w-5 mr-2" />
              REST Client & Response Analysis Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">API Testing Best Practices:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Test different HTTP methods (GET, POST, PUT, DELETE)</li>
                  <li>• Validate response status codes and headers</li>
                  <li>• Test with various content types (JSON, XML, form data)</li>
                  <li>• Include authentication headers when required</li>
                  <li>• Test error scenarios and edge cases</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Response Analysis Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Automatic structure detection and validation</li>
                  <li>• Data type analysis and null value detection</li>
                  <li>• Performance recommendations for large datasets</li>
                  <li>• Common API pattern recognition</li>
                  <li>• Security and optimization suggestions</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">🧠 AI-Powered Analysis:</h4>
              <p className="text-muted-foreground">
                The response analyzer automatically examines JSON responses to provide insights about data structure, 
                identify potential issues, and suggest improvements. This helps you understand API responses better 
                and optimize your applications accordingly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}