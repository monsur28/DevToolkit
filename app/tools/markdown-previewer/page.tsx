'use client';

import { useState, useEffect } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, Copy, Trash2, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { marked } from 'marked';

// Custom renderer for code blocks with copy functionality
const createCustomRenderer = (onCopyCode: (code: string, language: string) => void) => {
  const renderer = new marked.Renderer();
  
  renderer.code = function(code, language) {
    const lang = language || 'text';
    const escapedCode = code.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    return `
      <div class="code-block-container relative group mb-4">
        <div class="code-block-header flex items-center justify-between bg-muted/80 px-4 py-2 rounded-t-md border-b">
          <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">${lang}</span>
          <button 
            class="copy-code-btn opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 px-2 py-1 text-xs bg-background/80 hover:bg-background rounded border text-muted-foreground hover:text-foreground"
            data-code="${escapedCode}"
            data-language="${lang}"
            title="Copy code"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy
          </button>
        </div>
        <pre class="code-block bg-muted/50 p-4 rounded-b-md overflow-x-auto border-x border-b"><code class="language-${lang} text-sm">${code}</code></pre>
      </div>
    `;
  };

  return renderer;
};

export default function MarkdownPreviewerPage() {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const handleCopyCode = (code: string, language: string) => {
    const decodedCode = code.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    navigator.clipboard.writeText(decodedCode);
    
    const key = `${language}-${code.substring(0, 20)}`;
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    
    toast({
      title: "Code Copied!",
      description: `${language.toUpperCase()} code copied to clipboard`,
    });

    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  useEffect(() => {
    // Define an async function to handle the parsing
    const parseMarkdown = async () => {
        if (markdown) {
            // Your custom renderer remains the same
            const customRenderer = createCustomRenderer(handleCopyCode);

            marked.use({
                renderer: customRenderer,
                // The walkTokens extension for syntax highlighting
                walkTokens: (token) => {
                    if (token.type === 'code') {
                        const lang = token.lang || 'text';
                        let code = token.text;

                        // Your syntax highlighting logic
                        if (lang === 'javascript' || lang === 'js') {
                            token.text = code
                                .replace(/\b(function|const|let|var|if|else|for|while|return|import|export|class|extends)\b/g, '<span class="text-purple-600 dark:text-purple-400 font-semibold">$1</span>')
                                .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>')
                                .replace(/"([^"]*)"/g, '<span class="text-green-600 dark:text-green-400">"$1"</span>')
                                .replace(/'([^']*)'/g, '<span class="text-green-600 dark:text-green-400">\'$1\'</span>')
                                .replace(/\/\/.*$/gm, '<span class="text-gray-500 italic">$&</span>');
                        } else if (lang === 'css') {
                           token.text = code
                                .replace(/([a-zA-Z-]+)(\s*:\s*)/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>$2')
                                .replace(/(#[a-fA-F0-9]{3,6})/g, '<span class="text-pink-600 dark:text-pink-400">$1</span>')
                                .replace(/(\d+px|\d+em|\d+rem|\d+%)/g, '<span class="text-orange-600 dark:text-orange-400">$1</span>');
                        } else if (lang === 'json') {
                           token.text = code
                                .replace(/"([^"]+)"(\s*:)/g, '<span class="text-blue-600 dark:text-blue-400">"$1"</span>$2')
                                .replace(/:\s*"([^"]*)"/g, ': <span class="text-green-600 dark:text-green-400">"$1"</span>')
                                .replace(/:\s*(true|false|null)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
                                .replace(/:\s*(\d+)/g, ': <span class="text-orange-600 dark:text-orange-400">$1</span>');
                        }
                    }
                },
                breaks: true,
                gfm: true
            });

            try {
                // Await the promise to get the actual HTML string
                const htmlOutput = await marked.parse(markdown);
                // Now set the state with the resolved string
                setHtml(htmlOutput);
            } catch (error) {
                console.error('Error parsing markdown:', error);
                // Optionally set an error state to display to the user
                setHtml('<p class="text-red-500">Error parsing Markdown.</p>');
            }
        } else {
            setHtml('');
        }
    };

    // Call the async function
    parseMarkdown();

}, [markdown]);

  // Add event listeners for copy buttons after HTML is rendered
  useEffect(() => {
    const handleCopyClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('.copy-code-btn') as HTMLButtonElement;
      
      if (button) {
        event.preventDefault();
        const code = button.getAttribute('data-code') || '';
        const language = button.getAttribute('data-language') || 'text';
        handleCopyCode(code, language);
      }
    };

    document.addEventListener('click', handleCopyClick);
    return () => document.removeEventListener('click', handleCopyClick);
  }, [html]);

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    toast({
      title: "Copied!",
      description: "Markdown copied to clipboard",
    });
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    toast({
      title: "Copied!",
      description: "HTML copied to clipboard",
    });
  };

  const clear = () => {
    setMarkdown('');
    setHtml('');
    setCopiedStates({});
  };

  const loadExample = () => {
    const example = `# DevToolkit - Markdown Previewer

A comprehensive suite of **developer utilities** to streamline your workflow.

## Features

- ✅ JSON Formatter & Validator
- ✅ Base64 Encoder/Decoder  
- ✅ JWT Decoder
- ✅ UUID Generator
- ✅ Regex Tester
- ✅ cURL to JavaScript Converter
- ✅ Code Diff Viewer
- ✅ Timestamp Converter
- ✅ YAML ⇄ JSON Converter
- ✅ **Markdown Previewer with Code Blocks**
- ✅ Cron Expression Generator
- ✅ Code Minifier/Prettifier

## JavaScript Example

\`\`\`javascript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    console.log('Data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Usage
fetchData()
  .then(data => {
    // Process the data
    console.log('Processing:', data);
  })
  .catch(err => {
    console.log('Failed to fetch data');
  });
\`\`\`

## CSS Styling Example

\`\`\`css
.code-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.code-block:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}
\`\`\`

## JSON Configuration

\`\`\`json
{
  "name": "DevToolkit",
  "version": "2.0.0",
  "description": "A comprehensive suite of developer utilities",
  "features": {
    "markdown": {
      "enabled": true,
      "syntaxHighlighting": true,
      "codeBlockCopy": true
    },
    "tools": [
      "JSON Formatter",
      "Base64 Encoder",
      "JWT Decoder",
      "UUID Generator"
    ]
  },
  "config": {
    "theme": "auto",
    "autoSave": true,
    "notifications": true
  }
}
\`\`\`

## Python Example

\`\`\`python
def process_data(data_list):
    """Process a list of data items."""
    processed = []
    
    for item in data_list:
        if isinstance(item, dict):
            # Process dictionary items
            processed_item = {
                'id': item.get('id'),
                'name': item.get('name', 'Unknown'),
                'processed': True
            }
            processed.append(processed_item)
    
    return processed

# Example usage
sample_data = [
    {'id': 1, 'name': 'Item 1'},
    {'id': 2, 'name': 'Item 2'},
    {'id': 3, 'name': 'Item 3'}
]

result = process_data(sample_data)
print(f"Processed {len(result)} items")
\`\`\`

## Links and References

- [GitHub Repository](https://github.com/example/devtools-hub)
- [Documentation](https://docs.example.com)
- [API Reference](https://api.example.com)

> **Note:** This markdown previewer supports syntax highlighting for multiple languages and includes individual copy buttons for each code block. Try copying the code examples above!

### Table Example

| Tool | Language | Status | Copy Feature |
|------|----------|--------|--------------|
| JSON Formatter | JavaScript | ✅ Ready | ✅ Available |
| Base64 Encoder | TypeScript | ✅ Ready | ✅ Available |
| JWT Decoder | React | ✅ Ready | ✅ Available |
| Markdown Previewer | Next.js | ✅ Ready | ✅ **Enhanced** |

---

*Built with ❤️ for developers. Each code block above has its own copy button - hover over them to see!*`;
    setMarkdown(example);
  };

  return (
    <ToolLayout
      title="Markdown Previewer"
      description="Write markdown and see live rendered preview with enhanced code block functionality"
      icon={<Eye className="h-8 w-8 text-violet-500" />}
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button onClick={loadExample} variant="outline" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Load Example</span>
          </Button>
          <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Markdown Editor</CardTitle>
                  <CardDescription>Write your markdown here</CardDescription>
                </div>
                {markdown && (
                  <Button onClick={copyMarkdown} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy MD
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="# Start writing your markdown here...

## Code Block Example
```javascript
console.log('Hello, World!');
const greeting = 'Welcome to DevToolkit!';
```

## Features
- Live preview
- **Enhanced syntax highlighting**
- Individual copy buttons for code blocks
- Support for multiple languages

> This is a blockquote with **bold text** and *italic text*

[Link example](https://example.com)"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-[500px] font-mono text-sm resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Live Preview</CardTitle>
                  <CardDescription>Rendered markdown with interactive code blocks</CardDescription>
                </div>
                {html && (
                  <Button onClick={copyHtml} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[500px] p-4 bg-muted/30 rounded-md overflow-auto">
                {html ? (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ) : (
                  <div className="text-muted-foreground text-center py-20">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start writing markdown to see the preview here</p>
                    <p className="text-sm mt-2">Code blocks will have individual copy buttons</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enhanced Features</CardTitle>
            <CardDescription>What makes this markdown previewer special</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Copy className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Individual Code Copy</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each code block has its own copy button that appears on hover
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Syntax Highlighting</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enhanced syntax highlighting for JavaScript, CSS, JSON, and Python
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Visual Feedback</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Toast notifications and visual indicators for successful copy actions
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Supported Languages</h4>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'TypeScript', 'CSS', 'JSON', 'Python', 'HTML', 'Markdown', 'Bash'].map((lang) => (
                  <span key={lang} className="px-2 py-1 bg-background rounded text-xs font-mono">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Markdown Cheat Sheet</CardTitle>
            <CardDescription>Quick reference for markdown syntax</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Headers</h4>
                <code className="block bg-background p-2 rounded"># H1<br />## H2<br />### H3</code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Emphasis</h4>
                <code className="block bg-background p-2 rounded">**bold**<br />*italic*<br />~~strikethrough~~</code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Lists</h4>
                <code className="block bg-background p-2 rounded">- Item 1<br />- Item 2<br />1. Numbered</code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Links</h4>
                <code className="block bg-background p-2 rounded">[text](url)<br />![alt](image.jpg)</code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Code Blocks</h4>
                <code className="block bg-background p-2 rounded">`inline code`<br />```language<br />code block<br />```</code>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Quote & Rule</h4>
                <code className="block bg-background p-2 rounded"> Blockquote<br />---<br />Horizontal rule</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}