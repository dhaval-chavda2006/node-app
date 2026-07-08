// public/js/register.js
// Handles the registration page logic.
//
// Steps:
//   1. If user is already logged in, redirect to dashboard
//   2. Listen for form submission
//   3. Client-side validation
//   4. Send data to POST /api/auth/register
//   5. On success: save token, redirect to dashboard
//   6. On failure: show error message

// ---- UTILITY FUNCTIONS ----

function showMessage(text, type = 'error') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = text;
  messageEl.className = `message show message-${type}`;
}

function hideMessage() {
  const messageEl = document.getElementById('message');
  messageEl.className = 'message';
  messageEl.textContent = '';
}

function setLoading(isLoading) {
  const btn = document.getElementById('submitBtn');
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Creating account...';
  } else {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

// ---- MAIN LOGIC ----

// Step 1: Redirect if already logged in
const token = localStorage.getItem('token');
if (token) {
  window.location.href = '/dashboard';
}

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMessage();

  // Step 3: Read and trim form values
  const username = document.getElementById('username').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Client-side validation
  const errors = [];

  if (!username || username.length < 2) {
    errors.push('Username must be at least 2 characters.');
  }

  if (!email) {
    errors.push('Email is required.');
  } else {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please enter a valid email address.');
    }
  }

  if (!password || password.length < 4) {
    errors.push('Password must be at least 4 characters.');
  }

  if (errors.length > 0) {
    // Show all validation errors joined as bullet points
    showMessage(errors.join(' | '), 'error');
    return;
  }

  setLoading(true);

  try {
    // Step 4: POST to register endpoint
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Step 5a: Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      showMessage('Account created! Redirecting to your dashboard...', 'success');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 900);

    } else {
      // Step 6: Show server error(s)
      // Server may return either a single 'message' or an array of 'errors'
      if (data.errors && data.errors.length > 0) {
        showMessage(data.errors.join(' | '), 'error');
      } else {
        showMessage(data.message || 'Registration failed. Please try again.', 'error');
      }
    }

  } catch (error) {
    console.error('Registration request failed:', error);
    showMessage('Network error. Please check your connection and try again.', 'error');
  } finally {
    setLoading(false);
  }
});
