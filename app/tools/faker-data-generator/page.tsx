'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shuffle, Copy, Trash2, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface GeneratedData {
  type: string;
  data: any[];
}

export default function FakerDataGeneratorPage() {
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState('json');
  const [selectedFields, setSelectedFields] = useState(['name', 'email', 'phone']);
  const [generatedData, setGeneratedData] = useState<GeneratedData[]>([]);
  const [customText, setCustomText] = useState('');
  const { toast } = useToast();

  const dataTypes = {
    personal: [
      { id: 'name', label: 'Full Name', example: 'John Doe' },
      { id: 'firstName', label: 'First Name', example: 'John' },
      { id: 'lastName', label: 'Last Name', example: 'Doe' },
      { id: 'email', label: 'Email', example: 'john.doe@example.com' },
      { id: 'phone', label: 'Phone', example: '+1-555-123-4567' },
      { id: 'username', label: 'Username', example: 'johndoe123' },
      { id: 'avatar', label: 'Avatar URL', example: 'https://i.pravatar.cc/150' }
    ],
    address: [
      { id: 'address', label: 'Full Address', example: '123 Main St, City, State 12345' },
      { id: 'street', label: 'Street', example: '123 Main Street' },
      { id: 'city', label: 'City', example: 'New York' },
      { id: 'state', label: 'State', example: 'NY' },
      { id: 'zipCode', label: 'ZIP Code', example: '10001' },
      { id: 'country', label: 'Country', example: 'United States' }
    ],
    business: [
      { id: 'company', label: 'Company', example: 'Tech Corp Inc.' },
      { id: 'jobTitle', label: 'Job Title', example: 'Software Engineer' },
      { id: 'department', label: 'Department', example: 'Engineering' },
      { id: 'salary', label: 'Salary', example: '$75,000' },
      { id: 'website', label: 'Website', example: 'https://company.com' }
    ],
    internet: [
      { id: 'url', label: 'URL', example: 'https://example.com' },
      { id: 'domain', label: 'Domain', example: 'example.com' },
      { id: 'ip', label: 'IP Address', example: '192.168.1.1' },
      { id: 'mac', label: 'MAC Address', example: '00:1B:44:11:3A:B7' },
      { id: 'userAgent', label: 'User Agent', example: 'Mozilla/5.0...' }
    ],
    finance: [
      { id: 'creditCard', label: 'Credit Card', example: '4532-1234-5678-9012' },
      { id: 'iban', label: 'IBAN', example: 'GB29 NWBK 6016 1331 9268 19' },
      { id: 'bitcoin', label: 'Bitcoin Address', example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
      { id: 'price', label: 'Price', example: '$19.99' }
    ],
    date: [
      { id: 'date', label: 'Date', example: '2024-01-15' },
      { id: 'time', label: 'Time', example: '14:30:00' },
      { id: 'datetime', label: 'Date Time', example: '2024-01-15 14:30:00' },
      { id: 'timestamp', label: 'Timestamp', example: '1705329000' }
    ]
  };

  const generateFakeData = (type: string, count: number = 1): any[] => {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'name':
          data.push(`${generateFirstName()} ${generateLastName()}`);
          break;
        case 'firstName':
          data.push(generateFirstName());
          break;
        case 'lastName':
          data.push(generateLastName());
          break;
        case 'email':
          data.push(`${generateFirstName().toLowerCase()}.${generateLastName().toLowerCase()}@${generateDomain()}`);
          break;
        case 'phone':
          data.push(`+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`);
          break;
        case 'username':
          data.push(`${generateFirstName().toLowerCase()}${Math.floor(Math.random() * 1000)}`);
          break;
        case 'avatar':
          data.push(`https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`);
          break;
        case 'address':
          data.push(`${Math.floor(Math.random() * 9999) + 1} ${generateStreetName()}, ${generateCity()}, ${generateState()} ${generateZipCode()}`);
          break;
        case 'street':
          data.push(`${Math.floor(Math.random() * 9999) + 1} ${generateStreetName()}`);
          break;
        case 'city':
          data.push(generateCity());
          break;
        case 'state':
          data.push(generateState());
          break;
        case 'zipCode':
          data.push(generateZipCode());
          break;
        case 'country':
          data.push(generateCountry());
          break;
        case 'company':
          data.push(generateCompany());
          break;
        case 'jobTitle':
          data.push(generateJobTitle());
          break;
        case 'department':
          data.push(generateDepartment());
          break;
        case 'salary':
          data.push(`$${(Math.floor(Math.random() * 150000) + 30000).toLocaleString()}`);
          break;
        case 'website':
          data.push(`https://${generateDomain()}`);
          break;
        case 'url':
          data.push(`https://${generateDomain()}/${generatePath()}`);
          break;
        case 'domain':
          data.push(generateDomain());
          break;
        case 'ip':
          data.push(`${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`);
          break;
        case 'mac':
          data.push(Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase());
          break;
        case 'userAgent':
          data.push('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
          break;
        case 'creditCard':
          data.push(`${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`);
          break;
        case 'iban':
          data.push(`GB${Math.floor(Math.random() * 90) + 10} NWBK ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 90) + 10}`);
          break;
        case 'bitcoin':
          data.push(`1${Array.from({length: 33}, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]).join('')}`);
          break;
        case 'price':
          data.push(`$${(Math.random() * 1000).toFixed(2)}`);
          break;
        case 'date':
          const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
          data.push(date.toISOString().split('T')[0]);
          break;
        case 'time':
          data.push(`${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`);
          break;
        case 'datetime':
          const datetime = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
          data.push(datetime.toISOString().replace('T', ' ').split('.')[0]);
          break;
        case 'timestamp':
          data.push(Math.floor(Date.now() / 1000 - Math.random() * 365 * 24 * 60 * 60));
          break;
        default:
          data.push('Unknown');
      }
    }
    
    return data;
  };

  // Helper functions for generating realistic data
  const generateFirstName = () => {
    const names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Jessica', 'Daniel', 'Ashley', 'Matthew', 'Amanda', 'James', 'Jennifer', 'Robert', 'Lisa'];
    return names[Math.floor(Math.random() * names.length)];
  };

  const generateLastName = () => {
    const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
    return names[Math.floor(Math.random() * names.length)];
  };

  const generateDomain = () => {
    const domains = ['example.com', 'test.org', 'demo.net', 'sample.io', 'fake.co'];
    return domains[Math.floor(Math.random() * domains.length)];
  };

  const generateStreetName = () => {
    const streets = ['Main St', 'Oak Ave', 'First St', 'Second St', 'Park Ave', 'Elm St', 'Washington St', 'Maple Ave', 'Cedar St', 'Pine St'];
    return streets[Math.floor(Math.random() * streets.length)];
  };

  const generateCity = () => {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    return cities[Math.floor(Math.random() * cities.length)];
  };

  const generateState = () => {
    const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
    return states[Math.floor(Math.random() * states.length)];
  };

  const generateZipCode = () => {
    return Math.floor(Math.random() * 90000) + 10000;
  };

  const generateCountry = () => {
    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'Brazil', 'India', 'China'];
    return countries[Math.floor(Math.random() * countries.length)];
  };

  const generateCompany = () => {
    const companies = ['Tech Corp', 'Innovation Inc', 'Digital Solutions', 'Future Systems', 'Global Dynamics', 'Smart Technologies', 'Advanced Analytics', 'Creative Studios'];
    return companies[Math.floor(Math.random() * companies.length)];
  };

  const generateJobTitle = () => {
    const titles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Manager', 'Sales Representative', 'Business Analyst', 'DevOps Engineer'];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateDepartment = () => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Customer Support'];
    return departments[Math.floor(Math.random() * departments.length)];
  };

  const generatePath = () => {
    const paths = ['about', 'contact', 'products', 'services', 'blog', 'news', 'support', 'careers'];
    return paths[Math.floor(Math.random() * paths.length)];
  };

  const generateLoremIpsum = (wordCount: number = 50): string => {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];
    
    const result = [];
    for (let i = 0; i < wordCount; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    return result.join(' ');
  };

  const generateData = () => {
    const results: GeneratedData[] = [];
    
    if (selectedFields.length === 0) {
      toast({
        title: "No Fields Selected",
        description: "Please select at least one field to generate",
        variant: "destructive"
      });
      return;
    }

    if (selectedFields.length === 1) {
      // Single field generation
      const field = selectedFields[0];
      const data = generateFakeData(field, count);
      results.push({ type: field, data });
    } else {
      // Multiple fields - generate objects
      const data = [];
      for (let i = 0; i < count; i++) {
        const obj: any = {};
        selectedFields.forEach(field => {
          obj[field] = generateFakeData(field, 1)[0];
        });
        data.push(obj);
      }
      results.push({ type: 'combined', data });
    }
    
    setGeneratedData(results);
    toast({
      title: "Data Generated",
      description: `Generated ${count} records successfully`,
    });
  };

  const generateLorem = () => {
    const wordCount = parseInt(customText) || 50;
    const lorem = generateLoremIpsum(wordCount);
    setGeneratedData([{ type: 'lorem', data: [lorem] }]);
    toast({
      title: "Lorem Ipsum Generated",
      description: `Generated ${wordCount} words of Lorem Ipsum`,
    });
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const formatOutput = (data: GeneratedData[]): string => {
    if (data.length === 0) return '';
    
    const result = data[0];
    
    switch (format) {
      case 'json':
        return JSON.stringify(result.data, null, 2);
      case 'csv':
        if (result.type === 'combined' && result.data.length > 0) {
          const headers = Object.keys(result.data[0]);
          const csvRows = [
            headers.join(','),
            ...result.data.map((row: any) => headers.map(header => `"${row[header]}"`).join(','))
          ];
          return csvRows.join('\n');
        } else {
          return result.data.join('\n');
        }
      case 'sql':
        if (result.type === 'combined' && result.data.length > 0) {
          const headers = Object.keys(result.data[0]);
          const tableName = 'generated_data';
          const insertStatements = result.data.map((row: any) => {
            const values = headers.map(header => `'${row[header]}'`).join(', ');
            return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values});`;
          });
          return insertStatements.join('\n');
        } else {
          return result.data.map((item: any) => `'${item}'`).join(',\n');
        }
      default:
        return result.data.join('\n');
    }
  };

  const copyOutput = async () => {
    const output = formatOutput(generatedData);
    await navigator.clipboard.writeText(output);
    toast({
      title: "Copied!",
      description: "Generated data copied to clipboard",
    });
  };

  const downloadOutput = () => {
    const output = formatOutput(generatedData);
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fake-data.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `Data downloaded as ${format.toUpperCase()} file`,
    });
  };

  const clear = () => {
    setGeneratedData([]);
    setCustomText('');
  };

  return (
    <ToolLayout
      title="Faker Data Generator"
      description="Generate realistic fake data for testing, including names, emails, addresses, and Lorem Ipsum text"
      icon={<Shuffle className="h-8 w-8 text-green-500" />}
    >
      <div className="space-y-6">
        <Tabs defaultValue="structured" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="structured">Structured Data</TabsTrigger>
            <TabsTrigger value="lorem">Lorem Ipsum</TabsTrigger>
          </TabsList>

          <TabsContent value="structured" className="space-y-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Configuration</CardTitle>
                <CardDescription>Select fields and configure output settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Records</Label>
                    <Input
                      type="number"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                      min="1"
                      max="1000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                        <SelectItem value="text">Plain Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="flex gap-2">
                      <Button onClick={generateData} className="flex items-center space-x-2">
                        <Shuffle className="h-4 w-4" />
                        <span>Generate</span>
                      </Button>
                      <Button onClick={clear} variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Field Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(dataTypes).map(([category, fields]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize">{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {fields.map(field => (
                      <div key={field.id} className="flex items-start space-x-2">
                        <Checkbox
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => toggleField(field.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <label className="text-sm font-medium cursor-pointer">
                            {field.label}
                          </label>
                          <p className="text-xs text-muted-foreground truncate">
                            {field.example}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lorem" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lorem Ipsum Generator</CardTitle>
                <CardDescription>Generate placeholder text for your designs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="space-y-2">
                    <Label>Number of Words</Label>
                    <Input
                      type="number"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="50"
                      min="1"
                      max="1000"
                      className="w-32"
                    />
                  </div>
                  <Button onClick={generateLorem} className="mt-6">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Lorem Ipsum
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Output */}
        {generatedData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Generated Data</CardTitle>
                  <CardDescription>
                    {generatedData[0].type === 'lorem' 
                      ? 'Lorem Ipsum text'
                      : `${generatedData[0].data.length} records in ${format.toUpperCase()} format`
                    }
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyOutput} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadOutput} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formatOutput(generatedData)}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
            </CardContent>
          </Card>
        )}

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage Examples</CardTitle>
            <CardDescription>Common use cases for fake data generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Development & Testing</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Populate databases with test data</li>
                    <li>• Create realistic user profiles</li>
                    <li>• Test form validations</li>
                    <li>• Generate sample API responses</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Design & Prototyping</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Fill mockups with realistic content</li>
                    <li>• Create user personas</li>
                    <li>• Generate placeholder text</li>
                    <li>• Test responsive layouts</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Data Formats</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>JSON:</strong> API responses, configuration files</li>
                    <li>• <strong>CSV:</strong> Spreadsheet imports, data analysis</li>
                    <li>• <strong>SQL:</strong> Database seeding, migrations</li>
                    <li>• <strong>Text:</strong> Simple lists, testing inputs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Privacy & Security</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• All data is randomly generated</li>
                    <li>• No real personal information used</li>
                    <li>• Safe for development environments</li>
                    <li>• GDPR compliant for testing</li>
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