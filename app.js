require("dotenv").config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")



app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.use(express.static( __dirname + "public"))
mongoose.connect( process.env.MONGO_DB, { useNewUrlParser: true })


const contentSchema = new mongoose.Schema({
    content: String
})

const Content = mongoose.model("Content", contentSchema)



async function getPosts(){
    //READ DOCUMENTS: Once we get a GET request from the root "/" directory Mongoose casts the filter to match the model's schema 
    //before the command is sent. See our query casting tutorial for more information on how Mongoose casts filter.
    //Model.find() = find all. It returns an ARRAY:
    const content = await Content.find({});
    
    console.log("This is content from getPosts: " + content)
    console.log("--------------------------------------")
    return content;
    
}
  
app.get("/", function(req, res){

    //The then() method of a Promise object takes up to two arguments: callback functions for the fulfilled and rejected cases 
    //of the Promise. It immediately returns an equivalent Promise object, allowing you to CHAIN CALLS TO OTHER PROMISE METHODS.
    getPosts().then(function(contents){
      //Here I "send" the data to home.ejs file using res.render.
      res.render("home", { contents: contents });
    });
    
});


app.post("/submit", function(req, res){

    const content = new Content( {
        content: req.body.content
    })

    console.log(content)
    Content.insertMany(content)

    console.log("New post saved to DB!")
    console.log("--------------------------------------")

    res.redirect("/")

})


app.get("/login", function(req, res){
    res.render("login")
})



// Here I'm deleting a document by Id:
app.get("/delete/:postId", function(req, res){

    const requestedPostId = req.params.postId

    async function deleteDocument(){
        const mongoDocument = await Content.deleteOne({_id: requestedPostId})
        console.log(mongoDocument)
    }

    deleteDocument()

    console.log(requestedPostId + " document deleted!")
    console.log("--------------------------------------")

    res.redirect("/")
  
});



// Here I'm updating a post, pulling it by Id in 2 steps:
app.get("/update/:postId", function(req, res){

    const requestedPostId = req.params.postId
    // const requestParams = req.params.content

    function renderer(mongoDoc) {
        const mongoContent = mongoDoc
        res.render("update", { contents: mongoContent, contentId: requestedPostId })
        console.log("update.ejs rendered")
        console.log("--------------------------------------")
    }

    async function updateDocument(){

        const mongoDocument = await Content.find({_id: requestedPostId})

        console.log("--------------------------------------")
        console.log(mongoDocument)
        console.log(mongoDocument[0].content)
        console.log("Document to be updated: " + requestedPostId)
        console.log("--------------------------------------")
        
        renderer(mongoDocument)
    }

    updateDocument()
  
});

app.post("/execute-update/:postId", (req, res)=>{

    const requestedPostId = req.params.postId
    const content = req.body.updatedContent

    async function executeUpdate(){
        await Content.updateOne({_id: requestedPostId}, {content: content}, { runValidators: true })
   
        console.log("Updated document: " + requestedPostId)
        console.log("--------------------------------------")

        res.redirect("/")
    }    

    executeUpdate()
})



app.listen( process.env.PORT || 3000, function(){
    console.log("Listening to Port 3000")
})