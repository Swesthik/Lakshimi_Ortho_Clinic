/**
 * ReviveCMS - Standalone Login Controller (Supabase ES6 Module)
 */

import { GetSession, Login, RedirectToDashboard, HandleAuthenticationErrors } from './auth.js';
import { Logger } from './logger.js';
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  Logger.info('LoginUI', 'Login interface loaded.');

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const btnText = document.getElementById('btnText');
  const errorContainer = document.getElementById('errorContainer');
  const passwordToggle = document.getElementById('passwordToggle');
  const eyeIcon = document.getElementById('eyeIcon');

  /**
   * Helper to set input and action checking statuses on load/auth.
   */
  const setCheckingState = (isChecking) => {
    emailInput.disabled = isChecking;
    passwordInput.disabled = isChecking;
    loginBtn.disabled = isChecking;
    
    const spinner = document.getElementById('loginSpinner');
    if (isChecking) {
      btnText.textContent = 'Checking Authentication...';
      if (spinner) spinner.style.display = 'block';
    } else {
      btnText.textContent = 'Sign In';
      if (spinner) spinner.style.display = 'none';
    }
  };

  // Verify Supabase SDK and Client availability
  if (!window.supabase || !supabase) {
    errorContainer.textContent = 'Authentication service failed to initialize.';
    errorContainer.style.display = 'block';
    setCheckingState(false);
    loginBtn.disabled = true; // disable login button permanently
    Logger.error('LoginUI', 'Supabase SDK or Client is unavailable. Halting initialization.');
    return;
  }

  // On page load: check if a valid Supabase session is already present
  setCheckingState(true);
  GetSession().then(session => {
    if (session) {
      Logger.info('LoginUI', 'Valid session found on load. Redirecting to dashboard.');
      RedirectToDashboard();
    } else {
      Logger.info('LoginUI', 'No active session found. Enabling login input form.');
      setCheckingState(false);
    }
  }).catch(err => {
    Logger.warn('LoginUI', 'Session pre-check rejected: ' + err.message);
    setCheckingState(false);
  });

  // Password Visibility Toggle
  passwordToggle.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    eyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Reset error container state
    errorContainer.style.display = 'none';
    errorContainer.textContent = '';

    // Field validations
    if (!email || !password) {
      errorContainer.textContent = 'Please fill in both Email Address and Password fields.';
      errorContainer.style.display = 'block';
      Logger.warn('LoginUI', 'Submit blocked due to empty credentials fields.');
      return;
    }

    loginBtn.disabled = true;
    btnText.textContent = 'Verifying...';
    
    const spinner = document.getElementById('loginSpinner');
    if (spinner) spinner.style.display = 'block';

    try {
      await Login(email, password);
      Logger.info('LoginUI', 'Login request succeeded. Proceeding to redirect.');
      RedirectToDashboard();
    } catch (err) {
      const msg = HandleAuthenticationErrors(err);
      errorContainer.textContent = msg;
      errorContainer.style.display = 'block';

      // Restore button status
      loginBtn.disabled = false;
      btnText.textContent = 'Sign In';
      if (spinner) spinner.style.display = 'none';
    }
  });
});
