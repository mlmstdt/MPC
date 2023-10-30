import * as THREE from 'three';
import { OrbitControls } from 'three/examples/controls/OrbitControls.js';

// Vertex and Fragment Shaders for the gradient sphere
const vertexShader = `
    varying vec3 vUv; 
    varying vec3 vPosition; 

    void main() {
        vUv = normalize(position); 
        vPosition = position; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    varying vec3 vUv;
    uniform vec3 color;

    void main() {
        float len = length(vUv - vec3(0.5, 0.5, 0.5));
        
        // Create a gradient for color intensity
        float colorGradient = smoothstep(1.0, 0.2, len);
        
        vec3 finalColor = color * colorGradient; // Intensify the color at the center
        
        gl_FragColor = vec4(finalColor, 1.0); // Set alpha to a constant value
    }
`;


const geometry = new THREE.TorusGeometry(50, 3, 16, 100); // Adjust the radius and tube size here

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove, false);
function findMelodyInfo(clusterNumber) {
  console.log(`Finding melody for cluster: ${clusterNumber}`);
  const foundMelody = melodyInfo.find(melody => String(melody.cluster) === String(clusterNumber));
  console.log(`Found melody: `, foundMelody);
  return foundMelody;
}

// Array to hold all active audio players
window.audioPlayers = [];
function clearAllRings() {
    currentRings.forEach(ring => {
        scene.remove(ring);
    });
    currentRings = [];
}
document.addEventListener('keydown', function (e) {
    if (e.code === 'Space') { // Check if the pressed key is the space bar
        toggleAllAudioPlayback();
        clearAllRings(); // Clear all rings when space bar is pressed
    }
});
let currentRings = []; // Global array to keep track of all rings

function showInfo(object) {
    console.log('Object in showInfo: ', object);
    const infoWindow = document.getElementById('info-window');
  
    const clusterNumber = object.userData.clusterNumber;  // Retrieving the cluster number
    const clusterPosition = object.position;  // Retrieving the position of the cluster
    
    console.log(`Cluster number: ${clusterNumber}`);
    console.log(`Cluster position: x=${clusterPosition.x}, y=${clusterPosition.y}, z=${clusterPosition.z}`);
    
    const ring = createRing(object.position);
    scene.add(ring);
    console.log("New ring added to the scene.");
    
    currentRings.push(ring); // Add the new ring to the array
    
    // Updating the cluster number display
    document.getElementById('cluster-number').innerText = clusterNumber;
 

  // Assuming the audio files are named like "cluster0.mp3", "cluster1.mp3", etc.
  const audioFileUrl = `https://cdn.jsdelivr.net/gh/mlmstdt/MPC@main/MPC_audio_mp3/cluster${clusterNumber}.mp3`;

  // Set up the content to be displayed
  infoWindow.innerHTML = `
      <div id="cluster-info">
          Cluster: <span id="cluster-number">${clusterNumber}</span>
      </div>
      <div id="audio-status">
          Loading audio...
      </div>
      <div id="instruction">
          Press space bar to pause. Select another cluster to have both played simultaneously. Compare the similarity by ear, or create noise.
      </div>
  `;

  infoWindow.style.display = 'block';

  // Play the audio file
  playAudioFile(audioFileUrl);
}
document.addEventListener('click', function(event) {
    const tooltip = document.getElementById('tooltip');

    // Check if the tooltip exists and if the clicked element is not the tooltip or a child of the tooltip
    if (tooltip && !tooltip.contains(event.target)) {
        tooltip.remove(); // Remove the tooltip from the DOM
    }
});
function createRing(position) {
    console.log(`Creating ring at position: x=${position.x}, y=${position.y}, z=${position.z}`);
    
    const geometry = new THREE.TorusGeometry(50, 3, 32, 200); // Increased radial and tubular segments

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color for visibility
    const ring = new THREE.Mesh(geometry, material);
    
    ring.position.set(position.x, position.y, position.z);
    
    return ring;
}
function playAudioFile(url) {
  // Create a new audio element for each file, play it, and add it to the list
  let audioPlayer = document.createElement('audio');
  audioPlayer.src = url;
  audioPlayer.loop = true;
  audioPlayer.play().catch(error => console.error("Audio playback error:", error));
  
  // Add the audioPlayer to the list of players
  window.audioPlayers.push(audioPlayer);
}

function toggleAllAudioPlayback() {
  // Check if at least one audio player is currently playing
  const isAnyAudioPlaying = window.audioPlayers.some((audioPlayer) => !audioPlayer.paused);

  window.audioPlayers.forEach((audioPlayer) => {
      if (isAnyAudioPlaying) {
          audioPlayer.pause();
      } else {
          audioPlayer.play().catch(error => console.error("Audio playback error:", error));
      }
  });
}


function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('click', onDocumentMouseClick, false);

function onDocumentMouseClick(event) {
    if (event.target.closest('.legend-item')) return; // ignore if clicking on a legend item
  
    event.preventDefault();
  
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    raycaster.setFromCamera(mouse, camera);
  
    // intersectObjects receives an array of objects to test for intersection
    const intersects = raycaster.intersectObjects(scene.children);
  
    if (intersects.length > 0) {
        const [intersect] = intersects;
  
        if(intersect.object.type === "Mesh") {  // Check if the intersected object is a sphere
            showInfo(intersect.object);
            // Log the cluster that is currently playing
            console.log(`Cluster ${intersect.object.userData.clusterNumber} is currently playing.`);
        }
    }
  }
  


// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const colors = {
  'BADN':  '#8B0000', // Dark Red
  'TWLB': '#FF4500', // Coral
  'HSMT': '#FF8C00', // Dark Orange
  'TCDB': '#F5A623', // Orange
  'TCKM': '#F8E71C', // Yellow
  'RCCS': '#417505', // Dark Green
  'TCO':  '#7ED321', // Green
  'SICB': '#50E3C2', // Light Turquoise
  'TCD': '#008080', // Teal
  'MSVT': '#4A90E2', // Blue
  'BARA': '#183EFA', // Strong Blue
  'TWDA': '#0000CD', // Medium Blue
  'MKM':  '#9013FE', // Purple
  'DNTS': '#BD10E0', // Magenta
  'TCNT': '#A908B5'  // Dark Magenta
};




const fullNames = {
  'TCKM': 'The Captivity of Kovčić Muratbey',
  'TCO': 'The Captivity of Osman the Albanian',
  'MKM': 'Marko Kraljević and Mina of Koštun',
  'BADN': 'Bunić Alibey and Đulić Nuhan in the Captivity of the Ban of Zadar',
  'MSVT': 'Mitrović Stojan and the Vizier of Travnik',
  'RCCS': 'Rade of Čevo and the Captain of Spuž',
  'BARA': 'Bojičić Alija Rescues Alibey\'s Children',
  'HSMT': 'Hajduk Stojan Mitrović and the Turks of Sarajevo',
  'TCNT': 'The Courage of Niko Tomanov',
  'TWDA': 'The Wedding of Đerđelez Alija Ugljanin',
  'SICB': 'Sultan Ibrahim Captures Bagdad Makić',
  'TCDB': 'The Captivity of Dizdarević Meho and Bunićević Mujo',
  'TWLB': 'The Wedding of Ljutica Bogdan and a Nymph',
  'TCD' : "The Captivity of Dizdarevic",
  'DNTS':  "The Death of Nika Tomanov's son" 
};
const legendContainer = document.getElementById('legend');


let maxTime = 0;

const light = new THREE.PointLight(0xFFFFFF, 1, 1000);
light.position.set(0, 0, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040); 
scene.add(ambientLight);
let melodyInfo = [];


// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.25;
controls.rotateSpeed = 0.25; // Adjust the value as needed
controls.zoomSpeed = 0.5; // Adjust the value as needed
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Position camera
//camera.position.z = 10;
camera.position.set(4000, 1300, 7100);
// Load CSV data using Fetch API

async function fetchDataAndRender() {
  try {
    const [melodyData, data3D] = await Promise.all([
      fetch('Samplemidis.csv').then(response => response.text()),
      fetch('final_coordinates.csv').then(response => response.text())
    ]);
    for (const [filename, color] of Object.entries(colors)) {
      const legendItem = document.createElement('div');
      legendItem.className = "legend-item";
      legendItem.setAttribute('data-filename', filename);
  
      const colorBox = document.createElement('span');
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = color;
  
      const filenameSpan = document.createElement('span');
      filenameSpan.innerText = fullNames[filename] || filename; // Use full name if available, otherwise use filename
  
      legendItem.appendChild(colorBox);
      legendItem.appendChild(filenameSpan);
      legendContainer.appendChild(legendItem);
  
      // Add click event listener for the legendItem here:
      legendItem.addEventListener('click', function() {
          const filename = this.getAttribute('data-filename');
  
          // Your logic for what should happen when a legend item is clicked.
          spheres.forEach(({sphere, filename: sphereFilename}) => {
              if (sphereFilename === filename) {
                  sphere.visible = !sphere.visible;
              }
          });
      });
  }
  legendContainer.addEventListener('click', function() {
    console.log("Legend was clicked");
    
});
    melodyInfo = d3.csvParse(melodyData);
    console.log("Melody Data: ", melodyInfo);

    const parsedData = d3.csvParse(data3D);
    maxTime = Math.max(...parsedData.map(datum => parseFloat(datum.stop)));
    console.log("Parsed Data: ", parsedData);

    // Set up the camera
    camera.position.set(4000, 1300, 7100);  

    let spheres = [];
    
    parsedData.forEach(datum => {
      if (datum.x === 'N/A' || datum.y === 'N/A' || datum.z === 'N/A') return;
      const x = parseFloat(datum.x);
      const y = parseFloat(datum.y);
      const z = parseFloat(datum.z);
      const filename = datum.filename;
      const start = parseFloat(datum.start);
      const stop = parseFloat(datum.stop);
      
      const color = colors[filename] || 'gray';
        // Here, we replace the existing material with our new shader material
        const material = new THREE.ShaderMaterial({
          uniforms: {
              color: { value: new THREE.Color(color) }
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          transparent: true, // Make sure this is true to see the gradient effect
          side: THREE.DoubleSide,
      });
  

const sphere = new THREE.Mesh(new THREE.SphereGeometry(25), material);


      
      sphere.visible = false; // Set the sphere as invisible initially

      sphere.position.set(x, y, z);
      
      sphere.userToggled = false;

      scene.add(sphere);
  
      spheres.push({sphere, start, stop, filename, color });
  });
  spheres.forEach(({sphere, start, stop}) => {
    if (typeof sphere.userToggled === "undefined" || sphere.userToggled === true) {
        sphere.visible = currentTime >= start && currentTime <= stop;
    }
});
let toggledColors = new Set();
const legendItems = document.querySelectorAll('.legend-item');

legendItems.forEach(legendItem => {
    legendItem.addEventListener('click', (e) => {
        const tooltip = document.getElementById('tooltip');
        if (tooltip) { // Check if tooltip element is present
            tooltip.remove(); // Remove tooltip from the DOM
        }
      
        const filename = e.currentTarget.getAttribute('data-filename');
        const colorToToggle = colors[filename];

        if (toggledColors.has(colorToToggle)) {
            toggledColors.delete(colorToToggle);
            e.currentTarget.classList.remove('toggled-on'); 
        } else {
            toggledColors.add(colorToToggle);
            e.currentTarget.classList.add('toggled-on'); 
        }
    });
});

    
    let currentTime = 0;
    
    const clusters = new Map();

    parsedData.forEach(datum => {
      if (datum.x === 'N/A' || datum.y === 'N/A' || datum.z === 'N/A') return;
  
      const cluster = String(Math.floor(datum.cluster));
  
      if (!clusters.has(cluster)) {
          clusters.set(cluster, []);
      }
      clusters.get(cluster).push(new THREE.Vector3(
          parseFloat(datum.x),
          parseFloat(datum.y),
          parseFloat(datum.z)
      ));
    });
    
    console.log("Formed Clusters: ", clusters);  
    clusters.forEach((positions, cluster) => {
      console.log(`Drawing cluster ${cluster} with positions:`, positions);
  
      if (positions.length < 2) {
          console.warn(`Cluster ${cluster} has less than 2 points and cannot form a line.`);
          return;  // Skip this iteration since it can't form a line with <2 points
      }
  
      // 1. DRAWING LINES
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 'gray' });
      const line = new THREE.Line(lineGeometry, lineMaterial);
  
      line.userData.clusterNumber = cluster; 
      scene.add(line);
  
      // 2. CREATING INVISIBLE SPHERES AS HITBOXES
      positions.forEach((position, index) => {
          const sphereGeometry = new THREE.SphereGeometry(30);  
          const sphereMaterial = new THREE.MeshBasicMaterial({
              color: 'gray', 
              visible: false  
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.visible = false; 

          
          sphere.position.copy(position);  
          sphere.userData.clusterNumber = cluster;  
          sphere.userData.pointIndex = index;  
  
          scene.add(sphere);  // Add sphere to scene so it becomes interactive
      });
  
      console.log(`Line for cluster ${cluster} added to scene:`, scene.children.includes(line));
      console.log(`Line position:`, line.position);
  });
  
  const animate = () => {
    requestAnimationFrame(animate);
    spheres.forEach(({ sphere, start, stop, color }) => {
      if (toggledColors.has(color)) {
          sphere.visible = currentTime >= start && currentTime <= stop; // Obey time lapse if toggled ON
      } else {
          sphere.visible = false; 
      }
  });
  
    
    renderer.render(scene, camera);
  
    currentTime += 0.05; // or whatever increment you've decided on
    
    if (currentTime >= maxTime) {
      currentTime = 0; // reset to start
    }
    
    const progressBar = document.getElementById('time-progress');
    progressBar.max = maxTime;
    progressBar.value = currentTime;
};



animate();

  } catch (error) {
    console.error('An error occurred while fetching the data:', error);
  }
}

fetchDataAndRender();

window.addEventListener('mousemove', onMouseMove, false);
