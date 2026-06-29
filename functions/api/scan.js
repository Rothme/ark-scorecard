export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await context.request.json();
    const { code, timestamp, type } = body;

    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
    const cf = context.request.cf || {};

    const scanRecord = {
      id: scanId,
      code: code || null,
      timestamp: timestamp || new Date().toISOString(),
      type: type || 'code_entry',
      country: cf.country || 'NG',
      city: cf.city || null,
      region: cf.region || null
    };

    // Verify code against locations if provided
    let locationName = null;
    let success = true;

    if (code && context.env.ARK_KV) {
      const locData = await context.env.ARK_KV.get(`loc:${code.toUpperCase()}`);
      if (locData) {
        const loc = JSON.parse(locData);
        locationName = loc.name;
        // Increment scan count
        loc.scans = (loc.scans || 0) + 1;
        loc.lastScan = scanRecord.timestamp;
        await context.env.ARK_KV.put(`loc:${code.toUpperCase()}`, JSON.stringify(loc));
      } else {
        success = false;
      }

      // Store scan record
      await context.env.ARK_KV.put(`scan:${scanId}`, JSON.stringify(scanRecord));

      // Update daily counter
      const today = new Date().toISOString().slice(0,10);
      const dayKey = `day:${today}`;
      const dayData = await context.env.ARK_KV.get(dayKey);
      const dayCount = dayData ? JSON.parse(dayData) : { date: today, count: 0 };
      dayCount.count++;
      await context.env.ARK_KV.put(dayKey, JSON.stringify(dayCount));
    }

    return new Response(JSON.stringify({
      success,
      location: locationName,
      message: success ? 'Scan registered' : 'Code not found'
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
