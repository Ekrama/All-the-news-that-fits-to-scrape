var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ArticleSchema = new Schema({


  title:{
    type: String,
     required:true,
     trim:true
  },

  summary:{
    type: String,
     required:true,
     trim:true
  },

  url:{
    type: String,
     required:true,
     trim:true
  },
 
  saved:{
    type: Boolean,
     default: false
    
     
  },
  note:{
    type : Schema.Types.ObjectId,
    ref: "NotesModel"

  },
  
});

// This creates our model from the above schema, using mongoose's model method
var ArticleModel = mongoose.model("ArticleModel", ArticleSchema);
  
// Export the  Article model
module.exports = ArticleModel;


