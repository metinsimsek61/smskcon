/*
   ╭─────────────────────────────────────╮
   │                                     │
   │   mtnsmsk smskCon Online Meeting    │
   │         Copyright ©mtnsmsk          │
   │            Ver: 0.0.1               │
   │                                     │
   ╰─────────────────────────────────────╯
*/

/*
 * Todo List;
 * Username system
 * 
*/

/*
 * Sandbox
sessionStorage.setItem( 'username', name );
location.reload();
const username = sessionStorage.getItem( 'username' );

*/
var bodyParser = require('body-parser');
const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

const { Database } = require("smskdb");
const { stdout } = require('process');
const db = new Database("db/meeting");

var meetingdb = db.fetch("meetings")

function findmeeting(uuid) {
    if (!uuid) {
        throw new Error("Please specify uuid")
    }else{
        if (meetingdb.find(u => u.uuid === uuid) === undefined) {
            return false;
        } else {
            return true;
        }
    }
}

// Usage
/*
new genmeeting();
*/

class genmeeting {
    constructor(uuid, creator) {
        if (!uuid) {
            this.uuid = uuidV4()
        } else {
            this.uuid = uuid
        }
        if (!creator) {
            this.creator = "system"
        }else{
            this.creator = creator
        }
        let newid = (meetingdb.length + 1)
        db.push("meetings", { id: newid, uuid: this.uuid, creator: this.creator })
        console.log("New Meeting Created: " + this.uuid)
        return true;
    }
}

app.use('/peerjs', peerServer);
// Usage <%=baseURL%>. dynamicly includes
app.locals.baseURL = "https://smskconn.herokuapp.com/"

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/*
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})
*/

app.get("/", (req, res) => {
  res.send("<p>Wellcome. It looks like your meeting url is invaild. Only Administators Can Generate An Meeting Url. Sorry for that.</p><br><center>Copyright smskcon by mtnsmsk.</center>")
})

app.get("/genUrl", (req, res) => {
  new genmeeting();
  res.send("<p>Url Generated Successfully. Please look server console for url.</p>")
})

app.get("/join/:room", (req, res) => {
  if (!req.query.username) {
    res.render("joinmeeting", { roomId: req.params.room })
  }else{
    if (findmeeting(req.params.room) === true) {
      let userName = req.query.username;
      res.render('room', { roomId: req.params.room, username: userName })
    }else{
      res.send("<p>404 Meeting Not Found!</p>")
    }
  }
})

app.post("/join", (req, res) => {
  if (findmeeting(req.body.roomid) === true) {
    let body = req.body;
    res.render("room", { roomId: body.roomid, username: body.username })
  }else{
    res.send("<p>404 Meeting Not Found!</p>")
  }
})

app.get('/:room', (req, res) => {
  let userName = req.query.username;
  if (!userName) {
    res.render("joinmeeting", { roomId: req.params.room })
  }
  if (findmeeting(req.params.room) === true) {
    res.render('room', { roomId: req.params.room, username: userName })
  }else{
    res.send("<p>404 Meeting Not Found!</p>")
  }
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  });
    // Tests
    socket.on('test', function(data) {
      // Log Data
      console.log("canuseeme")
      console.log(data)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3030, function(err) {
  if (err) return console.log(err);
  console.log("Server Started. Port: " + 3030)
})
/*

const { Database } = require("smskdb");
const db = new Database("db/meeting");

// First install database
let q = db.has("meetings")
// let q2 = db.has("users") NOT READY
if (q === true) {
    return;
}else{
    console.log("ERROR: Database is not created correctly. Creating New Database!")
    db.set("meetings", []);
    db.push("meetings", { id: 1, uuid: "showroom", creator: "mtnsmsk" }) // First Meeting
    console.log("Done.")
}

// Check Meeting
function dbhasmeeting(uuid) {
    if(db.get("meetings").includes(uuid) === true) {
        return true;
    }else{
        return false;
    }
}

// Create Meeting
function createdbmeeting(uuid, creator) {
    // Control the uuid
    if (dbhasmeeting(uuid)) {
        return "ERROR!: Meeting Already Created!"
    }else{
        let meetingdb = db.get("meetings")
        let lastid = (meetingdb.length - 1)
        let newid = lastid + 1
        // Push database
        db.push("meetings", { "id": newid, "uuid": uuid, "creator": creator })
        if (meetingdb.includes(newid) === true) {
            console.log("New Meeting Created! id: " + uuid)
        }
    }
}*/