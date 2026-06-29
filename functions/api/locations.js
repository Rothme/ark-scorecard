const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function onRequestGet(context) {
  try {
    if (!context.env.ARK_KV) {
      return new Response(JSON.stringify({ locations: [] }), { headers: corsHeaders });
    }

    // List all location keys
    const list = await context.env.ARK_KV.list({ prefix: 'loc:' });
    const locations = [];

    for (const key of list.keys) {
      const data = await context.env.ARK_KV.get(key.name);
      if (data) locations.push(JSON.parse(data));
    }

    return new Response(JSON.stringify({ locations }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ locations: [], error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { code, name, type, street, ward, notes, agent, timestamp } = body;

    if (!code || !name) {
      return new Response(JSON.stringify({ success: false, error: 'Code and name required' }), {
        status: 400, headers: corsHeaders
      });
    }

    const locRecord = {
      code: code.toUpperCase(),
      name,
      type: type || 'other',
      street: street || '',
      ward: ward || '',
      notes: notes || '',
      agent: agent || 'Unknown',
      timestamp: timestamp || new Date().toISOString(),
      scans: 0,
      lastScan: null
    };

    if (context.env.ARK_KV) {
      await context.env.ARK_KV.put(`loc:${code.toUpperCase()}`, JSON.stringify(locRecord));
    }

    return new Response(JSON.stringify({ success: true, location: locRecord }), {
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}
