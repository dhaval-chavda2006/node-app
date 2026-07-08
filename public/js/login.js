// public/js/login.js
// Handles the login page logic.
//
// Steps:
//   1. If user is already logged in (has a token), redirect to dashboard
//   2. Listen for form submission
//   3. Send credentials to POST /api/auth/login
//   4. On success: save token to localStorage and redirect to dashboard
//   5. On failure: show error message

// ---- UTILITY FUNCTIONS ----

/**
 * Displays a message in the message box.
 * @param {string} text - The message to display
 * @param {string} type - 'error' or 'success'
 */
function showMessage(text, type = 'error') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message show message-${type}`;
}

/**
 * Hides the message box.
 */
function hideMessage() {
  const messageEl = document.getElementById('message');
  messageEl.className = 'message';
  messageEl.textContent = '';
}

/**
 * Sets the loading state of the submit button.
 * Disables the button and shows a spinner while the request is in flight.
 * @param {boolean} isLoading - Whether to show loading state
 */
function setLoading(isLoading) {
  const btn = document.getElementById('submitBtn');
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Logging in...';
  } else {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

// ---- MAIN LOGIC ----

// Step 1: Check if user is already logged in.
// If a token exists in localStorage, redirect to the dashboard immediately.
const token = localStorage.getItem('token');
if (token) {
  window.location.href = '/dashboard';
}

// Step 2: Get a reference to the form and listen for the submit event
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
  // Prevent the default HTML form submission (which would reload the page)
  event.preventDefault();

  hideMessage();

  // Step 3: Read values from form fields
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Basic client-side validation (server also validates, but this is faster)
  if (!email || !password) {
    showMessage('Please enter both email and password.', 'error');
    return;
  }

  setLoading(true);

  try {
    // Step 4: Send a POST request to the login API endpoint
    // fetch() is the modern way to make HTTP requests in JavaScript
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  // Tell the server we're sending JSON
      },
      body: JSON.stringify({ email, password })  // Convert JS object to JSON string
    });

    // Parse the JSON response body
    const data = await response.json();

    if (response.ok) {
      // Step 5a: Success! Save the JWT token to localStorage.
      // localStorage persists data even after the browser tab is closed.
      localStorage.setItem('token', data.token);

      // Also save user info (optional, for displaying username)
      localStorage.setItem('user', JSON.stringify(data.user));

      showMessage('Login successful! Redirecting...', 'success');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);

    } else {
      // Step 5b: Server returned an error (e.g., wrong password)
      showMessage(data.message || 'Login failed. Please try again.', 'error');
    }

  } catch (error) {
    // Network error (e.g., server is down)
    console.error('Login request failed:', error);
    showMessage('Network error. Please check your connection and try again.', 'error');
  } finally {
    // Always reset the button state, whether success or error
    setLoading(false);
  }
});
