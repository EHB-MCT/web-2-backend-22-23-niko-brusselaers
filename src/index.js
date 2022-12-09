/**
 * used sources:
 * 
 *      - MongoDb documentation: https: //www.mongodb.com/docs/
 *      - MongoDb remove object from array: https: //stackoverflow.com/questions/15641492/mongodb-remove-object-from-array
 *      - RAWG api documentation: https: //api.rawg.io/docs/
 *      - switch statement javscript: https: //www.w3schools.com/js/js_switch.asp
 */



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
app.use(express.static('./docs'))

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
 * userPreferences{
 *      userId(str),
 *      gamePreferences(arr(game,
 *                          gameIsLiked(bool)))
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
 *      gameId(int),
 *      IsLiked(bool)
 * }
 * 
 * updateUserCredentials{
 *      userId(str),
 *      password(str),
 *      type(str),
 *      newCredential(str)
 * }
 * 
 * deleteUser{
 *      userId(str),
 *      password(str)
 * }
 * 
 * 
 * platform/console id:
 * 
 * PC = 4
 * Linux = 6
 * Playstation 5 = 187
 * Playstation 4 = 18
 * Xbox one = 1
 * Xbox series S/X = 186
 * Nintendo Switch = 7
 * IOS = 3
 * macOS = 5
 * Android = 21
 *  
 * 
 * 
 */

/**
 * GET endpoint, return documentation about endpoints of the api
 * 
 * @returns html page with list of endpoints
 */
app.get("/", (request, response) => {
    response.status(300).redirect("index.html")
})


/**
 * GET endpoint, return a random game
 * 
 * @returns object with result object game
 */
app.get("/getRandomGame", async (request, response) => {

    let apiParameters = {
        randomPage: Math.round(Math.random() * 92), //21250
        platform: '4,6,187,18,1,186,7',
        metacritic: "70,100"
    }
    try {
        //fetching a list of games from the api
        fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&page=${apiParameters.randomPage}&page_size=39&platforms=${apiParameters.platform}&metacritic=${apiParameters.metacritic}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                //generating a random number to pick a random game and sending the selected game back in the response
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
        response.status(500).send({
            error: error.message
        })
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
    // check if all required data is present in request and if somthing is not present, replace it with default values
    let apiParameters = {
        randomPage: Math.round(Math.random() * 70),
        genres: request.body.genres || 'action, strategy, rpg, shooter, adventure, puzzle, racing, sports',
        platform: request.body.platform || '4,6,187,18,1,186,7',
        tag: request.body.tag || 'Singleplayer, Multiplayer, Co-op, Atmospheric, Full controller support',
        metacritic: "70,100"
    }
    try {
        //fetching a list of games from the api
        fetch(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&page=${apiParameters.randomPage}&page_size=39&platforms=${apiParameters.platform}&metacritic=${apiParameters.metacritic}&platform=${apiParameters.platform}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                try {
                    //generating a random number to pick a random game and sending the selected game back in the response

                    let randomGame = data.results[Math.round(Math.random() * 38)]
                    console.log(randomGame);
                    response.status(200).send({
                        gameId: randomGame.id,
                        name: randomGame.name,
                        image: randomGame.background_image
                    })
                } catch (error) {
                    console.log(error);
                    response.status(500).send({
                        error: error.message
                    })
                }

            })
    } catch (error) {
        console.log(error);
    }



})

/**
 * GET endpoint, return a random game from the list of favorited games
 * 
 * @params object userId(str): reference id to find user inside database
 * @returns object with result object game
 */
app.get("/getGameFromFavorites", async (request, response) => {
    let userId = request.body.userId
    // check if all required data is present in request
    if (!userId) {
        response.status(400).send({
            message: "userId is not defined"
        })
    } else {
        try {
            // retrieving list of user game preferences 
            await client.connect();
            const data = client.db("courseProject").collection("userPreferences")
            const userData = await data.findOne({
                userID: userId
            })
            // making a new list with all the games that are liked and then selecting a random game
            const games = userData.games.filter((game) => game.isLiked == true)
            let randomNumber = Math.round(Math.random() * games.length)
            randomNumber = randomNumber == games.length ? randomNumber - 1 : randomNumber
            //if the user has no liked games, send error message in response
            if (games.length == 0) {
                response.status(400).send({
                    error: "you have no games liked"
                })
            } else {
                //fetching the selected game from the api
                fetch(`https://api.rawg.io/api/games/${games[randomNumber].gameId}?key=${process.env.RAWG_API_KEY}`, {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        //sending selected game back with response
                        response.send({
                            gameId: data.id,
                            name: data.name,
                            image: data.background_image
                        })
                    })
            }

        } catch (error) {
            console.log(error);
            response.status(500).send({
                error: error.message
            })
        } finally {
            await client.close();
        }

    }

})

/**
 * GET endpoint, return list of liked and disliked games of user
 * 
 * @params object userId(str): reference id to find user inside database
 * @returns object with result userPreferences
 */
app.get("/getUserPreferences", async (request, response) => {

    let userId = request.body.userId
    // check if all required data is present in request
    if (!userId) {
        response.status(400).send({
            message: "userId is not defined"
        })
    } else {

        try {
            // retrieve data from userPreferences collection in database
            await client.connect();
            const data = client.db("courseProject").collection("userPreferences")
            const UserGamePreferences = await data.findOne({
                userID: userId
            })
            // looping over all games inside array and fetching game data from rawg api
            for (let i = 0; i < UserGamePreferences.games.length; i++) {
                await fetch(`https://api.rawg.io/api/games/${UserGamePreferences.games[i].gameId}?key=890f8b1ca0e745639c6f586b8c849c90`)
                    .then(response => response.json())
                    .then(data => {
                        // adding game name and image to object inside games array
                        UserGamePreferences.games[i] = {
                            gameId: data.id,
                            name: data.name,
                            image: data.background_image,
                            isLiked: UserGamePreferences.games[i].isLiked
                        }

                    })

            }
            //sending back useGamePrefences in response
            response.status(200).send(UserGamePreferences)
        } catch (error) {
            console.log(error);
            response.status(500).send({
                error: error.message
            })
        } finally {
            await client.close();
        }


    }

})

/**
 * POST endpoint, create a new user account and add it to the database
 * 
 * @params object newUser: object to compare against existing users and to create new user
 * @return object with userDetails
 */
app.post("/createAccount", async (request, response) => {
    let newUser = request.body.newUser

    // check if all required data is present in request
    if (!newUser.username || !newUser.password || !newUser.email || !newUser.firstName || !newUser.lastName) {
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
        response.status(500).send({
            error: error.message
        })
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
    // check if all required data is present in request
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
        response.status(500).send({
            error: error.message
        })
        // close the connection to the database
    } finally {
        await client.close();
    }
})

/**
 * POST endpoint, function to login with userId 
 * 
 * @params object loginWithId: object to find and compare user credentials
 * @returns object isValid(bool): return if the logged in user exist
 *  */
app.post('/loginId', async (request, response) => {

    let loginWithId = request.body.loginWithId
    console.log(loginWithId);
    // check if all required data is present in request
    if (!loginWithId.username || !loginWithId.userId) {
        response.status(401).send({
            error: "no user Id provided"
        });
        return
    }
    // makes connection to the database and searches if the userId exists
    try {
        await client.connect();
        const data = await client.db("courseProject").collection("users");
        const user = await data.findOne({
            "_id": ObjectId(loginWithId.userId),
            "username": loginWithId.username
        })
        // if userId doesn't exist or username is not linked to given userId, return a error with a message
        if (user != null) {
            response.status(200).send({
                message: "user is valid",
                isValid: true
            })
        } else {
            response.status(200).send({
                message: "user isn't valid",
                isValid: false
            })
        }
    } catch (error) {
        console.log(error);
        response.status(500).send({
            error: error.message
        })
        // close the connection to the database
    } finally {
        await client.close();
    }
})


/**
 * POST endpoint, add game preference to user game preferences list in the database
 * 
 * @params object updateUserPreferences: object to find user and add gameId to their gamePreferences list
 */
app.put("/updateUserGamePreference", async (request, response) => {
    let updateUserPreferences = request.body.updateUserPreferences
    // check if all required data is present in request
    if (!updateUserPreferences.userId || !updateUserPreferences.gameId || updateUserPreferences.isLiked == undefined) {
        response.status(400).send({
            error: "missing data in request"
        })
    } else {
        try {
            //checking if the game is already an object in the array of games of user 
            await client.connect();
            const data = client.db("courseProject").collection("userPreferences")
            let userData = await data.findOne({
                userID: updateUserPreferences.userId,
                'games.gameId': updateUserPreferences.gameId
            })
            // if the game is already there, remove it from the list
            if (userData != null) {
                userData = await data.findOneAndUpdate({
                    userID: updateUserPreferences.userId,
                    'games.gameId': updateUserPreferences.gameId
                }, {
                    $pull: {
                        'games': {
                            "gameId": updateUserPreferences.gameId
                        }
                    }
                })
            }
            // inserting a new object into games array with gameId and isLiked
            userData = await data.findOneAndUpdate({
                userID: updateUserPreferences.userId
            }, {
                $push: {
                    'games': {
                        'gameId': updateUserPreferences.gameId,
                        'isLiked': updateUserPreferences.isLiked
                    }
                }
            }, {
                upsert: true
            })
            response.status(200).send({
                message: 'ok'
            })
        } catch (error) {
            console.log(error);
            response.status(500).send({
                error: error.message
            })
        } finally {
            await client.close();
        }
    }

})


/**
 * PUT endpoint, update user credentials in database
 * 
 * @params object updateUserCredentials: object to find and compare user details, aswell update them
 * @returns object userId(str)
 */
app.put("/updateAccount", async (request, response) => {
    let updateUserCredentials = request.body.updateUserCredentials

    if (!updateUserCredentials.userId || !updateUserCredentials.password) {
        response.status(400).send({
            error: "missing userId or password"
        });
    } else {
        try {
            // fetch user data from user collection inside database
            await client.connect();
            const db = await client.db("courseProject").collection("users");
            const userData = await db.findOne({
                "_id": ObjectId(updateUserCredentials.userId)
            })
            // if password is incorrect send error response back
            if (userData.password != updateUserCredentials.password) {
                response.status(401).send({
                    error: "password is not correct"
                })
            } else {

                switch (updateUserCredentials.type) {
                    // if type = password, update user password in database
                    case "password":
                        await db.findOneAndUpdate({
                            '_id': ObjectId(updateUserCredentials.userId)
                        }, {
                            $set: {
                                password: updateUserCredentials.newCredential

                            }
                        })
                        response.send(200).send({
                            message: "ok"
                        })
                        break
                        // if type = email, update user email in database
                    case "email":

                        await db.findOneAndUpdate({
                            '_id': ObjectId(updateUserCredentials.userId)
                        }, {
                            $set: {
                                email: updateUserCredentials.newCredential

                            }
                        })
                        response.send(200).send({
                            message: "ok"
                        })
                        break
                        // if type = username, update user username in database
                    case "username":

                        await db.findOneAndUpdate({
                            '_id': ObjectId(updateUserCredentials.userId)
                        }, {
                            $set: {
                                username: updateUserCredentials.newCredential

                            }
                        })
                        response.send(200).send({
                            message: "ok"
                        })

                        break
                    default:
                        // if type was definded or not properly, send error response back
                        response.status(400).send({
                            error: "the update type was not correctly specified, please choose out of following: password, email, username"
                        })
                        break
                }
            }




        } catch (error) {
            console.log(error);
            response.send(500).send({
                error: error.message
            })
        } finally {
            await client.close();
        }

    }

})

/**
 * POST endpoint, remove game preference from user game preferences list in the database
 * 
 * @params object updateUserPreferences: object to find user and remove gameId to their gamePreferences list
 */
app.delete("/deleteUserGamePreference", async (request, response) => {
    let updateUserPreferences = request.body.updateUserPreferences

    try {
        await client.connect();
        const data = client.db("courseProject").collection("userPreferences")
        let userData = await data.findOne({
            userID: updateUserPreferences.userId,
            'games.gameId': updateUserPreferences.gameId
        })
        // if the game is inside array, remove it from array
        if (userData != null) {
            userData = await data.findOneAndUpdate({
                userID: updateUserPreferences.userId,
                'games.gameId': updateUserPreferences.gameId
            }, {
                $pull: {
                    'games': {
                        "gameId": updateUserPreferences.gameId
                    }
                }
            })
            //if the game is succesfully removed, send response 200 and message "ok"
            response.status(200).send({
                message: "ok"
            })
        } else {
            // if the game or userId can't be found, send error response 400
            response.status(400).send({
                error: "user or game not found"
            })
        }
    } catch (error) {
        console.log(error);
        response.status(500).send({
            error: error.message
        })
    } finally {
        await client.close();
    }


})

/** 
 * DELETE endpoint, delete user account from database
 *
 * @params object deleteUser: object to find and compare user details *
 * @returns object userId(int) *
 */
app.delete("/deleteUser", async (request, response) => {
    let deleteUser = request.body.deleteUser

    /**
     * deleteUser {
         * userId(str),
             * password(str) *
     }
     */
    try {
        //find user data inside user collection
        await client.connect();
        const data = client.db("courseProject").collection("users")
        const userData = await data.findOne({
            "_id": ObjectId(deleteUser.userId)
        })
        //if the user exist and the password is correct, delete user and return response 200 with message "ok"
        if (userData != null && userData.password == deleteUser.password) {
            await data.deleteOne({
                '_id': ObjectId(deleteUser.userId)
            })
            response.status(200).send({
                message: "ok"
            })
            //if user is not found or password is incorect, return error message with response
        } else {
            response.status(400).send({
                error: "userId not found or password incorrrect"
            })
        }
    } catch (error) {
        console.log(error);
        response.status(500).send({
            error: error.message
        })
    } finally {
        await client.close();
    }

})