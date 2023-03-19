export class ShoppingList {
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
    removeItem(index) {
        this.currentList.splice(index, 1);
        this.save();
    }
}
