const mongoose = require("mongoose")

if (process.argv.length < 3) {
    console.log("Give password as argument")
    process.exit(1)
}

const username = "ivanuria"
const password = process.argv[2]
const appName = "noteApp"

const url = `mongodb+srv://${username}:${password}@fullstackopen.9w0q2vh.mongodb.net/${appName}?retryWrites=true&w=majority&appName=FullStackOpen`

mongoose.set("strictQuery", false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean
})

const Note = mongoose.model("Note", noteSchema)

/*const note = new Note({
    content: "MongoDB makes life easier",
    important: true
})

note.save().then(result => {
    console.log("Note saved!")
    mongoose.connection.close()
})*/

Note.find({_id: "669d6a48ac6cc22ae890f858"}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})