<<<<<<< HEAD
# GameFEED-project
=======
# GameSphere | Ultimate Gaming Community Platform

GameSphere is a modern, high-fidelity 3-tier microservices application designed for gamers. Users can register/login, explore and search games, view average ratings, write comprehensive reviews (including detailed pros and cons), and join community discussions by commenting on reviews.

---

## Architecture Diagram

The application consists of a single Frontend Tier, an API Gateway, 4 Java Spring Boot microservices, and a PostgreSQL database.

```text
                  +-------------------------+
                  |  React Frontend (3000)  |
                  +------------+------------+
                               |
                               | REST Requests
                               v
                  +------------+------------+
                  |   API Gateway (8080)    |
                  +------------+------------+
                               |
            +------------------+------------------+
            |                  |                  |
            v                  v                  v
    +-------+-------+  +-------+-------+  +-------+-------+
    | User Service  |  | Game Service  |  |Review Service |
    |    (8081)     |  |    (8082)     |  |    (8083)     |
    +-------+-------+  +-------+-------+  +-------+-------+
            |                  |                  |
            |                  |                  |
            +------------------+------------------+
                               | (Also routes to Comment Service: 8084)
                               v
                       +-------+-------+
                       | PostgreSQL DB |
                       |  (Port 5432)  |
                       +---------------+
```

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios.
- **Backend**: Java 17, Spring Boot 3.3.1, Spring Data JPA, Spring Security, JWT (Json Web Tokens), Lombok.
- **Gateway**: Spring Cloud Gateway.
- **Database**: PostgreSQL 16.
- **DevOps**: Docker & Docker Compose.

---

## Microservices Breakdown

1. **API Gateway (`api-gateway`)** - Port `8080`
   - Entry point for all incoming HTTP requests.
   - Manages routing to specific microservices.
   - Configures Global CORS settings.
2. **User Service (`user-service`)** - Port `8081`
   - Manages user registration, login, and profile editing.
   - Handles password hashing via BCrypt and issues JWT.
   - Database: `user_db`.
3. **Game Service (`game-service`)** - Port `8082`
   - Handles game registration, listing, search, and genre filtering.
   - Automatically seeds popular titles on first boot (Elden Ring, Witcher 3, Cyberpunk 2077, etc.).
   - Database: `game_db`.
4. **Review Service (`review-service`)** - Port `8083`
   - Allows users to publish detailed reviews, select ratings (1-5), and list pros/cons.
   - Manages upvotes and downvotes.
   - Database: `review_db`.
5. **Comment Service (`comment-service`)** - Port `8084`
   - Supports nested comments under user reviews.
   - Database: `comment_db`.

---

## Getting Started

### Prerequisites
- Docker & Docker Compose installed.
- (Optional for native running) Java 17, Maven, Node.js 20+.

### Running with Docker Compose
Simply run the following command in the root folder containing `docker-compose.yml`:

```bash
docker compose up --build
```

This command will:
1. Boot up the PostgreSQL container and run `init-db/init.sql` to initialize `user_db`, `game_db`, `review_db`, and `comment_db`.
2. Compile and package the Java Spring Boot microservices inside multi-stage Docker builds.
3. Package and build the React App via Node-alpine and host it inside an Nginx instance.
4. Expose:
   - Frontend at `http://localhost:3000`
   - API Gateway at `http://localhost:8080`
   - Individual microservice endpoints on ports `8081` - `8084`
   - PostgreSQL DB on port `5432`

---

## Core API Endpoints

### User Service
- `POST /api/users/register` - Create user account
- `POST /api/users/login` - Authenticate user & return JWT token
- `GET /api/users/profile/{id}` - Fetch profile details
- `PUT /api/users/profile/{id}` - Update profile details (Requires Bearer JWT)

### Game Service
- `GET /api/games` - Fetch all games
- `GET /api/games/{id}` - Fetch game by ID
- `GET /api/games/search?keyword=...` - Search games
- `GET /api/games/genre/{genre}` - Filter games by genre

### Review Service
- `POST /api/reviews` - Publish a review
- `GET /api/reviews/game/{gameId}` - Fetch reviews of a game
- `GET /api/reviews/user/{userId}` - Fetch reviews posted by a user
- `POST /api/reviews/{id}/upvote` - Upvote a review
- `POST /api/reviews/{id}/downvote` - Downvote a review

### Comment Service
- `POST /api/comments` - Post comment on a review
- `GET /api/comments/review/{reviewId}` - Fetch review comments
- `DELETE /api/comments/{id}` - Delete comment (Requires matching user)

---

## Future Improvements
- **Service Discovery**: Implement Eureka naming server to allow dynamic microservice scaling.
- **Centralized Config**: Implement Spring Cloud Config for managing runtime values.
- **Message Broker**: Integrate RabbitMQ or Kafka for async event updates (e.g. updating game average rating upon review submission).
>>>>>>> 8711bac (initial commit 1)
