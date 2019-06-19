var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var NotesSchema = new Schema({


  title:{
    type: String
  },

  body:{
    type: String
  }

});

// This creates our model from the above schema, using mongoose's model method
var NotesModel = mongoose.model("NotesModel", NotesSchema);
  
// Export the  Article model
module.exports = NotesModel;


