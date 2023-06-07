import { ShoppingList } from "./module-shoppinglist.js";
import { Catalog } from "./module-catalog.js";
import { Bundles } from "./module-bundles.js";
var shoppingList;
var CATALOG = new Catalog();
var BUNDLES = new Bundles();
const ITEM_PATTERN = /(?<quantity>[\d\.]+\s)?(?<unit>(g|G|kg|Kg|ml|Ml|l|L)\s)?(?<name>.*)/;
const categoryInfo = {
    "Bread & Pastries": { color: "#b17744", id: 0 },
    "Fruits & Vegetables": { color: "#98971a", id: 1 },
    "Ingredients & Spices": { color: "#d79921", id: 2 },
    "Meat & Fish": { color: "#cc241d", id: 3 },
    Medicine: { color: "#689d6a", id: 4 },
    "Non-Food Items": { color: "#d65d0e", id: 5 },
    "Other Food Items": { color: "#83a598", id: 6 },
    "Refrigerated & Frozen": { color: "#458588", id: 7 },
    "Snacks & Beverages": { color: "#b16286", id: 8 },
    Uncategorized: { color: "#a89984", id: 9 },
};
function getCategoryId(name) {
    return categoryInfo[name].id;
}
function getCategoryName(id) {
    return Object.entries(categoryInfo).find((entry) => entry[1].id == id)[0];
}
const hideDialogAnimation = [{ transform: "translateY(-100%" }];
const hideDialogTiming = {
    duration: 100,
    easing: "ease-out",
};
document.addEventListener("DOMContentLoaded", () => {
    installServiceWorker();
    customElements.define("list-item", ListItem, {
        extends: "li",
    });
    customElements.define("suggested-item", SuggestedItem, {
        extends: "li",
    });
    customElements.define("suggested-bundle", SuggestedBundle, {
        extends: "li",
    });
    shoppingList = new ShoppingList();
    shoppingList.purgeDone();
    populateList();
    let addBtn = document.querySelector("#fab");
    let addModal = document.querySelector("#new-item-dialog");
    addBtn.addEventListener("click", () => {
        addModal.querySelector("#name").value = "";
        addModal.querySelector("#suggestions").replaceChildren();
        addModal.showModal();
    });
    let submitBtn = addModal.querySelector("button[value='submit']");
    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        let animation = addModal.animate(hideDialogAnimation, hideDialogTiming);
        animation.addEventListener("finish", () => {
            addModal.close("submit");
            addNewItem();
        });
    });
    addModal.addEventListener("click", (event) => {
        if (event.target.nodeName === "DIALOG") {
            let animation = addModal.animate(hideDialogAnimation, hideDialogTiming);
            animation.addEventListener("finish", () => {
                addModal.close("cancel");
            });
        }
    });
    let addItemInput = addModal.querySelector("#name");
    addItemInput.addEventListener("input", suggestItems);
    let downloadBtn = document.querySelector("#download-catalog");
    downloadBtn.addEventListener("click", downloadCatalog);
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
        if (this.data.done) {
            this.classList.add("done");
        }
        let table = document.createElement("table");
        this.appendChild(table);
        let tr = document.createElement("tr");
        table.appendChild(tr);
        let td_left = document.createElement("td");
        let color = categoryInfo[this.data.category].color;
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
            quantity_units.innerText =
                this.data.quantity + " " + this.data.units.toLowerCase();
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
        CATALOG.update(this.data.item, categoryInfo[this.data.category].id);
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
        let submitBtn = editModal.querySelector("button[value='submit']");
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            let animation = editModal.animate(hideDialogAnimation, hideDialogTiming);
            animation.addEventListener("finish", () => {
                editModal.close("submit");
                this.edit();
            });
        });
        let cancelBtn = editModal.querySelector("button[value='cancel']");
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            let animation = editModal.animate(hideDialogAnimation, hideDialogTiming);
            animation.addEventListener("finish", () => {
                editModal.close("cancel");
                this.edit();
            });
        });
        let deleteBtn = editModal.querySelector("button[value='delete']");
        deleteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            let animation = editModal.animate(hideDialogAnimation, hideDialogTiming);
            animation.addEventListener("finish", () => {
                editModal.close("delete");
                this.edit();
            });
        });
        editModal.addEventListener("click", (event) => {
            if (event.target.nodeName === "DIALOG") {
                let animation = editModal.animate(hideDialogAnimation, hideDialogTiming);
                animation.addEventListener("finish", () => {
                    editModal.close("cancel");
                });
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
        else if (editModal.returnValue == "delete") {
            if (window.confirm(`Remove ${this.data.item} from catalog?`)) {
                CATALOG.delete(this.data.item);
                shoppingList.removeItem(this.index);
                populateList();
            }
        }
    }
}
class SuggestedItem extends HTMLLIElement {
    constructor(item, time, categoryId) {
        super();
        this.item = item;
        this.category = getCategoryName(categoryId);
        this.time = time;
        this.classList.add("suggestion");
        this.dataset.item = this.item;
        this.dataset.category = this.category;
        this.addEventListener("click", (e) => {
            let addModal = document.querySelector("#new-item-dialog");
            let animation = addModal.animate(hideDialogAnimation, hideDialogTiming);
            animation.addEventListener("finish", () => {
                addModal.close("cancel");
            });
            addNewItemSuggestion(e);
        });
        let table = document.createElement("table");
        this.appendChild(table);
        let tr = document.createElement("tr");
        table.appendChild(tr);
        let td_left = document.createElement("td");
        td_left.classList.add("suggestion-icon");
        let color = categoryInfo[this.category].color;
        let svg = createSVG("", color);
        td_left.appendChild(svg);
        tr.appendChild(td_left);
        let td_right = document.createElement("td");
        td_right.classList.add("suggestion-text");
        tr.appendChild(td_right);
        let h4 = document.createElement("h4");
        h4.innerText = titleCase(this.item);
        td_right.appendChild(h4);
        let last_bought = document.createElement("small");
        last_bought.innerText = this.readableTime(this.time);
        td_right.appendChild(last_bought);
    }
    readableTime(millis) {
        if (millis == 1) {
            return "Never";
        }
        let secondsAgo = (Date.now() - millis) / 1000;
        if (secondsAgo < 3600) {
            return "Just now";
        }
        else if (secondsAgo < 3600 * 24) {
            return "Earlier today";
        }
        else if (secondsAgo < 3600 * 24 * 2) {
            return "Yesterday";
        }
        else if (secondsAgo < 3600 * 24 * 3) {
            return "2 days ago";
        }
        else if (secondsAgo < 3600 * 24 * 4) {
            return "3 days ago";
        }
        else if (secondsAgo < 3600 * 24 * 5) {
            return "4 days ago";
        }
        else if (secondsAgo < 3600 * 24 * 6) {
            return "5 days ago";
        }
        else if (secondsAgo < 3600 * 24 * 7) {
            return "6 days ago";
        }
        else if (secondsAgo < 3600 * 24 * 8) {
            return "1 weeka ago";
        }
        else if (secondsAgo < 3600 * 24 * 15) {
            return "2 weeks ago";
        }
        else if (secondsAgo < 3600 * 24 * 22) {
            return "3 weeks ago";
        }
        else if (secondsAgo < 3600 * 24 * 30) {
            return "1 month ago";
        }
        else if (secondsAgo < 3600 * 24 * 30 * 2) {
            return "2 months ago";
        }
        else if (secondsAgo < 3600 * 24 * 30 * 3) {
            return "3 months ago";
        }
        else if (secondsAgo < 3600 * 24 * 30 * 4) {
            return "4 months ago";
        }
        else if (secondsAgo < 3600 * 24 * 30 * 5) {
            return "5 months ago";
        }
        else if (secondsAgo < 3600 * 24 * 30 * 6) {
            return "6 months ago";
        }
        else if (secondsAgo < 3600 * 24 * 365) {
            return "1 year ago";
        }
        else {
            return ">1 year ago";
        }
    }
}
class SuggestedBundle extends HTMLLIElement {
    constructor(bundle) {
        super();
        this.bundle = bundle;
        this.classList.add("suggestion");
        this.classList.add("bundle");
        this.dataset.bundle = this.bundle;
        this.addEventListener("click", (e) => {
            let addModal = document.querySelector("#new-item-dialog");
            let animation = addModal.animate(hideDialogAnimation, hideDialogTiming);
            animation.addEventListener("finish", () => {
                addModal.close("cancel");
            });
            addNewBundleSuggestion(e);
        });
        let table = document.createElement("table");
        this.appendChild(table);
        let tr = document.createElement("tr");
        table.appendChild(tr);
        let h4 = document.createElement("h4");
        h4.classList.add("suggestion-text");
        h4.innerHTML = `&nbsp;&nbsp;Bundle: ${titleCase(this.bundle)}`;
        tr.appendChild(h4);
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
        let quantity = regexParts.groups.quantity || "";
        let units = regexParts.groups.unit || "";
        let newItem = {
            item: titleCase(regexParts.groups.name),
            quantity: quantity.trim(),
            units: units.trim(),
            notes: "",
            category: "Uncategorized",
            done: false,
        };
        if (CATALOG.includes(regexParts.groups.name)) {
            let categoryId = CATALOG.catalog[regexParts.groups.name.toLowerCase()].category;
            newItem.category = getCategoryName(categoryId);
        }
        shoppingList.addItem(newItem);
        populateList();
    }
}
function suggestItems(event) {
    let suggestiondEl = document.querySelector("#suggestions");
    suggestiondEl.replaceChildren();
    let fragment = event.target.value;
    let regexParts = ITEM_PATTERN.exec(fragment);
    if (regexParts.groups.name != "") {
        let bundles = BUNDLES.suggest(regexParts.groups.name);
        for (let bundle of bundles) {
            let el = new SuggestedBundle(bundle);
            suggestiondEl.appendChild(el);
        }
        let suggestions = CATALOG.suggest(regexParts.groups.name);
        for (let suggest of Object.entries(suggestions)) {
            let el = new SuggestedItem(suggest[0], suggest[1]["modified"], suggest[1]["category"]);
            suggestiondEl.appendChild(el);
        }
    }
}
function addNewItemSuggestion(event) {
    let addModal = document.querySelector("#new-item-dialog");
    let name = addModal.querySelector("#name").value;
    let regexParts = ITEM_PATTERN.exec(name);
    let selection = event.target.closest("li").dataset.item;
    let category = event.target.closest("li").dataset.category;
    let quantity = regexParts.groups.quantity || "";
    let units = regexParts.groups.unit || "";
    let newItem = {
        item: titleCase(selection),
        quantity: quantity.trim(),
        units: units.trim(),
        notes: "",
        category: category,
        done: false,
    };
    shoppingList.addItem(newItem);
    populateList();
}
function addNewBundleSuggestion(event) {
    let bundle = event.target.closest("li").dataset.bundle;
    for (let item of BUNDLES.items(bundle)) {
        shoppingList.addItem(item);
    }
    populateList();
}
function createSVG(letter, bg_colour) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    svg.setAttribute("viewBox", "0 0 40 40");
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
function downloadCatalog() {
    var catalogStr = "data:text/json;charset=utf-8," +
        encodeURIComponent(localStorage.getItem("catalog"));
    let link = document.createElement("a");
    link.setAttribute("href", catalogStr);
    link.setAttribute("download", "catalog.json");
    link.click();
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
