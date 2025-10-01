/**
 * Graph Renderer Module
 * 
 * Handles all canvas rendering operations for the speed test graph.
 * Provides real-time visualization of download/upload speeds with
 * dynamic coloring based on performance thresholds.
 * 
 * @module GraphRenderer
 */

import { CONSTANTS, GRAPH_COLORS } from './constants.js';

export class GraphRenderer {
  /**
   * Create a new Graph Renderer
   * @param {HTMLCanvasElement} canvas - The canvas element for rendering
   * @param {Object} settings - Graph display settings
   */
  constructor(canvas, settings = {}) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d');
    
    this.settings = {
      showDownload: settings.showDownload ?? true,
      showUpload: settings.showUpload ?? true,
      maxDataPoints: settings.maxDataPoints ?? CONSTANTS.MAX_GRAPH_DATA_POINTS,
      slowSpeedThreshold: settings.slowSpeedThreshold ?? CONSTANTS.SLOW_SPEED_THRESHOLD_MBPS,
      colors: { ...GRAPH_COLORS, ...(settings.colors || {}) },
    };
  }

  /**
   * Initialize the canvas for high-DPI displays
   * Sets up canvas dimensions and scaling for retina displays
   * @returns {boolean} True if initialization successful
   */
  initialize() {
    if (!this.shouldDrawGraph()) {
      console.warn('Canvas or context not available for graph initialization');
      return false;
    }

    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    const availableWidth = containerRect.width - CONSTANTS.GRAPH_CONTAINER_PADDING_PX;
    const desiredHeight = CONSTANTS.GRAPH_DESIRED_HEIGHT_PX;
    
    // Configure for high-DPI displays
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = availableWidth * dpr;
    this.canvas.height = desiredHeight * dpr;
    
    this.canvas.style.width = availableWidth + 'px';
    this.canvas.style.height = desiredHeight + 'px';
    
    this.ctx.scale(dpr, dpr);

    this.draw({});
    return true;
  }

  /**
   * Check if graph can be drawn
   * @returns {boolean} True if canvas and context are available
   * @private
   */
  shouldDrawGraph() {
    return Boolean(this.canvas && this.ctx);
  }

  /**
   * Main draw method - orchestrates the graph rendering
   * @param {Object} graphData - The data to render
   * @param {Array<number|null>} graphData.download - Download speeds
   * @param {Array<number|null>} graphData.upload - Upload speeds
   * @param {number[]} graphData.timestamps - Timestamps in seconds
   * @param {string} testType - Current test type ('download', 'upload', or 'both')
   */
  draw(graphData, testType = 'both') {
    if (!this.shouldDrawGraph()) return;

    const rect = this.canvas.getBoundingClientRect();
    this.clearCanvas(rect);

    if (!graphData.timestamps || graphData.timestamps.length === 0) {
      this.drawEmptyState(rect);
      return;
    }

    const dimensions = this.calculateGraphDimensions(rect, graphData, testType);
    
    this.drawGrid(dimensions);
    this.drawAxes(dimensions);
    
    if (this.settings.showDownload && graphData.download) {
      this.drawMetricLine(
        graphData.download,
        graphData.timestamps,
        dimensions,
        this.settings.colors.download
      );
    }
    
    if (this.settings.showUpload && graphData.upload) {
      this.drawMetricLine(
        graphData.upload,
        graphData.timestamps,
        dimensions,
        this.settings.colors.upload
      );
    }
    
    this.drawReferenceLine(dimensions);
  }

  /**
   * Clear the entire canvas
   * @param {DOMRect} rect - Canvas bounding rectangle
   * @private
   */
  clearCanvas(rect) {
    this.ctx.clearRect(0, 0, rect.width, rect.height);
  }

  /**
   * Draw empty state message when no data available
   * @param {DOMRect} rect - Canvas bounding rectangle
   * @private
   */
  drawEmptyState(rect) {
    // Draw placeholder grid
    this.ctx.strokeStyle = '#e9ecef';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(CONSTANTS.GRAPH_PADDING_PX, rect.height - CONSTANTS.GRAPH_PADDING_PX);
    this.ctx.lineTo(rect.width - CONSTANTS.GRAPH_AXIS_MARGIN_RIGHT_PX, rect.height - CONSTANTS.GRAPH_PADDING_PX);
    this.ctx.moveTo(CONSTANTS.GRAPH_PADDING_PX, 30);
    this.ctx.lineTo(CONSTANTS.GRAPH_PADDING_PX, rect.height - CONSTANTS.GRAPH_PADDING_PX);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw "No data" message
    this.ctx.fillStyle = '#999';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('No data yet', rect.width / 2, rect.height / 2);
  }

  /**
   * Calculate graph dimensions and scales
   * @param {DOMRect} rect - Canvas bounding rectangle
   * @param {Object} graphData - Graph data for scaling
   * @param {string} testType - Current test type
   * @returns {GraphDimensions} Calculated dimensions
   * @private
   */
  calculateGraphDimensions(rect, graphData, testType) {
    const padding = CONSTANTS.GRAPH_PADDING_PX;
    const graphWidth = rect.width - padding - CONSTANTS.GRAPH_AXIS_MARGIN_RIGHT_PX;
    const graphHeight = rect.height - padding - CONSTANTS.GRAPH_AXIS_MARGIN_BOTTOM_PX;
    
    let maxSpeed = 10; // Minimum scale

    // Calculate maximum speed based on visible data
    if (testType === 'download' && this.settings.showDownload && graphData.download) {
      const validDownloads = graphData.download.filter(val => val !== null && val > 0);
      if (validDownloads.length > 0) {
        maxSpeed = Math.max(maxSpeed, Math.max(...validDownloads));
      }
    } else if (testType === 'upload' && this.settings.showUpload && graphData.upload) {
      const validUploads = graphData.upload.filter(val => val !== null && val > 0);
      if (validUploads.length > 0) {
        maxSpeed = Math.max(maxSpeed, Math.max(...validUploads));
      }
    } else if (testType === 'both') {
      if (this.settings.showDownload && graphData.download) {
        const validDownloads = graphData.download.filter(val => val !== null && val > 0);
        if (validDownloads.length > 0) {
          maxSpeed = Math.max(maxSpeed, Math.max(...validDownloads));
        }
      }
      if (this.settings.showUpload && graphData.upload) {
        const validUploads = graphData.upload.filter(val => val !== null && val > 0);
        if (validUploads.length > 0) {
          maxSpeed = Math.max(maxSpeed, Math.max(...validUploads));
        }
      }
    }

    const maxTime = Math.max(...graphData.timestamps);

    return {
      width: rect.width,
      height: rect.height,
      graphWidth,
      graphHeight,
      padding,
      maxSpeed,
      maxTime,
    };
  }

  /**
   * Draw grid lines for the graph
   * @param {GraphDimensions} dimensions - Graph dimensions
   * @private
   */
  drawGrid(dimensions) {
    this.ctx.strokeStyle = this.settings.colors.grid;
    this.ctx.lineWidth = 1;

    const { padding, graphWidth, graphHeight, width } = dimensions;
    const divisions = CONSTANTS.GRAPH_GRID_DIVISIONS;

    // Draw horizontal grid lines
    for (let i = 0; i <= divisions; i++) {
      const y = padding + (i * graphHeight) / divisions;
      this.ctx.beginPath();
      this.ctx.moveTo(padding, y);
      this.ctx.lineTo(width - CONSTANTS.GRAPH_AXIS_MARGIN_RIGHT_PX, y);
      this.ctx.stroke();
    }

    // Draw vertical grid lines
    for (let i = 0; i <= divisions; i++) {
      const x = padding + (i * graphWidth) / divisions;
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding);
      this.ctx.lineTo(x, dimensions.height - CONSTANTS.GRAPH_AXIS_MARGIN_BOTTOM_PX);
      this.ctx.stroke();
    }
  }

  /**
   * Draw axis lines and labels
   * @param {GraphDimensions} dimensions - Graph dimensions
   * @private
   */
  drawAxes(dimensions) {
    const { padding, graphWidth, graphHeight, maxSpeed, maxTime, height, width } = dimensions;
    const divisions = CONSTANTS.GRAPH_GRID_DIVISIONS;

    // Set label style
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px Arial';

    // Y-axis labels (speed)
    this.ctx.textAlign = 'right';
    for (let i = 0; i <= divisions; i++) {
      const y = padding + (i * graphHeight) / divisions;
      const speedValue = ((maxSpeed * (divisions - i)) / divisions).toFixed(0);
      this.ctx.fillText(speedValue, padding - 10, y + 4);
    }

    // X-axis labels (time)
    this.ctx.textAlign = 'center';
    for (let i = 0; i <= divisions; i++) {
      const x = padding + (i * graphWidth) / divisions;
      const timeValue = ((maxTime * i) / divisions).toFixed(0);
      this.ctx.fillText(timeValue + 's', x, height - 10);
    }

    // Draw axis lines
    this.ctx.strokeStyle = this.settings.colors.axis;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(padding, padding);
    this.ctx.lineTo(padding, height - CONSTANTS.GRAPH_AXIS_MARGIN_BOTTOM_PX);
    this.ctx.lineTo(width - CONSTANTS.GRAPH_AXIS_MARGIN_RIGHT_PX, height - CONSTANTS.GRAPH_AXIS_MARGIN_BOTTOM_PX);
    this.ctx.stroke();
  }

  /**
   * Draw a metric line (download or upload) with dynamic coloring
   * @param {Array<number|null>} data - Speed data array
   * @param {number[]} timestamps - Timestamp array
   * @param {GraphDimensions} dimensions - Graph dimensions
   * @param {string} normalColor - Normal line color
   * @private
   */
  drawMetricLine(data, timestamps, dimensions, normalColor) {
    if (data.length < 2) return;

    const { padding, graphWidth, graphHeight, maxSpeed, maxTime } = dimensions;
    this.ctx.lineWidth = 2;

    // Draw line segments with dynamic coloring
    for (let i = 0; i < data.length - 1; i++) {
      // Skip null or invalid values
      if (data[i] === null || data[i] <= 0 || data[i + 1] === null || data[i + 1] <= 0) {
        continue;
      }

      const x1 = padding + (timestamps[i] / maxTime) * graphWidth;
      const y1 = padding + (1 - data[i] / maxSpeed) * graphHeight;
      const x2 = padding + (timestamps[i + 1] / maxTime) * graphWidth;
      const y2 = padding + (1 - data[i + 1] / maxSpeed) * graphHeight;

      // Use red color if either point is below threshold
      const useSlowColor = 
        data[i] < this.settings.slowSpeedThreshold ||
        data[i + 1] < this.settings.slowSpeedThreshold;
      
      this.ctx.strokeStyle = useSlowColor 
        ? this.settings.colors.slowSpeed 
        : normalColor;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  /**
   * Draw reference line for speed threshold
   * @param {GraphDimensions} dimensions - Graph dimensions
   * @private
   */
  drawReferenceLine(dimensions) {
    const { maxSpeed, padding, graphHeight, graphWidth, width } = dimensions;
    
    // Only draw reference line if it's within the visible range
    if (maxSpeed < this.settings.slowSpeedThreshold) return;

    const referenceY = 
      padding + (1 - this.settings.slowSpeedThreshold / maxSpeed) * graphHeight;

    this.ctx.strokeStyle = this.settings.colors.reference;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(padding, referenceY);
    this.ctx.lineTo(width - CONSTANTS.GRAPH_AXIS_MARGIN_RIGHT_PX, referenceY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Add label for reference line
    this.ctx.fillStyle = this.settings.colors.reference;
    this.ctx.font = '11px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      `${this.settings.slowSpeedThreshold} Mbps`,
      padding + 5,
      referenceY - 5
    );
  }

  /**
   * Find the closest data point to a mouse position
   * @param {number} mouseX - Mouse X coordinate relative to canvas
   * @param {number[]} timestamps - Timestamp array
   * @param {GraphDimensions} dimensions - Graph dimensions
   * @returns {number} Index of closest data point
   */
  findClosestDataPoint(mouseX, timestamps, dimensions) {
    const { padding, graphWidth, maxTime } = dimensions;
    
    const mouseTime = ((mouseX - padding) / graphWidth) * maxTime;
    
    let closestIndex = 0;
    let minDistance = Math.abs(timestamps[0] - mouseTime);
    
    for (let i = 1; i < timestamps.length; i++) {
      const distance = Math.abs(timestamps[i] - mouseTime);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    return closestIndex;
  }

  /**
   * Check if mouse is within the graph area
   * @param {number} mouseX - Mouse X coordinate
   * @param {number} mouseY - Mouse Y coordinate
   * @param {DOMRect} rect - Canvas bounding rectangle
   * @returns {boolean} True if mouse is within graph
   */
  isMouseInGraph(mouseX, mouseY, rect) {
    const padding = CONSTANTS.GRAPH_PADDING_PX;
    const maxX = rect.width - CONSTANTS.GRAPH_AXIS_MARGIN_RIGHT_PX;
    const maxY = rect.height - CONSTANTS.GRAPH_AXIS_MARGIN_BOTTOM_PX;
    
    return mouseX >= padding && mouseX <= maxX && mouseY >= padding && mouseY <= maxY;
  }

  /**
   * Update graph settings
   * @param {Object} newSettings - Settings to update
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }
}
