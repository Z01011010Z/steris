#!/usr/bin/env node

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const moment = require('moment');

const _ = require('lodash');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({
    "pinned": {
        "todos": [],
        "activities": [],
        "lists": [],
        "notes": [],
    },
}).write();

let screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    dockBorders: true,
    ignoreDockContrast: false,
    autoPadding: true,
    resizeTimeout: 100,
    sendFocus: true,
});

const monthly = require('./lib/monthly.js')(screen);

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
    autoCommandKeys: true,
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
            monthly.daily.show();
            monthly.hide();
        },
        'Monthly': () => {
            monthly.show();
            monthly.daily.hide();
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

// Init all
monthly.daily.updateDay(moment());
monthly.updateMonth(moment());

monthly.daily.show();
monthly.hide();

screen.key('q', function() {
    process.exit(0);
});

screen.render();
