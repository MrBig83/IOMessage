var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require("http").Server(app)
var io = require("socket.io")(http)
var mongoose = require("mongoose")

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

var dbUrl = "mongodb+srv://user:user@iomessage.shhwvpo.mongodb.net/?retryWrites=true&w=majority"

var Message = mongoose.model("Message", {
    name: String, 
    message: String
})

app.get("/messages", (req, res) => {
    Message.find({})
    .then(messages => {
        res.send(messages);
    })
    .catch(error => {
        console.error("Error retrieving messages:", error);
        res.sendStatus(500);
    });
})

app.get("/messages/:user", (req, res) => {
    var user = req.params.user
    Message.find({name: user})
    .then(messages => {
        res.send(messages);
    })
    .catch(error => {
        console.error("Error retrieving messages:", error);
        res.sendStatus(500);
    });
})

app.post("/messages", async (req, res) => {
    try {
        var message = new Message(req.body)

        var savedMessage = await message.save()
    
        console.log("saved");
    
        var censored = await Message.findOne({ message: "badword"})
    
        if (censored)
            await Message.findOneAndRemove({ _id: censored.id })
        else 
            io.emit("message", req.body);
    
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
        return console.error(error)
    } finally {
        console.log("Message post called");
    }

    })

io.on("connection", (socket) => {
    console.log("Användare ansluten")
})

mongoose.connect(dbUrl);
console.log("Ansluten till DB");

var server = http.listen(3000, () => {
    console.log("Server is listening on port", server.address().port);
})