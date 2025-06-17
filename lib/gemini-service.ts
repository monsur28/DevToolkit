import { ObjectId } from 'mongodb';
import { AuthService } from './auth-service';
import { getCollection } from './mongodb';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not found or not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.');
    }
  }

  private async makeRequest(prompt: string, userId?: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured. Please add your API key to .env.local file.');
    }

    // Check user limits if userId is provided
    if (userId) {
      const canUse = await AuthService.canUserUseAI(userId);
      if (!canUse.canUse) {
        throw new Error(canUse.reason || 'Usage limit exceeded');
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
      if (userId) {
        await this.trackUsage(userId, 'Gemini AI', true);
      }

      return result;
    } catch (error) {
      console.error('Gemini API request failed:', error);
      
      // Track failed usage if userId is provided
      if (userId) {
        await this.trackUsage(userId, 'Gemini AI', false);
      }
      
      throw error;
    }
  }

  private async trackUsage(userId: string, toolName: string, success: boolean): Promise<void> {
    try {
      // Update user usage count
      await AuthService.updateUsage(userId, toolName, success);
      
      // Track detailed analytics
      const usageCollection = await getCollection('usageAnalytics');
      const toolsCollection = await getCollection('tools');
      
      // Find tool by name
      const tool = await toolsCollection.findOne({ name: toolName });
      
      await usageCollection.insertOne({
        userId: new ObjectId(userId),
        toolId: tool?._id || null,
        usage: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          success,
        },
        context: {
          userAgent: 'server',
          ipAddress: 'server',
        },
        performance: {
          responseTime: 0,
        },
        metadata: {
          version: '1.0.0',
          features: [],
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
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