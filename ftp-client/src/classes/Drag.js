export default class SelectionRect {
    constructor() {
        this.selecting = false;
        this.top_left_x = 0;
        this.top_left_y = 0;
        this.bottom_right_x = 0;
        this.bottom_right_y = 0;
        this.sq_width = 0;
        this.sq_height = 0;
        this.el = document.createElement("div");
        this.handleMouseMoveBound = this.handleMouseMove.bind(this);

        document.addEventListener("mousedown", this.init.bind(this));

        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }

    init(e) {
        if (e) {
            this.selecting = true;

            this.top_left_x = e.clientX;
            this.top_left_y = e.clientY;

            this.el.style.position = "fixed";
            this.el.style.zIndex = "999999";
            this.el.style.border = "1px solid rgb(255 255 255 /40%)";
            this.el.style.background = "rgb(255 255 255 /20%)";
            this.el.style.left = `${this.top_left_x}px`;
            this.el.style.top = `${this.top_left_y}px`;
            this.el.style.width = `${this.sq_width}px`;
            this.el.style.height = `${this.sq_height}px`;

            const body = document.querySelector("body");
            body.appendChild(this.el);

            this.toggleAll(e)

            document.addEventListener("mousemove", this.handleMouseMoveBound);
        }
    }

    checkOverlap(element) {
        const elementRect = element.getBoundingClientRect();
        const selectionRect = this.el.getBoundingClientRect();

        return (
            elementRect.left < selectionRect.right &&
            elementRect.right > selectionRect.left &&
            elementRect.top < selectionRect.bottom &&
            elementRect.bottom > selectionRect.top
        );
    }

    toggleSelectedClass(element, e) {
        if (this.checkOverlap(element)) {
            element.classList.add("selected");
            element.dispatchEvent(new Event("selectionmouseover"));
        } else {
            if (!e.shiftKey) {
                element.classList.remove("selected");
                element.dispatchEvent(new Event("selectionmouseout"));
            }
        }
    }

    toggleAll(e) {
        const items = document.querySelectorAll(".item");
        items.forEach((item) => {
            this.toggleSelectedClass(item, e);
        });
    }

    handleMouseMove(e) {
        this.bottom_right_x = e.clientX;
        this.bottom_right_y = e.clientY;
        let wid;
        let height;

        if (this.bottom_right_x > this.top_left_x) {
            this.el.style.left = `${this.top_left_x}px`;
            wid = this.bottom_right_x - this.top_left_x;
        }

        if (this.bottom_right_y > this.top_left_y) {
            this.el.style.top = `${this.top_left_y}px`;
            height = this.bottom_right_y - this.top_left_y;
        }

        if (this.bottom_right_x < this.top_left_x) {
            this.el.style.left = `${this.bottom_right_x}px`;
            wid = this.top_left_x - this.bottom_right_x;
        }

        if (this.bottom_right_y < this.top_left_y) {
            this.el.style.top = `${this.bottom_right_y}px`;
            height = this.top_left_y - this.bottom_right_y;
        }

        if (this.bottom_right_x === this.top_left_x) {
            this.el.style.left = `${this.top_left_x}px`;
            wid = 0;
        }

        if (this.bottom_right_y === this.top_left_y) {
            this.el.style.top = `${this.top_left_y}px`;
            height = 0;
        }

        this.el.style.width = `${wid}px`;
        this.el.style.height = `${height}px`;

        this.toggleAll(e)
    }

    handleMouseUp(e) {
        this.selecting = false;

        const body = document.querySelector("body");
        body.removeChild(this.el);

        document.removeEventListener("mousemove", this.handleMouseMoveBound);
    }
}
