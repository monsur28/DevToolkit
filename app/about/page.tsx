'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  GitFork, 
  Star, 
  Users, 
  Code, 
  Heart,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Zap,
  Globe,
  Calendar,
  TrendingUp
} from 'lucide-react';

const projectStats = [
  { label: 'Tools Available', value: '20+', icon: Code },
  { label: 'GitHub Stars', value: '50+', icon: Star },
  { label: 'Lines of Code', value: '50K+', icon: Code },
  { label: 'Monthly Users', value: '5K+', icon: Globe }
];

const milestones = [
  {
    date: 'January 2025',
    title: 'Project Launch',
    description: 'Initial release with 6 core developer tools',
    status: 'completed'
  },
  {
    date: 'March 2025',
    title: 'UI/UX Redesign',
    description: 'Complete interface overhaul with modern design',
    status: 'completed'
  },
  {
    date: 'April 2025',
    title: 'Tool Expansion',
    description: 'Added 6 additional tools based on community feedback',
    status: 'completed'
  },
  {
    date: 'May 2025',
    title: 'Performance Optimization',
    description: 'Major performance improvements and bug fixes',
    status: 'in-progress'
  },
  {
    date: 'December 2025',
    title: 'API Integration',
    description: 'Public API for developers to integrate tools',
    status: 'planned'
  }
];

const contributionSteps = [
  {
    step: 1,
    title: 'Fork the Repository',
    description: 'Start by forking our GitHub repository to your account',
    icon: GitFork
  },
  {
    step: 2,
    title: 'Clone & Setup',
    description: 'Clone your fork locally and install dependencies',
    icon: Code
  },
  {
    step: 3,
    title: 'Create a Branch',
    description: 'Create a new branch for your feature or bug fix',
    icon: ArrowRight
  },
  {
    step: 4,
    title: 'Make Changes',
    description: 'Implement your changes following our coding standards',
    icon: Lightbulb
  },
  {
    step: 5,
    title: 'Test & Submit',
    description: 'Test your changes and submit a pull request',
    icon: CheckCircle
  }
];

const techRequirements = [
  'Node.js 18+ and npm/yarn',
  'React 18+ and Next.js 13+',
  'TypeScript knowledge',
  'Tailwind CSS familiarity',
  'Git version control'
];

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 mt-20">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center justify-center mb-6">
                <Heart className="h-12 w-12 text-red-500 mr-4 animate-pulse" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  About DevToolkit
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                An open-source project dedicated to providing developers with beautiful, 
                fast, and reliable tools to enhance productivity and streamline workflows.
              </p>
            </div>
          </div>

          {/* Project Stats */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {projectStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={stat.label} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mission & Goals */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Target className="h-6 w-6 mr-2 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  To democratize access to high-quality developer tools by creating an 
                  open-source platform that combines functionality, beauty, and performance. 
                  I believe every developer deserves access to tools that make their work 
                  more efficient and enjoyable.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Open Source</Badge>
                  <Badge variant="secondary">Developer-First</Badge>
                  <Badge variant="secondary">Community-Driven</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Zap className="h-6 w-6 mr-2 text-primary" />
                  Our Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Provide 25+ essential developer tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Maintain 99.9% uptime and fast performance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Build a thriving contributor community</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Offer API access for tool integration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Project Timeline */}
          <div id="changelog" className={`mb-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-primary" />
                  Project Timeline
                </CardTitle>
                <CardDescription>
                  Key milestones and upcoming features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in-progress' ? 'bg-yellow-500' :
                        'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          <Badge variant={
                            milestone.status === 'completed' ? 'default' :
                            milestone.status === 'in-progress' ? 'secondary' :
                            'outline'
                          }>
                            {milestone.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{milestone.description}</p>
                        <p className="text-xs text-muted-foreground">{milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contribute Section */}
          <div id="contribute" className={`mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Github className="h-6 w-6 mr-2 text-primary" />
                  How to Contribute
                </CardTitle>
                <CardDescription>
                  Join our community and help make DevToolkit even better
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Contribution Steps */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {contributionSteps.map((step) => {
                    const IconComponent = step.icon;
                    return (
                      <div key={step.step} className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-sm font-medium mb-1">Step {step.step}</div>
                        <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Technical Requirements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Code className="h-5 w-5 mr-2 text-primary" />
                      Technical Requirements
                    </h3>
                    <ul className="space-y-2">
                      {techRequirements.map((req, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                      Ways to Contribute
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Add new developer tools</li>
                      <li>• Improve existing tool functionality</li>
                      <li>• Fix bugs and performance issues</li>
                      <li>• Enhance UI/UX design</li>
                      <li>• Write documentation</li>
                      <li>• Report issues and suggest features</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button asChild className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-purple-600">
                    <a href="https://github.com/monsur28" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      Fork on GitHub
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <a href="/contact">
                      <Heart className="h-4 w-4 mr-2" />
                      Get in Touch
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className={`text-center transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="shadow-lg bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/20">
              <CardContent className="p-12">
                <Github className="h-12 w-12 text-primary mx-auto mb-6 animate-pulse" />
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Ready to Contribute?
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join our growing community of developers and help us build the ultimate 
                  toolkit for developers worldwide. Every contribution makes a difference!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-purple-600">
                    <a href="https://github.com/monsur28" target="_blank" rel="noopener noreferrer">
                      <Star className="h-4 w-4 mr-2" />
                      Star on GitHub
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/contact">
                      <Heart className="h-4 w-4 mr-2" />
                      Contact Us
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}