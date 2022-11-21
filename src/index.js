require('dotenv').config({})
const express = require("express")
const bodyParser = require("body-parser")
const {
    response
} = require('express')
const {
    request
} = require('http')
const {
    platform
} = require('os')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(express.static('../docs'))



app.listen(port, (error) => {
    if (!error) {
        console.log(`api running on http://localhost:${port}`);
    } else {
        console.log(error);
    }
})

/**
 * object template
 * 
 * game{
 *      gameId(int),
 *      name(str),
 *      image(str)
 * }
 * 
 * gamePreferences{
 *      genres(arr(str)),
 *      platforms(arr(str)),
 *      tag(arr(str))
 * }
 * 
 * newUser{
 *      firstName(str),
 *      lastName(str),
 *      username(str),
 *      email(str),
 *      password(str)
 * }
 * 
 * loginCredentials{
 *      username(str),
 *      password(str)
 * }
 * 
 * updateUserPreferences{
 *      userId(int),
 *      gameId(int)
 * }
 * 
 * updateUserCredentials{
 *      userId(int),
 *      password(str),
 *      newPassword(str),
 *      newUsername(str),
 *      newEmail(str)
 * }
 * 
 * 
 */

/**
 * GET endpoint, return documentation about endpoints of the api
 * 
 * @returns html page with list of endpoints
 */
app.get("/", (request, response) => {
    response.status(300).redirect('index.html')
})


/**
 * GET endpoint, return a random game
 * 
 * @returns object with result object game
 */
app.get("/getRandomGame", async (request, response) => {

    let randomPage = Math.round(Math.random() * 80) //21250
    let platform = '4,3,2,6'
    let metacritic = "70,100"
    try {
        fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&page=${randomPage}&page_size=39&platforms=${platform}&metacritic=${metacritic}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {

                let randomGame = data.results[Math.round(Math.random() * 38)]
                console.log(randomGame);
                response.status(200).send({
                    gameId: randomGame.id,
                    name: randomGame.name,
                    image: randomGame.background_image
                })
            })
    } catch (error) {
        console.log(error);
    } finally {

    }

})


/**
 * GET endpoint, return a random game based on a couple of questions
 * 
 * @params object gamePreferences: parameters to filter by
 * @returns object with result object game
 */
app.get("/getGameByPreferences", (request, response) => {

})

/**
 * GET endpoint, return a random game from the list of favorited games
 * 
 * @params object userId(int): reference id to find user inside database
 * @returns object with result object game
 */
app.get("/getGameListFromFavorites", (request, response) => {

})

/**
 * POST endpoint, create a new user account and add it to the database
 * 
 * @params object newUser: object to compare against existing users and to create new user
 * @return object with result userId(int)
 */
app.post("/createAccount", (request, response) => {

})

/**
 * POST endpoint, check user login credentials and let them login
 * 
 * @params object loginCredentials: object to find and compare user credentials
 * @returns object with result userId(int)
 */
app.post("/login", (request, response) => {

})

/**
 * POST endpoint, add a liked game to the user liked list in the database
 * 
 * @params object updateUserPreferences: object to find user and add gameId to their liked games list
 */
app.post("/addLikedGame", (response, request) => {

})


/**
 * POST endpoint, add a disliked game to the user disliked list in the database
 * 
 * @params object updateUserPreferences: object to find user and add gameId to their disliked games list
 */
app.post("/addDislikedGame", (response, request) => {

})

/**
 * PUT endpoint, update user credentials in database
 * 
 * @params object updateUserCredentials: object to find and compare user details, aswell update them
 * @returns object userId(int)
 */
app.put("/updateAccount", (request, response) => {

})

/**
 * DELETE endpoint, delete user account from database
 * 
 * @params object deleteUser: object to find and compare user details
 * @returns object userId(int)
 */
app.delete("/deleteAccount", (request, response) => {

})

/**
 * DELETE endpoint, remove a liked game from the user liked list in the database
 * 
 * @params object updateUserPreferences: object to find user and remove gameId from their liked games list
 */
app.delete("/deleteLikedGame", (response, request) => {

})

/**
 * DELETE endpoint, remove a disliked game from the user disliked list in the database
 * 
 * @params object updateUserPreferences: object to find user and remove gameId from their disliked games list
 */
app.delete("/deleteDislikedGame", (response, request) => {

})