// Global variables
let isJumping = false;
let measurementData = [];
let debugInfo = [];
let jumpDetected = false;
let jumpEndTimeout = null;

const g = 9.81; // Gravity in m/s^2

function startJumpMeasurement() {
    if ('DeviceMotionEvent' in window) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                    updateAccelerometerStatus('Active');
                } else {
                    alert('Permission denied to access device motion');
                }
            });
        } else {
            window.addEventListener('devicemotion', handleMotion);
            updateAccelerometerStatus('Active');
        }
    } else {
        updateAccelerometerStatus('Not supported');
    }
}

function updateAccelerometerStatus(status) {
    const statusElement = document.getElementById('accelerometer-status');
    statusElement.innerText = `Status: ${status}`;
    statusElement.classList.remove('inactive', 'active');
    statusElement.classList.add(status === 'Active' ? 'active' : 'inactive');
}

function handleMotion(event) {
    if (!isJumping) return;

    const acc = event.accelerationIncludingGravity;
    const timestamp = Date.now();
    
    if (acc.x === null || acc.y === null || acc.z === null) {
        debugInfo.push(`Invalid acceleration data at ${timestamp}`);
        return;
    }

    const totalAcc = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

    measurementData.push({ x: acc.x, y: acc.y, z: acc.z, timestamp, totalAcc });

    document.getElementById('accelerometer-data').innerText = 
        `Data: X: ${acc.x.toFixed(2)}, Y: ${acc.y.toFixed(2)}, Z: ${acc.z.toFixed(2)}, Total: ${totalAcc.toFixed(2)}`;

    debugInfo.push(`Acceleration at ${timestamp}: X: ${acc.x.toFixed(2)}, Y: ${acc.y.toFixed(2)}, Z: ${acc.z.toFixed(2)}, Total: ${totalAcc.toFixed(2)}`);

    // Detect jump start
    if (!jumpDetected && totalAcc < g * 0.8) {
        jumpDetected = true;
        debugInfo.push(`Jump detected at ${timestamp}`);
    }

    // Detect jump end
    if (jumpDetected && totalAcc > g * 1.2) {
        clearTimeout(jumpEndTimeout);
        jumpEndTimeout = setTimeout(() => {
            isJumping = false;
            calculateAndDisplayJumpHeight();
        }, 500); // Wait 500ms to ensure the jump has ended
    }
}

function calculateAndDisplayJumpHeight() {
    const jumpHeight = calculateJumpHeight();
    if (jumpHeight !== null) {
        document.getElementById('result').innerText = `Jump Height: ${jumpHeight.toFixed(2)} meters`;
    } else {
        document.getElementById('result').innerText = 'Jump Height: N/A';
    }
    document.getElementById('start-button').innerText = 'Start';
    document.getElementById('accelerometer-data').innerText = 'Data: N/A';
    updateAccelerometerStatus('Inactive');
    window.removeEventListener('devicemotion', handleMotion);
    document.getElementById('debug-info').innerText = debugInfo.join('\n');
}

function calculateJumpHeight() {
    if (measurementData.length < 2) {
        debugInfo.push('Not enough data collected');
        return null;
    }

    debugInfo.push(`Total data points collected: ${measurementData.length}`);

    const timeOfFlightHeight = calculateTimeOfFlightHeight();
    const accelerationBasedHeight = calculateAccelerationBasedHeight();

    debugInfo.push(`Time of flight height: ${timeOfFlightHeight.toFixed(3)} m`);
    debugInfo.push(`Acceleration-based height: ${accelerationBasedHeight.toFixed(3)} m`);

    // Combine the two methods with weighted average
    const combinedHeight = (0.6 * timeOfFlightHeight + 0.4 * accelerationBasedHeight);

    return combinedHeight;
}

function calculateTimeOfFlightHeight() {
    const takeoffIndex = measurementData.findIndex(data => data.totalAcc < g * 0.8);
    const landingIndex = measurementData.findIndex((data, index) => 
        index > takeoffIndex && data.totalAcc > g * 1.2);

    if (takeoffIndex === -1 || landingIndex === -1) {
        debugInfo.push('Could not detect takeoff or landing');
        debugInfo.push(`Takeoff index: ${takeoffIndex}, Landing index: ${landingIndex}`);
        return 0;
    }

    const flightTime = (measurementData[landingIndex].timestamp - measurementData[takeoffIndex].timestamp) / 1000;
    debugInfo.push(`Flight time: ${flightTime.toFixed(3)} seconds`);
    return (g * flightTime ** 2) / 8;
}

function calculateAccelerationBasedHeight() {
    let maxUpwardVelocity = 0;
    let currentVelocity = 0;
    let prevTimestamp = measurementData[0].timestamp;

    for (let i = 1; i < measurementData.length; i++) {
        const data = measurementData[i];
        const dt = (data.timestamp - prevTimestamp) / 1000;
        prevTimestamp = data.timestamp;

        // Calculate the vertical component of acceleration
        const verticalAcc = calculateVerticalAcceleration(data);

        currentVelocity += verticalAcc * dt;
        if (currentVelocity > maxUpwardVelocity) {
            maxUpwardVelocity = currentVelocity;
        }
    }

    debugInfo.push(`Max upward velocity: ${maxUpwardVelocity.toFixed(3)} m/s`);
    return maxUpwardVelocity ** 2 / (2 * g);
}

function calculateVerticalAcceleration(data) {
    // Calculate the angle of the phone relative to vertical
    const angleX = Math.atan2(data.x, Math.sqrt(data.y ** 2 + data.z ** 2));
    const angleY = Math.atan2(data.y, Math.sqrt(data.x ** 2 + data.z ** 2));

    // Calculate the vertical component of acceleration
    const verticalAcc = data.z * Math.cos(angleX) * Math.cos(angleY) - g;

    return verticalAcc;
}

document.getElementById('start-button').addEventListener('click', () => {
    if (!isJumping) {
        isJumping = true;
        jumpDetected = false;
        measurementData = [];
        debugInfo = [];
        document.getElementById('result').innerText = 'Jump Height: Measuring...';
        document.getElementById('start-button').innerText = 'Stop';
        startJumpMeasurement();
    } else {
        isJumping = false;
        calculateAndDisplayJumpHeight();
    }
});
