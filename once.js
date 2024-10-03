// dedicated to the public domain, 2024


class Grapher {

    static getRandId() {
       return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    constructor(graph) {
        this.graph = graph;
        this.nodes = this.graph.nodes;
        this.links = this.graph.links;

        this.enrichNodes();

        // a list of nodes
        this.story = [];
        
        const firstNode = this.nodes[0];
        firstNode.segmentId = Grapher.getRandId();
        this.story.push(firstNode);
        
        this.arrowRight();
    }

    clickSegment(segmentId) {
        console.log(segmentId);

        // if clicking on dot dot dot...
        if (segmentId === -1) {
            this.arrowRight();
        } else if (segmentId === this.story[0].segmentId) {
            return;
        } else {
            let nodeSegId = this.story.at(-1).segmentId;
            while (nodeSegId != segmentId) {
                this.arrowLeft();
                nodeSegId = this.story.at(-1).segmentId;
            }

            this.arrowLeft();
            this.arrowRight();
        }
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

//            console.log(link.source, link.target)
            
            const sourceNode = this.slots[sourceSlot].find(n => n.label === sourceLabel);
            if (sourceNode.children === undefined) {
                sourceNode.children = [];
                sourceNode.childrenIndex = 0;
            }

            const targetNode = this.slots[targetSlot].find(n => n.label === targetLabel);
            sourceNode.children.push(targetNode);
        }
    }

    getSegmentText(segmentId) {
        return this.story
            .flatMap(node => node.segmentId === segmentId ? [node.label] : [])
            .join('');
    }

    getSegmentColor(segmentId) {
        const segment = this.getSegmentText(segmentId)
        const hue = ((segment.length * 829793) % 255) / 255; // stupid hash function
        const saturation = 0.5;
        const value = 0.8;
        const [r, g, b] = hsvToRgb(hue, saturation, value);
        return (`rgb(${Math.floor(r) }, ${Math.floor(g)}, ${Math.floor(b)})`);
    }

    render() {
        $("#main").empty();
        const THIS = this;
        let lastNode;
        this.story.forEach(function(node) {
            lastNode = node;
            const nugget = node.label;
            const color = THIS.getSegmentColor(node.segmentId);
            $('#main').append(`<span class="nugget" onclick="CLICK_SEGMENT(${node.segmentId})" style="background-color: ${color}">${nugget}</span>`);
        });

        if (lastNode && (lastNode.children === undefined || lastNode.children.length === 0)) {
            return;
        }

        $('#main').append(`<span class="nugget" onclick="CLICK_SEGMENT(-1)" style="background-color: yellow; width: 100px; display: inline-block;">... </span>`);


    
    }

    arrowDown() {
        const node = this.story.at(-1);
        const segmentId = node.segmentId;
        this.clickSegment(segmentId);

    }

 

    arrowLeft() {
        let done;
        do {
            done = this.goLeft();
        } while (!done);

        // this is a hack 
        if (this.story.length === 1) {
            this.arrowRight();
        } else {
            this.render();
        }
    }

    goLeft() {
        if (this.story.length === 1) {
            return true;
        }

        this.story.pop();
        const node = this.story.at(-1);

        if (node.children.length === 1) {
            return false;
        } else {
            return true;
        }
    }

    

    arrowRight() {
        let done;

        let segmentId;
        
        if (this.story.length === 1) {
            segmentId = this.story[0].segmentId;
        } else {
            segmentId = Grapher.getRandId();
        }

        do {
            done = this.goRight(segmentId);
        } while (!done);

        this.render();
    }

    goRight(segmentId) {
        const lastNode = this.story.at(-1);
        const children = lastNode.children;

        console.log(children);

        if (children === undefined) {
            return true;
        }

        lastNode.childrenIndex = (lastNode.childrenIndex + 1) % lastNode.children.length;
        const child = children[lastNode.childrenIndex];
        child.segmentId = segmentId;
        this.story.push(child);

        if (child.children === undefined || child.children.length === 0) {
            return true;
        } else if (child.children.length === 1) {
            return false;
        } else {
            return true;
        }
    }

 
}

