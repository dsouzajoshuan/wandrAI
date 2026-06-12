import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { lat, lng, addressText } = await request.json();
    
    const n8nWebhookUrl = "http://localhost:5678/webhook-test/8eac6a3e-964b-4677-b2d9-9dfa126bad1e";
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    
    const addressStr = addressText ? `\nApprox. Address: ${addressText}` : "";

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: "+916362733807",
        message: `EMERGENCY: I need help. My current live location is: ${mapsLink}${addressStr}`
      })
    });

    const responseText = await response.text();
    console.log("n8n response status:", response.status);
    console.log("n8n response body:", responseText);

    if (!response.ok) {
      throw new Error(`n8n responded with status: ${response.status} - ${responseText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('N8N Proxy Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
