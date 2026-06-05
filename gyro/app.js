(function() {
  'use strict';

  // State
  var state = {
    sensorData: {
      // DeviceMotion (Accelerometer + Gyroscope)
      acceleration: { x: 0, y: 0, z: 0 },
      accelerationIncludingGravity: { x: 0, y: 0, z: 0 },
      rotationRate: { alpha: 0, beta: 0, gamma: 0 },

      // DeviceOrientation (Compass)
      orientation: { alpha: 0, beta: 0, gamma: 0 },

      // Status
      motionSupported: false,
      orientationSupported: false,
      motionActive: false,
      orientationActive: false,

      // Track if acceleration sensor is available
      hasAcceleration: false,
      hasRotationRate: false
    }
  };

  // Canvas
  var canvas, ctx;

  // Sensor Event Handlers
  function onDeviceMotion(event) {
    if (!state.sensorData.motionActive) {
      state.sensorData.motionActive = true;
    }

    // Acceleration (without gravity) - m/s²
    if (event.acceleration && event.acceleration.x !== null) {
      state.sensorData.hasAcceleration = true;
      state.sensorData.acceleration.x = event.acceleration.x || 0;
      state.sensorData.acceleration.y = event.acceleration.y || 0;
      state.sensorData.acceleration.z = event.acceleration.z || 0;
    }

    // Acceleration (with gravity) - m/s²
    if (event.accelerationIncludingGravity) {
      state.sensorData.accelerationIncludingGravity.x = event.accelerationIncludingGravity.x || 0;
      state.sensorData.accelerationIncludingGravity.y = event.accelerationIncludingGravity.y || 0;
      state.sensorData.accelerationIncludingGravity.z = event.accelerationIncludingGravity.z || 0;
    }

    // Rotation Rate (Gyroscope) - deg/s
    if (event.rotationRate && event.rotationRate.alpha !== null) {
      state.sensorData.hasRotationRate = true;
      state.sensorData.rotationRate.alpha = event.rotationRate.alpha || 0;
      state.sensorData.rotationRate.beta = event.rotationRate.beta || 0;
      state.sensorData.rotationRate.gamma = event.rotationRate.gamma || 0;
    }
  }

  function onDeviceOrientation(event) {
    if (!state.sensorData.orientationActive) {
      state.sensorData.orientationActive = true;
    }

    // Orientation angles - degrees
    state.sensorData.orientation.alpha = event.alpha || 0;  // Z-axis (compass heading 0-360°)
    state.sensorData.orientation.beta = event.beta || 0;    // X-axis (front-back tilt -180 to 180°)
    state.sensorData.orientation.gamma = event.gamma || 0;  // Y-axis (left-right tilt -90 to 90°)
  }

  // Start Sensors
  function startSensors() {
    // DeviceMotion
    if (window.DeviceMotionEvent) {
      state.sensorData.motionSupported = true;
      window.addEventListener('devicemotion', onDeviceMotion);
    }

    // DeviceOrientation
    if (window.DeviceOrientationEvent) {
      state.sensorData.orientationSupported = true;

      // iOS 13+ requires permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(function(permissionState) {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', onDeviceOrientation);
            }
          })
          .catch(console.error);
      } else {
        // Non-iOS or older iOS
        window.addEventListener('deviceorientation', onDeviceOrientation);
      }
    }
  }

  // Render Loop
  function render() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 600, 600);

    var yOffset = 120;  // Start below header
    var lineHeight = 50;
    var fontSize = 28;
    var labelFontSize = 20;
    var currentY = yOffset;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Helper function to draw sensor data
    function drawSensorLine(label, value, color) {
      // Label
      ctx.fillStyle = '#a0a0b0';
      ctx.font = labelFontSize + 'px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText(label, 300, currentY);
      currentY += 30;

      // Value
      ctx.fillStyle = color || '#ffffff';
      ctx.font = 'bold ' + fontSize + 'px -apple-system, BlinkMacSystemFont, monospace';
      ctx.fillText(value, 300, currentY);
      currentY += lineHeight;
    }

    // Check if sensors are active
    if (!state.sensorData.motionSupported && !state.sensorData.orientationSupported) {
      ctx.fillStyle = '#ff4466';
      ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Motion sensors not supported', 300, 300);
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Open on mobile device', 300, 340);
      requestAnimationFrame(render);
      return;
    }

    if (!state.sensorData.motionActive && !state.sensorData.orientationActive) {
      ctx.fillStyle = '#00d4ff';
      ctx.font = '24px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Waiting for sensor data...', 300, 300);
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Move your device', 300, 340);
      requestAnimationFrame(render);
      return;
    }

    // Display Motion Data
    if (state.sensorData.motionSupported && state.sensorData.motionActive) {
      // Acceleration with gravity
      var ag = state.sensorData.accelerationIncludingGravity;
      drawSensorLine(
        'Accel + Gravity (m/s²)',
        'X:' + ag.x.toFixed(2) + ' Y:' + ag.y.toFixed(2) + ' Z:' + ag.z.toFixed(2),
        '#00d4ff'
      );

      // Acceleration without gravity (if available)
      if (state.sensorData.hasAcceleration) {
        var a = state.sensorData.acceleration;
        drawSensorLine(
          'Acceleration (m/s²)',
          'X:' + a.x.toFixed(2) + ' Y:' + a.y.toFixed(2) + ' Z:' + a.z.toFixed(2),
          '#00ff88'
        );
      }

      // Rotation rate (gyroscope)
      if (state.sensorData.hasRotationRate) {
        var r = state.sensorData.rotationRate;
        drawSensorLine(
          'Rotation Rate (°/s)',
          'α:' + r.alpha.toFixed(2) + ' β:' + r.beta.toFixed(2) + ' γ:' + r.gamma.toFixed(2),
          '#ff88ff'
        );
      }
    }

    // Display Orientation Data
    if (state.sensorData.orientationSupported && state.sensorData.orientationActive) {
      var o = state.sensorData.orientation;
      drawSensorLine(
        'Orientation (degrees)',
        'α:' + o.alpha.toFixed(1) + '° β:' + o.beta.toFixed(1) + '° γ:' + o.gamma.toFixed(1) + '°',
        '#ffaa00'
      );

      // Compass heading
      drawSensorLine(
        'Compass Heading',
        Math.round(o.alpha) + '°',
        '#00d4ff'
      );
    }

    // Status indicator
    ctx.fillStyle = '#00ff88';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    var statusText = 'LIVE';
    ctx.fillText(statusText, 300, 580);

    // Continue rendering
    requestAnimationFrame(render);
  }

  // Initialize
  function init() {
    canvas = document.getElementById('sensorCanvas');
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    // Start sensors
    startSensors();

    // Start render loop
    requestAnimationFrame(render);
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
