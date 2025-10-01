/**
 * CSV Exporter Module
 * 
 * Handles generation and download of CSV files containing speed test results.
 * Provides comprehensive data export with metadata, measurements, and statistics.
 * 
 * @module CSVExporter
 */

export class CSVExporter {
  /**
   * Create a new CSV Exporter
   */
  constructor() {
    this.statusCallback = null;
  }

  /**
   * Set callback for status updates
   * @param {Function} callback - Function to call with status updates (message, type)
   */
  onStatusUpdate(callback) {
    this.statusCallback = callback;
  }

  /**
   * Emit a status update
   * @param {string} message - Status message
   * @param {ExportStatusType} type - Message type
   * @private
   */
  emitStatus(message, type = 'loading') {
    if (this.statusCallback) {
      this.statusCallback(message, type);
    }
  }

  /**
   * Generate CSV content from measurement data
   * @param {Object} params - Export parameters
   * @param {MeasurementData} params.measurementData - Raw measurement data
   * @param {GraphData} params.graphData - Graph display data
   * @param {string} params.testType - Type of test performed
   * @param {number} params.testDuration - Configured test duration
   * @param {number} params.startTime - Test start timestamp
   * @param {number} params.endTime - Test end timestamp
   * @returns {string} CSV formatted string
   */
  generate({ measurementData, graphData, testType, testDuration, startTime, endTime }) {
    const csv = [];

    // Add metadata header
    csv.push('# Internet Speed Test Results');
    csv.push(`# Test Type: ${testType}`);
    csv.push(`# Duration: ${testDuration === 0 ? 'Continuous' : testDuration + 's'}`);
    csv.push(`# Start Time: ${new Date(startTime).toISOString()}`);
    csv.push(`# End Time: ${new Date(endTime).toISOString()}`);
    csv.push(`# Actual Duration: ${((endTime - startTime) / 1000).toFixed(1)}s`);
    csv.push(''); // Empty line separator

    // Add column headers
    const headers = [
      'Timestamp',
      'Local_Time',
      'Relative_Time_Seconds',
      'Download_Mbps',
      'Upload_Mbps',
      'Ping_ms',
    ];
    csv.push(headers.join(','));

    // Generate data rows
    const maxLength = Math.max(
      graphData.timestamps?.length || 0,
      measurementData.download?.length || 0,
      measurementData.upload?.length || 0,
      measurementData.ping?.length || 0
    );

    for (let i = 0; i < maxLength; i++) {
      const relativeTimeSeconds = graphData.timestamps?.[i];
      const relativeTime = relativeTimeSeconds ? relativeTimeSeconds.toFixed(1) : '';
      
      const download =
        measurementData.download?.[i] !== undefined
          ? measurementData.download[i].toFixed(2)
          : '';
      
      const upload =
        measurementData.upload?.[i] !== undefined
          ? measurementData.upload[i].toFixed(2)
          : '';
      
      const ping =
        measurementData.ping?.[i] !== undefined
          ? measurementData.ping[i].toFixed(1)
          : '';

      // Calculate absolute timestamp
      const absoluteTimestamp = relativeTimeSeconds
        ? startTime + relativeTimeSeconds * 1000
        : '';
      
      const timestampFormatted = absoluteTimestamp
        ? new Date(absoluteTimestamp).toISOString()
        : '';
      
      const localTimeFormatted = absoluteTimestamp
        ? new Date(absoluteTimestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
        : '';

      const row = [timestampFormatted, localTimeFormatted, relativeTime, download, upload, ping];
      csv.push(row.join(','));
    }

    // Add statistics summary
    csv.push(''); // Empty line separator
    csv.push('# Statistics Summary');

    if (measurementData.download?.length > 0) {
      const stats = this.calculateStats(measurementData.download);
      csv.push(
        `# Download - Avg: ${stats.avg} Mbps, Max: ${stats.max} Mbps, Min: ${stats.min} Mbps, 98th Percentile: ${stats.p98} Mbps`
      );
    }

    if (measurementData.upload?.length > 0) {
      const stats = this.calculateStats(measurementData.upload);
      csv.push(
        `# Upload - Avg: ${stats.avg} Mbps, Max: ${stats.max} Mbps, Min: ${stats.min} Mbps, 98th Percentile: ${stats.p98} Mbps`
      );
    }

    if (measurementData.ping?.length > 0) {
      const stats = this.calculateStats(measurementData.ping);
      csv.push(
        `# Ping - Avg: ${stats.avg} ms, Max: ${stats.max} ms, Min: ${stats.min} ms, 98th Percentile: ${stats.p98} ms`
      );
    }

    return csv.join('\n');
  }

  /**
   * Calculate basic statistics for a data array
   * @param {number[]} data - Measurement array
   * @returns {Object} Statistics object
   * @private
   */
  calculateStats(data) {
    const avg = (data.reduce((sum, val) => sum + val, 0) / data.length).toFixed(2);
    const max = Math.max(...data).toFixed(2);
    const min = Math.min(...data).toFixed(2);
    
    // Simple 98th percentile calculation
    const sorted = [...data].sort((a, b) => a - b);
    const p98Index = Math.floor(sorted.length * 0.98);
    const p98 = sorted[p98Index].toFixed(2);

    return { avg, max, min, p98 };
  }

  /**
   * Generate filename for CSV export
   * @param {number} startTime - Test start timestamp
   * @returns {string} Filename in format: speedtest_YYYY-MM-DD_HH-MM-SS.csv
   */
  generateFilename(startTime) {
    const date = new Date(startTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `speedtest_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.csv`;
  }

  /**
   * Download CSV file
   * @param {string} csvContent - CSV content string
   * @param {string} filename - Filename for download
   * @returns {boolean} True if successful
   */
  download(csvContent, filename) {
    try {
      this.emitStatus('Exporting test results to CSV...', 'loading');

      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      this.emitStatus('CSV file downloaded successfully!', 'success');
      return true;
    } catch (error) {
      console.error('CSV export failed:', error);
      this.emitStatus('Failed to export CSV file', 'error');
      return false;
    }
  }

  /**
   * Generate and download CSV in one operation
   * @param {Object} params - Export parameters (same as generate())
   * @returns {boolean} True if successful
   */
  generateAndDownload(params) {
    const csvContent = this.generate(params);
    const filename = this.generateFilename(params.startTime);
    return this.download(csvContent, filename);
  }
}
