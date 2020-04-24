const $noteTitle = $(".note-title");
const $noteText = $(".note-textarea");
const $saveNoteBtn = $(".save-note");
const $newNoteBtn = $(".new-note");
const $noteList = $(".notes-list");
const $clearBtn = $(".clear-note")
const $signInBtn = $(".sign-in");
const $signUpBtn = $(".sign-up");
const $username = $(".username");
const $password = $(".password");
const $responseMessage = $(".response-message");
const $editBtn = $(".edit-btn");
const $getStartedBtn = $('.get-started-btn')
const $timeDisplay = $('.time');
const $saveEditBtn = $('.save-edit');

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

// the following is my very beginner attempt at creating a user session
const storedUserID = parseInt(sessionStorage.getItem("user_id"));
const storedUsername = sessionStorage.getItem("username");
// keeps track of current user
let sessionUserID = storedUserID ? storedUserID : null;
let sessionUsername = storedUsername ? storedUsername : null;

const getStarted = () => {
  const [$jumbotron, $loginCard] = [$('.jumbotron').parent(), $('.login-card')];
  // Make the jumbo smaller, have the card appear, and remove btn 
  if (sessionUserID === storedUserID && window.location.pathname !== '/notes.html') {
    window.open('./notes.html', '_self');
  } else {
    $jumbotron.animate({
      maxWidth: "calc(100% * 2 / 3)",
    }, 400)
    $loginCard.show(400);
    $getStartedBtn.hide(600);
  }
}

const signUp = async () => {
  const res = await $.ajax({
    url: "/signup",
    data: {
      username: $username.val(),
      password: $password.val()
    },
    method: "POST"
  });
  if (!res.succeeded) {
    $responseMessage.text(res.message).attr("style", "background: red; color: white;"); 
    return;
  } else {
    sessionStorage.setItem("user_id", res.user_id);
    sessionStorage.setItem("username", res.username);
    $responseMessage.text(res.message).attr("style", "background: lightgreen; color: white;"); 
    window.open('/notes.html', "_self");
  }
}

const signIn = async () => {
  if (!$username.val() || !$password.val()) return $responseMessage.text('Missing username and/or password.').attr("style", "background: red; color: white;");;
  
  const res = await $.ajax({
    url: "/login",
    data: {
      username: $username.val(),
      password: $password.val()
    },
    method: "POST"
  });
  if (res.succeeded) {
    const { user_id } = res;
    sessionStorage.setItem("user_id", user_id);
    sessionStorage.setItem("username", res.username);
    window.open('/notes.html', "_self");
  } else {
    $responseMessage.text(res.message).attr("style", "background: red; color: white;"); 
  }
}

// A function for getting all notes from the db
const getNotes = function() {
  return $.ajax({
    url: "/api/notes/user/" + sessionUserID,
    method: "GET"
  });
};

// A function for saving a note to the db
const saveNote = function(note) {
  return $.ajax({
    url: "/api/notes/",
    data: note,
    method: "POST"
  });
};

// A function for deleting a note from the db
const deleteNote = function(id) {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE"
  });
};



// If there is an activeNote, display it, otherwise render empty inputs
const renderActiveNote = function() {
  $saveNoteBtn.hide();
  $saveEditBtn.hide();
  // $timeDisplay.attr("style", "margin: 0");

  if (activeNote.id) {
    $clearBtn.addClass('display-none');
    $editBtn.removeClass('display-none');
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.post_title);
    $noteText.val(activeNote.body);
    $timeDisplay.text(`Created: ${moment(activeNote.publish_at).format('MMMM Do, YYYY hh:mm a')}.`);
  } else {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    $noteTitle.val("");
    $noteText.val("");
  }
};

// Edit notes
const editNote = (note) => {
  $saveEditBtn.show('fast');

  if (activeNote.id) {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
  }

  return $.ajax({
    url: `/api/notes/${activeNote.id}`,
    data: note,
    method: 'POST'
  });
}

// Get the note data from the inputs, save it to the db and update the view
const handleNoteSave = function() {
  let newNote = {
    user_id: sessionUserID,
    post_title: $noteTitle.val(),
    body: $noteText.val()
  };

  saveNote(newNote).then(function(newNote) {
    getAndRenderNotes();
    renderActiveNote();
  });
};
const handleNoteUpdate = () => {
  let newNote = {
    user_id: sessionUserID,
    post_title: $noteTitle.val(),
    body: $noteText.val()
  };
  editNote(newNote).then(function() {
    getAndRenderNotes();
    renderActiveNote();
  });
}

// Delete the clicked note
const handleNoteDelete = function(event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  let note = $(this)
    .parent('.list-group-item')
    .data();
  // if (activeNote.id === note.id) {
  //   activeNote = note;
  // }

  deleteNote(note.id).then(function() {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = function() {
  activeNote = $(this).data();
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = function() {
  activeNote = {};
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
const handleRenderSaveBtn = function() {
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) {
    $saveNoteBtn.hide();
    $saveEditBtn.hide();
  } else {
    $saveNoteBtn.show();
  }
};

// Render's the list of note titles
const renderNoteList = function(notes) {
  $noteList.empty();
  $('.notes-list-container').find('.card-header').text(`${sessionUsername}'s notes: (All)`);

  const noteListItems = [];

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];

    let $li = $("<button class='list-group-item list-group-item-action'>").data(note);
    let $span = $("<span>").text(note.post_title);
    let $delBtn =`<button class='btn btn-primary delete-note'><i class='fas fa-trash-alt float-right text-danger'></i></button>`;

    $li.append($span, $delBtn);
    noteListItems.push($li);
  }
  $noteList.append(noteListItems);
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = function() {
  return getNotes().then(function(data) {
    renderNoteList(data);
  });
};

const clearNote = () => {
  $noteTitle.val(''); 
  $noteText.val('');
}
const $logOutBtn = $('.log-out'); 
const logOut = () => {
  sessionStorage.setItem('user_id', null);
  sessionStorage.setItem('username', null);
  if (window.location.pathname !== '/index.html') window.open('/index.html', '_self');
}

$logOutBtn.on("click", logOut);
$getStartedBtn.on("click", getStarted);
$saveNoteBtn.on("click", handleNoteSave);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);
$clearBtn.on("click", clearNote);
$editBtn.on("click", editNote);
$saveEditBtn.on("click", handleNoteUpdate);
$signUpBtn.on("click", signUp);
$signInBtn.on("click", signIn);
$(document).on("click", ".delete-note", handleNoteDelete);
$(".password").keypress(function(event){
  let keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == '13'){
      signIn(); 
  }
});


// Gets and renders the initial list of notes
getAndRenderNotes();
