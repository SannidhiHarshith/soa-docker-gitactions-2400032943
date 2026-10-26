# WeatherStation

WeatherStation is a full-stack weather monitoring station manager based on the structure of the supplied sample project. It uses Spring Boot, PostgreSQL, React, and Vite.

## Station fields

- `id`: generated numeric identifier
- `stationCode`: required, unique station code
- `location`: required station location
- `sensorCount`: number of sensors (zero or more)
- `active`: whether the station is currently active

## Run with Docker Compose

Install Docker Desktop, open a terminal in this project folder, and run:

```powershell
docker compose up --build
```

Open the app at [http://localhost:8080](http://localhost:8080). The Spring Boot API is available at `http://localhost:8081/api/stations`; Swagger UI is at `http://localhost:8081/swagger-ui/index.html`.

The default local PostgreSQL password is `docker`. For anything beyond local development, set `POSTGRES_PASSWORD` in the environment before starting Compose.

## Run without Docker

Start PostgreSQL and create a database called `weatherstationdb`. In `backend/src/main/resources/application.properties`, datasource settings can be overridden with `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`.

Start the API from the `backend` folder:

```powershell
mvn spring-boot:run
```

Then start the UI from the `frontend` folder:

```powershell
npm install
npm run dev
```

The UI runs at [http://localhost:5173](http://localhost:5173). Set `VITE_API_BASE_URL` in a local `.env` file if the API is not at `http://localhost:8081/api/stations`.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/stations` | List all stations |
| `GET` | `/api/stations/{id}` | Get one station |
| `POST` | `/api/stations` | Add a station |
| `PUT` | `/api/stations/{id}` | Update a station |
| `DELETE` | `/api/stations/{id}` | Delete a station |

Example request body:

```json
{
  "stationCode": "WS-001",
  "location": "Vijayawada",
  "sensorCount": 4,
  "active": true
}
```
