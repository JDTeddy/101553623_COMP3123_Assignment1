# COMP 3123 – Assignment 1
 
**Student:** Jared-Ian Duldulao (101553623)
**Course:** COMP 3123 – Full Stack Development I

---

## 1. Project

#### Purpose
A secure RESTful backend for managing employees where people sign up and log in. They receive a JSON Web Token (JWT), and use it to create and manage their own employees. Every employee belongs to the user who created it, and no user can see, change or delete another user's employees.

#### Technologies
- Runtime/Framework: Node.js (18+), Express 5
- DataBase: MongoDB & Mongoose
- Authentication: JSON Web Tokens (jsonwebtoken), password hashing with bcryptjs
- Validation: express-validator
- Security: helmet & express-rate-limit
- Configuration: dotenv
- Dev Tool: nodemon
- Testing: Postman

#### Project Structure

```
101553623_COMP3123_Assignment1/
├── server.js         
├── package.json
├── package-lock.json
├── .env            
├── .env.example             
├── .gitignore
├── README.md
├── src/
│   ├── config/
│   │   ├── env.js     
│   │   └── db.js   
│   ├── models/
│   │   ├── user.js
│   │   └── employee.js
│   ├── routes/
│   │   ├── user.js           
│   │   └── employee.js
│   ├── controllers/
│   │   ├── user.js            
│   │   └── employee.js        
│   ├── middleware/
│   │   ├── auth.js            
│   │   ├── validate.js        
│   │   ├── rateLimiters.js
│   │   ├── requestLogger.js
│   │   └── errorHandler.js    
│   ├── validators/
│   │   ├── user.js            
│   │   └── employee.js
│   └── utils/
│       ├── logger.js          
│       └── httpError.js       
├── logs/
│   ├── .gitkeep
│   └── sample.log
└── postman/
    └── (your exported collection)
```

## 2. Installation

#### Clone the repository
find a root/area to clone

```bash
git clone https://github.com/JDTeddy/101553623_COMP3123_Assignment1.git
cd 101553623_COMP3123_Assignment1
```
#### Install dependencies

```bash
npm install
```

#### Configure environment variables

```bash
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

#### Start MongoDB
Use local mongodb compass or atlas connection string in MONGODB_URI.
The database will automatically be created the first time data is saved.

#### Start the application

```bash
npm start # production-style
npm run dev # restarts automatically on file changes (nodemon)
```

#### Test the API
1. API runs at http://localhost:3000

2. you can Open http://localhost:3000/health (should show "status": "ok").

3. Import postman/<collection-file>.json into Postman, set the collection variable baseUrl to http://localhost:3000, and run the folders in order. Restart the server before re-running the collection so the rate-limit counters reset.

## 3. Configuration

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `SERVER_PORT` | No | `3000` | Port the server listens on |
| `MONGODB_URI` | **Yes** | – | MongoDB connection string. Must use database name `comp3123_assignment1` |
| `JWT_SECRET` | **Yes** | – | Secret used to sign JWTs. At least 32 characters |
| `JWT_EXPIRES_IN` | No | `1h` | Token lifetime |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate-limit window in ms (15 minutes) |
| `AUTH_RATE_LIMIT_MAX` | No | `10` | Max requests per window for each of signup and login |
| `API_RATE_LIMIT_MAX` | No | `100` | Max requests per window for all other `/api` routes |
| `LOG_DIR` | No | `logs` | Folder for log files |

The server will refuse to start if mongodb_uri or the jwt_secret is missing, or if the jwt_secret is shorter than 32 characters.

## 4. API

Base paths: `/api/v1/user` and `/api/v1/emp`. All request and response bodies are JSON.

| # | Method | Endpoint | Auth | Success |
| --- | --- | --- | --- | --- |
| 1 | POST | `/api/v1/user/signup` | No | `201` |
| 2 | POST | `/api/v1/user/login` | No | `200` |
| 3 | GET | `/api/v1/emp/employees` | Yes | `200` |
| 4 | POST | `/api/v1/emp/employees` | Yes | `201` |
| 5 | GET | `/api/v1/emp/employees/{eid}` | Yes | `200` |
| 6 | PUT | `/api/v1/emp/employees/{eid}` | Yes | `200` |
| 7 | DELETE | `/api/v1/emp/employees?eid=xxx` | Yes | `204` (empty body) |
| – | GET | `/health` | No | `200` |

#### Signup
Rules:
- username 3–30 characters (letters, numbers, underscore)
- valid email
- password 8–72 characters with an uppercase letter, a lowercase letter and a number.
- Username and email are stored in lowercase and must be unique

```json
{ "username": "alice_01", "email": "alice@example.com", "password": "Passw0rdA1" }
```

#### Login
use (username or email) + password:

```json
{ "username": "alice_01", "password": "Passw0rdA1" }
{ "email": "alice@example.com", "password": "Passw0rdA1" }
```

#### Employees
Create/Update body fields:

```json
{
  "first_name": "Ada",
  "last_name": "Lovelace",
  "email": "ada@example.com",
  "position": "Engineer",
  "salary": 85000,
  "date_of_joining": "2025-01-15",
  "department": "R&D"
}
```

## 5. Authentication

#### Signup 
creates the user. The password is hashed with bcrypt before saving.

#### Login 
checks the password against the stored hash. On success the server returns a JWT signed with JWT_SECRET, containing only the user id (id) plus issued-at and expiry times. It expires after JWT_EXPIRES_IN (default 1 hour).

#### JWT
The client sends the token on every protected request: "Authorization: Bearer <jwt>"

#### Authorization Header
The authentication middleware (middleware/auth.js) verifies the signature and expiry, then loads the user from the database and attaches it as req.user.

#### Protected endpoints
all three-through-seven employee endpoints (/api/v1/emp/...). Signup, login and /health are public.
Wrong username and wrong password return the same 401 Invalid credentials. message, so an attacker cannot discover which usernames exist.

## 6. Authorization (users only access their own employees)

Each employee document has a user field: an ObjectId that references the users collection (ref: "User"). It answers "which user owns this employee?".

- On create, user is set from req.user._id, which comes from the verified JWT. The field is not accepted from the request body, and the validators discard any unexpected fields (such as user or isAdmin).

- On list, the query is Employee.find({ user: req.user._id }), so only the caller's employees come back.

- On get / update / delete, the query is Employee.findOne({ _id: eid, user: req.user._id }). The owner is part of the database query itself, so changing eid in the URL or query string can never load another user's document.

- If that query finds nothing, a second lookup only chooses the error: the employee exists but belongs to someone else → 403; it does not exist → 404.

- A compound unique index on { user, email } stops one owner from adding two employees with the same email, while different owners may use the same email.

## 7. Security

#### Password hashing
Passwords are hashed with bcrypt (bcryptjs, cost factor 12, random salt per password) before being saved. Plain-text passwords are never stored or logged. The password field has select: false (queries do not return it) and the User model's toJSON removes it from any JSON output.

#### JWT
Tokens are signed with HS256 using JWT_SECRET and verified with the algorithm pinned to HS256. The payload carries only the user id. The user's identity always comes from the verified token, never from the request body or URL.

#### Helmet
Helmet is applied to every response and sets security headers such as X-Content-Type-Options: nosniff (stops MIME sniffing), X-Frame-Options (blocks clickjacking), Strict-Transport-Security (forces HTTPS) and Content-Security-Policy (limits where content may load from). It also removes the X-Powered-By: Express header so the framework is not advertised.

#### Rate limiting
What it is: rate limiting caps how many requests one client (identified by IP address) may send in a time window. It slows brute-force password guessing and account-creation spam.

#### When the limit is exceeded
the server answers 429 Too Many Requests with the standard JSON error body ("message": "Too many requests. Please try again later.") and sends RateLimit-* headers showing the quota. Counters are kept in memory, so restarting the server resets them. The limits are configurable through .env.

#### Input validation
express-validator rule chains run before each controller. They check required fields, types, string lengths, email format, positive numeric salary, ISO 8601 dates and MongoDB ObjectIds (both in the URL and in ?eid=). Values are sanitized (trimmed, emails lowercased, salary converted to a number, date converted to a Date). The validate middleware returns 400 with a list of field errors, or passes only the whitelisted, validated fields to the controller. Using isString() also blocks NoSQL-injection payloads such as { "$gt": "" }. Mongoose schema rules provide a second layer. JSON bodies are limited to 10 KB and malformed JSON returns 400.

#### Environment variables
Secrets (MONGODB_URI, JWT_SECRET) are read from environment variables, never hard-coded. .env is listed in .gitignore, and .env.example contains only placeholders. The server exits at startup if required settings are missing.

#### Error handling
Controllers pass errors to next(err). A single error-handling middleware converts everything (validation errors, duplicate keys, bad ObjectIds, unknown routes, unexpected errors) into the JSON format shown above. For 500 errors the client only sees a generic message; the stack trace goes to the log file.

## 8. Logging

#### Where
logs/app.log (every event) and logs/error.log (errors only). Events are also printed to the console. Each line is one JSON object. The generated *.log files are excluded by .gitignore; logs/sample-app.log.example shows real example lines.

#### What is logged
- timestamp
- level
- event name
- HTTP method
- path
- response status
- duration
- client IP and user id (when logged in).

#### What is deliberately excluded
- passwords
- password hashes
- JWTs
- JWT_SECRET
- database credentials
- request bodies and request headers. (Validation failures log only the names of the failing fields, never their values)

## 9. Health check

GET http://localhost:3000/health (no authentication, not rate limited):

```json
{
  "status": "ok",
  "service": "comp3123-assignment1-api",
  "uptimeSeconds": 42,
  "timestamp": "2026-10-18T12:00:00.000Z",
  "database": "connected"
}
```

## Sample credentials for marking
 
| Username | Email | Password |
| --- | --- | --- |
| `alice_01` | `alice@example.com` | `Passw0rdA1` |
| `bob_02` | `bob@example.com` | `Passw0rdB2` |