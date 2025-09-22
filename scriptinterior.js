    import * as THREE from 'https://esm.sh/three@0.161.0';
    import { GLTFLoader } from 'https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';
    import { PointerLockControls } from 'https://esm.sh/three@0.161.0/examples/jsm/controls/PointerLockControls.js';

    let camera, scene, renderer, controls;
    let clock;
    
    // Variables para el movimiento del jugador
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    
    const overlay = document.getElementById('overlay');

    init();
    animate();

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x333333);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.set(0, 1.6, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        controls = new PointerLockControls(camera, document.body);

        overlay.addEventListener('click', () => {
            controls.lock();
        });

        controls.addEventListener('lock', () => {
            overlay.style.display = 'none';
        });

        controls.addEventListener('unlock', () => {
            overlay.style.display = 'flex';
        });

        // Luces para el entorno
        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(10, 10, 5);
        scene.add(dirLight);

        // --- CÓDIGO CLAVE PARA CARGAR UN SOLO MODELO ---
        // Asegúrate de que esta variable sea el nombre de tu repositorio
        const repoName = 'avance-4-iglesia'; 
        // Cambia este nombre al modelo que quieras cargar en esta página
        const modelName = 'parteinterior.glb'; 
        const loader = new GLTFLoader();
        // La ruta es absoluta, empezando desde la raíz del repositorio
        const modelPath = `/${repoName}/modelos/${modelName}`;
        
        loader.load(modelPath, function (gltf) {
            const model = gltf.scene;
            scene.add(model);
            
            // Si el modelo tiene animaciones, las reproducimos.
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(model);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }

            // Ajustar la cámara al modelo cargado
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            camera.position.set(center.x, center.y + 1.6, center.z);
            controls.getObject().position.copy(camera.position);

            console.log(`¡Modelo ${modelName} cargado con éxito!`);
        }, undefined, function (error) {
            console.error(`Ocurrió un error al cargar el modelo ${modelName}:`, error);
        });

        // Oyentes de eventos para el teclado
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW': moveForward = true; break;
                case 'KeyA': moveLeft = true; break;
                case 'KeyS': moveBackward = true; break;
                case 'KeyD': moveRight = true; break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW': moveForward = false; break;
                case 'KeyA': moveLeft = false; break;
                case 'KeyS': moveBackward = false; break;
                case 'KeyD': moveRight = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        
        // Reloj para movimientos fluidos
        clock = new THREE.Clock();
        window.addEventListener('resize', onWindowResize, false);
    }

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        // Aplicamos el movimiento usando los controles
        const speed = 5; 
        if (moveForward) controls.moveForward(speed * delta);
        if (moveBackward) controls.moveForward(-speed * delta);
        if (moveLeft) controls.moveRight(-speed * delta);
        if (moveRight) controls.moveRight(speed * delta);

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }