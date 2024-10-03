// dedicated to the public domain, 2024

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

        }
    }

    render() {
        console.log("render");
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
        const children = 

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
