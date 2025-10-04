/**
 * Speed Test Application - Main Coordinator
 *
 * Coordinates all modules to provide comprehensive internet speed testing.
 * Manages test lifecycle, data flow, and module interactions.
 *
 * @module SpeedTest
 */

import { UIController } from "./uiController.js";
import { GraphRenderer } from "./graphRenderer.js";
import { NetworkTester } from "./networkTesting.js";
import { StatisticsCalculator } from "./statisticsCalculator.js";
import { WakeLockManager } from "./wakeLockManager.js";
import { CSVExporter } from "./csvExporter.js";
import {
  CONSTANTS,
  GRAPH_COLORS,
  SERVER_ENDPOINTS,
  TEST_SIZES,
} from "./constants.js";

export class SpeedTest {
  /**
   * Initialize the Speed Test application
   */
  constructor() {
    // Initialize modules
    this.ui = new UIController();
    this.graphRenderer = new GraphRenderer(this.ui.getElements().canvas);
    this.networkTester = new NetworkTester(SERVER_ENDPOINTS);
    this.statsCalculator = new StatisticsCalculator();
    this.wakeLockManager = new WakeLockManager();
    this.csvExporter = new CSVExporter();

    // Test state
    this.isRunning = false;
    this.startTime = null;
    this.endTime = null;
    this.testDuration = 60;
    this.maxGraphPoints = CONSTANTS.GRAPH_MAX_DATA_POINTS;

    // Interval references for cleanup
    this.measurementInterval = null;
    this.progressInterval = null;
    this.continuousInterval = null;

    // Data storage
    this.measurementData = {
      download: [],
      upload: [],
      ping: [],
    };

    this.graphData = {
      download: [],
      upload: [],
      timestamps: [],
    };

    // Continuous testing state
    this.continuousTests = {
      activeDownloads: new Set(),
      activeUploads: new Set(),
      recentSpeeds: {
        download: [],
        upload: [],
      },
      lastUpdate: Date.now(),
    };

    // Graph settings
    this.graphSettings = {
      showDownload: true,
      showUpload: true,
    };

    // Size indices for progressive testing
    this.currentTestSize = 0;
    this.currentUploadSizeIndex = 0;

    // Initialize the application
    this.initialize();
  }

  /**
   * Initialize the application
   */
  initialize() {
    // Initialize graph renderer
    this.graphRenderer.initialize();

    // Set up module callbacks
    this.wakeLockManager.onStatusUpdate((message, type) => {
      this.updateStayAwakeStatus(message, type);
    });

    this.csvExporter.onStatusUpdate((message, type) => {
      this.ui.showCSVExportStatus(message, type);
    });

    // Set up event listeners
    this.setupEventListeners();

    // Initialize UI
    this.ui.initializeTheme();
    this.updateUIForTestType();
    this.initializeMeasurementInterval();
    this.initializeWakeLock();

    // Initialize CSV export button as disabled
    this.ui.setCSVExportEnabled(false);
  }

  /**
   * Initialize the measurement interval control
   */
  initializeMeasurementInterval() {
    const defaultInterval = parseInt(
      this.ui.getElements().measurementIntervalSlider.value
    );
    this.updateMeasurementInterval(defaultInterval);
  }

  /**
   * Initialize wake lock feature
   */
  initializeWakeLock() {
    const elements = this.ui.getElements();

    if (!this.wakeLockManager.isWakeLockSupported()) {
      if (elements.stayAwake) {
        elements.stayAwake.disabled = true;
        elements.stayAwake.title =
          "Wake Lock API not supported in this browser";
        this.updateStayAwakeStatus("Not supported", "error");
      }
    } else {
      if (elements.stayAwake) {
        elements.stayAwake.disabled = false;
        elements.stayAwake.title =
          "Keep your device awake during long speed tests";
      }
    }
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    const elements = this.ui.getElements();

    // Main control button
    elements.startStopBtn.addEventListener("click", () => this.toggleTest());

    // Test configuration changes
    elements.testTypeSelect.addEventListener("change", () => {
      this.updateUIForTestType();
    });

    // Measurement interval changes
    elements.measurementIntervalSlider.addEventListener("input", (e) => {
      this.updateMeasurementInterval(parseInt(e.target.value));
    });

    // Graph toggle controls
    elements.toggleDownload.addEventListener("click", (e) => {
      this.toggleGraphLine("download", e.target);
    });

    elements.toggleUpload.addEventListener("click", (e) => {
      this.toggleGraphLine("upload", e.target);
    });

    // Theme toggle control
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener("click", () => {
        this.ui.toggleTheme();
      });
    }

    // Stay awake control
    if (elements.stayAwake) {
      elements.stayAwake.addEventListener("change", (e) => {
        this.handleStayAwakeToggle(e.target.checked);
      });
    }

    // CSV export button
    if (elements.exportCSVBtn) {
      elements.exportCSVBtn.addEventListener("click", () => {
        this.downloadCSV();
      });
    }

    // Canvas tooltip event listeners
    if (elements.canvas && elements.canvasTooltip) {
      elements.canvas.addEventListener("mousemove", (e) => {
        this.handleCanvasMouseMove(e);
      });

      elements.canvas.addEventListener("mouseenter", () => {
        if (this.graphData.timestamps.length > 0) {
          elements.canvasTooltip.style.display = "block";
        }
      });

      elements.canvas.addEventListener("mouseleave", () => {
        this.ui.hideTooltip();
      });
    }

    // Handle page visibility changes for wake lock
    document.addEventListener("visibilitychange", () => {
      const elements = this.ui.getElements();
      const isVisible = document.visibilityState === "visible";
      const isEnabled = elements.stayAwake?.checked || false;

      this.wakeLockManager.handleVisibilityChange(
        isVisible,
        this.isRunning,
        isEnabled
      );
    });
  }

  /**
   * Toggle between starting and stopping the test
   */
  async toggleTest() {
    if (this.isRunning) {
      this.stopTest();
    } else {
      await this.startTest();
    }
  }

  /**
   * Start the speed test
   */
  async startTest() {
    try {
      this.initializeTestRun();
      this.ui.updateStartStopButton(true);
      this.ui.setConfigurationControlsEnabled(false);
      this.ui.updateTestStatus("Initializing speed test...");

      // Activate wake lock if enabled
      const elements = this.ui.getElements();
      if (elements.stayAwake.checked) {
        await this.wakeLockManager.request();
      }

      this.startTestIntervals();

      // Perform initial measurement
      await this.performMeasurement();
      this.ui.updateTestStatus("Speed test running...");

      // Set auto-stop timer if not continuous
      this.scheduleAutoStop();
    } catch (error) {
      console.error("Failed to start test:", error);
      this.ui.updateTestStatus("Test started with warnings", true);
    }
  }

  /**
   * Initialize test run state
   */
  initializeTestRun() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.testDuration = this.ui.getTestDuration();

    // Disable CSV export during test
    this.ui.setCSVExportEnabled(false);

    // Reset all data
    this.measurementData = {
      download: [],
      upload: [],
      ping: [],
    };
    this.graphData = {
      download: [],
      upload: [],
      timestamps: [],
    };
    this.currentTestSize = 0;
    this.currentUploadSizeIndex = 0;

    // Reset network tester
    this.networkTester.reset();

    // Reset statistics display
    this.ui.resetStatisticsDisplay();

    // Initialize continuous testing state
    this.continuousTests = {
      activeDownloads: new Set(),
      activeUploads: new Set(),
      recentSpeeds: {
        download: [],
        upload: [],
      },
      lastUpdate: Date.now(),
    };
  }

  /**
   * Start measurement and progress intervals
   */
  startTestIntervals() {
    const measurementInterval = this.ui.getMeasurementInterval();

    this.measurementInterval = setInterval(
      () => this.performMeasurement(),
      measurementInterval
    );

    this.continuousInterval = setInterval(
      () => this.maintainContinuousTests(),
      CONSTANTS.CONTINUOUS_TEST_INTERVAL_MS
    );

    this.progressInterval = setInterval(
      () => this.updateProgress(),
      CONSTANTS.PROGRESS_UPDATE_INTERVAL_MS
    );

    // Start initial continuous tests
    this.maintainContinuousTests();
  }

  /**
   * Schedule automatic stop if test has duration
   */
  scheduleAutoStop() {
    if (this.testDuration > 0) {
      setTimeout(() => {
        if (this.isRunning) {
          this.stopTest();
        }
      }, this.testDuration * 1000);
    }
  }

  /**
   * Stop the speed test
   */
  stopTest() {
    this.isRunning = false;
    this.endTime = Date.now();

    this.clearTestIntervals();
    this.ui.updateStartStopButton(false);
    this.ui.setConfigurationControlsEnabled(true);
    this.ui.updateTestStatus("Test completed");
    this.ui.setProgressComplete();

    this.calculateStatistics();

    // Release wake lock
    this.wakeLockManager.release();

    // Enable CSV export if we have data
    const hasData =
      this.measurementData.download.length > 0 ||
      this.measurementData.upload.length > 0 ||
      this.measurementData.ping.length > 0;

    if (hasData) {
      this.ui.setCSVExportEnabled(true);
    }
  }

  /**
   * Clear all running intervals
   */
  clearTestIntervals() {
    if (this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = null;
    }

    if (this.continuousInterval) {
      clearInterval(this.continuousInterval);
      this.continuousInterval = null;
    }

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Perform a measurement cycle
   */
  async performMeasurement() {
    try {
      const testType = this.ui.getTestType();

      // Always measure ping
      const ping = await this.networkTester.measurePing();
      this.measurementData.ping.push(ping);
      this.ui.updateSpeedDisplays({ ping });

      // Get current speeds from continuous measurements
      let downloadSpeed = 0;
      let uploadSpeed = 0;

      if (testType === "download" || testType === "both") {
        if (this.continuousTests.recentSpeeds.download.length > 0) {
          const recentDownloads = this.continuousTests.recentSpeeds.download;
          downloadSpeed =
            recentDownloads.reduce((sum, m) => sum + m.speed, 0) /
            recentDownloads.length;
          this.measurementData.download.push(downloadSpeed);
        } else {
          this.measurementData.download.push(0);
        }
      }

      if (testType === "upload" || testType === "both") {
        if (this.continuousTests.recentSpeeds.upload.length > 0) {
          const recentUploads = this.continuousTests.recentSpeeds.upload;
          uploadSpeed =
            recentUploads.reduce((sum, m) => sum + m.speed, 0) /
            recentUploads.length;
          this.measurementData.upload.push(uploadSpeed);
        } else {
          this.measurementData.upload.push(0);
        }
      }

      // Update graph data
      const timestamp = (Date.now() - this.startTime) / 1000;

      if (testType === "download" || testType === "both") {
        this.graphData.download.push(downloadSpeed > 0 ? downloadSpeed : null);
      }

      if (testType === "upload" || testType === "both") {
        this.graphData.upload.push(uploadSpeed > 0 ? uploadSpeed : null);
      }

      this.graphData.timestamps.push(timestamp);

      // Limit graph data points
      if (this.graphData.timestamps.length > this.maxGraphPoints) {
        this.graphData.download.shift();
        this.graphData.upload.shift();
        this.graphData.timestamps.shift();
      }

      this.drawGraph();
    } catch (error) {
      console.error("Critical measurement error:", error);
      this.ui.updateTestStatus("Critical error during measurement", true);
    }
  }

  /**
   * Maintain continuous network connections
   */
  async maintainContinuousTests() {
    if (!this.isRunning) return;

    const testType = this.ui.getTestType();
    const targetConnections = CONSTANTS.CONTINUOUS_CONNECTIONS;

    // Maintain continuous download tests
    if (testType === "download" || testType === "both") {
      while (this.continuousTests.activeDownloads.size < targetConnections) {
        this.startContinuousDownload();
      }
    }

    // Maintain continuous upload tests
    if (testType === "upload" || testType === "both") {
      while (this.continuousTests.activeUploads.size < targetConnections) {
        this.startContinuousUpload();
      }
    }

    // Update speeds based on recent measurements
    this.updateContinuousSpeedReadings();
  }

  /**
   * Start a continuous download test
   */
  async startContinuousDownload() {
    const testId = Date.now() + Math.random();
    this.continuousTests.activeDownloads.add(testId);

    try {
      const testSize =
        TEST_SIZES.download[
          Math.min(this.currentTestSize, TEST_SIZES.download.length - 1)
        ];

      const startTime = performance.now();
      const speed = await this.networkTester.testDownloadWithCloudflare(
        testSize
      );
      const endTime = performance.now();

      if (speed && speed > 0) {
        this.continuousTests.recentSpeeds.download.push({
          speed,
          timestamp: endTime,
          duration: endTime - startTime,
        });

        // Keep only recent measurements (last 5 seconds)
        const cutoff = endTime - 5000;
        this.continuousTests.recentSpeeds.download =
          this.continuousTests.recentSpeeds.download.filter(
            (m) => m.timestamp > cutoff
          );

        // Progress to larger test size
        if (speed > CONSTANTS.SLOW_SPEED_THRESHOLD_MBPS) {
          this.currentTestSize = Math.min(
            this.currentTestSize + 1,
            TEST_SIZES.download.length - 1
          );
        }
      }
    } catch (error) {
      console.error("Continuous download test failed:", error);
    } finally {
      this.continuousTests.activeDownloads.delete(testId);
    }
  }

  /**
   * Start a continuous upload test
   */
  async startContinuousUpload() {
    const testId = Date.now() + Math.random();
    this.continuousTests.activeUploads.add(testId);

    try {
      const testSize =
        TEST_SIZES.upload[
          Math.min(this.currentUploadSizeIndex, TEST_SIZES.upload.length - 1)
        ];

      const startTime = performance.now();
      const speed = await this.networkTester.testUploadWithHttpbin(testSize);
      const endTime = performance.now();

      if (speed && speed > 0) {
        this.continuousTests.recentSpeeds.upload.push({
          speed,
          timestamp: endTime,
          duration: endTime - startTime,
        });

        // Keep only recent measurements (last 5 seconds)
        const cutoff = endTime - 5000;
        this.continuousTests.recentSpeeds.upload =
          this.continuousTests.recentSpeeds.upload.filter(
            (m) => m.timestamp > cutoff
          );

        // Progress to larger test size
        if (speed > CONSTANTS.SLOW_SPEED_THRESHOLD_MBPS) {
          this.currentUploadSizeIndex = Math.min(
            this.currentUploadSizeIndex + 1,
            TEST_SIZES.upload.length - 1
          );
        }
      }
    } catch (error) {
      console.error("Continuous upload test failed:", error);
    } finally {
      this.continuousTests.activeUploads.delete(testId);
    }
  }

  /**
   * Update speed readings from continuous measurements
   */
  updateContinuousSpeedReadings() {
    const now = Date.now();

    // Only update if enough time has passed
    if (now - this.continuousTests.lastUpdate < 1000) return;

    this.continuousTests.lastUpdate = now;
    const testType = this.ui.getTestType();
    const speeds = {};

    // Calculate average download speed
    if (
      (testType === "download" || testType === "both") &&
      this.continuousTests.recentSpeeds.download.length > 0
    ) {
      const recentDownloads = this.continuousTests.recentSpeeds.download;
      speeds.download =
        recentDownloads.reduce((sum, m) => sum + m.speed, 0) /
        recentDownloads.length;
    }

    // Calculate average upload speed
    if (
      (testType === "upload" || testType === "both") &&
      this.continuousTests.recentSpeeds.upload.length > 0
    ) {
      const recentUploads = this.continuousTests.recentSpeeds.upload;
      speeds.upload =
        recentUploads.reduce((sum, m) => sum + m.speed, 0) /
        recentUploads.length;
    }

    this.ui.updateSpeedDisplays(speeds);
  }

  /**
   * Update progress bar
   */
  updateProgress() {
    if (!this.isRunning || this.testDuration === 0) return;

    const elapsed = (Date.now() - this.startTime) / 1000;
    this.ui.updateProgress(elapsed, this.testDuration);
  }

  /**
   * Draw the graph
   */
  drawGraph() {
    const testType = this.ui.getTestType();
    this.graphRenderer.draw(this.graphData, testType);
  }

  /**
   * Calculate statistics from measurement data
   */
  calculateStatistics() {
    const testType = this.ui.getTestType();
    const stats = this.statsCalculator.calculateAll(
      this.measurementData,
      testType
    );

    this.ui.updateStatistics(stats);
    this.ui.updateActualDuration(this.startTime, this.endTime);
  }

  /**
   * Update UI for test type changes
   */
  updateUIForTestType() {
    const testType = this.ui.getTestType();
    this.ui.updateSpeedCardVisibility(testType);
    this.ui.updateGraphToggleVisibility(testType);
    this.drawGraph();
  }

  /**
   * Update measurement interval
   * @param {number} intervalSeconds - Interval in seconds
   */
  updateMeasurementInterval(intervalSeconds) {
    this.ui.updateIntervalDisplay(intervalSeconds);

    // If test is running, restart the interval
    if (this.isRunning && this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = setInterval(
        () => this.performMeasurement(),
        intervalSeconds * 1000
      );
    }
  }

  /**
   * Toggle graph line visibility
   * @param {string} lineType - 'download' or 'upload'
   * @param {HTMLElement} buttonElement - The toggle button
   */
  toggleGraphLine(lineType, buttonElement) {
    const settingKey = `show${
      lineType.charAt(0).toUpperCase() + lineType.slice(1)
    }`;
    this.graphSettings[settingKey] = !this.graphSettings[settingKey];

    buttonElement.classList.toggle("active");
    buttonElement.setAttribute(
      "aria-pressed",
      buttonElement.classList.contains("active").toString()
    );

    // Update graph renderer settings
    this.graphRenderer.updateSettings(this.graphSettings);
    this.drawGraph();
  }

  /**
   * Handle stay awake toggle
   * @param {boolean} enabled - Whether enabled
   */
  async handleStayAwakeToggle(enabled) {
    if (!this.wakeLockManager.isWakeLockSupported()) {
      this.updateStayAwakeStatus(
        "Wake Lock not supported in this browser",
        "error"
      );
      this.ui.getElements().stayAwake.checked = false;
      return;
    }

    if (enabled) {
      await this.wakeLockManager.request();
    } else {
      this.wakeLockManager.release();
    }
  }

  /**
   * Update stay awake status display
   * @param {string} message - Status message
   * @param {string} type - Message type
   */
  updateStayAwakeStatus(message, type = "") {
    const statusEl = this.ui.getElements().stayAwakeStatus;
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = `stay-awake-status ${type}`;
  }

  /**
   * Download CSV of test results
   */
  downloadCSV() {
    try {
      this.ui.showCSVExportStatus("Generating CSV file...", "loading");

      const csvContent = this.csvExporter.generate({
        measurementData: this.measurementData,
        graphData: this.graphData,
        testType: this.ui.getTestType(),
        testDuration: this.testDuration,
        startTime: this.startTime,
        endTime: this.endTime,
      });

      const filename = this.csvExporter.generateFilename(this.startTime);
      const success = this.csvExporter.download(csvContent, filename);

      if (success) {
        this.ui.showCSVExportStatus("✓ CSV exported successfully!", "success");
        this.ui.updateTestStatus("Test completed - CSV exported");
      } else {
        throw new Error("Download failed");
      }

      // Hide status after delay
      setTimeout(() => {
        this.ui.hideCSVExportStatus();
      }, CONSTANTS.STATUS_MESSAGE_TIMEOUT_MS);
    } catch (error) {
      console.error("Failed to export CSV:", error);
      this.ui.showCSVExportStatus("✗ CSV export failed", "error");
      this.ui.updateTestStatus("Test completed - CSV export failed", true);

      setTimeout(() => {
        this.ui.hideCSVExportStatus();
      }, CONSTANTS.STATUS_MESSAGE_TIMEOUT_MS);
    }
  }

  /**
   * Handle canvas mouse move for tooltip
   * @param {MouseEvent} event - Mouse event
   */
  handleCanvasMouseMove(event) {
    if (this.graphData.timestamps.length === 0) {
      this.ui.hideTooltip();
      return;
    }

    const canvas = this.ui.getElements().canvas;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if mouse is within graph area
    if (!this.graphRenderer.isMouseInGraph(mouseX, mouseY, rect)) {
      this.ui.hideTooltip();
      return;
    }

    // Calculate dimensions needed for finding closest point
    const padding = CONSTANTS.GRAPH_PADDING_PX;
    const graphWidth =
      rect.width - padding - CONSTANTS.GRAPH_AXIS_MARGIN_RIGHT_PX;
    const maxTime = Math.max(...this.graphData.timestamps);

    const dimensions = {
      padding,
      graphWidth,
      maxTime,
      width: rect.width,
      height: rect.height,
    };

    // Find closest data point
    const closestIndex = this.graphRenderer.findClosestDataPoint(
      mouseX,
      this.graphData.timestamps,
      dimensions
    );

    // Show tooltip
    this.ui.showTooltip(
      event.clientX,
      event.clientY,
      closestIndex,
      this.graphData,
      this.measurementData,
      this.startTime
    );
  }

  /**
   * Initialize graph with proper sizing
   */
  initializeGraph() {
    this.graphRenderer.initialize();
    this.drawGraph();
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.speedTest = new SpeedTest();
});

// Handle window resize
let resizeTimeout;
window.addEventListener("resize", () => {
  if (window.speedTest) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      window.speedTest.initializeGraph();
    }, CONSTANTS.RESIZE_DEBOUNCE_MS);
  }
});
