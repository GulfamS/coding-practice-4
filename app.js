const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//Get Players API
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
     SELECT * 
     FROM cricket_team;`
  const playersList = await db.all(getPlayersQuery)
  const ans = playersList => {
    return {
      playerId: playersList.player_id,
      playerName: playersList.player_name,
      jerseyNumber: playersList.jersey_number,
      role: playersList.role,
    }
  }
  response.send(playersList.map(eachPlayer => ans(eachPlayer)))
})

//GET player id API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
       SELECT * 
       FROM cricket_team
       WHERE player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  const result = player => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      roles: player.role,
    }
  }
  response.send(result(player))
})

//Post player API
app.post('/players/', async (request, response) => {
  const {playerName, jerseynumber, role} = request.body

  const addPlayerQuery = `
       INSERT INTO 
       cricket_team (player_name, jersey_number, role)
       VALUES (
         '${'playerName'}',
         '${'jerseyNumber'}',
         '${'role'}'
       );
    `
  const dbResponse = await db.run(addPlayerQuery)
  console.log(dbResponse)
  response.send('Player Added to Team')
})

//PUT player API
app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params

  const updatePlayerQuery = `UPDATE 
      cricket_team 
    SET player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//DELETE player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
        DELETE FROM 
        cricket_team 
        WHERE player_id = ${playerId};
    `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
