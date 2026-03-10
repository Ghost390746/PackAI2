// netlify/functions/gemini.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;  // Set in Netlify dashboard
const MODEL = 'gemini-1.5-pro';  // Free tier model (or use 'gemini-1.5-pro-latest')

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Prepare request to Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || 'Gemini API error' }),
      };
    }

    // Extract the response text
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: reply }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
