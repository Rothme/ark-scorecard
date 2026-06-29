# The ARK Scorecard
### DA-TI-E MO — Hon. Adedamola Richard Kasunmu

Legislative scorecard and QR deployment tracking platform for Hon. Adedamola Richard Kasunmu, Deputy Majority Leader, Lagos State House of Assembly, Ikeja Constituency II.

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Public landing page — achievements, AI query, share |
| `/field.html` | Field agent portal — register QR deployments |
| `/admin.html` | Admin dashboard — hostility map, analytics |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scan` | POST | Log a QR scan event |
| `/api/locations` | GET/POST | Manage deployment locations |
| `/api/stats` | GET | Admin analytics data |
| `/api/ai` | POST | Claude AI achievement queries |

## Credentials

- Admin password: set in Cloudflare Pages env
- Field agent PIN: set in Cloudflare Pages env

## Stack

- **Frontend**: Plain HTML/CSS/JS — no framework
- **Backend**: Cloudflare Pages Functions
- **Storage**: Cloudflare KV
- **AI**: Anthropic Claude API
- **Map**: Leaflet + OpenStreetMap
- **Deploy**: GitHub Actions → Cloudflare Pages

## How QR Deployment Works

1. Admin generates code batch (e.g. IK2-001 to IK2-5000) from `/admin.html`
2. All 5,000 QR stickers print identically — same QR, same design, blank code space
3. Agents collect stickers and assigned code batches
4. Agent arrives at location → writes code on sticker → registers on `/field.html`
5. Public scans QR → enters code → scan attributed to that location
6. Admin views hostility map — red = no scans after 7 days
