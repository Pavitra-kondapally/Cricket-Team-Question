const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT player_id AS playerId,
            player_name AS playerName,
            jersey_number AS jerseyNumber,
            role
        FROM cricket_team
        ORDER BY player_id;
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO 
            cricket_team(player_name,jersey_number,role)
        VALUES 
            (
                '${playerName}',
                ${jerseyNumber},
                '${role}'
            );
    `;
  const addPlayerDetails = await db.run(addPlayerQuery);
  const playerId = addPlayerDetails.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT player_id AS playerId,
            player_name AS playerName,
            jersey_number AS jerseyNumber,
            role
        FROM cricket_team
        WHERE player_id = ${playerId}; 
    `;
  const playerDetails = await db.get(getPlayerQuery);
  response.send(playerDetails);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE cricket_team
        SET
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM
            cricket_team
        WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
