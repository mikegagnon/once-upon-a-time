
class SegmentGenerator {
    constructor(ztnd_graph, ztnd_choices) {
        this.choices = ztnd_choices;
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

    generate() {
        const stories = [];
        for (const choice of this.choices) {
            const story = choice.tokens.map(t => t.text).join("");
            stories.push(story);
        }
        
        this.tree = undefined;
        
        for (const story of stories) {
            this.addStory(story);
        }
        
        console.log(this.tree)
        
    }

    



}