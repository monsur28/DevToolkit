'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Key, 
  Shield, 
  Hash,
  Wrench,
  ArrowRight,
  Sparkles,
  Zap,
  Code,
  Users,
  Star,
  TrendingUp,
  Palette,
  Calculator,
  Monitor
} from 'lucide-react';
import { useEffect, useState } from 'react';

const featuredTools = [
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data with syntax highlighting',
    icon: FileText,
    href: '/tools/json-formatter',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    name: 'JWT Decoder & Creator',
    description: 'Decode and inspect JWT tokens with detailed analysis',
    icon: Shield,
    href: '/tools/jwt-decoder',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  {
    name: 'CSS Gradient Generator', 
    description: 'Create beautiful CSS gradients with advanced controls',
    icon: Palette,
    href: '/tools/css-gradient-generator',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    borderColor: 'border-purple-600/20'
  },
  {
    name: 'PX to REM Converter',
    description: 'Convert pixel values to REM units with bulk conversion',
    icon: Calculator,
    href: '/tools/px-to-rem-converter',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/20'
  },
  {
    name: 'Responsive Design Tester',
    description: 'Test websites across multiple device viewports',
    icon: Monitor,
    href: '/tools/responsive-design-tester',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/20'
  },
  {
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings with ease',
    icon: Key,
    href: '/tools/base64',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  }
];

const stats = [
  { label: 'Developer Tools', value: '20+', icon: Wrench },
  { label: 'Lines of Code Processed', value: '50k+', icon: Code },
  { label: 'Happy Developers', value: '10K+', icon: Users },
  { label: 'GitHub Stars', value: '50+', icon: Star }
];

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

            <div className={`relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <Wrench className="h-16 w-16 text-primary animate-bounce" />
                  <div className="absolute inset-0 h-16 w-16 text-primary/20 animate-ping" />
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden border-r-4 border-white animate-typing">
                DevToolkit
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                Your ultimate toolkit for development productivity. 
                <span className="text-primary font-semibold"> Beautiful</span>, 
                <span className="text-blue-600 font-semibold"> fast</span>, and 
                <span className="text-purple-600 font-semibold"> powerful</span> utilities 
                at your fingertips.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/tools">
                  <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    <span className="relative z-10 flex items-center">
                      Explore Tools
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </Link>
                
                <Link href="/about">
                  <Button variant="outline" size="lg" className="group transition-all duration-300 hover:scale-105 hover:border-primary/50">
                    <Sparkles className="mr-2 h-4 w-4 group-hover:animate-spin" />
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Animated Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div 
                      key={index}
                      className={`text-center p-4 rounded-lg transition-all duration-500 ${
                        currentStat === index 
                          ? 'bg-primary/10 border border-primary/20 scale-105' 
                          : 'bg-muted/50 hover:bg-muted/80'
                      }`}
                    >
                      <IconComponent className={`h-6 w-6 mx-auto mb-2 ${
                        currentStat === index ? 'text-primary animate-pulse' : 'text-muted-foreground'
                      }`} />
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Featured Tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our most popular developer utilities, crafted for efficiency and ease of use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {featuredTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.name}
                  className={`transition-all duration-700 delay-${index * 100} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <Link href={tool.href}>
                    <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:${tool.borderColor} h-full ${tool.bgColor} backdrop-blur-sm`}>
                      <CardHeader className="text-center p-6">
                        <div className="flex justify-center mb-4">
                          <div className={`p-4 rounded-full ${tool.bgColor} group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                            <IconComponent className={`h-8 w-8 ${tool.color} group-hover:animate-pulse`} />
                          </div>
                        </div>
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </div>
              );
            })}
          </div>

          <div className={`text-center mt-12 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link href="/tools">
              <Button variant="outline" size="lg" className="group transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground">
                View All Tools
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 rounded-3xl p-12 backdrop-blur-sm border border-primary/20">
              <Zap className="h-12 w-12 text-primary mx-auto mb-6 animate-pulse" />
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Ready to boost your productivity?
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of developers who trust DevToolkit for their daily workflow.
                Free, fast, and always improving.
              </p>
              <Link href="/tools">
                <Button size="lg" className="group bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <span className="flex items-center">
                    Get Started Now
                    <Sparkles className="ml-2 h-4 w-4 group-hover:animate-spin" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}