interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiAPI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Gemini API key not found');
    }
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async generateSQL(description: string, tableContext?: string): Promise<string> {
    const prompt = `Generate a SQL query based on this description: "${description}"
    
    ${tableContext ? `Table context: ${tableContext}` : ''}
    
    Rules:
    - Return only the SQL query, no explanations
    - Use standard SQL syntax
    - Include proper formatting
    - Use meaningful table/column names if not specified
    - Add comments for complex queries
    
    SQL Query:`;

    return this.generateContent(prompt);
  }

  async generateRegex(description: string, examples?: string[]): Promise<{ pattern: string; explanation: string }> {
    const prompt = `Create a regular expression for: "${description}"
    
    ${examples ? `Examples to match: ${examples.join(', ')}` : ''}
    
    Return in this exact format:
    PATTERN: [regex pattern]
    EXPLANATION: [brief explanation of what it matches]`;

    const response = await this.generateContent(prompt);
    
    const patternMatch = response.match(/PATTERN:\s*(.+)/);
    const explanationMatch = response.match(/EXPLANATION:\s*(.+)/);
    
    return {
      pattern: patternMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || ''
    };
  }

  async generateCronExpression(description: string): Promise<{ expression: string; explanation: string }> {
    const prompt = `Generate a cron expression for: "${description}"
    
    Return in this exact format:
    CRON: [cron expression]
    EXPLANATION: [human readable explanation]
    
    Use standard 5-field cron format (minute hour day month weekday).`;

    const response = await this.generateContent(prompt);
    
    const cronMatch = response.match(/CRON:\s*(.+)/);
    const explanationMatch = response.match(/EXPLANATION:\s*(.+)/);
    
    return {
      expression: cronMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || ''
    };
  }

  async optimizeCode(code: string, language: string): Promise<{ optimized: string; improvements: string[] }> {
    const prompt = `Optimize this ${language} code and suggest improvements:

\`\`\`${language}
${code}
\`\`\`

Return in this format:
OPTIMIZED:
[optimized code]

IMPROVEMENTS:
- [improvement 1]
- [improvement 2]
- [improvement 3]`;

    const response = await this.generateContent(prompt);
    
    const optimizedMatch = response.match(/OPTIMIZED:\s*([\s\S]*?)(?=IMPROVEMENTS:|$)/);
    const improvementsMatch = response.match(/IMPROVEMENTS:\s*([\s\S]*)/);
    
    const improvements = improvementsMatch?.[1]
      ?.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(Boolean) || [];
    
    return {
      optimized: optimizedMatch?.[1]?.trim() || code,
      improvements
    };
  }

  async explainCode(code: string, language: string): Promise<string> {
    const prompt = `Explain this ${language} code in simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide a clear, concise explanation of what this code does, how it works, and any important concepts.`;

    return this.generateContent(prompt);
  }

  async generateTestData(schema: string, count: number = 5): Promise<string> {
    const prompt = `Generate ${count} realistic test data entries based on this schema:

${schema}

Return as valid JSON array with realistic, diverse data. Make sure all required fields are included.`;

    return this.generateContent(prompt);
  }
}