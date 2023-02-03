const $noteTitle = $('.note-title');
const $noteText = $('.note-textarea');
const $noteMarkdown = $('.markdown');
const $saveNoteBtn = $('.save-note');
const $newNoteBtn = $('.new-note');
const $noteList = $('.notes-list');
const $signInBtn = $('.sign-in');
const $signUpBtn = $('.sign-up');
const $username = $('.username');
const $password = $('.password');
const $responseMessage = $('.response-message');
const $editBtn = $('.edit-btn');
const $getStartedBtn = $('.get-started-btn');
const $timeDisplay = $('.time');
const $updateBtn = $('.save-edit');

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

function markdown(text) {
	const converter = new showdown.Converter();
	return converter.makeHtml(text);
}

$.prototype.showThisHideOther = function (...elements) {
	this.show('fast');
	for (let element of elements) {
		element.hide('fast');
	}
};
$.prototype.hideThisShowOther = function (...elements) {
	this.hide('fast');
	for (let element of elements) {
		element.show('fast');
	}
};

// A function for getting all notes from the db
const getNotes = function () {
	return $.ajax({
		url: '/api/notes/',
		method: 'GET'
	});
};

// A function for saving a note to the db
const saveNote = function (note) {
	return $.ajax({
		url: '/api/notes/',
		data: note,
		method: 'POST'
	});
};

// A function for deleting a note from the db
const deleteNote = function (id) {
	return $.ajax({
		url: 'api/notes/' + id,
		method: 'DELETE'
	});
};

// If there is an activeNote, display it, otherwise render empty inputs
const renderActiveNote = function () {
	const convertedText = markdown(activeNote.body);

	if (activeNote.id) {
		$noteMarkdown.show();
		$noteText.hide();
		$editBtn.show('fast');
		$noteTitle.attr('readonly', true);
		$noteText.attr('readonly', true);
		$noteTitle.val(activeNote.title);
		$noteText.val(activeNote.body);
		$noteMarkdown.html(convertedText);
		$timeDisplay.text(
			`Created: ${moment(activeNote.createdAt).format(
				'MMMM Do, YYYY hh:mm a'
			)}.`
		);
	} else {
		$noteTitle.attr('readonly', false);
		$noteText.attr('readonly', false);
		$noteTitle.val('');
		$noteText.val('');
	}
};

// Update notes
const updateNotes = (note) => {
	return $.ajax({
		url: `/api/notes/${activeNote.id}`,
		data: {
			title: note.title,
			body: note.body
		},
		method: 'PUT'
	});
};

// Get the note data from the inputs, save it to the db and update the view
const handleNoteSave = function () {
	let newNote = {
		title: $noteTitle.val(),
		body: $noteText.val()
	};

	saveNote(newNote).then(function () {
		getAndRenderNotes();
		renderActiveNote();
	});
};
const handleNoteUpdate = () => {
	let newNote = {
		title: $noteTitle.val(),
		body: $noteText.val()
	};
	updateNotes(newNote).then(function () {
		getAndRenderNotes();
		renderActiveNote();
	});
};

// Delete the clicked note
const handleNoteDelete = function (event) {
	// prevents the click listener for the list from being called when the button inside of it is clicked
	event.stopPropagation();

	let note = $(this).parent('.list-group-item').data();

	deleteNote(note.id).then(function () {
		getAndRenderNotes();
		renderActiveNote();
	});
};

// Sets the activeNote and displays it
const handleNoteView = function () {
	$editBtn.show('fast');
	activeNote = $(this).data();
	renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = function () {
	$editBtn.hide('fast');
	$noteMarkdown.hide();
	$noteText.show();

	activeNote = {};
	renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
// Moojig's addition: now also handles update button and changes depending on read-only state
const handleRenderSaveBtn = function () {
	const empty = () => {
		if ($noteTitle.val() === '' || $noteText.val() === '') return true;
		else return false;
	};
	const readOnly = () => {
		if (!!$noteTitle.attr('readonly') || !!$noteText.attr('readonly'))
			return true;
		else return false;
	};
	const newNote = () => {
		if (activeNote.id) return false;
		else return true;
	};

	if (readOnly() || empty()) {
		$saveNoteBtn.hide('fast');
		$updateBtn.hide('fast');
	} else if (!readOnly() && !empty()) {
		if (newNote()) {
			// $saveNoteBtn.show();
			$saveNoteBtn.showThisHideOther($updateBtn);
		} else {
			// $updateBtn.show();
			$updateBtn.showThisHideOther($saveNoteBtn);
		}
	}
};
$(document).on('click', 'button', handleRenderSaveBtn);

const handleEditNote = () => {
	updatedNote = {
		id: activeNote.id,
		title: $noteTitle.val(),
		body: $noteText.val(),
		publish_at: activeNote.publish_at
	};
	activeNote = updatedNote;
	$noteMarkdown.hide();
	$noteText.show();
	$noteTitle.attr('readonly', false).show();
	$noteText.attr('readonly', false);

	$editBtn.hide('fast');
};

// Render's the list of note titles
const renderNoteList = function (notes) {
	$noteList.empty();
	const noteListItems = [];

	for (let i = 0; i < notes.length; i++) {
		let note = notes[i];

		let $li = $(
			"<button class='list-group-item list-group-item-action'>"
		).data(note);
		let $span = $('<span>').text(note.title);
		let $delBtn = `<button class='btn btn-primary delete-note'><i class='fas fa-trash-alt float-right text-danger'></i></button>`;

		$li.append($span, $delBtn);
		noteListItems.push($li);
	}
	$noteList.append(noteListItems);
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = function () {
	return getNotes().then(function (data) {
		console.log(data);
		renderNoteList(data);
	});
};

const $logOutBtn = $('.log-out');
const logOut = () => {
	sessionStorage.setItem('user_id', null);
	sessionStorage.setItem('username', null);
	if (window.location.pathname !== '/index.html')
		window.open('/index.html', '_self');
};

$logOutBtn.on('click', logOut);
$saveNoteBtn.on('click', handleNoteSave);
$noteList.on('click', '.list-group-item', handleNoteView);
$newNoteBtn.on('click', handleNewNoteView);
$noteTitle.on('keyup', handleRenderSaveBtn);
$noteText.on('keyup', handleRenderSaveBtn);
$updateBtn.on('click', handleNoteUpdate);
$(document).on('click', '.delete-note', handleNoteDelete);
$('.password').keypress(function (event) {
	let keycode = event.keyCode ? event.keyCode : event.which;
	if (keycode == '13') {
		signIn();
	}
});
$editBtn.on('click', handleEditNote);

// Gets and renders the initial list of notes
getAndRenderNotes();
