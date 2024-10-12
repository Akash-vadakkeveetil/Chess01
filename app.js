const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

//sttp server for express
const server = http.createServer(app);
const io = socket(server); //socket will run on that particular server

const chess = new Chess();

let players ={};
let currentPlayer = "w";

app.set("view engine","ejs");//can use ejs
app.use(express.static(path.join(__dirname,"public")));//can use static files

app.get("/", (req,res) => {
    res.render("index",{title: "Chess game"});
});

io.on("connection",function(uniquesocket){//whenever some one has connected the run the function and socket here is the unique info about that person
    console.log("connected");

    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }
    // uniquesocket.on("slice",function(){

    //     io.emit("slice for everyone");//when server sends to everyone connected to server
    //     console.log("slice received");
    // });

    // uniquesocket.on("disconnect",function(){
    //     console.log("Disconnected");//offline
    // })//finding whether any one is there online or offline

    uniquesocket.on("disconnecct",function() {
        if(socket.id === players.white) {
            delete players.white;
        }else if (uniquesocket.id === players.black) {
            delete players.black;
        }
    });

     uniquesocket.on("move",(move)=>{
        try{
            //make sure that black or white plays their move
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return;
            
            //after validation then movement is allowed
            const result = chess.move(move);
            if(result){

                //then we send the move to frontend to everyone
                currentPlayer = chess.turn();
                io.emit("move",move);
                io.emit("boardState", chess.fen());
            }
            else{
                console.log("Invalid move :",move);
                uniquesocket.emit("invalidMove",move);
            }
        }
        catch(err){
            console.log(err);
            uniquesocket.emit("Invalid move : ",move);
        }
     });
});

server.listen(3000,function() {
    console.log("Listening on port 3000");
});