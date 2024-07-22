require("dotenv").config()
const express = require("express")
const cors = require("cors")
const Note = require("./models/note")
const dns = require("node:dns")

if (process.env.DNS) {
    dns.setServers(dns.getServers().concat(process.env.DNS)) // This is due sometimes MongoDB is unreacheable
}

const PORT = process.env.PORT || 3001

const app = express()
app.use(cors())
app.use(express.static("dist"))


// CONFIG
app.use(express.json())

const generateId = () => {
    return String(Math.max(...notes.map(n => Number(n.id))) + 1)
}

app.get("/", (request, response) => {
    response.send("<h1>Hello darkness my old friend</h1>")
})

app.get("/api/notes", (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.post("/api/notes", (request, response) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({ error: "Content missing" })
    }
    
    const note = {
        content: body.content,
        important: Boolean(body.important) || false,
        id: generateId()
    }

    console.log("note", note)
    notes = notes.concat(note)
    response.json(note)
})

app.get("/api/notes/:id", (request, response) => {
    const id = request.params.id
    const note = notes.find(n => String(n.id) === String(id))
    if (!note) {
        response.status(404).end()        
    } 
    response.json(note)
})

app.delete("/api/notes/:id", (request, response) => {
    const id = request.params.id
    notes = notes.filter(n => String(n.id) !== String(id))

    response.status(204).end()
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})