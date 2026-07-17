/**
 * ReviveCMS - Centralized Authentication Service (ES6 Module)
 * Handles session checking, login, logout state cleanup, and loading overlays.
 */

import { supabase } from './supabase.js';
import { Logger } from './logger.js';
import { renderSidebarProfile } from './components/sidebar-profile.js';

let overlayElement = null;
let isLoggingOut = false;

/**
 * Display a professional full-page loading overlay during session checks.
 */
export function ShowLoadingOverlay() {
  if (document.getElementById('auth-loading-overlay')) return;

  overlayElement = document.createElement('div');
  overlayElement.id = 'auth-loading-overlay';
  overlayElement.style.position = 'fixed';
  overlayElement.style.top = '0';
  overlayElement.style.left = '0';
  overlayElement.style.width = '100vw';
  overlayElement.style.height = '100vh';
  overlayElement.style.backgroundColor = '#ffffff';
  overlayElement.style.zIndex = '999999';
  overlayElement.style.display = 'flex';
  overlayElement.style.flexDirection = 'column';
  overlayElement.style.justifyContent = 'center';
  overlayElement.style.alignItems = 'center';
  overlayElement.style.fontFamily = "'Outfit', 'Inter', sans-serif";

  overlayElement.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 2.2rem; font-weight: 800; color: #0252ad; margin-bottom: 0.5rem; letter-spacing: -0.03em;">Revive<span style="opacity: 0.8;">CMS</span></div>
      <div style="font-size: 1.1rem; color: #0f172a; font-weight: 600; margin-bottom: 0.25rem;">Checking Authentication...</div>
      <div style="font-size: 0.88rem; color: #64748b;">Loading...</div>
      <div style="margin-top: 1.5rem; display: inline-block; width: 32px; height: 32px; border: 3px solid rgba(2, 82, 173, 0.1); border-radius: 50%; border-top-color: #0252ad; animation: auth-spin 0.8s linear infinite;"></div>
    </div>
    <style>
      @keyframes auth-spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(overlayElement);
  Logger.info('Auth', 'Loading overlay displayed.');
}

/**
 * Remove the loading overlay immediately.
 */
export function HideLoadingOverlay() {
  const overlay = document.getElementById('auth-loading-overlay');
  if (overlay) {
    overlay.remove();
    Logger.info('Auth', 'Loading overlay removed.');
  }
}

/**
 * Redirect browser to the Login Page.
 */
export function RedirectToLogin() {
  Logger.info('Auth', 'Redirecting to login page.');
  window.location.replace('login.html');
}

/**
 * Redirect browser to the Dashboard.
 */
export function RedirectToDashboard() {
  Logger.info('Auth', 'Redirecting to dashboard.');
  window.location.replace('index.html');
}

/**
 * Get active Supabase session.
 * @returns {Promise<object|null>} session or null
 */
export async function GetSession() {
  const client = supabase;
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (err) {
    Logger.error('Auth', 'GetSession failed: ' + err.message);
    return null;
  }
}

/**
 * Get current authenticated user details.
 * @returns {Promise<object|null>} user or null
 */
export async function GetCurrentUser() {
  const client = supabase;
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (err) {
    Logger.error('Auth', 'GetCurrentUser failed: ' + err.message);
    return null;
  }
}

/**
 * Sign in using email and password.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} Auth data
 */
export async function Login(email, password) {
  const client = supabase;
  if (!client) {
    throw new Error('Authentication Service Unavailable (Supabase client not initialized).');
  }
  Logger.info('Auth', `Attempting login for user: ${email}`);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  Logger.info('Auth', 'Login succeeded.');
  return data;
}

export async function Logout() {
  if (isLoggingOut) return;
  isLoggingOut = true;

  Logger.info('Auth', 'Initiating logout flow.');
  const client = supabase;
  
  try {
    if (client) {
      await client.auth.signOut();
      Logger.info('Auth', 'Supabase signOut completed.');
    }
  } catch (err) {
    Logger.error('Auth', 'Supabase signOut failed: ' + err.message);
  } finally {
    // Clear only authentication-related temporary state created by the module
    localStorage.removeItem('local_session');

    // Clear loading overlays
    HideLoadingOverlay();

    // Close active dialogs and modals
    document.querySelectorAll('dialog, .modal, .dialog-overlay, .modal-backdrop, #logout-confirm-dialog').forEach(el => {
      try {
        el.remove();
      } catch (e) {
        Logger.warn('Auth', 'Failed to remove dialog element: ' + e.message);
      }
    });

    // Remove transient notifications/toasts
    document.querySelectorAll('.toast, .notification, .alert-box').forEach(el => {
      try {
        el.remove();
      } catch (e) {
        Logger.warn('Auth', 'Failed to remove notification element: ' + e.message);
      }
    });

    isLoggingOut = false;
    RedirectToLogin();
  }
}

/**
 * Centralized verification route guard.
 * Performs session check, observer setups, and delegates UI profile rendering.
 */
export async function RequireAuthentication() {
  Logger.info('Auth', 'RequireAuthentication triggered.');
  ShowLoadingOverlay();

  try {
    const session = await GetSession();
    if (!session) {
      Logger.warn('Auth', 'No active session found. Redirecting.');
      RedirectToLogin();
      return;
    }

    Logger.info('Auth', 'Active session verified.');

    // Register active authentication state listener
    const client = supabase;
    if (client) {
      client.auth.onAuthStateChange((event, session) => {
        Logger.info('Auth', `Auth State Changed: ${event}`);
        if (event === 'SIGNED_OUT' || !session) {
          if (!isLoggingOut) {
            Logout();
          }
        }
      });
    }

    // Delegate Doctor Profile UI rendering to the dedicated component module
    const user = session.user;
    const renderProfileUI = () => {
      renderSidebarProfile(user, Logout);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderProfileUI);
    } else {
      renderProfileUI();
    }
  } catch (err) {
    Logger.error('Auth', 'Verification failed: ' + err.message);
    RedirectToLogin();
  } finally {
    HideLoadingOverlay();
  }
}

/**
 * Maps authentication errors to user-friendly messages.
 * @param {object} err 
 * @returns {string} User friendly error string
 */
export function HandleAuthenticationErrors(err) {
  let msg = 'An authentication error occurred. Please try again.';
  if (err && err.message) {
    if (err.message.includes('Invalid login credentials')) {
      msg = 'Invalid email or password. Please verify and try again.';
    } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      msg = 'Network unavailable: Cannot connect to the authentication service. Please check your internet connection.';
    } else if (err.message.includes('session expired') || err.message.includes('JWT expired')) {
      msg = 'Your session has expired. Please log in again.';
    } else {
      msg = err.message;
    }
  }
  Logger.error('Auth', 'Error processed: ' + msg);
  return msg;
}
