# FSM Builder

A browser-based Finite State Machine (FSM) builder using **JointJS**.

## Features

- [x] Add states by double-clicking blank space  
- [x] First state automatically gets a start arrow  
- [x] Edit state labels by clicking and typing  
- [x] Right-click a state to start a transition, then click target state to create a link  
- [x] Self-loop transitions with proper curved arrows  
- [x] Draggable states and transitions  
- [x] Shift + double-click a state to toggle it as an **accepting state** (double ring)  
- [x] Clear button to remove all states and transitions  
- [x] Transitions support multiple vertices (bendable arrows)  
- [x] Label editing supports backspace and typing  
- [x] Start arrow and inner ring always move with the state  
- [x] Inner ring of accepting states does not interfere with clicks or transitions  
- [x] Delete states and their attached transitions

## Planned / Future Features

- [x] LaTeX support for labels (render equations and symbols)  
- [ ] Custom symbols for states and transitions  
- [ ] Multiple start states or entry points  
- [ ] Export FSM to JSON or SVG  
- [ ] Undo / redo actions  
- [ ] Grouping of states or sub-machines  
- [ ] Snap-to-grid or alignment guides  
- [ ] Keyboard shortcuts for common actions  

## Usage

1. Open `index.html` in a modern browser.  
2. Double-click blank space to add a new state.  
3. Left-click a state to edit its label.  
4. Right-click a state to start creating a transition; click the target state to complete it.  
5. Shift + double-click a state to toggle accepting state.  
6. Use the **Clear** button to remove all states and transitions.  

