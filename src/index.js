require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(express.static('../docs'))



app.listen(port, (error) => {
    if (!error) {
        console.log(`api running on https://localhost:${port}`);
    } else {
        console.log(error);
    }
})

app.get("/", (request,response) =>{
    response.redirect('index.html')
})