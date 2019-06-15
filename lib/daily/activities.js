module.exports = function (pane, day) {
    let module = {};

    // For displau
    const blessed = require('blessed');

    // For time control
    const moment = require('moment');

    // For db
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync('db.json')
    const db = low(adapter)

    let activitiesPane = blessed.box({
        parent: pane,
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
        pane.screen.render()
    });

    let newActivityForm = blessed.box({
        hidden: true,
        parent: pane.screen,
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
    // Create arrays for dials
    let hours = [];
    for (let i = 1; i <= 12; i++) {
        hours.push(i < 10 ? ' ' + i : i + '');
    }
    let mins = [];
    for (let i = 0; i <= 60; i++) {
        mins.push(i < 10 ? '0' + i : i + '');
    }

    // This could be a new blessed widget (dial)
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

        module.updateActivities();
        resetNewActivityForm();
        newActivityForm.hide();
        pane.screen.render();
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
        resetNewActivityForm();
        pane.screen.render();
    });

    module.updateActivities = function () {
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

    // TODO
    function resetNewActivityForm(){}

    return module;
}
