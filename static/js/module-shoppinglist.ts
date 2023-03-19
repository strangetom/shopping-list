export class ShoppingList {
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

  /**
   * Remove specific item from shopping list
   * @param {number} index Index of item to remove from list
   */
  removeItem(index: number) {
    this.currentList.splice(index, 1);
    this.save();
  }
}

export interface ItemData {
  item: string;
  quantity: string;
  units: string;
  notes: string;
  category: string;
  done: boolean;
}
