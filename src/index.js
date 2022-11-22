require('dotenv').config({})
const express = require("express")
const bodyParser = require("body-parser")
const {
    response
} = require('express')
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb')

const app = express()
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(express.static('../docs'))

const port = process.env.PORT || 3000
const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.ruiua.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});



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
 * 
 * userDetails{
 *      userId(str)
 *      firstName(str),
 *      lastName(str),
 *      username(str),
 *      email(str)
 * }
 * 
 * loginWithId{
 *      userId(str),
 *      username(str)
 * }
 * 
 * updateUserPreferences{
 *      userId(str),
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
app.post("/createAccount", async (request, response) => {
    let newUser = request.body.newUser

    // checks if all required fields are filled
    if (!newUser.username || !newUser.password || !newUser.email || !newUser.firstname || !newUser.lastname) {
        response.status(400).send("please fill everything in");
        return
    }

    try {
        // make connection to database and perfrom a check if the username and/or the email is already taken
        await client.connect();
        const data = client.db("courseProject").collection('users');
        const checkUsername = await data.findOne({
            username: newUser.username
        });

        const checkEmail = await data.findOne({
            email: newUser.email
        })
        if (checkUsername) {
            response.status(409).send({
                error: "the username is already taken"
            });
            return
        }
        if (checkEmail) {
            response.status(409).send({
                error: "the Email is already taken"
            });
            return
        }
        //if username and email are not taken, the new account will be created and stored on the database
        if (checkUsername == null && checkEmail == null) {
            const newuser = {
                "username": newUser.username,
                "email": newUser.email,
                "firstname": newUser.firstName,
                "lastname": newUser.lastName,
                "password": newUser.password,
            };

            let insertUser = await data.insertOne(newuser);
            const userId = await data.distinct("_id", {
                "username": newuser.username
            })
            //sends back the userId that was created so the user can stay logged in
            response.status(200).send({
                succes: "successfully created new useraccount",
            });
        }
        // if there is any problem, the api will send the error back and also display it inside the console
    } catch (error) {
        console.log(error);
        response.status(406).send(error.message);
        // close the connection to the database
    } finally {
        await client.close();
    }


})

/**
 * POST endpoint, check user login credentials and let them login
 * 
 * @params object loginCredentials: object to find and compare user credentials
 * @returns object with result userDetails
 */
app.post("/login", async (request, response) => {

    let loginCredentials = request.body.loginCredentials
    // check if the username and password fields are filled
    if (!loginCredentials.username || !loginCredentials.password) {
        response.status(401).send({
            error: "please fill in all fields"
        });
        return
    }
    // makes connection to the database and searches the username inside the database
    try {
        await client.connect();
        const userData = await client.db("courseProject").collection("users");
        const checkUsername = await userData.findOne({
            username: loginCredentials.username
        });
        // if the filled in username is not found, return a error with a message
        if (checkUsername == null) {
            console.log("username doesn't exist");
            response.status(401).send({
                error: "username or password is wrong"
            });
            return
        } else {
            const userPassword = await userData.findOne({
                username: loginCredentials.username
            });
            console.log(userPassword);
            // if both username and password are correct, return userId so that the user stays logged in
            if (userPassword.password == loginCredentials.password) {
                const userDetails = await userData.find({
                    "username": loginCredentials.username
                }).toArray()
                response.status(200).send({
                    succes: "successfully logged in",
                    user: {
                        "userId": userDetails[0]._id,
                        "firstName": userDetails[0].firstName,
                        "lastName": userDetails[0].lastName,
                        "username": userDetails[0].username,
                        "email": userDetails[0].email
                    }

                });
                // if the password is wrong,  return a error with a message
            } else {
                response.status(401).send({
                    error: 'username or password is wrong'
                })
            }

        }
        // if there is any problem, the api will send the error back and also display it inside the console
    } catch (error) {
        console.log(error);
        response.status(406).send({
            error
        });
        // close the connection to the database
    } finally {
        await client.close();
    }
})

/**
 * POST endpoint, function to login with userId 
 * 
 * @params object loginWithId: object to find and compare user credentials
 * @returns object valid(bool): return if the logged in user exist
 *  */
app.post('/loginId', async (request, ressponse) => {

    let loginWithId = request.body.loginWithId
    // check if the username and password fields are filled
    if (!loginWithId.username || !loginWithId.userId) {
        response.status(401).send({
            error: "no user Id provided"
        });
        return
    }
    // makes connection to the database and searches if the userId exists
    try {
        await client.connect();
        const userData = await client.db("Courseproject").collection("user_data");
        const userId = await userData.distinct("_id", {
            "username": loginWithId.username
        })
        // if userId doesn't exist, return a error with a message
        if (userId == null) {
            console.log("userId isnt valid");
            response.status(401).send({
                error: "userId isnt valid",
                Valid: false
            });
            return
        } else {
            // checks if userId in database is the same as the userId in the body
            if (loginWithId.userId == userId) {
                response.status(200).send({
                    Valid: true
                })
            } else {
                console.log("userId isnt valid");
                response.status(401).send({
                    error: "userId isnt valid",
                    Valid: false
                });
            }
        }
        // if there is any problem, the api will send the error back and also display it inside the console
    } catch (error) {
        console.log(error);
        response.status(406).send({
            error
        });
        // close the connection to the database
    } finally {
        await client.close();
    }
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