export interface Env {
  DISCORD_WEBHOOK_URL?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = origin.includes('zapixal.com') || origin.includes('localhost') || origin.includes('127.0.0.1') ? origin : 'https://zapixal.com';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10);
    if (contentLength > 5 * 1024 * 1024) { // 5MB limit
      return new Response(JSON.stringify({ error: 'Payload size exceeds limit' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await request.json() as any;
    const { isHelpful, category, message, screenshotBase64, diagnostics } = body || {};

    if (typeof isHelpful !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Missing required feedback parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const webhookUrl = env.DISCORD_WEBHOOK_URL || (typeof process !== 'undefined' ? process.env?.DISCORD_WEBHOOK_URL : undefined);

    if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      const isPositive = isHelpful === true;
      const title = isPositive ? '👍 Positive Feedback Received' : '👎 Negative / Issue Feedback';
      const color = isPositive ? 0x10b981 : 0xef4444;

      const fields = [
        { name: 'Rating', value: isPositive ? '👍 Helpful' : '👎 Not Helpful', inline: true },
        { name: 'Category', value: category || (isPositive ? 'General Praise' : 'Unspecified'), inline: true },
      ];

      if (diagnostics?.currentRoute) {
        fields.push({ name: 'Route', value: `\`${diagnostics.currentRoute}\``, inline: true });
      }

      if (diagnostics?.browserName) {
        fields.push({ name: 'Environment', value: `${diagnostics.browserName} on ${diagnostics.osName} (${diagnostics.viewportWidth}x${diagnostics.viewportHeight})`, inline: false });
      }

      if (diagnostics?.fileCount !== undefined) {
        fields.push({ 
          name: 'Queue Specs', 
          value: `Files: ${diagnostics.fileCount} | Target Format: ${diagnostics.targetFormat}${diagnostics.targetMaxKB ? ` (${diagnostics.targetMaxKB}KB target)` : ''}`, 
          inline: false 
        });
      }

      const embed: any = {
        title,
        description: message ? `**User Message:**\n${message.slice(0, 1000)}` : '*No written message provided*',
        color,
        fields,
        footer: { text: `Zapixal Feedback System • ${new Date().toISOString().split('T')[0]}` },
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Feedback received successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to process feedback', details: err?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions = async (context: { request: Request }) => {
  const origin = context.request.headers.get('Origin') || '';
  const allowedOrigin = origin.includes('zapixal.com') || origin.includes('localhost') || origin.includes('127.0.0.1') ? origin : 'https://zapixal.com';

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
