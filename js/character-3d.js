import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

(function () {
  "use strict";

  var PAGE_CONTENT = document.getElementById("pageContent");
  var activeViewer = null;

  var OUTFITS = {
    office: {
      label: "Công sở",
      jacket: "#20334a",
      shirt: "#e8edf2",
      pants: "#182434",
      tie: "#bd9654"
    },
    founder: {
      label: "Nhà sáng lập",
      jacket: "#735333",
      shirt: "#f2e9d6",
      pants: "#3c3329",
      tie: "#c5a565"
    },
    casual: {
      label: "Thường ngày",
      jacket: "#24615d",
      shirt: "#e8f0e9",
      pants: "#273b43",
      tie: "#d3a44f"
    }
  };

  var STYLE_TEXT = `
    .character-hero-art.apx3d-host {
      display: block !important;
      position: relative;
      width: 100%;
      min-width: 0;
      min-height: 510px;
      padding: 0 !important;
      overflow: hidden;
      border-radius: 22px;
    }

    .apx3d-card {
      position: relative;
      width: 100%;
      min-height: 510px;
      overflow: hidden;
      isolation: isolate;
      border: 1px solid rgba(153, 207, 205, .24);
      border-radius: 22px;
      background:
        radial-gradient(ellipse at 50% 30%, rgba(53, 105, 111, .32), transparent 52%),
        linear-gradient(145deg, #142630, #09141d 72%);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
    }

    .apx3d-canvas {
      position: absolute;
      inset: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      min-height: 510px;
      touch-action: none;
      cursor: grab;
    }

    .apx3d-canvas:active {
      cursor: grabbing;
    }

    .apx3d-canvas canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    .apx3d-topline {
      position: absolute;
      z-index: 3;
      top: 18px;
      left: 18px;
      right: 18px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      pointer-events: none;
    }

    .apx3d-label {
      color: #e9c77f;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .18em;
      text-transform: uppercase;
    }

    .apx3d-status {
      max-width: 62%;
      color: #c0d5d6;
      font-size: 11px;
      line-height: 1.5;
      text-align: right;
    }

    .apx3d-bottom {
      position: absolute;
      z-index: 4;
      right: 14px;
      bottom: 14px;
      left: 14px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px;
      border: 1px solid rgba(169, 204, 202, .18);
      border-radius: 15px;
      background: rgba(7, 17, 24, .83);
      backdrop-filter: blur(12px);
    }

    .apx3d-pose-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .apx3d-button,
    .apx3d-outfit-select {
      min-height: 36px;
      padding: 7px 11px;
      border: 1px solid rgba(157, 196, 194, .22);
      border-radius: 10px;
      color: #dce9e7;
      background: #12232c;
      font: inherit;
      font-size: 12px;
    }

    .apx3d-button {
      cursor: pointer;
      transition: border-color .18s ease, background .18s ease, color .18s ease;
    }

    .apx3d-button:hover,
    .apx3d-outfit-select:hover {
      border-color: rgba(226, 190, 112, .65);
    }

    .apx3d-button[aria-pressed="true"] {
      border-color: #d9b66b;
      color: #f4d58f;
      background: rgba(169, 128, 57, .2);
    }

    .apx3d-button:focus-visible,
    .apx3d-outfit-select:focus-visible {
      outline: 2px solid #f0ca78;
      outline-offset: 2px;
    }

    .apx3d-outfit-group {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #9eb8ba;
      font-size: 11px;
    }

    .apx3d-reset {
      min-width: 38px;
      font-size: 16px;
    }

    .apx3d-caption {
      position: absolute;
      z-index: 2;
      bottom: 77px;
      left: 18px;
      color: rgba(219, 235, 229, .62);
      font-size: 10px;
      letter-spacing: .12em;
      pointer-events: none;
      text-transform: uppercase;
    }

    @media (max-width: 640px) {
      .character-hero-art.apx3d-host,
      .apx3d-card,
      .apx3d-canvas {
        min-height: 470px;
      }

      .apx3d-bottom {
        align-items: stretch;
      }

      .apx3d-pose-buttons {
        width: 100%;
      }

      .apx3d-outfit-group {
        flex: 1;
      }

      .apx3d-outfit-select {
        flex: 1;
      }

      .apx3d-caption {
        bottom: 122px;
      }
    }
  `;

  function addStyles() {
    if (document.getElementById("apx3d-styles")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "apx3d-styles";
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
  }

  function getSavedOutfit() {
    try {
      var saved = localStorage.getItem("apx-player-outfit");
      return OUTFITS[saved] ? saved : "office";
    } catch (error) {
      return "office";
    }
  }

  function saveOutfit(outfitKey) {
    try {
      localStorage.setItem("apx-player-outfit", outfitKey);
    } catch (error) {
      // Game vẫn chạy nếu trình duyệt chặn localStorage.
    }
  }

  function material(color, roughness) {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness === undefined ? 0.72 : roughness,
      metalness: 0.02
    });
  }

  function makeMesh(parent, geometry, mat, position, scale) {
    var mesh = new THREE.Mesh(geometry, mat);

    if (position) {
      mesh.position.set(position[0], position[1], position[2]);
    }

    if (scale) {
      mesh.scale.set(scale[0], scale[1], scale[2]);
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function makeCapsule(parent, radius, length, mat, position) {
    return makeMesh(
      parent,
      new THREE.CapsuleGeometry(radius, length, 5, 12),
      mat,
      position
    );
  }

  function createProceduralAvatar(initialOutfit) {
    var root = new THREE.Group();
    var body = new THREE.Group();
    root.add(body);

    var skin = material("#d8aa88");
    var hair = material("#201d22");
    var eyes = material("#171b20", 0.45);
    var jacket = material(OUTFITS[initialOutfit].jacket);
    var shirt = material(OUTFITS[initialOutfit].shirt);
    var pants = material(OUTFITS[initialOutfit].pants);
    var tie = material(OUTFITS[initialOutfit].tie);
    var shoes = material("#171c23", 0.55);

    var outfitMaterials = {
      jacket: jacket,
      shirt: shirt,
      pants: pants,
      tie: tie
    };

    // Thân, áo trong và cổ áo
    makeCapsule(body, 0.22, 0.34, jacket, [0, 1.29, 0]);
    makeMesh(
      body,
      new THREE.SphereGeometry(0.205, 20, 14),
      pants,
      [0, 0.86, 0],
      [1.08, 0.78, 0.84]
    );
    makeMesh(
      body,
      new THREE.BoxGeometry(0.15, 0.43, 0.025),
      shirt,
      [0, 1.30, 0.198]
    );
    makeMesh(
      body,
      new THREE.ConeGeometry(0.035, 0.26, 4),
      tie,
      [0, 1.22, 0.224]
    );

    // Cổ và đầu
    makeCapsule(body, 0.075, 0.09, skin, [0, 1.57, 0]);
    makeMesh(
      body,
      new THREE.SphereGeometry(0.235, 24, 18),
      skin,
      [0, 1.82, 0],
      [1, 1.16, 0.92]
    );

    // Tóc
    makeMesh(
      body,
      new THREE.SphereGeometry(0.235, 22, 14),
      hair,
      [0, 1.98, -0.025],
      [1.03, 0.48, 1.02]
    );
    makeMesh(
      body,
      new THREE.SphereGeometry(0.19, 18, 12),
      hair,
      [0, 1.83, -0.125],
      [1.05, 0.75, 0.55]
    );

    // Mắt, mũi và miệng; nhân vật nhìn về phía camera ban đầu.
    makeMesh(
      body,
      new THREE.SphereGeometry(0.027, 10, 8),
      eyes,
      [-0.078, 1.835, 0.207]
    );
    makeMesh(
      body,
      new THREE.SphereGeometry(0.027, 10, 8),
      eyes,
      [0.078, 1.835, 0.207]
    );
    makeMesh(
      body,
      new THREE.SphereGeometry(0.025, 10, 8),
      skin,
      [0, 1.775, 0.22],
      [0.7, 1, 0.7]
    );
    makeMesh(
      body,
      new THREE.SphereGeometry(0.028, 10, 8),
      material("#855b50"),
      [0, 1.72, 0.207],
      [1.3, 0.35, 0.35]
    );

    // Tay có khớp vai và khớp khuỷu để chạy animation.
    var leftArm = new THREE.Group();
    leftArm.position.set(-0.29, 1.47, 0);
    body.add(leftArm);
    makeMesh(leftArm, new THREE.SphereGeometry(0.105, 14, 12), jacket, [0, -0.04, 0]);
    makeCapsule(leftArm, 0.075, 0.23, jacket, [0, -0.19, 0]);

    var leftForearm = new THREE.Group();
    leftForearm.position.y = -0.36;
    leftArm.add(leftForearm);
    makeCapsule(leftForearm, 0.065, 0.23, jacket, [0, -0.17, 0]);
    makeMesh(leftForearm, new THREE.SphereGeometry(0.067, 12, 10), skin, [0, -0.34, 0.015]);

    var rightArm = new THREE.Group();
    rightArm.position.set(0.29, 1.47, 0);
    body.add(rightArm);
    makeMesh(rightArm, new THREE.SphereGeometry(0.105, 14, 12), jacket, [0, -0.04, 0]);
    makeCapsule(rightArm, 0.075, 0.23, jacket, [0, -0.19, 0]);

    var rightForearm = new THREE.Group();
    rightForearm.position.y = -0.36;
    rightArm.add(rightForearm);
    makeCapsule(rightForearm, 0.065, 0.23, jacket, [0, -0.17, 0]);
    makeMesh(rightForearm, new THREE.SphereGeometry(0.067, 12, 10), skin, [0, -0.34, 0.015]);

    // Chân có khớp hông và khớp gối.
    function createLeg(x) {
      var hip = new THREE.Group();
      hip.position.set(x, 0.82, 0);
      body.add(hip);

      makeCapsule(hip, 0.095, 0.28, pants, [0, -0.20, 0]);

      var knee = new THREE.Group();
      knee.position.y = -0.39;
      hip.add(knee);

      makeCapsule(knee, 0.075, 0.31, pants, [0, -0.18, 0]);
      makeMesh(
        knee,
        new THREE.SphereGeometry(0.095, 12, 10),
        shoes,
        [0, -0.385, 0.045],
        [1, 0.68, 1.55]
      );

      return { hip: hip, knee: knee };
    }

    var leftLeg = createLeg(-0.12);
    var rightLeg = createLeg(0.12);

    return {
      root: root,
      body: body,
      leftArm: leftArm,
      rightArm: rightArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      outfitMaterials: outfitMaterials,

      update: function (time, pose) {
        if (pose === "walk") {
          var step = Math.sin(time * 6) * 0.52;
          body.position.y = Math.abs(Math.sin(time * 6)) * 0.035;
          body.rotation.x = 0.025;
          leftLeg.hip.rotation.x = step;
          rightLeg.hip.rotation.x = -step;
          leftLeg.knee.rotation.x = Math.max(0, -step) * 0.75;
          rightLeg.knee.rotation.x = Math.max(0, step) * 0.75;
          leftArm.rotation.x = -step * 0.48;
          rightArm.rotation.x = step * 0.48;
          leftLeg.knee.rotation.z = 0;
          rightLeg.knee.rotation.z = 0;
          return;
        }

        if (pose === "sit") {
          body.position.y = -0.13;
          body.rotation.x = -0.035;
          leftLeg.hip.rotation.x = -1.12;
          rightLeg.hip.rotation.x = -1.12;
          leftLeg.knee.rotation.x = 1.12;
          rightLeg.knee.rotation.x = 1.12;
          leftArm.rotation.x = -0.2;
          rightArm.rotation.x = -0.2;
          leftLeg.knee.rotation.z = 0;
          rightLeg.knee.rotation.z = 0;
          return;
        }

        body.position.y = Math.sin(time * 2.2) * 0.012;
        body.rotation.x = Math.sin(time * 1.7) * 0.012;
        leftLeg.hip.rotation.set(0, 0, 0);
        rightLeg.hip.rotation.set(0, 0, 0);
        leftLeg.knee.rotation.set(0, 0, 0);
        rightLeg.knee.rotation.set(0, 0, 0);
        leftArm.rotation.x = Math.sin(time * 1.5) * 0.025;
        rightArm.rotation.x = -Math.sin(time * 1.5) * 0.025;
      }
    };
  }

  function createChair() {
    var chair = new THREE.Group();
    var wood = material("#425d60");
    var metal = material("#25373c", 0.45);

    makeMesh(chair, new THREE.BoxGeometry(0.72, 0.12, 0.62), wood, [0, 0.72, -0.17]);
    makeMesh(chair, new THREE.BoxGeometry(0.72, 0.72, 0.12), wood, [0, 1.08, -0.43]);

    [-0.28, 0.28].forEach(function (x) {
      [-0.38, 0.08].forEach(function (z) {
        makeMesh(chair, new THREE.BoxGeometry(0.055, 0.70, 0.055), metal, [x, 0.36, z]);
      });
    });

    chair.visible = false;
    return chair;
  }

  function classifyClothing(name) {
    var text = String(name || "").toLowerCase();

    if (/tie|necktie|cavat|cà vạt/.test(text)) {
      return "tie";
    }

    if (/pant|trouser|jean|quần|bottom/.test(text)) {
      return "pants";
    }

    if (/shirt|blouse|inner|undershirt|áo sơ mi/.test(text)) {
      return "shirt";
    }

    if (/jacket|suit|coat|blazer|outfit|cloth|garment|áo vest/.test(text)) {
      return "jacket";
    }

    return null;
  }

  function applyOutfitToProcedural(avatar, outfitKey) {
    var colors = OUTFITS[outfitKey];

    Object.keys(avatar.outfitMaterials).forEach(function (part) {
      avatar.outfitMaterials[part].color.set(colors[part]);
    });
  }

  function applyOutfitToModel(model, outfitKey) {
    if (!model) {
      return;
    }

    var colors = OUTFITS[outfitKey];
    var outfitNames = ["office", "founder", "casual"];

    model.traverse(function (object) {
      if (!object.isMesh) {
        return;
      }

      var meshName = String(object.name || "").toLowerCase();

      outfitNames.forEach(function (name) {
        if (
          meshName.indexOf("outfit-" + name) !== -1 ||
          meshName.indexOf("outfit_" + name) !== -1
        ) {
          object.visible = meshName.indexOf(outfitKey) !== -1;
        }
      });

      var materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach(function (mat) {
        if (!mat || !mat.color) {
          return;
        }

        var part = classifyClothing(
          String(object.name || "") + " " + String(mat.name || "")
        );

        if (part && colors[part]) {
          mat.color.set(colors[part]);
        }
      });
    });
  }

  function mountViewer(host) {
    addStyles();
    host.classList.add("apx3d-host");

    host.innerHTML = `
      <div class="apx3d-card">
        <div class="apx3d-canvas" data-apx3d-canvas></div>

        <div class="apx3d-topline">
          <span class="apx3d-label">NHÂN VẬT 3D · APX</span>
          <span class="apx3d-status" data-apx3d-status role="status">
            Đang tạo mô hình 3D...
          </span>
        </div>

        <span class="apx3d-caption">
          Kéo để xoay · lăn chuột để phóng to/thu nhỏ
        </span>

        <div class="apx3d-bottom">
          <div class="apx3d-pose-buttons" aria-label="Chọn hoạt ảnh">
            <button class="apx3d-button" type="button" data-pose="idle" aria-pressed="true">
              Đứng
            </button>
            <button class="apx3d-button" type="button" data-pose="walk" aria-pressed="false">
              Đi bộ
            </button>
            <button class="apx3d-button" type="button" data-pose="sit" aria-pressed="false">
              Ngồi
            </button>
          </div>

          <label class="apx3d-outfit-group">
            Trang phục
            <select class="apx3d-outfit-select" data-apx3d-outfit>
              <option value="office">Công sở</option>
              <option value="founder">Nhà sáng lập</option>
              <option value="casual">Thường ngày</option>
            </select>
          </label>

          <button
            class="apx3d-button apx3d-reset"
            type="button"
            data-apx3d-reset
            aria-label="Đặt lại góc nhìn"
            title="Đặt lại góc nhìn"
          >↺</button>
        </div>
      </div>
    `;

    var canvasHost = host.querySelector("[data-apx3d-canvas]");
    var statusNode = host.querySelector("[data-apx3d-status]");
    var outfitSelect = host.querySelector("[data-apx3d-outfit]");
    var poseButtons = Array.prototype.slice.call(
      host.querySelectorAll("[data-pose]")
    );

    var savedOutfit = getSavedOutfit();
    outfitSelect.value = savedOutfit;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 1.64, 3.65);

    var renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (error) {
      statusNode.textContent =
        "Trình duyệt hoặc máy tính chưa bật hỗ trợ đồ họa 3D WebGL.";
      canvasHost.textContent = "Không thể khởi tạo khung hình 3D.";
      canvasHost.style.display = "grid";
      canvasHost.style.placeItems = "center";
      canvasHost.style.color = "#d6e3e1";
      return function () {};
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasHost.appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.02, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 2.2;
    controls.maxDistance = 5.4;
    controls.minPolarAngle = 0.42;
    controls.maxPolarAngle = 2.45;
    controls.update();

    // Ánh sáng chính, ánh sáng lấp bóng và viền sáng phía sau.
    scene.add(new THREE.HemisphereLight(0xd9efff, 0x253139, 2.0));

    var keyLight = new THREE.DirectionalLight(0xffe2b0, 3.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -2;
    scene.add(keyLight);

    var fillLight = new THREE.PointLight(0x64c6c5, 35, 8);
    fillLight.position.set(-2.3, 2.1, 1.2);
    scene.add(fillLight);

    var rimLight = new THREE.PointLight(0xf4c979, 24, 7);
    rimLight.position.set(1.4, 2.8, -2);
    scene.add(rimLight);

    var floor = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 64),
      new THREE.MeshStandardMaterial({
        color: 0x183039,
        roughness: 0.82,
        metalness: 0.08
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.025;
    floor.receiveShadow = true;
    scene.add(floor);

    var platform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.83, 0.12, 64),
      new THREE.MeshStandardMaterial({
        color: 0x213b41,
        roughness: 0.5,
        metalness: 0.22
      })
    );
    platform.position.y = 0.035;
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);

    var platformRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.012, 8, 64),
      new THREE.MeshStandardMaterial({
        color: 0xd8b56d,
        emissive: 0x46351c,
        roughness: 0.4
      })
    );
    platformRing.rotation.x = Math.PI / 2;
    platformRing.position.y = 0.101;
    scene.add(platformRing);

    var avatarRoot = new THREE.Group();
    scene.add(avatarRoot);

    var procedural = createProceduralAvatar(savedOutfit);
    avatarRoot.add(procedural.root);

    var chair = createChair();
    scene.add(chair);

    var mixer = null;
    var model = null;
    var animationActions = {};
    var currentAction = null;
    var currentPose = "idle";
    var disposed = false;
    var frameId = 0;
    var elapsed = 0;

    var clock = new THREE.Clock();
    var resizeObserver = null;

    function setStatus(message) {
      if (statusNode) {
        statusNode.textContent = message;
      }
    }

    function setActivePoseButton(pose) {
      poseButtons.forEach(function (button) {
        button.setAttribute(
          "aria-pressed",
          button.dataset.pose === pose ? "true" : "false"
        );
      });
    }

    function selectAnimationClips(clips) {
      clips.forEach(function (clip) {
        var name = String(clip.name || "").toLowerCase();

        if (/idle|stand|rest|breath/.test(name) && !animationActions.idle) {
          animationActions.idle = mixer.clipAction(clip);
        }

        if (/walk|run|move/.test(name) && !animationActions.walk) {
          animationActions.walk = mixer.clipAction(clip);
        }

        if (/sit|sitting|seat/.test(name) && !animationActions.sit) {
          animationActions.sit = mixer.clipAction(clip);
        }
      });
    }

    function playAnimation(pose) {
      if (!mixer) {
        return false;
      }

      var nextAction = animationActions[pose];

      if (!nextAction) {
        return false;
      }

      if (currentAction === nextAction) {
        return true;
      }

      nextAction.reset();
      nextAction.enabled = true;
      nextAction.setLoop(THREE.LoopRepeat, Infinity);

      if (currentAction) {
        nextAction.crossFadeFrom(currentAction, 0.28, false);
      }

      nextAction.play();
      currentAction = nextAction;
      return true;
    }

    function setPose(pose) {
      currentPose = pose;
      setActivePoseButton(pose);
      chair.visible = pose === "sit" && !model;

      if (!model) {
        setStatus(
          pose === "walk"
            ? "Mô hình mẫu đang chạy hoạt ảnh đi bộ."
            : pose === "sit"
              ? "Mô hình mẫu đang chuyển sang tư thế ngồi."
              : "Mô hình mẫu 3D · kéo để xoay góc nhìn."
        );
        return;
      }

      if (playAnimation(pose)) {
        setStatus("Đang phát hoạt ảnh " + pose + " từ model GLB.");
        return;
      }

      setStatus(
        'Model GLB chưa có hoạt ảnh "' +
          pose +
          '". Hãy dùng model có sẵn clip idle, walk và sit.'
      );
    }

    function applyCurrentOutfit() {
      var outfitKey = outfitSelect.value;

      saveOutfit(outfitKey);
      applyOutfitToProcedural(procedural, outfitKey);
      applyOutfitToModel(model, outfitKey);

      if (model) {
        setStatus(
          "Đã chọn trang phục " +
            OUTFITS[outfitKey].label +
            ". Model cần có vật liệu quần áo được đặt tên để đổi màu."
        );
      } else {
        setStatus("Đã đổi trang phục mẫu: " + OUTFITS[outfitKey].label + ".");
      }
    }

    function fitModel(modelScene) {
      var initialBounds = new THREE.Box3().setFromObject(modelScene);
      var initialSize = initialBounds.getSize(new THREE.Vector3());

      if (!Number.isFinite(initialSize.y) || initialSize.y <= 0.001) {
        throw new Error("Model không có chiều cao hợp lệ.");
      }

      var scale = 1.9 / initialSize.y;
      modelScene.scale.multiplyScalar(scale);
      modelScene.updateMatrixWorld(true);

      var fittedBounds = new THREE.Box3().setFromObject(modelScene);
      var center = fittedBounds.getCenter(new THREE.Vector3());

      modelScene.position.x -= center.x;
      modelScene.position.z -= center.z;
      modelScene.position.y -= fittedBounds.min.y;
      modelScene.updateMatrixWorld(true);
    }

    async function loadPlayerModel() {
      try {
        var loader = new GLTFLoader();
        var gltf = await loader.loadAsync("assets/characters/player.glb");

        if (disposed) {
          return;
        }

        model = gltf.scene;
        fitModel(model);
        avatarRoot.remove(procedural.root);
        avatarRoot.add(model);

        model.traverse(function (object) {
          if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });

        mixer = new THREE.AnimationMixer(model);
        selectAnimationClips(gltf.animations || []);
        applyOutfitToModel(model, outfitSelect.value);

        if (!gltf.animations || gltf.animations.length === 0) {
          setStatus(
            "Đã tải model GLB. Model này chưa chứa hoạt ảnh idle, walk hoặc sit."
          );
        } else {
          setStatus("Đã tải model GLB. Kéo chuột để xoay nhân vật.");
        }

        setPose(currentPose);
      } catch (error) {
        if (disposed) {
          return;
        }

        // Chưa có file player.glb thì giữ mô hình mẫu để trang vẫn dùng được.
        setStatus(
          "Đang dùng người mẫu 3D dựng sẵn. Có thể thêm player.glb sau."
        );
      }
    }

    function resize() {
      if (disposed) {
        return;
      }

      var width = Math.max(1, canvasHost.clientWidth);
      var height = Math.max(1, canvasHost.clientHeight);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvasHost);
    } else {
      window.addEventListener("resize", resize);
    }

    resize();

    poseButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setPose(button.dataset.pose);
      });
    });

    outfitSelect.addEventListener("change", applyCurrentOutfit);

    host.querySelector("[data-apx3d-reset]").addEventListener("click", function () {
      controls.reset();
    });

    function render() {
      if (disposed) {
        return;
      }

      frameId = window.requestAnimationFrame(render);

      var delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;

      controls.update(delta);

      if (mixer) {
        mixer.update(delta);
      } else {
        procedural.update(elapsed, currentPose);
      }

      renderer.render(scene, camera);
    }

    render();
    loadPlayerModel();

    return function destroyViewer() {
      disposed = true;
      window.cancelAnimationFrame(frameId);

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resize);
      }

      controls.dispose();

      if (mixer) {
        mixer.stopAllAction();
      }

      scene.traverse(function (object) {
        if (!object.isMesh) {
          return;
        }

        if (object.geometry) {
          object.geometry.dispose();
        }

        var materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach(function (mat) {
          if (mat && mat.dispose) {
            mat.dispose();
          }
        });
      });

      renderer.dispose();
      renderer.domElement.remove();
    };
  }

  function syncViewer() {
    if (!PAGE_CONTENT) {
      return;
    }

    var host = PAGE_CONTENT.querySelector(".character-hero-art");

    if (activeViewer && activeViewer.host === host) {
      return;
    }

    if (activeViewer) {
      activeViewer.destroy();
      activeViewer = null;
    }

    if (host) {
      activeViewer = {
        host: host,
        destroy: mountViewer(host)
      };
    }
  }

  if (PAGE_CONTENT) {
    var pageObserver = new MutationObserver(syncViewer);
    pageObserver.observe(PAGE_CONTENT, {
      childList: true,
      subtree: true
    });

    syncViewer();
  }
})();