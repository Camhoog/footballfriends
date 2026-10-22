# ⚽ FootballFriends

FootballFriends is a REST API for creating and managing **5-a-side, 7-a-side and 11-a-side football teams**. Each team has a name, a manager, a format and a squad of players, and the API checks that the squad size matches the format before anything is saved.

It was built as the capstone project for the **Lloyds Banking Group Modern Engineering** course (General Assembly), using Node.js, Express, AWS DynamoDB, Terraform and Docker.

---

## Features

- Full **CRUD** for teams: create, read all, read one, update and delete
- **Validation with Joi**: every field is required, and `team_format` must be `5`, `7` or `11`
- **Squad size rule**: a team must have exactly as many players as its format (e.g. 7 players for 7-a-side)
- **Unique IDs** generated automatically for each team (UUID)
- **AWS DynamoDB** for storage, provisioned with **Terraform**
- **Dockerised** with a dev mode (hot reload via nodemon) and a prod mode

---

## Tech stack

| Area | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | AWS DynamoDB (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`) |
| Validation | Joi |
| Infrastructure as Code | Terraform |
| Containers | Docker and Docker Compose |
| Dev tooling | nodemon, dotenv |

---

## Project structure

```
footballfriends/
├── controllers/
│   └── teamsController.js      # Handles each request and talks to DynamoDB
├── models/
│   └── team.js                 # Joi schema describing a valid team
├── services/
│   └── database.js             # DynamoDB client setup
├── views/
│   └── router.js               # Maps URLs to controller functions
├── Dockerfile                  # Builds the app image (dev or prod)
├── docker-compose.yaml         # Runs the app with environment variables
├── footballfriends_database.tf # Terraform to create the DynamoDB table
├── index.js                    # App entry point
└── package.json
```

---

## API endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Description | Success response |
|---|---|---|---|
| GET | `/teams` | Get all teams | `200` list of teams |
| POST | `/teams` | Create a new team | `201` the created team |
| GET | `/teams/:id` | Get one team by ID | `200` the team |
| PUT | `/teams/:id` | Update a team by ID (send the whole team) | `200` the updated team |
| DELETE | `/teams/:id` | Delete a team by ID | `204` no content |

### Team fields

| Field | Type | Rules |
|---|---|---|
| `id` | string | Generated automatically, so don't send it |
| `team_name` | string | Required |
| `manager` | string | Required |
| `team_format` | number | Required, must be `5`, `7` or `11` |
| `players` | array of strings | Required, length must equal `team_format` |

### Example: create a 5-a-side team

**POST** `/teams`

```json
{
  "team_name": "Sunday Ballers",
  "manager": "Cameron",
  "team_format": 5,
  "players": ["Sam", "Jordan", "Alex", "Chris", "Jamie"]
}
```

**Response `201`**

```json
{
  "message": "Successfully created team",
  "data": {
    "id": "a1b2c3d4-...",
    "team_name": "Sunday Ballers",
    "manager": "Cameron",
    "team_format": 5,
    "players": ["Sam", "Jordan", "Alex", "Chris", "Jamie"]
  }
}
```

### Example: validation errors (`400`)

Sending a format that isn't allowed:

```json
{ "error": "\"team_format\" must be one of [5, 7, 11]" }
```

Sending the wrong number of players:

```json
{ "error": "A 11-a-side team needs exactly 11 players. You sent 5." }
```

Requesting a team that doesn't exist returns `404`:

```json
{ "message": "No team found" }
```
