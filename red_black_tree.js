class Color {
    static RED = new Color("red");
    static BLACK = new Color("black");

    constructor(name) {
        this.name = name;
    }
}

class Node {
    constructor(value, parent=null) {
        this.value = value;
        this.parent = parent;
        this.color = Color.RED;
    }

    get isLeft() {
        return this.parent && this == this.parent.left;
    }

    get isRight() {
        return this.parent && this == this.parent.right;
    }

    get hasRedChild() {
        return (this.left && this.left.color == Color.RED) ||
               (this.right && this.right.color == Color.RED);
    }

    get grandparent() {
        if (!this.parent || !this.parent.parent) return null;
        return this.parent.parent;
    }

    get uncle() {
        if (!this.grandparent) return null;
        if (this.parent.isLeft) return this.grandparent.right;
        return this.grandparent.left;
    }

    get sibling()  {
        if (!this.parent) return null;
        if (this.isLeft) return this.parent.right;
        return this.parent.left;
    }
}

class RBTree {
    constructor() {
        this.root = null
    }

    bstInsert(value) {
        if (this.root == null) {
            this.root = new Node(value);
            return this.root;
        }

        function traverse(cur) {
            if (value < cur.value) {
                if (cur.left) return traverse(cur.left);
                else return cur.left = new Node(value, cur);
            } else {
                if (cur.right) return traverse(cur.right);
                else return cur.right = new Node(value, cur);
            }
        }

        return traverse(this.root);
    }

    successor(node) {
        while (node.left)
            node = node.left;

        return node;
    }

    bstReplace(node) {
        if (node.left && node.right) return this.successor(node.right);
        if (!node.left && !node.right) return null;

        if (node.left) return node.left;
        return node.right;
    }

    rotateLeft(node) {
        let right = node.right;
        node.right = right.left;

        if (node.right) node.right.parent = node;
        right.parent = node.parent;

        if (!node.parent) this.root = right;
        else if (node.parent.left == node) node.parent.left = right;
        else node.parent.right = right;

        right.left = node;
        node.parent = right;
    }

    rotateRight(node) {
        let left = node.left;
        node.left = left.right;

        if (node.left) node.left.parent = node;
        left.parent = node.parent;

        if (!node.parent) this.root = left;
        else if (node.parent.left == node) node.parent.left = left;
        else node.parent.right = left;

        left.right = node;
        node.parent = left;
    }

    swapColors(a, b) {
        let t = a.color;
        a.color = b.color;
        b.color = t;
    }

    swapValues(a, b) {
        let t = a.value;
        a.value = b.value;
        b.value = t;
    }

    fixDoubleRed(node) {
        if (node == this.root) {
            node.color = Color.BLACK;
            return;
        }

        let parent = node.parent;
        let grandparent = node.grandparent;
        let uncle = node.uncle;

        if (parent.color == Color.BLACK) return;

        if (uncle && uncle.color == Color.RED) {
            parent.color = Color.BLACK;
            uncle.color = Color.BLACK;
            grandparent.color = Color.RED;
            this.fixDoubleRed(grandparent);
            return;
        }

        if (parent.isLeft) {
            if (node.isLeft) this.swapColors(parent, grandparent);
            else {
                this.rotateLeft(parent);
                this.swapColors(node, grandparent);
            }

            this.rotateRight(grandparent);
        } else {
            if (node.isRight) this.swapColors(parent, grandparent);
            else {
                this.rotateRight(parent);
                this.swapColors(node, grandparent);
            }

            this.rotateLeft(grandparent);
        }
    }

    fixDoubleBlack(node) {
        if (node == this.root) return;

        let sibling = node.sibling;
        let parent = node.parent;

        if (!sibling) {
            this.fixDoubleBlack(parent);
            return;
        }

        // Case 2
        if (sibling.color == Color.RED) {
            parent.color = Color.RED;
            sibling.color = Color.BLACK;
            if (sibling.isLeft) this.rotateRight(parent);
            else this.rotateLeft(parent);

            this.fixDoubleBlack(node);
            return;
        }

        if (sibling.hasRedChild) {
            if (sibling.left && sibling.left.color == Color.RED) {
                if (sibling.isLeft) {
                    sibling.left.color = Color.BLACK;
                    sibling.color = parent.color;
                    this.rotateRight(parent);
                } else {
                    sibling.left.color = parent.color;
                    this.rotateRight(sibling)
                    this.rotateLeft(parent);
                }
            } else {
                if (sibling.isRight) {
                    sibling.right.color = Color.BLACK;
                    sibling.color = parent.color;
                    this.rotateLeft(parent);
                } else {
                    sibling.right.color = parent.color;
                    this.rotateLeft(sibling)
                    this.rotateRight(parent);
                }
            }
            
            parent.color = Color.BLACK;
            return;
        }

        // Case 3 & 4
        sibling.color = Color.RED;
        if (parent.color == Color.RED) parent.color = Color.BLACK;
        else this.fixDoubleBlack(parent);
    }

    search(value) {
        function traverse(cur) {
            if (!cur) return null;
            if (value == cur.value) return cur;
            if (value < cur.value) return traverse(cur.left);
            return traverse(cur.right);
        }

        return traverse(this.root);
    }

    insert(value) {
        let node = this.bstInsert(value);
        this.fixDoubleRed(node);
    }

    deleteNode(node) {
        if (!node) return;

        let replacement = this.bstReplace(node);
        let parent = node.parent;

        if (!replacement) {
            if (node == this.root) this.root = null;
            else {
                if (node.color == Color.BLACK) this.fixDoubleBlack(node);
                if (node.isLeft) parent.left = null;
                else parent.right = null;
            }
            return;
        }

        if (!node.left || !node.right) {
            // 1 child
            if (node == this.root) {
                node.value = replacement.value;
                node.left = node.right = null;
            } else {
                if (node.isLeft) parent.left = replacement;
                else parent.right = replacement;
                replacement.parent = parent;

                if (node.color == Color.BLACK && replacement.color == Color.BLACK) this.fixDoubleBlack(replacement);
                else node.color = Color.BLACK;
            }

            return;
        }

        this.swapValues(node, replacement);
        this.deleteNode(replacement);
    }

    delete(value) {
        let node = this.search(value);
        this.deleteNode(node);
    }

    inorder() {
        let values = [];

        function traverse(cur) {
            if (cur.left) traverse(cur.left);
            values.push(cur.value);
            if (cur.right) traverse(cur.right);
        }

        if (this.root) traverse(this.root);

        console.log("In-order: ", ...values);
    }

    levelOrder() {
        let values = [];
        let queue = [];
        if (this.root) queue.push(this.root);

        while (queue.length) {
            let cur = queue.shift();
            values.push(cur.value);

            if (cur.left) queue.push(cur.left);
            if (cur.right) queue.push(cur.right);
        }

        console.log("Level-order: ", ...values);
    }
}

let tree = new RBTree();

let insertions = [7, 3, 18, 10, 22, 8, 11, 26, 2, 6, 13];
let deletions = [18, 11, 3, 10, 22];

console.log("Inserting: ", ...insertions);
for (v of insertions) tree.insert(v);

tree.inorder();
tree.levelOrder();

console.log();

console.log("Deleting: ", ...deletions);
for (v of deletions) tree.delete(v);

tree.inorder();
tree.levelOrder();