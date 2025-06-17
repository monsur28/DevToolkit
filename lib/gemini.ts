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
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not found or not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.');
      // Don't throw error, allow fallback methods to work
    }
  }

  private async makeRequest(prompt: string, userId?: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured. Please add your API key to .env.local file.');
    }

    // Check user limits if userId is provided
    if (userId && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/user/check-limits', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (!data.canUse) {
            throw new Error(data.reason || 'Usage limit exceeded');
          }
        } catch (error) {
          console.warn('Could not check usage limits:', error);
        }
      }
    }

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
        console.error('Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }

      const result = data.candidates[0]?.content?.parts[0]?.text || '';

      // Track usage if userId is provided
      if (userId && typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await fetch('/api/user/track-usage', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                toolName: 'Gemini AI',
                success: true
              })
            });
          } catch (error) {
            console.warn('Could not track usage:', error);
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Gemini API request failed:', error);
      
      // Track failed usage if userId is provided
      if (userId && typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await fetch('/api/user/track-usage', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                toolName: 'Gemini AI',
                success: false
              })
            });
          } catch (trackError) {
            console.warn('Could not track failed usage:', trackError);
          }
        }
      }
      
      throw error;
    }
  }

  async generateContent(prompt: string, userId?: string): Promise<string> {
    return this.makeRequest(prompt, userId);
  }

  async generateSQL(description: string, tableContext?: string, userId?: string): Promise<string> {
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

    const result = await this.makeRequest(prompt, userId);
    
    // Clean up the response to extract just the SQL
    return result
      .replace(/```sql/g, '')
      .replace(/```/g, '')
      .replace(/^SQL Query:\s*/i, '')
      .trim();
  }

  async generateRegex(description: string, examples?: string[], userId?: string): Promise<{ pattern: string; explanation: string }> {
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

    const response = await this.makeRequest(prompt, userId);
    
    const patternMatch = response.match(/PATTERN:\s*(.+)/);
    const explanationMatch = response.match(/EXPLANATION:\s*(.+)/);
    
    return {
      pattern: patternMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || 'AI-generated regex pattern'
    };
  }

  async generateCronExpression(description: string, userId?: string): Promise<{ expression: string; explanation: string }> {
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

    const response = await this.makeRequest(prompt, userId);
    
    const cronMatch = response.match(/CRON:\s*(.+)/);
    const explanationMatch = response.match(/EXPLANATION:\s*(.+)/);
    
    return {
      expression: cronMatch?.[1]?.trim() || '',
      explanation: explanationMatch?.[1]?.trim() || 'AI-generated cron expression'
    };
  }

  async optimizeCode(code: string, language: string, userId?: string): Promise<{ optimized: string; improvements: string[] }> {
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

    const response = await this.makeRequest(prompt, userId);
    
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

  async explainCode(code: string, language: string, userId?: string): Promise<string> {
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

    return this.makeRequest(prompt, userId);
  }

  async generateTestData(schema: string, count: number = 5, userId?: string): Promise<string> {
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

    const result = await this.makeRequest(prompt, userId);
    
    // Clean up the response to extract just the JSON
    return result
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  async findBugs(code: string, userId?: string): Promise<{ bugs: any[]; qualityScore: number }> {
    const prompt = `You are a senior code reviewer. Analyze this code for bugs, security issues, and bad practices:

\`\`\`
${code}
\`\`\`

Requirements:
- Identify bugs, security issues, and bad practices
- Assign severity (critical, high, medium, low) to each issue
- Provide a brief description of each issue
- Suggest a fix for each issue
- Assign a quality score from 0-100
- Be thorough but focus on real issues, not style preferences

Return in this exact JSON format:
{
  "bugs": [
    {
      "severity": "high",
      "type": "Off-by-one error",
      "description": "Loop iterates one element too many",
      "suggestion": "Change <= to <",
      "lineNumber": 3
    }
  ],
  "qualityScore": 75
}`;

    const response = await this.makeRequest(prompt, userId);
    
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                        response.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, response];
      
      const jsonStr = jsonMatch?.[1]?.trim() || response;
      const result = JSON.parse(jsonStr);
      
      return {
        bugs: result.bugs || [],
        qualityScore: result.qualityScore || 0
      };
    } catch (error) {
      console.error('Error parsing bug finder response:', error);
      return { bugs: [], qualityScore: 0 };
    }
  }

  async generateCommitMessages(diff: string, context?: string, type?: string, userId?: string): Promise<any[]> {
    const prompt = `You are a Git expert. Generate conventional commit messages based on this diff:

\`\`\`
${diff}
\`\`\`

${context ? `Additional context: ${context}` : ''}
${type ? `Preferred commit type: ${type}` : ''}

Requirements:
- Follow conventional commits format: type(scope): subject
- Generate 3 different commit message options
- Keep subject under 72 characters
- Use imperative mood ("add" not "added")
- Include body for complex changes
- Identify the most appropriate type (feat, fix, refactor, etc.)
- Be specific about what changed

Return in this exact JSON format:
[
  {
    "type": "feat",
    "scope": "button",
    "subject": "add variant and size props",
    "body": "Enhance Button component with variant and size props for better flexibility",
    "footer": "BREAKING CHANGE: Button props interface has changed",
    "conventional": "feat(button): add variant and size props"
  }
]`;

    const response = await this.makeRequest(prompt, userId);
    
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                        response.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, response];
      
      const jsonStr = jsonMatch?.[1]?.trim() || response;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing commit message response:', error);
      return [];
    }
  }

  async generateReadme(projectInfo: any, sections: string[], template: string, userId?: string): Promise<string> {
    const prompt = `You are a technical documentation expert. Generate a professional README.md for this project:

Project Name: ${projectInfo.name}
Description: ${projectInfo.description}
Tech Stack: ${projectInfo.tech || 'Not specified'}
Features: ${projectInfo.features || 'Not specified'}
Installation: ${projectInfo.installation || 'Not specified'}
Usage: ${projectInfo.usage || 'Not specified'}
License: ${projectInfo.license || 'MIT'}
Author: ${projectInfo.author || 'Not specified'}
Repository: ${projectInfo.repository || 'Not specified'}

Template style: ${template}
Sections to include: ${sections.join(', ')}

Requirements:
- Create a professional, well-formatted README.md in Markdown
- Include all the specified sections
- Use proper Markdown formatting (headers, lists, code blocks, etc.)
- Add appropriate badges where relevant
- Keep it concise but comprehensive
- Follow the selected template style
- Include placeholders for screenshots/demos if that section is included

Return only the README content in Markdown format:`;

    return this.makeRequest(prompt, userId);
  }

  async analyzeAPIResponse(response: string, userId?: string): Promise<string> {
    const prompt = `You are an API expert. Analyze this API response and provide a clear summary:

\`\`\`
${response}
\`\`\`

Requirements:
- Identify the structure and key components
- Highlight important data points and relationships
- Note any errors, warnings, or unusual patterns
- Explain what this response represents
- Suggest how a developer might use this data

Provide a clear, concise analysis:`;

    return this.makeRequest(prompt, userId);
  }

  async answerTechQuestion(question: string, userId?: string): Promise<string> {
    const prompt = `You are a senior software developer and technical educator. Answer this programming or technology question:

Question: ${question}

Requirements:
- Provide a clear, accurate, and concise answer
- Include code examples where appropriate
- Explain technical concepts in an accessible way
- Cite sources or documentation when relevant
- Focus on practical, actionable information
- Keep the answer under 500 words

Your answer:`;

    return this.makeRequest(prompt, userId);
  }
}