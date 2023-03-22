
var socket = io.connect("http://localhost:5000");
var myName = '';
var userlist = document.getElementById("userlist");
var roomlist = document.getElementById("roomlist");
var message = document.getElementById("message");
var sendMessageBtn = document.getElementById("send");
var createRoomBtn = document.getElementById("create-room");
var messages = document.getElementById("msg");
var chatDisplay = document.getElementById("chat-display");
var currentRoom = "General";

// Send message on button click
sendMessageBtn.addEventListener("click", function () {
    if (message.value == "") {
        return;
    } else {
        console.log("not blank");
        console.log(message.value);
        socket.emit("sendMessage", message.value);
        message.value = "";
        var sendSound = new Audio("./sound/1.wav");
        sendSound.play();
        socket.emit("rSound", { sound: "./sound/2.mp3" });
    }
});

// Send message on enter key press
message.addEventListener("keyup", function (event) {
    if (event.keyCode == 13) {
        sendMessageBtn.click();
    }
});

//send file
socket.on('addimage', function (user, myImage, myFile) {
    if (user == myName) {
        $('#msg').append('<p class="self"><b>' + user + ': </b>' + '<img width="200" height="200" style="border-radius:10px" src="' + myImage + '" /><br><small>' + moment().format('h:mm a') + '</small></p>');
    }else{
        $('#msg').append('<p><b>' + user + ': </b>' + '<img width="200" height="200" style="border-radius:10px" src="' + myImage + '" /><br><small>' + moment().format('h:mm a') + '</small></p>');
    }
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
})
$(function () {
    $('#btnImageFile').on('change', function (e) {
        var file = e.originalEvent.target.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            socket.emit('userImage', evt.target.result);
        };
        reader.readAsDataURL(file);
        var sendSound = new Audio("./sound/1.wav");
        sendSound.play();
    })
})

// Create new room on button click
createRoomBtn.addEventListener("click", function () {
    socket.emit("createRoom", prompt("Enter new room: "));
});

socket.on("connect", function () {
    var uName = prompt("Enter name: ");
    socket.emit("createUser", uName);
    document.title = "User - " + uName;
    myName = uName;
});

socket.on("updateChat", function (username, data) {
    if (username == "INFO") {
        messages.innerHTML +=
            "<p class='alert alert-warning w-100'>" + data + "</p>";
    }
    else if (username == myName) {
        messages.innerHTML +=
            "<p class='self'><span><strong>" + username + ": </strong></span>" + data + "<br><small>" + moment().format('h:mm a') + "</small></p>";
    } else {
        messages.innerHTML +=
            "<p><span><strong>" + username + ": </strong></span>" + data + "<br><small>" + moment().format('h:mm a') + "</small></p>";
    }
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

socket.on("updateUsers", function (usernames) {
    userlist.innerHTML = "";

    for (var user in usernames) {
        userlist.innerHTML += "<li>" + user + "</li>";
    }
});


socket.on("updateRooms", function (rooms, newRoom) {
    roomlist.innerHTML = "";

    for (var index in rooms) {
        roomlist.innerHTML +=
            '<li class="rooms" id="' +
            rooms[index] +
            '" onclick="changeRoom(\'' +
            rooms[index] +
            "')\">" +
            rooms[index] +
            "</li>";
    }

    if (newRoom != null) {
        document.getElementById(newRoom).classList.add("text-warning");
    } else {
        document.getElementById(currentRoom).classList.add("text-warning");
    }

});

function changeRoom(room) {

    if (room != currentRoom) {
        socket.emit("updateRooms", room);
        document.getElementById(currentRoom).classList.remove("text-warning");
        currentRoom = room;
        document.getElementById(currentRoom).classList.add("text-warning");
    }
}

//broadcast tone
socket.on("notifySound", data => {
    var receiveSound = new Audio(data.sound);
    receiveSound.play();
    console.log("sound played");
});