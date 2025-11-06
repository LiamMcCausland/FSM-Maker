// Initialize Konva stage and layer
const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight - 50 // leave room for toolbar
});
const layer = new Konva.Layer();
stage.add(layer);

let states = [];
let stateCount = 0;

// ===== Add State Button =====
const addStateBtn = document.getElementById('addStateBtn');
let addingState = false;
let renamingState = false;

addStateBtn.addEventListener('click', () => {
    addingState = true;
    stage.container().style.cursor = 'crosshair';
});

stage.on('click', (e) => {
    if (e.target === stage) {
        if (addingState) {
            const pos = stage.getPointerPosition();
            createState(pos.x, pos.y);
            addingState = false;
            stage.container().style.cursor = 'default';
        }
        return;
    }

    // If we clicked on a state (a circle)
    if (e.target.getClassName() === 'Text') {
        renameState(e.target);
    }
});

function renameState(oldLabel) {
    console.log("renameState() called");

    const newLabel = prompt("Enter new label for this state:", oldLabel.text());

    if (newLabel !== null && newLabel.trim() !== "") {
        oldLabel.text(newLabel.trim());

        // Re-center the label relative to its circle
        const state = states.find(s => s.label === oldLabel);
        if (state) {
            const circle = state.circle;
            oldLabel.x(circle.x() - oldLabel.width() / 2);
            oldLabel.y(circle.y() - oldLabel.height() / 2);
            circle.on('dragmove', () => {
                oldLabel.x(circle.x() - oldLabel.width() / 2);
                oldLabel.y(circle.y() - oldLabel.height() / 2);
                layer.batchDraw();
            });
        }

        layer.draw();
        console.log(`State renamed to "${newLabel}"`);
    } else {
        console.log("Rename cancelled or empty.");
    }
}


// ===== Clear Button =====
const clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener('click', () => {
    layer.destroyChildren();
    layer.draw();
    states = [];
    stateCount = 0;
});

// ===== Helper: Create State =====
function createState(x, y) {
    const circle = new Konva.Circle({
        x,
        y,
        radius: 30,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        draggable: true
    });

    const label = new Konva.Text({
        x: x - 10,
        y: y - 7,
        text: 'q' + stateCount++,
        fontSize: 18
    });

    layer.add(circle);
    layer.add(label);
    layer.draw();

    // Keep label centered when dragging
    circle.on('dragmove', () => {
        label.x(circle.x() - 10);
        label.y(circle.y() - 7);
        layer.batchDraw();
    });

    states.push({ circle, label });
}

// ===== Resize Canvas Dynamically =====
window.addEventListener('resize', () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight - 50);
});
