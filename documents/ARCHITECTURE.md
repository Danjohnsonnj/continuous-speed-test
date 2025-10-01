# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                   (User Interface)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ <script type="module" src="js/speedTest.js">
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   js/speedTest.js                           │
│              (Main Coordinator - 750 lines)                 │
│                                                             │
│  • Test lifecycle management                                │
│  • Module orchestration                                     │
│  • Event handling                                           │
│  • Continuous testing control                               │
│  • Data flow coordination                                   │
└─────┬───────┬────────┬────────┬────────┬────────┬───────┬──┘
      │       │        │        │        │        │       │
      ▼       ▼        ▼        ▼        ▼        ▼       ▼
┌─────────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌─────┐ ┌─────┐ ┌─────┐
│    UI   │ │ Graph  │ │ Net  │ │Stats │ │Wake │ │ CSV │ │Const│
│Controller│ │Renderer│ │Tester│ │ Calc │ │Lock │ │ Exp │ │ ants│
│         │ │        │ │      │ │      │ │     │ │     │ │     │
│ 550 L   │ │ 350 L  │ │ 550L │ │ 200L │ │150L │ │200L │ │150L │
└─────────┘ └────────┘ └──────┘ └──────┘ └─────┘ └─────┘ └─────┘
```

---

## Module Descriptions

### 1. speedTest.js (Main Coordinator)
**Role**: Application orchestrator  
**Responsibilities**:
- Initialize all other modules
- Manage test lifecycle (start/stop)
- Coordinate data flow between modules
- Handle continuous testing
- Manage event listeners

**Key Methods**:
- `constructor()` - Initialize modules
- `startTest()` - Begin speed testing
- `stopTest()` - End testing and calculate stats
- `performMeasurement()` - Execute measurement cycle
- `maintainContinuousTests()` - Keep tests running

---

### 2. uiController.js (UI Management)
**Role**: DOM manipulation and display  
**Responsibilities**:
- Cache DOM element references
- Update speed displays
- Manage progress bar
- Handle theme switching
- Show/hide tooltips
- Update statistics display

**Key Methods**:
- `updateSpeedDisplays()` - Update speed values
- `updateTestStatus()` - Update status message
- `updateProgress()` - Update progress bar
- `updateStatistics()` - Display calculated stats
- `showTooltip()` - Show graph tooltip
- `toggleTheme()` - Switch themes

---

### 3. graphRenderer.js (Visualization)
**Role**: Canvas-based graph rendering  
**Responsibilities**:
- Initialize canvas with high-DPI support
- Draw speed data over time
- Render grid and axes
- Draw metric lines with dynamic coloring
- Handle mouse interaction

**Key Methods**:
- `initialize()` - Setup canvas for retina displays
- `draw()` - Main rendering orchestrator
- `drawGrid()` - Draw background grid
- `drawAxes()` - Draw x/y axes
- `drawMetricLine()` - Draw speed lines
- `findClosestDataPoint()` - For tooltips

---

### 4. networkTesting.js (Network Operations)
**Role**: Network speed measurement  
**Responsibilities**:
- Measure download speed
- Measure upload speed
- Measure ping/latency
- Progressive file sizing
- Fallback strategies
- Parallel connections

**Key Methods**:
- `measurePing()` - Multi-endpoint ping test
- `measureDownloadSpeed()` - Progressive download test
- `measureUploadSpeed()` - Progressive upload test
- `testDownloadWithCloudflare()` - Primary download
- `testUploadWithHttpbin()` - Primary upload

---

### 5. statisticsCalculator.js (Analytics)
**Role**: Statistical calculations  
**Responsibilities**:
- Calculate averages
- Find min/max values
- Calculate percentiles
- Determine stability
- Filter warm-up period

**Key Methods**:
- `calculateAll()` - Main stats orchestrator
- `calculateMetricStats()` - Stats for one metric
- `calculate98thPercentile()` - Percentile calculation
- `calculateStability()` - Connection stability score
- `getWarmedUpData()` - Exclude warm-up measurements

---

### 6. wakeLockManager.js (Device Management)
**Role**: Wake Lock API management  
**Responsibilities**:
- Check browser support
- Request wake lock
- Release wake lock
- Handle visibility changes
- Automatic re-request

**Key Methods**:
- `isWakeLockSupported()` - Check support
- `request()` - Request wake lock
- `release()` - Release wake lock
- `handleVisibilityChange()` - Visibility handler
- `isActive()` - Check current status

---

### 7. csvExporter.js (Data Export)
**Role**: CSV file generation  
**Responsibilities**:
- Generate CSV content
- Create timestamped filenames
- Trigger browser download
- Include metadata
- Calculate basic stats

**Key Methods**:
- `generate()` - Create CSV content
- `generateFilename()` - Create filename
- `download()` - Trigger download
- `generateAndDownload()` - Combined operation

---

### 8. constants.js (Configuration)
**Role**: Centralized configuration  
**Responsibilities**:
- Define all thresholds
- Store timing values
- Configure file sizes
- Set graph parameters
- Define color schemes

**Exports**:
- `CONSTANTS` - Main configuration object
- `GRAPH_COLORS` - Color definitions
- `SERVER_ENDPOINTS` - API endpoints
- `TEST_SIZES` - Progressive file sizes

---

### 9. types.js (Type System)
**Role**: JSDoc type definitions  
**Responsibilities**:
- Define data structures
- Document interfaces
- Enable IDE support
- Serve as documentation

**Types Defined**:
- `MeasurementData` - Speed measurements
- `GraphData` - Graph display data
- `ServerConfig` - API configuration
- `TestConfig` - Test parameters
- `Statistics` - Calculated statistics
- And 15+ more...

---

## Data Flow

### Test Start Sequence
```
1. User clicks "Start Test"
   ↓
2. speedTest.js → startTest()
   ↓
3. uiController.js → updateStartStopButton(true)
   ↓
4. wakeLockManager.js → request() (if enabled)
   ↓
5. networkTester.js → Start continuous tests
   ↓
6. speedTest.js → performMeasurement() (periodic)
   ↓
7. graphRenderer.js → draw() (update graph)
   ↓
8. uiController.js → updateSpeedDisplays()
```

### Measurement Cycle
```
1. speedTest.js → performMeasurement()
   ↓
2. networkTester.js → measurePing()
   ├─ Test multiple endpoints
   └─ Return median latency
   ↓
3. Collect continuous speeds
   ├─ Average recent downloads
   └─ Average recent uploads
   ↓
4. Update graph data
   ├─ Add new data points
   └─ Maintain max length
   ↓
5. graphRenderer.js → draw()
   ↓
6. uiController.js → updateSpeedDisplays()
```

### Test Stop Sequence
```
1. User clicks "Stop Test" OR timeout
   ↓
2. speedTest.js → stopTest()
   ↓
3. Clear all intervals
   ↓
4. wakeLockManager.js → release()
   ↓
5. statsCalculator.js → calculateAll()
   ↓
6. uiController.js → updateStatistics()
   ↓
7. uiController.js → setCSVExportEnabled(true)
```

### CSV Export Flow
```
1. User clicks "Export CSV"
   ↓
2. speedTest.js → downloadCSV()
   ↓
3. csvExporter.js → generate()
   ├─ Format measurement data
   ├─ Add metadata
   └─ Calculate stats
   ↓
4. csvExporter.js → generateFilename()
   ↓
5. csvExporter.js → download()
   ├─ Create blob
   ├─ Create download link
   └─ Trigger download
```

---

## Module Communication

### Direct Imports
```javascript
// speedTest.js imports all modules
import { UIController } from './uiController.js';
import { GraphRenderer } from './graphRenderer.js';
import { NetworkTester } from './networkTesting.js';
// etc.
```

### Callback Pattern
```javascript
// Modules expose callbacks for status updates
wakeLockManager.onStatusUpdate((message, type) => {
  // Handle status update
});

csvExporter.onStatusUpdate((message, type) => {
  // Handle status update
});
```

### Shared Constants
```javascript
// All modules import constants
import { CONSTANTS } from './constants.js';

// Use semantic names
if (speed < CONSTANTS.SLOW_SPEED_THRESHOLD_MBPS) {
  // Handle slow speed
}
```

---

## Dependency Graph

```
                    constants.js ← All modules import
                    types.js ← All modules use for JSDoc
                         ↑
                         │
┌────────────────────────┼────────────────────────┐
│                        │                        │
│                  speedTest.js                   │
│                  (Main Entry)                   │
│                        │                        │
└────┬──────┬──────┬────┼────┬──────┬───────┬───┘
     │      │      │    │    │      │       │
     ▼      ▼      ▼    ▼    ▼      ▼       ▼
   UI    Graph  Network Stats Wake  CSV
  Ctrl   Render  Tester  Calc  Lock Export

All modules are independent except for:
- All depend on constants.js
- All use types.js for documentation
- Only speedTest.js imports other modules
```

---

## Design Patterns Used

### 1. Module Pattern
Each file is an ES6 module with clear exports

### 2. Single Responsibility
Each module has one clear purpose

### 3. Dependency Injection
Modules receive dependencies via constructor

### 4. Observer Pattern
Callbacks for status updates

### 5. Strategy Pattern
Progressive file sizing, fallback endpoints

### 6. Facade Pattern
speedTest.js provides simplified interface

---

## Browser Compatibility

### Required Features
- ✅ ES6 Modules (Chrome 61+, Firefox 60+, Safari 11+)
- ✅ Promises (All modern browsers)
- ✅ Async/Await (All modern browsers)
- ✅ Fetch API (All modern browsers)
- ✅ Canvas 2D Context (All browsers)

### Optional Features
- ⚠️ Wake Lock API (Chrome 84+, Edge 84+, not Firefox/Safari)
- ⚠️ Performance API (All modern browsers, used for timing)

### Graceful Degradation
- Wake Lock: Falls back to checkbox disable + warning
- High-DPI: Falls back to standard resolution
- Network errors: Uses fallback endpoints

---

## Performance Considerations

### Optimization Techniques
1. **DOM Caching** - All elements cached in `uiController.js`
2. **Debouncing** - Window resize uses 100ms debounce
3. **Data Limiting** - Graph limited to 50 data points
4. **Efficient Rendering** - Canvas only redraws on data change
5. **Progressive Loading** - File sizes increase with speed
6. **Parallel Requests** - Multiple connections for large transfers

### Memory Management
- Arrays are limited in length (max 50 points)
- Intervals are always cleared
- Wake locks are released
- Old measurements are filtered

---

## Security Considerations

### Best Practices
- ✅ No eval() or Function() constructor
- ✅ No inline event handlers
- ✅ HTTPS endpoints used
- ✅ Input validation on all user inputs
- ✅ CSP-compatible code

### CORS Handling
- Primary endpoints support CORS
- Fallback endpoints available
- Error handling for blocked requests

---

## Testing Strategy

### Unit Testing (Recommended)
```javascript
// Example: Test statistics calculator
import { StatisticsCalculator } from './statisticsCalculator.js';

test('calculates average correctly', () => {
  const calc = new StatisticsCalculator();
  const avg = calc.calculateAverage([1, 2, 3, 4, 5]);
  expect(avg).toBe(3);
});
```

### Integration Testing
```javascript
// Example: Test module coordination
import { SpeedTest } from './speedTest.js';

test('initializes all modules', () => {
  const app = new SpeedTest();
  expect(app.ui).toBeDefined();
  expect(app.graphRenderer).toBeDefined();
  expect(app.networkTester).toBeDefined();
});
```

### E2E Testing
```javascript
// Example: Test full workflow
test('completes full speed test', async () => {
  const app = new SpeedTest();
  await app.startTest();
  await wait(5000);
  app.stopTest();
  expect(app.measurementData.download.length).toBeGreaterThan(0);
});
```

---

## Maintenance Guidelines

### Adding a New Module
1. Create file in `js/` folder
2. Import constants and types
3. Export class with clear interface
4. Add JSDoc documentation
5. Import in `speedTest.js`
6. Initialize in constructor

### Modifying Existing Module
1. Update only the relevant module
2. Maintain existing interface
3. Update JSDoc if needed
4. Test changes in isolation

### Configuration Changes
1. Edit `constants.js` only
2. Use semantic naming
3. Add JSDoc description
4. No hardcoded values elsewhere

---

## 🎯 Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Easy to understand structure
- ✅ Simple to modify and extend
- ✅ Testable components
- ✅ Maintainable codebase
- ✅ Scalable design

Each module has a single, well-defined purpose and clear interfaces with other modules.

---

_For more details, see documents/FINAL_REPORT.md and documents/IMPLEMENTATION_GUIDE.md_
