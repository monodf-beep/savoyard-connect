import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pdf_base64, filename } = await req.json();

    if (!pdf_base64) {
      throw new Error('No PDF data provided');
    }

    console.log(`Processing PDF: ${filename || 'unknown'}`);

    // Decode base64 to binary
    const binaryString = atob(pdf_base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Extract text from PDF by parsing the raw content
    // We look for text streams between BT and ET operators
    const pdfText = new TextDecoder('latin1').decode(bytes);
    
    let extractedText = '';

    // Method 1: Extract text from parentheses in BT/ET blocks (most common)
    const btEtRegex = /BT\s([\s\S]*?)ET/g;
    let match;
    while ((match = btEtRegex.exec(pdfText)) !== null) {
      const block = match[1];
      // Extract text from Tj and TJ operators
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        extractedText += tjMatch[1] + ' ';
      }
      // TJ arrays
      const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
      let tjArrMatch;
      while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
        const inner = tjArrMatch[1];
        const strRegex = /\(([^)]*)\)/g;
        let strMatch;
        while ((strMatch = strRegex.exec(inner)) !== null) {
          extractedText += strMatch[1];
        }
        extractedText += ' ';
      }
    }

    // Method 2: Try to find stream content with readable text
    if (!extractedText.trim()) {
      // Fallback: extract any readable strings from the PDF
      const readableRegex = /\(([A-Za-zÀ-ÿ0-9\s,.;:!?'"\-]{3,})\)/g;
      let readMatch;
      while ((readMatch = readableRegex.exec(pdfText)) !== null) {
        extractedText += readMatch[1] + ' ';
      }
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '')
      .replace(/\\t/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`Extracted ${extractedText.length} characters from PDF`);

    return new Response(
      JSON.stringify({ text: extractedText, filename }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('PDF extraction error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
