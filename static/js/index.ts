interface ItemData {
  item: string;
  quantity: string;
  units: string;
  notes: string;
  category: string;
  done: boolean;
}

var shoppingList;

const categoryColours = {
  "Fruits & Vegetables": { light: "#b8bb26", dark: "#98971a" },
  "Break & Pastries": { light: "#fabd2f", dark: "#d79921" },
  "Ingredients & Spices": { light: "#fabd2f", dark: "#d79921" },
  "Snacks & Beverages": { light: "#d3869b", dark: "#b16286" },
  "Meat & Fish": { light: "#fb4934", dark: "#cc241d" },
  "Refrigerated & Frozen": { light: "#83a598", dark: "#458588" },
  "Non-food Items": { light: "#fe8019", dark: "#d65d0e" },
  Medicine: { light: "#8ec07c", dark: "#689d6a" },
  Uncategorised: { light: "#ebdbb2", dark: "#a89984" },
};

class ShoppingList {
  currentList;
  constructor() {
    let storedList = localStorage.getItem("currentList");
    if (storedList != null) {
      this.currentList = JSON.parse(storedList);
    } else {
      this.currentList = [];
    }
  }

  /**
   * Save current list to local storage
   */
  save() {
    localStorage.setItem("currentList", JSON.stringify(this.currentList));
  }

  /**
   * Add new item to list
   * @param {ItemData} item New item to add to list
   */
  addItem(data: ItemData) {
    this.currentList.push(data);
    this.save();
  }

  /**
   * Update item in list
   * @param {ItemData} data  New item data for item
   * @param {number}   index Index of item in list
   */
  updateItem(data: ItemData, index: number) {
    this.currentList[index] = data;
    this.save();
  }

  /**
   * Toggle done flag for item
   * @param {number} index Index of item to toggle done flag
   */
  toggleDone(index: number) {
    this.currentList[index].done = !this.currentList[index].done;
    this.save();
  }

  /**
   * Purge items marked as done from list
   */
  purgeDone() {
    let purgedList = this.currentList.filter((item) => !item.done);
    this.currentList = purgedList;
    this.save();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  customElements.define("list-item", ListItem, {
    extends: "li",
  });
  shoppingList = new ShoppingList();
  shoppingList.purgeDone();
  populateList();

  let addBtn: HTMLButtonElement = document.querySelector("#fab");
  let addModal: HTMLDialogElement = document.querySelector("#new-item-dialog");
  addBtn.addEventListener("click", () => {
    (addModal.querySelector("#name") as HTMLInputElement).value = "";
    addModal.showModal();
  });
  addModal.addEventListener("close", addNewItem);
  addModal.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).nodeName === "DIALOG") {
      addModal.returnValue = "cancel";
      addModal.close();
    }
  });
});

function populateList() {
  let listEl = document.querySelector("#list");
  listEl.replaceChildren();

  let categories: Set<string> = new Set(
    shoppingList.currentList.map((i) => i.category)
  );
  let sorted_categories = Array.from(categories).sort();

  for (const category of sorted_categories) {
    // Create heading and ul
    let h2 = document.createElement("h2");
    h2.innerText = category;
    listEl.appendChild(h2);

    let ul = document.createElement("ul");
    listEl.appendChild(ul);

    // Filter
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
  data: ItemData; // The list item data: item, quantity, units, notes
  index: number; // The index of this item in the current list storage array

  constructor(data: ItemData, index: number) {
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
    let svg = createSVG(
      this.data.item.slice(0, 1).toUpperCase(),
      color.light,
      color.dark
    );
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

  /**
   * Update displayed item using this.data object.
   */
  updateData() {
    let h4 = this.querySelector("h4");
    let note = this.querySelector(".note") as HTMLElement;
    let category = this.querySelector(".category") as HTMLSelectElement;
    let quantity_units = this.querySelector(".quantity-units") as HTMLElement;
    let item_details = this.querySelector(".item-details") as HTMLDivElement;

    h4.innerText = this.data.item;
    note.innerText = this.data.notes;

    // Only add quantity and unit is they're not both empty
    if (!(this.data.quantity == "" && this.data.units == "")) {
      quantity_units.innerText = this.data.quantity + " " + this.data.units;
    } else {
      quantity_units.innerText = "";
    }

    // If there's a quantity and a note, insert a divider to seperate them
    if (quantity_units.innerText != "" && note.innerText != "") {
      let divider = document.createElement("small");
      divider.innerHTML = "&nbsp;&middot;&nbsp;";
      item_details.insertBefore(divider, note);
    }
  }

  /**
   * Toggle an item's "done" state.
   */
  done() {
    // No need to set done within this class as this.data is a
    // reference to the item shoppingList.currentList
    shoppingList.toggleDone(this.index);
    this.classList.toggle("done");
  }

  /**
   * Show the edit dialog and set the input values to the current item's data.
   */
  showEditDialog() {
    // Only show edit dialog if item is not done
    if (this.data.done) {
      return;
    }

    /* 
    First clone the edit modal and replace the existing one with the clone
    Cloning the element does not copy the event listeners, which is what we're trying to acheive.
    */
    var editModal: HTMLDialogElement =
      document.querySelector("#edit-item-dialog");
    editModal.replaceWith(editModal.cloneNode(true));

    // Get the edit modal (again, since this is a new element) and assign the data of the current item
    editModal = document.querySelector("#edit-item-dialog");
    (editModal.querySelector("#name") as HTMLInputElement).value =
      this.data.item;
    (editModal.querySelector("#quantity") as HTMLInputElement).value =
      this.data.quantity;
    (editModal.querySelector("#units") as HTMLSelectElement).value =
      this.data.units;
    (editModal.querySelector("#notes") as HTMLInputElement).value =
      this.data.notes;
    (editModal.querySelector("#category") as HTMLSelectElement).value =
      this.data.category;

    editModal.showModal();

    // Add event listeners to for closing the dialog
    editModal.addEventListener("close", this.edit.bind(this));
    editModal.addEventListener("click", (event) => {
      if ((event.target as HTMLElement).nodeName === "DIALOG") {
        editModal.returnValue = "cancel";
        editModal.close();
      }
    });
  }

  /**
   * Edit callback.
   * Modifies an item in the current list based on the edit dialog inputs.
   */
  edit() {
    let editModal: HTMLDialogElement =
      document.querySelector("#edit-item-dialog");

    if (editModal.returnValue == "submit") {
      this.data.item = (
        editModal.querySelector("#name") as HTMLInputElement
      ).value;
      this.data.quantity = (
        editModal.querySelector("#quantity") as HTMLInputElement
      ).value;
      this.data.units = (
        editModal.querySelector("#units") as HTMLSelectElement
      ).value;
      this.data.notes = (
        editModal.querySelector("#notes") as HTMLInputElement
      ).value;
      let previous_category = this.data.category;
      this.data.category = (
        editModal.querySelector("#category") as HTMLSelectElement
      ).value;

      this.updateData();
      shoppingList.save();

      if (previous_category != this.data.category) {
        populateList();
      }
    }
  }
}

function addNewItem() {
  let addModal: HTMLDialogElement = document.querySelector("#new-item-dialog");
  if (addModal.returnValue == "submit") {
    let name = (addModal.querySelector("#name") as HTMLInputElement).value;
    let newItem = {
      item: name,
      quantity: "",
      units: "",
      notes: "",
      category: "Uncategorised",
      done: false,
    };

    shoppingList.addItem(newItem);
    populateList();
  }
}

function createSVG(letter: string, text_colour: string, bg_colour: string) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

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
