# Ezitech IMS – Inventory Management System

## 1. Architecture Decision Log

### Decision: IndexedDB

For the Ezitech Inventory Management System, I have selected **IndexedDB** as the primary browser-based data persistence method.

### Reason for Choosing IndexedDB

IndexedDB is suitable for this project because:

- It supports structured data storage.
- It allows efficient searching and filtering through indexes.
- It supports database transactions.
- It uses asynchronous operations, helping maintain UI responsiveness.
- It can handle growing inventory records.

### Alternatives Considered

I considered two other storage options:

- LocalStorage
- Local JSON File

After comparing their features and limitations, IndexedDB was selected as the better option for managing structured inventory data.

---

## 2. Trade-off Analysis

### IndexedDB

**Advantages:**
- Stores structured JavaScript objects.
- Supports indexes for searching and filtering.
- Provides database transactions.
- Uses asynchronous operations.
- Suitable for larger and growing datasets.

**Disadvantages:**
- More complex to implement than LocalStorage.
- Requires asynchronous programming.
- Data is stored locally in the browser and does not automatically synchronize between devices.

### LocalStorage

**Advantages:**
- Easy to implement.
- Simple key-value storage.
- Suitable for small amounts of data.

**Disadvantages:**
- Stores data as strings.
- Synchronous operations can affect UI performance.
- Does not support built-in indexing or database transactions.
- Not ideal for managing structured inventory records.

### Local JSON File

**Advantages:**
- Human-readable format.
- Easy to create, import, and export.
- Useful for sample datasets and backups.

**Disadvantages:**
- Requires additional file-handling logic.
- Does not provide built-in database querying or transactions.
- Concurrent updates require careful handling.

---

## 3. Final Justification

IndexedDB was selected because Ezitech IMS requires structured asset records that may grow over time.

Its support for indexing, transactions, and asynchronous operations makes it more suitable than LocalStorage for this inventory application.

Although IndexedDB is more complex to implement, its advantages make it a better long-term choice for browser-based inventory management.

One limitation is that IndexedDB stores data separately in each browser and device. A backend database and API would be required in the future for centralized storage and multi-user synchronization.

# Task 2: Inventory Dashboard and Asset CRUD Interface

## Features

- Dashboard layout built with Tailwind's CSS Grid classes: sidebar, top bar, summary cards and the asset table.
- The sidebar is hidden on small screens and opens with a menu button. From the `md` size up it is a fixed column (`hidden md:flex` and `md:grid-cols-[220px_1fr]`).
- The table is rendered from the Task 1 data. `data/sample_assets.json` is loaded with `fetch` into a variable, and `showAssets()` builds the rows from it.
- Sortable table: click a column heading to sort ascending or descending.
- Search bar that filters by ID, name, category, location or status, plus dropdown filters for status, category and location.
- Add Asset form (in a modal) with client-side validation.
- Delete button with a confirmation dialog.
- Error messages under each field for invalid input.

## Validation Rules

| Field | Rule |
| ----- | ---- |
| ID | Required, format `AST-0001` (AST- and 4 digits), must not already exist. Letters are changed to capitals automatically. |
| Name | Required, at least 2 characters |
| Category | Required, chosen from the list |
| Location | Required, chosen from the list (Lab 1, Lab 2, Lab 3, IT Office) |
| Status | Required, one of the four statuses in the schema |

`last_updated` is set automatically when an asset is added.

## Project Structure

```
Ezitech-IMS/
├── index.html                  page markup with Tailwind classes
├── js/app.js                   fetch, rendering, sorting, search, validation, add, delete
├── data/sample_assets.json     20 sample assets made by generate_assets.py
├── generate_assets.py          sample data generator (Task 1)
├── asset.schema.json           asset JSON Schema (Task 1)
└── README.md
```

## Setup

Nothing needs to be installed. Tailwind CSS and Lucide icons are loaded from a CDN, so an internet connection is needed.

The page loads the sample data with `fetch`, which does not work when `index.html` is opened directly from the folder. Start a small local server instead:

```bash
cd Ezitech-IMS
python -m http.server 8000
```

Then open http://localhost:8000 in the browser.

To create a new sample data file (optional):

```bash
cd data
python ../generate_assets.py
```

## Testing

| # | Action | Expected result 

| 1 | Open the page | 20 assets are listed and the total card shows 20 |
| 2 | Click the Name heading twice | Rows sort A to Z, then Z to A, and the arrow changes |
| 3 | Type `canon` in the search bar | Only the Canon printers are shown |
| 4 | Type `zzzz` | "No assets found." |
| 5 | Choose a status or location in the dropdowns | Only matching assets are shown and the count updates |
| 6 | Click Add, clear the ID and click Save Asset | Red messages appear under every empty field and nothing is added |
| 7 | Enter the ID `abc` | "Invalid ID. Use the format AST-0001." |
| 8 | Enter the ID `AST-0001` | "This ID already exists." |
| 9 | Fill in all fields correctly and save | The modal closes, the asset appears in the table and the total goes up |
| 10 | Click Delete on a row, then Cancel | Nothing is deleted |
| 11 | Click Delete on a row, then Delete in the dialog | The asset is removed and the total goes down |
| 12 | Make the window about 390 px wide | The sidebar is hidden, the menu button opens it, and the page does not scroll sideways |

The browser console should show no errors during these steps.

## Notes and Limitations

- Changes (add and delete) are kept in a variable, so they are lost when the page is refreshed and the sample data is loaded again.
- Saving data with IndexedDB, as described in the decision log above, is planned for a later task.
- Categories and locations are chosen from fixed lists in the form to avoid spelling mistakes.
- Still to do in Task 3: saving data between visits, editing assets, automated tests and the live deployment.
