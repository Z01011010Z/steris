module.exports = function (pane, day) {
    let module = {};

    // For displau
    const blessed = require('blessed');
    const contrib = require('blessed-contrib');

    // For db
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync('db.json')
    const db = low(adapter)

    let notes = blessed.box({
        parent: pane,
        name: 'text',
        tags: true,
        mouse: true,
        keys: true,
        vi: true,       
        scrollable: true,
        border: {
            type: 'line',
            fg: 'lightcyan',
        },
        style: {
            bg: "normal",
            fg: "normal",
            focus: { border: { fg: "cyan" } },
            label: { fg: 'white', }
        },
        scrollbar: {
            track: { bg: 'yellow', },
            style: { bg: 'lightblack', },
        },
        label: {
            text: 'Notes',
            side: 'left',
        },
        position: {
            bottom: 0,
            left: 0,
            height: '40%-1',
            width: '100%-2',
        }
    });

    let selectNote = blessed.list({
        parent: notes,
        tags: true,
        mouse: true,
        keys: true,
        vi: true,
        scrolling: true,
        align: "center",
        valign: "middle",
        search: true,
        border: {
            type: 'line',
            fg: 'lightcyan',
        },
        position: {
            top: 0,
            left: 0,
            height: '100%-2',
            width: '25%',
        },
        label: {
            'text': 'Select note',
            'side': 'left',
        },
        scrollbar: {
            track: { bg: 'yellow', },
            style: { bg: 'lightblack', },
        },
        style: {
            selected: {
                bold: true,
                fg: 'blue',
                bg: 'black',
            },
            item: {
                fg: 'normal',
                bg: 'normal',
            },
            label: { fg: 'white' },
            focus: { border: { fg: 'cyan' }},
        },
        items: [],
    });

    selectNote.on('select', () => {

        let pinned = db.get('pinned.notes').value();
        let note = 'NULL';

        // Se seleccion un pinned
        if(selectNote.selected + 1 <= pinned.length) {
            note = db.get('pinned.notes').value()[selectNote.selected]
        } else { // se selecciono uno regular
            note = day.get('notes').value()[selectNote.selected - pinned.length]
        }

        let title = selectNote.getItem(selectNote.selected).content;
        noteText.setMarkdown(note.text);
        noteText.setLabel(note.title);
        pane.screen.render();
    })

    let noteText = contrib.markdown({
        parent: notes,
        tags: true,
        mouse: true,
        keys: true,
        vi: true, 
        scrollable: true,
        border: {
            type: 'line',
            fg: 'lightcyan',
        },
        label: "Note",
        style: {
            bg: "normal",
            fg: "normal",
            focus: { border: { fg: "cyan" } },
            label: { fg: 'white', }
        },
        scrollbar: {
            track: { bg: 'yellow', },
            style: { bg: 'lightblack', },
        },
        position: {
            top: 0,
            left: '25%',
            width: '55%-1',
            height: '100%-2',
        },
    })
    noteText.setMarkdown('# Hello \n **blessed-contrib** renders markdown using `marked-terminal`')

    let noteControl = blessed.form({
        parent: notes,
        tags: true,
        mouse: true,
        keys: true,
        vi: true,
        border: {
            type: 'line',
            fg: 'lightcyan',
        },
        position: {
            top: 0,
            right: 0,
            height: '100%-2',
            width: '20%',
        },
        label: {
            'text': 'Controls',
            'side': 'left',
        },
        style: {
            bg: "normal",
            fg: "normal",
            focus: { border: { fg: "cyan" } },
            label: { fg: 'white', }
        },
    });

    let editNote = blessed.button({
        parent: noteControl,
        mouse: true,
        keys: true,
        shrink: true,
        padding: {
            left: 1,
            right: 1
        },
        content: 'Edit note',
        border: {
            type: 'line',
            fg: 'cyan',
        },
        position: {
            top: '15%',
            left: 'center',
            width: 'shrink',
            height: 3,
        },
        style: {
            fg: 'blue',
            bg: 'normal',
            focus: { bg: 'lightblack' },
            hover: { bg: 'lightblack' },
        }
    });

    editNote.on('press', function() {
    });

    let newNote = blessed.button({
        parent: noteControl,
        mouse: true,
        keys: true,
        shrink: true,
        padding: {
            left: 1,
            right: 1
        },
        content: 'Create new note',
        border: {
            type: 'line',
            fg: 'cyan',
        },
        position: {
            top: '40%',
            left: 'center',
            width: 'shrink',
            height: 3,
        },
        style: {
            fg: 'blue',
            bg: 'normal',
            focus: { bg: 'lightblack' },
            hover: { bg: 'lightblack' },
        }
    });

    newNote.on('press', function() {
        newNoteForm.show();
        saveNewNote.show();
        cancelNewNote.show();
        newNotePinned.show();

        noteText.hide();
        editNote.hide();
        pinNote.hide();
        newNote.hide();

        pane.screen.render()
    });

    let saveNewNote = blessed.button({
        hidden: true,
        parent: noteControl,
        mouse: true,
        keys: true,
        shrink: true,
        padding: {
            left: 1,
            right: 1
        },
        content: 'Save new note',
        border: {
            type: 'line',
            fg: 'green',
        },
        position: {
            top: '25%-2',
            left: 'center',
            width: 'shrink',
            height: 3,
        },
        style: {
            fg: 'blue',
            bg: 'normal',
            focus: { bg: 'lightblack' },
            hover: { bg: 'lightblack' },
        }
    });
    saveNewNote.on('press', function() {
        noteText.show();
        editNote.show();
        pinNote.show();
        newNote.show();

        newNoteForm.hide();
        saveNewNote.hide();
        cancelNewNote.hide();
        newNotePinned.hide();

        if(newNotePinned.checked){
            db.get('pinned.notes')
                .push({
                    title: newNoteTittle.getValue(),
                    text: newNoteText.getValue(),
                })
                .write()
        } else {
            day.get('notes')
                .push({
                    title: newNoteTittle.getValue(),
                    text: newNoteText.getValue(),
                })
                .write()
        }

        module.updateNotes();

        pane.screen.render()
    });

    let cancelNewNote = blessed.button({
        hidden: true,
        parent: noteControl,
        mouse: true,
        keys: true,
        shrink: true,
        padding: {
            left: 1,
            right: 1
        },
        content: 'Cancel new note',
        border: {
            type: 'line',
            fg: 'red',
        },
        position: {
            top: '50%-2',
            left: 'center',
            width: 'shrink',
            height: 3,
        },
        style: {
            fg: 'blue',
            bg: 'normal',
            focus: { bg: 'lightblack' },
            hover: { bg: 'lightblack' },
        }
    });
    cancelNewNote.on('press', function() {
        noteText.show();
        editNote.show();
        pinNote.show();
        newNote.show();

        newNoteForm.hide();
        saveNewNote.hide();
        cancelNewNote.hide();

        pane.screen.render()
    });

    let newNotePinned = blessed.checkbox({
        hidden: true,
        parent: noteControl,
        mouse: true,
        content: 'Pinned',
        checked: false,
        position: {
            top: '75%-1',
            left: 'center',
            width: 'shrink',
            height: 1,
        },
        style: {
            fg: 'yellow',
            bg: 'black',
            focus: { bg: 'lightblack' },
            hover: { bg: 'lightblack' },
        }
    });

    let newNoteForm = blessed.box({
        hidden: true,
        parent: notes,
        position: {
            top: 0,
            left: '25%',
            width: '55%-1',
            height: '100%-2',
        },
    });

    let newNoteTittle = blessed.Textbox({
        parent: newNoteForm,
        mouse: true,
        inputOnFocus: true,
        input: true,
        border: {
            type: 'line',
            fg: 'cyan',
        },
        label: {
            'text': 'New note tittle',
            'side': 'left',
        },
        position: {
            top: 0,
            left: 0,
            width: '100%',
            height: 3,
        },
        style: {
            label: { fg: 'magenta' },
            focus: { bg: 'lightblack', },
            hover: { bg: 'lightblack' },
        }
    })

    let newNoteText = blessed.Textarea({
        parent: newNoteForm,
        mouse: true,
        inputOnFocus: true,
        input: true,
        border: {
            type: 'line',
            fg: 'cyan',
        },
        position: {
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%-3',
        },
        label: {
            'text': 'New note text',
            'side': 'left',
        },
        style: {
            label: { fg: 'magenta' },
            focus: { bg: 'lightblack', },
            hover: { bg: 'lightblack' },
        }
    });

    let pinNote = blessed.checkbox({
        parent: noteControl,
        mouse: true,
        content: 'Pin note',
        name: 'checkbox',
        position: {
            top: '70%',
            left: 'center',
            width: 'shrink',
            height: 1,
        },
        style: {
            fg: 'yellow',
            bg: 'normal',
            focus: { bg: 'lightblack' },
            hover: { bg: 'lightblack' },
        }
    });

    let notesTitles = [];
    module.updateNotes = function () {
        let pinnedNotesData = db.get('pinned.notes').value();
        let notesData = day.get('notes').value();

        let titles = []
        for (let i = 0; i < pinnedNotesData.length; i++) {
            let title = pinnedNotesData[i].title;
            title = `{yellow-fg}${title}{/}`;
            titles.push(title)
        }
        for (let i = 0; i < notesData.length; i++) {
            let title = notesData[i].title;
            titles.push(title)
        }
        selectNote.clearItems();
        selectNote.setItems(titles);
    }

    return module;
}
