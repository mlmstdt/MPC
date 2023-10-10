import * as THREE from 'https://unpkg.com/three@0.134.0/build/three.module.js';
import { OrbitControls } from 'path-to-three/examples/jsm/controls/OrbitControls.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', onMouseMove, false);
function findMelodyInfo(clusterNumber) {
  console.log(`Finding melody for cluster: ${clusterNumber}`);
  const foundMelody = melodyInfo.find(melody => String(melody.cluster) === String(clusterNumber));
  console.log(`Found melody: `, foundMelody);
  return foundMelody;
}
function midiNoteToName(midiNoteNumber) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNoteNumber / 12) - 1;
  const note = notes[midiNoteNumber % 12];
  return note + octave;
}
function showInfo(object) {
  console.log('Object in showInfo: ', object);
  const infoWindow = document.getElementById('info-window');

  const clusterNumber = object.userData.clusterNumber;
  console.log(`Cluster number: ${clusterNumber}`);
  
  const melodyData = findMelodyInfo(clusterNumber);
  console.log(`Melody Data: `, melodyData);

  if (melodyData) {
    let melodyDisplayString = "Melody: ";
    
    // Looping through the melody data to construct a readable string
    for(let i = 1; melodyData[`note_${i}`] !== undefined; i++) {
        melodyDisplayString += `${midiNoteToName(parseInt(melodyData[`note_${i}`]))} (t: ${melodyData[`time_${i}`]})`;
        if(melodyData[`note_${i+1}`] !== undefined) melodyDisplayString += " -> ";
    }
    
    infoWindow.innerHTML = `Information about cluster: ${clusterNumber} <br>
                            ${melodyDisplayString}`;
} else {
    infoWindow.innerHTML = `Information about cluster: ${clusterNumber} <br>
                            No melody information available.`;
}

infoWindow.style.display = 'block';
}
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('click', onDocumentMouseClick, false);

function onDocumentMouseClick(event) {
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
      }
  }
}


// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const colors = {
  'TCDB': '#FF5733',
  'TCKM': '#33FF57',
  'TCNT': '#5733FF',
  'TCO':  '#FFFF33',
  'TWLB': '#FF33F6',
  'DNTS': '#FF8833',
  'MKM':  '#88FF33',
  'MSVT': '#33FF88',
  'SICB': '#3388FF',
  'TCD':  '#FF3338',
  'TWDA': '#33FF38',
  'HSMT': '#3833FF',
  'RCCS': '#FF3388',
  'BARA': '#33FFFF',
  'BADN': '#FF33FF'
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
  'TCNT': 'The Courage of Niko Tomanov, Danilović, Mirko',
  'TWDA': 'The Wedding of Đerđelez Alija Ugljanin',
  'SICB': 'Sultan Ibrahim Captures Bagdad Makić',
  'TCDB': 'The Captivity of Dizdarević Meho and Bunićević Mujo',
  'TWLB': 'The Wedding of Ljutica Bogdan and a Nymph Danilović',
  'TCD' : "The Captivity of Dizdarevic",
  'DNTS':  "The Death of Nika Tomanov's son" 
};
const legendContainer = document.getElementById('legend');

Object.keys(colors).forEach((filename) => {
  const colorBox = document.createElement('div');
  colorBox.style.display = 'inline-block';
  colorBox.style.backgroundColor = colors[filename];
  colorBox.style.width = '15px';
  colorBox.style.height = '15px';
  colorBox.style.marginRight = '5px';

  const text = document.createElement('span');
  text.innerText = fullNames[filename] || filename;
  
  // Apply a smaller font size
  text.style.fontSize = '8px';  // Adjust as needed
  
  const lineBreak = document.createElement('br');

  legendContainer.appendChild(colorBox);
  legendContainer.appendChild(text);
  legendContainer.appendChild(lineBreak);
});
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
      fetch('ParryumapALL.csv').then(response => response.text())
    ]);

    melodyInfo = d3.csvParse(melodyData);
    console.log("Melody Data: ", melodyInfo);

    const parsedData = d3.csvParse(data3D);
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
  
      const geometry = new THREE.SphereGeometry(5);  // Size of the sphere. Change 5 to another value if you want a different size.
      const material = new THREE.MeshBasicMaterial({ 
          color: color, 
          // Add or adjust more properties here. For example:
          // opacity: 0.5,  // Make the sphere semi-transparent.
          // transparent: true  // Required to apply opacity.
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      sphere.position.set(x, y, z);
  
      scene.add(sphere);
  
      spheres.push({sphere, start, stop});
  });
  spheres.forEach(({stop}) => {
    if(stop > maxTime) {
        maxTime = stop;
    }
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
          return;  // Skip this iteration since we can't form a line with <2 points
      }
  
      // 1. DRAWING LINES
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 'gray' });
      const line = new THREE.Line(lineGeometry, lineMaterial);
  
      line.userData.clusterNumber = cluster; 
      scene.add(line);
  
      // 2. CREATING INVISIBLE SPHERES AS HITBOXES
      positions.forEach((position, index) => {
          const sphereGeometry = new THREE.SphereGeometry(15);  // Adjust the size to your needs
          const sphereMaterial = new THREE.MeshBasicMaterial({
              color: 'gray', 
              visible: false  // Ensuring the sphere is invisible but still interactive
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          
          sphere.position.copy(position);  // Copying position from point to sphere
          sphere.userData.clusterNumber = cluster;  
          sphere.userData.pointIndex = index;  
  
          scene.add(sphere);  // Add sphere to scene so it becomes interactive
      });
  
      console.log(`Line for cluster ${cluster} added to scene:`, scene.children.includes(line));
      console.log(`Line position:`, line.position);
  });
  
  const animate = () => {
    requestAnimationFrame(animate);
    
    spheres.forEach(({sphere, start, stop}) => {
        sphere.visible = currentTime >= start && currentTime <= stop;
    });
    
    renderer.render(scene, camera);
  
    currentTime += 0.1; // or whatever increment you've decided on
    
    if (currentTime >= maxTime) {
      currentTime = 0; // reset to start
    }
  };

    
    animate();

  } catch (error) {
    console.error('An error occurred while fetching the data:', error);
  }
}

fetchDataAndRender();

window.addEventListener('mousemove', onMouseMove, false);

