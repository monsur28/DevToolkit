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
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
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
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }

      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async generateSQL(description: string, tableContext?: string): Promise<string> {
    const prompt = `You are an expert SQL developer. Generate a SQL query based on this description: "${description}"
    
    ${tableContext ? `Table context: ${tableContext}` : ''}
    
    Requirements:
    - Return ONLY the SQL query, no explanations or markdown formatting
    - Use standard SQL syntax that works across different databases
    - Include proper formatting with line breaks and indentation
    - Use meaningful table/column names if not specified
    - Add brief comments for complex queries
    - Ensure the query is syntactically correct and executable
    
    SQL Query:`;

    const result = await this.generateContent(prompt);
    
    // Clean up the response to extract just the SQL
    return result
      .replace(/```sql/g, '')
      .replace(/```/g, '')
      .replace(/^SQL Query:\s*/i, '')
      .trim();
  }

  async generateRegex(description: string, examples?: string[]): Promise<{ pattern: string; explanation: string }> {
    const prompt = `You are a regex expert. Create a regular expression pattern for: "${description}"
    
    ${examples ? `Examples that should match: ${examples.join(', ')}` : ''}
    
    Requirements:
    - Provide a working regex pattern
    - Include a clear explanation of what it matches
    - Use standard regex syntax
    - Make it as precise as possible
    
    Return in this exact format:
    PATTERN: [regex pattern only]
    EXPLANATION: [brief explanation of what the pattern matches and how it works]`;

    const response = await this.generateContent(prompt);
    
    const patternMatch = response.match(/PATTERN:\s*(.+)/);
    const explanationMatch = response.match(/EXPLANATION:\s*(.+)/);
    
    return {
      pattern: patternMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || 'AI-generated regex pattern'
    };
  }

  async generateCronExpression(description: string): Promise<{ expression: string; explanation: string }> {
    const prompt = `You are a cron expert. Generate a cron expression for: "${description}"
    
    Requirements:
    - Use standard 5-field cron format: minute hour day-of-month month day-of-week
    - Provide a working cron expression
    - Include a human-readable explanation
    
    Return in this exact format:
    CRON: [5-field cron expression]
    EXPLANATION: [human readable explanation of when it runs]
    
    Examples:
    - "every day at midnight" → CRON: 0 0 * * *
    - "every Monday at 9 AM" → CRON: 0 9 * * 1
    - "every 15 minutes" → CRON: */15 * * * *`;

    const response = await this.generateContent(prompt);
    
    const cronMatch = response.match(/CRON:\s*(.+)/);
    const explanationMatch = response.match(/EXPLANATION:\s*(.+)/);
    
    return {
      expression: cronMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || 'AI-generated cron expression'
    };
  }

  async optimizeCode(code: string, language: string): Promise<{ optimized: string; improvements: string[] }> {
    const prompt = `You are a senior software engineer. Analyze and optimize this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Requirements:
- Provide optimized version of the code
- List specific improvements made
- Focus on performance, readability, and best practices
- Maintain the same functionality

Return in this exact format:
OPTIMIZED:
[optimized code here]

IMPROVEMENTS:
- [specific improvement 1]
- [specific improvement 2]
- [specific improvement 3]`;

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
    const prompt = `You are a programming instructor. Explain this ${language} code in clear, simple terms:

\`\`\`${language}
${code}
\`\`\`

Requirements:
- Explain what the code does overall
- Break down key components and logic
- Mention any important concepts or patterns used
- Keep the explanation accessible but thorough
- Use plain language, avoid overly technical jargon

Provide a comprehensive but easy-to-understand explanation:`;

    return this.generateContent(prompt);
  }

  async generateTestData(schema: string, count: number = 5): Promise<string> {
    const prompt = `You are a test data expert. Generate ${count} realistic test data entries based on this schema or description:

${schema}

Requirements:
- Generate realistic, diverse data
- Return as valid JSON array
- Include all required fields
- Use appropriate data types
- Make data varied and interesting
- Ensure data is production-quality realistic

Return only the JSON array, no explanations:`;

    const result = await this.generateContent(prompt);
    
    // Clean up the response to extract just the JSON
    return result
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }
}