# Supabase Auto Keep-Alive System

## Overview

This system automatically adds and removes dummy records to keep your Supabase database active and prevent it from being deleted due to inactivity.

## Files Created

1. **`lib/dummyRecordManager.ts`** - Core utility functions for managing dummy records
2. **`app/api/database-ping/route.ts`** - API endpoint for triggering maintenance
3. **`migrations/001_create_dummy_records_table.sql`** - Database schema setup

## Setup Instructions

### Step 1: Set Up the Database Table

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `migrations/001_create_dummy_records_table.sql`
5. Paste into the SQL editor and click **Execute**

This creates:
- `dummy_records` table with proper indexing
- Row-level security (RLS) policies
- Indexed columns for performance

### Step 2: Add CRON_SECRET to Environment

Add a secret token to your `.env.local` file for security:

```env
CRON_SECRET=your-secret-token-here-make-it-long-and-random
```

For production (Vercel):
1. Go to your project settings
2. Add this to Environment Variables
3. Redeploy your app

### Step 3: Schedule the Cron Job

#### Option A: Using Vercel Cron Jobs (Recommended for Vercel deployments)

Create `vercel.json` in your project root:

```json
{
  "crons": [{
    "path": "/api/database-ping",
    "schedule": "0 */6 * * *"
  }]
}
```

This runs every 6 hours. Common cron patterns:
- `"0 * * * *"` - Every hour
- `"0 */6 * * *"` - Every 6 hours (recommended)
- `"0 0 * * *"` - Daily at midnight
- `"*/30 * * * *"` - Every 30 minutes

#### Option B: Using External Cron Service (EasyCron, UptimeRobot)

1. Go to [EasyCron.com](https://www.easycron.com/) or [UptimeRobot](https://uptimerobot.com/)
2. Create a new cron job
3. Set URL: `https://your-deployed-app.vercel.app/api/database-ping`
4. Add header: `Authorization: Bearer your-secret-token-here`
5. Set frequency: Every 6 hours or daily

#### Option C: Using GitHub Actions

Create `.github/workflows/database-ping.yml`:

```yaml
name: Database Keep-Alive

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping database
        run: |
          curl -X GET "https://your-deployed-app.vercel.app/api/database-ping" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## API Endpoint

**Endpoint:** `GET /api/database-ping`

**Headers:**
```
Authorization: Bearer your-cron-secret
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Database maintenance completed successfully",
  "timestamp": "2026-05-31T10:30:00.000Z",
  "addResult": {
    "success": true,
    "data": [
      {
        "id": "dummy_1717145400000",
        "created_at": "2026-05-31T10:30:00.000Z",
        "metadata": "Auto-generated record to keep database active",
        "is_dummy": true
      }
    ]
  },
  "cleanupResult": {
    "success": true,
    "deletedCount": 5
  }
}
```

## How It Works

1. **Add Dummy Record**: Every time the endpoint is called, a new dummy record is created
   - ID: Timestamp-based unique ID
   - Metadata: Identifies it as auto-generated
   - is_dummy: Boolean flag for easy filtering

2. **Cleanup Old Records**: Automatically deletes dummy records older than 7 days
   - Prevents table bloat
   - Maintains database performance
   - Configurable retention period

3. **No Impact on Real Data**: Only operates on the `dummy_records` table
   - Separate from user data
   - Clean separation of concerns
   - Easy to remove later if needed

## Security Considerations

- **CRON_SECRET**: Protects your endpoint from unauthorized calls
  - Change the secret regularly
  - Use a strong, random token
  - Store securely in environment variables

- **Service Role Key**: Used only for admin operations
  - Keep `SUPABASE_SERVICE_ROLE_KEY` safe
  - Never expose in client-side code (already hidden)

- **RLS Policies**: Table has security policies configured
  - Service role can manage records
  - Optional anon read-only access

## Testing

### Test Locally

```bash
# In your project directory
curl -X GET "http://localhost:3000/api/database-ping" \
  -H "Authorization: Bearer test-secret"
```

### Test in Production

```bash
curl -X GET "https://your-deployed-app.vercel.app/api/database-ping" \
  -H "Authorization: Bearer your-actual-secret"
```

## Monitoring

Check the dummy records in Supabase:

1. Go to your Supabase dashboard
2. Open the **Table Editor**
3. Look for the `dummy_records` table
4. You should see new records appearing at scheduled intervals

Query to check recent activity:

```sql
SELECT * FROM dummy_records
ORDER BY created_at DESC
LIMIT 10;
```

Query to count dummy records:

```sql
SELECT COUNT(*) FROM dummy_records;
```

## Customization

### Change Cleanup Retention Period

Edit `app/api/database-ping/route.ts`:

```typescript
// Change from 7 to your desired number of days
const cleanupResult = await cleanupDummyRecords(14); // Keep 14 days
```

### Adjust Cron Frequency

In `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/database-ping",
    "schedule": "0 0 * * *"  // Change schedule here
  }]
}
```

### Add Custom Logging

Edit `lib/dummyRecordManager.ts` to send logs to your monitoring service (Sentry, LogRocket, etc.)

## Troubleshooting

### Issue: 401 Unauthorized

**Cause**: Authorization header missing or incorrect
**Solution**: 
- Verify `CRON_SECRET` matches your header value
- Check environment variable is set in deployment

### Issue: 500 Internal Server Error

**Cause**: Missing `dummy_records` table or wrong API key
**Solution**:
- Run the SQL migration in Supabase
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase service status

### Issue: Records not being created

**Cause**: Cron job not triggering
**Solution**:
- Verify schedule syntax in `vercel.json`
- Check cron service logs
- Test endpoint manually with curl

## Disabling the System

To stop the auto keep-alive:

1. Remove the cron job from your cron service or `vercel.json`
2. Keep the `dummy_records` table for historical reference or delete it if not needed

To delete the table:

```sql
DROP TABLE IF EXISTS dummy_records;
```

## Cost Considerations

- **Minimal database operations**: Read/write operations are very small
- **Negligible storage**: A few dummy records per day = minimal storage
- **No additional costs**: Uses existing Supabase plan

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/crons)
- [Cron Expression Syntax](https://en.wikipedia.org/wiki/Cron)
