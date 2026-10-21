# PTM Feedback Automation System - Version 1.1

A mobile- and desktop-accessible web application for automating Parent-Teacher Meeting (PTM) feedback collection and faculty review.

## Features (Version 1.1)

- **Passwordless Parent Portal**:
  - Accessible directly on mobile phones or laptops/desktops without username or password.
  - **Student Name** (Required)
  - **Class & Section Dropdown** (`1/A`, `1/B`, `1/C`, `1/D` ... `10/A`, `10/B`, `10/C`, `10/D`, including `4/A`)
  - **Parent Name** & **Mobile Number** (Optional)
  - **PTM Feedback Comment** (Required)
  - **Principal / Admin Attention Checkbox**: Dynamically reveals a dedicated textbox when checked.
- **Faculty Portal & Role-Based Credentials**:
  - **Class Teacher**: `classteacher` / `classteacher1`
  - **Principal**: `principal` / `welcome1`
  - **Admin**: `admin` / `welcome1`
  - Filter feedback by Class/Section (`1/A` to `10/D`) and by **Needs Principal / Admin Attention**.

---

## Prerequisites

- **Java 17+** and **Maven 3.8+**
- **Node.js 18+** and **npm**
- **PostgreSQL 14+** (or Docker Desktop to run via `docker-compose.yml`)

---

## 1. Database Setup (PostgreSQL)

### Option A: Using Docker Compose
```powershell
docker compose up -d
```

### Option B: Local PostgreSQL Instance
Create a database named `ptm_feedback` (default user `postgres`, password `postgres`, port `5432`) or override with environment variables `DB_URL`, `DB_USER`, `DB_PASSWORD`.
Spring Boot JPA (`ddl-auto: update`) automatically creates the `ptm_feedback` table and indexes, or you can run `backend/src/main/resources/schema.sql`.

---

## 2. Run the Java Spring Boot Backend

```powershell
cd backend
mvn spring-boot:run
```
The backend REST API starts at `http://localhost:8080`.

---

## 3. Run the React (Vite) Frontend

```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in any mobile or desktop browser.
