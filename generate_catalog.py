#!/bin/env python3

import sqlite3
import json

CATEGORIES = {
  "Bread & Pastries": {"color": "#7c6f64", "id": 0},
  "Fruits & Vegetables": {"color": "#98971a", "id": 1},
  "Ingredients & Spices": {"color": "#d79921", "id": 2},
  "Meat & Fish": {"color": "#cc241d", "id": 3},
  "Medicine": {"color": "#689d6a", "id": 4},
  "Non-Food Items": {"color": "#d65d0e", "id": 5},
  "Other Food Items": {"color": "#83a598", "id": 6},
  "Refrigerated & Frozen": {"color": "#458588", "id": 7},
  "Snacks & Beverages": {"color": "#b16286", "id": 8},  
  "Uncategorized": {"color": "#a89984", "id": 9}, 
  "Alcohol": {"id": 8}  
}

if __name__ == "__main__":

    with sqlite3.connect("CINNAMON_DB.db") as conn:
        c = conn.cursor()
        c.execute(
            "SELECT CATALOG.item_name, CATALOG.mod_ms, CATEGORIES.ctry_name FROM CATALOG INNER JOIN CATEGORIES ON CATALOG.ctry_val = CATEGORIES.ctry_val GROUP BY item_name HAVING MAX(CATALOG.mod_ms)"
        )
        res = c.fetchall()

    catalog = {
        name.lower(): {"modified": timestamp, "category": CATEGORIES[category]["id"]}
        for name, timestamp, category in res
    }

    with open("catalog.json", "w") as f:
        json.dump(catalog, f, indent=2)
