// netlify/functions/gemini.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-pro-preview';  // Requires billing enabled

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) return { statusCode: 400, body: JSON.stringify({ error: 'Prompt required' }) };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { thinkingLevel: "low" } // Low = faster, cheaper
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Specific billing error message
      if (response.status === 429 || data.error?.message?.includes('quota')) {
        return { statusCode: 429, body: JSON.stringify({ 
          error: 'Billing required. Gemini 3.1 Pro needs a payment method on file.' 
        })};
      }
      return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message }) };
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
    return { statusCode: 200, body: JSON.stringify({ response: reply }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};
