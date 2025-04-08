# 🏆 Task Titans – Chore Competition & Analytics App

A full-stack project to gamify and track chores using leaderboards, analytics, and stopwatch-based logging. Designed for both **solo users** and **groups** (friends/family/roommates), the app allows tracking, competing, and improving over time.

---

## 📚 Features

### ⏱️ Stopwatch Logging
- Web-based stopwatch (hh:mm:ss:ms)
- Logs chore duration to all groups a user is part of
- Supports dropdown + custom input for task name
- Logs are recorded in the backend in real time

### 👤 User Authentication
- Secure signup/login using hashed passwords (bcrypt)
- JWT-based authentication
- Each user auto-joins a private group at signup

### 📦 Group System
- Users can create, join, and manage chore groups
- Groups have shared task lists and leaderboards

### 🧠 Personal Analytics
- Daily summary tables of all chores done
- Personal chore leaderboard with rankings
- Insights: average vs. latest performance

### 🏆 Leaderboards
#### For Each Task:
- **Group**:
  - Best times (ever) per user
  - Daily/weekly/monthly ranks with dates
  - Average duration across a time range
- **Private**:
  - All past logs ranked by speed
  - Feedback: “You beat X% of your past logs”

### 📊 Visual Charts (Frontend Coming Soon)
- Chore performance graphs (line/bar)
- Date range filters, average lines
- Color-coded per task or user

---

## 📂 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Deployment (Planned) | Render / Vercel / MongoDB Atlas |

---

## ⚙️ Getting Started

### 1. Clone the repo
git clone https://github.com/yourname/task-titans-backend.git

### 2. Install backend dependencies
cd task-titans-backend
npm install

### 3. Create a .env file
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key

### 4. Run server
npm start

### 5. Open the stopwatch UI (from public/stopwatch)
Run using Live Server in VS Code or open index.html directly.

---

## 📌 Status
✅ Backend complete
✅ Daily & private analytics
✅ Stopwatch + frontend log integration
🛠️ Frontend dashboard with charts (in progress)
🚀 Deployment planned (Render / GitHub Pages)

---

## 🧠 Author Notes
Started as a stopwatch prototype, now grown into a full-stack analytics & gamification platform. Ideal for students, roommates, or families who want to stay productive with fun competition.

---

## 📬 Contact
If you're a recruiter or developer and want to collaborate or offer feedback, feel free to reach out!

---

## 📚 References & Resources

### 🧠 Backend & API Development
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose ODM Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [REST API Design Guidelines](https://www.smashingmagazine.com/2018/01/understanding-using-rest-api/)
- [Environment Variables in Node.js (.env)](https://www.npmjs.com/package/dotenv)

### 🔒 Authentication & Security
- [bcryptjs for Password Hashing](https://www.npmjs.com/package/bcryptjs)
- [jsonwebtoken (JWT) Basics](https://github.com/auth0/node-jsonwebtoken)
- [Authentication Best Practices (JWT)](https://developer.okta.com/blog/2019/03/06/simple-user-authentication-in-express)

### 🛠 Dev Tools & Testing
- [Thunder Client for API Testing](https://www.thunderclient.com/)
- [Postman for API Testing](https://www.postman.com/)
- [CORS Middleware in Express](https://expressjs.com/en/resources/middleware/cors.html)
- [Nodemon for Development](https://www.npmjs.com/package/nodemon)

### 🎯 Frontend Integration
- [HTML Stopwatch Logic](https://www.geeksforgeeks.org/create-a-stopwatch-in-javascript/)
- [JavaScript Date & Timer Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Fetch API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [LocalStorage for Frontend Auth](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### 🌐 Deployment
- [Deploying Node.js Apps on Render](https://render.com/docs/deploy-node-express-app)
- [Deploying MongoDB with Atlas](https://www.mongodb.com/docs/atlas/)
- [GitHub Best Practices for Public Projects](https://docs.github.com/en/get-started/quickstart/create-a-repo)
