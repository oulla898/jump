// Function to check DeviceMotion support
function checkDeviceMotion() {
    if ('DeviceMotionEvent' in window) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', (event) => {
                        const data = event.accelerationIncludingGravity;
                        document.getElementById('accelerometer-status').innerText = 'Status: Active';
                        document.getElementById('accelerometer-status').classList.remove('inactive');
                        document.getElementById('accelerometer-status').classList.add('active');
                        document.getElementById('accelerometer-data').innerText = `Data: X: ${data.x}, Y: ${data.y}, Z: ${data.z}`;
                    });
                } else {
                    document.getElementById('accelerometer-status').innerText = 'Status: Permission denied';
                }
            }).catch((error) => {
                console.error(error);
                document.getElementById('accelerometer-status').innerText = 'Status: Permission request failed';
            });
        } else {
            // Fallback for browsers that don't require permission
            window.addEventListener('devicemotion', (event) => {
                const data = event.accelerationIncludingGravity;
                document.getElementById('accelerometer-status').innerText = 'Status: Active';
                document.getElementById('accelerometer-status').classList.remove('inactive');
                document.getElementById('accelerometer-status').classList.add('active');
                document.getElementById('accelerometer-data').innerText = `Data: X: ${data.x}, Y: ${data.y}, Z: ${data.z}`;
            });
        }
    } else {
        document.getElementById('accelerometer-status').innerText = 'Status: Not supported';
    }
}

// Function to check DeviceOrientation support
function checkDeviceOrientation() {
    if ('DeviceOrientationEvent' in window) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', (event) => {
                        document.getElementById('gyroscope-status').innerText = 'Status: Active';
                        document.getElementById('gyroscope-status').classList.remove('inactive');
                        document.getElementById('gyroscope-status').classList.add('active');
                        document.getElementById('gyroscope-data').innerText = `Data: Alpha: ${event.alpha}, Beta: ${event.beta}, Gamma: ${event.gamma}`;
                    });
                } else {
                    document.getElementById('gyroscope-status').innerText = 'Status: Permission denied';
                }
            }).catch((error) => {
                console.error(error);
                document.getElementById('gyroscope-status').innerText = 'Status: Permission request failed';
            });
        } else {
            // Fallback for browsers that don't require permission
            window.addEventListener('deviceorientation', (event) => {
                document.getElementById('gyroscope-status').innerText = 'Status: Active';
                document.getElementById('gyroscope-status').classList.remove('inactive');
                document.getElementById('gyroscope-status').classList.add('active');
                document.getElementById('gyroscope-data').innerText = `Data: Alpha: ${event.alpha}, Beta: ${event.beta}, Gamma: ${event.gamma}`;
            });
        }
    } else {
        document.getElementById('gyroscope-status').innerText = 'Status: Not supported';
    }
}

// Call the functions to check sensors
checkDeviceMotion();
checkDeviceOrientation();
