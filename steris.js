const blessed = require('neo-blessed');
const contrib = require('blessed-contrib');
const moment = require('moment');
const _ = require('lodash');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

let y = '2019';
let m = '01';
let d = '02';

db.defaults({
    [y]: {
        [m]: {
            [d]: {
                "todos": [],
                "activities": [],
                "lists": [],
                "notes": [],
            }
        }
    },
    "pinned": {
        "todos": [],
        "activities": [],
        "lists": [],
        "notes": [],
    },
}).write();

let td = {
    [y]: {
        [m]: {
            [d]: {
                "todos": [],
                "activities": [],
                "lists": [],
                "notes": [],
            }
        }
    }
}

// Si no tiene el año
if(!db.has(`${y}`).value()){
    console.log('El año no existe')
    db.assign(td).write();
}

// Si no tiene el mes
if(!db.has(`${y}.${m}`).value()){
    console.log('El mes no existe')
    db.get(`${y}`).assign(td[y]).write();
}

// Si no tiene el dia
if(!db.has(`${y}.${m}.${d}`).value()){
    console.log('El dia no existe')
    db.get(`${y}.${m}`).assign(td[y][m]).write();
}

let day = db.get(`${y}.${m}.${d}`);

let screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
    ignoreDockContrast: false,
    autoPadding: true,
    resizeTimeout: 100,
    sendFocus: true,
});

let topbar = blessed.box({
    parent: screen,
    position: {
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
    },
});

let menu = blessed.Listbar({
    parent: topbar,
    shrink: true,
    mouse: true,
    keys: true,
    vi: true,
    align: "center",
    valign: "middle",
    name: 'text',
    border: {
        type: 'line',
        fg: 'lightcyan',
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
    label: {
        text: 'Menu',
        side: 'left',
    },
    position: {
        top: 0,
        left: 0,
        width: '85%',
        height: 3,
    },
    items: {
        'Daily': () => {
        },
        'Monthly': () => {
        },
    },
});

let date = blessed.text({
    parent: topbar,
    tags: true,
    align: 'center',
    content: moment().format("YYYY-MM-DD"),
    border: {
        type: 'line',
        fg: 'lightcyan',
    },
    style: {
        bold: true,
        bg: "normal",
        fg: "normal",
        label: { fg: 'white', }
    },
    label: {
        text: 'Date',
        side: 'left',
    },
    position: {
        top: 0,
        right: 0,
        width: '15%',
        height: 3,
    },
});

let daily = blessed.box({
    parent: topbar,
    label: {
        'text': 'Daily Planner',
        'side': 'left',
    },
    border: {
        type: 'line',
        fg: 'cyan',
    },
    style: {
        label: { fg: 'white', }
    },
    position: {
        top: 3,
        left: 0,
        width: '100%',
        height: screen.height - 3,
    },
});

let todosPane = blessed.box({
    parent: daily,
    name: 'text',
    tags: true, // Enable tags (bold, colors, etc) for text
    mouse: true,       // For scrolling
    keys: true,        // For scrolling
    vi: true,          // For scrolling
    scrollable: true,  // For scrolling
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
    position: {
        top: 0,
        left: 0,
        height: '60%',
        width: '32%',
    },
    label: {
        text: 'TODOs',
        side: 'left',
    },
});
let addNewCB = blessed.text({
    hidden: true,
})
let newCB = blessed.Textbox({
    hidden: true,
});

let todosCB = [];
function updateTodos() {
    let pinnedTodosData = db.get('pinned.todos').value();
    let currentPinned = day.get('todos').filter(['pinned', true]).value();
    let todosData = day.get('todos').value();

    let todoObj = {
        parent: todosPane,
        tags: true,
        mouse: true,
        width: '100%-3',
        height: 1,
        left: 1,
        style: {
            bg: 'normal',
            focus: { bg: 'lightblack' },
            hover: { bg: 'lightblack' },
        }
    }

    // Si ya tiene los pinned checkbox
    if(currentPinned.length > 0) {
        for (let i = currentPinned.length - 1; i >= 0; i--) {
            // Eliminar todos aquellos que no esten en la lista general de pinned
            if(currentPinned[i].text != pinnedTodosData[i].text) {
                todosData.splice(i, 1);
            }
        }
    } else {
        // De no tenerlos agregarlos
        day.get('todos')
            .unshift(...pinnedTodosData)
            .write()
        // todosData = _.concat(pinnedTodosData, todosData);
    }

    todosCB = [];
    for (var i = 0; i < todosData.length; i++) {
        todosCB[i] = blessed.checkbox({
            ...todoObj,
            content: todosData[i].text,
            checked: todosData[i].done,
            top: i,
            style: {
                fg: (todosData[i].pinned ? 'yellow' : 'blue'),
            }
        });

        todosCB[i].on("check", function() {
            day.get('todos').find(["text", this.text]).assign({"done": true}).write();
        });

        todosCB[i].on("uncheck", function() {
            day.get('todos').find(["text", this.text]).assign({"done": false}).write();
        });
    }
    addNewCB = blessed.text({
        parent: todosPane,
        content: '[ ] ',
        fg: 'magenta',
        position: {
            top: i,
            left: 1,
            width: 'shrink',
            height: 1,
        },
    })
    newCB = blessed.Textbox({
        parent: todosPane,
        mouse: true,
        inputOnFocus: true,
        input: true,
        position: {
            top: i,
            left: 5,
            width: '100%-8',
            height: 1,
        },
        style: {
            fg: 'blue',
            bg: 'black',
            focus: {
                bg: 'lightblack',
            },
            hover: { bg: 'lightblack' },
        }
    });
    newCB.on('submit', (data) => {
        day.get('todos')
            .push({
                done: false,
                pinned: false,
                text: data,
            })
            .write()
        updateTodos();
    });
}
updateTodos();

let activitiesPane = blessed.box({
    parent: daily,
    name: 'text',
    tags: true, // Enable tags (bold, colors, etc) for text
    mouse: true,       // For scrolling
    keys: true,        // For scrolling
    vi: true,          // For scrolling
    scrollable: true,  // For scrolling
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
        left: '32%',
        height: '60%',
        width: '36%',
    },
});
let activitiesTable = blessed.ListTable({
    parent: activitiesPane,
    tags: true,
    mouse: true,
    keys: true,
    vi: true,
    align: "center",
    valign: "middle",
    name: 'listTable',
    search: true,
    interactive: true,
    noCellBorder: false,
    border: {
        type: 'line',
        fg: 'lightcyan',
    },
    position: {
        top: 0,
        left: 0,
        height: '80%',
        width: '100%',
    },
    label: {
        'text': 'Activities',
        'side': 'left',
    },
    style: {
        bg: "normal",
        fg: "normal",
        border: {
            type: 'line',
            fg: 'lightcyan',
        },
        label: { fg: 'white' },
        header: {
            bold: true,
            underline: true,
            fg: 'blue',
        },
        cell: {
            fg: 'normal',
            bg: 'normal',
            selected: {
                bold: true,
                fg: 'blue',
                bg: 'black',
            },
            item: {
                fg: 'normal',
                bg: 'normal',
            },
        },
        focus: { border: { fg: 'cyan' },
        },
    },
    data: [],
});
let activitiesControls = blessed.box({
    parent: activitiesPane,
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
    label: {
        text: 'Controls',
        side: 'left',
    },
    position: {
        bottom: 0,
        left: 0,
        height: '25%',
        width: '100%',
    },
});

let newActivity = blessed.button({
    parent: activitiesControls,
    mouse: true,
    keys: true,
    shrink: true,
    padding: {
        left: 1,
        right: 1
    },
    content: 'New activity',
    border: {
        type: 'line',
        fg: 'cyan',
    },
    position: {
        top: 'center',
        left: 1,
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

newActivity.on('press', function() {
    newActivityForm.show();
    screen.render()
});

let newActivityForm = blessed.box({
    hidden: true,
    parent: screen,
    tags: true,
    mouse: true,
    keys: true,
    vi: true,
    border: {
        type: 'line',
        fg: 'lightcyan',
    },
    position: {
        top: 'center',
        left: 'center',
        height: '45%',
        width: '30%',
    },
    label: {
        'text': 'New Activity',
        'side': 'left',
    },
    style: {
        bg: "black",
        fg: "normal",
        focus: { border: { fg: "cyan" } },
        label: { fg: 'white', }
    },
});

let newActivityText = blessed.Textbox({
    parent: newActivityForm,
    mouse: true,
    inputOnFocus: true,
    input: true,
    position: {
        top: 1,
        left: 1,
        width: '100%-4',
        height: 3,
    },
    border: {
        type: 'line',
        fg: 'lightcyan',
        bg: 'black',
    },
    label: {
        'text': 'Description',
        'side': 'left',
    },
    style: {
        label: { bg: 'black' },
        focus: { bg: 'lightblack', },
        hover: { bg: 'lightblack' },
    }
});
let hours = [];
for (let i = 1; i <= 12; i++) {
    hours.push(i < 10 ? ' ' + i : i + '');
}
let mins = [];
for (let i = 0; i <= 60; i++) {
    mins.push(i < 10 ? '0' + i : i + '');
}

let newActivityStart = blessed.box({
    parent: newActivityForm,
    position: {
        top: '30%',
        left: '25%-9',
        width: 18,
        height: 5,
    },
    border: {
        type: 'line',
        fg: 'lightcyan',
        bg: 'black',
    },
    label: {
        'text': 'Start time',
        'side': 'left',
    },
    style: { label: { bg: 'black' }, }
})

let newActivityStartHour = blessed.list({
    parent: newActivityStart,
    mouse: true,
    keys: true,
    vi: true,
    scrolling: true,
    align: "center",
    search: true,
    position: {
        top: 0,
        left: 0,
        height: 3,
        width: 4,
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
    },
    items: [],
});
newActivityStartHour.setItems(hours)
let newActivityStartHourSep = blessed.line({
    parent: newActivityStart,
    orientation: 'vertical',
    style: {
        fg: 'lightcyan'
    },
    position: {
        top: 0,
        left: 4,
        height: 3,
        width: 1,
    },
});

let newActivityStartMin = blessed.list({
    parent: newActivityStart,
    mouse: true,
    keys: true,
    vi: true,
    scrolling: true,
    align: "center",
    search: true,
    position: {
        top: 0,
        left: 6,
        height: 3,
        width: 4,
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
    },
    items: [],
});
newActivityStartMin.setItems(mins)
let newActivityStartMinSep = blessed.line({
    parent: newActivityStart,
    orientation: 'vertical',
    style: {
        fg: 'lightcyan'
    },
    position: {
        top: 0,
        left: 11,
        height: 3,
        width: 1,
    },
});
let newActivityStartPeriod = blessed.list({
    parent: newActivityStart,
    mouse: true,
    keys: true,
    vi: true,
    scrolling: true,
    align: "center",
    search: true,
    position: {
        top: 0,
        right: 0,
        height: 3,
        width: 4,
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
    },
    items: ['am', 'pm'],
});

let newActivityEnd = blessed.box({
    parent: newActivityForm,
    position: {
        top: '30%',
        left: '50%+9',
        width: 18,
        height: 5,
    },
    border: {
        type: 'line',
        fg: 'lightcyan',
        bg: 'black',
    },
    label: {
        'text': 'End time',
        'side': 'left',
    },
    style: { label: { bg: 'black' }, }
})

let newActivityEndHour = blessed.list({
    parent: newActivityEnd,
    mouse: true,
    keys: true,
    vi: true,
    scrolling: true,
    align: "center",
    search: true,
    position: {
        top: 0,
        left: 0,
        height: 3,
        width: 4,
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
    },
    items: [],
});
newActivityEndHour.setItems(hours)
let newActivityEndHourSep = blessed.line({
    parent: newActivityEnd,
    orientation: 'vertical',
    style: {
        fg: 'lightcyan'
    },
    position: {
        top: 0,
        left: 4,
        height: 3,
        width: 1,
    },
});

let newActivityEndMin = blessed.list({
    parent: newActivityEnd,
    mouse: true,
    keys: true,
    vi: true,
    scrolling: true,
    align: "center",
    search: true,
    position: {
        top: 0,
        left: 6,
        height: 3,
        width: 4,
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
    },
    items: [],
});
newActivityEndMin.setItems(mins)
let newActivityEndMinSep = blessed.line({
    parent: newActivityEnd,
    orientation: 'vertical',
    style: {
        fg: 'lightcyan'
    },
    position: {
        top: 0,
        left: 11,
        height: 3,
        width: 1,
    },
});
let newActivityEndPeriod = blessed.list({
    parent: newActivityEnd,
    mouse: true,
    keys: true,
    vi: true,
    scrolling: true,
    align: "center",
    search: true,
    position: {
        top: 0,
        right: 0,
        height: 3,
        width: 4,
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
    },
    items: ['am', 'pm'],
});

let newActivityPinned = blessed.checkbox({
    parent: newActivityForm,
    mouse: true,
    content: 'Pinned',
    checked: false,
    position: {
        top: '60%',
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

let saveNewActivity = blessed.button({
    parent: newActivityForm,
    mouse: true,
    keys: true,
    shrink: true,
    padding: {
        left: 1,
        right: 1
    },
    content: 'Save',
    border: {
        type: 'line',
        fg: 'green',
        bg: 'black',
    },
    position: {
        bottom: 1,
        left: '25%-4',
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
saveNewActivity.on('press', () => {

    let sh = newActivityStartHour.getItem(newActivityStartHour.selected).content
    let sm = newActivityStartMin.getItem(newActivityStartMin.selected).content
    let sp = newActivityStartPeriod.selected == 0 ? 'am' : 'pm'

    let eh = newActivityEndHour.getItem(newActivityEndHour.selected).content
    let em = newActivityEndMin.getItem(newActivityEndMin.selected).content
    let ep = newActivityEndPeriod.selected == 0 ? 'am' : 'pm'

    if(newActivityPinned.checked) {
        db.get('pinned.activities')
            .push({
                start: `${sh}:${sm} ${sp}`,
                end: `${eh}:${em} ${ep}`,
                text: newActivityText.getValue(),
            })
            .write()
    } else {
        day.get('activities')
            .push({
                start: `${sh}:${sm} ${sp}`,
                end: `${eh}:${em} ${ep}`,
                text: newActivityText.getValue(),
            })
            .write()
    }

    updateActivities();
    // resetNewActivityForm();
    newActivityForm.hide();
});

let cancelNewActivity = blessed.button({
    parent: newActivityForm,
    mouse: true,
    keys: true,
    shrink: true,
    padding: {
        left: 1,
        right: 1
    },
    content: 'Cancel',
    border: {
        type: 'line',
        fg: 'red',
        bg: 'black',
    },
    position: {
        bottom: 1,
        left: '50%+5',
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
cancelNewActivity.on('press', function() {
    newActivityForm.hide();
    // resetNewActivityForm();
    screen.render();
});

function updateActivities() {
    let pinnedActivitiesData = db.get('pinned.activities').value();
    let activitiesData = day.get('activities').value();

    let content = [['Start', 'End', 'Activity']]

    for (let i = 0; i < pinnedActivitiesData.length; i++) {
        content.push([
            `{yellow-fg}${pinnedActivitiesData[i].start}{/}`,
            `{yellow-fg}${pinnedActivitiesData[i].end}{/}`,
            `{yellow-fg}${pinnedActivitiesData[i].text}{/}`
        ]);
    }
    for (let i = 0; i < activitiesData.length; i++) {
        content.push([
            activitiesData[i].start,
            activitiesData[i].end,
            activitiesData[i].text
        ]);
    }

    activitiesTable.setData(content);
}
updateActivities();

let listPane = blessed.box({
    parent: daily,
    position: {
        top: 0,
        right: 0,
        height: '60%',
        width: '32%',
    },
});

let lists = blessed.box({
    parent: listPane,
    name: 'text',
    tags: true, // Enable tags (bold, colors, etc) for text
    mouse: true,       // For scrolling
    keys: true,        // For scrolling
    vi: true,          // For scrolling
    scrollable: true,  // For scrolling
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
        text: 'Lists',
        side: 'left',
    },
    position: {
        top: 0,
        right: 0,
        height: '85%',
        width: '100%',
    },
});

let listControls = blessed.form({
    parent: listPane,
    name: 'text',
    tags: true, // Enable tags (bold, colors, etc) for text
    mouse: true,       // For scrolling
    keys: true,        // For scrolling
    vi: true,          // For scrolling
    scrollable: true,  // For scrolling
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
        text: 'Controls',
        side: 'left',
    },
    position: {
        bottom: 0,
        left: 0,
        height: '25%',
        width: '100%',
    },
});

let newList = blessed.button({
    parent: listControls,
    mouse: true,
    keys: true,
    shrink: true,
    padding: {
        left: 1,
        right: 1
    },
    content: 'New list',
    border: {
        type: 'line',
        fg: 'cyan',
    },
    position: {
        top: 'center',
        left: 1,
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

newList.on('press', function() {
    newListForm.show();
    screen.render()
});

let newListForm = blessed.form({
    hidden: true,
    parent: screen,
    tags: true,
    mouse: true,
    keys: true,
    vi: true,
    border: {
        type: 'line',
        fg: 'lightcyan',
    },
    position: {
        top: 'center',
        left: 'center',
        height: '70%',
        width: '40%',
    },
    label: {
        'text': 'New List',
        'side': 'left',
    },
    style: {
        bg: "black",
        fg: "normal",
        focus: { border: { fg: "cyan" } },
        label: { fg: 'white', }
    },
});

let newListTittle = blessed.Textbox({
    parent: newListForm,
    mouse: true,
    inputOnFocus: true,
    input: true,
    position: {
        top: 1,
        left: 1,
        width: '100%-4',
        height: 3,
    },
    border: {
        type: 'line',
        fg: 'lightcyan',
        bg: 'black',
    },
    label: {
        'text': 'Tittle',
        'side': 'left',
    },
    style: {
        label: { bg: 'black' },
        focus: { bg: 'lightblack', },
        hover: { bg: 'lightblack' },
    }
});

let newListElementsBox = blessed.box({
    parent: newListForm,
    mouse: true,
    inputOnFocus: true,
    input: true,
    position: {
        top: 4,
        left: 1,
        width: '100%-4',
        height: '100%-9',
    },
    border: {
        type: 'line',
        fg: 'lightcyan',
        bg: 'black',
    },
    label: {
        'text': 'Elements',
        'side': 'left',
    },
    style: {
        bg: 'black',
        label: { bg: 'black' },
    }
})

let newListElement = blessed.Textbox({
    parent: newListElementsBox,
    mouse: true,
    inputOnFocus: true,
    input: true,
    position: {
        top: 0,
        left: 5,
        width: '100%-7',
        height: 1,
    },
    style: {
        focus: { bg: 'lightblack', },
        hover: { bg: 'lightblack' },
    }
});

newListElement.on('submit', () => {
    newListElements.push(blessed.Textarea({
        parent: newListElementsBox,
        mouse: true,
        inputOnFocus: true,
        input: true,
        value: newListElement.getValue(),
        position: {
            top: newListElements.length,
            left: 5,
            width: '100%-7',
            height: 1,
        },
        style: {
            fg: 'blue',
            focus: { bg: 'lightblack', },
            hover: { bg: 'lightblack' },
        }
    }))

    let text = '';
    if(newListOrdered.checked){
        for (var i = 0; i < newListElements.length; i++) {
            text += `${i+1}. \n`
        }
        text += `{magenta-fg}${i+1}.{/} \n`
    } else {
        for (let i = 0; i < newListElements.length; i++) {
            text += ' * \n'
        }
        text += `{magenta-fg} *{/} \n`
    }

    newListElementsIndex.setContent(text)
    newListElement.clearValue();

    newListElement.position = {
        top: newListElements.length,
        left: 5,
        width: '100%-7',
        height: 1,
    };
    screen.render();
});

let newListElements = [];
let newListElementsIndex = blessed.text({
    parent: newListElementsBox,
    tags: true,
    content: '{magenta-fg}1. {/}',
    bold: true,
    position: {
        top: 0,
        left: 1,
        width: 4,
        height: '100%-2',
    },
    style: {
        fg: 'white',
        bg: 'black',
    }
})

let saveNewList = blessed.button({
    parent: newListForm,
    mouse: true,
    keys: true,
    shrink: true,
    padding: {
        left: 1,
        right: 1
    },
    content: 'Save',
    border: {
        type: 'line',
        fg: 'green',
        bg: 'black',
    },
    position: {
        bottom: 0,
        left: '20%-3',
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
saveNewList.on('press', () => {

    let data = []
    for (let i = 0; i < newListElements.length; i++) {
        data.push(newListElements[i].getValue())
    }

    if(newListPinned.checked){
        db.get('pinned.lists')
            .push({
                title: newListTittle.getValue(),
                ordered: newListOrdered.checked,
                data: data,
            })
            .write()
    } else {
        day.get('lists')
            .push({
                title: newListTittle.getValue(),
                ordered: newListOrdered.checked,
                data: data,
            })
            .write()
    }

    resetNewListForm();
    newListForm.hide();
    updateLists();
});

let cancelNewList = blessed.button({
    parent: newListForm,
    mouse: true,
    keys: true,
    shrink: true,
    padding: {
        left: 1,
        right: 1
    },
    content: 'Cancel',
    border: {
        type: 'line',
        fg: 'red',
        bg: 'black',
    },
    position: {
        bottom: 0,
        left: '40%-4',
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
cancelNewList.on('press', function() {
    newListForm.hide();
    resetNewListForm();
    screen.render();
});

let newListOrdered = blessed.checkbox({
    parent: newListForm,
    mouse: true,
    content: 'Ordered',
    checked: true,
    position: {
        bottom: 1,
        left: '60%-5',
        width: 'shrink',
        height: 1,
    },
    style: {
        fg: 'white',
        bg: 'black',
        focus: { bg: 'lightblack' },
        hover: { bg: 'lightblack' },
    }
});
newListOrdered.on('check', () => {
    let text = '';

    for (var i = 0; i < newListElements.length; i++) {
        text += `${i+1}. \n`
    }
    text += `{magenta-fg}${i+1}.{/} \n`

    newListElementsIndex.setContent(text);
});
newListOrdered.on('uncheck', () => {
    let text = '';

    for (let i = 0; i < newListElements.length; i++) {
        text += ' * \n'
    }
    text += `{magenta-fg} *{/} \n`

    newListElementsIndex.setContent(text);
});

let newListPinned = blessed.checkbox({
    parent: newListForm,
    mouse: true,
    content: 'Pinned',
    name: 'checkbox',
    position: {
        bottom: 1,
        left: '80%-5',
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

function resetNewListForm() {
    newListElements = [];
    newListElementsIndex.setContent('{magenta-fg}1. {/}');
    newListPinned.uncheck();
    newListOrdered.check();
}

let listsContent = [];
function updateLists() {
    let ypos = 0;

    let pinnedListData = db.get('pinned.lists').value();
    let listData = day.get(`lists`).value();

    let listObj = {
        parent: lists,
        tags: true,
        mouse: true,
        width: '100%-2',
        left: 0,
        border: 'line',
        style: {
            fg: 'normal',
            bg: 'normal',
            focus: { bg: 'lightblack' },
            hover: { bg: 'lightblack' },
        }
    };
    listsContent = [];
    let idx = 0

    // Pinned lists
    for (let i = 0; i < pinnedListData.length; i++) {
        let text = "";
        for (var j = 0; j < pinnedListData[i].data.length; j++) {
            text += pinnedListData[i].ordered ? `{cyan-fg}${j+1}.{/} ` : '{cyan-fg}* {/}';
            text += pinnedListData[i].data[j] + '\n';
        }

        listsContent[idx] = blessed.text({
            ...listObj,
            content: text,
            top: ypos,
            height: pinnedListData[i].data.length + 2,
            label: pinnedListData[i].title,
            style: {
                label: { fg: 'yellow' },
                border: { fg: 'yellow' }
            }
        });
        ypos += listsContent[idx].height;
        idx += 1;
    }

    // Daily lists
    for (let i = 0; i < listData.length; i++) {
        let text = "";
        for (let j = 0; j < listData[i].data.length; j++) {
            text += listData[i].ordered ? `{cyan-fg}${j+1}. {/}` : '{cyan-fg}* {/}';
            text += listData[i].data[j] + '\n';
        }

        listsContent[idx] = blessed.text({
            ...listObj,
            content: text,
            top: ypos,
            height: listData[i].data.length + 2,
            label: listData[i].title,
            style: {
                label: { fg: 'blue' },
                border: { fg: 'blue' }
            }
        });
        ypos += listsContent[idx].height;
        idx += 1;
    }
    screen.render();
}
updateLists();

let notes = blessed.box({
    parent: daily,
    name: 'text',
    tags: true, // Enable tags (bold, colors, etc) for text
    mouse: true,       // For scrolling
    keys: true,        // For scrolling
    vi: true,          // For scrolling
    scrollable: true,  // For scrolling
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
    screen.render();
})

let notesTitles = [];
function updateNotes() {
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
updateNotes();

let noteText = contrib.markdown({
    parent: notes,
    tags: true, // Enable tags (bold, colors, etc) for text
    mouse: true,       // For scrolling
    keys: true,        // For scrolling
    vi: true,          // For scrolling
    scrollable: true,  // For scrolling
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

    screen.render()
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

    updateNotes();

    screen.render()
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

    screen.render()
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

screen.key('q', function() {
    process.exit(0);
});

screen.render();
