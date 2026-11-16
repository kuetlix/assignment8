# Assignment 8 – Back-End (Node.js + Express 5)

**Student:** Kübra ETLİ · **No:** 230408003 · **E-mail:** 230408003@st.biruni.edu.tr  
Web Programming – Fall 2026

A small information server for a made-up Computer Engineering programme. It serves a web page,
offers text / JSON / redirect / error routes, logs every request and counts the requests it has
served. All data is hard-coded in `server.js`.

## 1. Install and run

```bash
git clone https://github.com/kuetlix/assignment8.git
cd assignment8
npm install      # installs Express 5 from package-lock.json
npm start        # node server.js
npm run dev      # node --watch server.js (auto restart)
```

Open <http://localhost:3000>. Another port: `PORT=4000 npm start`.
The server also works when started from another folder (`node assignment8/server.js`).

## 2. File organization

```
/assignment8
 ├─ public/
 │   ├─ index.html     # programme page, one button per API route
 │   ├─ styles.css     # external styles
 │   └─ app.js         # fetch() calls, shows status code and body
 ├─ server.js          # data, middleware, routes, 404 fallback
 ├─ package.json       # "type": "module", start/dev scripts, express
 ├─ package-lock.json
 ├─ .gitignore         # node_modules/, .env, .DS_Store
 └─ README.md
```

Order in `server.js`: setup → data → logger → counter → `express.static` → routes → 404 fallback → `app.listen`.

| Route | Status | Response |
| --- | --- | --- |
| `GET /` | 200 | `public/index.html` |
| `GET /hello` | 200 | text: `Hello from Kübra ETLİ's server` |
| `GET /robots.txt` | 200 | `text/plain` robots file |
| `GET /old-page` | 301 | redirect to `/hello` |
| `GET /api/courses` | 200 | 4 courses (`id`, `title`, `credits`) |
| `GET /api/status` | 200 | `{ status, nodeVersion, uptimeSeconds }` |
| `GET /api/headers` | 200 | `{ userAgent, accept }` |
| `POST /api/subscribe` | 201 | `{ "subscribed": true }` |
| `GET /api/admin` | 403 | `{ "error": "Forbidden" }` |
| `GET /api/stats` | 200 | `{ "requestsServed": n }` |
| other `/api/...` | 404 | `{ "error": "Not found" }` |
| other paths | 404 | text: `Page not found: <path>` |

I chose `301 Moved Permanently` for `/old-page` on purpose: the old page has moved for good.
(`302` would be the choice for a temporary move; browsers cache `301`.)

## 3. Middleware

- **Logger** prints `[timestamp] METHOD URL` for each request, then calls `next()`.
- **Counter** adds 1 to `requestsServed` for each request, then calls `next()`.

**What is counted:** every request that reaches the server – static files (`/`, `styles.css`,
`app.js`, `favicon.ico`), both requests of a redirect, 404s and the `/api/stats` call itself.
All of these were really served by the server, and this way the counter matches the number of
log lines. The counter is in memory, so it resets when the server restarts.

**Why this order:** Express runs handlers top to bottom. The logger and counter come before
`express.static` and the routes; otherwise requests answered earlier would never reach them.
The 404 fallback is last so it never hides a real route.

## 4. Testing evidence (`curl --include`)

**Successful JSON – `GET /api/courses`**
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 197
ETag: W/"c5-4VZMS9yaZqWsB2zRfjMczDdF0IY"
Date: Mon, 16 Nov 2026 17:45:32 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Introduction to Programming","credits":6},{"id":2,"title":"Web Programming","credits":5},{"id":3,"title":"Databases","credits":5},{"id":4,"title":"Computer Networks","credits":4}]
```

**201 – `curl --include -X POST /api/subscribe`**
```
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Mon, 16 Nov 2026 17:47:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

**403 – `GET /api/admin`**
```
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Mon, 16 Nov 2026 17:47:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

**Redirect – `GET /old-page`**
```
HTTP/1.1 301 Moved Permanently
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 40
Date: Mon, 16 Nov 2026 17:04:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Moved Permanently. Redirecting to /hello
```

**404 on an API path – `GET /api/nope`**
```
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Mon, 16 Nov 2026 18:21:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

**404 on a non-API path – `GET /nope`**
```
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 21
ETag: W/"15-o+niRM6mpkOxJ7mcVvkkpvwkLEI"
Date: Mon, 16 Nov 2026 18:21:59 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Page not found: /nope
```

**Plain text – `GET /robots.txt`**
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 43
ETag: W/"2b-gp1rHd0GUlf5KkoM8Ki0GsgDKOo"
Date: Mon, 16 Nov 2026 17:04:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

User-agent: *
Disallow: /api/admin
Allow: /
```

## 5. Reasoning questions

**1. Route order.** I moved the 404 fallback to the top of `server.js`. Every request, even
`/hello` and `/api/courses`, returned 404 and nothing was logged. `app.use` without a path
matches everything, and since it sends a response without `next()`, the handlers below never run.

**2. Middleware.** I removed `next()` from the logger. The server still printed the log line,
but the browser kept loading forever and `curl --max-time 5` ended with a timeout. The request
was stuck in the logger because it neither responded nor passed control on.

**3. Status codes.** `201 Created` says the request succeeded *and* created something new (a
subscription); `200` only means general success. A missing page must be `404` because browsers,
`fetch` (`response.ok`) and search engines read the status code, not the text – a `200` would
tell them everything is fine.

**4. Configuration.** Hosting platforms give the app its port through the `PORT` environment
variable, and port 3000 may already be busy on another computer. Reading `process.env.PORT` lets
the same code run anywhere; `3000` is only the local fallback.

**5. Dependencies.** `node_modules` is large and can always be re-created from `package.json`
and `package-lock.json`, so it is in `.gitignore`. After cloning, a teammate runs `npm install`
in the project folder, then `npm start` or `npm run dev`.

**6. Same origin.** Opened from disk, the page's address is `file:///...`, so `/api/courses`
points to the disk, not the server, and every `fetch` fails ("Request failed"). Even with a full
URL the browser would block the response because the origins differ. This is the
**Same-Origin Policy** (servers can relax it with CORS).

## 6. Self-study notes

- **Node version & uptime:** `process.version` and `process.uptime()` from the Node `process`
  docs; I send `Math.floor(process.uptime())` seconds.
- **Content type:** `res.type('text/plain')` (Express docs) before `res.send`, because
  `res.send` with a string defaults to `text/html`. `res.json` sets JSON automatically.
- **Pretty JSON:** `JSON.stringify(data, null, 2)` shown in a `<pre>` with `textContent`.
- **Headers:** `req.get('User-Agent')`, with `?? null` if missing.
- **Run from any folder:** ES modules have no `__dirname`, so I build it with
  `fileURLToPath(import.meta.url)` and use `express.static(path.join(__dirname, 'public'))`.
- **Express 5 fallback:** `app.get('*')` is not allowed, so I use `app.use(handler)` at the end.
- **Failing responses:** `fetch` only rejects on network errors, so I use `response.ok` for
  403/404 and `try...catch` for network errors.

## 7. Challenges

- **Middleware after a route:** I first placed the middlewares below `/hello`, so `/hello` was not
  logged or counted. Moving them above all routes fixed it.
- **"Cannot GET /":** before the 404 fallback and `express.static` existed, `/` showed Express's
  default 404 page.
- **curl "Couldn't connect":** the server had stopped; I learned to check the `npm run dev` terminal first.
- **Git:** my local folder was not linked to GitHub at first, `git push` needed
  `--set-upstream` once, and running git from the Desktop gave "not a git repository".
- **package.json:** `git diff` showed Express changed to `^5.1.0`; I restored it with
  `git restore` and now check `git diff` before each commit.
