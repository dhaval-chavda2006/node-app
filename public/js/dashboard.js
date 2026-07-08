// public/js/dashboard.js
// Handles all dashboard functionality:
//   - Auth guard (redirect to login if not authenticated)
//   - Load and display user's notes
//   - Create, Edit, Delete notes via modals
//   - Logout

// ============================================================
// CONSTANTS & STATE
// ============================================================

const API_BASE = '/api';

// Current state of the app
let currentItems = [];       // All items fetched from the server
let isEditing = false;       // Whether the modal is in edit mode

// ============================================================
// AUTH GUARD
// On page load, check for a JWT token.
// If missing, redirect to login immediately.
// ============================================================

const token = localStorage.getItem('token');

if (!token) {
  // No token found → user is not logged in → redirect
  window.location.href = '/login';
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Creates the Authorization header object needed for protected API calls.
 * Every request to a protected route must include this header.
 */
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`   // "Bearer " + the JWT token
  };
}

/**
 * Shows a message in the dashboard (above the grid).
 */
function showDashboardMessage(text, type = 'success') {
  const el = document.getElementById('dashboardMessage');
  el.textContent = text;
  el.className = `message show message-${type}`;
  // Auto-hide after 4 seconds
  setTimeout(() => { el.className = 'message'; }, 4000);
}

/**
 * Shows a message inside the modal.
 */
function showModalMessage(text, type = 'error') {
  const el = document.getElementById('modalMessage');
  el.textContent = text;
  el.className = `message show message-${type}`;
}

function hideModalMessage() {
  const el = document.getElementById('modalMessage');
  el.className = 'message';
}

/**
 * Formats a date string into a human-readable format.
 * Example: "2024-01-15T10:30:00.000Z" → "Jan 15, 2024"
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

/**
 * Handles 401 Unauthorized responses.
 * Clears localStorage and redirects to login.
 */
function handleUnauthorized() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// ============================================================
// API FUNCTIONS
// All API calls go through these functions.
// They return the parsed JSON data, or throw an error.
// ============================================================

/**
 * Fetches the current user's profile from GET /api/auth/me
 * Used to display the username in the navbar.
 */
async function fetchCurrentUser() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  const data = await response.json();
  return data.user;
}

/**
 * Fetches all items for the logged-in user from GET /api/items
 */
async function fetchAllItems() {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (response.status === 401) {
    handleUnauthorized();
    return;
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Creates a new item via POST /api/items
 * @param {object} itemData - { title, description }
 */
async function createItem(itemData) {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(itemData)
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw an error with the server's message so we can display it
    throw new Error(data.message || 'Failed to create item.');
  }

  return data.item;
}

/**
 * Updates an existing item via PUT /api/items/:id
 * @param {number} id - Item ID to update
 * @param {object} itemData - { title, description }
 */
async function updateItem(id, itemData) {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(itemData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update item.');
  }

  return data.item;
}

/**
 * Deletes an item via DELETE /api/items/:id
 * @param {number} id - Item ID to delete
 */
async function deleteItem(id) {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete item.');
  }

  return true;
}

// ============================================================
// RENDER FUNCTIONS
// These build the HTML for each note card and inject it into the DOM.
// ============================================================

/**
 * Renders all items in the items grid.
 * @param {Array} items - Array of item objects from the API
 */
function renderItems(items) {
  const grid = document.getElementById('itemsGrid');

  if (items.length === 0) {
    // Show empty state if there are no notes
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No notes yet!</h3>
        <p>Click the "+ New Note" button above to create your first note.</p>
      </div>
    `;
    return;
  }

  // Build HTML for each item card
  // Note: We use data-id attribute to store the item's ID on the button
  // so we can retrieve it when the button is clicked.
  grid.innerHTML = items.map(item => `
    <div class="item-card" id="card-${item.id}">
      <div class="item-card-title">${escapeHtml(item.title)}</div>
      <div class="item-card-description">
        ${item.description ? escapeHtml(item.description) : '<em style="color:#b0b8c8">No description</em>'}
      </div>
      <div class="item-card-meta">Created ${formatDate(item.createdAt)}</div>
      <div class="item-card-actions">
        <button
          class="btn btn-secondary btn-sm"
          onclick="openEditModal(${item.id})"
          aria-label="Edit note: ${escapeHtml(item.title)}"
        >
          ✏️ Edit
        </button>
        <button
          class="btn btn-danger btn-sm"
          onclick="openDeleteModal(${item.id})"
          aria-label="Delete note: ${escapeHtml(item.title)}"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Escapes HTML special characters to prevent XSS (Cross-Site Scripting) attacks.
 * ALWAYS escape user-provided content before injecting it into the DOM.
 * @param {string} str - String to escape
 * @returns {string} - HTML-safe string
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ============================================================
// MODAL FUNCTIONS
// ============================================================

/**
 * Opens the Create Note modal (blank form).
 */
function openCreateModal() {
  isEditing = false;
  document.getElementById('modalTitle').textContent = 'New Note';
  document.getElementById('saveItemBtn').textContent = 'Save Note';
  document.getElementById('editItemId').value = '';
  document.getElementById('itemTitle').value = '';
  document.getElementById('itemDescription').value = '';
  hideModalMessage();
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('itemTitle').focus();
}

/**
 * Opens the Edit Note modal pre-filled with the item's current data.
 * @param {number} id - The ID of the item to edit
 */
function openEditModal(id) {
  // Find the item in our local state (no extra API call needed)
  const item = currentItems.find(i => i.id === id);
  if (!item) return;

  isEditing = true;
  document.getElementById('modalTitle').textContent = 'Edit Note';
  document.getElementById('saveItemBtn').textContent = 'Update Note';
  document.getElementById('editItemId').value = item.id;
  document.getElementById('itemTitle').value = item.title;
  document.getElementById('itemDescription').value = item.description || '';
  hideModalMessage();
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('itemTitle').focus();
}

/**
 * Closes the Create/Edit modal.
 */
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

/**
 * Opens the Delete Confirmation modal.
 * @param {number} id - The ID of the item to delete
 */
function openDeleteModal(id) {
  document.getElementById('deleteItemId').value = id;
  document.getElementById('deleteModalOverlay').classList.add('active');
}

/**
 * Closes the Delete Confirmation modal.
 */
function closeDeleteModal() {
  document.getElementById('deleteModalOverlay').classList.remove('active');
  document.getElementById('deleteItemId').value = '';
}

// ============================================================
// EVENT HANDLERS
// ============================================================

// "New Note" button → open create modal
document.getElementById('openCreateModalBtn').addEventListener('click', openCreateModal);

// Modal close buttons
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
document.getElementById('closeDeleteModalBtn').addEventListener('click', closeDeleteModal);
document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);

// Close modals when clicking outside the modal box
document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
document.getElementById('deleteModalOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('deleteModalOverlay')) closeDeleteModal();
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeDeleteModal();
  }
});

// "Save Note" button (inside create/edit modal)
document.getElementById('saveItemBtn').addEventListener('click', async () => {
  const title = document.getElementById('itemTitle').value.trim();
  const description = document.getElementById('itemDescription').value.trim();

  // Validate title
  if (!title) {
    showModalMessage('Title is required.', 'error');
    document.getElementById('itemTitle').focus();
    return;
  }

  const btn = document.getElementById('saveItemBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Saving...';

  try {
    if (isEditing) {
      // --- UPDATE (PUT) ---
      const id = parseInt(document.getElementById('editItemId').value);
      const updatedItem = await updateItem(id, { title, description });

      // Update the item in our local state
      const index = currentItems.findIndex(i => i.id === id);
      if (index !== -1) currentItems[index] = updatedItem;

      renderItems(currentItems);
      closeModal();
      showDashboardMessage('Note updated successfully!', 'success');

    } else {
      // --- CREATE (POST) ---
      const newItem = await createItem({ title, description });

      // Add the new item to the beginning of our local state
      currentItems.unshift(newItem);

      renderItems(currentItems);
      closeModal();
      showDashboardMessage('Note created successfully!', 'success');
    }
  } catch (error) {
    console.error('Save item error:', error);
    showModalMessage(error.message || 'Failed to save note.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = isEditing ? 'Update Note' : 'Save Note';
  }
});

// "Yes, Delete" button (inside delete confirmation modal)
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  const id = parseInt(document.getElementById('deleteItemId').value);

  const btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Deleting...';

  try {
    await deleteItem(id);

    // Remove the item from our local state
    currentItems = currentItems.filter(i => i.id !== id);

    renderItems(currentItems);
    closeDeleteModal();
    showDashboardMessage('Note deleted.', 'success');

  } catch (error) {
    console.error('Delete item error:', error);
    closeDeleteModal();
    showDashboardMessage(error.message || 'Failed to delete note.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Yes, Delete';
  }
});

// "Logout" button
document.getElementById('logoutBtn').addEventListener('click', () => {
  // Clear all stored auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to login page
  window.location.href = '/login';
});

// ============================================================
// INITIALIZATION
// Called on page load to fetch user info and notes.
// ============================================================

async function init() {
  try {
    // Fetch and display the current user's username
    const user = await fetchCurrentUser();
    if (user) {
      document.getElementById('usernameDisplay').textContent = user.username;
    }

    // Fetch all notes and render them
    currentItems = await fetchAllItems();
    renderItems(currentItems);

  } catch (error) {
    console.error('Dashboard init error:', error);
    showDashboardMessage('Failed to load data. Please refresh the page.', 'error');
  }
}

// Run initialization when the page loads
init();
