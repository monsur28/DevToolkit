'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Zap, Copy, Trash2, Minimize2, Maximize2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CodeFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [codeType, setCodeType] = useState('javascript');
  const { toast } = useToast();

  const minifyJavaScript = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/;\s*}/g, ';}') // Remove space before closing brace
      .replace(/{\s*/g, '{') // Remove space after opening brace
      .replace(/\s*}/g, '}') // Remove space before closing brace
      .replace(/\s*{\s*/g, '{') // Clean up braces
      .replace(/;\s*;/g, ';') // Remove duplicate semicolons
      .trim();
  };

  const prettifyJavaScript = (code: string): string => {
    let formatted = code;
    let indentLevel = 0;
    const indentSize = 2;
    const lines = formatted.split(/[;{}]/).filter(line => line.trim());
    
    const result: string[] = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      if (line.includes('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indent = ' '.repeat(indentLevel * indentSize);
      result.push(indent + line + (line.includes('{') ? '' : ';'));
      
      if (line.includes('{')) {
        indentLevel++;
      }
    }
    
    return result.join('\n');
  };

  const minifyCSS = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces
      .replace(/;\s*}/g, ';}') // Clean up before closing brace
      .replace(/{\s*/g, '{') // Clean up after opening brace
      .replace(/\s*}/g, '}') // Clean up before closing brace
      .replace(/:\s*/g, ':') // Remove space after colon
      .replace(/;\s*/g, ';') // Remove space after semicolon
      .trim();
  };

  const prettifyCSS = (code: string): string => {
    let formatted = code;
    let indentLevel = 0;
    const indentSize = 2;
    
    formatted = formatted.replace(/{\s*/g, ' {\n');
    formatted = formatted.replace(/}\s*/g, '\n}\n');
    formatted = formatted.replace(/;\s*/g, ';\n');
    
    const lines = formatted.split('\n');
    const result: string[] = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      if (line === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indent = ' '.repeat(indentLevel * indentSize);
      result.push(indent + line);
      
      if (line.includes('{')) {
        indentLevel++;
      }
    }
    
    return result.join('\n');
  };

  const minifyJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed);
    } catch (error) {
      throw new Error('Invalid JSON');
    }
  };

  const prettifyJSON = (code: string): string => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      throw new Error('Invalid JSON');
    }
  };

  const minifyCode = () => {
    try {
      let result = '';
      
      switch (codeType) {
        case 'javascript':
          result = minifyJavaScript(input);
          break;
        case 'css':
          result = minifyCSS(input);
          break;
        case 'json':
          result = minifyJSON(input);
          break;
        default:
          result = input.replace(/\s+/g, ' ').trim();
      }
      
      setOutput(result);
      toast({
        title: "Success",
        description: "Code minified successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to minify code",
        variant: "destructive"
      });
    }
  };

  const prettifyCode = () => {
    try {
      let result = '';
      
      switch (codeType) {
        case 'javascript':
          result = prettifyJSON(input); // Try JSON first for JS objects
          break;
        case 'css':
          result = prettifyCSS(input);
          break;
        case 'json':
          result = prettifyJSON(input);
          break;
        default:
          result = input;
      }
      
      setOutput(result);
      toast({
        title: "Success",
        description: "Code formatted successfully!",
      });
    } catch (error) {
      // If JSON parsing fails for JavaScript, try basic formatting
      if (codeType === 'javascript') {
        try {
          const result = prettifyJavaScript(input);
          setOutput(result);
          toast({
            title: "Success",
            description: "Code formatted successfully!",
          });
          return;
        } catch (jsError) {
          // Fall through to error handling
        }
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to format code",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Formatted code copied to clipboard",
      });
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
  };

  const loadExample = () => {
    const examples = {
      javascript: `function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price * items[i].quantity;
    }
    return total;
}

const cart = [
    { name: "Apple", price: 1.50, quantity: 3 },
    { name: "Banana", price: 0.75, quantity: 6 }
];

console.log("Total:", calculateTotal(cart));`,
      css: `body {
    margin: 0;
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header {
    padding: 20px;
    border-bottom: 1px solid #eee;
}`,
      json: `{
  "name": "DevToolkit",
  "version": "1.0.0",
  "description": "A comprehensive suite of developer utilities",
  "features": [
    "JSON Formatter",
    "Base64 Encoder/Decoder",
    "JWT Decoder",
    "UUID Generator",
    "Regex Tester"
  ],
  "config": {
    "theme": "dark",
    "autoSave": true,
    "notifications": {
      "enabled": true,
      "sound": false
    }
  }
}`
    };
    
    setInput(examples[codeType as keyof typeof examples] || '');
  };

  return (
    <ToolLayout
      title="Code Minifier/Prettifier"
      description="Minify or beautify JavaScript, JSON, and CSS code"
      icon={<Zap className="h-8 w-8 text-emerald-500" />}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Code Type & Actions</CardTitle>
            <CardDescription>Select the type of code you want to format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code Type</label>
                <Select value={codeType} onValueChange={setCodeType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={minifyCode} variant="outline" className="flex items-center space-x-2">
                  <Minimize2 className="h-4 w-4" />
                  <span>Minify</span>
                </Button>
                <Button onClick={prettifyCode} className="flex items-center space-x-2">
                  <Maximize2 className="h-4 w-4" />
                  <span>Prettify</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
                <Button onClick={loadExample} variant="outline" size="sm">
                  Load Example
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Input Code</CardTitle>
              <CardDescription>Paste your {codeType.toUpperCase()} code here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Enter your ${codeType.toUpperCase()} code here...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Output</CardTitle>
                  <CardDescription>Formatted code will appear here</CardDescription>
                </div>
                {output && (
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Formatted code will appear here..."
                value={output}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-muted"
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Code Formatting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Minification Benefits:</h4>
                <ul className="space-y-1">
                  <li>• Reduces file size for faster loading</li>
                  <li>• Removes unnecessary whitespace and comments</li>
                  <li>• Optimizes code for production deployment</li>
                  <li>• Saves bandwidth and improves performance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Prettification Benefits:</h4>
                <ul className="space-y-1">
                  <li>• Improves code readability</li>
                  <li>• Adds proper indentation and spacing</li>
                  <li>• Makes debugging easier</li>
                  <li>• Follows standard formatting conventions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}