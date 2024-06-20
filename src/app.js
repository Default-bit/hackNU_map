// Copyright 2021 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline';

import { Loader } from '@googlemaps/js-api-loader';

require('dotenv').config();

var timestamp = 30781 / 100;

const positions = [
  {
    "Latitude": 51.5084307498856,
    "Longitude": -0.0985850860961545,
    "Altitude": 0.65811756308103,
    "Identifier": "Alice",
    "Timestamp": 210541,
    "Floor label": null,
    "Horizontal accuracy": 2.3764,
    "Vertical accuracy": 5.484818,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.5081722295039,
    "Longitude": -0.0985978698818246,
    "Altitude": 0.18460057895524,
    "Identifier": "Alice",
    "Timestamp": 271786,
    "Floor label": null,
    "Horizontal accuracy": 2.8573,
    "Vertical accuracy": 5.18274,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.5084026106553,
    "Longitude": -0.098512050934636,
    "Altitude": 1.11890095321305,
    "Identifier": "Alice",
    "Timestamp": 346999,
    "Floor label": null,
    "Horizontal accuracy": 2.9853,
    "Vertical accuracy": 5.4228294,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.5086787981714,
    "Longitude": -0.0984920497122077,
    "Altitude": 6.84008048192768,
    "Identifier": "Alice",
    "Timestamp": 412323,
    "Floor label": null,
    "Horizontal accuracy": 2.55035,
    "Vertical accuracy": 2.325053,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.5091735759613,
    "Longitude": -0.0984679986576197,
    "Altitude": 6.8198559137089,
    "Identifier": "Alice",
    "Timestamp": 496645,
    "Floor label": null,
    "Horizontal accuracy": 2.98437,
    "Vertical accuracy": 5.13931,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.5095937834761,
    "Longitude": -0.0984240991632801,
    "Altitude": 6.81997951790538,
    "Identifier": "Alice",
    "Timestamp": 556118,
    "Floor label": null,
    "Horizontal accuracy": 3.292342,
    "Vertical accuracy": 5.420242,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.510087671925,
    "Longitude": -0.0983794103700441,
    "Altitude": 7.17710718071825,
    "Identifier": "Alice",
    "Timestamp": 616721,
    "Floor label": null,
    "Horizontal accuracy": 2.45881,
    "Vertical accuracy": 4.92494,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.51052554748,
    "Longitude": -0.0983531343389532,
    "Altitude": 7.1412686889752,
    "Identifier": "Alice",
    "Timestamp": 691282,
    "Floor label": null,
    "Horizontal accuracy": 2.443,
    "Vertical accuracy": 3.450505,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.5108549650061,
    "Longitude": -0.0984162651626019,
    "Altitude": 0.20171483400944,
    "Identifier": "Alice",
    "Timestamp": 765795,
    "Floor label": null,
    "Horizontal accuracy": 2.91781,
    "Vertical accuracy": 4.30202,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  },
  {
    "Latitude": 51.5111606123825,
    "Longitude": -0.0983944360105759,
    "Altitude": 0.2341160768048,
    "Identifier": "Alice",
    "Timestamp": 834246,
    "Floor label": null,
    "Horizontal accuracy": 3.928974,
    "Vertical accuracy": 3.204045,
    "Confidence in location accuracy": 0.6827,
    "Activity": "walking"
  }
];

const EPS = 1e-8;

var currentPos = 0;
var dx = 0;
var dy = 0;
var dz = 0;
var dX = 0;
var dY = 0;

const lines = [];

const apiOptions = {
  "apiKey": process.env.GOOGLE_MAPS_API_KEY
};

const mapOptions = {
  "tilt": 0,
  "heading": 0,
  "zoom": 21,
  "center": { lat: positions[0].Latitude, lng: positions[0].Longitude, altitude: positions[0].Altitude },
  "mapId": "dcc69521949ce83c"
}

var radius = 6371000;

function convert({lat, lng}) {
  var x = radius * Math.cos(Math.PI * lat / 180 - 1.570795765134) * Math.cos(Math.PI * lng / 180);
  var y = radius * Math.cos(Math.PI * lat / 180 - 1.570795765134);
  return {x: x, y: y};
}

async function initMap() {    
  const mapDiv = document.getElementById("map");
  const apiLoader = new Loader(apiOptions);
  await apiLoader.load()      
  return new google.maps.Map(mapDiv, mapOptions);
}

function initWebGLOverlayView (map) {
  let scene, renderer, camera, loader;
  // WebGLOverlayView code goes here

  const webGLOverlayView = new google.maps.WebGLOverlayView();
  webGLOverlayView.onAdd = () => {
   // console.log("Add");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.75 ); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
    directionalLight.position.set(0.5, -1, 0.5);
    scene.add(directionalLight);

    // const material = new MeshLineMaterial( { color: 0x0000ff,  lineWidth: 1} );
    // const points = [];
    // points.push( new THREE.Vector3( 0, 0, 0 ) );
    // points.push( new THREE.Vector3( 0, 0, -mapOptions.center.altitude ) );
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // //const line = new THREE.Line(geometry, material);
    // const line = new MeshLine();
    // line.setGeometry(geometry);
    // line.setPoints(points);
    // //scene.add(line);
    // const mesh = new THREE.Mesh(line, material);
    // mesh.raycast = MeshLineRaycast;
    // scene.add(mesh);

    // const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    // const points = [];
    // points.push( new THREE.Vector3( 0, 0, 0 ) );
    // points.push( new THREE.Vector3( 0, 0, -mapOptions.center.altitude ) );
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // const line = new THREE.Line(geometry, material);
    // scene.add(line);

    // const materialC = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    // const geometryC = new THREE.CircleGeometry(10, 30);
    // const circle = new THREE.Mesh(geometryC, materialC);

    // const extrudeSettings = {
    //   steps: 2,
    //   depth: 16,
    //   bevelEnabled: true,
    //   bevelThickness: 1,
    //   bevelSize: 1,
    //   bevelOffset: 0,
    //   bevelSegments: 1
    // };

    // const geometryCircle = new THREE.ExtrudeGeometry( circle, {depth: 5} );
    // const materialCircle = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    // const mesh = new THREE.Mesh( geometryCircle, materialCircle ) ;
    // scene.add( mesh );

    const geometry = new THREE.CylinderGeometry( 0.1, 0.1, mapOptions.center.altitude + 0.5 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.rotation.x=Math.PI/2;
    cylinder.position.z=-mapOptions.center.altitude;
    scene.add( cylinder );

    const geometryP = new THREE.CylinderGeometry( positions[currentPos]['Horizontal accuracy'], positions[currentPos]['Horizontal accuracy'], mapOptions.center.altitude + positions[currentPos]['Confidence in location accuracy'], 32  );
    var latA = positions[currentPos].LatitudeAccuracy - mapOptions.center.lat;
    const materialP = new THREE.MeshLambertMaterial( {color: 0xFFFF00 , transparent: true} ); //  808080 - gray
    const cylinderP = new THREE.Mesh( geometryP, materialP );
    cylinderP.rotation.x=Math.PI/2;
    cylinder.position.z=-mapOptions.center.altitude;
    cylinderP.material.opacity = 0.3;
    scene.add( cylinderP );

    lines.push(mapOptions.center);

    loader = new GLTFLoader();

    const source = positions[currentPos].Activity == "running" ? 'runningMan.gltf' : 
                   positions[currentPos].Activity == "walking" ? "walkingMan.gltf" :
                   positions[currentPos].Activity == "cycling" ? "bike.gltf" : 'car3.gltf';
    loader.load(
      source,
      gltf => {
        gltf.scene.scale.set(0.1, 0.1, 0.1);
        gltf.scene.rotation.x = 90 * Math.PI/180;
        gltf.scene.rotation.y = 180 * Math.PI/180;
        scene.add(gltf.scene);
      }
    );
    map.setOptions(mapOptions);
  }
  webGLOverlayView.onContextRestored = ({gl}) => {
   // console.log("Context");
    renderer = new THREE.WebGLRenderer({
      canvas: gl.canvas,
      context: gl,
      ...gl.getContextAttributes(),
    });

    renderer.autoClear = false;

    loader.manager.onLoad = () => {
      renderer.setAnimationLoop(() => {
         map.moveCamera({
          "tilt": mapOptions.tilt,
          "heading": mapOptions.heading,
          "zoom": mapOptions.zoom
        });

        if (mapOptions.tilt < 69.5) {
          mapOptions.tilt += 0.5;
          var dt = positions[currentPos + 1].Timestamp / 1000 - timestamp;
          var dlat = positions[currentPos + 1].Latitude - mapOptions.center.lat;
          var dlng = positions[currentPos + 1].Longitude - mapOptions.center.lng;
          var dalt = positions[currentPos + 1].Altitude - mapOptions.center.altitude;
          dx = dlat / dt;
          dy = dlng / dt;
          dz = dalt / dt;

        } else if (currentPos < positions.length - 1) {
          if (timestamp < positions[currentPos + 1].Timestamp / 1000) {
   //           console.log(currentPos + 1);
              const p1 = convert(mapOptions.center);
              mapOptions.center.lat += dx;
              mapOptions.center.lng += dy;
              mapOptions.center.altitude += dz;
              timestamp++; 
              webGLOverlayView.onAdd();
          } else {
            currentPos++;
            if (currentPos < positions.length - 1) {
              var dt = positions[currentPos + 1].Timestamp / 1000 - timestamp;
              var dlat = positions[currentPos + 1].Latitude - mapOptions.center.lat;
              var dlng = positions[currentPos + 1].Longitude - mapOptions.center.lng;
              var dalt = positions[currentPos + 1].Altitude - mapOptions.center.altitude;
              dx = dlat / dt;
              dy = dlng / dt;
              dz = dalt / dt;
              webGLOverlayView.onAdd();
            }
          }
        } else {
          setAnimationLoop(null);
        }
      });
    }
  }
  webGLOverlayView.onDraw = async ({gl, transformer}) => {
  //  console.log("Draw");
    const latLngAltitudeLiteral = {
      lat: mapOptions.center.lat,
      lng: mapOptions.center.lng,
      altitude: mapOptions.center.altitude
    }

    const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
   // console.log(matrix);
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

    webGLOverlayView.requestRedraw();
    renderer.render(scene, camera);
    renderer.resetState();

  }
  webGLOverlayView.setMap(map);

}

(async () => {        
  const map = await initMap();
  initWebGLOverlayView(map);
})();