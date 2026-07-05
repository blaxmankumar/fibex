# API Endpoints Reference | GameSphere

All API calls flow through the API Gateway running at `http://localhost:8080`.

---

## 1. User Service (`/api/users/**` -> port 8081)

### Register User
- **URL**: `/api/users/register`
- **Method**: `POST`
- **Payload**:
```json
{
  "username": "Gamer123",
  "email": "gamer123@example.com",
  "password": "securepassword",
  "bio": "RPG speedrunner.",
  "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=Gamer123"
}
```
- **Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJHYW1lcjEyMyIs...",
  "user": {
    "id": 1,
    "username": "Gamer123",
    "email": "gamer123@example.com",
    "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=Gamer123",
    "bio": "RPG speedrunner."
  }
}
```

### Login User
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Payload**:
```json
{
  "username": "Gamer123",
  "password": "securepassword"
}
```
- **Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJHYW1lcjEyMyIs...",
  "user": {
    "id": 1,
    "username": "Gamer123",
    "email": "gamer123@example.com",
    "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=Gamer123",
    "bio": "RPG speedrunner."
  }
}
```

### Get Profile
- **URL**: `/api/users/profile/{id}`
- **Method**: `GET`
- **Response** (200 OK):
```json
{
  "id": 1,
  "username": "Gamer123",
  "email": "gamer123@example.com",
  "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=Gamer123",
  "bio": "RPG speedrunner."
}
```

### Update Profile
- **URL**: `/api/users/profile/{id}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Payload**:
```json
{
  "bio": "FPS and RPG enthusiast.",
  "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=ProGamer",
  "password": "newsecurepassword"
}
```
- **Response** (200 OK):
```json
{
  "id": 1,
  "username": "Gamer123",
  "email": "gamer123@example.com",
  "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=ProGamer",
  "bio": "FPS and RPG enthusiast."
}
```

---

## 2. Game Service (`/api/games/**` -> port 8082)

### List All Games
- **URL**: `/api/games`
- **Method**: `GET`
- **Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Elden Ring",
    "description": "Rise, Tarnished...",
    "genre": "RPG",
    "platform": "PC, PlayStation, Xbox",
    "releaseYear": 2022,
    "rating": 4.9,
    "imageUrl": "https://images.unsplash.com/..."
  }
]
```

### Get Game Details
- **URL**: `/api/games/{id}`
- **Method**: `GET`
- **Response** (200 OK):
```json
{
  "id": 1,
  "name": "Elden Ring",
  "description": "Rise, Tarnished...",
  "genre": "RPG",
  "platform": "PC, PlayStation, Xbox",
  "releaseYear": 2022,
  "rating": 4.9,
  "imageUrl": "https://images.unsplash.com/..."
}
```

### Search Games
- **URL**: `/api/games/search?keyword=elden`
- **Method**: `GET`
- **Response** (200 OK): List of matching games.

### Get Games by Genre
- **URL**: `/api/games/genre/RPG`
- **Method**: `GET`
- **Response** (200 OK): List of games under the RPG genre.

---

## 3. Review Service (`/api/reviews/**` -> port 8083)

### Create Review
- **URL**: `/api/reviews`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Payload**:
```json
{
  "gameId": 1,
  "userId": 1,
  "username": "Gamer123",
  "rating": 5,
  "title": "Incredible gameplay!",
  "reviewText": "Elden Ring provides an unmatched sense of discovery...",
  "pros": "Open-world mechanics, bosses, lore",
  "cons": "Steep learning curve, optimization hiccups"
}
```
- **Response** (201 Created): Complete review object.

### Get reviews by Game ID
- **URL**: `/api/reviews/game/{gameId}`
- **Method**: `GET`
- **Response** (200 OK): List of reviews ordered by date.

### Get reviews by User ID
- **URL**: `/api/reviews/user/{userId}`
- **Method**: `GET`
- **Response** (200 OK): List of reviews written by the specified user.

### Upvote/Downvote Review
- **URL**: `/api/reviews/{id}/upvote` or `/api/reviews/{id}/downvote`
- **Method**: `POST`
- **Response** (200 OK): Updated review object.

---

## 4. Comment Service (`/api/comments/**` -> port 8084)

### Create Comment
- **URL**: `/api/comments`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Payload**:
```json
{
  "reviewId": 1,
  "userId": 1,
  "username": "Gamer123",
  "commentText": "Totally agree about the open-world mechanics!"
}
```
- **Response** (201 Created): Comment object.

### Get Comments for Review
- **URL**: `/api/comments/review/{reviewId}`
- **Method**: `GET`
- **Response** (200 OK): List of comments.

### Delete Comment
- **URL**: `/api/comments/{id}`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response** (200 OK):
```json
{
  "message": "Comment deleted successfully"
}
```
