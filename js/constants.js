/**
 * Application-wide Constants
 * 
 * Centralized configuration values for maintainability and readability.
 * All magic numbers and configuration values are defined here with clear,
 * semantic names that explain their purpose.
 */

/**
 * @typedef {Object} SpeedThresholds
 * @property {number} SLOW_SPEED_MBPS - Speed below which is considered slow (red alert)
 * @property {number} MIN_VALID_SPEED_MBPS - Minimum valid speed measurement
 * @property {number} MAX_VALID_SPEED_MBPS - Maximum valid speed measurement
 * @property {number} MIN_VALID_PING_MS - Minimum valid ping measurement
 * @property {number} MAX_VALID_PING_MS - Maximum valid ping measurement
 */

/**
 * @typedef {Object} TimingConstants
 * @property {number} DEFAULT_MEASUREMENT_INTERVAL_MS - Default time between measurements
 * @property {number} CONTINUOUS_TEST_INTERVAL_MS - Time between starting new continuous tests
 * @property {number} PROGRESS_UPDATE_INTERVAL_MS - Time between progress bar updates
 * @property {number} STATUS_MESSAGE_TIMEOUT_MS - How long to show status messages
 * @property {number} RESIZE_DEBOUNCE_MS - Debounce time for window resize events
 */

/**
 * @typedef {Object} TestConfiguration
 * @property {number} WARMUP_MEASUREMENTS - Number of initial measurements to exclude from stats
 * @property {number} CONTINUOUS_CONNECTIONS - Number of overlapping test connections
 * @property {number} MIN_PERCENTILE_DATA_POINTS - Minimum data points needed for percentile calc
 * @property {number} PARALLEL_CONNECTIONS - Number of parallel connections for large transfers
 */

/**
 * @typedef {Object} FileSizes
 * @property {number} SIZE_1MB - 1 Megabyte in bytes
 * @property {number} SIZE_5MB - 5 Megabytes in bytes
 * @property {number} SIZE_10MB - 10 Megabytes in bytes
 * @property {number} SIZE_20MB - 20 Megabytes in bytes
 * @property {number} SIZE_25MB - 25 Megabytes in bytes
 * @property {number} SIZE_35MB - 35 Megabytes in bytes
 * @property {number} SIZE_50MB - 50 Megabytes in bytes
 */

/**
 * @typedef {Object} GraphConfiguration
 * @property {number} MAX_DATA_POINTS - Maximum number of points to show on graph
 * @property {number} PADDING_PX - Padding around graph in pixels
 * @property {number} AXIS_MARGIN_RIGHT_PX - Right margin for graph axis
 * @property {number} AXIS_MARGIN_BOTTOM_PX - Bottom margin for graph axis
 * @property {number} DESIRED_HEIGHT_PX - Default canvas height
 * @property {number} GRID_DIVISIONS - Number of divisions on grid
 */

/**
 * @typedef {Object} PercentileConfiguration
 * @property {number} PERCENTILE_98TH - 98th percentile value (0.98)
 * @property {number} PERCENTILE_BOTTOM_CUTOFF - Bottom cutoff for percentile calc (0.01)
 * @property {number} PERCENTILE_TOP_CUTOFF - Top cutoff for percentile calc (0.99)
 */

export const CONSTANTS = {
  // Performance thresholds
  SLOW_SPEED_THRESHOLD_MBPS: 10,
  MIN_VALID_SPEED_MBPS: 0,
  MAX_VALID_SPEED_MBPS: 10000,
  MIN_VALID_PING_MS: 5,
  MAX_VALID_PING_MS: 5000,

  // Timing intervals (in milliseconds)
  DEFAULT_MEASUREMENT_INTERVAL_MS: 3000,
  CONTINUOUS_TEST_INTERVAL_MS: 500,
  PROGRESS_UPDATE_INTERVAL_MS: 100,
  STATUS_MESSAGE_TIMEOUT_MS: 3000,
  WAKE_LOCK_RELEASE_TIMEOUT_MS: 4000,
  RESIZE_DEBOUNCE_MS: 100,

  // Test configuration
  WARMUP_MEASUREMENTS: 3,
  CONTINUOUS_CONNECTIONS: 2,
  MIN_PERCENTILE_DATA_POINTS: 10,
  PARALLEL_CONNECTIONS: 4,
  PING_ENDPOINTS_TO_TEST: 3,

  // File sizes (in bytes)
  SIZE_1MB: 1024 * 1024,
  SIZE_5MB: 5 * 1024 * 1024,
  SIZE_10MB: 10 * 1024 * 1024,
  SIZE_20MB: 20 * 1024 * 1024,
  SIZE_25MB: 25 * 1024 * 1024,
  SIZE_35MB: 35 * 1024 * 1024,
  SIZE_50MB: 50 * 1024 * 1024,

  // Percentile calculations
  PERCENTILE_98TH: 0.98,
  PERCENTILE_BOTTOM_CUTOFF: 0.01,
  PERCENTILE_TOP_CUTOFF: 0.99,

  // Graph configuration
  MAX_GRAPH_DATA_POINTS: 50,
  GRAPH_PADDING_PX: 50,
  GRAPH_AXIS_MARGIN_RIGHT_PX: 20,
  GRAPH_AXIS_MARGIN_BOTTOM_PX: 30,
  GRAPH_DESIRED_HEIGHT_PX: 400,
  GRAPH_GRID_DIVISIONS: 5,
  GRAPH_CONTAINER_PADDING_PX: 48,

  // Data generation
  PATTERN_SIZE_BYTES: 1024,
  LARGE_FILE_THRESHOLD_BYTES: 10 * 1024 * 1024,

  // Test thresholds for determining strategy
  PARALLEL_DOWNLOAD_THRESHOLD_BYTES: 5 * 1024 * 1024,
  PARALLEL_UPLOAD_THRESHOLD_BYTES: 20 * 1024 * 1024,
  
  // Upload speed validation (typically 10-80% of download)
  MAX_REASONABLE_UPLOAD_MBPS: 1000,

  // Local storage keys
  STORAGE_KEY_THEME: 'speed-test-theme',

  // Theme values
  THEME_LIGHT: 'light',
  THEME_DARK: 'dark',
  THEME_AUTO: 'auto',

  // Safari theme colors
  SAFARI_THEME_COLOR_LIGHT: '#ffffff',
  SAFARI_THEME_COLOR_DARK: '#000000',
};

/**
 * Graph color scheme configuration
 */
export const GRAPH_COLORS = {
  download: '#2196f3',
  upload: '#9c27b0',
  slowSpeed: '#ef4444',
  grid: '#f0f0f0',
  axis: '#333',
  reference: '#fbbf24',
};

/**
 * Server endpoint configuration
 */
export const SERVER_ENDPOINTS = {
  download: {
    primary: 'https://speed.cloudflare.com/__down?bytes=',
    fallbacks: [
      'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
      'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
    ],
  },
  upload: {
    primary: 'https://httpbin.org/post',
    fallbacks: [
      'https://postman-echo.com/post',
      'https://jsonplaceholder.typicode.com/posts',
    ],
    cloudflare: 'https://speed.cloudflare.com/__up',
  },
  ping: [
    'https://www.google.com/favicon.ico',
    'https://github.com/favicon.ico',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js?_=1',
    'https://jsonplaceholder.typicode.com/posts/1',
  ],
};

/**
 * Test size configurations
 */
export const TEST_SIZES = {
  download: [
    CONSTANTS.SIZE_1MB,
    CONSTANTS.SIZE_5MB,
    CONSTANTS.SIZE_10MB,
    CONSTANTS.SIZE_25MB,
    CONSTANTS.SIZE_50MB,
  ],
  upload: [
    CONSTANTS.SIZE_10MB,
    CONSTANTS.SIZE_20MB,
    CONSTANTS.SIZE_35MB,
    CONSTANTS.SIZE_50MB,
  ],
};
