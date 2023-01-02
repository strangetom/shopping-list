export class Catalog {
    constructor() {
        let existingCatalog = localStorage.getItem("catalog");
        if (existingCatalog != null) {
            this.catalog = JSON.parse(existingCatalog);
            console.log("Using local catalog");
        }
        else {
            fetch("/catalog.json")
                .then((response) => response.json())
                .then((data) => {
                this.catalog = data;
                this.save();
                console.log("Initialised new catalog");
            });
        }
    }
    save() {
        localStorage.setItem("catalog", JSON.stringify(this.catalog));
    }
    suggest(fragment) {
        let filteredItems = Object.fromEntries(Object.entries(this.catalog).filter(([key]) => key.startsWith(fragment.toLowerCase())));
        let sortedFilteredItems = Object.entries(filteredItems).sort(function compareFn(a, b) {
            return b[1].modified - a[1].modified;
        });
        return Object.fromEntries(sortedFilteredItems.slice(0, 10));
    }
    update(item, categoryId) {
        this.catalog[item.toLowerCase()] = {
            modified: Date.now(),
            category: categoryId,
        };
        this.save();
    }
}
