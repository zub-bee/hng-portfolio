# Goal

The goal of this project was to design and implement a background HTTP retry service. Clients submit a request, and a worker retries it automatically on failure using exponential backoff with jitter. Execution halts when the request succeeds, hits a permanent failure status code (4xx), or exhausts the maximum retry limit.

# Failure Model

- **Permanent Failures (4xx)**: A 4xx status code means the request itself is malformed or invalid (e.g., bad URL, missing authorization, bad request body). Since retrying will not resolve the issue, these requests fail permanently on the first attempt and are not retried.
- **Retryable Failures (5xx & Network Errors)**: A 5xx status code indicates a temporary server-side issue (crash, timeout, overloading) or network disruptions. These requests are eligible for retry as the target server is expected to recover.

# Core Design

- **Worker Loop**: A background worker polling every 500ms queries the SQLite database for pending or retrying requests whose scheduled retry time (`nextRetryAt`) has elapsed.
- **Attempt Tracking**: Every request execution is logged in a separate `attempts` database table, capturing attempt numbers, status codes, timestamps, and error logs for detailed audits.
- **Dead-Letter Queue (DLQ)**: If a request fails repeatedly and the attempt count exceeds the configurable limit (`maxRetries`, defaulting to 5), it is marked as `failed` and moved to a dead-letter state to prevent infinite loops.

# Backoff Strategy

- **Formula**: The wait time for the next retry increases exponentially with each attempt, using the formula:
  `delay = backoffMs * (2 ^ attempt) * jitter`
- **Jitter**: To resolve the "thundering herd" problem where multiple clients retry at the exact same millisecond, a random multiplier between 0.8 and 1.2 is applied. This spreads retries out naturally.

# API Surface

- `POST /request`: Submits a request to be executed (supports `url`, `method`, optional `body`, optional `maxRetries`, and optional `backoffMs`).
- `GET /requests/:id`: Retrieves the current request status along with its full attempt logs history.
- `GET /requests?status=`: Queries and filters submitted requests by status (`pending`, `retrying`, `completed`, `failed`).

# Testing and Validation

Correctness was validated using a mock server on port 3001 configured to fail three times consecutively before succeeding. A test script registered requests and polled the retry engine every second, verifying that the worker successfully navigated the retry cycle and ultimately marked the request as completed.

## Screenshots

![alt text](images/image.png)

![alt text](images/image-1.png)

![alt text](images/image-2.png)

# What I Learned

## Technical Highlights & SQLite Params

To handle optional properties (`maxRetries` and `backoffMs`), I replaced positional SQLite queries with named database parameters (`@param`). Using objects made it simple to inject default fallbacks without writing complex if-else logic:

```js
// Positional method — every ? must match the exact order of values
// Handling optional fields meant branching logic just to build the right array
const insert = db.prepare(
  "INSERT INTO requests (url, method, maxRetries, backoffMs) \\
  VALUES (?, ?, ?, ?)",
);
insert.run(url, method, maxRetries ?? 5, backoffMs ?? 1000);

// Named params method — use @name placeholders and pass an object
// Now ?? defaults live right in the object, no branching needed
const insert = db.prepare(
  "INSERT INTO requests (url, method, maxRetries, backoffMs) \\
  VALUES (@url, @method, @maxRetries, @backoffMs)",
);
insert.run({
  url,
  method,
  maxRetries: maxRetries ?? 5,
  backoffMs: backoffMs ?? 1000,
});
```

## Developer growth & architectural value

This was my first time implementing standalone background workers. I learned how to build robust, non-blocking integrations for third-party endpoints. In a production scenario (such as sending OTP SMS via an external provider), routing these calls through a retry engine ensures that service outages or temporary rate limits do not impact core user flows like registration. While enterprise libraries like BullMQ solve this at scale, constructing this lightweight version deepened my understanding of background task execution and distributed failure handling.

- **Resources Consulted**: [validator.js](https://github.com/validatorjs/validator.js)
