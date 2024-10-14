let isJumping = false;
let lastTimestamp = null;
let velocity = 0; // m/s
let totalAcceleration = 0; // m/s^2
const g = 9.81; // Gravity in m/s^2

// Function to start reading accelerometer data
function startJumpMeasurement() {
    if ('DeviceMotionEvent' in window) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                    document.getElementById('accelerometer-status').innerText = 'Status: Active';
                    document.getElementById('accelerometer-status').classList.remove('inactive');
                    document.getElementById('accelerometer-status').classList.add('active');
                } else {
                    alert('Permission denied to access device motion');
                }
            });
        } else {
            window.addEventListener('devicemotion', handleMotion);
            document.getElementById('accelerometer-status').innerText = 'Status: Active';
            document.getElementById('accelerometer-status').classList.remove('inactive');
            document.getElementById('accelerometer-status').classList.add('active');
        }
    } else {
        document.getElementById('accelerometer-status').innerText = 'Status: Not supported';
    }
}

// Handle device motion event
function handleMotion(event) {
    if (!isJumping) return;

    const acceleration = event.accelerationIncludingGravity;
    const verticalAcceleration = acceleration.z; // Adjust based on orientation
    const currentTimestamp = Date.now();

    if (lastTimestamp !== null) {
        const deltaTime = (currentTimestamp - lastTimestamp) / 1000; // Convert ms to seconds
        velocity += verticalAcceleration * deltaTime; // Update velocity
        totalAcceleration += verticalAcceleration * deltaTime; // Integrate acceleration
    }

    lastTimestamp = currentTimestamp;
    document.getElementById('accelerometer-data').innerText = `Data: X: ${acceleration.x.toFixed(2)}, Y: ${acceleration.y.toFixed(2)}, Z: ${acceleration.z.toFixed(2)}`;
}

// Function to calculate jump height when the jump is completed
function calculateJumpHeight() {
    if (totalAcceleration > 0) {
        const jumpHeight = (velocity * velocity) / (2 * g); // h = v^2 / 2g
        document.getElementById('result').innerText = `Jump Height: ${(jumpHeight).toFixed(2)} meters`;
    } else {
        document.getElementById('result').innerText = 'Jump Height: N/A';
    }
}

// Start/stop measurement on button click
document.getElementById('start-button').addEventListener('click', () => {
    isJumping = !isJumping;
    if (isJumping) {
        totalAcceleration = 0;
        velocity = 0;
        lastTimestamp = null;
        document.getElementById('result').innerText = 'Jump Height: Measuring...';
        document.getElementById('start-button').innerText = 'Stop';
        startJumpMeasurement();
    } else {
        calculateJumpHeight();
        document.getElementById('start-button').innerText = 'Start';
        document.getElementById('accelerometer-data').innerText = 'Data: N/A';
        document.getElementById('accelerometer-status').innerText = 'Status: Inactive';
        window.removeEventListener('devicemotion', handleMotion);
    }
});
