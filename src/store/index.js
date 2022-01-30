import Vue from 'vue'
import Vuex from 'vuex'
import {
  Scene,
  TrackballControls,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  //FogExp2,
  //CylinderBufferGeometry,
  //MeshPhongMaterial,
  //Mesh,
  DirectionalLight,
  AmbientLight,
  LineBasicMaterial,
  Geometry,
  Vector3,
  Line,
  GLTFLoader,
  Clock
} from "three-full";


Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    width: 0,
    height: 0,
    totalTime: 0,
    camera: null,
    controls: null,
    scene: null,
    renderer: null,
    axisLines: [],
    pyramids: [],
    earth: {
      model: null,
      radius: 6371,//Volumetric mean radius (km)     6371.000
      orbit:{
        semimajorAxis: 149.598,//(10^6 km)
        perigee: 147.095,//(10^6 km)//Perihelion 
        apogee: 152.100,//(10^6 km)//Aphelion 
        revolutionPeriod: 365.242 ,// (days)//Sidereal orbit period
        synodicPeriod: 365.256,// (days)//Tropical orbit period
        meanOrbitalVelocity: 29.78,// (km/s)
        maxOrbitalVelocity: 30.2,// (km/s)
        minOrbitalVelocity: 29.2,// (km/s)
        inclinationToEcliptic: 0.000,// (deg)//Orbit inclination
        orbitEccentricity: 0.0167,//
        siderealRotationPeriod: 23.9345,// (hrs)
        obliquityToOrbit: 23.44,// (deg)
        inclinationOfEquator: 23.44,// (deg)
      }
    },
    moon: {
      model: null,
      radius: 1737.4,
      orbit:{
        semimajorAxis: 0.3844,//(10^6 km)
        perigee: 0.3633,//(10^6 km)
        apogee: 0.4055,//(10^6 km)
        revolutionPeriod: 27.3217,// (days)
        synodicPeriod: 29.53,// (days)
        meanOrbitalVelocity: 1.022,// (km/s)
        maxOrbitalVelocity: 1.082,// (km/s)
        minOrbitalVelocity: 0.970,// (km/s)
        inclinationToEcliptic: 5.145,// (deg)
        inclinationToEarthEquator: 18.28 - 28.58,// (deg)
        orbitEccentricity: 0.0549,//
        siderealRotationPeriod: 655.720,// (hrs)
        obliquityToOrbit: 6.68,// (deg)
        recessionRateFromEarth: 3.8// (cm/yr)
      }
    },
    sun: {
      model: null,
      radius: 695700
    },
    clock: null
  },
  getters: {
    CAMERA_POSITION: state => {
      return state.camera ? state.camera.position : null;
    }
  },
  mutations: {
    SET_VIEWPORT_SIZE(state, { width, height }) {
      state.width = width;
      state.height = height;
    },
    INITIALIZE_RENDERER(state, el) {
      state.renderer = new WebGLRenderer({ antialias: true });
      state.renderer.setPixelRatio(window.devicePixelRatio);
      state.renderer.setSize(state.width, state.height);
      el.appendChild(state.renderer.domElement);
    },
    INITIALIZE_CAMERA(state) {
      state.camera = new PerspectiveCamera(
        // 1. Field of View (degrees)
        60,
        // 2. Aspect ratio
        state.width / state.height,
        // 3. Near clipping plane
        1,
        // 4. Far clipping plane
        1000
      );
      state.camera.position.x = 0;
      state.camera.position.y = 0;
      state.camera.position.z = 500;
    },
    INITIALIZE_CONTROLS(state) {
      state.controls = new TrackballControls(
        state.camera,
        state.renderer.domElement
      );
      state.controls.rotateSpeed = 1.0;
      state.controls.zoomSpeed = 1.2;
      state.controls.panSpeed = 0.8;
      state.controls.noZoom = false;
      state.controls.noPan = false;
      state.controls.staticMoving = true;
      state.controls.dynamicDampingFactor = 0.3;
      state.controls.keys = [65, 83, 68];
    },
    UPDATE_CONTROLS(state) {
      state.controls.update();
    },
    INITIALIZE_SCENE(state) {
      state.scene = new Scene();
      state.scene.background = new Color(0xcccccc);
      /*state.scene.fog = new FogExp2(0xcccccc, 0.002);
      var geometry = new CylinderBufferGeometry(0, 10, 30, 4, 1);
      var material = new MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true
      });
      for (var i = 0; i < 500; i++) {
        var mesh = new Mesh(geometry, material);
        mesh.position.x = (Math.random() - 0.5) * 1000;
        mesh.position.y = (Math.random() - 0.5) * 1000;
        mesh.position.z = (Math.random() - 0.5) * 1000;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        state.pyramids.push(mesh);
      }
      state.scene.add(...state.pyramids);*/

      // lights
      var lightA = new DirectionalLight(0xffffff);
      lightA.position.set(1, 1, 1);
      state.scene.add(lightA);
      var lightB = new DirectionalLight(0x002288);
      lightB.position.set(-1, -1, -1);
      state.scene.add(lightB);
      var lightC = new AmbientLight(0xffffff, 10);
      state.scene.add(lightC);

      // Axis Line 1
      var materialB = new LineBasicMaterial({ color: 0x0000ff });
      var geometryB = new Geometry();
      geometryB.vertices.push(new Vector3(0, 0, 0));
      geometryB.vertices.push(new Vector3(0, 1000, 0));
      var lineA = new Line(geometryB, materialB);
      state.axisLines.push(lineA);

      // Axis Line 2
      var materialC = new LineBasicMaterial({ color: 0x00ff00 });
      var geometryC = new Geometry();
      geometryC.vertices.push(new Vector3(0, 0, 0));
      geometryC.vertices.push(new Vector3(1000, 0, 0));
      var lineB = new Line(geometryC, materialC);
      state.axisLines.push(lineB);

      // Axis 3
      var materialD = new LineBasicMaterial({ color: 0xff0000 });
      var geometryD = new Geometry();
      geometryD.vertices.push(new Vector3(0, 0, 0));
      geometryD.vertices.push(new Vector3(0, 0, 1000));
      var lineC = new Line(geometryD, materialD);
      state.axisLines.push(lineC);

      state.scene.add(...state.axisLines);

      const earthLoader = new GLTFLoader();
      earthLoader.load(
        'Earth_1_12756.glb', 
        function(gltf){
          state.earth.model = gltf.scene;
          state.scene.add(state.earth.model);

        }, 
        undefined, 
        function(error){
          console.log(error);
        }
      );
      
      const moonLoader = new GLTFLoader();
      moonLoader.load(
        'Moon_1_3474.glb', 
        function(gltf){
          state.moon.model = gltf.scene;
          state.scene.add(state.moon.model);

        }, 
        undefined, 
        function(error){
          console.log(error);
        }
      );
      
      const sunLoader = new GLTFLoader();
      sunLoader.load(
        'Sun_1_1391000.glb', 
        function(gltf){
          state.sun.model = gltf.scene;
          state.scene.add(state.sun.model);

        }, 
        undefined, 
        function(error){
          console.log(error);
        }
      );

      state.clock = new Clock();
        
      //Demo:
      var interval = setInterval(function() {
        // get elem
        if (state.earth.model == null || state.moon.model == null || state.sun.model == null) return;
        clearInterval(interval);
    
        state.earth.model.scale.x = 0.01;
        state.earth.model.scale.y = 0.01;
        state.earth.model.scale.z = 0.01;
        state.moon.model.scale.x = 0.01;
        state.moon.model.scale.y = 0.01;
        state.moon.model.scale.z = 0.01;
        state.sun.model.scale.x = 0.01;
        state.sun.model.scale.y = 0.01;
        state.sun.model.scale.z = 0.01;

        //state.renderer.render(state.scene, state.camera);
      }, 10);


    },
    RESIZE(state, { width, height }) {
      state.width = width;
      state.height = height;
      state.camera.aspect = width / height;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(width, height);
      state.controls.handleResize();
    },
    SET_CAMERA_POSITION(state, { x, y, z }) {
      if (state.camera) {
        state.camera.position.set(x, y, z);
      }
    },
    RESET_CAMERA_ROTATION(state) {
      if (state.camera) {
        state.camera.rotation.set(0, 0, 0);
        state.camera.quaternion.set(0, 0, 0, 1);
        state.camera.up.set(0, 1, 0);
        state.controls.target.set(0, 0, 0);
      }
    },
    HIDE_AXIS_LINES(state) {
      state.scene.remove(...state.axisLines);
    },
    SHOW_AXIS_LINES(state) {
      state.scene.add(...state.axisLines);
    },
    HIDE_PYRAMIDS(state) {
      state.scene.remove(...state.pyramids);
    },
    SHOW_PYRAMIDS(state) {
      state.scene.add(...state.pyramids);
    }
  },
  actions: {
    INIT({ state, commit }, { width, height, el }) {
      return new Promise(resolve => {
        commit("SET_VIEWPORT_SIZE", { width, height });
        commit("INITIALIZE_RENDERER", el);
        commit("INITIALIZE_CAMERA");
        commit("INITIALIZE_CONTROLS");
        commit("INITIALIZE_SCENE");

        // Initial scene rendering
        state.renderer.render(state.scene, state.camera);

        // Add an event listener that will re-render
        // the scene when the controls are changed
        state.controls.addEventListener("change", () => {
          state.renderer.render(state.scene, state.camera);
        });

        resolve();
      });
    },
    ANIMATE({ state, dispatch }) {
      window.requestAnimationFrame(() => {
        
        const deltaTime = Math.min( 0.05, state.clock.getDelta() );
        state.totalTime += deltaTime;
        if(state.earth.model != null){
          state.earth.model.position.x = Math.sin(state.totalTime)*10;
        }
        
        state.controls.update();

        state.renderer.render(state.scene, state.camera);

        dispatch("ANIMATE");
      });
    }
  }
});