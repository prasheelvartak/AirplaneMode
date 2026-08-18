/**
 * Vercel Serverless API Route: /api/extract
 * Allows users to extract flights from screenshots and text without needing their own Gemini API key.
 * Uses GEMINI_API_KEY from Vercel environment variables if present.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'NO_SERVER_KEY' });
  }

  try {
    const { text, imageBase64, mimeType } = req.body || {};
    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'No input provided' });
    }

    const systemPrompt = `
      You are an expert flight itinerary and boarding pass parser.
      Extract ALL flight segments from the provided text or image into a clean JSON array.
      Schema for each flight segment:
      {
        "date": "YYYY-MM-DD",
        "flightNumber": "e.g. AA50, BA139, 6E2113",
        "fromCode": "3-letter IATA code e.g. DFW, LHR, JFK",
        "toCode": "3-letter IATA code e.g. LHR, BOM, LAX",
        "depTime": "HH:MM:SS or HH:MM",
        "arrTime": "HH:MM:SS or HH:MM",
        "duration": "HH:MM:SS (optional)",
        "airline": "Airline name e.g. American Airlines",
        "aircraft": "Aircraft model if mentioned e.g. Boeing 777-300ER",
        "seat": "Seat number e.g. 17A (optional)",
        "flightClass": "Economy, Business, First, or Premium Economy",
        "note": "Any confirmation reference e.g. PNR: XYZ123"
      }
      Return ONLY a JSON array of flight objects: [{"date": ...}, ...]
    `;

    const parts = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      parts.push({
        inline_data: {
          mime_type: mimeType || 'image/jpeg',
          data: cleanBase64
        }
      });
      parts.push({ text: systemPrompt + "\nExtract flight details from this boarding pass/booking screenshot." });
    } else {
      parts.push({ text: systemPrompt + "\nInput Text:\n" + text });
    }

    const models = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];
    let lastErr = null;

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        const data = await response.json();
        if (response.ok && data.candidates && data.candidates.length > 0) {
          let raw = data.candidates[0].content.parts[0].text.trim();
          if (raw.startsWith('```')) {
            raw = raw.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
          }
          const parsed = JSON.parse(raw);
          return res.status(200).json({ flights: Array.isArray(parsed) ? parsed : (parsed.flights || [parsed]) });
        } else {
          lastErr = data.error?.message || `HTTP ${response.status}`;
        }
      } catch (err) {
        lastErr = err.message;
      }
    }

    return res.status(500).json({ error: lastErr || 'Failed to extract flights with server AI.' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
