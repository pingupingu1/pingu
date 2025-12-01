# Vitallic Admin Guide - Client Management

## Your Control Panel

As the system owner, you have full control over Vitallic deployments. Here's how to manage everything.

---

## 1. Creating Client Accounts

### Automated: Let Clients Self-Register
1. Share deployment URL with client
2. Client clicks "Don't have an account? Sign up"
3. Client creates their own account
4. They're automatically authenticated

**Pros**: No work on your part, clients self-service
**Cons**: Anyone can sign up

### Manual: You Create Accounts
1. Go to Supabase Dashboard
2. Navigate to: Authentication → Users
3. Click "Add User"
4. Enter email and temporary password
5. Send details to client
6. Client logs in and changes password

**Pros**: You control who gets access
**Cons**: More admin work

### Recommended: Hybrid Approach
- Enable self-signup for trials (first 30 days)
- After trial, convert to managed accounts
- Prevents free account abuse

---

## 2. Managing User Access

### Disable a Client Account
1. Supabase: Authentication → Users
2. Find client's email
3. Click user
4. Click "Disable user"
5. User cannot login (data preserved)

### Delete a Client Account
1. Supabase: Authentication → Users
2. Find user to delete
3. Click menu → Delete user
4. All their data is deleted (permanent!)
5. **This action cannot be undone**

### Reset Client Password
1. Supabase: Authentication → Users
2. Find client's email
3. Click user → Edit
4. Change password
5. Send new password to client (securely)

### View Client Login History
1. Supabase: Authentication → Users
2. Click on any user
3. See "Last signed in" timestamp
4. See all login attempts

---

## 3. Monitoring Client Usage

### View Call Statistics
```sql
-- In Supabase SQL Editor
SELECT
  user_id,
  COUNT(*) as total_calls,
  SUM(duration_seconds) as total_duration,
  AVG(duration_seconds) as avg_duration,
  MAX(created_at) as last_call
FROM calls
GROUP BY user_id
ORDER BY total_calls DESC;
```

### Track Specific Client
```sql
-- Find all calls from one client
SELECT *
FROM calls
WHERE user_id = 'client-email@example.com'
ORDER BY created_at DESC
LIMIT 100;
```

### Monitor Database Size
1. Supabase: Settings → Usage
2. See database storage used
3. See API requests per day
4. See concurrent connections

### Check System Performance
1. Supabase: Analytics
2. View response times
3. See error rates
4. Monitor API throughput

---

## 4. Managing Client Tiers

### Free Tier
```sql
-- Query to identify free tier users
INSERT INTO user_tiers (user_id, tier, monthly_limit, features)
VALUES ('email@example.com', 'free', 100, '["voice_assistant", "dashboard"]');
```

### Pro Tier
```sql
INSERT INTO user_tiers (user_id, tier, monthly_limit, features)
VALUES ('email@example.com', 'pro', 1000, '["voice_assistant", "dashboard", "export", "api"]');
```

### Enterprise Tier
```sql
INSERT INTO user_tiers (user_id, tier, monthly_limit, features)
VALUES ('email@example.com', 'enterprise', NULL, '["all"]');
```

### Check Usage Against Limits
```sql
-- Monitor monthly usage
SELECT
  c.user_id,
  COUNT(*) as calls_this_month,
  ut.monthly_limit,
  (ut.monthly_limit - COUNT(*)) as remaining_calls
FROM calls c
LEFT JOIN user_tiers ut ON c.user_id = ut.user_id
WHERE c.created_at >= date_trunc('month', now())
GROUP BY c.user_id, ut.monthly_limit
HAVING COUNT(*) >= ut.monthly_limit;
```

---

## 5. Blocking & Controlling Access

### Method 1: IP Whitelisting (Advanced)
Deploy edge function to validate IP:
```typescript
// supabase/functions/validate-ip/index.ts
const ALLOWED_IPS = [
  '192.168.1.1',
  '203.0.113.0/24'
];

export async function validateIP(clientIP: string) {
  // Check if IP is in whitelist
}
```

### Method 2: License Keys
Issue license keys to clients:
```sql
-- Create licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,
  user_id TEXT,
  valid_until DATE,
  status TEXT -- active, expired, revoked
);
```

### Method 3: Time-based Blocking
```sql
-- Disable access after trial ends
UPDATE auth.users
SET banned_until = NOW() + INTERVAL '30 days'
WHERE email = 'client@example.com';
```

### Method 4: Feature Flags
```sql
-- Control features per client
CREATE TABLE client_features (
  user_id TEXT,
  feature_name TEXT,
  is_enabled BOOLEAN
);

-- Disable dashboard for specific client
INSERT INTO client_features VALUES ('client@example.com', 'dashboard', false);
```

---

## 6. Deployment Management

### Deploy New Version
```bash
# Build new version
npm run build

# Deploy to Vercel
vercel --prod

# Or update on your server
git pull
npm install
npm run build
pm2 restart vitallic
```

### Rollback to Previous Version
```bash
# In Vercel: Click "Deployments" → Select previous → "Promote"
# Or on your server:
git revert HEAD
npm run build
pm2 restart vitallic
```

### Update Environment Variables
1. Vercel: Settings → Environment Variables
2. Edit variable
3. Click "Save and Deploy"
4. Automatic redeploy happens

---

## 7. Database Maintenance

### Daily Tasks
```bash
# Check database health
# Via Supabase: Settings → Database → Health

# Monitor storage
# Via Supabase: Settings → Usage
```

### Weekly Tasks
```sql
-- Clean up old sessions (older than 90 days)
DELETE FROM transcripts
WHERE created_at < NOW() - INTERVAL '90 days'
AND call_id IN (
  SELECT id FROM calls
  WHERE status = 'completed'
);
```

### Monthly Tasks
```bash
# Backup database
# Via Supabase: Backups → Manual Backup

# Review usage statistics
# Via Supabase: Analytics

# Update dependencies
npm update
npm audit fix
```

### Quarterly Tasks
```bash
# Security audit
# Review auth logs
# Check for unused accounts
# Analyze performance metrics
```

---

## 8. Cost Management

### Monitor Supabase Costs
1. Supabase: Billing
2. See current month costs
3. View usage metrics
4. Set spending limit alerts

### Optimize Database
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_created_at ON calls(created_at);

-- Archive old data
INSERT INTO calls_archive
SELECT * FROM calls WHERE created_at < NOW() - INTERVAL '1 year';
DELETE FROM calls WHERE created_at < NOW() - INTERVAL '1 year';
```

### Predict Monthly Cost
- Base Vercel: $0-20/month
- Supabase (based on usage):
  - Small: $25-50/month
  - Medium: $50-150/month
  - Large: $150+/month

---

## 9. Handling Support Issues

### Client Can't Login
1. Check if user account exists (Supabase → Users)
2. Check if account is banned
3. Reset password
4. Test yourself with their credentials

### App is Slow
1. Check database query performance (Supabase → Analytics)
2. Review browser console for errors
3. Check server CPU usage
4. Consider database optimization

### Microphone Not Working
1. Client browser issue (not server issue)
2. Ask them to:
   - Check browser permissions
   - Try different browser
   - Update browser
   - Clear cache
3. Provide troubleshooting guide

### Data Missing
1. Check database backups (Supabase → Backups)
2. Restore from backup if needed
3. Review audit logs
4. Identify cause

---

## 10. Creating Multiple Client Deployments

### Separate Deployments (Recommended)

**Setup**:
1. Clone repository for each client
2. Deploy to separate Vercel project
3. Use separate Supabase database
4. Customize for each client

**Benefits**:
- Complete isolation
- Independent scaling
- Separate databases
- Easy customization

**Cost** (per client):
- Vercel: $10/month
- Supabase: $50/month
- Domain: $1/month
- Total: ~$60/month per client

### Shared Deployment

**Setup**:
1. Single deployment
2. Shared database
3. Use user_id for isolation
4. Same URL for all clients

**Benefits**:
- Lower cost
- Easier maintenance
- Simpler updates

**Challenges**:
- Data isolation requires careful RLS
- One database failure affects all
- Scaling affects all clients

---

## 11. Backup & Disaster Recovery

### Enable Backups
1. Supabase: Project → Backups
2. Enable daily backups
3. Backups auto-retain for 30 days

### Manual Backup
1. Supabase: Backups
2. Click "Create Manual Backup"
3. Download backup to your computer
4. Store securely

### Restore from Backup
1. Supabase: Backups
2. Find backup to restore
3. Click "Restore"
4. Choose point in time
5. Confirm (this overwrites current data!)

### Database Replication
```sql
-- For enterprise backup
-- Set up logical replication to another database
-- Via Supabase: Settings → Database → Replication
```

---

## 12. Security Management

### Enable 2FA for Admin
1. Supabase: Your Account → Security
2. Enable 2-Factor Authentication
3. Save recovery codes
4. Store safely

### Audit Login History
```sql
-- View who accessed admin panel
SELECT user_id, created_at
FROM auth.audit_log_entries
ORDER BY created_at DESC
LIMIT 100;
```

### Rotate API Keys (Quarterly)
1. Supabase: Settings → API Keys
2. Generate new Anon Key
3. Update environment variables
4. Redeploy
5. Invalidate old key

### Monitor for Abuse
```sql
-- Find suspicious activity
SELECT user_id, COUNT(*) as request_count
FROM audit_log_entries
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 1000;
```

---

## Admin Checklist

### Weekly
- [ ] Check client usage statistics
- [ ] Monitor error logs
- [ ] Verify backups ran
- [ ] Check system performance

### Monthly
- [ ] Review active users
- [ ] Update dependencies
- [ ] Analyze costs
- [ ] Collect user feedback

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Plan new features
- [ ] Update documentation

### Yearly
- [ ] Full security review
- [ ] Infrastructure assessment
- [ ] Budget planning
- [ ] Roadmap planning

---

## Emergency Contacts

- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/support
- Status Pages: https://status.supabase.com

---

## Quick Reference

### Create User
```bash
# Via Supabase Console
# Auth → Users → Add User
```

### Disable User
```bash
# Via Supabase Console
# Auth → Users → Select User → Disable
```

### View Usage
```bash
# Via Supabase Console
# Settings → Usage
```

### Monitor Calls
```sql
SELECT COUNT(*) FROM calls WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Check Errors
```bash
# Vercel: Deployments → Logs
# Your Server: pm2 logs vitallic
```

---

You now have full control over Vitallic deployments! Manage as many clients as you want.
