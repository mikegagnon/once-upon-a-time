
class SegmentGenerator {
    constructor(ztnd_graph, ztnd_choices) {
        this.choices = ztnd_choices;
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
    }
}

class PagedStory {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.pages = [];
        this.pageStart = 3;

    }

    getPrefix(node) {
        const text = [node.text];
        while (node.id !== 0) {
            const e = this.edges.find(e => e.direction === "back" && e.from === node.id);
            node = this.nodes.find(n => n.id === e.to);
            text.unshift(node.text);
        }
        return text;

    }

    getPage(node) {
        const outEdges = this.getOutEdges(node);
        const outNodes = outEdges.map(e => this.nodes.find(n => n.id === e.to));
        const choices = outNodes;

        const text = this.getPrefix(node);
        const nodeId = node.id;

        const backNodeId = this.edges.filter(e => e.from === node.id && e.direction === "back").map(e => e.to);

        const page = {
            text,
            backNodeId,
            choices,
            nodeId
        };

        return page;
    }

    getOutEdges(node) {
        return this.edges.filter(e => e.from === node.id && e.direction === "forward");
    }

    genPageNums() {
        this.pages.forEach((page, i) => page.pageNum = i * 2 + this.pageStart);
        this.nodes.forEach(node => node.pageNum = this.pages.find(page => page.nodeId === node.id).pageNum);
        //this.nodes.forEach(node => node.backPageNum = this.pages.find(page => page.backNodeId === node.id).pageNum);
        this.pages.forEach(page => page.backPageNum = this.nodes.find(n => page.backNodeId).pageNum);

    }

    generate() {

        // https://en.wikipedia.org/wiki/Breadth-first_search
        const q = [];
        const root = this.nodes[0];
        root.explored = true;
        q.push(root);

        const page = this.getPage(root);
        this.pages.push(page);

        while (q.length > 0) {
            const v = q.shift();
            //const outEdges = this.edges.filter(e => e.from === v.id && e.direction === forward);
            const outEdges = this.getOutEdges(v);
            for (const e of outEdges) {
                const w = this.nodes.filter(n => n.id === e.to)[0];
                if (w.explored === undefined) {
                    w.explored = true;
                    const page = this.getPage(w);
                    this.pages.push(page);
                    q.unshift(w);

                }
            }
        }

        this.genPageNums();
    }
}

class PagedViz {
    constructor(pagedStory) {
        this.pages = pagedStory.pages;
        this.pageStart = pagedStory.pageStart;
        this.clickPageTurn(this.pageStart);
    }

    getPageHtml(page) {

        //const backPageNum = page.

        let body;
        if (page.text.length === 1) {
            body = page.text[0];
        } else {
            const last = page.text.at(-1);//pop();
            console.log(last)
            const prefix = page.text.slice(0, -1).join("")
            body = prefix + `<span style="text-decoration: underline;">${last}</span>`;
        }

        const choicesHtml = page.choices.map(node =>
            `<div style="padding-left: 20px">${node.text}...</div><div style="float: right;"><span style="cursor: pointer; text-decoration: underline;" onclick="CLICK_PAGE_TURN(${node.pageNum})">turn to page ${node.pageNum}<span></div>`
        ).join("<br><br>");

        let theEnd;
        if (page.choices.length === 0) {
            theEnd = `<div style="padding-top: 30px;">
                <center>The End!</center>
            </div>`;
        } else {
            theEnd = "";
        }

        let back;
        if (page.text.length === 1) {
            back = "";
        } else {
            if (theEnd === "") {
                back = `<div style="padding-top: 30px;">
                    <center>(<span style="cursor: pointer; text-decoration: underline;" onclick="CLICK_PAGE_TURN(${page.backPageNum})">or return to page ${page.backPageNum})</span></center>
                </div>`;
            } else {
                back = `<div style="padding-top: 30px;">
                    <center>(<span style="cursor: pointer; text-decoration: underline;" onclick="CLICK_PAGE_TURN(${page.backPageNum})">return to page ${page.backPageNum})</span></center>
                </div>`;
            }
        }

        const html = `
            <div style="background-color: #ddd; border-radius: 10px; margin: 10px; padding: 10px;">
                <p style="font-size: 20pt;">${body}</p>
                <div>
                    ${choicesHtml}
                </div>
                ${theEnd}

                ${back}
                <center><p style="padding-top: 30px;">Page ${page.pageNum}</p></center>

            </div>
            
        `;
        return html;
    }

    clickPageTurn(pageNum) {
        $("#main").empty();
        const page = this.pages.find(p => p.pageNum === pageNum);
        const html = this.getPageHtml(page);
        $("#main").append(html);
    }
}

class SegmentViz {
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
        for (const n of this.nodes) {
            n.monotonic = this.monotonic;
            this.monotonic += 1;
            n.hue = (n.monotonic * 7876373) % 255; // stupid hash function
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
            let nodeText;
            if (node.id === 0) {
                const head = node.text[0];
                const tail = node.text.substring(1);
                nodeText = `<span class='first-letter' style="background-color: hsl(${node.hue}, 100%, 72%)">${head}</span>${tail}`
            } else {
                nodeText = node.text;
            }
            $("#main").append(`<span onclick="CLICK_SEGMENT(${node.id})" class="nugget" style="background-color: hsl(${node.hue}, 100%, 72%)">${nodeText}</span>`);
        }

        const lastEdges = this.getLastEdges();
        if (lastEdges.length > 0) {
            $("#main").append(`<span onclick="CLICK_SEGMENT(-1)" class="dotdotdot nugget">... </span>`)
        } else {
            $("#main").append(`<span class="dotdotdot nugget">... The End!</span>`)

        }
    }

    arrowRight() {
        const lastEdges = this.getLastEdges();
        if (lastEdges.length === 0) {
            return;
        }
        lastEdges.sort((a,b) => a.monotonic - b.monotonic);
        const edge = lastEdges[0];
        edge.monotonic = this.monotonic;
        this.monotonic += 1;
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

    arrowDown() {
        this.arrowLeft();
        this.arrowRight();
    }

    clickSegment(segId) {
        if (segId === 0) {
            this.story = [this.story[0]];
            this.render();
            return;
        }
        if (segId === -1) {
            this.arrowRight();
            return;
        }
        const newStory = [];
        for (const node of this.story) {
            if (node.id === segId) {
                break;
            }
            newStory.push(node);
        }
        this.story = newStory;
        this.arrowRight();
        this.render();
    }
}
