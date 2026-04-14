# TAFL-Visualisation-Project

# Regex Language Explorer

An interactive web application to explore and analyze regular expressions using a restricted regex algebra. Users can generate strings, test membership, and check equivalence between expressions.

---

## Live Demo

Link:
`https://tafl-visualisation-project.vercel.app/`

---

## Features

* **Generate Strings**
  Generate all valid strings up to a fixed length from a regex.

* **Sample Strings**
  Generate additional random samples beyond the deterministic set.

* **Membership Testing**
  Check whether a given string belongs to the language of a regex.

* **Equivalence Checking**
  Compare two regex expressions and identify differences in generated strings.

---

## Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js + Express
* **Deployment:**

  * Frontend → Vercel
  * Backend → Render

---

## 📁 Project Structure

```
project-root/
│
├── frontend/        # React app (UI)
├── backend/         # Express server (API)
└── README.md
```

---

## ⚙️ Running Locally

### 1. Clone the repository

```
git clone https://github.com/yashistic/TAFL-Visualisation-Project
cd TAFL-Visualisation-Project
```

---

### 2. Run Backend

```
cd backend
npm install
npm start
```

Backend will run on:

```
http://localhost:3001
```

---

### 3. Run Frontend

Open a new terminal:

```
cd frontend
npm install
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

## 🔗 Connecting Frontend & Backend (Local Setup)

Make sure API calls in the frontend point to:

```
http://localhost:3001/api
```

---

## 📡 API Endpoints

All endpoints use **POST** requests.

* `/api/generate` → Generate strings
* `/api/sample` → Generate additional samples
* `/api/membership` → Check membership
* `/api/equivalence` → Compare regex expressions

---

## ⚠️ Notes

* Backend uses a maximum length constraint to prevent exponential explosion of strings.
* Render free tier may cause initial delay due to cold start.
* All API calls require JSON input.

---

## 👤 Author

Yash Mittal
2024UCD2113

---

## 📄 License

This project is for academic use.
