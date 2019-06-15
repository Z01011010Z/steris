module.exports = function (pane, day) {
    let module = {};

    // For display
    const blessed = require('blessed');

    // For db
    const low = require('lowdb')
    const FileSync = require('lowdb/adapters/FileSync')
    const adapter = new FileSync('db.json')
    const db = low(adapter)

    let listPane = blessed.box({
        parent: pane,
        position: {
            top: 0,
            right: 0,
            height: '60%',
            width: '32%',
        },
    });

    let lists = blessed.box({
        parent: listPane,
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
        pane.screen.render()
    });

    let newListForm = blessed.form({
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
        pane.screen.render();
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
        module.updateLists();
        pane.screen.render();
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
        pane.screen.render();
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
    module.updateLists = function () {
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
    }

    return module;
}
