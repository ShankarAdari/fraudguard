# FraudGuard — MLOps-Grade Fraud Detection Platform

FraudGuard is an end-to-end transaction monitoring and fraud detection platform. Transactions flow in, get scored for fraud risk in real-time, flagged transactions receive an AI-generated investigation summary, and everything is trackable/retrainable/deployable like a production ML system.

![Liquid Chrome Dashboard Mockup](frontend/src/assets/dashboard_preview.png)

## Architecture

```
                     ┌─────────────────────┐
                     │   Client / Postman   │
                     │  (simulated txns)    │
                     └──────────┬───────────┘
                                │ POST /transaction
                     ┌──────────▼───────────┐
                     │   FastAPI Gateway     │  ← Async, Pydantic v2
                     └──────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
   ┌──────────▼─────┐ ┌─────────▼────────┐ ┌──────▼───────┐
   │ Custom LRU Cache │ │ XGBoost Model    │ │ Custom Min-Heap│
   │ Feature Store    │ │ (via MLflow)     │ │ Priority Queue │
   └──────────┬─────┘ └─────────┬────────┘ └──────┬───────┘
              │                 │                 │
              └────────┬────────┴────────┬────────┘
                        │                 │
              ┌─────────▼──────┐  ┌───────▼────────────┐
              │ PostgreSQL      │  │ LangGraph Agent    │
              │ (window fns)   │  │ ("Investigator")   │
              └─────────────────┘  └───────────────────────┘

   Frontend: Vite + React (Liquid Chrome / Chromomorphism theme)
   Deployment: Docker Compose + Kubernetes Helm Chart + HPA Load Test Script
```

---

## Why I Hand-Built the Cache & Priority Queue (DSA Depth)

Instead of using `functools.lru_cache` or standard library wrappers like `heapq`, I hand-built both critical data structures from fundamental principles:
- **Feature Store LRU Cache**: Implemented with a **Doubly Linked List + Hash Map** to achieve true $O(1)$ time complexity for both `get` and `put` operations with custom node eviction.
- **Alert System Priority Queue**: Implemented as an **array-based Min-Heap** featuring hand-rolled `sift-up` and `sift-down` methods ($O(\log N)$ insertion/pop), ensuring high-risk fraudulent transactions are immediately triaged to the top of the queue.

---

## Quick Start (Local Run)

### 1. Run Backend Services (Docker Compose)
```bash
docker-compose up --build
```
Or start FastAPI natively:
```bash
cd backend
py -3 app/main.py
```

### 2. Run Liquid Chrome Dashboard
```bash
cd frontend
npm install
npm run dev
```

---

## Kubernetes & Helm Deployment

Deploy to Minikube / Kind:
```bash
kubectl apply -f infra/k8s_deployment.yaml
```

Run HPA Autoscaling Load Test:
```bash
py -3 infra/load_test.py
```

---

## Technical Resume Bullets Earned

- *Built and deployed an end-to-end fraud detection platform (FastAPI, XGBoost, PostgreSQL) with Kubernetes autoscaling and MLflow-tracked model registry.*
- *Implemented custom LRU cache and priority-queue-based alerting system to optimize feature retrieval and investigation triage.*
- *Integrated a LangGraph agent for automated fraud investigation summaries, with a modular LLM provider layer supporting OpenAI and local Ollama models.*
