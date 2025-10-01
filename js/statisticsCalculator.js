/**
 * Statistics Calculator Module
 * 
 * Handles all statistical calculations for speed test results including
 * averages, percentiles, coefficient of variation, and warm-up period filtering.
 * 
 * @module StatisticsCalculator
 */

import { CONSTANTS } from './constants.js';

export class StatisticsCalculator {
  /**
   * Create a new Statistics Calculator
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.warmupMeasurements = config.warmupMeasurements ?? CONSTANTS.WARMUP_MEASUREMENTS;
    this.minPercentileDataPoints = config.minPercentileDataPoints ?? CONSTANTS.MIN_PERCENTILE_DATA_POINTS;
  }

  /**
   * Calculate comprehensive statistics for all metrics
   * @param {MeasurementData} measurementData - Raw measurement data
   * @param {string} testType - Type of test ('download', 'upload', 'both')
   * @returns {Object} Calculated statistics for all metrics
   */
  calculateAll(measurementData, testType) {
    const stats = {};

    // Download statistics
    if ((testType === 'download' || testType === 'both') && measurementData.download.length > 0) {
      stats.download = this.calculateMetricStats(measurementData.download);
    }

    // Upload statistics
    if ((testType === 'upload' || testType === 'both') && measurementData.upload.length > 0) {
      stats.upload = this.calculateMetricStats(measurementData.upload);
    }

    // Ping statistics
    if (measurementData.ping.length > 0) {
      stats.ping = this.calculateMetricStats(measurementData.ping);
    }

    // Connection stability/consistency
    stats.stability = this.calculateStability(measurementData, testType);

    return stats;
  }

  /**
   * Calculate statistics for a single metric
   * @param {number[]} data - Measurement array
   * @returns {Object} Statistics including avg, max, min, p98
   */
  calculateMetricStats(data) {
    const warmedUpData = this.getWarmedUpData(data);
    
    if (warmedUpData.length === 0) {
      return {
        avg: 0,
        max: 0,
        min: 0,
        p98: 0,
        isWarmingUp: true,
      };
    }

    return {
      avg: this.calculateAverage(warmedUpData),
      max: Math.max(...warmedUpData),
      min: Math.min(...warmedUpData),
      p98: this.calculate98thPercentile(data),
      isWarmingUp: false,
    };
  }

  /**
   * Calculate average of an array
   * @param {number[]} arr - Array of numbers
   * @returns {number} Average value
   */
  calculateAverage(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Get data excluding warm-up period
   * @param {number[]} data - Full measurement array
   * @returns {number[]} Data with warm-up period excluded
   */
  getWarmedUpData(data) {
    if (data.length <= this.warmupMeasurements) {
      return [];
    }
    return data.slice(this.warmupMeasurements);
  }

  /**
   * Calculate 98th percentile by excluding top and bottom 1%
   * @param {number[]} data - Full measurement array
   * @returns {number} 98th percentile value (average of middle 98%)
   */
  calculate98thPercentile(data) {
    const warmedUpData = this.getWarmedUpData(data);
    
    if (warmedUpData.length < this.minPercentileDataPoints) {
      // Not enough data for meaningful percentile calculation
      return this.calculateAverage(warmedUpData);
    }

    // Sort data in ascending order
    const sortedData = [...warmedUpData].sort((a, b) => a - b);

    // Calculate indices for 1% and 99% cutoffs
    const bottomIndex = Math.floor(sortedData.length * CONSTANTS.PERCENTILE_BOTTOM_CUTOFF);
    const topIndex = Math.ceil(sortedData.length * CONSTANTS.PERCENTILE_TOP_CUTOFF);

    // Extract middle 98% of data
    const middle98Percent = sortedData.slice(bottomIndex, topIndex);

    // Return average of the middle 98%
    return this.calculateAverage(middle98Percent);
  }

  /**
   * Calculate coefficient of variation (CV) for data stability
   * @param {number[]} arr - Array of measurements
   * @returns {number} Coefficient of variation as percentage
   */
  calculateCV(arr) {
    if (arr.length === 0) return 0;
    
    const mean = this.calculateAverage(arr);
    if (mean === 0) return 0;
    
    const variance =
      arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    const stdDev = Math.sqrt(variance);
    
    return (stdDev / mean) * 100;
  }

  /**
   * Calculate connection stability/consistency score
   * @param {MeasurementData} measurementData - Raw measurement data
   * @param {string} testType - Type of test
   * @returns {number} Stability score (0-100, higher is better)
   */
  calculateStability(measurementData, testType) {
    let cvSum = 0;
    let cvCount = 0;

    if (testType === 'download' && measurementData.download.length > 0) {
      const warmedUpData = this.getWarmedUpData(measurementData.download);
      if (warmedUpData.length > 0) {
        const downloadCV = this.calculateCV(warmedUpData);
        cvSum += downloadCV;
        cvCount++;
      }
    }

    if (testType === 'upload' && measurementData.upload.length > 0) {
      const warmedUpData = this.getWarmedUpData(measurementData.upload);
      if (warmedUpData.length > 0) {
        const uploadCV = this.calculateCV(warmedUpData);
        cvSum += uploadCV;
        cvCount++;
      }
    }

    if (testType === 'both') {
      if (measurementData.download.length > 0) {
        const warmedUpDownload = this.getWarmedUpData(measurementData.download);
        if (warmedUpDownload.length > 0) {
          cvSum += this.calculateCV(warmedUpDownload);
          cvCount++;
        }
      }
      if (measurementData.upload.length > 0) {
        const warmedUpUpload = this.getWarmedUpData(measurementData.upload);
        if (warmedUpUpload.length > 0) {
          cvSum += this.calculateCV(warmedUpUpload);
          cvCount++;
        }
      }
    }

    if (cvCount === 0) return 0;

    const avgCV = cvSum / cvCount;
    return Math.max(0, 100 - avgCV);
  }

  /**
   * Format statistics for display
   * @param {Object} stats - Calculated statistics
   * @param {string} metricType - Type of metric ('speed' or 'ping')
   * @returns {Object} Formatted statistics with units
   */
  formatForDisplay(stats, metricType = 'speed') {
    const unit = metricType === 'ping' ? ' ms' : ' Mbps';
    const decimals = metricType === 'ping' ? 1 : 1;

    if (stats.isWarmingUp) {
      return {
        avg: 'Warming up...',
        max: 'Warming up...',
        min: 'Warming up...',
        p98: 'Warming up...',
      };
    }

    return {
      avg: stats.avg.toFixed(decimals) + unit,
      max: stats.max.toFixed(decimals) + unit,
      min: stats.min.toFixed(decimals) + unit,
      p98: stats.p98.toFixed(decimals) + unit,
    };
  }

  /**
   * Calculate test duration in seconds
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {number} Duration in seconds
   */
  calculateDuration(startTime, endTime) {
    return (endTime - startTime) / 1000;
  }
}
