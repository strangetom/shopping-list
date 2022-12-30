var shoppingList;
const ITEM_PATTERN = /(?<quantity>[\d\.]+\s?)?(?<unit>(g|kg|ml|L)\s?)?(?<name>.*)/;
const categoryColours = {
    "Fruits & Vegetables": "#98971a",
    "Bread & Pastries": "#7c6f64",
    "Ingredients & Spices": "#d79921",
    "Snacks & Beverages": "#b16286",
    "Meat & Fish": "#cc241d",
    "Refrigerated & Frozen": "#458588",
    "Other Food Items": "#83a598",
    "Non-food Items": "#d65d0e",
    Medicine: "#689d6a",
    Uncategorised: "#a89984",
};
class ShoppingList {
    constructor() {
        let storedList = localStorage.getItem("currentList");
        if (storedList != null) {
            this.currentList = JSON.parse(storedList);
        }
        else {
            this.currentList = [];
        }
    }
    save() {
        localStorage.setItem("currentList", JSON.stringify(this.currentList));
    }
    addItem(data) {
        this.currentList.push(data);
        this.save();
    }
    updateItem(data, index) {
        this.currentList[index] = data;
        this.save();
    }
    toggleDone(index) {
        this.currentList[index].done = !this.currentList[index].done;
        this.save();
    }
    purgeDone() {
        let purgedList = this.currentList.filter((item) => !item.done);
        this.currentList = purgedList;
        this.save();
    }
}
document.addEventListener("DOMContentLoaded", () => {
    installServiceWorker();
    customElements.define("list-item", ListItem, {
        extends: "li",
    });
    shoppingList = new ShoppingList();
    shoppingList.purgeDone();
    populateList();
    let addBtn = document.querySelector("#fab");
    let addModal = document.querySelector("#new-item-dialog");
    addBtn.addEventListener("click", () => {
        addModal.querySelector("#name").value = "";
        addModal.showModal();
    });
    addModal.addEventListener("close", addNewItem);
    addModal.addEventListener("click", (event) => {
        if (event.target.nodeName === "DIALOG") {
            addModal.returnValue = "cancel";
            addModal.close();
        }
    });
});
function populateList() {
    let listEl = document.querySelector("#list");
    listEl.replaceChildren();
    let categories = new Set(shoppingList.currentList.map((i) => i.category));
    let sorted_categories = Array.from(categories).sort();
    for (const category of sorted_categories) {
        let h2 = document.createElement("h2");
        h2.innerText = category;
        h2.classList.add(category.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-"));
        listEl.appendChild(h2);
        let ul = document.createElement("ul");
        listEl.appendChild(ul);
        let items = shoppingList.currentList
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
        let svg = createSVG(this.data.item.slice(0, 1).toUpperCase(), color);
        svg.addEventListener("click", this.done.bind(this));
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
        delete_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${color}" style="scale: 1.3"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>`;
        delete_button.addEventListener("click", this.done.bind(this));
        td_right.appendChild(delete_button);
        this.updateData();
    }
    updateData() {
        let h4 = this.querySelector("h4");
        let note = this.querySelector(".note");
        let category = this.querySelector(".category");
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
        shoppingList.toggleDone(this.index);
        this.classList.toggle("done");
    }
    showEditDialog() {
        if (this.data.done) {
            return;
        }
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
        editModal.querySelector("#category").value =
            this.data.category;
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
            let previous_category = this.data.category;
            this.data.category = editModal.querySelector("#category").value;
            this.updateData();
            shoppingList.save();
            if (previous_category != this.data.category) {
                populateList();
            }
        }
    }
}
function titleCase(text) {
    let str = text
        .toLowerCase()
        .split(" ")
        .map((word) => {
        return word.replace(word[0], word[0].toUpperCase());
    });
    return str.join(" ");
}
function addNewItem() {
    let addModal = document.querySelector("#new-item-dialog");
    if (addModal.returnValue == "submit") {
        let name = addModal.querySelector("#name").value;
        let regexParts = ITEM_PATTERN.exec(name);
        let newItem = {
            item: titleCase(regexParts.groups.name),
            quantity: regexParts.groups.quantity || "",
            units: regexParts.groups.unit || "",
            notes: "",
            category: "Uncategorised",
            done: false,
        };
        shoppingList.addItem(newItem);
        populateList();
    }
}
function createSVG(letter, bg_colour) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    svg.setAttribute("width", "40");
    svg.setAttribute("height", "40");
    svg.classList.add("icon");
    circle.setAttribute("cx", "20");
    circle.setAttribute("cy", "20");
    circle.setAttribute("r", "18");
    circle.setAttribute("fill", bg_colour);
    text.setAttribute("x", "50%");
    text.setAttribute("y", "70%");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("font-size", "23px");
    text.textContent = letter;
    svg.appendChild(circle);
    svg.appendChild(text);
    return svg;
}
function installServiceWorker() {
    if ("serviceWorker" in navigator) {
        console.log("CLIENT: service worker registration in progress.");
        navigator.serviceWorker.register("/service-worker.js").then(function () {
            console.log("CLIENT: service worker registration complete.");
        }, function () {
            console.log("CLIENT: service worker registration failure.");
        });
    }
    else {
        console.log("CLIENT: service worker is not supported.");
    }
}
