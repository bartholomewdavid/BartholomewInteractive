import { Directive, ElementRef, Renderer, HostListener, AfterViewInit } from '@angular/core';
import {
  Scene,
  PerspectiveCamera,
  DirectionalLight,
  SpotLight,
  AmbientLight,
  Box3,
  Vector3,
  CameraHelper,
  WebGLRenderer,
  PCFShadowMap,
  PlaneBufferGeometry,
  MeshStandardMaterial,
  FrontSide,
  Mesh,
  NoBlending,
  CylinderGeometry,
  MeshPhongMaterial
} from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';

@Directive({
  selector: '[appBackDrop]'
})
export class BackDropDirective {
  DEV: Boolean = false;
  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  box: Box3;
  controls: any;
  entities: Mesh[] = []
  FLOOR: number = -10
  SCREEN_WIDTH: number = window.innerWidth
  SCREEN_HEIGHT: number = window.innerHeight
  HEIGHT_MULTIPLIER: number = 1.5
  SCENE_WIDTH: number;
  SCENE_HEIGHT: number;
  aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
  dirLight: DirectionalLight;
  spotLightLow: SpotLight;
  spotLightHigh: SpotLight;
  ambLight: AmbientLight;

  constructor(private el: ElementRef,
    private domRenderer: Renderer) { }

  initScene() {
    // Scene and clear color
    this.scene = new Scene();
    this.scene.background = 0xFFFFFF;
  }

  initCamera() {
    // Camera for the user
    this.camera = new PerspectiveCamera(
      75,
      this.SCREEN_WIDTH / this.SCREEN_HEIGHT,
      0.1,
      500
    );

    this.camera.position.x = 0;
    this.camera.position.y = 30;
    this.camera.position.z = 0;
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.box = new Box3();
  }

  initLights() {
    // Set up all lights to create interesting shadows.
    // Ambient Light
    this.ambLight = new AmbientLight(0xFFFFFF, 0.5) // soft white light
    this.ambLight.position.set(0, 0, 0);
    this.scene.add(this.ambLight);

    // Spotlight
    this.spotLightHigh = new SpotLight(0xffffff);
    this.spotLightHigh.name = 'Spot Light';
    this.spotLightHigh.angle = Math.PI / 3;
    this.spotLightHigh.penumbra = 0.3;
    this.spotLightHigh.intensity = .25;
    this.spotLightHigh.position.set(10, 45, 10);
    this.spotLightHigh.castShadow = true;
    this.spotLightHigh.shadow.camera.near = 1;
    this.spotLightHigh.shadow.camera.far = 70;
    this.spotLightHigh.shadow.mapSize.width = 1024;
    this.spotLightHigh.shadow.mapSize.height = 1024;
    this.scene.add(this.spotLightHigh);

    // Spotlight
    this.spotLightLow = new SpotLight(0xffffff);
    this.spotLightLow.name = 'Spot Light';
    this.spotLightLow.angle = Math.PI / 3;
    this.spotLightLow.penumbra = 0.3;
    this.spotLightLow.intensity = .25;
    this.spotLightLow.position.set(-10, 45, -15);
    this.spotLightLow.castShadow = true;
    this.spotLightLow.shadow.camera.near = 1;
    this.spotLightLow.shadow.camera.far = 200;
    this.spotLightLow.shadow.mapSize.width = 1024;
    this.spotLightLow.shadow.mapSize.height = 1024;
    this.scene.add(this.spotLightLow);

    // Directional Light
    this.dirLight = new DirectionalLight(0xffffff, .5);
    this.dirLight.name = 'Dir. Light';
    this.dirLight.position.set(0, 30, 0);
    this.dirLight.castShadow = true;
    this.dirLight.intensity = .1;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 45;
    this.dirLight.shadow.camera.right = this.SCENE_WIDTH;
    this.dirLight.shadow.camera.left = -this.SCENE_WIDTH;
    this.dirLight.shadow.camera.top = this.SCENE_HEIGHT;
    this.dirLight.shadow.camera.bottom = -this.SCENE_HEIGHT;
    this.dirLight.shadow.mapSize.width = this.SCREEN_WIDTH;
    this.dirLight.shadow.mapSize.height = this.SCREEN_HEIGHT;
    this.scene.add(this.dirLight);
  }

  initParticles() {
    var particleGeo = [
      new CylinderGeometry(1, 1, .5, 8),
      new CylinderGeometry(2, 2, .5, 8),
      new CylinderGeometry(3, 3, .5, 8)
    ]

    // Materials should be invisible, we want the shadows only
    const particleMat = new MeshPhongMaterial({
      color: 0x00FFFF,
      transparent: true,
      opacity: (this.DEV) ? 1 : 0,
    })
    particleMat.needsUpdate = true

    // Randomize the attributes of all meshes
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 5; i++) {
        // Create mesh and set up shadows
        const particle = new Mesh(
          particleGeo[1],
          particleMat
        )
        particle.castShadow = true
        particle.receiveShadow = true
        particle.needsUpdate = true
        particle.position.y = (j * 5) + 10;

        // Set the movement to a random range to make things look less uniform
        particle.movement = {
          x: Math.random() * .01 + 0.03,
          z: Math.random() * .001 + 0.015
        }

        // Create and cache reset positions for performance.
        particle.resetPosition = (initial: Boolean) => {
          if (!initial) {
            particle.position.x = this.box.min.x + (Math.random() * 4)
            particle.position.z = this.box.min.z + (Math.random() * (this.SCENE_HEIGHT * this.HEIGHT_MULTIPLIER))
          } else {
            particle.position.x = this.box.min.x + (Math.random() * this.SCENE_WIDTH)
            particle.position.z = this.box.min.z + (Math.random() * (this.SCENE_HEIGHT * this.HEIGHT_MULTIPLIER))
          }
        }

        // Create the update function for the `particles`
        particle.update = () => {
          const { position } = particle;
          const onScreen = this.box.containsPoint(position)
          if (onScreen) {
            particle.translateX(particle.movement.x)
            particle.translateZ(particle.movement.z)
          } else {
            particle.resetPosition()
          }
        }

        // Set initial position, add particles to scene and store reference
        particle.resetPosition(true)
        this.entities.push(particle)
        this.scene.add(particle)
      }
    }
  }

  updateBox() {
    const extraBounds = 2
    this.dirLight.shadow.camera.top = this.SCENE_HEIGHT * this.HEIGHT_MULTIPLIER
    this.dirLight.shadow.camera.bottom = -this.SCENE_HEIGHT
    this.dirLight.shadow.camera.right = this.SCENE_WIDTH
    this.dirLight.shadow.camera.left = -this.SCENE_WIDTH

    const cam = this.dirLight.shadow.camera
    const max = new Vector3().set(
      cam.right + extraBounds,
      Infinity,
      cam.top + extraBounds
    )
    const min = new Vector3().set(
      cam.left - extraBounds,
      -Infinity,
      cam.bottom - extraBounds
    )

    this.box.max = max
    this.box.min = min
  }

  initSceneObjects() {
    // Background Panel
    const geometry = new PlaneBufferGeometry(300, 300, 0);
    const material = new MeshStandardMaterial({ color: 0xffac6e, side: FrontSide, metalness: 0.00 });
    const plane = new Mesh(geometry, material);
    plane.position.set(0, this.FLOOR, 0);
    plane.combine = NoBlending;
    plane.rotation.x = - Math.PI / 2;
    plane.refractionRatio = 0.98;
    plane.castShadow = false;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  initRenderer() {
    // Renderer
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
    this.renderer.shadowMap.enabled = true;

    // Temp using this because laptops without GPU are getting jenk
    this.renderer.shadowMap.type = PCFShadowMap;
    this.el.nativeElement.appendChild(this.renderer.domElement);
  }

  initControls() {
    // Add development tools
    if (this.DEV) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.set(0, 2, 0);
      this.controls.update();
      this.scene.add(new CameraHelper(this.spotLightHigh.shadow.camera));
      this.scene.add(new CameraHelper(this.spotLightLow.shadow.camera));
    }
  }

  init() {
    this.initScene()
    this.initRenderer()
    this.initCamera()
    this.initLights()
    this.initSceneObjects()
    this.initControls()
  }

  renderCanvas() {
    // Update all particles each loop
    this.renderer.render(this.scene, this.camera);

    this.entities.forEach(function (ent) {
      if (ent.update) { ent.update() }
    })

    window.requestAnimationFrame(this.renderCanvas.bind(this));
  }

  resize() {
    // Resize the canvas, adjust camera perspective
    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight;

    var vFOV = this.camera.fov * Math.PI / 180;      // convert vertical fov to radians
    this.SCENE_HEIGHT = 2 * Math.tan(vFOV / 2) * 40; // visible height

    var aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
    this.SCENE_WIDTH = this.SCENE_HEIGHT * aspect;

    aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
    this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
    this.camera.updateProjectionMatrix();
    this.updateBox()
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.resize()
  }

  ngAfterViewInit() {
    this.init();
    this.resize();
    this.renderCanvas();
    this.initParticles();
  }
}