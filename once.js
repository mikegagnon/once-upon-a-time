// dedicated to the public domain, 2024
// TODO:
//      1. Collapse two nodes if the second node is the only child of the first node
//      2. On right arrow press, always show the least recently presented node

class Grapher {
    constructor(graph) {
        this.graph = graph;
        this.nodes = this.graph.nodes;
        this.links = this.graph.links;

        this.enrichNodes();

        // a list of nodes
        this.story = [];

        this.story.push(this.nodes[0]);


        const nugget = this.story[0].label;
        $('#main').append(`<span class="nugget">${nugget}</span>`);
    }

    enrichNodes() {
        this.slots = [];

        for (const node of this.nodes) {
            const label = node.label;
            const ipos = node.ipos;
            if (this.slots[ipos] === undefined) {
                this.slots[ipos] = [];
            }
            this.slots[ipos].push(node);
        }

        for (const link of this.links) {
            const [sourceLabel, sourceSlot] = link.source;
            const [targetLabel, targetSlot] = link.target;
            
            const sourceNode = this.slots[sourceSlot].find(n => n.label === sourceLabel);
            if (sourceNode.children === undefined) {
                sourceNode.children = [];
                sourceNode.childrenIndex = 0;
            }

            const targetNode = this.slots[targetSlot].find(n => n.label === targetLabel);

            sourceNode.children.push(targetNode);
            //console.log(sourceNode);


        }

        //console.log(this.slots);
    }

    render() {
        //console.log("render");
        $("#main").empty();
        this.story.forEach(function(node) {
            const nugget = node.label;
            $('#main').append(`<span class="nugget">${nugget}</span>`);
        });
    }

    arrowLeft() {
        if (this.story.length === 1) {
            return;
        }

        this.story.pop();
        this.render();
    }

    arrowRight() {
        const lastNode = this.story.at(-1);
        const children = lastNode.children;

        if (children === undefined) {
            return;
        }

        //console.log(children);

            // https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array
            //const child = children[Math.floor(Math.random() * children.length)];
        lastNode.childrenIndex = (lastNode.childrenIndex + 1) % lastNode.children.length;
        const child = children[lastNode.childrenIndex];

        this.story.push(child);

        this.render();
    }
}



function main() {
    // GRAPH comes from nodes.js
    const grapher = new Grapher(GRAPH);

    window.addEventListener(
        "keydown",
        (event) => {
          if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
          }
      
          switch (event.key) {
            case "ArrowDown":
              // Do something for "down arrow" key press.
              break;
            case "ArrowUp":
              // Do something for "up arrow" key press.
              break;
            case "ArrowLeft":
              // Do something for "left arrow" key press.
              grapher.arrowLeft();
              break;
            case "ArrowRight":
              // Do something for "right arrow" key press.
              grapher.arrowRight();
              break;
            case "Enter":
              // Do something for "enter" or "return" key press.
              break;
            case " ":
              // Do something for "space" key press.
              break;
            case "Escape":
              // Do something for "esc" key press.
              break;
            default:
              return; // Quit when this doesn't handle the key event.
          }
      
          // Cancel the default action to avoid it being handled twice
          event.preventDefault();
        },
        true,
      );

    return grapher;
}

const GRAPHER = main();
