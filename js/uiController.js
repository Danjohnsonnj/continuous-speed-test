/**
 * UI Controller Module
 *
 * Handles all DOM manipulation, display updates, and UI state management.
 * Provides a clean interface between the application logic and the user interface.
 *
 * @module UIController
 */

import { CONSTANTS } from "./constants.js";

export class UIController {
  /**
   * Create a new UI Controller
   */
  constructor() {
    this.domElements = this.initializeDOMElements();
  }

  /**
   * Cache DOM element references for better performance
   * @returns {Object} DOM elements object
   * @private
   */
  initializeDOMElements() {
    const elements = {
      // Controls
      startStopBtn: document.getElementById("startStopBtn"),
      testDurationSelect: document.getElementById("testDuration"),
      testTypeSelect: document.getElementById("testType"),
      measurementIntervalSlider: document.getElementById("measurementInterval"),
      intervalValue: document.getElementById("intervalValue"),

      // Speed displays
      downloadSpeed: document.getElementById("downloadSpeed"),
      uploadSpeed: document.getElementById("uploadSpeed"),
      pingValue: document.getElementById("pingValue"),

      // Status and progress
      testStatus: document.getElementById("testStatus"),
      testProgress: document.getElementById("testProgress"),
      progressFill: document.getElementById("progressFill"),
      csvExportStatus: document.getElementById("csvExportStatus"),

      // Graph
      canvas: document.getElementById("speedGraph"),
      canvasTooltip: document.getElementById("speedGraphTooltip"),
      toggleDownload: document.getElementById("toggleDownload"),
      toggleUpload: document.getElementById("toggleUpload"),

      // Theme toggle
      themeToggle: document.getElementById("themeToggle"),

      // Stay awake control
      stayAwake: document.getElementById("stayAwake"),
      stayAwakeStatus: document.getElementById("stayAwakeStatus"),

      // CSV export button
      exportCSVBtn: document.getElementById("exportCSVBtn"),

      // Statistics
      stats: {
        avgDownload: document.getElementById("avgDownload"),
        maxDownload: document.getElementById("maxDownload"),
        minDownload: document.getElementById("minDownload"),
        avgUpload: document.getElementById("avgUpload"),
        maxUpload: document.getElementById("maxUpload"),
        minUpload: document.getElementById("minUpload"),
        p98Download: document.getElementById("p98Download"),
        p98Upload: document.getElementById("p98Upload"),
        p98Ping: document.getElementById("p98Ping"),
        stability: document.getElementById("stability"),
        actualDuration: document.getElementById("actualDuration"),
      },
    };

    return elements;
  }

  /**
   * Get DOM element references
   * @returns {Object} DOM elements object
   */
  getElements() {
    return this.domElements;
  }

  /**
   * Update the speed displays with current measurements
   * @param {Object} speeds - Current speed measurements
   * @param {number} [speeds.download] - Download speed in Mbps
   * @param {number} [speeds.upload] - Upload speed in Mbps
   * @param {number} [speeds.ping] - Ping latency in ms
   */
  updateSpeedDisplays(speeds) {
    if (speeds.download !== undefined) {
      this.domElements.downloadSpeed.textContent = speeds.download.toFixed(1);
    }
    if (speeds.upload !== undefined) {
      this.domElements.uploadSpeed.textContent = speeds.upload.toFixed(1);
    }
    if (speeds.ping !== undefined) {
      this.domElements.pingValue.textContent = speeds.ping.toFixed(0);
    }
  }

  /**
   * Update test status message
   * @param {string} message - Status message to display
   * @param {boolean} [isError=false] - Whether to style as error
   */
  updateTestStatus(message, isError = false) {
    const { testStatus } = this.domElements;
    testStatus.textContent = message;

    if (isError) {
      testStatus.classList.add("error");
    } else {
      testStatus.classList.remove("error");
    }
  }

  /**
   * Update progress bar display
   * @param {number} elapsed - Elapsed time in seconds
   * @param {number} total - Total test duration in seconds
   */
  updateProgress(elapsed, total) {
    if (total === 0) return; // Continuous mode

    const progress = Math.min(100, (elapsed / total) * 100);
    this.domElements.progressFill.style.width = progress + "%";
    this.domElements.testProgress.textContent = `${elapsed.toFixed(
      0
    )}s / ${total}s`;
  }

  /**
   * Set progress to 100% (test complete)
   */
  setProgressComplete() {
    this.domElements.progressFill.style.width = "100%";
  }

  /**
   * Update start/stop button state
   * @param {boolean} isRunning - Whether test is currently running
   */
  updateStartStopButton(isRunning) {
    const btn = this.domElements.startStopBtn;
    if (isRunning) {
      btn.textContent = "Stop Test";
      btn.classList.add("stop");
      btn.setAttribute("aria-label", "Stop the speed test");
    } else {
      btn.textContent = "Start Test";
      btn.classList.remove("stop");
      btn.setAttribute("aria-label", "Start the speed test");
    }
  }

  /**
   * Get current test type selection
   * @returns {string} Test type ('download', 'upload', or 'both')
   */
  getTestType() {
    return this.domElements.testTypeSelect.value;
  }

  /**
   * Get current test duration selection
   * @returns {number} Test duration in seconds
   */
  getTestDuration() {
    return parseInt(this.domElements.testDurationSelect.value);
  }

  /**
   * Get current measurement interval
   * @returns {number} Measurement interval in milliseconds
   */
  getMeasurementInterval() {
    const seconds = parseInt(this.domElements.measurementIntervalSlider.value);
    return seconds * 1000;
  }

  /**
   * Update measurement interval display
   * @param {number} intervalSeconds - Interval in seconds
   */
  updateIntervalDisplay(intervalSeconds) {
    this.domElements.intervalValue.textContent = `${intervalSeconds}s`;
  }

  /**
   * Show/hide speed cards based on test type
   * @param {string} testType - 'download', 'upload', or 'both'
   */
  updateSpeedCardVisibility(testType) {
    const downloadCard = document.querySelector(".speed-card.download");
    const uploadCard = document.querySelector(".speed-card.upload");

    const visibility = {
      download: testType === "download" || testType === "both",
      upload: testType === "upload" || testType === "both",
    };

    downloadCard.style.display = visibility.download ? "block" : "none";
    uploadCard.style.display = visibility.upload ? "block" : "none";
  }

  /**
   * Show/hide graph toggle buttons based on test type
   * @param {string} testType - 'download', 'upload', or 'both'
   */
  updateGraphToggleVisibility(testType) {
    const { toggleDownload, toggleUpload } = this.domElements;

    if (testType === "download") {
      toggleDownload.style.display = "inline-block";
      toggleUpload.style.display = "none";
    } else if (testType === "upload") {
      toggleDownload.style.display = "none";
      toggleUpload.style.display = "inline-block";
    } else {
      toggleDownload.style.display = "inline-block";
      toggleUpload.style.display = "inline-block";
    }
  }

  /**
   * Update statistics display
   * @param {Object} stats - Calculated statistics
   */
  updateStatistics(stats) {
    const { stats: statElements } = this.domElements;

    // Download statistics
    if (stats.download) {
      statElements.avgDownload.textContent = `${stats.download.avg.toFixed(
        1
      )} Mbps`;
      statElements.maxDownload.textContent = `${stats.download.max.toFixed(
        1
      )} Mbps`;
      statElements.minDownload.textContent = `${stats.download.min.toFixed(
        1
      )} Mbps`;
      statElements.p98Download.textContent = `${stats.download.p98.toFixed(
        1
      )} Mbps`;
    }

    // Upload statistics
    if (stats.upload) {
      statElements.avgUpload.textContent = `${stats.upload.avg.toFixed(
        1
      )} Mbps`;
      statElements.maxUpload.textContent = `${stats.upload.max.toFixed(
        1
      )} Mbps`;
      statElements.minUpload.textContent = `${stats.upload.min.toFixed(
        1
      )} Mbps`;
      statElements.p98Upload.textContent = `${stats.upload.p98.toFixed(
        1
      )} Mbps`;
    }

    // Ping statistics
    if (stats.ping) {
      statElements.p98Ping.textContent = `${stats.ping.p98.toFixed(0)} ms`;
    }

    // Stability
    if (stats.stability !== undefined) {
      statElements.stability.textContent = `${stats.stability.toFixed(0)} %`;
    }
  }

  /**
   * Update actual test duration display
   * @param {number} startTime - Test start timestamp
   * @param {number} endTime - Test end timestamp
   */
  updateActualDuration(startTime, endTime) {
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    this.domElements.stats.actualDuration.textContent = `${duration} s`;
  }

  /**
   * Reset all statistics display fields to default values
   */
  resetStatisticsDisplay() {
    const { stats } = this.domElements;

    // Reset download statistics
    stats.avgDownload.textContent = "-- Mbps";
    stats.maxDownload.textContent = "-- Mbps";
    stats.minDownload.textContent = "-- Mbps";
    stats.p98Download.textContent = "-- Mbps";

    // Reset upload statistics
    stats.avgUpload.textContent = "-- Mbps";
    stats.maxUpload.textContent = "-- Mbps";
    stats.minUpload.textContent = "-- Mbps";
    stats.p98Upload.textContent = "-- Mbps";

    // Reset ping statistics
    stats.p98Ping.textContent = "-- ms";

    // Reset stability and duration
    stats.stability.textContent = "-- %";
    stats.actualDuration.textContent = "-- s";
  }

  /**
   * Enable or disable the CSV export button
   * @param {boolean} enabled - Whether to enable the button
   */
  setCSVExportEnabled(enabled) {
    if (this.domElements.exportCSVBtn) {
      this.domElements.exportCSVBtn.disabled = !enabled;
    }
  }

  /**
   * Enable or disable the test configuration controls
   * @param {boolean} enabled - Whether to enable the controls
   */
  setConfigurationControlsEnabled(enabled) {
    if (this.domElements.testTypeSelect) {
      this.domElements.testTypeSelect.disabled = !enabled;
    }
    if (this.domElements.testDurationSelect) {
      this.domElements.testDurationSelect.disabled = !enabled;
    }
    if (this.domElements.measurementIntervalSlider) {
      this.domElements.measurementIntervalSlider.disabled = !enabled;
    }
  }

  /**
   * Show CSV export status message
   * @param {string} message - Status message
   * @param {ExportStatusType} type - Message type ('loading', 'success', 'error')
   */
  showCSVExportStatus(message, type = "loading") {
    const statusEl = this.domElements.csvExportStatus;
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `csv-export-status ${type}`;
    statusEl.style.display = "block";
  }

  /**
   * Hide CSV export status message
   */
  hideCSVExportStatus() {
    const statusEl = this.domElements.csvExportStatus;
    if (!statusEl) return;
    statusEl.style.display = "none";
  }

  /**
   * Format elapsed time in human-readable format
   * @param {number} seconds - Elapsed time in seconds
   * @returns {string} Formatted time string (e.g., "13s", "2m 4s", "1h 10m 15s")
   * @private
   */
  formatElapsedTime(seconds) {
    const totalSeconds = Math.floor(seconds);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Show tooltip with data for the specified data point
   * @param {number} mouseX - Mouse X coordinate (page relative)
   * @param {number} mouseY - Mouse Y coordinate (page relative)
   * @param {number} dataIndex - Index of the data point to show
   * @param {Object} graphData - Graph data arrays
   * @param {MeasurementData} measurementData - Raw measurement data
   * @param {number} startTime - Test start timestamp
   */
  showTooltip(
    mouseX,
    mouseY,
    dataIndex,
    graphData,
    measurementData,
    startTime
  ) {
    const tooltip = this.domElements.canvasTooltip;
    const testType = this.getTestType();

    if (!tooltip || dataIndex >= graphData.timestamps.length) {
      return;
    }

    // Get data for this point
    const timestamp = graphData.timestamps[dataIndex];
    const downloadSpeed = graphData.download[dataIndex];
    const uploadSpeed = graphData.upload[dataIndex];
    const pingValue = measurementData.ping[dataIndex];

    // Calculate the absolute time for this measurement
    const absoluteTime = new Date(startTime + timestamp * 1000);
    const localTimeString = absoluteTime.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Format tooltip content based on test type
    let content = `<div class="tooltip-time">${this.formatElapsedTime(
      timestamp
    )} elapsed</div>`;
    content += `<div class="tooltip-local-time">at ${localTimeString}</div>`;

    // Show download speed if test includes downloads and data exists
    if (
      (testType === "download" || testType === "both") &&
      downloadSpeed !== null &&
      downloadSpeed > 0
    ) {
      content += `<div class="tooltip-metric">
        <span class="metric-label">Download:</span>
        <span class="metric-value download">${downloadSpeed.toFixed(
          1
        )} Mbps</span>
      </div>`;
    }

    // Show upload speed if test includes uploads and data exists
    if (
      (testType === "upload" || testType === "both") &&
      uploadSpeed !== null &&
      uploadSpeed > 0
    ) {
      content += `<div class="tooltip-metric">
        <span class="metric-label">Upload:</span>
        <span class="metric-value upload">${uploadSpeed.toFixed(1)} Mbps</span>
      </div>`;
    }

    // Show ping if data exists
    if (pingValue !== null && pingValue > 0) {
      content += `<div class="tooltip-metric">
        <span class="metric-label">Ping:</span>
        <span class="metric-value ping">${pingValue.toFixed(0)} ms</span>
      </div>`;
    }

    // Update tooltip content and position
    tooltip.querySelector(".tooltip-content").innerHTML = content;

    // Position tooltip relative to the canvas container
    const canvasRect = this.domElements.canvas.getBoundingClientRect();
    const containerRect =
      this.domElements.canvas.parentElement.getBoundingClientRect();

    // Calculate position relative to container
    const relativeX = mouseX - containerRect.left;
    const relativeY = mouseY - containerRect.top;

    tooltip.style.left = relativeX + "px";
    tooltip.style.top = relativeY - 10 + "px"; // 10px above cursor
    tooltip.classList.add("visible");
  }

  /**
   * Hide the tooltip
   */
  hideTooltip() {
    const tooltip = this.domElements.canvasTooltip;
    if (tooltip) {
      tooltip.classList.remove("visible");
    }
  }

  /**
   * Initialize theme based on localStorage or system preference
   */
  initializeTheme() {
    const savedTheme = localStorage.getItem("speed-test-theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    let theme = "auto";
    if (savedTheme) {
      theme = savedTheme;
    }

    this.applyTheme(theme, systemPrefersDark);
    this.updateThemeToggleIcon(theme, systemPrefersDark);

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        const currentTheme = localStorage.getItem("speed-test-theme") || "auto";
        if (currentTheme === "auto") {
          this.applyTheme("auto", e.matches);
          this.updateThemeToggleIcon("auto", e.matches);
        }
      });
  }

  /**
   * Toggle between light, dark, and auto themes
   */
  toggleTheme() {
    const currentTheme = localStorage.getItem("speed-test-theme") || "auto";
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    let newTheme;
    switch (currentTheme) {
      case "light":
        newTheme = "dark";
        break;
      case "dark":
        newTheme = "auto";
        break;
      default: // 'auto'
        newTheme = "light";
        break;
    }

    localStorage.setItem("speed-test-theme", newTheme);
    this.applyTheme(newTheme, systemPrefersDark);
    this.updateThemeToggleIcon(newTheme, systemPrefersDark);

    // Add animation class
    if (this.domElements.themeToggle) {
      this.domElements.themeToggle.classList.add("animating");
      setTimeout(() => {
        this.domElements.themeToggle.classList.remove("animating");
      }, 600);
    }
  }

  /**
   * Apply the specified theme to the document
   * @param {string} theme - 'light', 'dark', or 'auto'
   * @param {boolean} systemPrefersDark - Whether system prefers dark mode
   * @private
   */
  applyTheme(theme, systemPrefersDark) {
    const html = document.documentElement;

    // Remove existing theme attributes
    html.removeAttribute("data-theme");

    if (theme === "light") {
      html.setAttribute("data-theme", "light");
    } else if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
    } else if (theme === "auto") {
      // Let CSS media query handle auto mode
      // Don't set data-theme, let prefers-color-scheme take effect
    }

    // Update Safari UI chrome colors
    this.updateSafariThemeColor(theme, systemPrefersDark);
  }

  /**
   * Update Safari theme-color meta tags for UI chrome
   * @param {string} theme - Current theme setting
   * @param {boolean} systemPrefersDark - Whether system prefers dark mode
   * @private
   */
  updateSafariThemeColor(theme, systemPrefersDark) {
    // Determine the effective theme
    let effectiveTheme = theme;
    if (theme === "auto") {
      effectiveTheme = systemPrefersDark ? "dark" : "light";
    }

    // Find or create theme-color meta tag
    let themeColorMeta = document.querySelector(
      'meta[name="theme-color"]:not([media])'
    );
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }

    // Set the color based on effective theme
    const color = effectiveTheme === "dark" ? "#000000" : "#ffffff";
    themeColorMeta.setAttribute("content", color);

    // Also update status bar style for iOS Safari
    let statusBarMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    );
    if (statusBarMeta) {
      statusBarMeta.setAttribute(
        "content",
        effectiveTheme === "dark" ? "black-translucent" : "default"
      );
    }
  }

  /**
   * Update the theme toggle button icon
   * @param {string} theme - Current theme setting
   * @param {boolean} systemPrefersDark - Whether system prefers dark mode
   * @private
   */
  updateThemeToggleIcon(theme, systemPrefersDark) {
    if (!this.domElements.themeToggle) return;

    const icon = this.domElements.themeToggle.querySelector(".theme-icon");
    if (!icon) return;

    let iconText, title;

    switch (theme) {
      case "light":
        iconText = "☀️";
        title = "Switch to dark mode";
        break;
      case "dark":
        iconText = "🌙";
        title = "Switch to auto mode (follows system)";
        break;
      default: // 'auto'
        iconText = systemPrefersDark ? "🌓" : "🌗";
        title = "Switch to light mode (currently following system)";
        break;
    }

    icon.textContent = iconText;
    this.domElements.themeToggle.setAttribute("title", title);
    this.domElements.themeToggle.setAttribute("aria-label", title);
  }
}
