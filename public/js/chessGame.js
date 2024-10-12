//https://socket.io/docs/v4/client-installation/ (documentation)
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// const renderBoard = () => {
//     const board = chess.board();
//     boardElement.innerHTML = "";//empty the board 
//     board.forEach((row, rowindex) => {
//         row.forEach((square, squareindex) => {
//             const squareElement = document.createElement("div");
//             squareElement.classList.add(
//                 "square",
//                 (rowindex + squareindex)%2 === 0 ? "Light" : "Dark"
//             );

//             squareElement.dataset.row =  rowindex;
//             squareElement.dataset.col = squareindex;

//             if(square){
//                 const pieceElement = document.createElement("div");
//                 pieceElement.classList.add(
//                     "piece",
//                     square.color === 'w' ? "white" : "black"
//                 );
//             pieceElement.innerText = "";
//             pieceElement.draggable = playerRole === square.color;

//             pieceElement.addEventListener("dragstart", (e) => {
//                 if(pieceElement.draggable){
//                     draggedPiece = pieceElement;
//                     sourceSquare = {row: rowindex, col: squareindex };
//                     e.dataTransfer.setData("text/plain", "");//no problem coccurs in drag
//                 }
//             });

//             pieceElement.addEventListener("dragend", (e) => {
//                 draggedPiece = null;
//                 sourceSquare = null; 
//             });

//             squareElement.appendChild(pieceElement);
//             }

//             squareElement.addEventListener("dragover" ,function (e) {
//                 e.preventDefault();
//             });

//             squareElement.addEventListener("drop", function (e) {
//                 e.preventDefault();
//                 if(draggedPiece){
//                     const targetSource = {
//                         row: parseInt(squareElement.dataset.row),
//                         col: parseInt(squareElement.dataset.col),
//                     };

//                     handleMove(sourceSquare, targetSource);
//                 }
//             });
//             boardElement.appendChild(squareElement);
//         });
//     });
// };

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = ""; // Empty the board before rendering
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            
            // Assign correct classes for light/dark squares
            squareElement.classList.add(
                "square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            // If there is a piece on the square
            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                
                // Get the Unicode for the chess piece
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                // Drag and Drop functionality
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            // Add dragover and drop events for each square
            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSquare);
                }
            });

            // Append the square to the chessboard
            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source,target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q",
    };

    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        P: "♟",  
        p: "♙",  
        r: "♜",  
        R: "♖",  
        n: "♞",  
        N: "♘",  
        b: "♝",  
        B: "♗",  
        q: "♛",  
        Q: "♕", 
        k: "♚",  
        K: "♔",  
    };

    
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function() {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen) {
    chess.load(fen);
    renderBoard();
});

socket.on("move",function(move) {
    chess.move(move);
    renderBoard();
});

renderBoard();

// socket.emit("slice");//io function runs when slice received
// socket.on("slice for everyone",function() {
//     console.log("SLICE FUCK YEAAH");
// });

