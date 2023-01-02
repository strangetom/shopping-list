export class Bundles {
    constructor() {
        let existingBundles = localStorage.getItem("bundles");
        if (existingBundles != null) {
            this.bundles = JSON.parse(existingBundles);
        }
        else {
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
    suggest(fragment) {
        let filteredBundles = Object.keys(this.bundles).filter((key) => key.startsWith(fragment.toLowerCase()));
        return filteredBundles;
    }
    items(bundle) {
        if (bundle in this.bundles) {
            return this.bundles[bundle];
        }
        else {
            return [];
        }
    }
}
