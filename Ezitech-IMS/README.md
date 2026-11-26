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