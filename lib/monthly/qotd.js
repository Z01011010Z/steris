module.exports = function (pane, height) {
    let module = {};

    // For display
    const blessed = require('blessed');

    // For time control
    let moment = require('moment');

    // For gettting quote
    const axios = require('axios')
    const url = "https://quotes.rest/qod"

    // For db
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync('db.json')
    const db = low(adapter)

    const date = moment();

    const y = date.format('YYYY');
    const m = date.format('MM');
    const d = date.format('DD');

    const day = db.get(`${y}.${m}.${d}`);

    let quotePane = blessed.box({
        parent: pane,
        position: {
            bottom: 0,
            left: 0,
            height: height,
            width: '100%-2',
        },
    });

    let quoteText = blessed.text({
        parent: quotePane,
        tags: true,
        align: 'right',
        position: {
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        },
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
            text: 'Quote of the day',
            side: 'left',
        },
    })

    module.updateQuote = function () {
        if(!day.has("quote").value()){
            axios({
                method: 'get',
                url: url,
                headers: { 'Accept': 'application/json' },
            }).then(res => {

                const text = res.data.contents.quotes[0].quote
                const author = res.data.contents.quotes[0].author

                db.assign('quote', {
                    "text": text,
                    "author": author,
                }).write();

                quoteText.setContent(`${text}  \n - {bold}${author}{/}  `);
                pane.screen.render();

            }).catch(err => {
                quoteText.setContent("{red-fg}Could not obtain quote!{/}");
                pane.screen.render();
            })
        } else {
            const quote = day.get("quote").value()

            const text = quote.text
            const author = quote.author

            quoteText.setContent(`${text}  \n - {bold}${author}{/}  `);
            pane.screen.render();
        } 
    }


    return module;
}
