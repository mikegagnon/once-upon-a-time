
class SegmentGenerator {
    constructor(ztnd_graph, ztnd_choices) {
        this.choices = ztnd_choices;

        /*for (const c of this.choices){
            const story = c.tokens.map(t => t.text).join(" ");
            console.log(story);
        }*/

        this.tree = undefined;
        this.nodes = undefined;
        this.edges = undefined;
    }

    addStory(story) {
        let node = this.tree;
        for (let i = 0; i < story.length; i++) {

            const char = story[i];
            if (node === undefined) {

                if (this.tree !== undefined) {
                    console.error("this.tree !== undefined");
                }
                if (i !== 0) {
                    console.error("i should equal 0");
                }
                
                this.tree = {};
                this.tree[char] = {};
                node = this.tree[char];


            } else {
                if (char in node) {
                    node = node[char];
                } else {
                    node[char] = {};
                    node = node[char];
                }
            }
        }
    }


    flatten(parent, node, text, index) {
        const keys = Object.keys(node);
        keys.sort();
        if (keys.length === 0) {
            const newId = this.nextId;
            this.nextId ++;

            const newNode = {
                id: newId,
                text: text
            };
            const backEdge = parent === undefined ? undefined : {
                direction: "back",
                from: newId,
                to: parent.id
            };
            const forwardEdge = parent === undefined ? undefined : {
                direction: "forward",
                from: parent.id,
                to: newId
            };
            this.nodes.push(newNode);
            if (parent) {
                this.edges.push(backEdge);
                this.edges.push(forwardEdge);
            }
        } else if (keys.length === 1) {
            const key = keys[0];
            const child = node[key];
            this.flatten(parent, child, text + key, index + 1);
        } else {

            const newId = this.nextId;
            this.nextId++;

            const newNode = {
                id: newId,
                text: text
            };
            const backEdge = parent === undefined ? undefined : {
                direction: "back",
                from: newId,
                to: parent.id
            };
            const forwardEdge = parent === undefined ? undefined : {
                direction: "forward",
                from: parent.id,
                to: newId
            };
            this.nodes.push(newNode);
            if (parent) {
                this.edges.push(backEdge);
                this.edges.push(forwardEdge);
            }

            for (const key of keys) {
                const child = node[key];
                this.flatten(newNode, child, key, index + 1);
            }
        }
    }

    generate() {
        const stories = [];
        for (const choice of this.choices) {
            const story = choice.tokens.map(t => t.text).join("");
            stories.push(story);
        }
        
        for (const story of stories) {
            this.addStory(story);
        }
        
        this.nodes = [];
        this.edges = [];
        this.nextId = 0;
        this.flatten(undefined, this.tree, "", 0);

        console.log(this.nodes)
    }
}

class Viz {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.story = [];
        this.monotonic = 0;
        this.init();
        this.render();
    }

    init() {
        for (const e of this.edges) {
            e.monotonic = this.monotonic;
            this.monotonic += 1;
        }
        this.story.push(this.nodes[0]);
    }

    getLastNode() {
        return this.story.at(-1);
    }

    getLastEdges() {
        const lastNode = this.getLastNode();
        const lastEdges = this.edges.filter(e => e.direction === "forward" && e.from === lastNode.id);
        lastEdges.sort((a,b) => a.id - b.id);
        return lastEdges;
    }

    render() {
        $("#main").empty();
        for (const node of this.story) {
            console.log(node);
            $("#main").append(node.text);
        }

        const lastEdges = this.getLastEdges();
        if (lastEdges.length > 0) {
            $("#main").append("... ")
        }

    }

    arrowRight() {
        const lastEdges = this.getLastEdges();


        
        

        lastEdges.sort((a,b) => a.monotonic - b.monotonic);
        const edge = lastEdges[0];
        edge.monotonic = this.monotonic;
        this.monotonic += 1;

        console.log(lastEdges)

       

        const node = this.nodes.filter(n => n.id == edge.to)[0];
        this.story.push(node);
        this.render();
        
    }

    arrowLeft() {
        if (this.story.length > 1) { 
            this.story.pop();
            this.render();
        }
    }

}
