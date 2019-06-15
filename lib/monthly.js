module.exports = function (screen) {
    let module = {};

    let moment = require('moment');
    const blessed = require('blessed');

    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')

    const adapter = new FileSync('db.json')
    const db = low(adapter)

    module.daily = require('./daily.js')(screen);

    let y;
    let m;

    let pane = blessed.box({
        parent: screen,
        border: {
            type: 'line',
            fg: 'lightcyan',
        },
        label: {
            text: 'Monthly Planner',
            side: 'left',
        },
        style: { label: { fg: "white" } },
        position: {
            top: 3,
            left: 0,
            width: '100%',
            height: screen.height - 3,
        },
    });

    let calendar;
    function generateMonth(date) {
        // Si esta como string lo convierte a moment
        if(!moment.isMoment(date)) {
            date = moment(date, 'YYYY-MM-DD');
        }

        const monthStart = date.startOf('month')

        y = date.format('YYYY')
        m = date.format('MM')

        // Startup headers
        let data  = [[
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        ]];

        let currentDay = 1
        for (let i = 0; i < Math.ceil((monthStart.day() + monthStart.daysInMonth()) / 7); i++) {
            let week = []
            for (let j = 0; j < 7; j++) {
                if(7*i + j >= monthStart.day() && currentDay <= monthStart.daysInMonth()){
                    week.push(currentDay)
                    currentDay++;
                } else {
                    week.push('')
                }
            }
            data.push(week);
        }

        return data;

    }


    module.updateCalendar = function (date) {
        pane.setLabel(`Monthly Planner (${date.format("YYYY-MM")})`)

        let calendarData = generateMonth(date)

        let w = parseInt( 0.8 * ((pane.width - 2) / 7));
        let h = parseInt((pane.height - 2 - 4) / (calendarData.length - 1));

        calendar = blessed.box({
            parent: pane,
            border: {
                type: 'line',
                fg: 'lightcyan',
            },
            label: {
                text: 'Calendar',
                side: 'left',
            },
            style: { label: { fg: "white" } },
            position: {
                top: 0,
                left: 0,
                width: 7 * (w - 1) + 1 + 2,
                height: (calendarData.length - 1) * (h - 1) + 4 + 2,
            },
        });

        // Subpanes
        module.qotd     = require('./monthly/qotd.js')(pane, pane.height - calendar.height - 2);
        module.projects = require('./monthly/projects.js')(pane, date, {'width': pane.width - calendar.width - 2, 'height': calendar.height});

        let calBoxes = []
        for (let i = 0; i < calendarData.length; i++) {
            for (let j = 0; j < 7; j++) {
                calBoxes[7*i + j] = blessed.text({
                    parent: calendar,
                    tags: true,
                    mouse: true,
                    keys: true,
                    vi: true,
                    scrollable: true,
                    align: 'left',
                    border: {
                        type: 'line',
                        fg: 'lightcyan',
                    },
                    style: {
                        bg: "normal",
                        fg: "white",
                        focus: { border: { fg: 'cyan' } },
                        label: {
                            bold: true,
                            fg: 'white'
                        }
                    },
                    position: {
                        top:  i == 0 ? i * h : i * h - i - h + 4,
                        left: j * w - j,
                        width: w,
                        height: i == 0 ? 3 : h,
                    },
                })
                // Es un dia
                let data = calendarData[i][j];
                if(Number.isInteger(data)) {
                    if(data == moment().date()){
                        calBoxes[7*i + j].setLabel(`{blue-fg}${data}{/}`);
                    } else {
                        calBoxes[7*i + j].setLabel(data + '');
                    }


                    // Obtener actividades
                    let content = ''
                    if(db.has(`${y}.${m}.${calendarData[i][j]}`).value()) {
                        let activities = db.get(`${y}.${m}.${calendarData[i][j]}.activities`).value();

                        for (let i = 0; i < activities.length; i++) {
                            content += `${activities[i].text}\n`
                        }
                    }

                    calBoxes[7*i + j].setContent(content);

                    calBoxes[7*i + j].on('click', function() {
                        let d = this._label.content

                        module.daily.updateDay(`${y}-${m}-${d}`);

                        module.daily.show();
                        module.hide();
                    });
                } // Es un header
                else if (data != '') {
                    calBoxes[7*i + j].setContent(`{bold}{blue-fg}${data}{/}`);
                }
            }
        }
    }

    module.updateMonth = function (date) {
        module.updateCalendar(date)
        module.qotd.updateQuote()
        module.projects.updateProjects()
    }

    module.show = function () {
        pane.show();
    }

    module.hide = function () {
        pane.hide();
    }

    return module;
}
