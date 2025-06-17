'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Terminal,
  Calendar,
  Zap,
  Grid3X3,
  Filter,
  X,
  Palette,
  Calculator,
  Monitor,
  Shuffle,
  Database,
  Send,
  Sparkles,
  Brain
} from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Tools', color: 'bg-primary/10 text-primary' },
  { id: 'ai-powered', name: 'AI-Powered', color: 'bg-purple-500/10 text-purple-600' },
  { id: 'development', name: 'Development', color: 'bg-green-500/10 text-green-600' },
  { id: 'design', name: 'Design & CSS', color: 'bg-cyan-500/10 text-cyan-600' },
  { id: 'generators', name: 'Generators', color: 'bg-emerald-500/10 text-emerald-600' },
  { id: 'api', name: 'API Tools', color: 'bg-indigo-500/10 text-indigo-600' }
];

const tools = [
  {
    name: 'AI SQL Query Generator',
    description: 'Generate complex SQL queries from natural language using Gemini AI',
    icon: Database,
    href: '/tools/sql-query-generator',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    category: 'ai-powered',
    tags: ['sql', 'ai', 'database', 'gemini', 'natural language'],
    aiPowered: true
  },
  {
    name: 'AI Regex Generator',
    description: 'Create regex patterns from descriptions with AI-powered explanations',
    icon: Search,
    href: '/tools/regex-tester',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    category: 'ai-powered',
    tags: ['regex', 'ai', 'pattern', 'gemini', 'smart'],
    aiPowered: true
  },
  {
    name: 'AI Cron Generator',
    description: 'Build cron expressions from natural language with intelligent scheduling',
    icon: Calendar,
    href: '/tools/cron-generator',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    category: 'ai-powered',
    tags: ['cron', 'ai', 'schedule', 'gemini', 'automation'],
    aiPowered: true
  },
  {
    name: 'AI Code Optimizer',
    description: 'Optimize and explain code with AI-powered analysis and improvements',
    icon: Zap,
    href: '/tools/code-formatter',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    category: 'ai-powered',
    tags: ['code', 'ai', 'optimize', 'gemini', 'analysis'],
    aiPowered: true
  },
  {
    name: 'AI Data Generator',
    description: 'Generate realistic test data from schema descriptions using AI',
    icon: Shuffle,
    href: '/tools/faker-data-generator',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    category: 'ai-powered',
    tags: ['data', 'ai', 'generator', 'gemini', 'testing'],
    aiPowered: true
  },
  {
    name: 'CSS Gradient Generator',
    description: 'Create beautiful CSS gradients with advanced controls and real-time preview',
    icon: Palette,
    href: '/tools/css-gradient-generator',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    borderColor: 'border-purple-600/20',
    category: 'design',
    tags: ['css', 'gradient', 'design', 'colors', 'linear', 'radial']
  },
  {
    name: 'Responsive Design Tester',
    description: 'Test websites across multiple device viewports with synchronized scrolling',
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

  const aiToolsCount = tools.filter(tool => tool.aiPowered).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30 pt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Brain className="h-12 w-12 text-purple-500 mr-4 animate-pulse" />
                <div className="absolute inset-0 h-12 w-12 text-purple-500/20 animate-ping" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                AI-Enhanced DevToolkit
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Next-generation developer tools powered by <span className="text-purple-600 font-semibold">Gemini AI</span>.
              Streamlined, intelligent, and designed for modern development workflows.
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge variant="secondary" className="px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                {aiToolsCount} AI-Powered Tools
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Grid3X3 className="h-4 w-4 mr-2" />
                {tools.length} Total Tools
              </Badge>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-12 space-y-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search AI-powered tools..."
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
                    Search: "{searchQuery}"
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
              {selectedCategory === 'ai-powered' && (
                <span className="ml-2 text-purple-600 font-medium">
                  ✨ AI-Enhanced Experience
                </span>
              )}
            </p>
          </div>

          {/* Tools Grid */}
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
                      <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:${tool.borderColor} h-full ${tool.bgColor} backdrop-blur-sm relative overflow-hidden`}>
                        {tool.aiPowered && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="text-center p-6">
                          <div className="flex justify-center mb-4">
                            <div className={`p-4 rounded-full ${tool.bgColor} group-hover:scale-110 transition-all duration-300 shadow-lg relative`}>
                              <IconComponent className={`h-8 w-8 ${tool.color} group-hover:animate-pulse`} />
                              {tool.aiPowered && (
                                <div className="absolute -top-1 -right-1">
                                  <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                                </div>
                              )}
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

          {/* AI Features Highlight */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 border-purple-500/20">
              <CardHeader className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-purple-500 mr-3" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Powered by Gemini AI
                  </h3>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Experience the next generation of developer tools with intelligent automation, 
                  natural language processing, and AI-powered code optimization. 
                  Each AI tool learns and adapts to provide better results.
                </p>
                <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{aiToolsCount}</div>
                    <div className="text-sm text-muted-foreground">AI Tools</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">∞</div>
                    <div className="text-sm text-muted-foreground">Possibilities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">10x</div>
                    <div className="text-sm text-muted-foreground">Productivity</div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}