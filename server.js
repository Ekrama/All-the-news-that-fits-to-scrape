var express = require("express");
var express_handlebars = require("express-handlebars");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var logger = require("morgan");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);
var NotesModel = require("./models/NotesModel");
var ArticleModel = require("./models/ArticleModel");
var request = require("request");
mongoose.Promise = Promise;

var db =mongoose.connection;
db.on("error",function(err){
  console.log("mongoose Error found:",err);
});

db.once("open", function(){
  console.log("connection to mongoose Database Successful.");
});

var app = express();

var PORT = process.env.PORT || 3000;

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app .engine("handlebars", express_handlebars({defaultLayout:"main"}));
app.set("view engine","handlebars");
app.listen(PORT,function(){
  console.log("listen To port"+PORT);
});

app.get("/", function(req,res){
  ArticleModel.find({}, null, function(err,data){
    if(data.length === 0)
    {
      res.render("placeholder", { message: "Uh Oh. Looks like we don't have any new articles."
      });
    }
     else
     {
     res.render("index", {articles:data});
    }
  })
});

app.get("/api/fetch", function(req, res) {
	request("https://www.nytimes.com/section/world", function(error, response, html) {
		var $ = cheerio.load(html);
		var result = {};
		$("article").each(function(i, element) {
			//const item = $(element).text();
			//if(i == 0)
			//{
				//console.log("HI");
				//console.log(item);
				//console.log("HELLO");
				//console.log($(element).find("div").find("h2").find("a").attr("href"));
				//document.querySelector("article > div > h2 > a")
				//article > div > p.css-1gh531.e4e4i5l4"
				
				var title = $(element).find("div").find("h2").find("a").text();
				var summary = $(element).find("div").find("p.css-1gh531.e4e4i5l4").text();
				var link = $(element).find("div").find("h2").find("a").attr("href");
				var img = $(element).find("figure").find("a").find("img").attr("src");
				//console.log("BYE");
				
				console.log("Title: " + title);
				console.log("Summary: " + summary);
				console.log("Link: " + link);
			//}
			
			result.link = link;
			result.title = title;
			if (summary) {
				result.summary = summary;
			}
			if (img) {
				result.img = img;
			}
			else {
				result.img = $(element).find(".wide-thumb").find("img").attr("src");
			}
			var entry = new ArticleModel(result);
			ArticleModel.find({title: result.title}, function(err, data) {
				if (data.length === 0) {
					entry.save(function(err, data) {
						if (err) throw err;
					});
				}
			});
		});




// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
    }); 
