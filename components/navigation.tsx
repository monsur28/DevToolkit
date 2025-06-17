'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Moon, 
  Sun, 
  Menu, 
  Grid3X3, 
  Heart, 
  Mail, 
  ChevronDown, 
  Sparkles, 
  Zap, 
  Palette,
  X,
  ArrowRight,
  Star,
  Database,
  Search,
  Calendar,
  Shuffle,
  Monitor,
  Send,
  Brain,
  FileText,
  GitCommit,
  Bug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

const tools = [
  { name: 'AI SQL Query Generator', href: '/tools/sql-query-generator', category: 'AI-Powered', icon: '🤖', aiPowered: true },
  { name: 'AI Regex Generator', href: '/tools/regex-tester', category: 'AI-Powered', icon: '🔍', aiPowered: true },
  { name: 'AI Cron Generator', href: '/tools/cron-generator', category: 'AI-Powered', icon: '📅', aiPowered: true },
  { name: 'AI Code Optimizer', href: '/tools/code-formatter', category: 'AI-Powered', icon: '⚡', aiPowered: true },
  { name: 'AI Data Generator', href: '/tools/faker-data-generator', category: 'AI-Powered', icon: '🎲', aiPowered: true },
  { name: 'AI Bug Finder', href: '/tools/ai-bug-finder', category: 'AI-Powered', icon: '🐛', aiPowered: true },
  { name: 'Commit Message Generator', href: '/tools/commit-message-generator', category: 'AI-Powered', icon: '📝', aiPowered: true },
  { name: 'README Generator', href: '/tools/readme-generator', category: 'AI-Powered', icon: '📚', aiPowered: true },
  { name: 'API Response Analyzer', href: '/tools/api-response-analyzer', category: 'AI-Powered', icon: '🔍', aiPowered: true },
  { name: 'Learning Assistant', href: '/tools/learning-assistant', category: 'AI-Powered', icon: '🧠', aiPowered: true },
  { name: 'CSS Gradient Generator', href: '/tools/css-gradient-generator', category: 'Design', icon: '🎨' },
  { name: 'Responsive Design Tester', href: '/tools/responsive-design-tester', category: 'Design', icon: '📱' },
  { name: 'Color Palette Extractor', href: '/tools/color-palette', category: 'Design', icon: '🎨' },
  { name: 'REST API Client', href: '/tools/rest-client', category: 'API Tools', icon: '🌐' }
];

const toolCategories = {
  'AI-Powered': { tools: tools.filter(t => t.category === 'AI-Powered'), icon: Brain, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  'Design': { tools: tools.filter(t => t.category === 'Design'), icon: Palette, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  'API Tools': { tools: tools.filter(t => t.category === 'API Tools'), icon: Send, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' }
};

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Tools', href: '/tools', icon: Grid3X3, hasDropdown: true }
];

const endNavItems = [
  { name: 'About', href: '/about', icon: Heart },
  { name: 'Contact', href: '/contact', icon: Mail }
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const logoSrc = `https://res.cloudinary.com/dg8w1kluo/image/upload/v1750086960/DevToolkit_vpwgql.png`;

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const ThemeToggle = () => (
    <>
      {/* Desktop Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="hidden lg:flex rounded-full p-3 transition-all duration-300 hover:scale-110 hover:rotate-12 relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-500 transition-transform duration-300 group-hover:rotate-12" />
        ) : (
          <Moon className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:-rotate-12" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Mobile Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="lg:hidden rounded-full p-2"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-yellow-500" />
        ) : (
          <Moon className="h-4 w-4 text-blue-600" />
        )}
      </Button>
    </>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-xl border-b shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group relative">
            <div className="relative h-20 w-48">
              <Image
                src={logoSrc}
                alt="DevToolkit Logo"
                fill
                className="object-contain"
                sizes="192px"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-12">
            <div className="flex items-center space-x-2 bg-muted/50 backdrop-blur-sm rounded-full p-2 border border-border/50">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href || (item.href === '/tools' && pathname.startsWith('/tools'));
                
                if (item.hasDropdown) {
                  return (
                    <DropdownMenu key={item.href}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className={`flex items-center space-x-2 rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 relative group ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-lg' 
                              : 'hover:bg-background/80 hover:shadow-md'
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span className="font-medium">{item.name}</span>
                          <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                          
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-20 animate-pulse" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="center" 
                        className="w-[500px] max-h-[80vh] overflow-y-auto mt-2 border-0 shadow-2xl bg-background/95 backdrop-blur-xl"
                        sideOffset={8}
                      >
                        <div className="p-4 border-b bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                          <DropdownMenuItem asChild>
                            <Link href="/tools" className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/10 transition-colors">
                              <div className="flex items-center">
                                <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                                  <Brain className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                  <div className="font-semibold text-lg">AI-Enhanced Tools</div>
                                  <div className="text-sm text-muted-foreground">Browse our {tools.length} intelligent developer tools</div>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </DropdownMenuItem>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-4">
                            {Object.entries(toolCategories).map(([category, { tools: categoryTools, icon: CategoryIcon, color, bgColor }]) => (
                              <div key={category} className={`p-4 rounded-xl border ${bgColor} hover:shadow-md transition-all duration-300 hover:scale-105`}>
                                <div className="flex items-center mb-3">
                                  <div className={`p-2 ${bgColor} rounded-lg mr-3`}>
                                    <CategoryIcon className={`h-4 w-4 ${color}`} />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-sm flex items-center">
                                      {category}
                                      {category === 'AI-Powered' && (
                                        <Sparkles className="h-3 w-3 ml-1 text-purple-500" />
                                      )}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{categoryTools.length} tools</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  {categoryTools.map((tool) => (
                                    <DropdownMenuItem key={tool.href} asChild>
                                      <Link 
                                        href={tool.href} 
                                        className="flex items-center text-xs py-2 px-2 rounded-md hover:bg-background/50 transition-colors"
                                      >
                                        <span className="mr-2 text-sm">{tool.icon}</span>
                                        <span className="truncate">{tool.name}</span>
                                        {tool.aiPowered && (
                                          <Sparkles className="h-3 w-3 ml-auto text-purple-500" />
                                        )}
                                      </Link>
                                    </DropdownMenuItem>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="p-4 border-t bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                          <DropdownMenuItem asChild>
                            <Link 
                              href="/tools" 
                              className="flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-blue-600 hover:to-purple-600 transition-colors font-medium"
                            >
                              <Brain className="h-4 w-4 mr-2" />
                              Explore All AI Tools
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className={`flex items-center space-x-2 rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 relative ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'hover:bg-background/80 hover:shadow-md'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{item.name}</span>
                      
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-20 animate-pulse" />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {endNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className={`flex items-center space-x-2 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted/80'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
            
            {mounted && <ThemeToggle />}
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center space-x-2">
            {mounted && <ThemeToggle />}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Brain className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">DevToolkit</div>
                      <div className="text-xs text-muted-foreground">AI-Enhanced Developer Tools</div>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="space-y-2">
                    {[...navItems.filter(item => !item.hasDropdown), ...endNavItems].map((item) => {
                      const IconComponent = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                          <Button 
                            variant={isActive ? 'secondary' : 'ghost'}
                            className="w-full justify-start py-3 px-4 rounded-xl transition-all duration-200 hover:translate-x-1"
                          >
                            <IconComponent className="h-5 w-5 mr-3" />
                            <span className="font-medium">{item.name}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                        AI Tools
                      </h3>
                      <span className="text-xs text-muted-foreground bg-purple-500/10 px-2 py-1 rounded-full">
                        {tools.filter(t => t.aiPowered).length} AI-powered
                      </span>
                    </div>
                    
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {tools.map((tool) => (
                        <Link key={tool.href} href={tool.href} onClick={() => setIsOpen(false)}>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm py-2 px-3 rounded-lg transition-all duration-200 hover:translate-x-1 hover:bg-muted/80"
                          >
                            <span className="mr-3 text-base">{tool.icon}</span>
                            <span className="truncate">{tool.name}</span>
                            {tool.aiPowered && (
                              <Sparkles className="h-3 w-3 ml-auto text-purple-500" />
                            )}
                          </Button>
                        </Link>
                      ))}
                    </div>
                    
                    <Link href="/tools" onClick={() => setIsOpen(false)}>
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        View All {tools.length} Tools
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}