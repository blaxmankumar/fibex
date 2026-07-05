# Architecture & Data Flow | GameSphere

This document provides a deep dive into the system design, communication patterns, and database layouts of the GameSphere community platform.

---

## 1. System Topology

GameSphere relies on a decoupled, microservices-based architecture where services communicate over REST endpoints. External access goes through the API Gateway, securing internal microservices from direct public access while resolving CORS issues.

```
+-----------------------------------------------------------------+
|                       VPC / Network Boundary                    |
|                                                                 |
|  +------------------+           +-----------------------------+ |
|  |     Frontend     |           |         API Gateway         | |
|  |   (Nginx:3000)   | --------> |    (Spring Gateway:8080)    | |
|  +------------------+           +--------------+--------------+ |
|                                                |                |
|         +----------------------+---------------+--------------+ |
|         |                      |               |              | |
|         v                      v               v              v |
|  +--------------+       +------------+   +-----------+  +-----------+
|  | User Service |       |Game Service|   |Review Serv|  |Comment Ser|
|  |    (8081)    |       |   (8082)   |   |  (8083)   |  |  (8084)   |
|  +------+-------+       +------+-----+   +-----+-----+  +-----+-----+
|         |                      |               |              | |
|         |                      |               |              | |
|         v                      v               v              v |
|  +------------------------------------------------------------+ |
|  |                       PostgreSQL (5432)                    | |
|  |   [user_db]               [game_db]      [review_db]  [comment_db]
|  +------------------------------------------------------------+ |
+-----------------------------------------------------------------+
```

---

## 2. Communications & Protocols

- **External-to-Internal**: All client requests target the API Gateway (`http://localhost:8080`). The gateway uses path-matching rules (defined in `application.yml`) to proxy requests downstream.
- **Client-to-Service Context**: State is transferred stateless via JSON payloads.
- **Authorization**:
  - The `user-service` is responsible for generating JWT tokens upon valid login.
  - The JWT token contains the `username` and `userId`.
  - The frontend captures this JWT token in `localStorage` and appends it as a Bearer token in the `Authorization` header for all requests.
  - Secure operations (e.g. updating a profile) inspect and validate the token signature against the signing key.

---

## 3. Database Isolation

To fulfill the microservice database segregation pattern:
- A single PostgreSQL container is deployed, minimizing RAM footprint on local developer machines.
- On launch, the database runs `/docker-entrypoint-initdb.d/init.sql` to isolate data into 4 distinct databases:
  - `user_db`: Stores usernames, hashed credentials, avatar URLs, and bios.
  - `game_db`: Stores names, descriptions, ratings, genres, and platforms.
  - `review_db`: Stores ratings, titles, review experience bodies, pros, cons, and upvotes/downvotes.
  - `comment_db`: Stores comment texts and timestamps under review identifiers.
- Services maintain separate connection configurations targeting their own respective database, preventing cross-database queries.
