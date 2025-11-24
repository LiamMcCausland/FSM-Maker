const graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

const paper = new joint.dia.Paper({
    el: document.getElementById('paper'),
    width: 800,
    height: 600,
    model: graph,
    cellViewNamespace: joint.shapes,
    defaultConnector: { name: 'smooth' },
    interactive: function(cellView) {
        if (cellView.model.isLink()) return { vertexAdd: true, vertexMove: true, arrowheadMove: true };
        return true;
    },
    labelsLayer: true
});

paper.on('element:label:pointerdown', function(_view, evt) {
    evt.stopPropagation();
});

paper.on('cell:pointerdown blank:pointerdown', function() {
    if (window.getSelection) window.getSelection().removeAllRanges();
    else if (document.selection) document.selection.empty();
});

let startArrowAdded = false;

// Create a normal state with support for an inner ring
function state(x, y, label = 'new') {
    const circle = new joint.shapes.standard.Circle({
        position: { x, y },
        size: { width: 60, height: 60 },
        attrs: {
            label: { text: label, fontWeight: 'bold', cursor: 'text', style: { userSelect: 'text' } },
            body: { strokeWidth: 3, stroke: '#000000' },
            innerCircle: { display: 'none', ref: 'body', refCx: '50%', refCy: '50%', r: 26, stroke: '#000000', strokeWidth: 3, fill: 'none' }
        },
        markup: [{
            tagName: 'circle',
            selector: 'body'
        },{
            tagName: 'circle',
            selector: 'innerCircle'
        },{
            tagName: 'text',
            selector: 'label'
        }]
    }).addTo(graph);

    if (!startArrowAdded) {
        addStartArrow(circle);
        startArrowAdded = true;
    }

    return circle;
}

function makeAccepting(el, accepting = true) {
    if (accepting) {
        el.attr('body/strokeWidth', 3);
        el.attr('innerCircle/display', 'block'); // show inner ring
    } else {
        el.attr('innerCircle/display', 'none'); // hide inner ring
    }
}

function initState(x, y) {
    const start = new joint.shapes.standard.Circle({
        position: { x: x, y: y },
        size: { width: 20, height: 20 },
        attrs: { body: { fill: '#333333' } }
    }).addTo(graph);

    addStartArrow(start);
    return start;
}

function link(source, target, label, vertices) {
    const l = new joint.shapes.standard.Link({
        source: { id: source.id },
        target: { id: target.id },
        attrs: { line: { strokeWidth: 2 } },
        labels: [{
            position: { distance: 0.5 },
            attrs: {
                root: { cursor: 'text', style: { userSelect: 'text' } },
                text: { text: label, fontWeight: 'bold' }
            }
        }],
        vertices: vertices || []
    });
    return l.addTo(graph);
}

function addStartArrow(targetState) {
    const pos = targetState.position();
    const startPos = { x: pos.x - 80, y: pos.y + 30 };
    const startCircle = new joint.shapes.standard.Circle({
        position: startPos,
        size: { width: 20, height: 20 },
        attrs: { body: { fill: '#333333' } },
        selectable: false
    }).addTo(graph);

    link(startCircle, targetState, 'start');
}

const linkTools = new joint.dia.ToolsView({
    tools: [
        new joint.linkTools.Vertices(),
        new joint.linkTools.Segments(),
        new joint.linkTools.TargetArrowhead()
    ]
});
paper.on('link:mouseenter', linkView => linkView.addTools(linkTools));
paper.on('link:mouseleave', linkView => linkView.removeTools());

let selectedLabelElement = null;
let transitionSource = null;

paper.on('element:pointerclick', function(elementView, evt) {
    if (evt.button === 2) return;
    if (selectedLabelElement) selectedLabelElement.attr('body/stroke', '#000000');
    selectedLabelElement = elementView.model;
    selectedLabelElement.attr('body/stroke', '#00aaff');
});

paper.on('element:contextmenu', function(elementView, evt) {
    evt.preventDefault();
    if (!transitionSource) {
        transitionSource = elementView.model;
        transitionSource.attr('body/stroke', '#ff0000');
    } else {
        const targetElement = elementView.model;
        let label = prompt('Transition label:', '');
        if (label !== null) {
            let vertices = [];
            if (transitionSource.id === targetElement.id) {
                const pos = transitionSource.position();
                const size = transitionSource.size();
                vertices = [
                    { x: pos.x + size.width, y: pos.y - size.height / 2 },
                    { x: pos.x - size.width, y: pos.y - size.height / 2 }
                ];
            }
            link(transitionSource, targetElement, label, vertices);
        }
        graph.getElements().forEach(el => el.attr('body/stroke', '#000000'));
        transitionSource = null;
    }
});

document.addEventListener('keydown', function(evt) {
    if (!selectedLabelElement) return;
    if (evt.key === 'Escape') {
        selectedLabelElement.attr('body/stroke', '#000000');
        selectedLabelElement = null;
        return;
    }
    if (evt.key.length === 1) {
        const oldLabel = selectedLabelElement.attr('label/text') || '';
        selectedLabelElement.attr('label/text', oldLabel + evt.key);
    } else if (evt.key === 'Backspace') {
        const oldLabel = selectedLabelElement.attr('label/text') || '';
        selectedLabelElement.attr('label/text', oldLabel.slice(0, -1));
        evt.preventDefault();
    }
});

// Toggle accepting on Shift + double-click
paper.on('element:pointerdblclick', function(elementView, evt) {
    if (!evt.shiftKey) return;

    const el = elementView.model;
    const isAccepting = el.attr('innerCircle/display') === 'block';
    makeAccepting(el, !isAccepting);

    evt.stopPropagation();
});



// Double-click blank space → add new state
paper.on('blank:pointerdblclick', function(evt, x, y) {
    state(x - 30, y - 30);
});

const toolbar = document.getElementById('toolbar');
const clearBtn = document.createElement('button');
clearBtn.textContent = 'Clear';
toolbar.appendChild(clearBtn);
clearBtn.addEventListener('click', () => {
    graph.clear();
    start
    selectedLabelElement = null;
    transitionSource = null;
        startArrowAdded = false; // Reset tracker so next added state gets start arrow
});

const start = initState(50, 530);
const code = state(180, 390, 'code');
const slash = state(340, 220, 'slash');
const star = state(600, 400, 'star');
const line = state(190, 100, 'line');
const block = state(560, 140, 'block');

link(start, code, 'start');
link(code, slash, '/');
link(slash, code, 'other', [{ x: 270, y: 300 }]);
link(slash, line, '/');
link(line, code, 'new\n line');
link(slash, block, '*');
link(block, star, '*');
link(star, block, 'other', [{ x: 650, y: 290 }]);
link(star, code, '/', [{ x: 490, y: 310 }]);
link(line, line, 'other', [{ x: 115, y: 100 }, { x: 250, y: 50 }]);
link(block, block, 'other', [{ x: 485, y: 140 }, { x: 620, y: 90 }]);
link(code, code, 'other', [{ x: 180, y: 500 }, { x: 305, y: 450 }]);
