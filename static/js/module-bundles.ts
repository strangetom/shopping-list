export class Bundles {
  bundles;
  constructor() {
    let existingBundles = localStorage.getItem("bundles");
    if (existingBundles != null) {
      this.bundles = JSON.parse(existingBundles);
    } else {
      fetch("/bundles.json")
        .then((response) => response.json())
        .then((data) => {
          this.bundles = data;
          this.save();
        });
    }
  }

  save() {
    localStorage.setItem("bundles", JSON.stringify(this.bundles));
  }

  /**
   * Suggest bundles that start with fragment
   * @param {string} fragment Fragment of text used to match suggestion
   */
  suggest(fragment: string) {
    // Filter catalog to items starting with fragment
    let filteredBundles = Object.keys(this.bundles).filter((key) =>
      key.startsWith(fragment.toLowerCase())
    );

    return filteredBundles;
  }

  /**
   * Return items for given bundle
   * @param {string} bundle Name of bundle
   */
  items(bundle: string) {
    if (bundle in this.bundles) {
      return this.bundles[bundle];
    } else {
      return [];
    }
  }
}
