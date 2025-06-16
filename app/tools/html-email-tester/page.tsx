'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Copy, Trash2, Eye, Monitor, Smartphone, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function HtmlEmailTesterPage() {
  const [htmlInput, setHtmlInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedClients, setSelectedClients] = useState(['gmail', 'outlook', 'apple']);
  const { toast } = useToast();

  const emailClients = [
    { id: 'gmail', name: 'Gmail', icon: '📧', width: 600 },
    { id: 'outlook', name: 'Outlook', icon: '📮', width: 580 },
    { id: 'apple', name: 'Apple Mail', icon: '✉️', width: 600 },
    { id: 'yahoo', name: 'Yahoo Mail', icon: '📬', width: 600 },
    { id: 'thunderbird', name: 'Thunderbird', icon: '🦅', width: 600 }
  ];

  const deviceSizes = [
    { name: 'Mobile', width: 320, icon: Smartphone },
    { name: 'Tablet', width: 768, icon: Monitor },
    { name: 'Desktop', width: 1200, icon: Monitor }
  ];

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const loadExample = () => {
    const exampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            .content {
                padding: 20px 15px !important;
            }
        }
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #1a1a1a;
            }
            .email-container {
                background-color: #2d2d2d;
                color: #ffffff;
            }
            .footer {
                background-color: #1a1a1a;
                color: #cccccc;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome to DevToolkit!</h1>
        </div>
        <div class="content">
            <h2>Thank you for joining us</h2>
            <p>I'm excited to have you on board. Our platform offers a comprehensive suite of developer tools to enhance your productivity.</p>
            
            <p>Here's what you can do:</p>
            <ul>
                <li>Format and validate JSON data</li>
                <li>Encode/decode Base64 strings</li>
                <li>Test regular expressions</li>
                <li>Generate UUIDs and much more!</li>
            </ul>
            
            <a href="#" class="button">Get Started Now</a>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 DevToolkit. All rights reserved.</p>
            <p>123 Developer Street, Code City, CC 12345</p>
            <p><a href="#" style="color: #007bff;">Unsubscribe</a> | <a href="#" style="color: #007bff;">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>`;
    setHtmlInput(exampleHtml);
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(htmlInput);
    toast({
      title: "Copied!",
      description: "HTML email code copied to clipboard",
    });
  };

  const clear = () => {
    setHtmlInput('');
  };

  const getClientStyles = (clientId: string) => {
    const baseStyles = isDarkMode 
      ? { backgroundColor: '#1a1a1a', color: '#ffffff' }
      : { backgroundColor: '#ffffff', color: '#000000' };

    switch (clientId) {
      case 'gmail':
        return { ...baseStyles, fontFamily: 'Roboto, Arial, sans-serif' };
      case 'outlook':
        return { ...baseStyles, fontFamily: 'Segoe UI, Tahoma, sans-serif' };
      case 'apple':
        return { ...baseStyles, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' };
      case 'yahoo':
        return { ...baseStyles, fontFamily: 'Helvetica Neue, Arial, sans-serif' };
      case 'thunderbird':
        return { ...baseStyles, fontFamily: 'DejaVu Sans, Arial, sans-serif' };
      default:
        return baseStyles;
    }
  };

  return (
    <ToolLayout
      title="HTML Email Tester"
      description="Test HTML email rendering across different email clients with responsive design and dark mode support"
      icon={<Mail className="h-8 w-8 text-blue-500" />}
    >
      <div className="space-y-6">
        {/* HTML Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">HTML Email Code</CardTitle>
            <CardDescription>Paste your HTML email code to test across different clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your HTML email code here..."
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={loadExample} variant="outline">
                Load Example
              </Button>
              <Button onClick={copyHtml} variant="outline" className="flex items-center space-x-2">
                <Copy className="h-4 w-4" />
                <span>Copy HTML</span>
              </Button>
              <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Testing Options</CardTitle>
            <CardDescription>Configure email client and display settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
                <Label className="flex items-center space-x-2">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </Label>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Email Clients</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {emailClients.map(client => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => toggleClient(client.id)}
                      className="rounded"
                    />
                    <span className="text-sm flex items-center space-x-1">
                      <span>{client.icon}</span>
                      <span>{client.name}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Previews */}
        {htmlInput && (
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clients">Email Clients</TabsTrigger>
              <TabsTrigger value="responsive">Responsive Test</TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {emailClients
                  .filter(client => selectedClients.includes(client.id))
                  .map(client => (
                    <Card key={client.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center space-x-2">
                            <span>{client.icon}</span>
                            <span>{client.name}</span>
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {client.width}px
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div 
                          className="border rounded-b-lg overflow-hidden"
                          style={{ 
                            width: '100%',
                            maxWidth: client.width,
                            margin: '0 auto'
                          }}
                        >
                          <iframe
                            srcDoc={htmlInput}
                            width="100%"
                            height="400"
                            className="border-0"
                            style={getClientStyles(client.id)}
                            title={`${client.name} Preview`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="responsive" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {deviceSizes.map(device => {
                  const IconComponent = device.icon;
                  return (
                    <Card key={device.name}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{device.name}</span>
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {device.width}px
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div 
                          className="border rounded-b-lg overflow-hidden mx-auto"
                          style={{ 
                            width: device.width > 600 ? '100%' : device.width,
                            maxWidth: '100%'
                          }}
                        >
                          <iframe
                            srcDoc={htmlInput}
                            width="100%"
                            height="500"
                            className="border-0"
                            style={getClientStyles('gmail')}
                            title={`${device.name} Preview`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email HTML Best Practices</CardTitle>
            <CardDescription>Tips for creating email-compatible HTML</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">HTML Structure</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use table-based layouts for better compatibility</li>
                    <li>• Include DOCTYPE and meta viewport tags</li>
                    <li>• Use inline CSS for critical styles</li>
                    <li>• Keep HTML under 102KB for Gmail</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">CSS Guidelines</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Avoid CSS Grid and Flexbox</li>
                    <li>• Use web-safe fonts with fallbacks</li>
                    <li>• Include dark mode media queries</li>
                    <li>• Test background images thoroughly</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Responsive Design</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use max-width: 600px for desktop</li>
                    <li>• Include mobile-specific media queries</li>
                    <li>• Make buttons at least 44px tall</li>
                    <li>• Use single-column layouts on mobile</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Testing Checklist</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Test in major email clients</li>
                    <li>• Verify dark mode appearance</li>
                    <li>• Check mobile responsiveness</li>
                    <li>• Validate HTML and accessibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}