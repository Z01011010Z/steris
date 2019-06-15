module.exports = function (screen) {
    let module = {};

    // For displau
    const blessed = require('blessed');
    const contrib = require('blessed-contrib');

    // For time control
    const moment = require('moment');

    // For db
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync('db.json')
    const db = low(adapter)

    let pane = blessed.box({
        parent: screen,
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

    // Updates the pane to the current date
    module.updateDay = function (date) {
        // Si esta como string lo convierte a moment
        if(!moment.isMoment(date)) {
            date = moment(date, 'YYYY-MM-DD');
        }

        pane.setLabel(`Daily Planner (${date.format("YYYY-MM-DD")})`)

        let y = date.format('YYYY');
        let m = date.format('MM');
        let d = date.format('DD');

        let today = {
            [y]: {
                [m]: {
                    [d]: {
                        "todos": [],
                        "activities": [],
                        "lists": [],
                        "notes": [],
                        "quote": {},
                    }, 
                }
            }
        }

        // Si no tiene el año
        if(!db.has(`${y}`).value()){
            db.assign(today).write();
        }

        // Si no tiene el mes
        if(!db.has(`${y}.${m}`).value()){
            db.get(`${y}`).assign(today[y]).write();

            db.get(`${y}.${m}`).assign({ "projects": [] }).write();
        }

        // Si no tiene el dia
        if(!db.has(`${y}.${m}.${d}`).value()){
            db.get(`${y}.${m}`).assign(today[y][m]).write();
        }

        const day = db.get(`${y}.${m}.${d}`);

        // Subpanes
        module.todos = require('./daily/todos.js')(pane, day);
        module.activities = require('./daily/activities.js')(pane, day);
        module.lists = require('./daily/lists.js')(pane, day);
        module.notes = require('./daily/notes.js')(pane, day);

        module.updatePanes();
    };

    // Updates all panes (todos, activities, lists & notes)
    module.updatePanes = function () {
        module.todos.updateTodos();
        module.activities.updateActivities();
        module.lists.updateLists();
        module.notes.updateNotes();
    }

    module.show = function () {
        pane.show();
    }

    module.hide = function () {
        pane.hide();
    }

    return module;
};
