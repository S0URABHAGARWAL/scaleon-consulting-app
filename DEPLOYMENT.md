# ScaleOn Consulting - Complete Deployment Guide

## 📋 Project Overview

**Project**: ScaleOn Consulting - B2B SaaS Platform
**Stack**: Vite + React Frontend | Firebase Backend | Gemini AI Integration
**Database**: Firebase Realtime Database
**Functions**: Cloud Functions (Node.js 18)
**Hosting**: Firebase Hosting
**Repository**: https://github.com/S0URABHAGARWAL/scaleon-consulting-app
**Firebase Project**: scaleon-consulting-91606-201ff
**Google Cloud Project**: gen-lang-client-0041981700

---

## ✅ What's Already Configured

✓ Firebase Project Created (scaleon-consulting-91606-201ff)
✓ Gemini API Key Generated & Stored in Google Cloud
✓ GitHub Repository Created (public)
✓ firebase.json Configuration Added
✓ Database Security Rules Configured
✓ Cloud Functions Package Configured
✓ Cloud Functions Implementation Complete
✓ Environment Variables Template (.env.example)

---

## 🚀 Deployment Steps (Execute These Locally)

### Step 1: Clone & Setup Repository

```bash
git clone https://github.com/S0URABHAGARWAL/scaleon-consulting-app.git
cd scaleon-consulting-app
npm install
cd functions
npm install
cd ..
```

### Step 2: Setup Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
```

### Step 3: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:
- Get Firebase config from: Firebase Console → Project Settings
- GEMINI_API_KEY: Already set in Google Cloud (gen-lang-client-0041981700)

### Step 4: Build Frontend

```bash
npm run build
```

### Step 5: Deploy to Firebase

```bash
# Full deployment (Hosting + Functions + Database)
firebase deploy --project scaleon-consulting-91606-201ff

# Or individually:
firebase deploy --only hosting --project scaleon-consulting-91606-201ff
firebase deploy --only functions --project scaleon-consulting-91606-201ff
firebase deploy --only database --project scaleon-consulting-91606-201ff
```

### Step 6: Verify Deployment

```bash
# Check deployment status
firebase hosting:channel:list --project scaleon-consulting-91606-201ff

# View live URL
echo "Your app is live at: https://scaleon-consulting-91606-201ff.web.app"

# View function logs
firebase functions:log --project scaleon-consulting-91606-201ff
```

---

## 🔄 GitHub to Firebase Auto-Deployment

### Setup GitHub Actions (Optional but Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: scaleon-consulting-91606-201ff
          channelId: live
```

---

## 📱 Backend API Endpoints

### analyzeData (Cloud Function)
```
POST: https://us-central1-scaleon-consulting-91606-201ff.cloudfunctions.net/analyzeData

Payload:
{
  "prompt": "Analyze this sales data...",
  "payload": { /* your data */ },
  "type": "sales_analysis"
}

Response:
{
  "success": true,
  "analysis": "AI analysis result...",
  "id": "database_key"
}
```

### getInsights (Cloud Function)
```
POST: https://us-central1-scaleon-consulting-91606-201ff.cloudfunctions.net/getInsights

Returns: Last 10 analyses from database
```

### processBatchAnalysis (Cloud Function)
```
POST: https://us-central1-scaleon-consulting-91606-201ff.cloudfunctions.net/processBatchAnalysis

Payload:
{
  "items": [
    { "prompt": "Analyze item 1..." },
    { "prompt": "Analyze item 2..." }
  ]
}
```

---

## 🗄️ Database Structure

```
/
├── analyses/
│   ├── $autoId/
│   │   ├── uid: "user_id"
│   │   ├── input: { ...data }
│   │   ├── output: "AI analysis text"
│   │   ├── timestamp: 1701345600000
│   │   └── type: "sales_analysis"
│
├── users/
│   ├── $uid/
│   │   ├── email: "user@example.com"
│   │   ├── displayName: "John Doe"
│   │   ├── role: "consultant"
│   │   ├── createdAt: 1701345600000
│   │   └── lastLogin: 1701345600000
│
└── insights/
    ├── $autoId/
    │   ├── timestamp: 1701345600000
    │   ├── type: "market_trend"
    │   └── data: { ...insight_data }
```

---

## 🔐 Security Features

✓ Firebase Authentication Required
✓ User-scoped database access
✓ Email validation on user records
✓ Role-based permissions (consultant/admin/client)
✓ Realtime security rules enforcement
✓ API key rotation support (1 production key retained)

---

## 🧪 Local Testing

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start dev server
npm run dev

# Access emulator UI at: http://localhost:4000
```

---

## 📊 Project Status

- [x] GitHub Repository Setup
- [x] Firebase Project Configuration
- [x] Realtime Database Rules
- [x] Cloud Functions Implementation
- [x] Gemini AI Integration
- [x] API Key Management (Cleaned up, 1 key retained)
- [x] Environment Configuration
- [ ] Frontend Build & Deployment (Execute locally)
- [ ] GitHub Actions CI/CD (Optional)
- [ ] Custom Domain Setup (Optional)

---

## 🆘 Troubleshooting

**Function deployment fails**:
```bash
firebase functions:log --tail
```

**Database rules error**:
- Check Firebase Console → Database → Rules tab
- Verify .json syntax is valid

**CORS issues**:
- Functions already have CORS enabled
- Check Firebase Hosting rewrite rules in firebase.json

**API Key errors**:
- Ensure GEMINI_API_KEY env var is set
- Check Google Cloud Console → APIs & Services → Credentials

---

## 📞 Support

For issues or questions, refer to:
- Firebase Documentation: https://firebase.google.com/docs
- Google Generative AI: https://ai.google.dev
- Project Repository: https://github.com/S0URABHAGARWAL/scaleon-consulting-app

---

**Last Updated**: November 30, 2025
**Deployment Status**: Ready for Production
