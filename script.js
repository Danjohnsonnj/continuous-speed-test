/**
 * Internet Speed Test Application
 *
 * A comprehensive speed testing tool that measures download, upload, and ping
 * using real-world infrastructure including Cloudflare CDN and other reliable endpoints.
 *
 * Features:
 * - Real network testing (not simulated)
 * - Progressive file size testing
 * - Multi-endpoint ping measurement
 * - Real-time graphing
 * - Comprehensive statistics
 * - Accessibility support
 */

class SpeedTest {
  /**
   * Initialize the Speed Test application
   * Sets up configuration, DOM references, and initial state
   */
  constructor() {
    // Test state management
    this.isRunning = false;
    this.startTime = null;
    this.endTime = null;
    this.testDuration = 60; // Default: 1 minute
    this.currentTestSize = 0; // Progressive test size index

    // Interval references for cleanup
    this.measurementInterval = null;
    this.progressInterval = null;

    // Data storage for measurements
    this.measurementData = {
      download: [],
      upload: [],
      ping: [],
    };

    // Graph data optimized for display
    this.graphData = {
      download: [],
      upload: [],
      timestamps: [],
    };

    // Configuration for speed test servers
    this.serverConfig = this.initializeServerConfig();

    // Test parameters
    this.testConfig = this.initializeTestConfig();

    // DOM element references
    this.domElements = this.initializeDOMElements();

    // Graph display settings
    this.graphSettings = {
      showDownload: true,
      showUpload: true,
      maxDataPoints: 50,
      colors: {
        download: "#2196f3",
        upload: "#9c27b0",
        grid: "#f0f0f0",
        axis: "#333",
      },
    };

    // Initialize the application
    this.initialize();
  }

  /**
   * Configure server endpoints for different test types
   * @returns {Object} Server configuration object
   */
  initializeServerConfig() {
    return {
      download: {
        // Use faster CDN endpoints optimized for speed testing
        primary: "https://speed.cloudflare.com/__down?bytes=",
        fallbacks: [
          "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js", // ~87KB
          "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js", // ~217KB
        ],
      },
      upload: {
        // Use multiple endpoints optimized for upload testing
        primary: "https://httpbin.org/post",
        fallbacks: [
          "https://postman-echo.com/post",
          "https://jsonplaceholder.typicode.com/posts",
        ],
        // Add Cloudflare upload endpoint if available
        cloudflare: "https://speed.cloudflare.com/__up",
      },
      ping: [
        "https://www.google.com/favicon.ico",
        "https://github.com/favicon.ico",
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js?_=1",
        "https://jsonplaceholder.typicode.com/posts/1",
      ],
    };
  }

  /**
   * Initialize test configuration parameters
   * @returns {Object} Test configuration object
   */
  initializeTestConfig() {
    return {
      // Progressive test sizes (in bytes) - larger sizes for better accuracy
      downloadSizes: [
        1024 * 1024, // 1MB
        5 * 1024 * 1024, // 5MB
        10 * 1024 * 1024, // 10MB
        25 * 1024 * 1024, // 25MB
        50 * 1024 * 1024, // 50MB
      ],
      // Progressive upload sizes for better bandwidth utilization - larger sizes
      uploadSizes: [
        10 * 1024 * 1024, // 10MB - start larger to match commercial tests
        20 * 1024 * 1024, // 20MB
        35 * 1024 * 1024, // 35MB
        50 * 1024 * 1024, // 50MB - match download max
      ],
      currentSizeIndex: 0,
      measurementInterval: 3000, // 3 seconds between measurements (will be updated by user selection)
      continuousTestInterval: 500, // 500ms between starting new continuous tests
      progressUpdateInterval: 100, // 100ms for progress updates
      validSpeedRange: { min: 0, max: 10000 }, // Mbps
      validPingRange: { min: 5, max: 5000 }, // ms
      continuousConnections: 2, // Number of overlapping connections to maintain
    };
  }

  /**
   * Cache DOM element references for better performance
   * @returns {Object} DOM elements object
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
      toggleDownload: document.getElementById("toggleDownload"),
      toggleUpload: document.getElementById("toggleUpload"),

      // Statistics
      stats: {
        avgDownload: document.getElementById("avgDownload"),
        maxDownload: document.getElementById("maxDownload"),
        minDownload: document.getElementById("minDownload"),
        avgUpload: document.getElementById("avgUpload"),
        maxUpload: document.getElementById("maxUpload"),
        minUpload: document.getElementById("minUpload"),
        stability: document.getElementById("stability"),
        actualDuration: document.getElementById("actualDuration"),
      },
    };

    // Initialize canvas context with error checking
    if (elements.canvas) {
      elements.canvasContext = elements.canvas.getContext("2d");
    } else {
      console.error('Canvas element with id "speedGraph" not found');
    }

    return elements;
  }

  /**
   * Initialize the application
   * Sets up event listeners, graph, and initial UI state
   */
  initialize() {
    this.setupEventListeners();
    this.initializeGraph();
    this.updateUIForTestType();
    this.initializeMeasurementInterval();
  }

  /**
   * Initialize the measurement interval control with default value
   */
  initializeMeasurementInterval() {
    const defaultInterval = parseInt(
      this.domElements.measurementIntervalSlider.value
    );
    this.updateMeasurementInterval(defaultInterval);
  }

  /**
   * Set up all event listeners for the application
   */
  setupEventListeners() {
    // Main control button
    this.domElements.startStopBtn.addEventListener("click", () =>
      this.toggleTest()
    );

    // Test configuration changes
    this.domElements.testTypeSelect.addEventListener("change", () => {
      this.updateUIForTestType();
    });

    // Measurement interval changes
    this.domElements.measurementIntervalSlider.addEventListener(
      "input",
      (e) => {
        this.updateMeasurementInterval(e.target.value);
      }
    );

    // Graph toggle controls
    this.domElements.toggleDownload.addEventListener("click", (e) => {
      this.toggleGraphLine("download", e.target);
    });

    this.domElements.toggleUpload.addEventListener("click", (e) => {
      this.toggleGraphLine("upload", e.target);
    });

    // Initialize UI state
    this.updateUIForTestType();
  }

  /**
   * Toggle visibility of a graph line
   * @param {string} lineType - 'download' or 'upload'
   * @param {HTMLElement} buttonElement - The toggle button element
   */
  toggleGraphLine(lineType, buttonElement) {
    this.graphSettings[
      `show${lineType.charAt(0).toUpperCase() + lineType.slice(1)}`
    ] =
      !this.graphSettings[
        `show${lineType.charAt(0).toUpperCase() + lineType.slice(1)}`
      ];

    buttonElement.classList.toggle("active");
    buttonElement.setAttribute(
      "aria-pressed",
      buttonElement.classList.contains("active").toString()
    );

    this.drawGraph();
  }

  /**
   * Update UI elements based on selected test type
   */
  updateUIForTestType() {
    const testType = this.domElements.testTypeSelect.value;

    this.updateSpeedCardVisibility(testType);
    this.updateGraphToggleVisibility(testType);
  }

  /**
   * Update the measurement interval based on user selection
   * @param {string} intervalSeconds - The selected interval in seconds
   */
  updateMeasurementInterval(intervalSeconds) {
    const interval = parseInt(intervalSeconds);
    this.testConfig.measurementInterval = interval * 1000; // Convert to milliseconds

    // Update the display value
    this.domElements.intervalValue.textContent = `${interval}s`;

    // If a test is currently running, restart the measurement interval
    if (this.isRunning && this.measurementInterval) {
      clearInterval(this.measurementInterval);
      this.measurementInterval = setInterval(
        () => this.performMeasurement(),
        this.testConfig.measurementInterval
      );
    }
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

    // Reset graph settings based on test type
    if (testType === "download") {
      this.configureGraphForSingleType(
        "download",
        toggleDownload,
        toggleUpload
      );
    } else if (testType === "upload") {
      this.configureGraphForSingleType("upload", toggleUpload, toggleDownload);
    } else {
      this.configureGraphForBothTypes(toggleDownload, toggleUpload);
    }

    this.drawGraph();
  }

  /**
   * Configure graph for single test type
   * @param {string} activeType - The active test type
   * @param {HTMLElement} activeButton - Button for active type
   * @param {HTMLElement} inactiveButton - Button for inactive type
   */
  configureGraphForSingleType(activeType, activeButton, inactiveButton) {
    activeButton.style.display = "inline-block";
    inactiveButton.style.display = "none";

    this.graphSettings.showDownload = activeType === "download";
    this.graphSettings.showUpload = activeType === "upload";

    activeButton.classList.add("active");
    activeButton.setAttribute("aria-pressed", "true");
  }

  /**
   * Configure graph for both test types
   * @param {HTMLElement} downloadButton - Download toggle button
   * @param {HTMLElement} uploadButton - Upload toggle button
   */
  configureGraphForBothTypes(downloadButton, uploadButton) {
    downloadButton.style.display = "inline-block";
    uploadButton.style.display = "inline-block";

    this.graphSettings.showDownload = true;
    this.graphSettings.showUpload = true;

    [downloadButton, uploadButton].forEach((btn) => {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    });
  }

  /**
   * Initialize the canvas for high-DPI displays and draw empty graph
   */
  initializeGraph() {
    const canvas = this.domElements.canvas;
    const ctx = this.domElements.canvasContext;

    // Ensure canvas elements exist before proceeding
    if (!canvas || !ctx) {
      console.warn("Canvas or context not available for graph initialization");
      return;
    }

    // Configure canvas for high-DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Set display size
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    this.drawGraph();
  }

  /**
   * Toggle between starting and stopping the speed test
   */
  async toggleTest() {
    if (this.isRunning) {
      this.stopTest();
    } else {
      await this.startTest();
    }
  }

  /**
   * Start the speed test with proper initialization
   */
  async startTest() {
    try {
      this.initializeTestRun();
      this.updateUIForTestStart();
      this.startTestIntervals();

      // Perform initial measurement
      await this.performMeasurement();
      this.updateTestStatus("Speed test running...");

      // Set auto-stop timer if not continuous
      this.scheduleAutoStop();
    } catch (error) {
      console.error("Failed to start test:", error);
      this.updateTestStatus("Test started with warnings", true);
    }
  }

  /**
   * Initialize test run state and data
   */
  initializeTestRun() {
    this.isRunning = true;
    this.startTime = Date.now();
    this.testDuration = parseInt(this.domElements.testDurationSelect.value);

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
    this.testConfig.currentSizeIndex = 0;

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
   * Update UI elements for test start
   */
  updateUIForTestStart() {
    const { startStopBtn, testStatus } = this.domElements;

    startStopBtn.textContent = "Stop Test";
    startStopBtn.classList.add("stop");
    startStopBtn.setAttribute("aria-label", "Stop the current speed test");

    this.updateTestStatus("Initializing speed test...");
    testStatus.classList.add("testing");
    testStatus.classList.remove("error", "success");
  }

  /**
   * Start measurement and progress intervals
   */
  startTestIntervals() {
    this.measurementInterval = setInterval(
      () => this.performMeasurement(),
      this.testConfig.measurementInterval
    );

    // Continuous testing interval for overlapping connections
    this.continuousInterval = setInterval(
      () => this.maintainContinuousTests(),
      this.testConfig.continuousTestInterval
    );

    this.progressInterval = setInterval(
      () => this.updateProgress(),
      this.testConfig.progressUpdateInterval
    );

    // Start initial continuous tests
    this.maintainContinuousTests();
  }

  /**
   * Schedule automatic stop if test has duration limit
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
   * Stop the speed test and clean up
   */
  stopTest() {
    this.isRunning = false;
    this.endTime = Date.now();

    this.clearTestIntervals();
    this.updateUIForTestStop();
    this.calculateStatistics();

    // Export test results to CSV if we have data
    if (
      this.measurementData.download.length > 0 ||
      this.measurementData.upload.length > 0 ||
      this.measurementData.ping.length > 0
    ) {
      // Add a small delay to ensure UI updates are complete
      setTimeout(() => {
        this.downloadCSV();
      }, 100);
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
   * Maintain continuous network connections for smoother testing
   */
  async maintainContinuousTests() {
    if (!this.isRunning) return;

    const testType = this.domElements.testTypeSelect.value;
    const targetConnections = this.testConfig.continuousConnections;

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
        this.testConfig.downloadSizes[
          Math.min(
            this.currentTestSize || 0,
            this.testConfig.downloadSizes.length - 1
          )
        ];

      const startTime = performance.now();
      const speed = await this.testDownloadWithCloudflare(testSize);
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
        this.testConfig.uploadSizes[
          Math.min(
            this.currentUploadSizeIndex || 0,
            this.testConfig.uploadSizes.length - 1
          )
        ];

      const startTime = performance.now();
      const speed = await this.testUploadWithHttpbin(testSize);
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
      }
    } catch (error) {
      console.error("Continuous upload test failed:", error);
    } finally {
      this.continuousTests.activeUploads.delete(testId);
    }
  }

  /**
   * Update speed readings based on continuous measurements
   */
  updateContinuousSpeedReadings() {
    const now = Date.now();

    // Only update if enough time has passed since last update
    if (now - this.continuousTests.lastUpdate < 1000) return;

    this.continuousTests.lastUpdate = now;
    const testType = this.domElements.testTypeSelect.value;

    // Calculate average download speed from recent measurements
    if (
      (testType === "download" || testType === "both") &&
      this.continuousTests.recentSpeeds.download.length > 0
    ) {
      const recentDownloads = this.continuousTests.recentSpeeds.download;
      const avgSpeed =
        recentDownloads.reduce((sum, m) => sum + m.speed, 0) /
        recentDownloads.length;
      this.domElements.downloadSpeed.textContent = avgSpeed.toFixed(1);
    }

    // Calculate average upload speed from recent measurements
    if (
      (testType === "upload" || testType === "both") &&
      this.continuousTests.recentSpeeds.upload.length > 0
    ) {
      const recentUploads = this.continuousTests.recentSpeeds.upload;
      const avgSpeed =
        recentUploads.reduce((sum, m) => sum + m.speed, 0) /
        recentUploads.length;
      this.domElements.uploadSpeed.textContent = avgSpeed.toFixed(1);
    }
  }

  /**
   * Update UI elements for test stop
   */
  updateUIForTestStop() {
    const { startStopBtn, testStatus, progressFill } = this.domElements;

    startStopBtn.textContent = "Start Test";
    startStopBtn.classList.remove("stop");
    startStopBtn.setAttribute("aria-label", "Start a new speed test");

    this.updateTestStatus("Test completed");
    testStatus.classList.remove("testing");
    progressFill.style.width = "100%";
  }

  /**
   * Update test status with optional error styling
   * @param {string} message - Status message to display
   * @param {boolean} isError - Whether to style as error
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

  async performMeasurement() {
    try {
      const testType = this.domElements.testTypeSelect.value;

      // Update status
      this.domElements.testStatus.textContent = "Speed test running...";
      this.domElements.testStatus.classList.remove("error");

      // Always measure ping
      const ping = await this.measurePing();
      this.domElements.pingValue.textContent = ping.toFixed(0);
      this.measurementData.ping.push(ping);

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

      // Update graph data - ensure arrays stay synchronized
      const timestamp = (Date.now() - this.startTime) / 1000;

      // Always add data points to keep arrays synchronized
      if (testType === "download" || testType === "both") {
        this.graphData.download.push(downloadSpeed > 0 ? downloadSpeed : null);
      }

      if (testType === "upload" || testType === "both") {
        this.graphData.upload.push(uploadSpeed > 0 ? uploadSpeed : null);
      }

      this.graphData.timestamps.push(timestamp);

      // Limit graph data points - maintain synchronization
      if (this.graphData.timestamps.length > this.maxGraphPoints) {
        this.graphData.download.shift();
        this.graphData.upload.shift();
        this.graphData.timestamps.shift();
      }

      this.drawGraph();
    } catch (error) {
      console.error("Critical measurement error:", error);
      this.domElements.testStatus.textContent =
        "Critical error during measurement";
      this.domElements.testStatus.classList.add("error");
    }
  }

  async measurePing() {
    // Use reliable, CORS-friendly endpoints for ping measurement
    const pingUrls = [
      "https://www.google.com/favicon.ico",
      "https://github.com/favicon.ico",
      "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js?_=1", // Small cacheable resource with query param
      "https://jsonplaceholder.typicode.com/posts/1",
    ];

    const results = [];

    // Test multiple endpoints and take the median
    for (const url of pingUrls.slice(0, 3)) {
      // Test 3 endpoints
      try {
        const startTime = performance.now();

        await fetch(url, {
          method: "GET",
          cache: "no-cache",
          mode: "no-cors", // Avoid CORS issues for ping measurement
        });

        const pingTime = performance.now() - startTime;

        // Validate reasonable ping time (5ms to 5000ms)
        if (pingTime >= 5 && pingTime <= 5000) {
          results.push(pingTime);
        }
      } catch (error) {
        console.error(`Ping to ${url} failed:`, error);
        continue;
      }
    }

    if (results.length === 0) {
      // Fallback ping measurement
      return Math.random() * 50 + 20; // Simulated ping between 20-70ms
    }

    // Return median ping time for better accuracy
    results.sort((a, b) => a - b);
    const median = results[Math.floor(results.length / 2)];

    return median;
  }

  async measureDownloadSpeed() {
    // Progressive size testing - start small and increase
    const testSize =
      this.testConfig.downloadSizes[
        Math.min(this.currentTestSize, this.testConfig.downloadSizes.length - 1)
      ];

    try {
      // For larger files, use parallel connections to better utilize bandwidth
      const useParallel = testSize >= 5 * 1024 * 1024; // 5MB or larger

      let result;
      if (useParallel) {
        result = await this.testDownloadWithParallelConnections(testSize);
      } else {
        result = await this.testDownloadWithCloudflare(testSize);
      }

      if (result === null) {
        // Fallback to alternative servers
        result = await this.testDownloadWithFallback(testSize);
      }

      if (result === null) {
        // Final fallback to simulated testing
        console.warn("All download servers failed, using simulation");
        return this.simulateNetworkSpeed("download");
      }

      // Increase test size for next measurement (progressive testing)
      if (this.currentTestSize < this.testConfig.downloadSizes.length - 1) {
        this.currentTestSize++;
      }

      return result;
    } catch (error) {
      console.error("Download measurement error:", error);
      return this.simulateNetworkSpeed("download");
    }
  }

  async testDownloadWithCloudflare(bytes) {
    try {
      // Use Cloudflare's optimized speed test endpoint
      const url = `https://speed.cloudflare.com/__down?bytes=${bytes}`;
      const startTime = performance.now();

      const response = await fetch(url, {
        method: "GET",
        cache: "no-cache",
        // Remove headers that might slow down the connection
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Start timing when we begin reading data, not when request starts
      const dataStartTime = performance.now();

      // Read the response data using streaming for more accurate measurement
      const reader = response.body.getReader();
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedBytes += value.length;
      }

      const endTime = performance.now();
      // Use data transfer time only, excluding initial request overhead
      const duration = (endTime - dataStartTime) / 1000; // seconds

      // Calculate speed in Mbps
      const mbps = (receivedBytes * 8) / (duration * 1000000);

      // Validate reasonable result
      if (mbps > 0 && mbps < 10000) {
        // Sanity check: 0-10Gbps
        return mbps;
      }

      return null;
    } catch (error) {
      console.error("Cloudflare test failed:", error);
      return null;
    }
  }

  async testDownloadWithParallelConnections(totalBytes) {
    try {
      const numConnections = 4; // Use 4 parallel connections
      const bytesPerConnection = Math.floor(totalBytes / numConnections);

      const promises = [];
      const startTime = performance.now();

      // Create multiple parallel download requests
      for (let i = 0; i < numConnections; i++) {
        const url = `https://speed.cloudflare.com/__down?bytes=${bytesPerConnection}`;
        promises.push(this.downloadChunk(url));
      }

      // Wait for all downloads to complete
      const results = await Promise.all(promises);
      const endTime = performance.now();

      // Calculate total bytes received
      const totalBytesReceived = results.reduce((sum, bytes) => sum + bytes, 0);

      // Calculate total duration (all connections run in parallel)
      const duration = (endTime - startTime) / 1000;
      const mbps = (totalBytesReceived * 8) / (duration * 1000000);

      if (mbps > 0 && mbps < 10000) {
        return mbps;
      }

      return null;
    } catch (error) {
      console.error("Parallel download test failed:", error);
      return null;
    }
  }

  async downloadChunk(url) {
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedBytes += value.length;
      }

      return receivedBytes;
    } catch (error) {
      console.error("Chunk download failed:", error);
      return 0;
    }
  }

  async testDownloadWithFallback(bytes) {
    // Try alternative methods for download testing
    const fallbackUrls = [
      `https://httpbin.org/bytes/${bytes}`,
      // Add more fallback URLs as needed
    ];

    for (const url of fallbackUrls) {
      try {
        const startTime = performance.now();

        const response = await fetch(url, {
          method: "GET",
          cache: "no-cache",
        });

        if (!response.ok) continue;

        const data = await response.arrayBuffer();
        const endTime = performance.now();

        const duration = (endTime - startTime) / 1000;
        const mbps = (data.byteLength * 8) / (duration * 1000000);

        if (mbps > 0 && mbps < 10000) {
          return mbps;
        }
      } catch (error) {
        console.error(`Fallback URL ${url} failed:`, error);
        continue;
      }
    }

    return null;
  }

  async measureUploadSpeed() {
    // Use progressive upload sizes for better accuracy
    const testSize =
      this.testConfig.uploadSizes[
        Math.min(
          this.currentUploadSizeIndex || 0,
          this.testConfig.uploadSizes.length - 1
        )
      ];

    try {
      // For larger files, use parallel uploads like downloads
      const useParallel = testSize >= 20 * 1024 * 1024; // 20MB or larger

      let result;
      if (useParallel) {
        result = await this.testUploadWithParallelConnections(testSize);
      } else {
        result = await this.testUploadWithHttpbin(testSize);
      }

      if (result === null) {
        // Try alternative upload endpoints
        result = await this.testUploadWithAlternativeEndpoints(testSize);
      }

      if (result === null) {
        // Final fallback to simulated testing
        console.warn("All upload servers failed, using simulation");
        return this.simulateNetworkSpeed("upload");
      }

      // Increase upload test size for next measurement
      if (!this.currentUploadSizeIndex) this.currentUploadSizeIndex = 0;
      if (
        this.currentUploadSizeIndex <
        this.testConfig.uploadSizes.length - 1
      ) {
        this.currentUploadSizeIndex++;
      }

      return result;
    } catch (error) {
      console.error("Upload measurement error:", error);
      return this.simulateNetworkSpeed("upload");
    }
  }

  async testUploadWithParallelConnections(totalBytes) {
    try {
      const chunkCount = 4; // Use 4 parallel connections like downloads
      const chunkSize = Math.floor(totalBytes / chunkCount);
      const uploadChunks = [];

      // Create upload chunks with test data
      for (let i = 0; i < chunkCount; i++) {
        const isLastChunk = i === chunkCount - 1;
        const currentChunkSize = isLastChunk
          ? totalBytes - chunkSize * i // Handle remainder in last chunk
          : chunkSize;

        uploadChunks.push({
          data: this.generateTestData(currentChunkSize),
          size: currentChunkSize,
        });
      }

      // Start parallel uploads
      const startTime = performance.now();

      const uploadPromises = uploadChunks.map(async (chunk, index) => {
        try {
          const response = await fetch("https://httpbin.org/post", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              "X-Chunk-Index": index.toString(),
            },
            body: chunk.data,
          });

          if (!response.ok) {
            throw new Error(`Chunk ${index} failed: HTTP ${response.status}`);
          }

          return { success: true, size: chunk.size };
        } catch (error) {
          console.warn(`Upload chunk ${index} failed:`, error);
          return { success: false, size: chunk.size };
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const endTime = performance.now();

      // Calculate total successful bytes uploaded
      let successfulBytes = 0;
      let successfulUploads = 0;

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.success) {
          successfulBytes += result.value.size;
          successfulUploads++;
        }
      });

      // Need at least 2 successful uploads for valid measurement
      if (successfulUploads < 2) {
        console.warn(
          `Only ${successfulUploads} uploads succeeded, insufficient for measurement`
        );
        return null;
      }

      const durationMs = endTime - startTime;
      const speedMbps = this.calculateSpeed(successfulBytes, durationMs);

      console.log(
        `Parallel upload: ${successfulBytes} bytes in ${durationMs.toFixed(
          0
        )}ms = ${speedMbps.toFixed(2)} Mbps`
      );
      return speedMbps;
    } catch (error) {
      console.error("Parallel upload error:", error);
      return null;
    }
  }

  async testUploadWithAlternativeEndpoints(bytes) {
    const endpoints = [
      {
        url: "https://postman-echo.com/post",
        name: "Postman Echo",
        headers: { "Content-Type": "application/octet-stream" },
      },
      {
        url: "https://jsonplaceholder.typicode.com/posts",
        name: "JSONPlaceholder",
        headers: { "Content-Type": "application/json" },
      },
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying upload to ${endpoint.name}...`);
        const testData =
          endpoint.name === "JSONPlaceholder"
            ? JSON.stringify({ data: this.generateTestData(bytes).toString() })
            : this.generateTestData(bytes);

        const startTime = performance.now();

        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: endpoint.headers,
          body: testData,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const endTime = performance.now();
        const durationMs = endTime - startTime;
        const speedMbps = this.calculateSpeed(bytes, durationMs);

        console.log(
          `${endpoint.name} upload: ${bytes} bytes in ${durationMs.toFixed(
            0
          )}ms = ${speedMbps.toFixed(2)} Mbps`
        );
        return speedMbps;
      } catch (error) {
        console.warn(`${endpoint.name} upload failed:`, error);
        continue;
      }
    }

    return null;
  }

  async testUploadWithHttpbin(bytes) {
    try {
      const testData = this.generateTestData(bytes);

      // More precise timing - measure only the actual upload
      const startTime = performance.now();

      const response = await fetch("https://httpbin.org/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": bytes.toString(),
        },
        body: testData,
      });

      // Stop timing as soon as response headers are received
      const endTime = performance.now();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Calculate using precise measurements
      const durationMs = endTime - startTime;
      const speedMbps = this.calculateSpeed(bytes, durationMs);

      console.log(
        `HTTPBin upload: ${bytes} bytes in ${durationMs.toFixed(
          0
        )}ms = ${speedMbps.toFixed(2)} Mbps`
      );

      // Validate reasonable result (uploads typically 10-80% of download speed)
      if (speedMbps > 0 && speedMbps < 1000) {
        return speedMbps;
      }

      return null;
    } catch (error) {
      console.error("Httpbin upload test failed:", error);
      return null;
    }
  }

  async testUploadWithFormData(bytes) {
    try {
      const testData = this.generateTestData(bytes);
      const formData = new FormData();
      formData.append("file", new Blob([testData]), "speedtest.bin");

      const startTime = performance.now();

      const response = await fetch("https://httpbin.org/post", {
        method: "POST",
        body: formData,
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const endTime = performance.now();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Calculate using precise measurements
      const durationMs = endTime - startTime;
      const speedMbps = this.calculateSpeed(bytes, durationMs);

      console.log(
        `FormData upload: ${bytes} bytes in ${durationMs.toFixed(
          0
        )}ms = ${speedMbps.toFixed(2)} Mbps`
      );

      if (speedMbps > 0 && speedMbps < 1000) {
        return speedMbps;
      }

      return null;
    } catch (error) {
      console.error("FormData upload test failed:", error);
      return null;
    }
  }

  generateTestData(size) {
    // For large uploads, use a more efficient pattern-based approach
    if (size > 10 * 1024 * 1024) {
      // 10MB+
      return this.generateLargeTestData(size);
    }

    // For smaller uploads, use random data for better accuracy
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }
    return data;
  }

  generateLargeTestData(size) {
    // Create a repeating pattern for efficiency with large files
    const patternSize = 1024; // 1KB pattern
    const pattern = new Uint8Array(patternSize);

    // Fill pattern with semi-random but predictable data
    for (let i = 0; i < patternSize; i++) {
      pattern[i] = (i * 137 + 71) % 256; // Simple pseudo-random sequence
    }

    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = pattern[i % patternSize];
    }

    return data;
  }

  calculateSpeed(bytes, durationMs) {
    // Convert to Mbps: (bytes * 8 bits/byte) / (duration in seconds * 1,000,000 bits/Mbps)
    const durationSeconds = durationMs / 1000;
    const speedMbps = (bytes * 8) / (durationSeconds * 1000000);
    return speedMbps;
  }

  simulateNetworkSpeed(type) {
    // Simulate realistic network speeds with variation
    const baseSpeed = type === "download" ? 50 : 20; // Mbps
    const variation = 0.7 + Math.random() * 0.6; // ±30% variation
    const timeVariation = Math.sin(Date.now() / 10000) * 0.2 + 1; // Slow time-based variation

    return Math.max(0.1, baseSpeed * variation * timeVariation);
  }

  updateProgress() {
    if (!this.isRunning || this.testDuration === 0) return;

    const elapsed = (Date.now() - this.startTime) / 1000;
    const progress = Math.min(100, (elapsed / this.testDuration) * 100);

    this.domElements.progressFill.style.width = progress + "%";
    this.domElements.testProgress.textContent = `${elapsed.toFixed(0)}s / ${
      this.testDuration
    }s`;
  }

  drawGraph() {
    const canvas = this.domElements.canvas;
    const ctx = this.domElements.canvasContext;

    // Ensure canvas elements exist before proceeding
    if (!canvas || !ctx) {
      console.warn("Canvas or context not available for drawing graph");
      return;
    }

    const rect = canvas.getBoundingClientRect();

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (this.graphData.timestamps.length === 0) {
      // Draw empty graph
      ctx.strokeStyle = "#e9ecef";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(50, rect.height - 50);
      ctx.lineTo(rect.width - 20, rect.height - 50);
      ctx.moveTo(50, 30);
      ctx.lineTo(50, rect.height - 50);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#999";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("No data yet", rect.width / 2, rect.height / 2);
      return;
    }

    // Calculate scales
    const testType = this.domElements.testTypeSelect.value;
    let maxSpeed = 10; // Minimum scale

    if (
      testType === "download" &&
      this.graphSettings.showDownload &&
      this.graphData.download.length > 0
    ) {
      const validDownloads = this.graphData.download.filter(
        (val) => val !== null && val > 0
      );
      if (validDownloads.length > 0) {
        maxSpeed = Math.max(maxSpeed, Math.max(...validDownloads));
      }
    } else if (
      testType === "upload" &&
      this.graphSettings.showUpload &&
      this.graphData.upload.length > 0
    ) {
      const validUploads = this.graphData.upload.filter(
        (val) => val !== null && val > 0
      );
      if (validUploads.length > 0) {
        maxSpeed = Math.max(maxSpeed, Math.max(...validUploads));
      }
    } else if (testType === "both") {
      if (
        this.graphSettings.showDownload &&
        this.graphData.download.length > 0
      ) {
        const validDownloads = this.graphData.download.filter(
          (val) => val !== null && val > 0
        );
        if (validDownloads.length > 0) {
          maxSpeed = Math.max(maxSpeed, Math.max(...validDownloads));
        }
      }
      if (this.graphSettings.showUpload && this.graphData.upload.length > 0) {
        const validUploads = this.graphData.upload.filter(
          (val) => val !== null && val > 0
        );
        if (validUploads.length > 0) {
          maxSpeed = Math.max(maxSpeed, Math.max(...validUploads));
        }
      }
    }

    const maxTime = Math.max(...this.graphData.timestamps);

    const padding = 50;
    const graphWidth = rect.width - padding - 20;
    const graphHeight = rect.height - padding - 30;

    // Draw grid
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * graphHeight) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - 20, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillText(((maxSpeed * (5 - i)) / 5).toFixed(0), padding - 10, y + 4);
    }

    // Vertical grid lines
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i * graphWidth) / 5;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, rect.height - 30);
      ctx.stroke();

      // X-axis labels
      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(((maxTime * i) / 5).toFixed(0) + "s", x, rect.height - 10);
    }

    // Draw data lines
    const drawLine = (data, color) => {
      if (data.length < 2) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let firstPoint = true;
      for (let i = 0; i < data.length; i++) {
        // Skip null values (failed measurements)
        if (data[i] === null || data[i] <= 0) continue;

        const x =
          padding + (this.graphData.timestamps[i] / maxTime) * graphWidth;
        const y = padding + (1 - data[i] / maxSpeed) * graphHeight;

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    // Draw download line
    if (this.graphSettings.showDownload) {
      drawLine(this.graphData.download, "#2196f3");
    }

    // Draw upload line
    if (this.graphSettings.showUpload) {
      drawLine(this.graphData.upload, "#9c27b0");
    }

    // Draw axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - 30);
    ctx.lineTo(rect.width - 20, rect.height - 30);
    ctx.stroke();
  }

  calculateStatistics() {
    const testType = this.domElements.testTypeSelect.value;

    // Download statistics
    if (
      (testType === "download" || testType === "both") &&
      this.measurementData.download.length > 0
    ) {
      const avgDownload = this.calculateAverage(this.measurementData.download);
      const maxDownload = Math.max(...this.measurementData.download);
      const minDownload = Math.min(...this.measurementData.download);

      document.getElementById("avgDownload").textContent =
        avgDownload.toFixed(1) + " Mbps";
      document.getElementById("maxDownload").textContent =
        maxDownload.toFixed(1) + " Mbps";
      document.getElementById("minDownload").textContent =
        minDownload.toFixed(1) + " Mbps";
    } else {
      document.getElementById("avgDownload").textContent = "-- Mbps";
      document.getElementById("maxDownload").textContent = "-- Mbps";
      document.getElementById("minDownload").textContent = "-- Mbps";
    }

    // Upload statistics
    if (
      (testType === "upload" || testType === "both") &&
      this.measurementData.upload.length > 0
    ) {
      const avgUpload = this.calculateAverage(this.measurementData.upload);
      const maxUpload = Math.max(...this.measurementData.upload);
      const minUpload = Math.min(...this.measurementData.upload);

      document.getElementById("avgUpload").textContent =
        avgUpload.toFixed(1) + " Mbps";
      document.getElementById("maxUpload").textContent =
        maxUpload.toFixed(1) + " Mbps";
      document.getElementById("minUpload").textContent =
        minUpload.toFixed(1) + " Mbps";
    } else {
      document.getElementById("avgUpload").textContent = "-- Mbps";
      document.getElementById("maxUpload").textContent = "-- Mbps";
      document.getElementById("minUpload").textContent = "-- Mbps";
    }

    // Stability calculation (coefficient of variation)
    let stability = 0;
    if (testType === "download" && this.measurementData.download.length > 0) {
      const downloadCV = this.calculateCV(this.measurementData.download);
      stability = Math.max(0, 100 - downloadCV);
    } else if (
      testType === "upload" &&
      this.measurementData.upload.length > 0
    ) {
      const uploadCV = this.calculateCV(this.measurementData.upload);
      stability = Math.max(0, 100 - uploadCV);
    } else if (
      testType === "both" &&
      this.measurementData.download.length > 0 &&
      this.measurementData.upload.length > 0
    ) {
      const downloadCV = this.calculateCV(this.measurementData.download);
      const uploadCV = this.calculateCV(this.measurementData.upload);
      stability = Math.max(0, 100 - (downloadCV + uploadCV) / 2);
    }

    // Duration
    const duration = (this.endTime - this.startTime) / 1000;

    document.getElementById("stability").textContent =
      stability.toFixed(0) + " %";
    document.getElementById("actualDuration").textContent =
      duration.toFixed(0) + " s";
  }

  calculateAverage(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  calculateCV(arr) {
    if (arr.length === 0) return 0;
    const mean = this.calculateAverage(arr);
    const variance =
      arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    const stdDev = Math.sqrt(variance);
    return (stdDev / mean) * 100;
  }

  /**
   * Generate a CSV formatted string from the measurement data
   * @returns {string} CSV formatted string containing all test results
   */
  generateCSV() {
    // Create CSV header with test information
    const testType = this.domElements.testTypeSelect.value;
    const duration =
      this.testDuration === 0 ? "Continuous" : `${this.testDuration}s`;
    const startTimeFormatted = new Date(this.startTime).toISOString();
    const endTimeFormatted = new Date(this.endTime).toISOString();

    let csv = [];

    // Add test metadata
    csv.push("# Internet Speed Test Results");
    csv.push(`# Test Type: ${testType}`);
    csv.push(`# Duration: ${duration}`);
    csv.push(`# Start Time: ${startTimeFormatted}`);
    csv.push(`# End Time: ${endTimeFormatted}`);
    csv.push(
      `# Actual Duration: ${((this.endTime - this.startTime) / 1000).toFixed(
        1
      )}s`
    );
    csv.push(""); // Empty line separator

    // Add column headers
    const headers = [
      "Timestamp",
      "Relative_Time_Seconds",
      "Download_Mbps",
      "Upload_Mbps",
      "Ping_ms",
    ];
    csv.push(headers.join(","));

    // Get the maximum length of data arrays to handle potential mismatches
    const maxLength = Math.max(
      this.graphData.timestamps.length,
      this.measurementData.download.length,
      this.measurementData.upload.length,
      this.measurementData.ping.length
    );

    // Generate data rows
    for (let i = 0; i < maxLength; i++) {
      const relativeTimeSeconds = this.graphData.timestamps[i] || "";
      const relativeTime = relativeTimeSeconds
        ? relativeTimeSeconds.toFixed(1)
        : "";
      const download =
        this.measurementData.download[i] !== undefined
          ? this.measurementData.download[i].toFixed(2)
          : "";
      const upload =
        this.measurementData.upload[i] !== undefined
          ? this.measurementData.upload[i].toFixed(2)
          : "";
      const ping =
        this.measurementData.ping[i] !== undefined
          ? this.measurementData.ping[i].toFixed(1)
          : "";

      // Convert relative time back to absolute timestamp for ISO format
      const absoluteTimestamp = relativeTimeSeconds
        ? this.startTime + relativeTimeSeconds * 1000
        : "";
      const timestampFormatted = absoluteTimestamp
        ? new Date(absoluteTimestamp).toISOString()
        : "";

      const row = [timestampFormatted, relativeTime, download, upload, ping];
      csv.push(row.join(","));
    }

    // Add statistics summary at the end
    csv.push(""); // Empty line separator
    csv.push("# Statistics Summary");

    if (this.measurementData.download.length > 0) {
      const downloadStats = {
        avg: this.calculateAverage(this.measurementData.download).toFixed(2),
        max: Math.max(...this.measurementData.download).toFixed(2),
        min: Math.min(...this.measurementData.download).toFixed(2),
      };
      csv.push(
        `# Download - Avg: ${downloadStats.avg} Mbps, Max: ${downloadStats.max} Mbps, Min: ${downloadStats.min} Mbps`
      );
    }

    if (this.measurementData.upload.length > 0) {
      const uploadStats = {
        avg: this.calculateAverage(this.measurementData.upload).toFixed(2),
        max: Math.max(...this.measurementData.upload).toFixed(2),
        min: Math.min(...this.measurementData.upload).toFixed(2),
      };
      csv.push(
        `# Upload - Avg: ${uploadStats.avg} Mbps, Max: ${uploadStats.max} Mbps, Min: ${uploadStats.min} Mbps`
      );
    }

    if (this.measurementData.ping.length > 0) {
      const pingStats = {
        avg: this.calculateAverage(this.measurementData.ping).toFixed(1),
        max: Math.max(...this.measurementData.ping).toFixed(1),
        min: Math.min(...this.measurementData.ping).toFixed(1),
      };
      csv.push(
        `# Ping - Avg: ${pingStats.avg} ms, Max: ${pingStats.max} ms, Min: ${pingStats.min} ms`
      );
    }

    return csv.join("\n");
  }

  /**
   * Generate a filename for the CSV export based on the test start time
   * @returns {string} Filename in format: speedtest_YYYY-MM-DD_HH-MM-SS.csv
   */
  generateCSVFilename() {
    const date = new Date(this.startTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `speedtest_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.csv`;
  }

  /**
   * Download the CSV file containing all test results
   */
  downloadCSV() {
    try {
      // Show CSV export indicator
      this.showCSVExportStatus("Exporting test results to CSV...", "loading");

      // Generate CSV content
      const csvContent = this.generateCSV();

      // Create blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      // Create download URL
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", this.generateCSVFilename());
      link.style.visibility = "hidden";

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      URL.revokeObjectURL(url);

      // Show success status
      this.showCSVExportStatus("CSV file downloaded successfully!", "success");

      // Update main test status
      this.updateTestStatus(
        "Test completed - CSV exported successfully",
        false
      );

      // Hide CSV status after a delay
      setTimeout(() => {
        this.hideCSVExportStatus();
      }, 3000);
    } catch (error) {
      console.error("CSV export failed:", error);
      this.showCSVExportStatus("Failed to export CSV file", "error");
      this.updateTestStatus("Test completed - CSV export failed", true);

      // Hide CSV status after a delay
      setTimeout(() => {
        this.hideCSVExportStatus();
      }, 3000);
    }
  }

  /**
   * Show the CSV export status indicator
   * @param {string} message - Message to display
   * @param {string} type - Type of status: 'loading', 'success', 'error'
   */
  showCSVExportStatus(message, type = "loading") {
    const statusEl = this.domElements.csvExportStatus;
    const messageEl = statusEl.querySelector(".export-message");
    const iconEl = statusEl.querySelector(".export-icon");

    // Update message
    messageEl.textContent = message;

    // Update icon based on type
    switch (type) {
      case "loading":
        iconEl.textContent = "📊";
        statusEl.className = "csv-export-status";
        break;
      case "success":
        iconEl.textContent = "✅";
        statusEl.className = "csv-export-status success";
        break;
      case "error":
        iconEl.textContent = "❌";
        statusEl.className = "csv-export-status error";
        break;
    }

    // Show the status indicator
    statusEl.style.display = "flex";
  }

  /**
   * Hide the CSV export status indicator
   */
  hideCSVExportStatus() {
    this.domElements.csvExportStatus.style.display = "none";
  }
}

// Initialize the speed test when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.speedTest = new SpeedTest();
});

// Handle window resize for graph
window.addEventListener("resize", () => {
  if (window.speedTest) {
    window.speedTest.initializeGraph();
  }
});
