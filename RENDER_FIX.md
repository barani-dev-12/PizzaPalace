# Fix Render "Bad Gateway" / Service Unavailable

Your URL: **https://pizzapalace-5xa5.onrender.com**

That page means the Node process **crashed or never started**. Fix it in the Render dashboard (not in `.env` on GitHub).

---

## Step 1 — Open Render logs

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Open service **pizzapalace-5xa5**
3. Click **Logs**

Look for one of these:

| Log message | Fix |
|-------------|-----|
| `Missing required environment variables` | Add env vars below (Step 2) |
| `MongoDB Connection Failed` | Fix `MONGO_URI` + Atlas network access (Step 3) |
| ``key_id` or `oauthToken` is mandatory`` | Push latest code (Razorpay lazy-init) or add `KEY_ID` / `KEY_SECRET` |
| `EADDRINUSE` / port errors | Ensure **Start Command** is `npm start` and root is `backend` |

---

## Step 2 — Set environment variables

**Render → Service → Environment → Add**

| Key | Value |
|-----|--------|
| `MONGO_URI` | MongoDB Atlas connection string (from Atlas → Connect → Drivers) |
| `JWT_SECRET` | Long random string (32+ characters), e.g. generate at [randomkeygen.com](https://randomkeygen.com) |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `KEY_ID` | Razorpay test key id (`rzp_test_...`) |
| `KEY_SECRET` | Razorpay secret |
| `CLIENT_URL` | Your Vercel URL when ready, e.g. `https://your-app.vercel.app` |

Copy values from your local `backend/.env` — **do not commit** `.env` to GitHub.

Click **Save Changes** → **Manual Deploy**.

---

## Step 3 — MongoDB Atlas

1. [cloud.mongodb.com](https://cloud.mongodb.com) → your cluster
2. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)  
   (Required for Render; tighten later if needed.)
3. **Database Access** → user with read/write on your database
4. **Connect** → copy connection string into Render `MONGO_URI`  
   Replace `<password>` with your real password (URL-encode special characters).

---

## Step 4 — Render service settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

Optional: **Environment** → add `NODE_VERSION` = `20` (avoids Node 24 edge cases).

---

## Step 5 — Verify

Open: https://pizzapalace-5xa5.onrender.com/

You should see JSON:

```json
{"success":true,"message":"Pizza Palace API is running!",...}
```

First request after sleep can take **30–60 seconds** on the free plan.

---

## Push code updates (optional)

If logs still show Razorpay crash at startup, push the latest `backend/` (lazy Razorpay + startup checks) to GitHub and redeploy.

```bash
git add backend/
git commit -m "Fix Render startup: env validation and DB before listen"
git push
```
