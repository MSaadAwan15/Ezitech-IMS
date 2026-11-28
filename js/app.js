const STATUSES = ['Available', 'Assigned', 'Under Maintenance', 'Retired'];
const CATEGORIES = ['Laptop', 'Desktop', 'Mobile', 'Printer', 'Monitor', 'Networking', 'Peripheral', 'Other'];
const LOCATIONS = ['Lab 1', 'Lab 2', 'Lab 3', 'IT Office'];
const FIELDS = ['id', 'name', 'category', 'location', 'status'];
const ID_PATTERN = /^AST-\d{4}$/;

const STATUS_COLORS = {
  'Available': 'bg-green-100 text-green-800',
  'Assigned': 'bg-blue-100 text-blue-800',
  'Under Maintenance': 'bg-yellow-100 text-yellow-800',
  'Retired': 'bg-gray-200 text-gray-700'
};

const searchInput = document.getElementById('search');
const statusSelect = document.getElementById('filter-status');
const categorySelect = document.getElementById('filter-category');
const locationSelect = document.getElementById('filter-location');
const tableBody = document.getElementById('asset-rows');
const resultCount = document.getElementById('result-count');
const messageBox = document.getElementById('message');
const sidebar = document.getElementById('sidebar');
const addDialog = document.getElementById('add-dialog');
const addForm = document.getElementById('add-form');
const deleteDialog = document.getElementById('delete-dialog');
const deleteText = document.getElementById('delete-text');

let assets = [];
let searchText = '';
let statusFilter = '';
let categoryFilter = '';
let locationFilter = '';
let sortKey = 'id';
let sortDirection = 'asc';
let assetToDelete = null;
let messageTimer;

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function showMessage(text, isError) {
  messageBox.textContent = text;
  messageBox.className = 'mb-4 rounded p-3 text-sm ' + (isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800');
  clearTimeout(messageTimer);
  if (!isError) {
    messageTimer = setTimeout(() => messageBox.classList.add('hidden'), 3000);
  }
}

function toggleSidebar() {
  sidebar.classList.toggle('hidden');
  sidebar.classList.toggle('flex');
}

function closeSidebar() {
  sidebar.classList.add('hidden');
  sidebar.classList.remove('flex');
}

function fillSelect(select, options, firstLabel) {
  select.innerHTML = `<option value="">${firstLabel}</option>`;
  options.forEach((option) => {
    select.innerHTML += `<option value="${option}">${option}</option>`;
  });
}

function getVisibleAssets() {
  const search = searchText.trim().toLowerCase();

  const list = assets.filter((asset) => {
    if (statusFilter && asset.status !== statusFilter) return false;
    if (categoryFilter && asset.category !== categoryFilter) return false;
    if (locationFilter && asset.location !== locationFilter) return false;
    if (!search) return true;
    const text = asset.id + ' ' + asset.name + ' ' + asset.category + ' ' + asset.location + ' ' + asset.status;
    return text.toLowerCase().includes(search);
  });

  list.sort((a, b) => {
    const result = a[sortKey].localeCompare(b[sortKey], undefined, { numeric: true });
    return sortDirection === 'asc' ? result : -result;
  });

  return list;
}

function showAssets() {
  const list = getVisibleAssets();

  if (list.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-500">No assets found.</td></tr>';
  } else {
    tableBody.innerHTML = list.map((asset) => `
      <tr class="border-t border-gray-200 hover:bg-gray-50">
        <td class="p-3 font-mono text-xs">${escapeHtml(asset.id)}</td>
        <td class="p-3 font-bold">${escapeHtml(asset.name)}</td>
        <td class="p-3">${escapeHtml(asset.category)}</td>
        <td class="p-3">${escapeHtml(asset.location)}</td>
        <td class="p-3">
          <span class="rounded-full px-2 py-1 text-xs ${STATUS_COLORS[asset.status]}">${escapeHtml(asset.status)}</span>
        </td>
        <td class="p-3">${formatDate(asset.last_updated)}</td>
        <td class="p-3 text-right">
          <button class="delete-button inline-flex items-center gap-1 rounded border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-100" data-id="${escapeHtml(asset.id)}">
            <i data-lucide="trash-2" class="h-3 w-3"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  resultCount.textContent = `Showing ${list.length} of ${assets.length} assets`;
  lucide.createIcons();
}

function showStats() {
  const count = (status) => assets.filter((asset) => asset.status === status).length;
  document.getElementById('stat-total').textContent = assets.length;
  document.getElementById('stat-available').textContent = count('Available');
  document.getElementById('stat-assigned').textContent = count('Assigned');
  document.getElementById('stat-maintenance').textContent = count('Under Maintenance');
}

function showSortArrows() {
  document.querySelectorAll('.sort-button').forEach((button) => {
    let arrow = '';
    if (button.dataset.sort === sortKey) {
      arrow = sortDirection === 'asc' ? '▲' : '▼';
    }
    button.querySelector('span').textContent = arrow;
  });
}

function refresh() {
  showStats();
  showSortArrows();
  showAssets();
}

function getNextId() {
  let highest = 0;
  assets.forEach((asset) => {
    const number = parseInt(asset.id.slice(4), 10);
    if (number > highest) highest = number;
  });
  return 'AST-' + String(highest + 1).padStart(4, '0');
}

function getError(field, value) {
  value = value.trim();

  if (field === 'id') {
    value = value.toUpperCase();
    if (value === '') return 'Please enter an asset ID.';
    if (!ID_PATTERN.test(value)) return 'Invalid ID. Use the format AST-0001.';
    if (assets.some((asset) => asset.id === value)) return 'This ID already exists.';
  }

  if (field === 'name') {
    if (value === '') return 'Please enter the asset name.';
    if (value.length < 2) return 'Name must be at least 2 characters.';
  }

  if (field === 'category' && value === '') return 'Please select a category.';
  if (field === 'location' && value === '') return 'Please select a location.';
  if (field === 'status' && value === '') return 'Please select a status.';

  return '';
}

function markField(input, isInvalid) {
  if (isInvalid) {
    input.classList.remove('border-gray-300');
    input.classList.add('border-red-600');
  } else {
    input.classList.remove('border-red-600');
    input.classList.add('border-gray-300');
  }
}

function checkField(field) {
  const input = document.getElementById('f-' + field);
  const error = getError(field, input.value);
  document.getElementById('e-' + field).textContent = error;
  markField(input, error !== '');
  return error === '';
}

function openAddDialog() {
  addForm.reset();
  document.getElementById('f-id').value = getNextId();
  FIELDS.forEach((field) => {
    document.getElementById('e-' + field).textContent = '';
    markField(document.getElementById('f-' + field), false);
  });
  addDialog.showModal();
}

function addAsset(event) {
  event.preventDefault();

  let allValid = true;
  FIELDS.forEach((field) => {
    if (!checkField(field)) allValid = false;
  });
  if (!allValid) return;

  const asset = {
    id: document.getElementById('f-id').value.trim().toUpperCase(),
    name: document.getElementById('f-name').value.trim(),
    category: document.getElementById('f-category').value,
    location: document.getElementById('f-location').value,
    status: document.getElementById('f-status').value,
    last_updated: new Date().toISOString()
  };

  assets.push(asset);
  addDialog.close();
  refresh();
  showMessage(asset.name + ' was added.');
}

function askToDelete(id) {
  assetToDelete = assets.find((asset) => asset.id === id);
  deleteText.textContent = `Are you sure you want to delete ${assetToDelete.name} (${assetToDelete.id})? This cannot be undone.`;
  deleteDialog.showModal();
}

function confirmDelete() {
  deleteDialog.close();
  assets = assets.filter((asset) => asset.id !== assetToDelete.id);
  refresh();
  showMessage(assetToDelete.name + ' was deleted.');
}

async function loadAssets() {
  const response = await fetch('data/sample_assets.json');
  if (!response.ok) throw new Error('Could not load sample_assets.json');
  assets = await response.json();
}

function setupEvents() {
  searchInput.addEventListener('input', (event) => {
    searchText = event.target.value;
    showAssets();
  });

  statusSelect.addEventListener('change', (event) => {
    statusFilter = event.target.value;
    showAssets();
  });

  categorySelect.addEventListener('change', (event) => {
    categoryFilter = event.target.value;
    showAssets();
  });

  locationSelect.addEventListener('change', (event) => {
    locationFilter = event.target.value;
    showAssets();
  });

  document.querySelectorAll('.sort-button').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.sort;
      if (key === sortKey) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortDirection = 'asc';
      }
      showSortArrows();
      showAssets();
    });
  });

  tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('.delete-button');
    if (button) askToDelete(button.dataset.id);
  });

  document.getElementById('open-add').addEventListener('click', openAddDialog);
  document.getElementById('add-cancel').addEventListener('click', () => addDialog.close());
  addForm.addEventListener('submit', addAsset);

  FIELDS.forEach((field) => {
    const input = document.getElementById('f-' + field);
    input.addEventListener('blur', () => checkField(field));
    input.addEventListener('change', () => checkField(field));
  });

  document.getElementById('f-id').addEventListener('input', (event) => {
    event.target.value = event.target.value.toUpperCase();
  });

  document.getElementById('delete-cancel').addEventListener('click', () => deleteDialog.close());
  document.getElementById('delete-confirm').addEventListener('click', confirmDelete);

  document.getElementById('menu-button').addEventListener('click', toggleSidebar);
  document.querySelectorAll('#sidebar a').forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });
}

async function startApp() {
  fillSelect(statusSelect, STATUSES, 'All statuses');
  fillSelect(categorySelect, CATEGORIES, 'All categories');
  fillSelect(locationSelect, LOCATIONS, 'All locations');
  fillSelect(document.getElementById('f-category'), CATEGORIES, 'Select a category');
  fillSelect(document.getElementById('f-location'), LOCATIONS, 'Select a location');
  fillSelect(document.getElementById('f-status'), STATUSES, 'Select a status');
  setupEvents();
  lucide.createIcons();

  try {
    await loadAssets();
  } catch (error) {
    console.error(error);
    showMessage('Could not load the inventory. If you opened the file directly, run a local server (see README).', true);
  }

  refresh();
}

startApp();
