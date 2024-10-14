const startButton = document.getElementById('start-button');
const dataDisplay = document.getElementById('data');

let accelerometer;

startButton.addEventListener('click', () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        // Request permission for iOS devices
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    startAccelerometer();
                } else {
                    dataDisplay.innerText = 'Permission denied to access accelerometer.';
                }
            })
            .catch(err => {
                console.error(err);
                dataDisplay.innerText = 'Error requesting permission.';
            });
    } else {
        // For other devices, start the accelerometer directly
        startAccelerometer();
    }
});

function startAccelerometer() {
    dataDisplay.innerText = 'Accelerometer Data:';

    window.addEventListener('devicemotion', (event) => {
        const { acceleration } = event;
        if (acceleration) {
            const { x, y, z } = acceleration;

            // Check for null values and provide defaults if necessary
            const xValue = x !== null ? x.toFixed(2) : 'N/A';
            const yValue = y !== null ? y.toFixed(2) : 'N/A';
            const zValue = z !== null ? z.toFixed(2) : 'N/A';

            dataDisplay.innerText = `Accelerometer Data:\nX: ${xValue} m/s²\nY: ${yValue} m/s²\nZ: ${zValue} m/s²`;
        } else {
            dataDisplay.innerText = 'No acceleration data available.';
        }
    });
}
