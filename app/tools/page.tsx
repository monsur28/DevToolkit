'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Key, 
  Shield, 
  Hash,
  Search,
  Terminal,
  GitCompare,
  Clock,
  FileCode,
  Eye,
  Calendar,
  Zap,
  Grid3X3,
  Filter,
  X,
  Palette,
  Calculator,
  Monitor,
  Mail,
  Shuffle,
  Database,
  Send
} from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Tools', color: 'bg-primary/10 text-primary' },
  { id: 'data', name: 'Data Processing', color: 'bg-blue-500/10 text-blue-600' },
  { id: 'security', name: 'Security', color: 'bg-purple-500/10 text-purple-600' },
  { id: 'development', name: 'Development', color: 'bg-green-500/10 text-green-600' },
  { id: 'conversion', name: 'Conversion', color: 'bg-orange-500/10 text-orange-600' },
  { id: 'design', name: 'Design & CSS', color: 'bg-cyan-500/10 text-cyan-600' },
  { id: 'generators', name: 'Generators', color: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'api', name: 'API Tools', color: 'bg-indigo-500/10 text-indigo-600' }
];

const tools = [
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting and error detection',
    icon: FileText,
    href: '/tools/json-formatter',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    category: 'data',
    tags: ['json', 'format', 'validate', 'syntax']
  },
  {
    name: 'JWT Decoder & Creator',
    description: 'Decode, create, sign, and validate JWT tokens with comprehensive key management support',
    icon: Shield,
    href: '/tools/jwt-decoder',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    category: 'security',
    tags: ['jwt', 'token', 'decode', 'create', 'sign', 'validate', 'security']
  },
  {
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings with ease',
    icon: Key,
    href: '/tools/base64',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    category: 'conversion',
    tags: ['base64', 'encode', 'decode', 'binary']
  },
  {
    name: 'UUID Generator',
    description: 'Generate universally unique identifiers in various formats with bulk generation support',
    icon: Hash,
    href: '/tools/uuid-generator',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    category: 'generators',
    tags: ['uuid', 'generate', 'unique', 'identifier']
  },
  {
    name: 'Regex Tester',
    description: 'Test and validate regular expressions with live matching and detailed match analysis',
    icon: Search,
    href: '/tools/regex-tester',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    category: 'development',
    tags: ['regex', 'pattern', 'match', 'test']
  },
  {
    name: 'cURL to JavaScript',
    description: 'Convert cURL commands to JavaScript fetch or axios code snippets instantly',
    icon: Terminal,
    href: '/tools/curl-converter',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    category: 'development',
    tags: ['curl', 'javascript', 'fetch', 'axios']
  },
  {
    name: 'Code Diff Viewer',
    description: 'Compare code blocks with line-by-line difference highlighting and analysis',
    icon: GitCompare,
    href: '/tools/diff-viewer',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    category: 'development',
    tags: ['diff', 'compare', 'code', 'changes']
  },
  {
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa with multiple formats',
    icon: Clock,
    href: '/tools/timestamp-converter',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    category: 'conversion',
    tags: ['timestamp', 'unix', 'date', 'time']
  },
  {
    name: 'YAML ⇄ JSON Converter',
    description: 'Bi-directional conversion between YAML and JSON formats with live preview',
    icon: FileCode,
    href: '/tools/yaml-json-converter',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    category: 'conversion',
    tags: ['yaml', 'json', 'convert', 'format']
  },
  {
    name: 'Markdown Previewer',
    description: 'Write markdown and see live rendered preview with syntax highlighting support',
    icon: Eye,
    href: '/tools/markdown-previewer',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    category: 'development',
    tags: ['markdown', 'preview', 'render', 'documentation']
  },
  {
    name: 'Cron Expression Generator',
    description: 'Build cron expressions with intuitive UI and natural language descriptions',
    icon: Calendar,
    href: '/tools/cron-generator',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    category: 'generators',
    tags: ['cron', 'schedule', 'expression', 'time']
  },
  {
    name: 'Code Minifier/Prettifier',
    description: 'Minify or beautify JavaScript, JSON, and CSS code with advanced formatting options',
    icon: Zap,
    href: '/tools/code-formatter',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    category: 'development',
    tags: ['minify', 'prettify', 'format', 'javascript', 'css']
  },
  {
    name: 'CSS Gradient Generator',
    description: 'Create beautiful CSS gradients with advanced controls, color stops, and real-time preview',
    icon: Palette,
    href: '/tools/css-gradient-generator',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    borderColor: 'border-purple-600/20',
    category: 'design',
    tags: ['css', 'gradient', 'design', 'colors', 'linear', 'radial']
  },
  {
    name: 'PX to REM Converter',
    description: 'Convert pixel values to REM units with bulk conversion and customizable base font size',
    icon: Calculator,
    href: '/tools/px-to-rem-converter',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/20',
    category: 'design',
    tags: ['px', 'rem', 'convert', 'css', 'responsive', 'units']
  },
  {
    name: 'Responsive Design Tester',
    description: 'Test websites across multiple device viewports with synchronized scrolling and screenshots',
    icon: Monitor,
    href: '/tools/responsive-design-tester',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/20',
    category: 'design',
    tags: ['responsive', 'design', 'viewport', 'mobile', 'tablet', 'desktop', 'testing']
  },
  {
    name: 'Color Palette Extractor',
    description: 'Extract dominant colors from images and generate harmonious color palettes',
    icon: Palette,
    href: '/tools/color-palette',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    category: 'design',
    tags: ['color', 'palette', 'extract', 'image', 'design', 'harmony']
  },
  {
    name: 'HTML Email Tester',
    description: 'Test HTML email rendering across different email clients with responsive design and dark mode',
    icon: Mail,
    href: '/tools/html-email-tester',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    category: 'development',
    tags: ['html', 'email', 'test', 'responsive', 'dark mode', 'clients']
  },
  {
    name: 'Faker Data Generator',
    description: 'Generate realistic fake data for testing, including names, emails, addresses, and Lorem Ipsum',
    icon: Shuffle,
    href: '/tools/faker-data-generator',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    category: 'generators',
    tags: ['fake', 'data', 'generator', 'testing', 'lorem', 'names', 'emails']
  },
  {
    name: 'SQL Query Generator',
    description: 'Generate SQL queries from natural language descriptions with AI-powered assistance',
    icon: Database,
    href: '/tools/sql-query-generator',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    category: 'development',
    tags: ['sql', 'query', 'generator', 'database', 'ai', 'natural language']
  },
  {
    name: 'Hash Generator & Verifier',
    description: 'Generate MD5, SHA1, SHA256, and SHA512 hashes for text and files with verification',
    icon: Hash,
    href: '/tools/hash-generator',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    category: 'security',
    tags: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'verify', 'checksum']
  },
  {
    name: 'Password Generator',
    description: 'Generate secure, customizable passwords with strength analysis and bulk generation',
    icon: Key,
    href: '/tools/password-generator',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    category: 'security',
    tags: ['password', 'generate', 'secure', 'strength', 'random', 'security']
  },
  {
    name: 'REST API Client',
    description: 'Test REST APIs with full HTTP method support, headers, and response analysis',
    icon: Send,
    href: '/tools/rest-client',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    category: 'api',
    tags: ['rest', 'api', 'http', 'client', 'testing', 'postman', 'requests']
  }
];

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30 pt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Grid3X3 className="h-12 w-12 text-primary mr-4 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 text-primary/20 animate-ping" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Developer Tools
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive suite of utilities designed to streamline your development workflow.
              Choose from our collection of powerful, fast, and reliable tools.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12 space-y-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`transition-all duration-200 hover:scale-105 ${
                    selectedCategory === category.id ? category.color : ''
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedCategory !== 'all') && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: &quot;{searchQuery}&quot;
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {categories.find(c => c.id === selectedCategory)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => setSelectedCategory('all')}
                    />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="text-center mb-8">
            <p className="text-muted-foreground">
              Showing {filteredTools.length} of {tools.length} tools
            </p>
          </div>

          {/* Tools Grid - 3 columns for desktop */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.name}
                    className={`transition-all duration-700 delay-${index * 100} opacity-100 translate-y-0`}
                  >
                    <Link href={tool.href}>
                      <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:${tool.borderColor} h-full ${tool.bgColor} backdrop-blur-sm`}>
                        <CardHeader className="text-center p-6">
                          <div className="flex justify-center mb-4">
                            <div className={`p-4 rounded-full ${tool.bgColor} group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                              <IconComponent className={`h-8 w-8 ${tool.color} group-hover:animate-pulse`} />
                            </div>
                          </div>
                          <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {tool.name}
                          </CardTitle>
                          <CardDescription className="text-sm leading-relaxed line-clamp-3">
                            {tool.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {tool.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {tool.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{tool.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}