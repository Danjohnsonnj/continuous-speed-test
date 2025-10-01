/**
 * Type Definitions for Speed Test Application
 * 
 * Comprehensive JSDoc type definitions for better IDE support,
 * code documentation, and type safety throughout the application.
 */

/**
 * @typedef {Object} MeasurementData
 * @property {number[]} download - Array of download speed measurements in Mbps
 * @property {number[]} upload - Array of upload speed measurements in Mbps
 * @property {number[]} ping - Array of ping latency measurements in ms
 */

/**
 * @typedef {Object} GraphData
 * @property {Array<number|null>} download - Download speeds for graphing (null for missing data)
 * @property {Array<number|null>} upload - Upload speeds for graphing (null for missing data)
 * @property {number[]} timestamps - Relative timestamps in seconds from test start
 */

/**
 * @typedef {Object} GraphSettings
 * @property {boolean} showDownload - Whether to display download line on graph
 * @property {boolean} showUpload - Whether to display upload line on graph
 * @property {number} maxDataPoints - Maximum number of data points to display
 * @property {number} slowSpeedThreshold - Speed threshold for red coloring (Mbps)
 * @property {GraphColors} colors - Color scheme for graph elements
 */

/**
 * @typedef {Object} GraphColors
 * @property {string} download - Color for download line
 * @property {string} upload - Color for upload line
 * @property {string} slowSpeed - Color for speeds below threshold
 * @property {string} grid - Color for grid lines
 * @property {string} axis - Color for axis lines
 * @property {string} reference - Color for reference lines
 */

/**
 * @typedef {Object} ServerConfig
 * @property {DownloadConfig} download - Download test endpoints
 * @property {UploadConfig} upload - Upload test endpoints
 * @property {string[]} ping - Ping test endpoints
 */

/**
 * @typedef {Object} DownloadConfig
 * @property {string} primary - Primary download endpoint URL
 * @property {string[]} fallbacks - Fallback download endpoints
 */

/**
 * @typedef {Object} UploadConfig
 * @property {string} primary - Primary upload endpoint URL
 * @property {string[]} fallbacks - Fallback upload endpoints
 * @property {string} cloudflare - Cloudflare upload endpoint
 */

/**
 * @typedef {Object} TestConfig
 * @property {number[]} downloadSizes - Progressive download test sizes in bytes
 * @property {number[]} uploadSizes - Progressive upload test sizes in bytes
 * @property {number} currentSizeIndex - Current index in download sizes array
 * @property {number} measurementInterval - Time between measurements in ms
 * @property {number} continuousTestInterval - Time between continuous tests in ms
 * @property {number} progressUpdateInterval - Time between progress updates in ms
 * @property {SpeedRange} validSpeedRange - Valid speed measurement range
 * @property {PingRange} validPingRange - Valid ping measurement range
 * @property {number} continuousConnections - Number of overlapping connections
 * @property {number} warmupMeasurements - Number of warmup measurements to exclude
 */

/**
 * @typedef {Object} SpeedRange
 * @property {number} min - Minimum valid speed in Mbps
 * @property {number} max - Maximum valid speed in Mbps
 */

/**
 * @typedef {Object} PingRange
 * @property {number} min - Minimum valid ping in ms
 * @property {number} max - Maximum valid ping in ms
 */

/**
 * @typedef {Object} ContinuousTestState
 * @property {Set<number>} activeDownloads - Set of active download test IDs
 * @property {Set<number>} activeUploads - Set of active upload test IDs
 * @property {SpeedMeasurements} recentSpeeds - Recent speed measurements
 * @property {number} lastUpdate - Timestamp of last speed update
 */

/**
 * @typedef {Object} SpeedMeasurements
 * @property {SpeedMeasurement[]} download - Recent download measurements
 * @property {SpeedMeasurement[]} upload - Recent upload measurements
 */

/**
 * @typedef {Object} SpeedMeasurement
 * @property {number} speed - Measured speed in Mbps
 * @property {number} timestamp - Measurement timestamp
 * @property {number} duration - Test duration in ms
 */

/**
 * @typedef {Object} Statistics
 * @property {number} avg - Average value
 * @property {number} max - Maximum value
 * @property {number} min - Minimum value
 */

/**
 * @typedef {Object} DOMElements
 * @property {HTMLButtonElement} startStopBtn - Start/stop test button
 * @property {HTMLSelectElement} testDurationSelect - Test duration selector
 * @property {HTMLSelectElement} testTypeSelect - Test type selector
 * @property {HTMLInputElement} measurementIntervalSlider - Measurement interval slider
 * @property {HTMLElement} intervalValue - Interval value display
 * @property {HTMLElement} downloadSpeed - Download speed display
 * @property {HTMLElement} uploadSpeed - Upload speed display
 * @property {HTMLElement} pingValue - Ping value display
 * @property {HTMLElement} testStatus - Test status message display
 * @property {HTMLElement} testProgress - Test progress display
 * @property {HTMLElement} progressFill - Progress bar fill element
 * @property {HTMLElement} csvExportStatus - CSV export status display
 * @property {HTMLCanvasElement} canvas - Graph canvas element
 * @property {CanvasRenderingContext2D} canvasContext - Canvas 2D context
 * @property {HTMLElement} canvasTooltip - Graph tooltip element
 * @property {HTMLButtonElement} toggleDownload - Download toggle button
 * @property {HTMLButtonElement} toggleUpload - Upload toggle button
 * @property {HTMLButtonElement} themeToggle - Theme toggle button
 * @property {HTMLInputElement} stayAwake - Stay awake checkbox
 * @property {HTMLElement} stayAwakeStatus - Stay awake status display
 * @property {HTMLButtonElement} exportCSVBtn - CSV export button
 * @property {StatisticsElements} stats - Statistics display elements
 */

/**
 * @typedef {Object} StatisticsElements
 * @property {HTMLElement} avgDownload - Average download display
 * @property {HTMLElement} maxDownload - Maximum download display
 * @property {HTMLElement} minDownload - Minimum download display
 * @property {HTMLElement} avgUpload - Average upload display
 * @property {HTMLElement} maxUpload - Maximum upload display
 * @property {HTMLElement} minUpload - Minimum upload display
 * @property {HTMLElement} p98Download - 98th percentile download display
 * @property {HTMLElement} p98Upload - 98th percentile upload display
 * @property {HTMLElement} p98Ping - 98th percentile ping display
 * @property {HTMLElement} stability - Stability/consistency display
 * @property {HTMLElement} actualDuration - Actual test duration display
 */

/**
 * @typedef {Object} GraphDimensions
 * @property {number} width - Total canvas width
 * @property {number} height - Total canvas height
 * @property {number} graphWidth - Width of graphing area
 * @property {number} graphHeight - Height of graphing area
 * @property {number} padding - Padding around graph
 * @property {number} maxSpeed - Maximum speed value for Y-axis
 * @property {number} maxTime - Maximum time value for X-axis
 */

/**
 * @typedef {Object} UploadEndpoint
 * @property {string} url - Endpoint URL
 * @property {string} name - Endpoint name for logging
 * @property {Object<string, string>} headers - HTTP headers to send
 */

/**
 * @typedef {Object} TestResults
 * @property {number} [download] - Download speed in Mbps
 * @property {number} [upload] - Upload speed in Mbps
 * @property {number} ping - Ping latency in ms
 */

/**
 * @typedef {'light'|'dark'|'auto'} Theme
 * The application theme setting
 */

/**
 * @typedef {'download'|'upload'|'both'} TestType
 * The type of speed test to perform
 */

/**
 * @typedef {'success'|'error'|'info'|''} StatusType
 * The type of status message
 */

/**
 * @typedef {'loading'|'success'|'error'} ExportStatusType
 * The type of CSV export status
 */

export {};
