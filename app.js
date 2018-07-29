var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

mongoose.connect("mongodb://localhost:27017/blog_app", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});
var Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(request, response) {
    response.redirect("/blogs");
});

// INDEX - display all blogs
app.get("/blogs", function(request, response) {
    Blog.find({}, function(err, blogs) {
        if (err) {
            console.log(err);
        }
        else {
            response.render("index", { blogs: blogs });
        }
    });
});

// NEW - display form for adding new blog
app.get("/blogs/new", function(request, response) {
    response.render("new");
});

// CREATE - add newly submitted blog to dataBase
app.post("/blogs", function(request, response) {
    request.body.blog.body = request.sanitize(request.body.blog.body);
    Blog.create(request.body.blog, function(err, newBlog) {
        if (err) {
            console.log(err);
        }
        else {
            response.redirect("/blogs");
        }
    });
});

// SHOW - display single article's inner page
app.get("/blogs/:id", function(request, response) {
    Blog.findById(request.params.id, function(err, foundBlog) {
        if (err) {
            response.redirect("/blogs");
        }
        else {

            response.render("show", { blog: foundBlog });
        }
    });
});

// EDIT - display form for editiong existing blog
app.get("/blogs/:id/edit", function(request, response) {
    Blog.findById(request.params.id, function(err, foundBlog) {
        if (err) {
            response.redirect("/blogs");
        }
        else {
            response.render("edit", { blog: foundBlog });
        }
    });
});

// UPDATE - update edited blog in database
app.put("/blogs/:id", function(request, response) {
    request.body.blog.body = request.sanitize(request.body.blog.body);
    Blog.findByIdAndUpdate(request.params.id, request.body.blog, function(err, updatedBlog) {
        if (err) {
            console.log(err);
        }
        else {
            response.redirect("/blogs/" + request.params.id);
        }
    });
});

// DESTROY - delete existing blog from database
app.delete("/blogs/:id", function(request, response) {
    Blog.findByIdAndRemove(request.params.id, function(err) {
        if (err) {
            console.log(err);
        }
        else {
            response.redirect("/blogs/");
        }
    });
});

// 404 - Display error-page
app.get("/error404", function(request, response) {
    response.render("error404");
});

// 404 error handling
app.use(function(request, response, next) {
    response.status(404).redirect("/error404");
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("BlogApp server is up.");
});
