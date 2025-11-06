// Initialize Konva stage and layer
const stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight - 50 // leave room for toolbar
});
const layer = new Konva.Layer();
stage.add(layer);

let states = [];
let transitions = [];
let stateCount = 0;

// ===== Add State Button =====
const addStateBtn = document.getElementById('addStateBtn');
let addingState = false;
let addingTransition = false;
let startState = null;

addStateBtn.addEventListener('click', () => {
    addingState = true;
    addingTransition = false;
    stage.container().style.cursor = 'crosshair';
});

// ===== Add Transition Button =====
const addTransitionBtn = document.getElementById('addTransitionBtn');
addTransitionBtn.addEventListener('click', () => {
    addingTransition = true;
    addingState = false;
    startState = null;
    stage.container().style.cursor = 'crosshair';
});

// ===== Clear Button =====
const clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener('click', () => {
    layer.destroyChildren();
    layer.draw();
    states = [];
    transitions = [];
    stateCount = 0;
});

// ===== Handle Clicks =====
stage.on('click', (e) => {
    // Clicked empty space → create new state
    if (e.target === stage) {
        if (addingState) {
            const pos = stage.getPointerPosition();
            createState(pos.x, pos.y);
            addingState = false;
            stage.container().style.cursor = 'default';
        }
        return;
    }

    // ===== If clicked a label → rename state =====
    if (e.target.getClassName() === 'Text' && !addingTransition) {
        renameState(e.target);
        return;
    }

    // ===== If clicked a circle and we're adding a transition =====
    if (e.target.getClassName() === 'Circle' && addingTransition) {
        const clickedState = states.find(s => s.circle === e.target);
        if (!startState) {
            // first click → from state
            startState = clickedState;
            e.target.stroke('blue');
            layer.draw();
        } else {
            // second click → to state
            const endState = clickedState;
            startState.circle.stroke('black'); // reset color
            createTransition(startState, endState);
            startState = null;
            addingTransition = false;
            stage.container().style.cursor = 'default';
        }
    }
});

// ===== Create State =====
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
        text: 'q' + stateCount++,
        fontSize: 18
    });

    // Center label dynamically
    label.x(x - label.width() / 2);
    label.y(y - label.height() / 2);

    layer.add(circle);
    layer.add(label);
    layer.draw();

    circle.on('dragmove', () => {
        label.x(circle.x() - label.width() / 2);
        label.y(circle.y() - label.height() / 2);
        updateArrows(circle);
        layer.batchDraw();
    });

    states.push({ circle, label });
}

// ===== Rename State =====
function renameState(oldLabel) {
    const newLabel = prompt("Enter new label for this state:", oldLabel.text());
    if (newLabel !== null && newLabel.trim() !== "") {
        oldLabel.text(newLabel.trim());

        const state = states.find(s => s.label === oldLabel);
        if (state) {
            const circle = state.circle;
            oldLabel.x(circle.x() - oldLabel.width() / 2);
            oldLabel.y(circle.y() - oldLabel.height() / 2);
        }
        layer.draw();
    }
}

// ===== Create Transition (Arrow) =====
function createTransition(fromState, toState, labelText = '') {
    const from = fromState.circle.position();
    const to = toState.circle.position();
    const r = fromState.circle.radius();

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const startX = from.x + (dx / len) * r;
    const startY = from.y + (dy / len) * r;
    const endX = to.x - (dx / len) * r;
    const endY = to.y - (dy / len) * r;

    const arrow = new Konva.Arrow({
        points: [startX, startY, endX, endY],
        stroke: 'black',
        fill: 'black',
        pointerLength: 10,
        pointerWidth: 10,
        strokeWidth: 2
    });

    // Create the label
    const label = new Konva.Text({
        text: labelText || 'a',
        fontSize: 16
    });

    // Offset Y to position label above the arrow
    const offsetY = 20; // pixels above arrow, adjust as needed
    label.x((startX + endX) / 2 - label.width() / 2);
    label.y((startY + endY) / 2 - label.height() / 2 - offsetY);

    layer.add(arrow);
    layer.add(label);
    transitions.push({ from: fromState.circle, to: toState.circle, arrow, label });
    layer.draw();

    label.on('click', (e) => {
        e.cancelBubble = true; // prevents stage click from firing
        const newText = prompt("Enter label for this transition:", label.text());
        if (newText !== null && newText.trim() !== '') {
            label.text(newText.trim());
            layer.draw();
        }
    });

}



function updateArrows(movedCircle) {
    const offsetY = 20; // same offset as above
    transitions.forEach(t => {
        const from = t.from.position();
        const to = t.to.position();
        const r = t.from.radius();

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;

        const startX = from.x + (dx / len) * r;
        const startY = from.y + (dy / len) * r;
        const endX = to.x - (dx / len) * r;
        const endY = to.y - (dy / len) * r;

        t.arrow.points([startX, startY, endX, endY]);

        if (t.label) {
            t.label.x((startX + endX) / 2 - t.label.width() / 2);
            t.label.y((startY + endY) / 2 - t.label.height() / 2 - offsetY);
        }
    });
}




// ===== Resize Canvas Dynamically =====
window.addEventListener('resize', () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight - 50);
});
