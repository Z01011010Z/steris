module.exports = function (pane, date, size) {
    let module = {};

    // For display
    const blessed = require('blessed');

    // For time control
    let moment = require('moment');

    // For db
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync('db.json')
    const db = low(adapter)

    if(!moment.isMoment(date)) {
        date = moment(date, 'YYYY-MM-DD');
    }
    const y = date.format('YYYY');
    const m = date.format('MM');

    const month = db.get(`${y}.${m}`);

    let projectsPane = blessed.box({
        parent: pane,
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
            right: 0,
            height: size.height,
            width: size.width,
        },
        label: {
            text: 'Projects',
            side: 'left',
        },
    });

    let addNewProject = blessed.text({
        hidden: true,
    })
    let newProject = blessed.Textbox({
        hidden: true,
    });

    let projectsCB = [];
    module.updateProjects = function () {
        let projectData = month.get('projects').value();

        let projectObj = {
            parent: projectsPane,
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

        projectsCB = [];
        for (let i = 0; i < projectData.length; i++) {
            projectsCB[i] = blessed.checkbox({
                ...projectObj,
                content: projectData[i].text,
                checked: projectData[i].done,
                top: i,
            });

            projectsCB[i].on("check", function() {
                month.get('projects').find(["text", this.text]).assign({"done": true}).write();
            });

            projectsCB[i].on("uncheck", function() {
                month.get('projects').find(["text", this.text]).assign({"done": false}).write();
            });
        }

        addNewProject = blessed.text({
            parent: projectsPane,
            content: '[ ] ',
            fg: 'magenta',
            position: {
                top: projectData.length,
                left: 1,
                width: 'shrink',
                height: 1,
            },
        })

        newProject = blessed.Textbox({
            parent: projectsPane,
            mouse: true,
            inputOnFocus: true,
            input: true,
            position: {
                top: projectData.length,
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

        newProject.on('submit', (data) => {
            month.get('projects')
                .push({
                    done: false,
                    text: data,
                })
                .write()
            module.updateProjects();
        });
    }

    return module;
}
