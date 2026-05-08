# AFPSAT Mock Exam System

Greenfield MVP for timed AFPSAT mock exams with a Vite React frontend, PHP REST API, MySQL database, JWT auth, admin question management, CSV import, scoring, review, and progress history.

## Frontend

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8000`.

## Backend

1. Create a MySQL database and import `database/schema.sql`.
   - On InfinityFree, import `database/schema.infinityfree.sql` instead because the database is created for you.
2. Copy `api/config.example.php` to `api/config.php` and update credentials.
3. Run the PHP server from the repo root:

```bash
php -S localhost:8000 api/index.php
```

## Seed Admin

`database/schema.sql` includes one admin account:

- Email: `admin@afpsat.local`
- Password: `password`

Change this password before using the app outside local development.

## CSV Import Format

```csv
category,question,a,b,c,d,correct,difficulty
verbal,FORE is to AFT as BOW is to?,deck,ship,stern,port,C,medium
numerical,2+2=?,3,4,5,6,B,easy
```
