// ItemModels.js - Models to be used for the shop and items

function createPencilModel() {
    const group = new THREE.Group();
    // Yellow hexagonal body
    const bodyGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.0, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2; // Lay flat
    group.add(body);

    // Wood tip - sharper and more segments
    const tipGeo = new THREE.ConeGeometry(0.16, 0.35, 12);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xeed2aa, roughness: 0.8 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.rotation.x = Math.PI / 2;
    tip.position.z = 0.675;
    group.add(tip);

    // Lead point
    const leadGeo = new THREE.ConeGeometry(0.048, 0.1, 12);
    const leadMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.2 });
    const lead = new THREE.Mesh(leadGeo, leadMat);
    lead.rotation.x = Math.PI / 2;
    lead.position.z = 0.8;
    group.add(lead);

    // Metal collar (Ferrule)
    const collarGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.15, 12);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.z = -0.55;
    group.add(collar);

    // Eraser tip
    const eraserGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.18, 12);
    const eraserMat = new THREE.MeshStandardMaterial({ color: 0xff99aa, roughness: 0.9 });
    const eraser = new THREE.Mesh(eraserGeo, eraserMat);
    eraser.rotation.x = Math.PI / 2;
    eraser.position.z = -0.71;
    group.add(eraser);

    group.rotation.set(0, Math.PI / 2, 0); // Flat on shelf
    group.position.y = 0.2; // Above shelf
    return group;
}

function createNotebookModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();

    // Cover (Reduced by 25%)
    const coverGeo = new THREE.BoxGeometry(1.1, 0.15, 1.5);
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x113388, roughness: 0.3 });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.y = 0.08;
    group.add(cover);

    // Pages (Reduced by 25%)
    const pagesGeo = new THREE.BoxGeometry(1.0, 0.12, 1.45);
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xffffeb, roughness: 0.9 });
    const pages = new THREE.Mesh(pagesGeo, pagesMat);
    pages.position.set(0.04, 0.08, 0);
    group.add(pages);

    // Spiral binding (Reduced by 25%)
    const ringGeo = new THREE.TorusGeometry(0.09, 0.015, 8, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
    for (let i = 0; i < 10; i++) {
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.y = Math.PI / 2;
        ring.position.set(-0.55, 0.08, -0.65 + (i * 0.15));
        group.add(ring);
    }

    // STANDING LOGIC
    group.rotation.x = -Math.PI / 2;
    group.position.y = 0.75; // Half of 1.5 height
    parent.add(group);
    return parent;
}

function createEraserModel() {
    const group = new THREE.Group();
    // Pink rubber part (Scaled down 50% from 0.6x0.3x1.2)
    const eraserGeo = new THREE.BoxGeometry(0.3, 0.15, 0.6);
    const eraserMat = new THREE.MeshStandardMaterial({ color: 0xff99aa, roughness: 0.8 });
    const eraser = new THREE.Mesh(eraserGeo, eraserMat);
    group.add(eraser);

    // Cardboard sleeve
    const sleeveGeo = new THREE.BoxGeometry(0.31, 0.16, 0.35);
    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x113388, roughness: 0.4 });
    const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeve.position.z = -0.05;
    group.add(sleeve);

    group.rotation.x = Math.PI / 2; // Stand up on end
    group.rotation.z = Math.PI / 6;
    group.position.y = 0.32; // Lifted to avoid clipping
    return group;
}

function createGlassesModel() {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.2 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xaaddff, transparent: true, opacity: 0.3, metalness: 0.9, roughness: 0.05 });

    // Rim & lens geometry (Scaled down 20% from 0.35)
    const r = 0.28;
    const rimGeo = new THREE.TorusGeometry(r, 0.06, 8, 16);
    const lensGeo = new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.02, 16);

    const leftRim = new THREE.Mesh(rimGeo, frameMat);
    leftRim.position.set(-r - 0.1, r, 0);
    const leftLens = new THREE.Mesh(lensGeo, glassMat);
    leftLens.rotation.x = Math.PI / 2;
    leftLens.position.set(-r - 0.1, r, 0);
    group.add(leftRim, leftLens);

    const rightRim = new THREE.Mesh(rimGeo, frameMat);
    rightRim.position.set(r + 0.1, r, 0);
    const rightLens = new THREE.Mesh(lensGeo, glassMat);
    rightLens.rotation.x = Math.PI / 2;
    rightLens.position.set(r + 0.1, r, 0);
    group.add(rightRim, rightLens);

    // Bridge
    const bridgeGeo = new THREE.TorusGeometry(0.15, 0.03, 6, 12, Math.PI / 1.5);
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    bridge.rotation.x = -Math.PI / 2;
    bridge.position.set(0, r + 0.05, 0);
    group.add(bridge);

    // Temples
    const templeGeo = new THREE.BoxGeometry(0.04, 0.04, 1.2);
    const leftTemple = new THREE.Mesh(templeGeo, frameMat);
    leftTemple.position.set(-r * 2 - 0.1, r, -0.6);
    group.add(leftTemple);

    const rightTemple = new THREE.Mesh(templeGeo, frameMat);
    rightTemple.position.set(r * 2 + 0.1, r, -0.6);
    group.add(rightTemple);

    group.rotation.x = -0.15; // Prop up 
    return group;
}

function createWaterBottleModel() {
    const group = new THREE.Group();
    const transparentMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.4,
        metalness: 0.1,
        roughness: 0.1
    });

    // Bottle body (Shrunk by 50%)
    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 16);
    const body = new THREE.Mesh(bodyGeo, transparentMat);
    body.position.y = 0.3;
    group.add(body);

    // Internal "Water" mesh (Shrunk by 50%)
    const waterGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.4, 16);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0, metalness: 0.5 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.2;
    group.add(water);

    // Bottle neck (Shrunk by 50%)
    const neckGeo = new THREE.CylinderGeometry(0.075, 0.15, 0.15, 16);
    const neck = new THREE.Mesh(neckGeo, transparentMat);
    neck.position.y = 0.675;
    group.add(neck);

    // Bottle cap (Shrunk by 50%)
    const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.075, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.725;
    group.add(cap);

    return group;
}

function createInkwellModel(scaleFactor = 0.6375) {
    const group = new THREE.Group();
    // Octagonal body
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.6, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.25;
    group.add(body);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.2, 8); // Reduced radial segments from 12 to 8
    const neck = new THREE.Mesh(neckGeo, bodyMat);
    neck.position.y = 0.6;
    group.add(neck);

    // Lid
    const lidGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 8); // Reduced radial segments from 12 to 8
    const lidMat = new THREE.MeshStandardMaterial({ color: 0xccaa33, metalness: 0.8, roughness: 0.2 });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.75;
    group.add(lid);

    // Quill feather sticking out
    const quillGeo = new THREE.ConeGeometry(0.05, 0.8, 4);
    const quillMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const quill = new THREE.Mesh(quillGeo, quillMat);
    quill.position.set(0.1, 0.9, 0);
    quill.rotation.z = -0.4;
    group.add(quill);

    group.scale.set(scaleFactor, scaleFactor, scaleFactor);
    return group;
}

function createSmallInkwellModel() { return createInkwellModel(0.135); }
function createBigInkwellModel() { return createInkwellModel(0.765); }


function createBowlerCapModel() {
    const group = new THREE.Group();
    // Brim
    const brimGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16); // Reduced radial segments from 24 to 16
    const hatMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const brim = new THREE.Mesh(brimGeo, hatMat);
    group.add(brim);

    // Dome
    const domeGeo = new THREE.SphereGeometry(0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2); // Reduced width/height segments from 24, 16 to 16, 12
    const dome = new THREE.Mesh(domeGeo, hatMat);
    dome.position.y = 0.025;
    group.add(dome);

    // Hat band
    const bandGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.1, 16); // Reduced radial segments from 24 to 16
    const bandMat = new THREE.MeshLambertMaterial({ color: 0x550000 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 0.075;
    group.add(band);

    group.scale.set(0.9, 0.9, 0.9);
    return group;
}

function createRingModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();

    // Box bottom (Scaled up)
    const boxMat = new THREE.MeshLambertMaterial({ color: 0x330000 });
    const boxGeo = new THREE.BoxGeometry(0.8, 0.45, 0.8);
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 0.225;
    group.add(box);

    // Box lid
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.45, -0.4);
    lidGroup.rotation.x = -Math.PI / 2.5;
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), boxMat);
    lidMesh.position.set(0, 0.05, 0.4);
    lidGroup.add(lidMesh);
    group.add(lidGroup);

    // The Ring (Scaled up 2x)
    const r = 0.25;
    const ringGeo = new THREE.TorusGeometry(r, 0.035, 12, 24);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 1.0, roughness: 0.1 });
    const ring = new THREE.Mesh(ringGeo, goldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.5;
    group.add(ring);

    // Gem on ring
    const gemGeo = new THREE.OctahedronGeometry(0.08);
    const gemMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8, metalness: 0.8, roughness: 0.1 });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 0.55, r);
    group.add(gem);

    parent.add(group);
    parent.rotation.y = Math.PI / 4;
    return parent;
}

function createNecklaceModel() {
    const group = new THREE.Group();

    // Headless Bust Display
    const bustMat = new THREE.MeshLambertMaterial({ color: 0x222222 });

    // Body/Stand
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.4, 0.8, 12); // Reduced radial segments from 16 to 12
    const body = new THREE.Mesh(bodyGeo, bustMat);
    body.position.y = 0.4;
    group.add(body);

    // Neck/Top
    const neckGeo = new THREE.SphereGeometry(0.25, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2); // Reduced width/height segments from 16, 16 to 12, 12
    const neck = new THREE.Mesh(neckGeo, bustMat);
    neck.position.y = 0.8;
    group.add(neck);

    // Base
    const baseGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 12); // Reduced radial segments from 16 to 12
    const base = new THREE.Mesh(baseGeo, bustMat);
    base.position.y = 0.025;
    group.add(base);

    // Necklace logic: we'll create a torus angled down
    const chainMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const chainGeo = new THREE.TorusGeometry(0.26, 0.015, 6, 16); // Reduced tubular segments from 8 to 6, radial from 32 to 16
    const chain = new THREE.Mesh(chainGeo, chainMat);
    chain.position.y = 0.65;
    chain.position.z = 0.05;
    chain.rotation.x = -Math.PI / 4; // Angle it correctly to hang on the bust
    group.add(chain);
    // Pendant
    const pendantGeo = new THREE.ConeGeometry(0.05, 0.1, 4);
    const pendantMat = new THREE.MeshStandardMaterial({ color: 0xff0044, metalness: 0.5, roughness: 0.2 });
    const pendant = new THREE.Mesh(pendantGeo, pendantMat);
    pendant.position.y = 0.48;
    pendant.position.z = 0.25;
    pendant.rotation.x = -0.2;
    group.add(pendant);
    return group;
}

// ==========================================
// --- NEW ITEM MODELS ---
// ==========================================

function createTophatModel() {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16), mat); // Reduced radial segments from 32 to 16
    brim.position.y = 0.025;
    group.add(brim);
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16), mat); // Reduced radial segments from 32 to 16
    dome.position.y = 0.45;
    group.add(dome);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.1, 16), new THREE.MeshLambertMaterial({ color: 0x550000 })); // Reduced radial segments from 32 to 16
    band.position.y = 0.1;
    group.add(band);
    return group;
}

function createRulerModel() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xffdd88, roughness: 0.6 });
    const markMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });

    // Shrink 25% (length 2.0 -> 1.5)
    // Display on its side
    const width = 0.3, height = 1.5;
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.03), woodMat);
    body.position.y = 0.015; // Lay on side
    body.rotation.z = Math.PI / 2;
    group.add(body);

    for (let i = 0; i <= 8; i++) {
        const x = -0.65 + (i * 0.16);
        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.02, width * 0.4, 0.015), markMat);
        mark.position.set(x, 0.015 + width * 0.3, 0.02);
        group.add(mark);
    }

    return group;
}

function createFannyPackModel() {
    const group = new THREE.Group();
    const neonPink = new THREE.MeshStandardMaterial({ color: 0xff00cc, roughness: 0.6 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });

    // Main Pouch: Squashed sphere for that rounded, puffy bag look
    const mainPouch = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), neonPink);
    mainPouch.scale.set(1.4, 0.6, 0.7);
    mainPouch.position.y = 0.2;
    group.add(mainPouch);

    // Front Pocket: Smaller compartment on the front
    const frontPocket = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), neonPink);
    frontPocket.scale.set(1.1, 0.6, 0.5);
    frontPocket.position.set(0, 0.15, 0.22);
    group.add(frontPocket);

    // Zipper Line: Highlighting the openings
    const zipperMain = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.1), metalMat);
    zipperMain.position.set(0, 0.35, 0.08);
    group.add(zipperMain);

    const zipperFront = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.015, 0.05), metalMat);
    zipperFront.position.set(0, 0.2, 0.32);
    group.add(zipperFront);

    // Side Wings: Triangular fabric transitions to the strap
    const wingGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
    const wingL = new THREE.Mesh(wingGeo, neonPink);
    wingL.position.set(-0.5, 0.2, -0.1);
    wingL.rotation.y = -0.4;
    group.add(wingL);

    const wingR = wingL.clone();
    wingR.position.set(0.5, 0.2, -0.1);
    wingR.rotation.y = 0.4;
    group.add(wingR);

    // Strap: Wrapping around
    const strapGeo = new THREE.TorusGeometry(0.6, 0.02, 8, 16, Math.PI);
    const strap = new THREE.Mesh(strapGeo, blackMat);
    strap.rotation.x = Math.PI / 2;
    strap.position.set(0, 0.2, -0.1);
    group.add(strap);

    // Buckle: Plastic clip detail
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.06), blackMat);
    buckle.position.set(0.65, 0.2, -0.1);
    group.add(buckle);

    return group;
}

function createBackpackModel() {
    const group = new THREE.Group();
    const packMat = new THREE.MeshStandardMaterial({ color: 0x228833, roughness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x114411, roughness: 0.8 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });

    // Main Body
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.45), packMat);
    mainBody.position.y = 0.45;
    group.add(mainBody);

    // Rounded Top Lid
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.8, 8, 1, false, 0, Math.PI), packMat); // Reduced radial segments from 12 to 8
    lid.rotation.z = Math.PI / 2;
    lid.position.y = 0.9;
    group.add(lid);

    // Front Pocket
    const frontPocket = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.15), packMat);
    frontPocket.position.set(0, 0.35, 0.28);
    group.add(frontPocket);

    // Side Pockets
    const sidePocketL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.25), darkMat);
    sidePocketL.position.set(-0.45, 0.3, 0);
    group.add(sidePocketL);

    const sidePocketR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.25), darkMat);
    sidePocketR.position.set(0.45, 0.3, 0);
    group.add(sidePocketR);

    // Shoulder Straps (Simplified with Torus)
    const strapGeo = new THREE.TorusGeometry(0.45, 0.04, 6, 12, Math.PI); // Reduced tubular segments from 8 to 6, radial from 24 to 12
    const strapL = new THREE.Mesh(strapGeo, darkMat);
    strapL.rotation.y = Math.PI / 2;
    strapL.position.set(-0.3, 0.5, -0.22);
    group.add(strapL);

    const strapR = new THREE.Mesh(strapGeo, darkMat);
    strapR.rotation.y = Math.PI / 2;
    strapR.position.set(0.3, 0.5, -0.22);
    group.add(strapR);

    // Buckles on front
    const buckleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05);
    const b1 = new THREE.Mesh(buckleGeo, metalMat);
    b1.position.set(-0.2, 0.8, 0.28);
    group.add(b1);

    const b2 = new THREE.Mesh(buckleGeo, metalMat);
    b2.position.set(0.2, 0.8, 0.28);
    group.add(b2);

    return group;
}

function createPencilCaseModel() {
    const group = new THREE.Group();
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x3366cc, roughness: 0.8 });
    const zipperMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x224488, roughness: 0.9 });

    // 1. Pouch Body (puffyBag look)
    const pouchBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 12), caseMat);
    pouchBody.rotation.z = Math.PI / 2;
    pouchBody.scale.set(1.0, 1.0, 1.4);
    pouchBody.position.y = 0.2;
    group.add(pouchBody);

    // 2. Zipper
    const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.06), zipperMat);
    zipper.position.set(0, 0.4, 0);
    group.add(zipper);

    // 3. Zipper Pull
    const pull = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.1), zipperMat);
    pull.position.set(0.45, 0.41, 0);
    group.add(pull);

    // 4. Side Handle Loop
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 6, 12, Math.PI), handleMat);
    handle.position.set(0.6, 0.2, 0);
    handle.rotation.z = -Math.PI / 2;
    group.add(handle);

    // 5. Some Pencils peaking out
    const pMat1 = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), pMat1);
    p1.position.set(0.2, 0.35, 0.1);
    p1.rotation.z = Math.PI / 2 - 0.2;
    group.add(p1);

    group.rotation.y = -Math.PI / 8;
    return group;
}

function createFeatherPenModel() {
    const group = new THREE.Group();
    const quillMat = new THREE.MeshStandardMaterial({ color: 0xffffeb, roughness: 0.6 });
    const featherMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 1.0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
    });

    // Make the stem straight so the flat vanes attach cleanly
    const stemGeo = new THREE.CylinderGeometry(0.015, 0.025, 1.2, 8);
    const stem = new THREE.Mesh(stemGeo, quillMat);
    stem.position.y = 0.55;
    group.add(stem);

    // The feather vane
    const vaneShape = new THREE.Shape();
    vaneShape.moveTo(0, 0.1);
    vaneShape.quadraticCurveTo(0.15, 0.4, 0.05, 0.8);
    vaneShape.lineTo(0, 0.9);
    vaneShape.lineTo(0, 0.1);

    const vaneGeo = new THREE.ShapeGeometry(vaneShape);

    const leftVane = new THREE.Mesh(vaneGeo, featherMat);
    leftVane.position.set(0, 0.25, 0);
    leftVane.rotation.y = 0.2;
    group.add(leftVane);

    const rightVane = new THREE.Mesh(vaneGeo, featherMat);
    rightVane.scale.x = -1;
    rightVane.position.set(0, 0.25, 0);
    rightVane.rotation.y = -0.2;
    group.add(rightVane);

    // The nib (metal tip)
    const nibGeo = new THREE.ConeGeometry(0.015, 0.15, 8);
    const nibMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    const nib = new THREE.Mesh(nibGeo, nibMat);
    nib.rotation.z = Math.PI; // Point down
    nib.position.y = -0.075;
    group.add(nib);

    // Tilt the whole pen back
    group.rotation.x = -0.3;
    group.rotation.z = 0.2;

    // Lift slightly to rest on nib
    group.position.y = 0.1;

    return group;
}

function createCalligraphyPenModel() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5c2e16, roughness: 0.7 });

    // Scaled up 2.5x
    const r = 0.1;
    const bodyGeo = new THREE.CylinderGeometry(r, r * 0.5, 1.0, 8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;

    const outlineMat = new THREE.LineBasicMaterial({ color: 0x000000 });
    const bodyOutline = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo), outlineMat);
    body.add(bodyOutline);
    group.add(body);

    const nibMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.05 });
    const nibGeo = new THREE.ConeGeometry(r, 0.2, 8);
    const nib = new THREE.Mesh(nibGeo, nibMat);
    nib.position.y = 0.05;

    const nibOutline = new THREE.LineSegments(new THREE.EdgesGeometry(nibGeo), outlineMat);
    nib.add(nibOutline);
    group.add(nib);

    return group;
}

function createCoinPurseModel() {
    const group = new THREE.Group();
    const clothMat = new THREE.MeshLambertMaterial({ color: 0x884422 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), clothMat); // Reduced width/height segments from 16, 16 to 12, 12
    body.position.y = 0.2;
    body.scale.set(1, 0.8, 1);
    group.add(body);
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 12), clothMat); // Reduced radial segments from 16 to 12
    top.position.y = 0.45;
    top.rotation.x = Math.PI;
    group.add(top);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), new THREE.MeshLambertMaterial({ color: 0xffddaa })); // Reduced tubular segments from 8 to 6, radial from 16 to 12
    tie.position.y = 0.38;
    tie.rotation.x = Math.PI / 2;
    group.add(tie);
    return group;
}

function createJewelersLoopModel() {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    // Enlarge by 25% (0.2 -> 0.25 radial etc)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.1, 0.25, 12), metalMat);
    body.position.y = 0.125;
    group.add(body);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 12), new THREE.MeshStandardMaterial({ color: 0xaaddff, transparent: true, opacity: 0.5 }));
    lens.position.y = 0.24;
    group.add(lens);
    return group;
}

function createMonocleModel() {
    const group = new THREE.Group();
    const r = 0.35;
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.045, 12, 24), rimMat);
    // Fixed: Rim stays in XY plane (0 rotation) to match standing lens
    rim.position.y = r;
    group.add(rim);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.015, 24), new THREE.MeshStandardMaterial({ color: 0xaaddff, transparent: true, opacity: 0.6 }));
    lens.position.y = r;
    lens.rotation.x = Math.PI / 2; // Face forward
    group.add(lens);

    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8), rimMat);
    chain.position.set(r, r * 0.5, 0);
    chain.rotation.z = -0.6;
    group.add(chain);
    group.rotation.y = Math.PI / 6;
    return group;
}

function createGraduatesCapModel() {
    const group = new THREE.Group();
    const capMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    // Doubled geometry and positions to bypass shop auto-scaling overrides
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), capMat);
    base.position.y = 0.2;
    group.add(base);
    const flatTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 1.6), capMat);
    flatTop.position.y = 0.4;
    group.add(flatTop);
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), capMat);
    button.position.y = 0.44;
    group.add(button);
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), new THREE.MeshLambertMaterial({ color: 0xffcc00 }));
    tassel.position.set(0.2, 0.3, 0.2);
    tassel.rotation.x = 0.5;
    tassel.rotation.z = -0.5;
    group.add(tassel);
    return group;
}

function createFancyVestModel() {
    const group = new THREE.Group();
    const vestMat = new THREE.MeshLambertMaterial({ color: 0x441155 });

    // Main body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.3), vestMat);
    body.position.y = 0.5;
    group.add(body);

    // V-neck cutout (using two angled boxes to cover the top center)
    const cutMat = new THREE.MeshLambertMaterial({ color: 0x220033 }); // Darker interior look
    const leftLapel = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), vestMat);
    leftLapel.position.set(-0.25, 0.95, 0.16);
    leftLapel.rotation.z = 0.2;
    group.add(leftLapel);

    const rightLapel = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), vestMat);
    rightLapel.position.set(0.25, 0.95, 0.16);
    rightLapel.rotation.z = -0.2;
    group.add(rightLapel);

    const buttonMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
    for (let i = 0; i < 3; i++) {
        const button = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), buttonMat);
        button.position.set(0, 0.2 + i * 0.2, 0.16);
        group.add(button);
    }
    return group;
}

function createShirtWithPocketModel() {
    const group = new THREE.Group();
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.3), shirtMat);
    body.position.y = 0.5;
    group.add(body);
    const leftSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.6, 12), shirtMat); // Reduced radial segments from 16 to 12
    leftSleeve.position.set(-0.45, 0.7, 0);
    leftSleeve.rotation.z = -0.5; // Hang down
    group.add(leftSleeve);
    const rightSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.6, 12), shirtMat); // Reduced radial segments from 16 to 12
    rightSleeve.position.set(0.45, 0.7, 0);
    rightSleeve.rotation.z = 0.5; // Hang down
    group.add(rightSleeve);
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.05), shirtMat);
    pocket.position.set(0.2, 0.6, 0.16);
    group.add(pocket);
    return group;
}

function createDealersVisorModel() {
    const group = new THREE.Group();
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x116622, transparent: true, opacity: 0.7, roughness: 0.3, side: THREE.DoubleSide });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x221100, roughness: 0.9 });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

    // Brim (Half-circle/cone-ish)
    const brimGeo = new THREE.CylinderGeometry(0.5, 0.35, 0.05, 12, 1, true, 0, Math.PI);
    const brim = new THREE.Mesh(brimGeo, greenMat);
    brim.rotation.x = 0.3;
    brim.position.y = 0.15;
    group.add(brim);

    // Leather Frame around brim
    const frameGeo = new THREE.TorusGeometry(0.35, 0.03, 8, 12, Math.PI);
    const frame = new THREE.Mesh(frameGeo, leatherMat);
    frame.position.y = 0.18;
    frame.rotation.x = Math.PI / 2;
    group.add(frame);

    // Head strap (Torus)
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.015, 6, 16), leatherMat);
    strap.position.y = 0.18;
    strap.rotation.x = Math.PI / 2;
    group.add(strap);

    // Shine highlight on brim
    const shine = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
    shine.rotation.x = -Math.PI / 2 + 0.3;
    shine.position.set(0.1, 0.22, 0.1);
    group.add(shine);

    return group;
}

function createTorchModel() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x664422 });
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.8, 8), woodMat);
    stick.position.y = 0.4;
    group.add(stick);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.5 });
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.15, 8), metalMat);
    holder.position.y = 0.8;
    group.add(holder);
    const flameMat = new THREE.MeshLambertMaterial({ color: 0xffaa00, emissive: 0xff5500 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 8), flameMat);
    flame.position.y = 0.95;
    group.add(flame);
    return group;
}

function createWristwatchModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x3d1a0b, roughness: 0.9 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xfffffa, roughness: 0.2 });

    // 1. Strap (C-shape using a torus)
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.045, 8, 24, Math.PI * 1.5), leatherMat);
    group.add(strap);

    // 2. Watch Case (Metal Ring facing UP)
    const caseGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16);
    const caseMesh = new THREE.Mesh(caseGeo, metalMat);
    caseMesh.position.y = 0.395;
    group.add(caseMesh);

    // 3. Face (White circle sitting on case, facing UP)
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.01, 16), faceMat);
    face.position.y = 0.44;
    group.add(face);

    // 4. Hands (Floating just above face)
    const handMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.005), handMat);
    hourHand.position.set(0.045, 0.446, 0);
    hourHand.rotation.y = -Math.PI / 4;
    group.add(hourHand);

    const minuteHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.01, 0.005), handMat);
    minuteHand.position.set(-0.07, 0.446, 0);
    minuteHand.rotation.y = Math.PI / 6;
    group.add(minuteHand);

    // Add Tick Marks
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const tick = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.005), handMat);
        tick.position.set(Math.sin(ang) * 0.23, 0.445, Math.cos(ang) * 0.23);
        tick.rotation.y = -ang;
        group.add(tick);
    }

    // 5. Crown
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), metalMat);
    crown.position.set(0.33, 0.395, 0);
    crown.rotation.z = Math.PI / 2;
    group.add(crown);

    group.rotation.x = -0.25;
    group.rotation.y = -Math.PI / 8; // Tilt toward middle of the room
    group.position.y = 0.35;
    group.scale.setScalar(0.85); // Matches general item scale better
    group.position.y = 0.35;
    parent.add(group);
    parent.rotation.y = Math.PI / 6;  // Tilted toward middle of room/player
    parent.scale.setScalar(0.9);      // Shrink 10%
    return parent;
}

function createWizardHatModel() {
    const group = new THREE.Group();
    const hatMat = new THREE.MeshLambertMaterial({ color: 0x3333aa });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.05, 16), hatMat); // Reduced radial segments from 32 to 16
    brim.position.y = 0.025;
    group.add(brim);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 16), hatMat); // Reduced radial segments from 32 to 16
    cone.position.y = 0.6;
    group.add(cone);
    const starMat = new THREE.MeshLambertMaterial({ color: 0xffdd00 });
    const star = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 5), starMat);
    star.position.set(0, 0.5, 0.28);
    star.rotation.x = Math.PI / 2;
    group.add(star);
    group.scale.set(0.9, 0.9, 0.9);
    return group;
}

function createWitchHatModel() {
    const group = new THREE.Group();
    const hatMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 16), hatMat); // Reduced radial segments from 32 to 16
    brim.position.y = 0.025;
    group.add(brim);
    const cone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.5, 16), hatMat); // Reduced radial segments from 32 to 16
    cone1.position.y = 0.25;
    group.add(cone1);
    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 16), hatMat); // Reduced radial segments from 32 to 16
    cone2.position.set(0.1, 0.7, 0);
    cone2.rotation.z = -0.3;
    group.add(cone2);
    const bandMat = new THREE.MeshLambertMaterial({ color: 0x5500aa });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.47, 0.1, 16), bandMat); // Reduced radial segments from 32 to 16
    band.position.y = 0.1;
    group.add(band);
    group.scale.set(0.9, 0.9, 0.9);
    return group;
}

function createHornRimmedGlassesModel() {
    const group = new THREE.Group();
    const r = 0.28; // Scaled down 20% from 0.35
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.1 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xccf0ff, transparent: true, opacity: 0.25, metalness: 0.9, roughness: 0.05 });

    // Winged Upper Frames (The "Horn" part)
    const upperGeo = new THREE.BoxGeometry(r * 1.5, 0.2, 0.12);
    const leftUpper = new THREE.Mesh(upperGeo, frameMat);
    leftUpper.position.set(-r - 0.05, r + 0.1, 0);
    leftUpper.rotation.z = 0.2; // Wing up
    group.add(leftUpper);

    const rightUpper = new THREE.Mesh(upperGeo, frameMat);
    rightUpper.position.set(r + 0.05, r + 0.1, 0);
    rightUpper.rotation.z = -0.2; // Wing up
    group.add(rightUpper);

    // Lower Rims
    const lowerRimGeo = new THREE.TorusGeometry(r, 0.035, 8, 16);
    const leftLower = new THREE.Mesh(lowerRimGeo, frameMat);
    leftLower.position.set(-r - 0.05, r, 0);
    group.add(leftLower);

    const rightLower = new THREE.Mesh(lowerRimGeo, frameMat);
    rightLower.position.set(r + 0.05, r, 0);
    group.add(rightLower);

    // Lenses
    const lensGeo = new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.02, 16);
    const leftLens = new THREE.Mesh(lensGeo, glassMat);
    leftLens.rotation.x = Math.PI / 2;
    leftLens.position.set(-r - 0.05, r, 0);
    group.add(leftLens);

    const rightLens = new THREE.Mesh(lensGeo, glassMat);
    rightLens.rotation.x = Math.PI / 2;
    rightLens.position.set(r + 0.05, r, 0);
    group.add(rightLens);

    // Silver studs
    const rivetGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
    const r1 = new THREE.Mesh(rivetGeo, metalMat); r1.position.set(-r * 2, r + 0.15, 0.05); group.add(r1);
    const r2 = new THREE.Mesh(rivetGeo, metalMat); r2.position.set(r * 2, r + 0.15, 0.05); group.add(r2);

    // Bridge
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.05), frameMat);
    bridge.position.y = r + 0.05;
    group.add(bridge);

    // Temples
    const templeGeo = new THREE.BoxGeometry(0.04, 0.04, 1.2);
    const leftTemple = new THREE.Mesh(templeGeo, frameMat);
    leftTemple.position.set(-r * 2 - 0.15, r, -0.6);
    group.add(leftTemple);

    const rightTemple = new THREE.Mesh(templeGeo, frameMat);
    rightTemple.position.set(r * 2 + 0.15, r, -0.6);
    group.add(rightTemple);

    group.rotation.x = -0.15;
    return group;
}


function createEarMuffsModel() {
    const group = new THREE.Group();
    const fuzzMat = new THREE.MeshLambertMaterial({ color: 0xff5555 });
    const bandMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    const band = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.02, 6, 16, Math.PI), bandMat); // Reduced tubular segments from 8 to 6, radial from 32 to 16
    band.position.set(0, 0.4, 0);
    group.add(band);

    const leftMuff = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), fuzzMat); // Reduced width/height segments from 16, 16 to 12, 12
    leftMuff.scale.set(0.5, 1, 1);
    leftMuff.position.set(-0.45, 0.4, 0);
    group.add(leftMuff);

    const rightMuff = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), fuzzMat); // Reduced width/height segments from 16, 16 to 12, 12
    rightMuff.scale.set(0.5, 1, 1);
    rightMuff.position.set(0.45, 0.4, 0);
    group.add(rightMuff);

    return group;
}

function createLockPicksModel() {
    const group = new THREE.Group();
    const pouchMat = new THREE.MeshLambertMaterial({ color: 0x221100 }); // Darker pouch
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.1 }); // Brighter metal
    const outlineMat = new THREE.LineBasicMaterial({ color: 0x000000 });

    const pouchGeo = new THREE.BoxGeometry(0.4, 0.8, 0.1);
    const pouch = new THREE.Mesh(pouchGeo, pouchMat);
    pouch.position.y = 0.4;
    pouch.add(new THREE.LineSegments(new THREE.EdgesGeometry(pouchGeo), outlineMat));
    group.add(pouch);

    // Pick 1
    const pick1Geo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8);
    const pick1 = new THREE.Mesh(pick1Geo, metalMat);
    pick1.position.set(-0.1, 0.6, 0.06);
    pick1.rotation.z = 0.1;
    pick1.add(new THREE.LineSegments(new THREE.EdgesGeometry(pick1Geo), outlineMat));
    group.add(pick1);

    // Pick 2
    const pick2Geo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8);
    const pick2 = new THREE.Mesh(pick2Geo, metalMat);
    pick2.position.set(0.1, 0.65, 0.06);
    pick2.rotation.z = -0.05;
    pick2.add(new THREE.LineSegments(new THREE.EdgesGeometry(pick2Geo), outlineMat));
    group.add(pick2);

    return group;
}

function createStethoscopeModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    const tubeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
    const diaphragmMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 });

    // 1. Chestpiece (The Bell/Diaphragm)
    // Detailed chestpiece with a metal ring and white diaphragm
    const chestpiece = new THREE.Group();
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.08, 12), metalMat);
    chestpiece.add(bell);

    const diaphragm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 12), diaphragmMat);
    diaphragm.position.y = 0.045;
    chestpiece.add(diaphragm);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8), metalMat);
    stem.position.y = -0.05;
    chestpiece.add(stem);

    chestpiece.position.set(0.1, 0, 0.25);
    chestpiece.rotation.x = Math.PI / 2;
    group.add(chestpiece);

    // 2. Rubber Tubing (Looping back to the ears)
    // Curving using torus segments for a more natural look
    const tube1 = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 16, Math.PI * 0.7), tubeMat);
    tube1.position.set(0.25, 0, 0.1);
    tube1.rotation.y = Math.PI / 2;
    tube1.rotation.z = -Math.PI / 4;
    group.add(tube1);

    const tube2 = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 16, Math.PI * 0.8), tubeMat);
    tube2.position.set(-0.05, 0, 0);
    tube2.rotation.y = -Math.PI / 6;
    tube2.rotation.z = Math.PI / 4;
    group.add(tube2);

    // 3. Binaurals (The metal ear tubes)
    const binaurals = new THREE.Group();
    const tubeL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), metalMat);
    tubeL.position.set(-0.15, 0.15, 0);
    tubeL.rotation.z = 0.3;
    binaurals.add(tubeL);

    const tubeR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), metalMat);
    tubeR.position.set(0.15, 0.15, 0);
    tubeR.rotation.z = -0.3;
    binaurals.add(tubeR);

    // Ear Tips
    const tipMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const tipL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), tipMat);
    tipL.position.set(-0.21, 0.35, 0);
    binaurals.add(tipL);

    const tipR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), tipMat);
    tipR.position.set(0.21, 0.35, 0);
    binaurals.add(tipR);

    binaurals.position.set(-0.25, 0, -0.15);
    group.add(binaurals);

    group.rotation.x = -0.1;
    group.position.y = 0.2;
    parent.add(group);
    parent.rotation.y = Math.PI / 3;
    return parent;
}



function createPocketWatchModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.9, roughness: 0.2 });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

    const radius = 0.45; // Scaled up 1.8x
    const caseMesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.08, 16), goldMat);
    caseMesh.rotation.x = Math.PI / 2;
    group.add(caseMesh);

    const face = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.88, radius * 0.88, 0.09, 16), whiteMat);
    face.rotation.x = Math.PI / 2;
    group.add(face);

    // Tick marks and hands positioned correctly on the face (XY plane)
    const handMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const tick = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.06, 0.005), handMat);
        // Position in XY plane, 12 o'clock is ang=0 (top)
        tick.position.set(Math.sin(ang) * (radius * 0.76), Math.cos(ang) * (radius * 0.76), 0.046);
        tick.rotation.z = -ang;
        group.add(tick);
    }

    const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.005), handMat);
    hourHand.rotation.z = Math.PI / 3;
    hourHand.position.set(Math.sin(Math.PI / 3) * 0.14, Math.cos(Math.PI / 3) * 0.14, 0.047);
    group.add(hourHand);

    const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.38, 0.005), handMat);
    minHand.rotation.z = -Math.PI / 6;
    minHand.position.set(Math.sin(-Math.PI / 6) * 0.19, Math.cos(-Math.PI / 6) * 0.19, 0.047);
    group.add(minHand);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), goldMat);
    cap.position.set(0, radius + 0.05, 0);
    group.add(cap);

    const chain = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), goldMat);
    chain.position.set(0, radius + 0.12, 0);
    group.add(chain);

    // Prop up standing logic
    group.rotation.x = -0.25; // Lean back
    group.rotation.y = Math.PI / 10; // Tilt toward middle
    group.position.y = radius;
    group.scale.setScalar(0.85); // Shrink 15% as requested
    parent.add(group);
    parent.rotation.y = Math.PI / 4;
    return parent;
}

function createToolbeltModel() {
    const group = new THREE.Group();
    const beltMat = new THREE.MeshLambertMaterial({ color: 0x663311 });

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16), beltMat); // Reduced radial segments from 32 to 16
    belt.position.y = 0.075;
    group.add(belt);

    const pouch1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.1), beltMat);
    pouch1.position.set(-0.35, 0.075, 0.2);
    pouch1.rotation.y = -0.5;
    group.add(pouch1);

    const pouch2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.15), beltMat);
    pouch2.position.set(0.35, 0.075, 0.2);
    pouch2.rotation.y = 0.5;
    group.add(pouch2);

    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.04), buckleMat);
    buckle.position.set(0, 0.075, 0.4);
    group.add(buckle);

    return group;
}

function createLunchboxModel() {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, metalness: 0.6, roughness: 0.3 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.5), metalMat);
    body.position.y = 0.3;
    group.add(body);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.0, 8, 1, false, 0, Math.PI), metalMat); // Reduced radial segments from 16 to 8
    top.rotation.z = Math.PI / 2;
    top.position.y = 0.6;
    group.add(top);

    const handleMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 12, Math.PI), handleMat); // Reduced tubular segments from 8 to 6, radial from 16 to 12
    handle.position.y = 0.85;
    group.add(handle);

    return group;
}

// 26. Correction Fluid
function createCorrectionFluidModel() {
    const group = new THREE.Group();
    const bottleMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const capMat = new THREE.MeshLambertMaterial({ color: 0x228833 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.4, 12), bottleMat); // Reduced radial segments from 16 to 12
    body.position.y = 0.2;
    group.add(body);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12), capMat); // Reduced radial segments from 16 to 12
    cap.position.y = 0.55;
    group.add(cap);

    return group;
}

function createFancyDiaryModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    const coverMat = new THREE.MeshLambertMaterial({ color: 0x440022 });
    const pageMat = new THREE.MeshLambertMaterial({ color: 0xfffae6 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });

    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 1.0), coverMat);
    cover.position.y = 0;
    group.add(cover);

    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.77, 0.16, 1.02), pageMat);
    pages.position.set(0.025, 0, 0);
    group.add(pages);

    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.2), goldMat);
    lock.position.set(0.4, 0, 0);
    group.add(lock);

    // STANDING LOGIC
    group.rotation.x = -Math.PI / 2;
    group.position.y = 0.5; // Half of 1.0 height
    parent.add(group);
    return parent;
}

function createPocketNotebookModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    const coverMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const pageMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

    // Increased base size slightly so it's not tiny when scaled by 0.5 in main.js
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.9), coverMat);
    cover.position.y = 0;
    group.add(cover);

    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.06, 0.92), pageMat);
    pages.position.set(0.01, 0, 0);
    group.add(pages);

    const wireMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), wireMat);
    wire.rotation.z = Math.PI / 2;
    wire.position.set(0, 0, -0.45);
    group.add(wire);

    // STANDING LOGIC
    group.rotation.x = -Math.PI / 2;
    group.position.y = 0.45; // Half of 0.9 height
    parent.add(group);
    return parent;
}

function createHeadlampModel() {
    const group = new THREE.Group();
    const strapMat = new THREE.MeshLambertMaterial({ color: 0x222244 });
    const plasticMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    const lensMat = new THREE.MeshLambertMaterial({ color: 0xffffaa, emissive: 0x444422 });

    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 16), strapMat); // Reduced tubular segments from 8 to 6, radial from 32 to 16
    strap.rotation.x = Math.PI / 2;
    strap.position.y = 0.1;
    group.add(strap);

    const lampBox = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.1), plasticMat);
    lampBox.position.set(0, 0.1, 0.3);
    group.add(lampBox);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), lensMat); // Reduced radial segments from 16 to 12
    lens.position.set(0, 0.1, 0.35);
    lens.rotation.x = Math.PI / 2;
    group.add(lens);

    return group;
}

function createArcheologistsBrushModel() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const bristleMat = new THREE.MeshLambertMaterial({ color: 0xddccaa });

    // Scaled up 2x
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), woodMat);
    handle.position.y = 0.6;
    group.add(handle);

    const bristles = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.08), bristleMat);
    bristles.position.y = 0.1;
    group.add(bristles);

    const ferrule = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.09), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    ferrule.position.y = 0.2;
    group.add(ferrule);

    group.rotation.x = -0.25; // Prop up
    group.rotation.z = 0.3;
    return group;
}

function createFlashlightModel() {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.2 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1.0, roughness: 0.1 });

    // Body (Horizontal along Z)
    const bodyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 12);
    const body = new THREE.Mesh(bodyGeo, metalMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Grip texture (Rings)
    for (let i = -0.3; i < 0.2; i += 0.12) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.02, 8, 16), metalMat);
        ring.position.z = i;
        group.add(ring);
    }

    // Head (Wider end)
    const headGeo = new THREE.CylinderGeometry(0.22, 0.12, 0.35, 12);
    const head = new THREE.Mesh(headGeo, metalMat);
    head.rotation.x = Math.PI / 2;
    head.position.z = 0.5;
    group.add(head);

    // Chrome Reflector
    const reflectorGeo = new THREE.CylinderGeometry(0.2, 0.14, 0.05, 12);
    const reflector = new THREE.Mesh(reflectorGeo, chromeMat);
    reflector.rotation.x = Math.PI / 2;
    reflector.position.z = 0.67;
    group.add(reflector);

    // Lens
    const lensGeo = new THREE.CircleGeometry(0.19, 12);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.z = 0.68;
    group.add(lens);

    // Button
    const btn = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.15), new THREE.MeshStandardMaterial({ color: 0xcc2222 }));
    btn.position.set(0, 0.13, 0.1);
    group.add(btn);

    // Point the head (+Z) out toward the player's typical viewing angle in the shop
    group.rotation.y = Math.PI;

    return group;
}



// --- NEW REQUESTED MODELS ---

function createPurseModel() {
    const group = new THREE.Group();
    const leatherMat = new THREE.MeshLambertMaterial({ color: 0x883322 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.25), leatherMat);
    body.position.y = 0.25;
    group.add(body);
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.05), leatherMat);
    flap.position.set(0, 0.3, 0.15);
    flap.rotation.x = 0.2;
    group.add(flap);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 6, 16, Math.PI), leatherMat); // Reduced tubular segments from 8 to 6, radial from 32 to 16
    strap.position.y = 0.5;
    group.add(strap);
    return group;
}

function createBrownShoppingBagModel() {
    const group = new THREE.Group();
    const paperMat = new THREE.MeshLambertMaterial({ color: 0xba8c63 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), paperMat);
    body.position.y = 0.4;
    group.add(body);
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
    const handle1 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 12, Math.PI), handleMat); // Reduced tubular segments from 8 to 6, radial from 16 to 12
    handle1.position.set(0, 0.8, 0.05);
    group.add(handle1);
    const handle2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 12, Math.PI), handleMat); // Reduced tubular segments from 8 to 6, radial from 16 to 12
    handle2.position.set(0, 0.8, -0.05);
    group.add(handle2);
    return group;
}

function createBriefcaseModel() {
    const group = new THREE.Group();
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x221100, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.25), leatherMat);
    body.position.y = 0.35;
    group.add(body);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    handle.position.y = 0.73;
    group.add(handle);
    const lockMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });
    const lock1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), lockMat);
    lock1.position.set(-0.25, 0.5, 0.13);
    group.add(lock1);
    const lock2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), lockMat);
    lock2.position.set(0.25, 0.5, 0.13);
    group.add(lock2);
    return group;
}

function createCampingChairModel() {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 });
    const fabricMat = new THREE.MeshLambertMaterial({ color: 0x224488 });

    // Simple folded chair look
    const frame1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), frameMat);
    frame1.position.set(-0.2, 0.6, 0);
    group.add(frame1);
    const frame2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), frameMat);
    frame2.position.set(0.2, 0.6, 0);
    group.add(frame2);

    const bundledFabric = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.0, 8), fabricMat); // Reduced radial segments from 12 to 8
    bundledFabric.position.y = 0.6;
    group.add(bundledFabric);

    return group;
}

function createMortarAndPestleModel() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), stoneMat); // Reduced width/height segments from 16, 16 to 12, 12
    bowl.position.y = 0.15;
    group.add(bowl);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12), stoneMat); // Reduced radial segments from 16 to 12
    base.position.y = 0.05;
    group.add(base);
    const pestle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.4, 8), stoneMat);
    pestle.position.set(0.1, 0.3, 0);
    pestle.rotation.z = -0.4;
    group.add(pestle);
    return group;
}

function createEraserRefillModel() {
    const group = new THREE.Group();
    const packMat = new THREE.MeshStandardMaterial({
        color: 0xccffff,
        transparent: true,
        opacity: 0.3,
        metalness: 0.2,
        roughness: 0.1
    });

    // Transparent plastic box
    const case1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.15), packMat);
    case1.position.y = 0.275;
    group.add(case1);

    // Three individual pink erasers
    const eraserMat = new THREE.MeshStandardMaterial({ color: 0xff99aa, roughness: 0.8 });
    for (let i = 0; i < 3; i++) {
        const er = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), eraserMat);
        er.position.set(-0.09 + i * 0.09, 0.275, 0);
        group.add(er);
    }
    return group;
}

function createMechanicalEraserModel() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x3366ff });

    // Standing vertically (Y-axis)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.0, 8), bodyMat);
    body.position.y = 0.5;
    group.add(body);

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    tip.position.y = 1.05; // Placed at top
    group.add(tip);

    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.02), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    clip.position.set(0, 0.8, 0.16); // Placed near top
    group.add(clip);

    return group;
}

function createCalculatorModel() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    // Thin base
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.8), bodyMat);
    body.position.set(0, 0.04, 0);
    group.add(body);

    // Screen at the "TOP" end (-Z in local coords, which will be the high side when tilted)
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.18), new THREE.MeshLambertMaterial({ color: 0x889977 }));
    screen.position.set(0, 0.09, -0.26);
    group.add(screen);

    // Buttons at the "BOTTOM" end (+Z in local coords, which will be the low side)
    const buttonMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            const btn = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.09), buttonMat);
            // Buttons spread from -0.1 to +0.34 Z
            btn.position.set(-0.16 + i * 0.16, 0.09, -0.05 + j * 0.12);
            group.add(btn);
        }
    }

    // Facing player and tilted appropriately
    group.rotation.x = Math.PI / 6; // Positive X rotation on -Z screen makes it Higher
    group.rotation.y = Math.PI; // Face the player in the shop
    group.position.y = 0.35;
    return group;
}

function createPunchCardModel() {
    const group = new THREE.Group();
    const cardMat = new THREE.MeshLambertMaterial({ color: 0xfff4e0 }); // Manila card color
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.8), cardMat);
    card.position.y = 0.025;
    group.add(card);
    const holeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 8; j++) {
            if (Math.random() > 0.4) {
                const hole = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.04), holeMat);
                hole.position.set(-0.15 + i * 0.1, 0.055, -0.3 + j * 0.08);
                group.add(hole);
            }
        }
    }
    return group;
}

function createCrystalBallModel() {
    const group = new THREE.Group();
    // Mystic core
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaddff, emissiveIntensity: 1.0 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), coreMat);
    core.position.y = 0.5;
    group.add(core);

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.85, roughness: 0, metalness: 0.8 });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), glassMat);
    sphere.position.y = 0.5;
    group.add(sphere);

    const standMat = new THREE.MeshStandardMaterial({ color: 0x442211, roughness: 0.8, metalness: 0.1 });
    const standBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.2, 16), standMat);
    standBody.position.y = 0.1;
    group.add(standBody);
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), standMat);
    standBase.position.y = 0.025;
    group.add(standBase);
    return group;
}

function createPassedNoteModel() {
    const group = new THREE.Group();
    const paperMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    const folded = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.3), paperMat);
    folded.position.y = 0.04;
    folded.rotation.y = 0.2;
    group.add(folded);
    return group;
}

function createStickyNoteModel() {
    const group = new THREE.Group();
    const yellowMat = new THREE.MeshLambertMaterial({ color: 0xffff44 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), yellowMat);
    pad.position.y = 0.025;
    group.add(pad);
    return group;
}

function createCrumpledNoteModel() {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.2, 0),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    );
    mesh.position.y = 0.2;
    group.add(mesh);
    return group;
}

function createVowelBagModel() {
    const group = new THREE.Group();
    const bagMat = new THREE.MeshLambertMaterial({ color: 0x2288ff });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), bagMat); // Reduced width/height segments from 16, 16 to 12, 12
    body.scale.set(1, 1.2, 1);
    body.position.y = 0.3;
    group.add(body);
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.02), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    label.position.set(0, 0.3, 0.28);
    group.add(label);
    return group;
}

function createConsonantCaseModel() {
    const group = new THREE.Group();
    const caseMat = new THREE.MeshLambertMaterial({ color: 0xff4422 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.4), caseMat);
    body.position.y = 0.1;
    group.add(body);
    return group;
}

function createInkRefillModel() {
    const group = new THREE.Group();
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.4,
        metalness: 0.5,
        roughness: 0.05
    });

    // Glass bottle
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16), glassMat); // Reduced radial segments from 24 to 16
    body.position.y = 0.25;
    group.add(body);

    // Dark liquid inside
    const inkGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16); // Reduced radial segments from 24 to 16
    const inkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.3 });
    const inkMesh = new THREE.Mesh(inkGeo, inkMat);
    inkMesh.position.y = 0.2;
    group.add(inkMesh);

    // Cork
    const corkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9, metalness: 0 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.15, 8), corkMat); // Reduced radial segments from 12 to 8
    cap.position.y = 0.5;
    group.add(cap);

    return group;
}

function createEarhornModel() {
    const group = new THREE.Group();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });

    const modelGroup = new THREE.Group();
    const radius = 0.45; // Scaled up 2.2x
    const height = 1.0;  // Scaled up 1.6x
    const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 12, 1, true), brassMat);
    cone.rotation.z = Math.PI / 2;
    cone.position.y = 0.55;
    modelGroup.add(cone);

    const tube = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 6, 12, Math.PI), brassMat);
    tube.position.y = 0.18;
    modelGroup.add(tube);

    group.add(modelGroup);
    group.rotation.x = -0.2; // Lean back slightly
    group.rotation.y = Math.PI / 6;
    return group;
}

function createFlatCapModel() {
    const group = new THREE.Group();
    const clothMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), clothMat); // Reduced radial segments from 24 to 16
    top.scale.set(1.2, 1, 1.4);
    top.position.y = 0.1;
    group.add(top);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16, 1, false, 0, Math.PI), clothMat); // Reduced radial segments from 24 to 16
    brim.position.set(0, 0.05, 0.4);
    group.add(brim);
    return group;
}

function createRainbowPencilModel() {
    const group = new THREE.Group();
    const colors = [0xff0000, 0xffaa00, 0xffcc00, 0x00ff00, 0x00aaff, 0xaa00ff];
    for (let i = 0; i < 6; i++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 6), new THREE.MeshLambertMaterial({ color: colors[i] }));
        seg.rotation.x = Math.PI / 2;
        seg.position.z = -0.4 + (i * 0.16);
        group.add(seg);
    }
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xd2b48c }));
    tip.rotation.x = Math.PI / 2;
    tip.position.z = 0.56;
    group.add(tip);
    return group;
}

function createHoodModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    // Two-tone shading: light outer shell, dark interior
    const outerMat = new THREE.MeshLambertMaterial({ color: 0x333333, side: THREE.FrontSide });
    const innerMat = new THREE.MeshLambertMaterial({ color: 0x111111, side: THREE.BackSide });

    // Scaled up 2x
    const radius = 0.65;
    const height = 0.8;
    const cowlGeo = new THREE.CylinderGeometry(radius - 0.1, radius, height, 16, 1, true, Math.PI * 0.2, Math.PI * 1.6);
    const cowlOuter = new THREE.Mesh(cowlGeo, outerMat);
    const cowlInner = new THREE.Mesh(cowlGeo, innerMat);
    cowlOuter.position.y = height / 2;
    cowlInner.position.y = height / 2;
    cowlInner.scale.set(0.95, 1, 0.95); // Gap increased to avoid clashing/shimmering
    group.add(cowlOuter, cowlInner);

    const topGeo = new THREE.SphereGeometry(radius - 0.1, 16, 16, Math.PI * 0.15, Math.PI * 1.7, 0, Math.PI / 2);
    const topOuter = new THREE.Mesh(topGeo, outerMat);
    const topInner = new THREE.Mesh(topGeo, innerMat);
    topOuter.position.y = height;
    topInner.position.y = height;
    topInner.scale.set(0.95, 0.95, 0.95); // Gap increased to avoid clashing/shimmering
    group.add(topOuter, topInner);

    const drape = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.8, 0.6, 16, 1, true, Math.PI, Math.PI), outerMat);
    drape.position.set(0, 0.15, -0.35);
    drape.rotation.x = -0.2;
    group.add(drape);

    group.rotation.y = Math.PI / 4;
    group.scale.set(0.72, 0.72, 0.72); // Shrink base model by another 15% (total 0.72)
    parent.add(group);
    return parent;
}

function createCapeModel() {
    const group = new THREE.Group();
    const clothMat = new THREE.MeshLambertMaterial({ color: 0xaa0000 });
    const cape = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.5, 0.05), clothMat);
    cape.position.y = -0.75;
    cape.position.z = -0.2;
    group.add(cape);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 12, Math.PI), clothMat); // Reduced tubular segments from 8 to 6, radial from 16 to 12
    collar.rotation.x = Math.PI / 2;
    group.add(collar);
    return group;
}

function createThreeRingBinderModel() {
    const group = new THREE.Group();
    const coverMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const front = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 1.0), coverMat);
    front.position.set(0.4, 0.1, 0);
    group.add(front);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 1.0), coverMat);
    back.position.set(0.4, -0.1, 0);
    group.add(back);
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 1.0), coverMat);
    spine.position.x = 0;
    group.add(spine);
    return group;
}

function createTapeDispenserModel() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x004488 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.7), bodyMat);
    body.position.y = 0.2;
    group.add(body);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 12), new THREE.MeshLambertMaterial({ color: 0xeeeeee })); // Reduced radial segments from 16 to 12
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, 0.35, -0.15);
    group.add(wheel);
    const cutter = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 }));
    cutter.position.set(0, 0.4, 0.3);
    group.add(cutter);
    return group;
}

function createMaskingTapeModel() {
    const group = new THREE.Group();
    const cardboardMat = new THREE.MeshLambertMaterial({ color: 0xc4a484 });
    const tapeMat = new THREE.MeshLambertMaterial({ color: 0xfffadd });
    const core = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 6, 16), cardboardMat);
    core.rotation.set(-Math.PI / 4, 0, 0);
    core.position.y = 0.25; // Apply internal lift so it doesn't get wiped by main.js
    group.add(core);

    const tape = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 6, 16), tapeMat);
    tape.rotation.set(-Math.PI / 4, 0, 0);
    tape.position.y = 0.25; // Apply internal lift
    group.add(tape);

    group.rotation.x = Math.PI / 2;
    group.position.y = 0.45;
    return group;
}

function createInkBrushModel() {
    const group = new THREE.Group();
    const handleMat = new THREE.MeshLambertMaterial({ color: 0x221100 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8), handleMat);
    handle.position.y = 0.5;
    group.add(handle);
    const brushMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    const bristles = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 8), brushMat);
    bristles.position.y = 0.1;
    group.add(bristles);
    return group;
}

function createNo1PencilModel() {
    return createPencilModel();
}

function createNo2PencilModel() {
    const p = createPencilModel();
    // No2 is standard yellow
    return p;
}

function createNo3PencilModel() {
    const p = createPencilModel();
    // Make body blue for No3
    p.children.forEach(c => {
        if (c.geometry.type === "CylinderGeometry" && c.position.z === 0) {
            c.material = new THREE.MeshLambertMaterial({ color: 0x0088ff });
        }
    });
    return p;
}

function createNo4PencilModel() {
    const p = createPencilModel();
    // Make body green for No4
    p.children.forEach(c => {
        if (c.geometry.type === "CylinderGeometry" && c.position.z === 0) {
            c.material = new THREE.MeshLambertMaterial({ color: 0x00aa44 });
        }
    });
    return p;
}

function createColorPencilModel() {
    const p = createPencilModel();
    // Make body pink
    p.children.forEach(c => {
        if (c.geometry.type === "CylinderGeometry" && c.position.z === 0) {
            c.material = new THREE.MeshLambertMaterial({ color: 0xff0088 });
        }
    });
    return p;
}

function createMagneticBootsModel() {
    const group = new THREE.Group();
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.3 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });
    const glowMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 1.0 });

    const createBoot = (xOffset) => {
        const bootGroup = new THREE.Group();
        bootGroup.position.set(xOffset, 0, 0);

        // 1. Sole (Magnetic base) - Heavy metal slab
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.5), metalMat);
        sole.position.y = 0.04;
        bootGroup.add(sole);

        // 2. Main foot part (The boot itself)
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.45), bootMat);
        foot.position.y = 0.18;
        bootGroup.add(foot);

        // 3. Leg/Shaft of the boot
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.25), bootMat);
        leg.position.set(0, 0.4, -0.08);
        bootGroup.add(leg);

        // 4. Side Magnet Detailing
        const magnetSlab = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.3), metalMat);
        magnetSlab.position.set(0.13, 0.18, 0);
        bootGroup.add(magnetSlab);
        const magnetSlab2 = magnetSlab.clone();
        magnetSlab2.position.x = -0.13;
        bootGroup.add(magnetSlab2);

        // 5. Magnetic Coils (Glowing blue bands)
        const bandGeo = new THREE.TorusGeometry(0.1, 0.02, 8, 16);
        const band = new THREE.Mesh(bandGeo, glowMat);
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.1;
        bootGroup.add(band);

        const band2 = band.clone();
        band2.position.y = 0.5;
        bootGroup.add(band2);

        return bootGroup;
    };

    group.add(createBoot(-0.25));
    group.add(createBoot(0.25));

    return group;
}

function createArcheologistsHammerModel() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.85, roughness: 0.2 });

    // Standing Up and Enlarged 1.25x
    const hScale = 1.25;
    const handleLen = 0.7 * hScale;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, handleLen, 8), woodMat);
    handle.position.y = handleLen / 2;
    group.add(handle);

    const headHeight = 0.12 * hScale;
    const headWidth = 0.3 * hScale;
    const head = new THREE.Mesh(new THREE.BoxGeometry(headWidth, headHeight, headHeight), ironMat);
    head.position.y = handleLen;
    head.position.x = -0.05; // Slightly offset for better silhouette
    group.add(head);

    const pick = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 8), ironMat);
    pick.rotation.z = -Math.PI / 2;
    pick.position.set(headWidth / 2 - 0.05, handleLen, 0);
    group.add(pick);

    group.rotation.y = Math.PI / 6;
    return group;
}



function createHandMattockModel() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x4e342e });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x616161, metalness: 0.8 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), woodMat);
    handle.position.y = 0.25;
    group.add(handle);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.4, 0.12), ironMat);
    blade.position.y = 0.5;
    blade.rotation.x = Math.PI / 6;
    group.add(blade);
    group.scale.setScalar(1.5); // Increase scale 50%
    return group;
}

function createJarOfHoneyModel() {
    const group = new THREE.Group();
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xffb300, transparent: true, opacity: 0.7 });
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 12), glassMat); // Reduced radial segments from 16 to 12
    jar.position.y = 0.2;
    group.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 12), new THREE.MeshLambertMaterial({ color: 0xeeeeee })); // Reduced radial segments from 16 to 12
    lid.position.y = 0.42;
    group.add(lid);
    return group;
}

function createLoafOfBreadModel() {
    const group = new THREE.Group();
    const breadMat = new THREE.MeshLambertMaterial({ color: 0xdeb887 });
    const crustMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });

    // Main loaf body - slightly rounded box
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.4), breadMat);
    base.position.y = 0.175;
    group.add(base);

    // Domed top (half-cylinder)
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 16, 1, false, 0, Math.PI), crustMat);
    dome.rotation.z = Math.PI / 2;
    dome.position.y = 0.35;
    group.add(dome);

    // Some "score marks" or cuts on top
    const markMat = new THREE.MeshLambertMaterial({ color: 0x5c2e16 });
    for (let i = -1; i <= 1; i++) {
        const mark = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.3), markMat);
        mark.position.set(i * 0.18, 0.53, 0);
        mark.rotation.y = 0.4;
        group.add(mark);
    }

    return group;
}

function createSootScraperModel() {
    const group = new THREE.Group();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.625, 8), new THREE.MeshLambertMaterial({ color: 0x442211 }));
    handle.position.y = 0.3125;
    group.add(handle);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.065, 0.25), ironMat);
    blade.position.y = 0.625;
    group.add(blade);
    group.rotation.x = -0.1;
    return group;
}

function createWaterJugModel() {
    const group = new THREE.Group();
    const clayMat = new THREE.MeshStandardMaterial({
        color: 0xa1887f,
        roughness: 0.6,
        metalness: 0.1
    });

    // Rounded body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 24), clayMat);
    body.position.y = 0.35;
    body.scale.set(1, 1.1, 1);
    group.add(body);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.4, 32), clayMat);
    neck.position.y = 0.7;
    group.add(neck);

    // Flared Rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 12, 32), clayMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.9;
    group.add(rim);

    // Handle
    const handleGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.12, 0.75, 0),
        new THREE.Vector3(0.38, 0.65, 0),
        new THREE.Vector3(0.38, 0.3, 0),
        new THREE.Vector3(0.25, 0.2, 0)
    ]), 20, 0.03, 8, false);
    const handle = new THREE.Mesh(handleGeo, clayMat);
    group.add(handle);

    return group;
}

function createHammerAndChiselModel() {
    const group = new THREE.Group();
    const hammer = createArcheologistsHammerModel();
    hammer.scale.set(0.8, 0.8, 0.8);
    hammer.position.x = -0.15;
    group.add(hammer);
    const chisel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7 })); // Reduced radial segments from 6 to 6 (already low)
    chisel.position.set(0.2, 0.2, 0);
    chisel.rotation.z = -0.4;
    group.add(chisel);
    return group;
}

function createLockBoxModel() {
    const group = new THREE.Group();
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7, roughness: 0.3 });
    // Scaled up 25% (0.6 -> 0.75 etc)
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.5, 0.5), ironMat);
    box.position.y = 0.25;
    group.add(box);

    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.06), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 }));
    lock.position.set(0, 0.25, 0.25);
    group.add(lock);

    const hinge1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), ironMat);
    hinge1.position.set(-0.2, 0.45, -0.25);
    group.add(hinge1);
    const hinge2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), ironMat);
    hinge2.position.set(0.2, 0.45, -0.25);
    group.add(hinge2);

    return group;
}

function createMagnifyingGlassModel() {
    const group = new THREE.Group();
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, metalness: 0.7, roughness: 0.2 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x331100, roughness: 0.8 });

    // Handle (Now Standing)
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), woodMat);
    handle.position.y = 0.225;
    group.add(handle);

    // Ring (Standing on top of handle)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 8, 16), brassMat);
    ring.position.y = 0.6;
    group.add(ring);

    // Lens
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.17, 16), new THREE.MeshStandardMaterial({ color: 0xccf0ff, transparent: true, opacity: 0.4, roughness: 0 }));
    lens.position.y = 0.6;
    group.add(lens);

    group.rotation.y = Math.PI / 4; // Slight angle for perspective
    group.rotation.x = 0.2; // Lean back slightly
    return group;
}

function createEarPlugsModel() {
    const group = new THREE.Group();
    const foamMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
    // Scaled up 3x
    const r = 0.15;
    const h = 0.35;
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), foamMat);
    p1.position.set(-0.25, h / 2, 0);
    p1.rotation.x = 0.2;
    group.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), foamMat);
    p2.position.set(0.25, h / 2, 0);
    p2.rotation.z = 0.3;
    p2.rotation.x = -0.2;
    group.add(p2);

    group.rotation.y = Math.PI / 6;
    return group;
}

function createBandolierModel() {
    const group = new THREE.Group();
    const leatherMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 8, 16), leatherMat);
    strap.scale.set(0.6, 1.2, 1);
    strap.position.y = 0.5;
    group.add(strap);

    // Add potions/vials attached to it
    const vialMat = new THREE.MeshStandardMaterial({ color: 0x00ccff, transparent: true, opacity: 0.8, roughness: 0.1 });
    const capMat = new THREE.MeshLambertMaterial({ color: 0x884400 });

    for (let i = 0; i < 6; i++) {
        // Place along the front angle
        const angle = -0.6 + i * 0.25;
        const x = Math.sin(angle) * 0.3; // matches strapped X profile at 0.6x scale
        const y = Math.cos(angle) * 0.6 + 0.4;
        const z = 0.08 + Math.abs(x) * 0.3; // push forward slightly over the chest

        const vialGroup = new THREE.Group();
        const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 8), vialMat);
        vialGroup.add(vial);

        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), capMat);
        cap.position.y = 0.09;
        vialGroup.add(cap);

        vialGroup.position.set(x, y, z);

        // Tilt sideways along the strap
        vialGroup.rotation.z = -Math.PI / 2 - angle * 0.6;
        vialGroup.rotation.x = 0.2;

        group.add(vialGroup);
    }

    group.rotation.y = Math.PI / 4; // Show a nice 3/4 angle
    return group;
}

function createPencilPouchModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.9 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.8, roughness: 0.2 });
    const tagMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

    // 1. Pouch Body (Soft, rounded appearance)
    const bodyGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const body = new THREE.Mesh(bodyGeo, clothMat);
    body.scale.set(1.6, 0.6, 0.4);
    body.position.y = 0.18;
    group.add(body);

    // 2. Zipper Line (Flat box across the top)
    const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.05), metalMat);
    zipper.position.set(0, 0.36, 0);
    group.add(zipper);

    // 3. Zipper Pull (Small tab)
    const pull = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.12), metalMat);
    pull.position.set(0.35, 0.37, 0);
    group.add(pull);

    // 4. Fabric Tag (Small detail on the side)
    const tag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.01), tagMat);
    tag.position.set(-0.4, 0.2, 0.1);
    tag.rotation.y = 0.3;
    group.add(tag);

    // Shelf presentation
    group.rotation.y = -Math.PI / 6;
    group.position.y = 0.1;
    parent.add(group);
    return parent;
}

function createKneadedEraserModel() {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.15, 0),
        new THREE.MeshLambertMaterial({ color: 0x90a4ae })
    );
    mesh.position.y = 0.15;
    group.add(mesh);
    return group;
}

function createBallPointPenModel() {
    const group = new THREE.Group();
    const plasticMat = new THREE.MeshStandardMaterial({ color: 0x1a237e, roughness: 0.3 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });

    // Body (Standing)
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), plasticMat);
    body.position.y = 0.4;
    group.add(body);

    // Cap (on top)
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.3, 8), plasticMat);
    cap.position.y = 0.7;
    group.add(cap);

    // Clip
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.2, 0.05), metalMat);
    clip.position.set(0, 0.7, 0.05);
    group.add(clip);

    return group;
}

function createChaosCoinModel() {
    const group = new THREE.Group();
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0x6200ea, metalness: 0.9, roughness: 0.1 });
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.5, emissive: 0xff00ff, emissiveIntensity: 0.2 });

    const radius = 0.25;
    const thickness = 0.05;

    // Coin geometry standing vertically (along Z-axis plane)
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 24), edgeMat);
    coin.rotation.x = Math.PI / 2;
    coin.position.y = radius;
    group.add(coin);

    const symbol = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), faceMat);
    symbol.position.y = radius;
    symbol.position.z = (thickness / 2) + 0.001; // Front face
    group.add(symbol);

    const symbolBottom = symbol.clone();
    symbolBottom.rotation.y = Math.PI;
    symbolBottom.position.z = -(thickness / 2) - 0.001; // Back face
    group.add(symbolBottom);

    // Lean slightly and rotate for better visibility of the symbol from the front
    group.rotation.x = -0.15;
    group.rotation.y = Math.PI * 0.1;

    return group;
}

function createDieModel(sides, color) {
    const group = new THREE.Group();
    let geo;
    if (sides === 4) geo = new THREE.TetrahedronGeometry(0.3);
    else if (sides === 6) geo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    else if (sides === 8) geo = new THREE.OctahedronGeometry(0.3);
    else if (sides === 10) {
        geo = new THREE.OctahedronGeometry(0.32);
        geo.scale(1, 1.4, 1);
    }
    else if (sides === 12) geo = new THREE.DodecahedronGeometry(0.3);
    else if (sides === 20) geo = new THREE.IcosahedronGeometry(0.3);
    else geo = new THREE.SphereGeometry(0.25, 12, 12);

    const mat = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.6,
        roughness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.22;
    group.add(mesh);

    // Edges/Outlines to prevent monochromatic "blending"
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    edges.position.copy(mesh.position);
    edges.scale.copy(mesh.scale);
    group.add(edges);

    // Numbers/Dots
    const detailMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 });

    if (sides === 6) {
        const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const addDot = (x, y, z) => {
            const dot = new THREE.Mesh(dotGeo, detailMat);
            dot.position.set(x, y + 0.22, z);
            group.add(dot);
        }
        // Face 1 (Top)
        addDot(0, 0.176, 0);
        // Face 6 (Bottom)
        addDot(-0.1, -0.176, -0.1); addDot(0.1, -0.176, -0.1);
        addDot(-0.1, -0.176, 0); addDot(0.1, -0.176, 0);
        addDot(-0.1, -0.176, 0.1); addDot(0.1, -0.176, 0.1);

        // Face 2 (Front)
        addDot(-0.08, -0.08, 0.176); addDot(0.08, 0.08, 0.176);
        // Face 5 (Back)
        addDot(-0.08, -0.08, -0.176); addDot(0.08, 0.08, -0.176);
        addDot(0.08, -0.08, -0.176); addDot(-0.08, 0.08, -0.176);
        addDot(0, 0, -0.176);

        // Face 3 (Right)
        addDot(0.176, -0.1, -0.1); addDot(0.176, 0, 0); addDot(0.176, 0.1, 0.1);
        // Face 4 (Left)
        addDot(-0.176, -0.1, -0.1); addDot(-0.176, -0.1, 0.1);
        addDot(-0.176, 0.1, -0.1); addDot(-0.176, 0.1, 0.1);
    } else {
        // Polyhedral dice: calculate face centroids for pip placement
        const posAttr = geo.getAttribute('position');
        const vA = new THREE.Vector3();
        const vB = new THREE.Vector3();
        const vC = new THREE.Vector3();
        const dotGeo = new THREE.SphereGeometry(0.03, 6, 6);

        // Limit to 4-5 pips for performance and visual clarity
        const facesCount = posAttr.count / 3;
        const skip = Math.max(1, Math.floor(facesCount / 6));

        for (let i = 0; i < facesCount; i += skip) {
            vA.fromBufferAttribute(posAttr, i * 3);
            vB.fromBufferAttribute(posAttr, i * 3 + 1);
            vC.fromBufferAttribute(posAttr, i * 3 + 2);

            const centroid = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);
            const normal = centroid.clone().normalize();

            const dot = new THREE.Mesh(dotGeo, detailMat);
            // Translate to world space and offset outward
            dot.position.copy(centroid).add(normal.multiplyScalar(0.02));
            dot.position.y += 0.22; // Align with mesh position
            group.add(dot);
        }
    }

    return group;
}

function create20SidedDieModel() { return createDieModel(20, 0xff3333); }
function create12SidedDieModel() { return createDieModel(12, 0x33ff33); }
function create10SidedDieModel() { return createDieModel(10, 0x3333ff); }
function create8SidedDieModel() { return createDieModel(8, 0xffff33); }
function create6SidedDieModel() { return createDieModel(6, 0xffffff); }
function create4SidedDieModel() { return createDieModel(4, 0x444444); }

function createVowelHighlighterModel() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x88ff00 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), bodyMat);
    body.position.y = 0.3;
    group.add(body);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshLambertMaterial({ color: 0xccff00 }));
    tip.position.y = 0.65;
    group.add(tip);
    return group;
}

function createConsonantHighlighterModel() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x0088ff });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), bodyMat);
    body.position.y = 0.3;
    group.add(body);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshLambertMaterial({ color: 0x00ccff }));
    tip.position.y = 0.65;
    group.add(tip);
    return group;
}

function createDoctorsNoteModel() {
    const group = new THREE.Group();
    const paperMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const note = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.01), paperMat);
    note.position.y = 0.25;
    group.add(note);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.015), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    cross.position.set(0, 0.35, 0.01);
    group.add(cross);

    group.rotation.x = 0.15; // Slight forward tilt for visibility on shelves
    return group;
}

function createBusinessCardModel() {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.02), mat);
    card.position.y = 0.2;
    group.add(card);

    // Decorative "text" lines
    const lineMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const line1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.01), lineMat);
    line1.position.set(0.1, 0.25, 0.015);
    group.add(line1);

    const line2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.01), lineMat);
    line2.position.set(0.05, 0.2, 0.015);
    group.add(line2);

    const line3 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.01), lineMat);
    line3.position.set(-0.05, 0.15, 0.015);
    group.add(line3);

    // Small "photo" or "logo" area
    const logoMat = new THREE.MeshLambertMaterial({ color: 0x4444aa });
    const logo = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.01), logoMat);
    logo.position.set(-0.2, 0.28, 0.02);
    group.add(logo);

    group.rotation.x = -0.15; // Lean back slightly (upright)
    return group;
}

function createCheatSheetModel() {
    const group = new THREE.Group();
    // Scaled up 2.2x
    const width = 0.75;
    const height = 1.0;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.03), new THREE.MeshLambertMaterial({ color: 0xffffcc }));
    mesh.position.y = height / 2;
    mesh.rotation.x = -0.25;
    group.add(mesh);

    // Decorative "notes" lines
    const lineMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    for (let i = 0; i < 6; i++) {
        const line = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 0.02, 0.02), lineMat);
        const yPos = (height * 0.8) - (i * 0.14);
        line.position.set(0, yPos, 0.03);
        line.rotation.x = -0.25;
        group.add(line);
    }

    // Red "A+" mark
    const redMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const grade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.02), redMat);
    grade.position.set(0.2, 0.2, 0.04);
    grade.rotation.x = -0.25;
    group.add(grade);

    group.rotation.y = Math.PI / 8;
    return group;
}

function createSlatedModel() {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const slateMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.05), frameMat);
    frame.position.y = 0.2;
    group.add(frame);
    const slate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.052), slateMat);
    slate.position.y = 0.2;
    group.add(slate);
    return group;
}

function createToolModel() {
    // Generic fallback for future items
    return createPencilModel();
}

const ITEM_MODEL_MAP = {
    "Pencil": createPencilModel, "Notebook": createNotebookModel, "Eraser": createEraserModel,
    "Glasses": createGlassesModel, "Water Bottle": createWaterBottleModel,
    "Small Inkwell": createSmallInkwellModel, "Inkwell": createInkwellModel, "Big Inkwell": createBigInkwellModel,
    "Bowler Cap": createBowlerCapModel, "Ring": createRingModel,
    "Tophat": createTophatModel, "Ruler": createRulerModel, "Fanny Pack": createFannyPackModel,
    "Backpack": createBackpackModel, "Pencil Case": createPencilCaseModel, "Feather Pen": createFeatherPenModel,
    "Calligraphy Pen": createCalligraphyPenModel, "Coin Purse": createCoinPurseModel, "Jeweler's Loupe": createJewelersLoopModel,
    "Monocle": createMonocleModel, "Graduate's Cap": createGraduatesCapModel, "Fancy Vest": createFancyVestModel,
    "Shirt With Pocket": createShirtWithPocketModel, "Dealer's Visor": createDealersVisorModel, "Torch": createTorchModel,
    "Wristwatch": createWristwatchModel, "Wizard Hat": createWizardHatModel, "Witch Hat": createWitchHatModel,
    "Archeologist's Hammer": createArcheologistsHammerModel, "Hand Mattock": createHandMattockModel, "Jar of Honey": createJarOfHoneyModel, "Jar Of Honey": createJarOfHoneyModel,
    "Horn-Rimmed Glasses": createHornRimmedGlassesModel, "Ear Muffs": createEarMuffsModel, "Lock Picks": createLockPicksModel,
    "Stethoscope": createStethoscopeModel, "Pocket Watch": createPocketWatchModel, "Toolbelt": createToolbeltModel,
    "Lunchbox": createLunchboxModel, "Correction Fluid": createCorrectionFluidModel, "Diary": createFancyDiaryModel,
    "Pocket Notebook": createPocketNotebookModel, "Headlamp": createHeadlampModel, "Archeologist's Brush": createArcheologistsBrushModel,
    "Flashlight": createFlashlightModel, "purse": createPurseModel, "brown shopping bag": createBrownShoppingBagModel,
    "Brief Case": createBriefcaseModel, "Camping chair": createCampingChairModel, "Mortar and pestle": createMortarAndPestleModel,
    "Slated": createSlatedModel, "Loaf of Bread": createLoafOfBreadModel,
    "Eraser Refill": createEraserRefillModel, "Mechanical Eraser": createMechanicalEraserModel, "Calculator": createCalculatorModel,
    "Passed Note": createPassedNoteModel, "Sticky Note": createStickyNoteModel, "Crumpled Note": createCrumpledNoteModel,
    "Vowel Bag": createVowelBagModel, "Consonant Case": createConsonantCaseModel, "Ink Refill": createInkRefillModel,
    "Earhorn": createEarhornModel, "Flat Cap": createFlatCapModel, "Rainbow Pencil": createRainbowPencilModel,
    "Hood": createHoodModel, "Cape": createCapeModel, "Three Ring Binder": createThreeRingBinderModel,
    "Tape Dispenser": createTapeDispenserModel, "Masking Tape": createMaskingTapeModel, "Ink Brush": createInkBrushModel,
    "#1 Pencil": createNo1PencilModel, "#2 Pencil": createNo2PencilModel, "#3 Pencil": createNo3PencilModel,
    "#4 Pencil": createNo4PencilModel, "Color Pencil": createColorPencilModel, "Magnetic Boots": createMagneticBootsModel,
    "Cheat Sheet": createCheatSheetModel, "Business Card": createBusinessCardModel, "Doctor's Note": createDoctorsNoteModel,
    "Vowel Highlighter": createVowelHighlighterModel, "Consonant Highlighter": createConsonantHighlighterModel,
    "20 Sided die": create20SidedDieModel, "12 Sided die": create12SidedDieModel, "10 Sided die": create10SidedDieModel,
    "8 Sided Die": create8SidedDieModel, "6 Sided die": create6SidedDieModel, "4 sided die": create4SidedDieModel,
    "Chaos Coin": createChaosCoinModel, "Ball Point Pen": createBallPointPenModel, "Kneaded Eraser": createKneadedEraserModel,
    "Pencil Pouch": createPencilPouchModel, "Bandolier": createBandolierModel, "Ear Plugs": createEarPlugsModel,
    "Magnifying Glass": createMagnifyingGlassModel, "Lock Box": createLockBoxModel, "Hammer and Chisel": createHammerAndChiselModel,
    "Soot Scraper": createSootScraperModel, "Water Jug": createWaterJugModel,
    "Punch Card": createPunchCardModel, "Crystal Ball": createCrystalBallModel, "Thesaurus": createThesaurusModel,
    "Dictionary": createDictionaryModel, "Spellonomicon": createSpellonomiconModel, "Big Eraser": createBigEraserModel,
    "Memoir": createMemoirModel, "Edward Pencil Hands": createEdwardPencilHandsModel,
    "Manuscript": createManuscriptModel,
    "Fancy Diary": createFancyDiaryModel,
    "Bag of Gold": createGoldBagModel
};

function createMemoirModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x221144, roughness: 0.3, metalness: 0.2 }); // Deep purple/blue royal leather
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xfdfdfd, roughness: 0.9 }); // Bright clean paper

    // Thicker cover
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 1.2), coverMat);
    cover.position.y = 0;
    group.add(cover);

    // Gilded page block (visible edges)
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.24, 1.15), goldMat); // Gold edges!
    pages.position.set(0.04, 0, 0);
    group.add(pages);

    // Ornate gold clasp
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.3), goldMat);
    clasp.position.set(0.45, 0, 0);
    group.add(clasp);

    // Central gold emblem/seal
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), goldMat);
    seal.position.set(0, 0.15, 0);
    group.add(seal);

    // STANDING LOGIC
    group.rotation.x = -Math.PI / 2;
    group.position.y = 0.6; // Half of 1.2 height
    parent.add(group);
    return parent;
}

function createManuscriptModel() {
    const parent = new THREE.Group();
    const group = new THREE.Group();
    const paperMat = new THREE.MeshLambertMaterial({ color: 0xfffae6 });
    const bindingMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });

    // Stack of 3 parchment sheets
    for (let i = 0; i < 3; i++) {
        const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 1.2), paperMat);
        sheet.position.y = 0.02 * i;
        sheet.rotation.y = (Math.random() - 0.5) * 0.1;
        group.add(sheet);
    }

    // A leather strap/binding across the middle
    const strap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.15), bindingMat);
    strap.position.y = 0.03;
    group.add(strap);

    // STANDING LOGIC
    group.rotation.x = -Math.PI / 2;
    group.position.y = 0.6; // Half of 1.2 height
    parent.add(group);
    return parent;
}

function createGoldBagModel() {
    const group = new THREE.Group();
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xc4a484, roughness: 0.9 }); // Tan/Burlap
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });

    // Main pouch (lumpy)
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), clothMat);
    body.position.y = 0.2;
    body.scale.set(1.1, 0.9, 1);
    group.add(body);

    // Top knot
    const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.15, 8), clothMat);
    knot.position.y = 0.45;
    group.add(knot);

    // String tie
    const string = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 6, 12), new THREE.MeshLambertMaterial({ color: 0x5d4037 }));
    string.position.y = 0.38;
    string.rotation.x = Math.PI / 2;
    group.add(string);

    // Some gold coins sticking out
    const coinGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.015, 8);
    for (let i = 0; i < 3; i++) {
        const coin = new THREE.Mesh(coinGeo, goldMat);
        const ang = (i / 3) * Math.PI * 2;
        coin.position.set(Math.cos(ang) * 0.15, 0.48, Math.sin(ang) * 0.15);
        coin.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(coin);
    }
    return group;
}

function createItemModel(name) {
    if (!name) return createToolModel();
    // Try exact match first
    if (ITEM_MODEL_MAP[name]) return ITEM_MODEL_MAP[name]();
    // Try case-insensitive fallback
    const lowerName = name.toLowerCase();
    const mapKey = Object.keys(ITEM_MODEL_MAP).find(k => k.toLowerCase() === lowerName);
    if (mapKey) return ITEM_MODEL_MAP[mapKey]();

    return createToolModel();
}

function createThesaurusModel() {
    const group = new THREE.Group();

    // Thick leather cover
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.7 }); // Brown leather
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.2), coverMat);
    cover.position.y = 0.55;
    group.add(cover);

    // Page block (visible on the sides)
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfafae6, roughness: 0.9 });
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.175), pagesMat);
    pages.position.set(0.04, 0.55, 0);
    group.add(pages);

    // Gold emblem on cover
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 8), goldMat);
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(-0.1, 0.65, 0.11); // Front cover
    group.add(emblem);

    const line = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), goldMat);
    line.position.set(-0.1, 0.45, 0.11);
    group.add(line);

    return group;
}

function createDictionaryModel() {
    const group = new THREE.Group();
    // Blue leather cover
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x004c99, roughness: 0.7 });
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.22), coverMat);
    cover.position.y = 0.55;
    group.add(cover);

    // Page block
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfafae6, roughness: 0.9 });
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.05, 0.2), pagesMat);
    pages.position.set(0.04, 0.55, 0);
    group.add(pages);

    // Gold emblem
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const emblem = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), goldMat);
    emblem.scale.set(1.5, 2, 0.1);
    emblem.position.set(-0.1, 0.55, 0.115);
    group.add(emblem);

    return group;
}

function createSpellonomiconModel() {
    const group = new THREE.Group();
    // Obsidian cover (Reduced width by 50%)
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x1a001a, roughness: 0.4, metalness: 0.3 });
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.425, 1.15, 0.5), coverMat); // 0.85 -> 0.425
    cover.position.y = 0.57;
    group.add(cover);

    // Red pages (Reduced width by 50%)
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0x440000, roughness: 0.9 });
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.1, 0.45), pagesMat); // 0.8 -> 0.4
    pages.position.set(0.01, 0.57, 0); // Adjusted offset from 0.04 to 0.01
    group.add(pages);

    // Glowing eye
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), eyeMat);
    eye.position.set(-0.1, 0.6, 0.26);
    eye.scale.z = 0.1;
    group.add(eye);

    return group;
}

function createBigEraserModel() {
    const group = new THREE.Group();
    const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffadc0, roughness: 0.8 });
    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x2244aa, roughness: 0.5 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // Main Eraser Body (A large, vertical block)
    // Size: 0.8 wide, 1.4 tall, 0.4 deep
    const eraserGeo = new THREE.BoxGeometry(0.8, 1.4, 0.4);
    const eraser = new THREE.Mesh(eraserGeo, pinkMat);
    eraser.position.y = 0.7; // Perfectly align base to floor
    group.add(eraser);

    // Thick Cardboard Sleeve (wrapping the lower section)
    const sleeveGeo = new THREE.BoxGeometry(0.82, 0.8, 0.42);
    const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeve.position.y = 0.4;
    group.add(sleeve);

    // White Branding Stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.83, 0.15, 0.43), whiteMat);
    stripe.position.y = 0.55;
    group.add(stripe);

    // Final Pose for Shelf
    group.rotation.y = Math.PI / 10;
    group.rotation.x = -0.05; // Subtle lean back
    group.scale.setScalar(0.7); // Shrink 30%

    return group;
}

function createEdwardPencilHandsModel() {
    const group = new THREE.Group();
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }); // Black leather

    // Palm
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.2), gloveMat);
    palm.position.y = 0.2;
    group.add(palm);

    const pencilColors = [0xffcc00, 0x0088ff, 0xff0044, 0x00aa44, 0xaa00ff];
    const fingerPositions = [
        { x: -0.15, y: 0.4, z: 0.05, h: 0.25 }, // Index
        { x: -0.05, y: 0.42, z: 0.05, h: 0.28 }, // Middle
        { x: 0.05, y: 0.4, z: 0.05, h: 0.26 },  // Ring
        { x: 0.15, y: 0.35, z: 0.05, h: 0.22 }  // Pinky
    ];

    fingerPositions.forEach((pos, i) => {
        // Finger
        const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, pos.h, 8), gloveMat);
        finger.position.set(pos.x, pos.y, pos.z);
        group.add(finger);

        // Pencil attachment point (small metal ring)
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.set(pos.x, pos.y + pos.h / 2, pos.z);
        group.add(ring);

        // The Pencil
        const pColor = pencilColors[i];
        const pencilGroup = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), new THREE.MeshStandardMaterial({ color: pColor }));
        pencilGroup.add(body);
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), new THREE.MeshStandardMaterial({ color: 0xeed2aa }));
        tip.position.y = 0.25;
        pencilGroup.add(tip);
        const lead = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.03, 6), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        lead.position.y = 0.31;
        pencilGroup.add(lead);

        pencilGroup.position.set(pos.x, pos.y + pos.h / 2 + 0.2, pos.z);
        group.add(pencilGroup);
    });

    // Thumb
    const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.2, 8), gloveMat);
    thumb.position.set(0.24, 0.22, 0.05);
    thumb.rotation.z = -Math.PI / 3;
    group.add(thumb);

    // Thumb Pencil
    const thumbPencilGroup = new THREE.Group();
    const tBody = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), new THREE.MeshStandardMaterial({ color: pencilColors[4] }));
    thumbPencilGroup.add(tBody);
    const tTip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), new THREE.MeshStandardMaterial({ color: 0xeed2aa }));
    tTip.position.y = 0.25;
    thumbPencilGroup.add(tTip);
    const tLead = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.03, 6), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    tLead.position.y = 0.31;
    thumbPencilGroup.add(tLead);

    thumbPencilGroup.position.set(0.4, 0.35, 0.05);
    thumbPencilGroup.rotation.z = -Math.PI / 3;
    group.add(thumbPencilGroup);

    return group;
}

function createWoodenStoolModel(height = 1.0) {
    const group = new THREE.Group();
    // Darker, aged oak tone (Less saturated)
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.95, metalness: 0.05 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.5 });

    // Seat
    const seatGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16);
    const seat = new THREE.Mesh(seatGeo, woodMat);
    seat.position.y = height;
    group.add(seat);

    // Legs
    const legTopR = 0.03;
    const legBotR = 0.045; // Wider at bottom as requested
    const legGeo = new THREE.CylinderGeometry(legTopR, legBotR, height, 8);
    const legOffset = 0.26; // Moved closer to the edge (Seat R=0.32)
    const slant = 0.16; // Increased slant for stability feel
    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeo, woodMat);
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const lx = Math.cos(angle) * legOffset;
        const lz = Math.sin(angle) * legOffset;
        leg.position.set(lx, height / 2, lz);

        // Slant (Corrected: Bottom spreads OUTWARD for stability)
        leg.rotation.z = (lx > 0) ? slant : -slant;
        leg.rotation.x = (lz > 0) ? -slant : slant;
        group.add(leg);

        // Small metal rivet/joint cap at leg-seat connection
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.02, 8), metalMat);
        cap.position.set(lx * 0.9, height - 0.01, lz * 0.9);
        group.add(cap);
    }

    // Footrest ring for taller stools (Now using metalMat)
    if (height > 0.6) {
        const ringGeo = new THREE.TorusGeometry(legOffset * 0.9, 0.02, 8, 16);
        const ring = new THREE.Mesh(ringGeo, metalMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = height * 0.35;
        group.add(ring);
    }

    return group;
}

function createShortStoolModel() { return createWoodenStoolModel(0.5); }
function createMediumStoolModel() { return createWoodenStoolModel(1.0); }
function createTallStoolModel() { return createWoodenStoolModel(1.5); }
