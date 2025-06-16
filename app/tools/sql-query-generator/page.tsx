'use client';

import { useState } from 'react';
import { ToolLayout } from '@/components/tool-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Database, Copy, Trash2, Play, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface QueryTemplate {
  name: string;
  description: string;
  template: string;
  example: string;
}

export default function SqlQueryGeneratorPage() {
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState('mysql');
  const [tableName, setTableName] = useState('users');
  const [columns, setColumns] = useState('id, name, email, created_at');
  const { toast } = useToast();

  const queryTemplates: QueryTemplate[] = [
    {
      name: 'Select All Records',
      description: 'Get all records from a table',
      template: 'SELECT * FROM {table}',
      example: 'Show me all users'
    },
    {
      name: 'Select with Condition',
      description: 'Get records matching a condition',
      template: 'SELECT {columns} FROM {table} WHERE {condition}',
      example: 'Find all users where age is greater than 25'
    },
    {
      name: 'Insert Record',
      description: 'Add a new record to a table',
      template: 'INSERT INTO {table} ({columns}) VALUES ({values})',
      example: 'Add a new user with name John and email john@example.com'
    },
    {
      name: 'Update Records',
      description: 'Update existing records',
      template: 'UPDATE {table} SET {column} = {value} WHERE {condition}',
      example: 'Update user email to newemail@example.com where id is 1'
    },
    {
      name: 'Delete Records',
      description: 'Remove records from a table',
      template: 'DELETE FROM {table} WHERE {condition}',
      example: 'Delete all users where status is inactive'
    },
    {
      name: 'Join Tables',
      description: 'Combine data from multiple tables',
      template: 'SELECT {columns} FROM {table1} JOIN {table2} ON {condition}',
      example: 'Get user names and their order totals from users and orders tables'
    },
    {
      name: 'Group By with Count',
      description: 'Count records grouped by a column',
      template: 'SELECT {column}, COUNT(*) FROM {table} GROUP BY {column}',
      example: 'Count how many users are in each city'
    },
    {
      name: 'Order By',
      description: 'Sort results by a column',
      template: 'SELECT {columns} FROM {table} ORDER BY {column} {direction}',
      example: 'Get all users ordered by creation date newest first'
    }
  ];

  const databases = [
    { id: 'mysql', name: 'MySQL', syntax: 'mysql' },
    { id: 'postgresql', name: 'PostgreSQL', syntax: 'postgresql' },
    { id: 'sqlite', name: 'SQLite', syntax: 'sqlite' },
    { id: 'mssql', name: 'SQL Server', syntax: 'mssql' },
    { id: 'oracle', name: 'Oracle', syntax: 'oracle' }
  ];

  const generateQuery = () => {
    if (!naturalLanguage.trim()) {
      toast({
        title: "Error",
        description: "Please describe what you want to do in plain English",
        variant: "destructive"
      });
      return;
    }

    const query = parseNaturalLanguage(naturalLanguage.toLowerCase());
    setGeneratedQuery(query);
    
    toast({
      title: "Query Generated",
      description: "SQL query has been generated from your description",
    });
  };

  const parseNaturalLanguage = (input: string): string => {
    // Simple natural language to SQL conversion
    // In a real implementation, this would use AI/ML models
    
    if (input.includes('show') || input.includes('get') || input.includes('find') || input.includes('select')) {
      if (input.includes('all')) {
        return `SELECT * FROM ${tableName};`;
      } else if (input.includes('where') || input.includes('with')) {
        const condition = extractCondition(input);
        return `SELECT ${columns} FROM ${tableName} WHERE ${condition};`;
      } else if (input.includes('count')) {
        return `SELECT COUNT(*) FROM ${tableName};`;
      } else if (input.includes('order by') || input.includes('sorted')) {
        const orderColumn = extractOrderColumn(input);
        const direction = input.includes('desc') || input.includes('newest') ? 'DESC' : 'ASC';
        return `SELECT ${columns} FROM ${tableName} ORDER BY ${orderColumn} ${direction};`;
      }
      return `SELECT ${columns} FROM ${tableName};`;
    }
    
    if (input.includes('add') || input.includes('insert') || input.includes('create')) {
      const values = extractValues(input);
      return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
    }
    
    if (input.includes('update') || input.includes('change') || input.includes('modify')) {
      const setClause = extractSetClause(input);
      const condition = extractCondition(input);
      return `UPDATE ${tableName} SET ${setClause} WHERE ${condition};`;
    }
    
    if (input.includes('delete') || input.includes('remove')) {
      const condition = extractCondition(input);
      return `DELETE FROM ${tableName} WHERE ${condition};`;
    }
    
    if (input.includes('join')) {
      return `SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id;`;
    }
    
    if (input.includes('group by') || input.includes('count')) {
      const groupColumn = extractGroupColumn(input);
      return `SELECT ${groupColumn}, COUNT(*) as count FROM ${tableName} GROUP BY ${groupColumn};`;
    }
    
    // Default fallback
    return `SELECT ${columns} FROM ${tableName};`;
  };

  const extractCondition = (input: string): string => {
    if (input.includes('age') && input.includes('greater than')) {
      const age = input.match(/\d+/)?.[0] || '25';
      return `age > ${age}`;
    }
    if (input.includes('id') && input.includes('is')) {
      const id = input.match(/\d+/)?.[0] || '1';
      return `id = ${id}`;
    }
    if (input.includes('status') && input.includes('inactive')) {
      return `status = 'inactive'`;
    }
    if (input.includes('name') && input.includes('like')) {
      return `name LIKE '%John%'`;
    }
    return 'id = 1';
  };

  const extractValues = (input: string): string => {
    // Extract values from natural language
    const nameMatch = input.match(/name\s+(\w+)/);
    const emailMatch = input.match(/email\s+([\w@.]+)/);
    
    const name = nameMatch ? `'${nameMatch[1]}'` : "'John Doe'";
    const email = emailMatch ? `'${emailMatch[1]}'` : "'john@example.com'";
    
    return `${name}, ${email}, NOW()`;
  };

  const extractSetClause = (input: string): string => {
    if (input.includes('email')) {
      const emailMatch = input.match(/email\s+to\s+([\w@.]+)/);
      const email = emailMatch ? emailMatch[1] : 'newemail@example.com';
      return `email = '${email}'`;
    }
    if (input.includes('name')) {
      return `name = 'New Name'`;
    }
    return `status = 'updated'`;
  };

  const extractOrderColumn = (input: string): string => {
    if (input.includes('date') || input.includes('created')) return 'created_at';
    if (input.includes('name')) return 'name';
    if (input.includes('age')) return 'age';
    return 'id';
  };

  const extractGroupColumn = (input: string): string => {
    if (input.includes('city')) return 'city';
    if (input.includes('status')) return 'status';
    if (input.includes('department')) return 'department';
    return 'category';
  };

  const loadTemplate = (template: QueryTemplate) => {
    setNaturalLanguage(template.example);
    setGeneratedQuery(template.template.replace('{table}', tableName).replace('{columns}', columns));
  };

  const copyQuery = async () => {
    await navigator.clipboard.writeText(generatedQuery);
    toast({
      title: "Copied!",
      description: "SQL query copied to clipboard",
    });
  };

  const clear = () => {
    setNaturalLanguage('');
    setGeneratedQuery('');
  };

  const formatQuery = () => {
    if (!generatedQuery) return;
    
    // Simple SQL formatting
    const formatted = generatedQuery
      .replace(/SELECT/gi, 'SELECT')
      .replace(/FROM/gi, '\nFROM')
      .replace(/WHERE/gi, '\nWHERE')
      .replace(/JOIN/gi, '\nJOIN')
      .replace(/GROUP BY/gi, '\nGROUP BY')
      .replace(/ORDER BY/gi, '\nORDER BY')
      .replace(/HAVING/gi, '\nHAVING');
    
    setGeneratedQuery(formatted);
  };

  return (
    <ToolLayout
      title="SQL Query Generator"
      description="Generate SQL queries from natural language descriptions with AI-powered assistance"
      icon={<Database className="h-8 w-8 text-blue-500" />}
    >
      <div className="space-y-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Database Configuration</CardTitle>
            <CardDescription>Set up your database context for better query generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Database Type</Label>
                <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {databases.map(db => (
                      <SelectItem key={db.id} value={db.id}>{db.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Table Name</Label>
                <Input
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="users"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Columns</Label>
                <Input
                  value={columns}
                  onChange={(e) => setColumns(e.target.value)}
                  placeholder="id, name, email, created_at"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Natural Language</TabsTrigger>
            <TabsTrigger value="templates">Query Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Describe Your Query</CardTitle>
                  <CardDescription>Tell us what you want to do in plain English</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Examples:
• Show me all users
• Find users where age is greater than 25
• Add a new user with name John and email john@example.com
• Update user email to newemail@example.com where id is 1
• Delete all inactive users
• Count how many users are in each city"
                    value={naturalLanguage}
                    onChange={(e) => setNaturalLanguage(e.target.value)}
                    className="min-h-[200px]"
                  />
                  
                  <div className="flex gap-2">
                    <Button onClick={generateQuery} className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Generate SQL</span>
                    </Button>
                    <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                      <Trash2 className="h-4 w-4" />
                      <span>Clear</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Output */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Generated SQL Query</CardTitle>
                      <CardDescription>Ready-to-use SQL query for {databases.find(db => db.id === selectedDatabase)?.name}</CardDescription>
                    </div>
                    {generatedQuery && (
                      <div className="flex gap-2">
                        <Button onClick={formatQuery} size="sm" variant="outline">
                          Format
                        </Button>
                        <Button onClick={copyQuery} size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedQuery ? (
                    <Textarea
                      value={generatedQuery}
                      onChange={(e) => setGeneratedQuery(e.target.value)}
                      className="min-h-[200px] font-mono text-sm bg-muted"
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Describe your query in natural language to generate SQL</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queryTemplates.map((template, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Template:</Label>
                      <code className="block bg-muted p-2 rounded text-xs font-mono">
                        {template.template}
                      </code>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Example:</Label>
                      <p className="text-sm italic">{template.example}</p>
                    </div>
                    <Button 
                      onClick={() => loadTemplate(template)}
                      size="sm" 
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* SQL Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SQL Tips & Best Practices</CardTitle>
            <CardDescription>Guidelines for writing efficient and secure SQL queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Performance Tips:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use indexes on frequently queried columns</li>
                    <li>• Limit results with LIMIT/TOP clauses</li>
                    <li>• Use specific column names instead of SELECT *</li>
                    <li>• Optimize JOIN conditions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Security Best Practices:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use parameterized queries to prevent SQL injection</li>
                    <li>• Validate and sanitize user inputs</li>
                    <li>• Use least privilege principle for database users</li>
                    <li>• Avoid dynamic SQL when possible</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Common Patterns:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use INNER JOIN for matching records only</li>
                    <li>• Use LEFT JOIN to include all records from left table</li>
                    <li>• Use GROUP BY with aggregate functions</li>
                    <li>• Use HAVING to filter grouped results</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Natural Language Examples:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• "Show me..." → SELECT statement</li>
                    <li>• "Add a new..." → INSERT statement</li>
                    <li>• "Update/Change..." → UPDATE statement</li>
                    <li>• "Delete/Remove..." → DELETE statement</li>
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