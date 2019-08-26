/* global bootbox */
$(document).ready(function() {
    // Setting a reference to the article-container div where all the dynamic content will go
    // Adding event listeners to any dynamically generated "save article"
    // and "scrape new article" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleDisplayNotes);
    $(document).on("click", ".btn.note-delete", handleDeleteNote);
    $(document).on("click", ".btn.save-button", handleAddNote);
    $(document).on("click", ".scrape-new", handleArticleScrape);
    $(document).on("click", ".clear",handleArticleClear);
  
    // function initPage() {
    //   // Run an AJAX request for any unsaved headlines
    //   $.get("/api/headlines/unsaved").then(function(data) {
    //     articleContainer.empty();
    //     // If we have headlines, render them to the page
    //     if (data && data.length) {
    //       renderArticles(data);
    //     } else {
    //       // Otherwise render a message explaining we have no articles
    //       renderEmpty();
    //     }
    //   });
    // }

    function initPage() {
      // Run an AJAX request for any unsaved headlines
      $.get("/api/headlines/saved").then(function(data) {
        articleContainer.empty();
        // If we have headlines, render them to the page
        if (data && data.length) {
          renderArticles(data);
        } else {
          // Otherwise render a message explaining we have no articles
          renderEmpty();
        }
      });
    }
  
    function renderArticles(articles) {
      // This function handles appending HTML containing our article data to the page
      // We are passed an array of JSON containing all available articles in our database
      var articleCards = [];
      // We pass each article JSON object to the createCard function which returns a bootstrap
      // card with our article data inside
      for (var i = 0; i < articles.length; i++) {
        articleCards.push(createCard(articles[i]));
      }
      // Once we have all of the HTML for the articles stored in our articleCards array,
      // append them to the articleCards container
      articleContainer.append(articleCards);
    }
  
    function createCard(article) {
      // This function takes in a single JSON object for an article/headline
      // It constructs a jQuery element containing all of the formatted HTML for the
      // article card
      var card = $("<div class='card'>");
      var cardHeader = $("<div class='card-header'>").append(
        $("<h3>").append(
          $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
            .attr("href", article.url)
            .text(article.headline),
          $("<a class='btn btn-success save'>Save Article</a>")
        )
      );
  
      var cardBody = $("<div class='card-body'>").text(article.summary);
  
      card.append(cardHeader, cardBody);
      // We attach the article's id to the jQuery element
      // We will use this when trying to figure out which article the user wants to save
      card.data("_id", article._id);
      // We return the constructed card jQuery element
      return card;
    }
  
    function renderEmpty() {
      // This function renders some HTML to the page explaining we don't have any articles to view
      // Using a joined array of HTML string data because it's easier to read/change than a concatenated string
      var emptyAlert = $(
        [
          "<div class='alert alert-warning text-center'>",
          "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
          "</div>",
          "<div class='card'>",
          "<div class='card-header text-center'>",
          "<h3>What Would You Like To Do?</h3>",
          "</div>",
          "<div class='card-body text-center'>",
          "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
          "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
          "</div>",
          "</div>"
        ].join("")
      );
      // Appending this data to the page
      articleContainer.append(emptyAlert);
    }

  
    function handleArticleSave() {
      // This function is triggered when the user wants to save an article
      // When we rendered the article initially, we attached a javascript object containing the headline id
      // to the element using the .data method. Here we retrieve that.
      var articleToSave = $(this)
        .parents(".card")
        .data();
  
      // Remove card from page
      $(this)
        .parents(".card")
        .remove();
  
      articleToSave.saved = true;
      console.log("Saving ID: "+ articleToSave._id);
      // Using a patch method to be semantic since this is an update to an existing record in our collection
      $.ajax({
        method: "PUT",
        url: "/api/headlines/" + articleToSave._id,
        data: articleToSave
      }).then(function(data) {
        // If the data was saved successfully
        if (data.saved) {
          // Run the initPage function again. This will reload the entire list of articles
          initPage();
        }
      });
    }

    function handleArticleDelete() {
      var articleToDelete = $(this)
        .parents(".card")
        .data();
  
      // Remove card from page
      $(this)
        .parents(".card")
        .remove();
        $.ajax({
          method: "DELETE",
          url: "/api/headlines/" + articleToDelete._id
        }).then(function(data) {
          console.log(data);
          // If the data was saved successfully
            // Run the initPage function again. This will reload the entire list of articles
        }).catch(err=>{
          location.reload();
        });
    }

    function handleDisplayNotes() {
      // Save the id from the p tag
      var article = $(this)
        .parents(".card")
        .data();
      console.log("ID: " + article._id);
      // Now make an ajax call for the Article
      $.ajax({
        method: "GET",
        url: "/api/notes/" + article._id
      })
        // With that done, add the note information to the page
        .then(data => {
          console.log(data);
          var modalText = $("<div class='container-fluid text-center'>").append(
            $("<h4>").text("Notes For Article: " + data.title),
            $("<hr>"),
            $("<ul class='list-group note-container'>"),
            $("<textarea id='new-note' placeholder='New Note' rows='4' cols='52'>"),
            $("<button class='btn btn-success save-button'>Save Note</button>")
          );
          // Adding the formatted HTML to the note modal
          bootbox.dialog({
            message: modalText,
            closeButton: true, 
            show: true,
            animate: false,
            backdrop: false
          });

          var noteData = {
            _id: data._id,
            notes: ["hi", "sup"]
            // notes: data.notes || []
          };
          console.log("Note Data:");
          console.log(noteData);
          // Adding some information about the article and article notes to the save button for easy access
          // When trying to add a new note
          $(".btn.save-button").data("article", noteData);
          // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
          renderNotesList(noteData);

        });
      }

      function renderNotesList(data) {
        // This function handles rendering note list items to our notes modal
        // Setting up an array of notes to render after finished
        // Also setting up a currentNote variable to temporarily store each note
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
          // If we have no notes, just display a message explaining this
          currentNote = $(
            "<li class='list-group-item'>No notes for this article yet.</li>"
          );
          notesToRender.push(currentNote);
        } else {
          // If we do have notes, go through each one
          for (var i = 0; i < data.notes.length; i++) {
            // Constructs an li element to contain our noteText and a delete button
            currentNote = $("<li class='list-group-item note'>").append(
              $("<div>").text(data.notes[i].body)
            );
            currentNote.append(
              $("<button class='btn btn-danger note-delete'>x</button>")
            );
            // Store the note id on the delete button for easy access when trying to delete
            currentNote.children("button").data("note-id", data.notes[i]._id);
            currentNote.children("button").data("article-id", data._id);
            // Adding our currentNote to the notesToRender array
            notesToRender.push(currentNote);
          }
        }
        // Now append the notesToRender to the note-container inside the note modal
        $(".note-container").append(notesToRender);
      }
      
      function handleDeleteNote(){
        let id = $(this).data("article-id");
        console.log("Note ID:" + id);
      }

      function handleAddNote(){
        let note = $("#new-note").val();
        console.log(note);
        let articleId = $(this).data("article")._id;
        //
        //send note to server then display it on the DOM upon sucessful save

        //TODO: make ajax request
            // in .then(add note to the DOM)

        $.ajax(
          {
            method: "POST", 
            url: "/api/note/" + articleId, 
            data: {note}
          }
        ).then(()=>{
          $("#new-note").val("");
          renderNotesList({_id: articleId, notes: [note]})
      })
      }

      function handleArticleScrape() {
        // This function handles the user clicking any "scrape new article" buttons
        $.get("/api/fetch").then(function(data) {
          // If we are able to successfully scrape the NYTIMES and compare the articles to those
          // already in our collection, re render the articles on the page
          // and let the user know how many unique articles we were able to save
          initPage();
          bootbox.alert($("<h3 class='text-center m-top-80'>").text(data.message));
        });
      }

      function handleArticleClear() {
        console.log("Clear front end");
        $.get("api/clear").then(function() {
          articleContainer.empty();
          initPage();
        });
      }
  });
  