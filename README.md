# Internet Speed Test - Real-time Network Monitoring

A modern, accessible web application for testing internet connection speeds using real-world infrastructure. Built with vanilla HTML, CSS, and JavaScript, this tool provides accurate speed measurements through Cloudflare Speed Test endpoints, HTTPBin, and major CDN services.

**✨ Now featuring elegant dark mode, smart performance alerts, and refined statistics!**

## 🎯 Project Goals

- **Real-world Testing**: Use actual network infrastructure (Cloudflare, HTTPBin, Google/GitHub CDNs) instead of simulated tests
- **Continuous Monitoring**: Provide real-time speed monitoring over configurable time periods
- **Accessibility First**: Full ARIA support and semantic HTML for screen readers and assistive technologies
- **Progressive Enhancement**: Works on all modern browsers without external dependencies
- **Educational Value**: Clean, well-documented code that demonstrates modern web development practices

## ✨ Features

### Core Functionality

- **Download Speed Testing**: Progressive file size testing using Cloudflare Speed Test endpoints
- **Upload Speed Testing**: Real upload measurement via HTTPBin endpoints
- **Ping/Latency Testing**: Multi-endpoint ping measurement for accurate latency detection
- **Real-time Graphing**: Live visualization of speed data using HTML5 Canvas
- **Configurable Duration**: Test periods from 30 seconds to 5 minutes
- **CSV Data Export**: Optional export of performance data with timestamp-based filenames (disabled by default)
- **Configurable Measurement Intervals**: Adjustable data collection frequency (1-5 seconds)
- **Wake Lock Support**: Keep device awake during long tests to prevent interruption

### User Experience

- **Modern Design System**: Elegant, minimalist interface with sophisticated typography and refined color palette
- **Smart Dark Mode**: Automatic system preference detection with manual toggle (Light → Dark → Auto modes)
- **Monochromatic Dark Theme**: Professional black, grey, and white color scheme for focused work sessions
- **Responsive Design**: Mobile-first responsive layout with optimized touch targets
- **Accessibility**: Full WCAG AA/AAA compliance with enhanced contrast ratios and screen reader support
- **Real-time Updates**: Live speed metrics and progress indicators
- **Smart Performance Alerts**: Visual warnings when speeds drop below 10 Mbps threshold
- **Interactive Graph**: Toggle different metrics on/off in real-time with color-coded performance zones
- **Refined Statistics**: Warm-up period exclusion for accurate minimum/average calculations
- **Comprehensive Analytics**: Detailed stats including averages, peaks, and consistency metrics
- **Data Export**: Optional CSV export with downloadable performance data over time (disabled by default)
- **Measurement Control**: Configurable data collection intervals with reliability guidance
- **Device Management**: Wake lock toggle to prevent device sleep during extended monitoring sessions

### Technical Features

- **Progressive Testing**: Starts with small files, increases size for optimal accuracy
- **Fallback Systems**: Multiple endpoint redundancy for reliable testing
- **Error Recovery**: Graceful degradation when endpoints are unavailable
- **Performance Optimized**: Efficient DOM updates and minimal resource usage
- **Smart Data Filtering**: Warm-up period exclusion prevents startup artifacts from skewing statistics
- **Dynamic Graph Coloring**: Real-time visual alerts for speeds below performance thresholds
- **Theme System**: Comprehensive CSS custom properties with system preference integration
- **Data Persistence**: Optional CSV export with comprehensive performance metrics (disabled by default) and localStorage theme preferences
- **Measurement Flexibility**: Configurable data collection intervals (1-5 seconds) with reliability guidance
- **Professional Statistics**: Industry-standard calculations excluding connection establishment delays
- **Wake Lock Integration**: Automatic device sleep prevention with graceful fallback for unsupported browsers

## 🏗️ Project Structure

### Modular Architecture (✨ Fully Refactored!)

```
continuous-speed-test/
├── index.html          # Main application interface (loads modular system)
├── styles.css          # Complete styling system
├── script.js           # Original monolithic version (preserved as backup)
├── README.md           # Project documentation
│
├── documents/          # Documentation files
│   ├── ARCHITECTURE.md
│   ├── COMPLETION_SUMMARY.md
│   ├── DOCUMENTATION_UPDATE_SUMMARY.md
│   ├── FINAL_REPORT.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── QUICK_START.md
│   └── REFACTORING_SUMMARY.md
│
└── js/                 # Modular ES6 modules
    ├── speedTest.js              # Main coordinator (750 lines)
    ├── uiController.js           # UI management (550 lines)
    ├── graphRenderer.js          # Canvas rendering (350 lines)
    ├── networkTesting.js         # Network tests (550 lines)
    ├── statisticsCalculator.js   # Statistics (200 lines)
    ├── wakeLockManager.js        # Wake Lock API (150 lines)
    ├── csvExporter.js            # CSV export (200 lines)
    ├── constants.js              # Configuration (150 lines)
    └── types.js                  # Type definitions (250 lines)
```

### Module Overview

#### **Core Modules**

##### `js/speedTest.js` (750 lines)
**Purpose**: Main application coordinator - orchestrates all modules

- **Test Lifecycle**: Manages start/stop, continuous testing, and measurement intervals
- **Module Coordination**: Initializes and coordinates all 8 other modules
- **Event Management**: Handles all user interactions and DOM events
- **Data Flow**: Routes data between network tests, statistics, graphs, and UI
- **Continuous Testing**: Maintains overlapping connections for smooth monitoring

##### `js/uiController.js` (550 lines)
**Purpose**: All DOM manipulation and UI updates

- **Display Updates**: Speed displays, status messages, progress indicators
- **Theme Management**: Light/dark/auto mode switching with localStorage persistence
- **Statistics Display**: Formats and updates all calculated statistics
- **Tooltip System**: Interactive graph tooltips with data point details
- **DOM Caching**: Efficient element reference management

##### `js/graphRenderer.js` (350 lines)
**Purpose**: Canvas-based visualization (refactored from 200+ line drawGraph)

- **High-DPI Support**: Retina display optimization
- **13 Focused Methods**: Each under 30 lines with single responsibility
- **Dynamic Coloring**: Performance-based line colors (red for slow speeds)
- **Grid & Axes**: Clean background grid with labeled axes
- **Mouse Interaction**: Hover detection for tooltip display

##### `js/networkTesting.js` (550 lines)
**Purpose**: All network speed testing operations

- **Download Tests**: Cloudflare CDN with progressive sizing (1MB → 50MB)
- **Upload Tests**: HTTPBin with progressive sizing (1MB → 10MB)
- **Ping Tests**: Multi-endpoint latency measurement
- **Continuous Testing**: Maintains 2 overlapping connections
- **Fallback Strategies**: Graceful degradation when endpoints fail

##### `js/statisticsCalculator.js` (200 lines)
**Purpose**: Statistical analysis and calculations

- **Comprehensive Stats**: Average, min, max, 98th percentile
- **Warm-up Filtering**: Excludes first 3 measurements for accuracy
- **Stability Scoring**: Connection reliability metrics
- **Per-Metric Analysis**: Separate calculations for download/upload/ping

##### `js/wakeLockManager.js` (150 lines)
**Purpose**: Wake Lock API lifecycle management

- **Browser Detection**: Automatic compatibility checking
- **Lifecycle Control**: Request/release tied to test start/stop
- **Visibility Handling**: Auto re-request when tab becomes visible
- **Error Recovery**: Graceful fallback for unsupported browsers
- **Status Callbacks**: Real-time status updates to UI

##### `js/csvExporter.js` (200 lines)
**Purpose**: Data export functionality

- **CSV Generation**: Formatted data with headers and metadata
- **Timestamped Filenames**: Automatic naming with date/time
- **Browser Download**: Triggers file download via blob URLs
- **Comprehensive Data**: All measurements with calculated statistics

#### **Support Modules**

##### `js/constants.js` (150 lines)
**Purpose**: Centralized configuration and constants

- **Zero Magic Numbers**: All values extracted to semantic constants
- **Configuration Objects**: `CONSTANTS`, `GRAPH_COLORS`, `SERVER_ENDPOINTS`, `TEST_SIZES`
- **Single Source of Truth**: Easy to modify thresholds and settings
- **Self-Documenting**: Clear constant names (e.g., `SLOW_SPEED_THRESHOLD_MBPS`)

##### `js/types.js` (250 lines)
**Purpose**: Comprehensive JSDoc type definitions

- **20+ Type Definitions**: `MeasurementData`, `GraphData`, `Statistics`, `TestConfig`, etc.
- **IDE Support**: Full autocomplete and type checking
- **Living Documentation**: Types serve as reference documentation
- **Interface Contracts**: Clear contracts between modules

### Legacy Files

#### `index.html` (186 lines)
**Purpose**: Semantic HTML structure with accessibility features

- **Module Loading**: Now uses `<script type="module" src="js/speedTest.js">`
- **Semantic Structure**: Proper HTML5 elements (`<main>`, `<section>`, `<header>`)
- **ARIA Support**: Comprehensive ARIA labels, roles, and live regions
- **Progressive Enhancement**: Works without JavaScript for basic functionality

#### `styles.css` (1200+ lines)
**Purpose**: Comprehensive styling system (unchanged from refactoring)

- **Modern Design System**: CSS custom properties for consistent theming
- **Dual Theme Support**: Light mode, monochromatic dark mode, auto detection
- **Enhanced Accessibility**: WCAG AA/AAA compliant contrast ratios
- **Mobile-First**: Responsive design optimized for all screen sizes

#### `script.js` (2603 lines)
**Purpose**: Original monolithic version (preserved as backup)

- **Fully Functional**: Original code still works perfectly
- **Backup Reference**: Preserved for comparison and rollback if needed
- **Complete Feature Set**: All features from the original implementation

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- Active internet connection
- No additional dependencies required

### Installation

1. **Clone or Download**: Get the project files

   ```bash
   git clone [repository-url]
   cd continuous-speed-test
   ```

2. **Serve the Files**: Use any local server

   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (if you have http-server installed)
   npx http-server

   # Or simply open index.html in your browser
   ```

3. **Access the Application**: Open `http://localhost:8000` in your browser

### Usage

1. **Theme Selection**: Choose your preferred appearance with the theme toggle (☀️ Light / 🌙 Dark / 🌓 Auto)
2. **Select Test Duration**: Choose from 30 seconds to 5 minutes
3. **Configure Data Collection**: Adjust measurement interval (1-5 seconds) based on your needs
4. **Enable Wake Lock** (Optional): Check "Keep device awake" to prevent sleep during long tests
5. **Enable CSV Export** (Optional): Check "Export data to CSV" to automatically download test results
6. **Start Test**: Click "Start Speed Test" to begin monitoring
7. **Monitor Performance**: Watch for red line segments indicating speeds below 10 Mbps
8. **View Real-time Data**: Observe live speed metrics with warm-up period for accurate readings
9. **Analyze Results**: Review refined statistics that exclude startup artifacts
10. **Export Data**: If enabled, CSV files are automatically generated and downloaded during tests
11. **Toggle Graph Data**: Use buttons to show/hide different metrics with color-coded performance zones

## 🔧 Technical Implementation

### Network Testing Strategy

#### Download Speed Testing

- **Primary**: Cloudflare Speed Test (`speed.cloudflare.com`)
- **Progressive Sizing**: 1MB → 5MB → 10MB → 25MB → 50MB
- **Continuous Testing**: Maintains 2 overlapping connections for smooth, uninterrupted testing
- **Optimized Timing**: Measures pure data transfer time, excluding connection overhead
- **Real-time Updates**: New connection every 500ms for continuous bandwidth utilization
- **Fallback**: Alternative endpoints when primary fails#### Upload Speed Testing

- **Primary**: HTTPBin (`httpbin.org/post`)
- **Progressive Sizing**: 1MB → 5MB → 10MB for bandwidth saturation
- **Continuous Testing**: Maintains 2 overlapping upload connections
- **Optimized Timing**: Measures upload time only, excluding response processing
- **Real Uploads**: Actual HTTP POST requests with measured data
- **Error Recovery**: Graceful handling of failed uploads

#### Ping/Latency Testing

- **Multi-endpoint**: Tests Google, GitHub, Cloudflare CDN, and JSONPlaceholder APIs
- **CORS-Compatible**: Uses `no-cors` mode to avoid cross-origin issues
- **HTTP-based**: Uses fetch() with small requests for latency measurement
- **Statistical Analysis**: Calculates median ping time for better accuracy

#### Wake Lock Management

- **Navigator.wakeLock API**: Prevents device screen from turning off during tests
- **Browser Compatibility**: Automatic detection with graceful fallback for unsupported browsers
- **Lifecycle Management**: Automatically enables/disables with test start/stop events
- **Manual Control**: User-controlled toggle with real-time status feedback
- **Error Handling**: Comprehensive error recovery and user notification
- **Accessibility**: Full ARIA support with screen reader announcements

### Performance Considerations

- **Efficient DOM Updates**: Batched updates to minimize reflows
- **Memory Management**: Proper cleanup of intervals and event listeners
- **Canvas Optimization**: Efficient redrawing strategies
- **Network Efficiency**: Progressive testing to avoid unnecessary large downloads

## 🎨 Design Principles

### Accessibility

- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Reader Support**: Comprehensive ARIA implementation
- **High Contrast**: Proper color contrast ratios
- **Focus Management**: Clear focus indicators and logical tab order

### User Experience

- **Progressive Disclosure**: Information revealed as needed
- **Real-time Feedback**: Immediate response to user actions
- **Error Communication**: Clear error messages and recovery paths
- **Mobile-First**: Optimized for touch interfaces

### Code Quality

- **Maintainable**: Well-organized, commented code
- **Modular**: Separated concerns and reusable components
- **Testable**: Clear interfaces and error handling
- **Standards Compliant**: Modern web standards and best practices

## 🛠️ Development

### Code Organization

- **HTML**: Semantic structure with accessibility features
- **CSS**: Organized sections with comprehensive commenting
- **JavaScript**: ES6 class-based architecture with error handling

### Key Classes and Methods

```javascript
class SpeedTest {
  // Configuration and state management
  constructor()

  // Test lifecycle
  async startTest()
  async stopTest()

  // Network measurements
  async measureDownloadSpeed()
  async measureUploadSpeed()
  async measurePing()

  // Data export and configuration
  generateCSV()
  downloadCSV()
  updateMeasurementInterval()

  // Wake lock management
  initializeWakeLock()
  requestWakeLock()
  releaseWakeLock()
  updateStayAwakeStatus()

  // Visualization
  updateGraph()
  updateUI()

  // Statistics
  calculateStatistics()
}
```

### Browser Compatibility

- **Chrome**: 60+ (Full support including Wake Lock API)
- **Firefox**: 55+ (Full support, Wake Lock API in development)
- **Safari**: 12+ (Full support, Wake Lock API not yet supported)
- **Edge**: 79+ (Full support including Wake Lock API)
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+ (Wake Lock support varies)

## 📊 Architecture Decisions

### Why Vanilla JavaScript?

- **No Dependencies**: Zero external libraries for maximum compatibility
- **Educational Value**: Clear demonstration of modern web APIs
- **Performance**: Minimal overhead and fast loading
- **Maintainability**: Simple, understandable code structure

### Why Real Network Testing?

- **Accuracy**: Real-world conditions provide accurate measurements
- **Reliability**: Uses production CDN infrastructure
- **Relevance**: Tests actual internet performance, not synthetic metrics

### Why Canvas for Graphing?

- **Performance**: Efficient rendering for real-time updates
- **Control**: Precise control over visualization appearance
- **Compatibility**: Excellent cross-browser support
- **Accessibility**: Can be enhanced with ARIA descriptions

## 🔍 Future Enhancements

### Planned Features

- **Historical Data**: Save and compare test results over time
- **Geolocation**: Test from multiple geographic regions
- **Advanced Export Options**: Enhanced CSV formatting and PDF reports
- **Advanced Analytics**: More detailed network analysis
- **PWA Support**: Offline capability and app-like experience

### Technical Improvements

- **WebWorkers**: Move heavy computations to background threads
- **WebRTC**: Add P2P testing capabilities
- **Service Worker**: Implement caching and offline support
- **Advanced Metrics**: Jitter, packet loss, and quality scores

## 🤝 Contributing

This project serves as an educational example of modern web development practices. Key areas for contribution:

1. **Accessibility**: Further WCAG improvements
2. **Performance**: Optimization opportunities
3. **Testing**: Additional endpoint integration
4. **Documentation**: Code comments and examples
5. **Internationalization**: Multi-language support

## 📄 License

This project is designed for educational purposes and demonstrates modern web development techniques using vanilla HTML, CSS, and JavaScript.

---

**Built with**: Vanilla HTML5, CSS3, and ES6+ JavaScript  
**Testing Infrastructure**: Cloudflare Speed Test, HTTPBin, Google/GitHub CDNs, jsDelivr CDN  
**Design Focus**: Accessibility, Performance, Maintainability
