'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Copy, Trash2, Download, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeminiAPI } from '@/lib/gemini';

interface ProjectInfo {
  name: string;
  description: string;
  tech: string;
  features: string;
  installation: string;
  usage: string;
  license: string;
  author: string;
  repository: string;
}

interface ReadmeSection {
  id: string;
  name: string;
  enabled: boolean;
  required?: boolean;
}

export default function ReadmeGeneratorPage() {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: '',
    description: '',
    tech: '',
    features: '',
    installation: '',
    usage: '',
    license: 'MIT',
    author: '',
    repository: ''
  });
  
  const [sections, setSections] = useState<ReadmeSection[]>([
    { id: 'title', name: 'Title & Description', enabled: true, required: true },
    { id: 'badges', name: 'Badges', enabled: true },
    { id: 'demo', name: 'Demo/Screenshots', enabled: true },
    { id: 'features', name: 'Features', enabled: true },
    { id: 'tech', name: 'Tech Stack', enabled: true },
    { id: 'installation', name: 'Installation', enabled: true, required: true },
    { id: 'usage', name: 'Usage', enabled: true, required: true },
    { id: 'api', name: 'API Documentation', enabled: false },
    { id: 'contributing', name: 'Contributing', enabled: true },
    { id: 'license', name: 'License', enabled: true },
    { id: 'contact', name: 'Contact/Support', enabled: true },
    { id: 'acknowledgments', name: 'Acknowledgments', enabled: false },
  ]);

  const [generatedReadme, setGeneratedReadme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState('comprehensive');
  const { toast } = useToast();

  const templates = [
    { value: 'minimal', label: 'Minimal', description: 'Basic README with essential sections' },
    { value: 'comprehensive', label: 'Comprehensive', description: 'Detailed README with all sections' },
    { value: 'open-source', label: 'Open Source', description: 'Perfect for open source projects' },
    { value: 'library', label: 'Library/Package', description: 'For npm packages and libraries' },
    { value: 'api', label: 'API Project', description: 'For REST APIs and backend services' },
  ];

  const generateReadme = async () => {
    if (!projectInfo.name.trim() || !projectInfo.description.trim()) {
      toast({
        title: "Error",
        description: "Please provide at least project name and description",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const gemini = new GeminiAPI();
      const enabledSections = sections.filter(s => s.enabled).map(s => s.id);
      const readme = await gemini.generateReadme(projectInfo, enabledSections, template);
      
      setGeneratedReadme(readme);
      
      toast({
        title: "README Generated",
        description: "Professional README.md created successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate README",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateProjectInfo = (field: keyof ProjectInfo, value: string) => {
    setProjectInfo(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id && !section.required 
        ? { ...section, enabled: !section.enabled }
        : section
    ));
  };

  const copyReadme = async () => {
    await navigator.clipboard.writeText(generatedReadme);
    toast({
      title: "Copied!",
      description: "README content copied to clipboard",
    });
  };

  const downloadReadme = () => {
    const blob = new Blob([generatedReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "README.md file downloaded successfully",
    });
  };

  const clear = () => {
    setProjectInfo({
      name: '',
      description: '',
      tech: '',
      features: '',
      installation: '',
      usage: '',
      license: 'MIT',
      author: '',
      repository: ''
    });
    setGeneratedReadme('');
  };

  const loadExample = () => {
    setProjectInfo({
      name: 'TaskFlow',
      description: 'A modern task management application built with React and TypeScript',
      tech: 'React, TypeScript, Tailwind CSS, Node.js, PostgreSQL',
      features: 'Task creation and management, Real-time collaboration, Drag and drop interface, Team workspaces, Progress tracking',
      installation: 'npm install',
      usage: 'npm run dev',
      license: 'MIT',
      author: 'Your Name',
      repository: 'https://github.com/username/taskflow'
    });
  };

  return (
    <ToolLayout
      title="README Generator"
      description="Automatically generate professional project README templates with AI assistance"
      icon={<FileText className="h-8 w-8 text-blue-500" />}
    >
      <div className="space-y-6">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              Project Information
            </CardTitle>
            <CardDescription>Provide details about your project to generate a comprehensive README</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name *</label>
                <Input
                  placeholder="My Awesome Project"
                  value={projectInfo.name}
                  onChange={(e) => updateProjectInfo('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Repository URL</label>
                <Input
                  placeholder="https://github.com/username/project"
                  value={projectInfo.repository}
                  onChange={(e) => updateProjectInfo('repository', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="A brief description of what your project does and why it's useful"
                value={projectInfo.description}
                onChange={(e) => updateProjectInfo('description', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tech Stack</label>
                <Input
                  placeholder="React, Node.js, PostgreSQL, etc."
                  value={projectInfo.tech}
                  onChange={(e) => updateProjectInfo('tech', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Author</label>
                <Input
                  placeholder="Your Name"
                  value={projectInfo.author}
                  onChange={(e) => updateProjectInfo('author', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Key Features</label>
              <Textarea
                placeholder="List the main features of your project (one per line or comma-separated)"
                value={projectInfo.features}
                onChange={(e) => updateProjectInfo('features', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Installation Instructions</label>
                <Textarea
                  placeholder="npm install, git clone, etc."
                  value={projectInfo.installation}
                  onChange={(e) => updateProjectInfo('installation', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Usage Instructions</label>
                <Textarea
                  placeholder="How to run and use your project"
                  value={projectInfo.usage}
                  onChange={(e) => updateProjectInfo('usage', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template and Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Style</CardTitle>
              <CardDescription>Choose a README template that fits your project type</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(tmpl => (
                    <SelectItem key={tmpl.value} value={tmpl.value}>
                      <div>
                        <div className="font-medium">{tmpl.label}</div>
                        <div className="text-xs text-muted-foreground">{tmpl.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sections to Include</CardTitle>
              <CardDescription>Customize which sections appear in your README</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sections.map(section => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={section.enabled}
                      onCheckedChange={() => toggleSection(section.id)}
                      disabled={section.required}
                    />
                    <label className="text-sm flex-1">
                      {section.name}
                      {section.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={generateReadme}
            disabled={isGenerating}
            className="flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate README</span>
              </>
            )}
          </Button>
          <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </Button>
          <Button onClick={loadExample} variant="outline" size="sm">
            Load Example
          </Button>
        </div>

        {/* Generated README */}
        {generatedReadme && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Generated README.md</CardTitle>
                  <CardDescription>Your professional README is ready to use</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyReadme} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadReadme} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generatedReadme}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-muted"
              />
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">README Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Essential Sections:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Clear project title and description</li>
                  <li>• Installation and setup instructions</li>
                  <li>• Usage examples and documentation</li>
                  <li>• Contributing guidelines</li>
                  <li>• License information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pro Tips:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Add badges for build status, version, etc.</li>
                  <li>• Include screenshots or GIFs</li>
                  <li>• Write clear, concise descriptions</li>
                  <li>• Keep installation steps simple</li>
                  <li>• Add contact information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}