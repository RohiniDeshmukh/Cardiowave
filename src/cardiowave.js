import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

var renderer, controls, scene, camera;
var heartModel; // Reference to the heart model
var Object1;
var Object2;
var Object3;
var Object4;
var Object5;
var Object6;
var data;
var spotLight;


window.onload = function () {
  // Three.js code goes here
  scene = new THREE.Scene();

  // setup the camera
  var fov = 75;
  var ratio = window.innerWidth / window.innerHeight;
  var zNear = 1;
  var zFar = 10000;
  camera = new THREE.PerspectiveCamera(fov, ratio, zNear, zFar);
  // camera.position.set(0, 0, 100);
  camera.position.set(-42, 41, 51); // This positions the camera 5 units in front of the model on the Z-axis, and 1 unit up on the Y-axis.
  camera.lookAt(new THREE.Vector3(0, 1, 0)); // This makes the camera look at a point 1 unit up from the origin, which should be the center of your model.

  // create renderer and setup the canvas
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000); // Set the clear color to match your background
  document.body.appendChild(renderer.domElement);

  // setup lights
  var ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  var light = new THREE.DirectionalLight(0xffffff, 5.0);
  light.position.set(1, 1, 5);
  scene.add(light);
  // var helper = new THREE.DirectionalLightHelper(light, 100);
  // scene.add(helper);

  //spotlight
  spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.copy(camera.position);
  spotLight.target.position.set(0, 0, 0);
  scene.add(spotLight);
  scene.add(spotLight.target);

  // Load gltf file
  var loader = new GLTFLoader();
  loader.load("heart.glb", function (gltf) {
    heartModel = gltf.scenes[0].children[0];
    heartModel.scale.x = 0.5;
    heartModel.scale.y = 0.5;
    heartModel.scale.z = 0.5;
    heartModel.translateZ(-10);

    // heartModel.rotation.z = Math.PI/2

    // Inside your GLTFLoader load success callback
    gltf.scene.traverse(function (object) {
      if (object.isMesh) {
        // Rotate the object 90 degrees around the Y-axis
        object.rotation.z = Math.PI / 2;

        // If you also need to adjust the position, you can modify the position property
        // For example, if you want to raise the model so that it sits on the "floor" of your scene:
        object.position.z += 1;
      }
    });

    // Adds the heart model to the scene.
    scene.add(gltf.scene);

    Object1 = gltf.scene.getObjectByName("RIGHT_ATRIUM");
    Object1.scale.x = 0.5;
    Object1.scale.y = 0.5;
    Object1.scale.z = 0.5;

    Object1.material = new THREE.MeshStandardMaterial({
      color: 0x355070,
    });

    Object2 = gltf.scene.getObjectByName("LEFT_ATRIUM");
    Object2.scale.x = 0.5;
    Object2.scale.y = 0.5;
    Object2.scale.z = 0.5;
    Object2.material = new THREE.MeshStandardMaterial({
      color: 0x6d597a,
    });

    Object3 = gltf.scene.getObjectByName("RIGHT_VENTRICLE");
    Object3.scale.x = 0.5;
    Object3.scale.y = 0.5;
    Object3.scale.z = 0.5;
    Object3.material = new THREE.MeshStandardMaterial({
      color: 0xb56576,
    });

    Object4 = gltf.scene.getObjectByName("LEFT_VENTRICLE");
    Object4.scale.x = 0.5;
    Object4.scale.y = 0.5;
    Object4.scale.z = 0.5;
    Object4.material = new THREE.MeshStandardMaterial({
      color: 0xe56b6f,
    });

    Object5 = gltf.scene.getObjectByName("AORTA");
    Object5.scale.x = 0.5;
    Object5.scale.y = 0.5;
    Object5.scale.z = 0.5;
    Object5.material = new THREE.MeshStandardMaterial({
      color: 0xeaac8b,
    });

    Object6 = gltf.scene.getObjectByName("PULMONARY_ARTERY");
    Object6.scale.x = 0.5;
    Object6.scale.y = 0.5;
    Object6.scale.z = 0.5;
    Object6.material = new THREE.MeshStandardMaterial({
      color: 0xb5e48c,
    });
  });

  // getECGfromUrl();
  getECGfromFile();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  animate();
};



function getECGfromFile() {
  document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const data = e.target.result;
          // console.log(data)
          // You can now process the `data` string as needed
          const { metadata, ecgValues } = parseECGData(data);
          console.log(metadata); // Logs the metadata object
          console.log(ecgValues); // Logs the array of ECG values
          filterData(ecgValues);
        };
        reader.readAsText(file);
      }

    });

}

function parseECGData(content) {
  const lines = content.split("\n");
  var metadata = {};
  var ecgValues = [];

  lines.forEach((line) => {
    if (line.startsWith("#")) {
      // Extract metadata
      const parts = line.replace("# ", "").split(":= ");
      if (parts.length === 2) {
        metadata[parts[0]] = parts[1];
      }
    } else if (line.trim() !== "") {
      // Extract ECG values
      ecgValues.push(parseFloat(line));
    }
  });

  return { metadata, ecgValues };
}

function filterData(ecgValues) {
  //lowpass filter

  function lowPassFilter(data, alpha) {
    const filteredData = [data[0]]; // Initialize with the first data point

    for (var i = 1; i < data.length; i++) {
      filteredData.push(
        filteredData[i - 1] + alpha * (data[i] - filteredData[i - 1])
      );
    }

    return filteredData;
  }

  // Assuming you have your ECG data in an array named 'ecgData'
  // const data = ecgValuesArray

  // Set the alpha value, which determines the degree of smoothing
  // A typical starting point for alpha is 0.1
  const alpha = 0.09;

  // Apply the low-pass filter to your ECG data
  const filteredEcgData = lowPassFilter(ecgValues, alpha);

  // You can now use 'filteredEcgData' as your processed ECG data
  console.log(filteredEcgData);

  getPeaks(filteredEcgData);
}

function getPeaks(filteredEcgData) {
  var rPeaks = [];
  var pPeaks = [];
  var tPeaks = [];

  // perfect peaks
  // Assuming the filteredEcgData is an array of the first 1000 filtered ECG values

  function findPeaksWithinRange(data, start, end) {
    var peaks = [];
    for (var i = start + 1; i < end - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push({ index: i, value: data[i] });
      }
    }
    // Sort to get the highest peak
    peaks.sort((a, b) => b.value - a.value);
    return peaks.length > 0 ? peaks[0].index : -1; // return highest peak index or -1 if none

  }

  function detectPeaks(data) {
    for (var i = 0; i < data.length; i += 1000) {
      // R-peak in the circled area (assumed to be the highest in the segment)
      var rPeakIndex = findPeaksWithinRange(data, i, i + 1000);

      // Only proceed if an R-peak was found
      if (rPeakIndex !== -1) {
        rPeaks.push(rPeakIndex);

        // P-peak: Search for the highest peak before the R-peak, but within the same 1000-value segment
        var pPeakRangeStart = Math.max(i, rPeakIndex - 250); // Example range, adjust as needed
        var pPeakIndex = findPeaksWithinRange(
          data,
          pPeakRangeStart,
          rPeakIndex
        );
        if (pPeakIndex !== -1) {
          pPeaks.push(pPeakIndex);
        }

        // T-peak: Search for the highest peak after the R-peak, but within the same 1000-value segment
        var tPeakRangeEnd = Math.min(i + 1000, rPeakIndex + 250); // Example range, adjust as needed
        var tPeakIndex = findPeaksWithinRange(data, rPeakIndex, tPeakRangeEnd);
        if (tPeakIndex !== -1) {
          tPeaks.push(tPeakIndex);
        }
      }
    }

    return { pPeaks, rPeaks, tPeaks };
  }

  // Example usage
  detectPeaks(filteredEcgData);
  console.log("P-Peaks:", pPeaks);
  console.log("R-Peaks:", rPeaks);
  console.log("T-Peaks:", tPeaks);

  startHeartSimulation(pPeaks, rPeaks, tPeaks);
}

function startHeartSimulation(pPeaks, rPeaks, tPeaks) {
  var stopwatch = 0;
  const limit = 15000; // milliseconds
  const interval = 1; // Interval in milliseconds for the simulation

  // Constants for animation
  const minScale = 0.4; // Maximum scale during a pump
  const originalScale = 0.5; // Minimum scale when the heart is not pumping
  const pumpDuration = 200; // Duration of the pump in milliseconds

  // Helper function to animate the scale of the heart parts
  function animateHeartScale(object, startScale, endScale, duration) {
    // Tween.js or another animation library could smoothly interpolate the scale
    // For simplicity, we're just setting the new scale directly
    object.scale.set(startScale, startScale, startScale);
    setTimeout(() => object.scale.set(endScale, endScale, endScale), duration);
  }

  function pumpAtrium() {
    console.log("Atriums pump");
    animateHeartScale(Object1, minScale, originalScale, pumpDuration); // Right Atrium
    animateHeartScale(Object2, minScale, originalScale, pumpDuration); // Left Atrium
  }

  function pumpVentricle() {
    console.log("Ventricles pump");
    animateHeartScale(Object3, minScale, originalScale, pumpDuration); // Right Ventricle
    animateHeartScale(Object4, minScale, originalScale, pumpDuration); // Left Ventricle
  }

  // Interval function to increment stopwatch and check for peak events
  const simulationInterval = setInterval(() => {
    for (var i = 0; i < pPeaks.length; i++) {
      if (pPeaks[i] === stopwatch) {
        pumpAtrium();
      } else if (rPeaks[i] === stopwatch) {
        pumpVentricle();
      }
    }

    // Increment the stopwatch
    stopwatch += interval;

    // Check if we've reached the end of the simulation
    if (stopwatch >= limit) {
      clearInterval(simulationInterval);
      console.log("Simulation complete.");
    }
  }, interval);
}

function animate() {
  requestAnimationFrame(animate);
  // console.log(camera.position)

  spotLight.position.copy(camera.position);
  spotLight.target.position.copy(
    camera.getWorldDirection(new THREE.Vector3()).add(camera.position)
  );

  controls.update();
  renderer.render(scene, camera);
}
