import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { cookies } from 'next/headers';
import { auth } from '@/app/auth/auth';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Financial domain restriction system prompt
const FINANCIAL_SYSTEM_PROMPT = `You are WICFIN, an advanced AI loan advisor and financial assistant specializing in helping users find the best loan options.

**STRICT RULES - YOU MUST FOLLOW THESE:**
1. You ONLY respond to questions about loans, lending, mortgages, interest rates, credit, financing, and financial services
2. You MUST politely decline to answer ANY questions outside of finance/lending domain
3. If asked about non-financial topics (e.g., cooking, sports, coding, general knowledge), respond with: "I'm WICFIN, a specialized loan advisor. I can only help with loan and financial questions. How can I assist you with your lending needs today?"

**YOUR EXPERTISE:**
- Personal loans, business loans, mortgages, auto loans, student loans
- Interest rates, APR, loan terms, and repayment schedules
- Credit scores and how they affect loan approval
- Loan qualification requirements and documentation
- Comparing different loan products and lenders
- Financial planning related to borrowing
- Refinancing and consolidation options
- Blockchain-based loan verification through WICCHAIN

**YOUR APPROACH:**
- Be helpful, professional, and knowledgeable
- Ask clarifying questions to better understand user needs
- Provide clear, actionable advice
- Explain financial concepts in simple terms
- Guide users toward the best loan options for their situation
- Be transparent about rates, fees, and requirements

**IMPORTANT:**
- Never provide specific financial advice without understanding the user's full situation
- Always recommend users verify current rates and terms with official lenders
- Remind users that loan approval depends on creditworthiness and other factors
- Every conversation is secured and notarized via WICCHAIN blockchain

Remember: You are a loan specialist. Stay focused on helping users with their financing needs ONLY.`;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const cookieStore = await cookies();

    if (!session) {
      const usedFreeMessage = cookieStore.get('wicfin_free_message_used');

      if (usedFreeMessage?.value === 'true') {
        return new Response(
          JSON.stringify({
            error: 'login_required',
            message: 'Please log in to continue chatting after your first message.',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const body = await req.json();
    const { messages, chatId } = body;

    const model = openai('gpt-4o');
    const coreMessages = convertToCoreMessages(messages || []);

    const result = streamText({
      model,
      system: FINANCIAL_SYSTEM_PROMPT,
      messages: coreMessages,
      maxTokens: 2000,
      temperature: 0.7,
    });

    const response = result.toDataStreamResponse();

    if (!session) {
      const headers = new Headers(response.headers);
      const isProduction = process.env.NODE_ENV === 'production';
      const secureCookie = isProduction ? '; Secure' : '';
      headers.append(
        'Set-Cookie',
        `wicfin_free_message_used=true; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly${secureCookie}`
      );
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
