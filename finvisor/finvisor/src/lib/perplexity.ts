// ═══════════════════════════════════════════════════════
// FINVISOR - Perplexity Integration
// Sponsor: Perplexity - Research Agent
// ═══════════════════════════════════════════════════════

import axios from 'axios';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityCitation {
  url: string;
  title?: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  citations?: PerplexityCitation[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Research financial aid data with citations
export async function researchQuery(
  query: string,
  focus: 'academic' | 'news' | 'general' = 'academic'
): Promise<{
  answer: string;
  citations: Array<{ url: string; title: string; snippet: string }>;
  confidence: number;
}> {
  const systemPrompt = `You are a research assistant specializing in higher education finance and financial aid.
Provide accurate, well-sourced information with specific data points when available.
Focus on: financial aid statistics, university policies, appeal success rates, and comparable data.
Always cite your sources.`;

  const response = await axios.post<PerplexityResponse>(
    PERPLEXITY_API_URL,
    {
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.2,
      max_tokens: 1000,
      return_citations: true,
      search_domain_filter: focus === 'academic' 
        ? ['edu', 'gov', 'org'] 
        : undefined,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const citations = (response.data.citations || []).map((c, i) => ({
    url: c.url,
    title: c.title || `Source ${i + 1}`,
    snippet: '',
  }));

  return {
    answer: response.data.choices[0]?.message?.content || '',
    citations,
    confidence: citations.length > 0 ? 0.9 : 0.6,
  };
}

// Batch research for multiple queries
export async function batchResearch(
  queries: string[]
): Promise<Array<{
  query: string;
  result: string;
  source: string;
  status: 'found' | 'error';
}>> {
  const results = await Promise.all(
    queries.map(async (query) => {
      try {
        const research = await researchQuery(query);
        const primarySource = research.citations[0]?.title || 'Perplexity Research';
        
        return {
          query,
          result: research.answer,
          source: primarySource,
          status: 'found' as const,
        };
      } catch (error) {
        console.error(`Research error for query: ${query}`, error);
        return {
          query,
          result: 'Research failed - please try again',
          source: 'Error',
          status: 'error' as const,
        };
      }
    })
  );

  return results;
}

// Real-time fact checking
export async function factCheck(
  claim: string
): Promise<{
  verified: boolean;
  explanation: string;
  sources: string[];
}> {
  const response = await axios.post<PerplexityResponse>(
    PERPLEXITY_API_URL,
    {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a fact-checker. Verify claims with current data. Return JSON with: verified (boolean), explanation (string), sources (array of strings).',
        },
        {
          role: 'user',
          content: `Verify this claim: "${claim}"`,
        },
      ],
      temperature: 0.1,
      return_citations: true,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = response.data.choices[0]?.message?.content || '';
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Parse response as plain text
  }

  return {
    verified: false,
    explanation: content,
    sources: response.data.citations?.map(c => c.url) || [],
  };
}

// Get competitor school data
export async function getSchoolComparison(
  targetSchool: string,
  comparisons: string[] = []
): Promise<{
  targetData: { avgAid: number; acceptanceRate: number; costOfAttendance: number };
  comparisons: Array<{
    school: string;
    avgAid: number;
    acceptanceRate: number;
    costOfAttendance: number;
  }>;
}> {
  const schools = [targetSchool, ...comparisons].join(', ');
  
  const response = await axios.post<PerplexityResponse>(
    PERPLEXITY_API_URL,
    {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `You are a college financial data analyst. Provide accurate financial aid statistics.
Return JSON with school financial data including average need-based aid, acceptance rate, and cost of attendance.`,
        },
        {
          role: 'user',
          content: `Get the latest financial aid statistics for these schools: ${schools}. 
Include average need-based grant, acceptance rate, and total cost of attendance.
Return as JSON with "schools" array containing objects with: name, avgAid (number), acceptanceRate (number 0-100), costOfAttendance (number).`,
        },
      ],
      temperature: 0.2,
      return_citations: true,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = response.data.choices[0]?.message?.content || '';
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      const schools = data.schools || [];
      const target = schools.find((s: { name: string }) => 
        s.name.toLowerCase().includes(targetSchool.toLowerCase())
      ) || schools[0];
      
      return {
        targetData: {
          avgAid: target?.avgAid || 50000,
          acceptanceRate: target?.acceptanceRate || 10,
          costOfAttendance: target?.costOfAttendance || 80000,
        },
        comparisons: schools.filter((s: { name: string }) => 
          !s.name.toLowerCase().includes(targetSchool.toLowerCase())
        ),
      };
    }
  } catch {
    // Return default data
  }

  return {
    targetData: { avgAid: 50000, acceptanceRate: 10, costOfAttendance: 80000 },
    comparisons: [],
  };
}

// Financial aid policy research
export async function researchAidPolicy(
  school: string,
  topic: 'appeal_process' | 'special_circumstances' | 'deadlines' | 'requirements'
): Promise<{
  policy: string;
  keyPoints: string[];
  lastUpdated?: string;
  officialSource?: string;
}> {
  const topicDescriptions = {
    appeal_process: 'financial aid appeal process and procedures',
    special_circumstances: 'special circumstances review and SAR policy',
    deadlines: 'financial aid deadlines and important dates',
    requirements: 'financial aid requirements and eligibility criteria',
  };

  const response = await axios.post<PerplexityResponse>(
    PERPLEXITY_API_URL,
    {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'Research university financial aid policies. Provide specific, actionable information.',
        },
        {
          role: 'user',
          content: `Research ${school}'s ${topicDescriptions[topic]}. 
What are the specific requirements, procedures, and any tips for students?
Return JSON with: policy (summary), keyPoints (array of strings), officialSource (url if available).`,
        },
      ],
      temperature: 0.2,
      return_citations: true,
      search_domain_filter: ['edu'],
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = response.data.choices[0]?.message?.content || '';
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        policy: data.policy || content,
        keyPoints: data.keyPoints || [],
        lastUpdated: data.lastUpdated,
        officialSource: data.officialSource || response.data.citations?.[0]?.url,
      };
    }
  } catch {
    // Return parsed content
  }

  return {
    policy: content,
    keyPoints: [],
    officialSource: response.data.citations?.[0]?.url,
  };
}
