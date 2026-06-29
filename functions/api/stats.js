const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function onRequestGet(context) {
  try {
    if (!context.env.ARK_KV) {
      return new Response(JSON.stringify({ scans: [], weekScans: getEmptyWeek() }), {
        headers: corsHeaders
      });
    }

    // Get last 7 days scan counts
    const weekScans = [];
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().slice(0,10);
      const dayData = await context.env.ARK_KV.get(`day:${dateStr}`);
      weekScans.push({
        day: days[d.getDay()],
        date: dateStr,
        count: dayData ? JSON.parse(dayData).count : 0
      });
    }

    // Get all locations with scan counts
    const locList = await context.env.ARK_KV.list({ prefix: 'loc:' });
    const locations = [];
    for (const key of locList.keys) {
      const data = await context.env.ARK_KV.get(key.name);
      if (data) locations.push(JSON.parse(data));
    }

    const totalScans = weekScans.reduce((s, d) => s + d.count, 0);

    return new Response(JSON.stringify({
      weekScans,
      locations,
      totalScans,
      lastUpdated: new Date().toISOString()
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, weekScans: getEmptyWeek(), locations: [] }), {
      status: 500, headers: corsHeaders
    });
  }
}

function getEmptyWeek() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return Array.from({length:7}, (_,i) => {
    const d = new Date(Date.now() - (6-i) * 86400000);
    return { day: days[d.getDay()], count: 0 };
  });
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}
