# Quick Start: Database Keep-Alive Setup (5 Minutes)

## 🚀 Quick Setup

### Step 1: Create Database Table (2 minutes)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Click **SQL Editor**
3. Create new query
4. Paste this:

```sql
CREATE TABLE IF NOT EXISTS dummy_records (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  metadata TEXT,
  is_dummy BOOLEAN DEFAULT true NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dummy_records_created_at 
ON dummy_records(created_at);

ALTER TABLE dummy_records ENABLE ROW LEVEL SECURITY;
```

5. Click **Execute**

### Step 2: Add Environment Variable (1 minute)

Add to `.env.local`:
```env
CRON_SECRET=your-super-secret-token-make-it-random-and-long
```

For Vercel: Add to project Settings → Environment Variables

### Step 3: Schedule Cron Job (2 minutes)

**Option A: Vercel (If deployed on Vercel)**

Create `vercel.json` in root:
```json
{
  "crons": [{
    "path": "/api/database-ping",
    "schedule": "0 */6 * * *"
  }]
}
```

Then: `git push` and redeploy

**Option B: Easy Cron (Free alternative)**

1. Go to [easycron.com](https://www.easycron.com)
2. Create Account
3. Click **Add Cron Job**
4. Set:
   - URL: `https://your-app.vercel.app/api/database-ping`
   - Method: GET
   - Add HTTP Header: `Authorization: Bearer your-super-secret-token-make-it-random-and-long`
   - Frequency: Every 6 hours
5. Click **Create**

## ✅ Verify It Works

### Test Endpoint:
```bash
curl -X GET "https://your-app.vercel.app/api/database-ping" \
  -H "Authorization: Bearer your-super-secret-token-make-it-random-and-long"
```

### Check Supabase:
1. Go to **Table Editor**
2. Select **dummy_records**
3. You should see new records added

## 📊 What Happens Automatically

- **Every 6 hours**: New dummy record added
- **Daily**: Old records deleted (keeps last 7 days)
- **Zero cost**: Uses your existing Supabase plan
- **Zero user impact**: Completely separate from your app data

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check CRON_SECRET matches authorization header |
| Records not appearing | Wait up to 6 hours for first cron run, or test manually |
| Endpoint 500 error | Verify dummy_records table was created in Supabase |

## 📚 Full Documentation

See `KEEP_ALIVE_SETUP.md` for advanced options and customization.

---

**That's it!** Your database will now stay active indefinitely. ✨
