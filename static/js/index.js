const categoryColours = {
    "Fruits & Vegetables": { "light": "#b8bb26", "dark": "#98971a" },
    "Break & Pastries": { "light": "#fabd2f", "dark": "#d79921" },
    "Ingredients & Spices": { "light": "#fabd2f", "dark": "#d79921" },
    "Snacks & Beverages": { "light": "#d3869b", "dark": "#b16286" },
    "Meat & Fish": { "light": "#fb4934", "dark": "#cc241d" },
    "Refrigerated & Frozen": { "light": "#83a598", "dark": "#458588" },
    "Non-food Items": { "light": "#fe8019", "dark": "#d65d0e" },
    "Medicine": { "light": "#8ec07c", "dark": "#689d6a" },
};
var currentList = [
    {
        item: "Plain flour",
        quantity: "200",
        units: "g",
        notes: "",
        category: "Ingredients & Spices",
        done: false,
    },
    {
        item: "Black pepper",
        quantity: "",
        units: "",
        notes: "",
        category: "Ingredients & Spices",
        done: false,
    },
    {
        item: "Caster sugar",
        quantity: "500",
        units: "g",
        notes: "Golden",
        category: "Ingredients & Spices",
        done: false,
    },
    {
        item: "Honey",
        quantity: "",
        units: "",
        notes: "",
        category: "Ingredients & Spices",
        done: false,
    },
    {
        item: "Apples",
        quantity: "",
        units: "",
        notes: "",
        category: "Fruits & Vegetables",
        done: false,
    },
    {
        item: "Tenderstem brocolli",
        quantity: "200",
        units: "g",
        notes: "",
        category: "Fruits & Vegetables",
        done: false,
    },
    {
        item: "Onions",
        quantity: "4",
        units: "",
        notes: "",
        category: "Fruits & Vegetables",
        done: false,
    },
];
function populateList() {
    let listEl = document.querySelector("#list");
    let categories = new Set(currentList.map((i) => i.category));
    let sorted_categories = Array.from(categories).sort();
    for (const category of sorted_categories) {
        let h2 = document.createElement("h2");
        h2.innerText = category;
        listEl.appendChild(h2);
        let ul = document.createElement("ul");
        listEl.appendChild(ul);
        let items = currentList
            .map((data, idx) => ({ data, idx }))
            .filter((el) => el.data.category == category);
        for (const item of items) {
            let data = item.data;
            let index = item.idx;
            let el = new ListItem(data, index);
            ul.appendChild(el);
        }
    }
}
class ListItem extends HTMLLIElement {
    constructor(data, index) {
        super();
        this.data = data;
        this.index = index;
        this.classList.add("item");
        let table = document.createElement("table");
        this.appendChild(table);
        let tr = document.createElement("tr");
        table.appendChild(tr);
        let td_left = document.createElement("td");
        let color = categoryColours[this.data.category];
        let svg = createSVG(this.data.item.slice(0, 1), color.dark, color.light);
        td_left.appendChild(svg);
        tr.appendChild(td_left);
        let td_mid = document.createElement("td");
        td_mid.addEventListener("click", this.showEditDialog.bind(this));
        tr.appendChild(td_mid);
        let h4 = document.createElement("h4");
        td_mid.appendChild(h4);
        let item_details = document.createElement("div");
        item_details.classList.add("item-details");
        td_mid.appendChild(item_details);
        let quantity_units = document.createElement("small");
        quantity_units.classList.add("quantity-units");
        item_details.appendChild(quantity_units);
        let note = document.createElement("small");
        note.classList.add("note");
        item_details.appendChild(note);
        let td_right = document.createElement("td");
        tr.appendChild(td_right);
        let delete_button = document.createElement("button");
        delete_button.innerText = "D";
        delete_button.addEventListener("click", this.done.bind(this));
        td_right.appendChild(delete_button);
        this.updateData();
    }
    updateData() {
        let h4 = this.querySelector("h4");
        let note = this.querySelector(".note");
        let quantity_units = this.querySelector(".quantity-units");
        let item_details = this.querySelector(".item-details");
        h4.innerText = this.data.item;
        note.innerText = this.data.notes;
        if (!(this.data.quantity == "" && this.data.units == "")) {
            quantity_units.innerText = this.data.quantity + " " + this.data.units;
        }
        else {
            quantity_units.innerText = "";
        }
        if (quantity_units.innerText != "" && note.innerText != "") {
            let divider = document.createElement("small");
            divider.innerHTML = "&nbsp;&middot;&nbsp;";
            item_details.insertBefore(divider, note);
        }
    }
    done() {
        currentList[this.index].done = !currentList[this.index].done;
        this.classList.toggle("done");
    }
    showEditDialog() {
        var editModal = document.querySelector("#edit-item-dialog");
        editModal.replaceWith(editModal.cloneNode(true));
        editModal = document.querySelector("#edit-item-dialog");
        editModal.querySelector("#name").value =
            this.data.item;
        editModal.querySelector("#quantity").value =
            this.data.quantity;
        editModal.querySelector("#units").value =
            this.data.units;
        editModal.querySelector("#notes").value =
            this.data.notes;
        editModal.showModal();
        editModal.addEventListener("close", this.edit.bind(this));
        editModal.addEventListener("click", (event) => {
            if (event.target.nodeName === "DIALOG") {
                editModal.returnValue = "cancel";
                editModal.close();
            }
        });
    }
    edit() {
        let editModal = document.querySelector("#edit-item-dialog");
        if (editModal.returnValue == "submit") {
            this.data.item = editModal.querySelector("#name").value;
            this.data.quantity = editModal.querySelector("#quantity").value;
            this.data.units = editModal.querySelector("#units").value;
            this.data.notes = editModal.querySelector("#notes").value;
            this.updateData();
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    customElements.define("list-item", ListItem, {
        extends: "li",
    });
    populateList();
});
function createSVG(letter, text_colour, bg_colour) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    svg.setAttribute("width", "40");
    svg.setAttribute("height", "40");
    svg.classList.add("icon");
    circle.setAttribute("cx", "20");
    circle.setAttribute("cy", "20");
    circle.setAttribute("r", "20");
    circle.setAttribute("fill", bg_colour);
    text.setAttribute("x", "50%");
    text.setAttribute("y", "80%");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", text_colour);
    text.setAttribute("font-size", "35px");
    text.textContent = letter;
    svg.appendChild(circle);
    svg.appendChild(text);
    return svg;
}
