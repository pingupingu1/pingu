# Vitallic - Client Deployment Guide

## Three Deployment Options

### Option 1: Fastest (Recommended for Quick Start)
**Vercel Deployment** - Zero configuration, automatic HTTPS
- Time: 5 minutes
- Cost: Free to $20/month
- Best for: Quick client demos and testing

### Option 2: Professional (Recommended for Production)
**Custom Domain + Vercel Backend**
- Time: 30 minutes
- Cost: $10/month domain + hosting
- Best for: Professional clients, branded deployment

### Option 3: Enterprise (Full Control)
**Self-hosted on Your Server**
- Time: 1-2 hours setup
- Cost: Your infrastructure costs
- Best for: Enterprise clients, compliance requirements

---

## Option 1: Deploy to Vercel (5 minutes)

### Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub/Google account
3. Verify email

### Step 2: Deploy from Git
1. Click "New Project"
2. Connect your GitHub repository
3. Select the project folder
4. Vercel auto-detects Vite configuration
5. Click "Deploy"

### Step 3: Add Environment Variables
1. Go to Settings → Environment Variables
2. Add these variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3. Redeploy

### Step 4: Get Your URL
- Your app is live at: `https://your-project.vercel.app`
- Share this URL with your client

### Advantages
✓ Automatic HTTPS
✓ Free tier available
✓ Instant deployment
✓ Auto scaling
✓ CDN included

---

## Option 2: Custom Domain Deployment (30 minutes)

### Prerequisites
- Domain name (e.g., vitallic-client.com)
- Vercel account

### Step 1: Buy Domain
Options:
- Vercel Domains (managed)
- Namecheap (cheap)
- GoDaddy (popular)
- Google Domains

### Step 2: Connect to Vercel
1. In Vercel: Settings → Domains
2. Add domain
3. Update DNS records (if external domain)
4. Wait for DNS propagation (5-30 minutes)

### Step 3: Enable HTTPS
- Automatic with Vercel
- Certificate auto-renewed

### Step 4: Share with Client
- URL: `https://vitallic-client.com`
- DNS properly configured
- HTTPS enabled

### Custom Domain Costs
- Domain: $10-15/year
- Hosting: Free-$20/month
- **Total: ~$1-2/month**

---

## Option 3: Self-Hosted Deployment (Advanced)

### Prerequisites
- Your own server (AWS, DigitalOcean, Linode)
- Node.js 18+ installed
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt - free)

### Step 1: Prepare Server
```bash
# SSH into server
ssh root@your-server-ip

# Install dependencies
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# Install PM2 for process management
npm install -g pm2
```

### Step 2: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-repo/vitallic.git
cd vitallic

# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2
pm2 start "npm run preview" --name vitallic
pm2 save
```

### Step 3: Configure Nginx
```nginx
server {
    listen 80;
    server_name vitallic-client.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vitallic-client.com;

    ssl_certificate /etc/letsencrypt/live/vitallic-client.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vitallic-client.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 4: Enable SSL with Let's Encrypt
```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Get certificate
certbot certonly --standalone -d vitallic-client.com

# Auto-renew
certbot renew --dry-run
```

---

## Delivery Checklist

### Before Sending to Client
- [ ] Test deployment URL in Chrome and Edge
- [ ] Verify microphone works on deployment
- [ ] Check dashboard loads correctly
- [ ] Verify Supabase connection
- [ ] Test voice profiles
- [ ] Confirm HTTPS is working
- [ ] Generate access credentials if needed

### What to Send to Client

**Email Template:**
```
Subject: Vitallic Voice Assistant - Your Deployment is Ready

Dear [Client Name],

Your Vitallic Dutch AI Voice Assistant is ready!

ACCESS DETAILS:
- URL: https://[your-deployment-url]
- Browser: Use Google Chrome or Microsoft Edge
- Microphone: Required for voice features

QUICK START:
1. Open the URL in Chrome
2. Select a voice profile (Friendly or Professional)
3. Click the microphone button
4. Grant microphone permissions
5. Start speaking in Dutch

DEMO SCRIPT:
- Say: "Hallo Vitallic"
- Say: "Wat kun je doen?"
- Say: "Bedankt!"
- Switch to Dashboard to see recorded conversation

SUPPORT:
- Documentation: [link to README]
- Issues: Contact [your email]
- Feature requests: [your email]

Best regards,
[Your Name]
```

---

## Environment Variables Setup

### Get Supabase Credentials

**Step 1: Log in to Supabase**
1. Go to https://supabase.com
2. Open your project
3. Go to Settings → API

**Step 2: Copy Credentials**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Step 3: Store Securely**
- Never share ANON_KEY with client
- Only deploy as environment variables
- Rotate keys if compromised

---

## Security Checklist

Before handing over to client:

### Backend Security
- [ ] Supabase RLS policies configured
- [ ] Authentication required for dashboard
- [ ] HTTPS enabled
- [ ] Environment variables in production
- [ ] No hardcoded secrets

### Frontend Security
- [ ] No API keys in code
- [ ] CORS headers configured
- [ ] Input validation enabled
- [ ] Error messages don't leak info
- [ ] Rate limiting implemented (if needed)

### Data Security
- [ ] Database backups enabled
- [ ] RLS policies tested
- [ ] User isolation verified
- [ ] Audit logging active

---

## Post-Deployment Monitoring

### Weekly Checks
1. Verify app is running
2. Check error logs
3. Monitor database size
4. Review call statistics

### Monthly Maintenance
1. Update dependencies
2. Review security patches
3. Analyze performance metrics
4. Clean up old data (if policy allows)

### Emergency Contacts
Keep these handy:
- Your email for support
- Supabase status page
- Hosting provider support
- Your database backup location

---

## Adding Multiple Clients

If deploying to multiple clients:

### Option A: Separate Deployments (Recommended)
```
Client A: https://vitallic-clienta.com
Client B: https://vitallic-clientb.com
Client C: https://vitallic-clientc.com
```

Pros:
- Complete isolation
- Independent scaling
- Separate databases possible

Cons:
- More infrastructure costs
- Harder to maintain

### Option B: Single Deployment with Subdomain Routing
```
https://vitallic.com/clienta
https://vitallic.com/clientb
https://vitallic.com/clientc
```

Pros:
- Lower cost
- Centralized management
- Easier updates

Cons:
- Shared infrastructure
- Need routing logic

---

## Troubleshooting After Deployment

### App Not Loading
```bash
# Check logs
pm2 logs vitallic

# Restart
pm2 restart vitallic

# Check if port is open
netstat -tlnp | grep 4173
```

### Microphone Not Working
- Clear browser cache
- Check HTTPS is enabled
- Verify microphone permissions
- Try different browser

### Supabase Connection Failing
- Verify environment variables
- Check firewall rules
- Test connection with curl:
```bash
curl https://your-project.supabase.co/rest/v1
```

### Slow Performance
- Check database query times
- Monitor server CPU/memory
- Review Supabase metrics
- Enable caching if needed

---

## Deployment Commands Reference

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to DigitalOcean
```bash
doctl apps create --spec app.yaml
```

### Deploy to AWS
```bash
# Using AWS Amplify
amplify init
amplify publish
```

---

## Cost Breakdown

### Vercel + Supabase
- Vercel: $0-20/month
- Supabase: $0-100/month (based on usage)
- Domain: $10-15/year
- **Total: $10-50/month**

### DigitalOcean + Supabase
- VPS: $5-20/month
- Supabase: $0-100/month
- Domain: $10-15/year
- **Total: $25-135/month**

### AWS + Supabase
- EC2: $20-100/month
- Supabase: $0-100/month
- Domain: $10-15/year
- **Total: $40-215/month**

---

## Scaling for Multiple Users

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Load test
artillery run loadtest.yml
```

### Caching Strategy
1. Browser caching (static assets)
2. CDN caching (Vercel/Cloudflare)
3. Database query caching
4. API response caching

### Database Optimization
```sql
-- Create indexes for fast queries
CREATE INDEX idx_calls_user ON calls(user_id);
CREATE INDEX idx_transcripts_call ON transcripts(call_id);
CREATE INDEX idx_calls_date ON calls(created_at);
```

---

## Rollback Procedure

If something breaks:

### Step 1: Immediate Rollback
```bash
# Vercel: Automatic via previous deployment
# Self-hosted: pm2 restart vitallic

# Or revert to previous version
git revert HEAD
npm run build
pm2 restart vitallic
```

### Step 2: Database Rollback
- Use Supabase backup (auto-created daily)
- Restore from backup in Supabase dashboard
- Verify data integrity

### Step 3: Communicate with Client
Send email explaining:
- What happened
- What was fixed
- Time to resolution
- Action taken to prevent repeat

---

## Go-Live Checklist

Final verification before client starts using:

- [ ] URL is working
- [ ] HTTPS shows padlock
- [ ] Microphone access prompt appears
- [ ] Voice recognition works (tested with "Hallo")
- [ ] Voice response is clear
- [ ] Dashboard loads and shows stats
- [ ] Call history captures correctly
- [ ] Transcripts display properly
- [ ] Mobile view is responsive
- [ ] No console errors (F12)
- [ ] Performance is acceptable (<2s response)
- [ ] Database connection is stable
- [ ] Backup system is active
- [ ] Monitoring is set up
- [ ] Support email configured

---

## Next Steps

1. Choose deployment option (Vercel recommended)
2. Follow setup steps above
3. Test thoroughly
4. Send access details to client
5. Monitor first week closely
6. Gather feedback
7. Plan Phase 1 enhancements

---

**Questions? Check README.md or contact support.**
