# Job Importer

This project is a scalable job import system built as part of the assessment.
It fetches job data from external job feed APIs, processes them using a Redis-based queue, stores jobs in MongoDB, and shows import history in a Admin UI.

The system is designed to handle large datasets (1 million+ jobs) using background workers, batching, and bulk database operations.

---

## Tech Stack

- Frontend: Next.js
- Backend: Node.js (Express)
- Database: MongoDB (Mongoose)
- Queue: BullMQ
- Queue Store: Redis (Redis Cloud)
- Worker: Background worker using BullMQ
- Deployment: Vercel (frontend), Render (backend), MongoDB Atlas, Redis Cloud

---

## Project Structure

```bash
client/ # Next.js frontend
server/ # Express API, queue, worker, cron
README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repo-url>
cd <repo-name>
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a .env file inside the server folder:

```bash
PORT=3001
MONGO_URL=<your_mongodb_atlas_url>
REDIS_URL=<your_redis_cloud_url>
WORKER_CONCURRENCY=5
BATCH_SIZE=1000
```

Notes:

- Redis eviction policy must be set to noeviction
- MongoDB Atlas is recommended for cloud setup
- Redis Cloud free tier is sufficient

### 3. Start Backend API

```bash
node index.js
```

This starts the Express API server on port 3001.

### 4. Start Worker Process

Open a new terminal and run:

```bash
node worker.js
```

The worker listens to the Redis queue and processes job imports in the background.

### 5. Frontend Setup

```bash
cd client
npm install
npm run dev
```

#### a) The frontend will be available at:

```bash
http://localhost:3000
```

## How the System Works

- User clicks Trigger Import in the Admin UI
- Frontend sends a request to /api/import
- Backend adds a job to the Redis queue
- Worker picks the job and:
- Fetches XML job feed
- Converts XML to JSON
- Inserts or updates jobs in MongoDB using bulk operations
- Import summary is saved in the import_logs collection
- Import history is shown in the Admin UI

### Job Feed Sources

The system supports multiple job feeds, including:

- https://jobicy.com/?feed=job_feed
- https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time
- https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france
- https://jobicy.com/?feed=job_feed&job_categories=design-multimedia
- https://jobicy.com/?feed=job_feed&job_categories=data-science
- https://jobicy.com/?feed=job_feed&job_categories=copywriting
- https://jobicy.com/?feed=job_feed&job_categories=business
- https://jobicy.com/?feed=job_feed&job_categories=management
- https://www.higheredjobs.com/rss/articleFeed.cfm

Feeds are queued and processed asynchronously to avoid blocking the API.

### Cron Job

A cron job runs every 1 hour and automatically enqueues all configured job feeds for import.
This ensures job data stays up to date without manual intervention.

### Import History

- Each import run stores the following information in MongoDB:
- Feed URL
- Total jobs fetched
- Total jobs imported
- New jobs created
- Jobs updated
- Failed jobs

### Queue and Retry Handling

- Redis + BullMQ is used for background processing
- Worker concurrency is configurable using environment variables
- Jobs are retried automatically with exponential backoff
- Failures are logged and do not block other jobs
- This design ensures reliability under high load.

### Scalability Design

The system is designed to handle very large datasets:

- Jobs are processed asynchronously using a queue
- Data is processed in batches
- MongoDB bulkWrite is used to reduce database load
- Duplicate jobs are avoided using upsert logic
- Worker concurrency and batch size are configurable

This allows the system to scale beyond current feed size and handle millions of records.

### Assumptions

- External job feeds are mostly reliable but may contain invalid records
- Job uniqueness is determined by an external job ID
- Redis memory policy is set to `noeviction`
- This is an internal admin tool, not a public-facing UI
