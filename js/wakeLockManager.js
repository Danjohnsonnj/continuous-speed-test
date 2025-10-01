/**
 * Wake Lock Manager Module
 * 
 * Handles Wake Lock API to prevent device sleep during long tests.
 * Provides automatic lifecycle management with graceful fallback
 * for unsupported browsers.
 * 
 * @module WakeLockManager
 */

import { CONSTANTS } from './constants.js';

export class WakeLockManager {
  /**
   * Create a new Wake Lock Manager
   */
  constructor() {
    this.wakeLock = null;
    this.isSupported = 'wakeLock' in navigator;
    this.statusCallback = null;
  }

  /**
   * Check if Wake Lock API is supported
   * @returns {boolean} True if supported
   */
  isWakeLockSupported() {
    return this.isSupported;
  }

  /**
   * Set callback for status updates
   * @param {Function} callback - Function to call with status updates
   */
  onStatusUpdate(callback) {
    this.statusCallback = callback;
  }

  /**
   * Emit a status update
   * @param {string} message - Status message
   * @param {StatusType} type - Message type
   * @private
   */
  emitStatus(message, type = '') {
    if (this.statusCallback) {
      this.statusCallback(message, type);
    }
  }

  /**
   * Request wake lock to keep device awake
   * @returns {Promise<boolean>} True if successful
   * @throws {Error} If wake lock request fails
   */
  async request() {
    if (!this.isSupported) {
      this.emitStatus('Wake Lock not supported in this browser', 'error');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.emitStatus('Device will stay awake', 'success');

      // Listen for automatic release
      this.wakeLock.addEventListener('release', () => {
        // Only update UI if released automatically (not by us)
        if (this.wakeLock) {
          this.wakeLock = null;
          this.emitStatus('Wake lock automatically released', 'info');

          // Clear status after timeout
          setTimeout(() => {
            this.emitStatus('', '');
          }, CONSTANTS.WAKE_LOCK_RELEASE_TIMEOUT_MS);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to request wake lock:', error);
      this.emitStatus('Failed to keep device awake', 'error');

      // Clear error after timeout
      setTimeout(() => {
        this.emitStatus('', '');
      }, CONSTANTS.WAKE_LOCK_RELEASE_TIMEOUT_MS);

      return false;
    }
  }

  /**
   * Release the current wake lock
   * @returns {boolean} True if released successfully
   */
  release() {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
      this.emitStatus('Wake lock disabled', 'info');

      // Clear status after timeout
      setTimeout(() => {
        this.emitStatus('', '');
      }, CONSTANTS.STATUS_MESSAGE_TIMEOUT_MS);

      return true;
    }
    return false;
  }

  /**
   * Handle visibility change events
   * Re-requests wake lock when tab becomes visible again
   * @param {boolean} isVisible - Whether tab is visible
   * @param {boolean} isTestRunning - Whether test is currently running
   * @param {boolean} isEnabled - Whether wake lock is enabled by user
   * @returns {Promise<boolean>} True if wake lock state updated
   */
  async handleVisibilityChange(isVisible, isTestRunning, isEnabled) {
    if (!this.isSupported) return false;

    if (!isVisible) {
      // Wake lock will be automatically released when hidden
      return true;
    }

    // Re-request wake lock if tab becomes visible and conditions met
    if (isVisible && isTestRunning && isEnabled && !this.wakeLock) {
      return await this.request();
    }

    return false;
  }

  /**
   * Check if wake lock is currently active
   * @returns {boolean} True if active
   */
  isActive() {
    return this.wakeLock !== null;
  }

  /**
   * Get current wake lock status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      supported: this.isSupported,
      active: this.isActive(),
    };
  }
}
