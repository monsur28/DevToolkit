'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Key, Copy, RefreshCw, Trash2, Shield, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  feedback: string[];
}

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [passwords, setPasswords] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(true);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  });
  const { toast } = useToast();

  const characterSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O',
    ambiguous: '{}[]()/\\\'"`~,;.<>'
  };

  const generatePassword = (): string => {
    let charset = '';
    
    if (options.includeUppercase) charset += characterSets.uppercase;
    if (options.includeLowercase) charset += characterSets.lowercase;
    if (options.includeNumbers) charset += characterSets.numbers;
    if (options.includeSymbols) charset += characterSets.symbols;
    
    if (options.excludeSimilar) {
      charset = charset.split('').filter(char => !characterSets.similar.includes(char)).join('');
    }
    
    if (options.excludeAmbiguous) {
      charset = charset.split('').filter(char => !characterSets.ambiguous.includes(char)).join('');
    }
    
    if (charset === '') {
      throw new Error('At least one character type must be selected');
    }
    
    let result = '';
    for (let i = 0; i < options.length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return result;
  };

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];
    
    // Length scoring
    if (pwd.length >= 12) score += 25;
    else if (pwd.length >= 8) score += 15;
    else feedback.push('Use at least 8 characters');
    
    // Character variety scoring
    if (/[a-z]/.test(pwd)) score += 15;
    else feedback.push('Add lowercase letters');
    
    if (/[A-Z]/.test(pwd)) score += 15;
    else feedback.push('Add uppercase letters');
    
    if (/[0-9]/.test(pwd)) score += 15;
    else feedback.push('Add numbers');
    
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;
    else feedback.push('Add special characters');
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(pwd)) {
      score -= 10;
      feedback.push('Avoid repeated characters');
    }
    
    if (/123|abc|qwe/i.test(pwd)) {
      score -= 15;
      feedback.push('Avoid common sequences');
    }
    
    // Bonus for length
    if (pwd.length >= 16) score += 10;
    
    score = Math.max(0, Math.min(100, score));
    
    let label = 'Very Weak';
    let color = 'bg-red-500';
    
    if (score >= 80) {
      label = 'Very Strong';
      color = 'bg-green-500';
    } else if (score >= 60) {
      label = 'Strong';
      color = 'bg-blue-500';
    } else if (score >= 40) {
      label = 'Medium';
      color = 'bg-yellow-500';
    } else if (score >= 20) {
      label = 'Weak';
      color = 'bg-orange-500';
    }
    
    return { score, label, color, feedback };
  };

  const handleGenerate = () => {
    try {
      const newPassword = generatePassword();
      setPassword(newPassword);
      toast({
        title: "Success",
        description: "Password generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate password",
        variant: "destructive"
      });
    }
  };

  const generateMultiple = () => {
    try {
      const newPasswords = Array.from({ length: 10 }, () => generatePassword());
      setPasswords(newPasswords);
      toast({
        title: "Success",
        description: "10 passwords generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate passwords",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
  };

  const clear = () => {
    setPassword('');
    setPasswords([]);
  };

  const updateOption = (key: keyof PasswordOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const strength = password ? calculatePasswordStrength(password) : null;

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure, customizable passwords with strength analysis"
      icon={<Key className="h-8 w-8 text-blue-500" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Password Options</CardTitle>
              <CardDescription>Customize your password requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Length: {options.length}</label>
                  <span className="text-xs text-muted-foreground">4-128 characters</span>
                </div>
                <Slider
                  value={[options.length]}
                  onValueChange={(value) => updateOption('length', value[0])}
                  min={4}
                  max={128}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Character Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={options.includeUppercase}
                      onCheckedChange={(checked) => updateOption('includeUppercase', checked)}
                    />
                    <label htmlFor="uppercase" className="text-sm">Uppercase letters (A-Z)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={options.includeLowercase}
                      onCheckedChange={(checked) => updateOption('includeLowercase', checked)}
                    />
                    <label htmlFor="lowercase" className="text-sm">Lowercase letters (a-z)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={options.includeNumbers}
                      onCheckedChange={(checked) => updateOption('includeNumbers', checked)}
                    />
                    <label htmlFor="numbers" className="text-sm">Numbers (0-9)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={options.includeSymbols}
                      onCheckedChange={(checked) => updateOption('includeSymbols', checked)}
                    />
                    <label htmlFor="symbols" className="text-sm">Symbols (!@#$%^&*)</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Advanced Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeSimilar"
                      checked={options.excludeSimilar}
                      onCheckedChange={(checked) => updateOption('excludeSimilar', checked)}
                    />
                    <label htmlFor="excludeSimilar" className="text-sm">Exclude similar characters (i, l, 1, L, o, 0, O)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeAmbiguous"
                      checked={options.excludeAmbiguous}
                      onCheckedChange={(checked) => updateOption('excludeAmbiguous', checked)}
                    />
                    <label htmlFor="excludeAmbiguous" className="text-sm">Exclude ambiguous characters ({`{} [] () /\\ ' " \` ~ , ; . < >`})</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerate} className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Generate</span>
                </Button>
                <Button onClick={generateMultiple} variant="outline" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Generate 10</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Password */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Generated Password</CardTitle>
                  <CardDescription>Your secure password</CardDescription>
                </div>
                {password && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm"
                      variant="ghost"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button onClick={() => copyToClipboard(password)} size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {password ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <Input
                      value={password}
                      readOnly
                      type={showPassword ? 'text' : 'password'}
                      className="font-mono text-lg bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  
                  {strength && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Password Strength</span>
                        <span className={`text-sm font-medium ${
                          strength.score >= 80 ? 'text-green-600' :
                          strength.score >= 60 ? 'text-blue-600' :
                          strength.score >= 40 ? 'text-yellow-600' :
                          strength.score >= 20 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <Progress value={strength.score} className="h-2" />
                      
                      {strength.feedback.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Suggestions:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {strength.feedback.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click &quot;Generate&quot; to create a secure password</p>
                </div>
              )}
            </CardContent>
          </Card>

          {passwords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multiple Passwords</CardTitle>
                <CardDescription>Choose from 10 generated passwords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {passwords.map((pwd, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded group">
                      <span className="font-mono text-sm flex-1 mr-2">
                        {showPassword ? pwd : '•'.repeat(pwd.length)}
                      </span>
                      <Button
                        onClick={() => copyToClipboard(pwd)}
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-1">Password Best Practices:</h4>
                <ul className="space-y-1">
                  <li>• Use unique passwords for each account</li>
                  <li>• Enable two-factor authentication when available</li>
                  <li>• Store passwords in a reputable password manager</li>
                  <li>• Never share passwords via email or text</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Recommended Length:</h4>
                <ul className="space-y-1">
                  <li>• <strong>12+ characters:</strong> Good for most accounts</li>
                  <li>• <strong>16+ characters:</strong> Better for important accounts</li>
                  <li>• <strong>20+ characters:</strong> Excellent for high-security needs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}