# Migration to Unified Next.js Architecture - Summary

## ✅ Completed

### Phase 1: Custom Server Setup
- Created `broadcast-app/server.js` with Next.js + Socket.IO integration
- Installed dependencies: `mysql`, `axios`, `dotenv`, `socket.io`
- Configured Socket.IO with all event handlers from old server
- Updated `package.json` scripts to use custom server

### Phase 2: API Routes Migration
- Created `src/lib/db.ts` with database connection and all API helpers
- Migrated `/api/partenaires/[idEvent]/[idConfEvent]` route
- Migrated `/api/update-order` route
- Migrated `/api/update-conferencier-order` route

### Phase 3: Screen Views Migration
- Created `/pages/screen/[id].tsx` with Socket.IO client
- Replaced EJS template with React component
- Integrated real-time iframe updates via Socket.IO

## 🔧 Configuration Required

### 1. Environment Variables
Copy `.env` from root to `broadcast-app/`:
```bash
cd broadcast-app
cp ../.env .env
```

Or create `broadcast-app/.env` with:
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_database_name
PORT=3001
```

### 2. Update Admin Page Socket Connection
The admin page still connects to port 3001, which is correct, but ensure it's using the unified server.

## 🧪 Testing

### Local Testing
```bash
cd broadcast-app
npm run dev
```

Test URLs:
- Admin: `http://localhost:3001/event/470/admin/176895`
- Screen: `http://localhost:3001/screen/1`
- API: `http://localhost:3001/api/partenaires/470/176895`

### Production Deployment
1. Build the app: `npm run build`
2. Start with PM2: `pm2 start server.js --name broadcast`
3. Save PM2 config: `pm2 save`

## 📝 Next Steps

1. ✅ Test Socket.IO functionality (publish buttons)
2. ✅ Test API endpoints
3. ⏳ Update PM2 configuration
4. ⏳ Update deployment workflow
5. ⏳ Remove old `server.js` from root (after verification)
