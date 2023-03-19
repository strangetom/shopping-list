export class Catalog {
  catalog;
  constructor() {
    let existingCatalog = localStorage.getItem("catalog");
    if (existingCatalog != null) {
      this.catalog = JSON.parse(existingCatalog);
      console.log("Using local catalog");
    } else {
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

  /**
   * Return true if name is in catalog
   * @param {string} name Name of item to check
   */
  includes(name: string) {
    return Object.keys(this.catalog).includes(name.toLowerCase());
  }

  /**
   * Suggest items from catalog that start with fragment,
   * sorted by most recently added.
   * @param {string} fragment Fragment of text used to match suggestion
   */
  suggest(fragment: string) {
    // Filter catalog to items starting with fragment
    let filteredItems = Object.fromEntries(
      Object.entries(this.catalog).filter(([key]) =>
        key.startsWith(fragment.toLowerCase())
      )
    );
    // Order filtered items by most recent
    let sortedFilteredItems = Object.entries(filteredItems).sort(
      function compareFn(a: Object, b: Object) {
        return b[1].modified - a[1].modified;
      }
    );

    return Object.fromEntries(sortedFilteredItems.slice(0, 10));
  }

  /**
   * Update item last modified time and category in catalog.
   * @param {string} item       Item name
   * @param {number} categoryId Item category
   */
  update(item: string, categoryId: number) {
    this.catalog[item.toLowerCase()] = {
      modified: Date.now(),
      category: categoryId,
    };
    this.save();
  }

  /**
   * Delete item from catalog
   * @param {string} item Item name
   */
  delete(item: string) {
    delete this.catalog[item.toLowerCase()];
    this.save();
  }
}
