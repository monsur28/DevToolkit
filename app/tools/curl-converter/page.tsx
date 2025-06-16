'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Terminal, Copy, Trash2, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CurlConverterPage() {
  const [curlCommand, setCurlCommand] = useState('');
  const [fetchCode, setFetchCode] = useState('');
  const [axiosCode, setAxiosCode] = useState('');
  const { toast } = useToast();

  const parseCurlCommand = (curl: string) => {
    const lines = curl.trim().split('\n').map(line => line.trim()).join(' ');
    
    // Extract URL
    const urlMatch = lines.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"\s]+)['"]?/);
    const url = urlMatch ? urlMatch[1] : '';

    // Extract method
    const methodMatch = lines.match(/-X\s+(\w+)/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

    // Extract headers
    const headerMatches = lines.matchAll(/-H\s+['"]([^'"]+)['"]/g);
    const headers: Record<string, string> = {};
    for (const match of headerMatches) {
      const [key, value] = match[1].split(':').map(s => s.trim());
      if (key && value) {
        headers[key] = value;
      }
    }

    // Extract data
    const dataMatch = lines.match(/-d\s+['"]([^'"]*)['"]/);
    const data = dataMatch ? dataMatch[1] : '';

    return { url, method, headers, data };
  };

  const generateFetchCode = (parsed: ReturnType<typeof parseCurlCommand>) => {
    const { url, method, headers, data } = parsed;
    
    let code = `fetch('${url}', {\n`;
    code += `  method: '${method}',\n`;
    
    if (Object.keys(headers).length > 0) {
      code += `  headers: {\n`;
      Object.entries(headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += `  },\n`;
    }
    
    if (data && method !== 'GET') {
      code += `  body: '${data}',\n`;
    }
    
    code += `})\n`;
    code += `.then(response => response.json())\n`;
    code += `.then(data => console.log(data))\n`;
    code += `.catch(error => console.error('Error:', error));`;
    
    return code;
  };

  const generateAxiosCode = (parsed: ReturnType<typeof parseCurlCommand>) => {
    const { url, method, headers, data } = parsed;
    
    let code = `axios({\n`;
    code += `  method: '${method.toLowerCase()}',\n`;
    code += `  url: '${url}',\n`;
    
    if (Object.keys(headers).length > 0) {
      code += `  headers: {\n`;
      Object.entries(headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += `  },\n`;
    }
    
    if (data && method !== 'GET') {
      code += `  data: '${data}',\n`;
    }
    
    code += `})\n`;
    code += `.then(response => console.log(response.data))\n`;
    code += `.catch(error => console.error('Error:', error));`;
    
    return code;
  };

  const convertCurl = () => {
    try {
      if (!curlCommand.trim()) {
        toast({
          title: "Error",
          description: "Please enter a cURL command",
          variant: "destructive"
        });
        return;
      }

      const parsed = parseCurlCommand(curlCommand);
      
      if (!parsed.url) {
        toast({
          title: "Error",
          description: "Could not parse URL from cURL command",
          variant: "destructive"
        });
        return;
      }

      setFetchCode(generateFetchCode(parsed));
      setAxiosCode(generateAxiosCode(parsed));
      
      toast({
        title: "Success",
        description: "cURL command converted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse cURL command",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (code: string, type: string) => {
    await navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `${type} code copied to clipboard`,
    });
  };

  const clear = () => {
    setCurlCommand('');
    setFetchCode('');
    setAxiosCode('');
  };

  const exampleCurl = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-token" \\
  -d '{"name": "John Doe", "email": "john@example.com"}'`;

  return (
    <ToolLayout
      title="cURL to JavaScript Converter"
      description="Convert cURL commands into JavaScript fetch or axios code snippets"
      icon={<Terminal className="h-8 w-8 text-cyan-500" />}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">cURL Command</CardTitle>
            <CardDescription>Paste your cURL command here</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`Enter your cURL command here...\n\nExample:\n${exampleCurl}`}
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={convertCurl} className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Convert</span>
              </Button>
              <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </Button>
              <Button 
                onClick={() => setCurlCommand(exampleCurl)} 
                variant="outline" 
                size="sm"
              >
                Load Example
              </Button>
            </div>
          </CardContent>
        </Card>

        {(fetchCode || axiosCode) && (
          <Tabs defaultValue="fetch" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fetch">Fetch API</TabsTrigger>
              <TabsTrigger value="axios">Axios</TabsTrigger>
            </TabsList>

            <TabsContent value="fetch" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Fetch API Code</CardTitle>
                      <CardDescription>Modern JavaScript fetch implementation</CardDescription>
                    </div>
                    {fetchCode && (
                      <Button 
                        onClick={() => copyToClipboard(fetchCode, 'Fetch')}
                        size="sm" 
                        variant="outline"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                    {fetchCode}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="axios" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Axios Code</CardTitle>
                      <CardDescription>Popular HTTP client library</CardDescription>
                    </div>
                    {axiosCode && (
                      <Button 
                        onClick={() => copyToClipboard(axiosCode, 'Axios')}
                        size="sm" 
                        variant="outline"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
                    {axiosCode}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ToolLayout>
  );
}