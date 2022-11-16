require('dotenv').config({})
const express = require("express")
const bodyParser = require("body-parser")
const {
    response
} = require('express')
const {
    request
} = require('http')

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

//returns documentation about endpoints of the api
app.get("/", (request, response) => {
    response.status(300).redirect('index.html')
})


//select a random game
app.get("/getRandomGame", (request, response) => {
    console.log(process.env);
    try {
        fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&page_size=50`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
        
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                response.send(data)
            })
    } catch (error) {
        console.log(error);
    }
})

//select a random game based on a couple of questions
app.get("/getGameByPreferences", (request, response) => {

})

//select a ranom game from the list of favorited games
app.get("/getGameListFromFavorites", (request, response) => {

})

//create a new user account and add it to the database
app.post("/createAccount", (request, response) => {

})

//check user login credentials and let them login
app.post("/login", (request, response) => {

})

//add a liked game to the user liked list in the database
app.post("/addLikedGame", (response, request) => {

})

//add a disliked game to the user disliked list in the database
app.post("/addDislikedGame", (response, request) => {

})

//update user credentials in database
app.put("/updateAccount", (request, response) => {

})

//delete user account from database
app.delete("/deleteAccount", (request, response) => {

})

//delete a previously liked game from the user liked list in the database
app.delete("/deleteLikedGame", (response, request) => {

})

//delete a previously disliked game from the user liked list in the database
app.delete("/deleteDislikedGame", (response, request) => {

})