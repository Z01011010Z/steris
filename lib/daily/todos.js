module.exports = function (pane, day) {
    let module = {};

    // For displau
    const blessed = require('blessed');

    // For db
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync('db.json')
    const db = low(adapter)

    let todosPane = blessed.box({
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
    module.updateTodos = function () {
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
            module.updateTodos();
        });
    }

    return module;
}
