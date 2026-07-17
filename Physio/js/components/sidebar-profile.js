/**
 * ReviveCMS - Sidebar Profile UI Component (ES6 Module)
 * Handles rendering the Doctor Profile, Settings/Logout buttons,
 * and the custom Secure Logout confirmation modal dialog.
 */

import { Logger } from '../logger.js';

/**
 * Render the Doctor Profile section at the bottom of the sidebar.
 * @param {object} user - Supabase user object
 * @param {function} onLogout - Callback function to initiate logout
 */
export function renderSidebarProfile(user, onLogout) {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    Logger.warn('SidebarProfile', 'Sidebar element not found on page.');
    return;
  }

  // Remove existing static sidebar footer if present
  const oldFooter = sidebar.querySelector('.sidebar-footer');
  if (oldFooter) {
    oldFooter.remove();
  }

  // Check if profile container is already rendered
  if (document.getElementById('sidebar-profile-container')) return;

  const email = user.email || 'doctor@clinic.com';
  const displayName = user.user_metadata?.full_name || email;
  const displayEmail = displayName !== email ? email : '';

  const profileContainer = document.createElement('div');
  profileContainer.id = 'sidebar-profile-container';
  profileContainer.className = 'sidebar-profile';

  // Inject styles for the sidebar profile if not already present
  if (!document.getElementById('sidebar-profile-styles')) {
    const styles = document.createElement('style');
    styles.id = 'sidebar-profile-styles';
    styles.innerHTML = `
      .sidebar-profile {
        padding: 1.25rem 1rem;
        border-top: 1px solid var(--border);
        background: var(--bg-card);
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        font-family: var(--font-sans);
      }
      .profile-main {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .profile-main .doctor-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--accent-light);
        color: var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .profile-main .doctor-avatar i {
        width: 20px;
        height: 20px;
      }
      .profile-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .profile-name {
        font-family: var(--font-heading);
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-main);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        margin: 0;
      }
      .profile-email-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-top: 2px;
      }
      .status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 8px var(--success);
        display: inline-block;
      }
      .status-text {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 500;
      }
      .profile-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.04);
        padding-top: 0.5rem;
      }
      .profile-action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.5rem;
        border-radius: var(--radius-sm);
        background: rgba(255, 255, 255, 0.02);
        color: var(--text-muted);
        font-size: 0.8rem;
        font-weight: 600;
        transition: var(--transition);
        border: 1px solid transparent;
        cursor: pointer;
      }
      .profile-action-btn:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-main);
        border-color: rgba(255, 255, 255, 0.04);
      }
      .profile-action-btn.logout-btn:hover {
        background: var(--danger-light);
        color: var(--danger);
        border-color: rgba(244, 63, 94, 0.1);
      }
      .profile-action-btn i {
        width: 15px;
        height: 15px;
      }
      .profile-version {
        font-size: 0.7rem;
        color: var(--text-light);
        text-align: center;
        margin-top: 0.25rem;
        line-height: 1.4;
      }
    `;
    document.head.appendChild(styles);
  }

  profileContainer.innerHTML = `
    <div class="profile-main">
      <div class="doctor-avatar">
        <i data-lucide="user"></i>
      </div>
      <div class="profile-info">
        <h4 class="profile-name" title="${displayName}">${displayName}</h4>
        ${displayEmail ? `<span class="profile-email-sub" title="${displayEmail}">${displayEmail}</span>` : ''}
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-text">Online</span>
        </div>
      </div>
    </div>
    <div class="profile-actions">
      <button class="profile-action-btn" id="settingsBtn" title="Settings">
        <i data-lucide="settings"></i> Settings
      </button>
      <button class="profile-action-btn logout-btn" id="logoutBtn" title="Logout">
        <i data-lucide="log-out"></i> Logout
      </button>
    </div>
    <div class="profile-version">ReviveCMS Cloud Edition<br>v2.0</div>
  `;

  sidebar.appendChild(profileContainer);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Action listeners
  const logoutBtn = profileContainer.querySelector('#logoutBtn');
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showLogoutConfirmDialog(onLogout);
  });

  const settingsBtn = profileContainer.querySelector('#settingsBtn');
  settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    Logger.info('SidebarProfile', 'Settings button clicked (placeholder).');
  });

  Logger.info('SidebarProfile', 'Sidebar Profile rendered successfully.');
}

/**
 * Display a premium modal dialog to confirm secure sign out.
 * @param {function} onConfirm - Callback to trigger logout logic
 */
function showLogoutConfirmDialog(onConfirm) {
  if (document.getElementById('logout-confirm-dialog')) return;

  const dialog = document.createElement('div');
  dialog.id = 'logout-confirm-dialog';
  dialog.style.position = 'fixed';
  dialog.style.top = '0';
  dialog.style.left = '0';
  dialog.style.width = '100vw';
  dialog.style.height = '100vh';
  dialog.style.backgroundColor = 'rgba(9, 9, 11, 0.8)';
  dialog.style.backdropFilter = 'blur(4px)';
  dialog.style.zIndex = '9999999';
  dialog.style.display = 'flex';
  dialog.style.alignItems = 'center';
  dialog.style.justifyContent = 'center';
  dialog.style.padding = '20px';
  dialog.style.animation = 'dialogFadeIn 0.2s ease-out';

  dialog.innerHTML = `
    <div style="background: #18181b; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; width: 100%; max-width: 400px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; font-family: 'Inter', sans-serif;">
      <div id="logoutDialogIcon" style="background: rgba(244, 63, 94, 0.12); color: #f43f5e; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
        <i data-lucide="log-out" style="width: 24px; height: 24px;"></i>
      </div>
      <div id="logoutDialogSpinner" style="display: none; margin: 0 auto 1.25rem; width: 48px; height: 48px; border: 4px solid rgba(244, 63, 94, 0.1); border-radius: 50%; border-top-color: #f43f5e; animation: dialog-spin 0.8s linear infinite;"></div>
      <h3 id="logoutDialogHeading" style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: #fafafa; margin-bottom: 0.5rem;">Secure Logout</h3>
      <p id="logoutDialogMsg" style="color: #a1a1aa; font-size: 0.9rem; margin-bottom: 1.75rem; line-height: 1.5;">You are about to securely sign out of ReviveCMS. Unsaved changes may be lost.</p>
      <div id="logoutDialogActions" style="display: flex; gap: 0.75rem;">
        <button id="cancelLogoutBtn" style="flex: 1; padding: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #fafafa; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; cursor: pointer;">Cancel</button>
        <button id="confirmLogoutBtn" style="flex: 1; padding: 0.75rem; background: #f43f5e; border: none; border-radius: 8px; color: #ffffff; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; cursor: pointer;">Logout</button>
      </div>
    </div>
    <style>
      @keyframes dialogFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes dialog-spin {
        to { transform: rotate(360deg); }
      }
      #cancelLogoutBtn:hover { background: rgba(255,255,255,0.08); }
      #confirmLogoutBtn:hover { background: #e11d48; }
    </style>
  `;
  document.body.appendChild(dialog);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const cancelBtn = dialog.querySelector('#cancelLogoutBtn');
  const confirmBtn = dialog.querySelector('#confirmLogoutBtn');
  const dialogActions = dialog.querySelector('#logoutDialogActions');
  const dialogIcon = dialog.querySelector('#logoutDialogIcon');
  const dialogSpinner = dialog.querySelector('#logoutDialogSpinner');
  const dialogHeading = dialog.querySelector('#logoutDialogHeading');
  const dialogMsg = dialog.querySelector('#logoutDialogMsg');

  cancelBtn.addEventListener('click', () => {
    dialog.remove();
  });

  confirmBtn.addEventListener('click', async () => {
    // Show spinner and loading state during sign out
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;
    dialogActions.style.pointerEvents = 'none';
    dialogIcon.style.display = 'none';
    dialogSpinner.style.display = 'block';
    dialogHeading.textContent = 'Logging Out...';
    dialogMsg.textContent = 'Clearing authentication temporary session.';

    try {
      await onConfirm();
    } catch (err) {
      Logger.error('SidebarProfile', 'Logout callback failed: ' + err.message);
      dialog.remove();
    }
  });
}
