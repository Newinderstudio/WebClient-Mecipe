import * as THREE from "three";

/**
 * 기존 머터리얼을 PhongMaterial로 변환하면서 기존 속성들을 상속받습니다.
 * @param material 변환할 머터리얼
 * @returns 새로운 PhongMaterial
 */
export function convertToPhongMaterial(material: THREE.Material): THREE.MeshPhongMaterial {
    const phongMaterial = new THREE.MeshPhongMaterial();
    
    // 기본 속성들 상속
    phongMaterial.name = material.name;
    phongMaterial.opacity = material.opacity;
    phongMaterial.transparent = material.transparent;
    phongMaterial.alphaTest = material.alphaTest;
    phongMaterial.side = material.side;
    phongMaterial.vertexColors = material.vertexColors;
    phongMaterial.visible = material.visible;
    
    // 텍스처 맵들 상속 - 타입 안전하게 처리
    const materialWithMaps = material as THREE.Material & {
        [key: string]: unknown;
    };
    
    console.log('Converting material:', material.name, 'Type:', material.type);
    console.log('Material properties:', {
        map: materialWithMaps.map,
        color: materialWithMaps.color,
        transparent: material.transparent,
        opacity: material.opacity
    });
    
    // Diffuse map (메인 텍스처) - 가장 중요!
    if (materialWithMaps.map && materialWithMaps.map instanceof THREE.Texture) {
        console.log('Found texture map:', materialWithMaps.map);
        phongMaterial.map = materialWithMaps.map;
        
        // 텍스처 설정 복사
        phongMaterial.map.wrapS = materialWithMaps.map.wrapS || THREE.RepeatWrapping;
        phongMaterial.map.wrapT = materialWithMaps.map.wrapT || THREE.RepeatWrapping;
        phongMaterial.map.flipY = materialWithMaps.map.flipY;
        phongMaterial.map.generateMipmaps = materialWithMaps.map.generateMipmaps;
        
        if (materialWithMaps.map.repeat) {
            phongMaterial.map.repeat.copy(materialWithMaps.map.repeat);
        }
        if (materialWithMaps.map.offset) {
            phongMaterial.map.offset.copy(materialWithMaps.map.offset);
        }
        if (materialWithMaps.map.center) {
            phongMaterial.map.center.copy(materialWithMaps.map.center);
        }
        if (materialWithMaps.map.rotation) {
            phongMaterial.map.rotation = materialWithMaps.map.rotation;
        }
        
        console.log('Applied texture settings:', {
            wrapS: phongMaterial.map.wrapS,
            wrapT: phongMaterial.map.wrapT,
            repeat: phongMaterial.map.repeat,
            offset: phongMaterial.map.offset
        });
    } else {
        console.log('No texture map found, using color only');
    }
    
    // Normal map
    if (materialWithMaps.normalMap && materialWithMaps.normalMap instanceof THREE.Texture) {
        phongMaterial.normalMap = materialWithMaps.normalMap;
        if (materialWithMaps.normalScale && materialWithMaps.normalScale instanceof THREE.Vector2) {
            phongMaterial.normalScale = materialWithMaps.normalScale;
        }
    }
    
    // Bump map
    if (materialWithMaps.bumpMap && materialWithMaps.bumpMap instanceof THREE.Texture) {
        phongMaterial.bumpMap = materialWithMaps.bumpMap;
        if (typeof materialWithMaps.bumpScale === 'number') {
            phongMaterial.bumpScale = materialWithMaps.bumpScale;
        }
    }
    
    // Specular map
    if (materialWithMaps.specularMap && materialWithMaps.specularMap instanceof THREE.Texture) {
        phongMaterial.specularMap = materialWithMaps.specularMap;
    }
    
    // Emissive map
    if (materialWithMaps.emissiveMap && materialWithMaps.emissiveMap instanceof THREE.Texture) {
        phongMaterial.emissiveMap = materialWithMaps.emissiveMap;
    }
    
    // Alpha map
    if (materialWithMaps.alphaMap && materialWithMaps.alphaMap instanceof THREE.Texture) {
        phongMaterial.alphaMap = materialWithMaps.alphaMap;
    }
    
    // Light map
    if (materialWithMaps.lightMap && materialWithMaps.lightMap instanceof THREE.Texture) {
        phongMaterial.lightMap = materialWithMaps.lightMap;
        if (typeof materialWithMaps.lightMapIntensity === 'number') {
            phongMaterial.lightMapIntensity = materialWithMaps.lightMapIntensity;
        }
    }
    
    // AO map
    if (materialWithMaps.aoMap && materialWithMaps.aoMap instanceof THREE.Texture) {
        phongMaterial.aoMap = materialWithMaps.aoMap;
        if (typeof materialWithMaps.aoMapIntensity === 'number') {
            phongMaterial.aoMapIntensity = materialWithMaps.aoMapIntensity;
        }
    }
    
    // Displacement map
    if (materialWithMaps.displacementMap && materialWithMaps.displacementMap instanceof THREE.Texture) {
        phongMaterial.displacementMap = materialWithMaps.displacementMap;
        if (typeof materialWithMaps.displacementScale === 'number') {
            phongMaterial.displacementScale = materialWithMaps.displacementScale;
        }
        if (typeof materialWithMaps.displacementBias === 'number') {
            phongMaterial.displacementBias = materialWithMaps.displacementBias;
        }
    }
    
    // 색상 속성들 상속
    if (materialWithMaps.color && materialWithMaps.color instanceof THREE.Color) {
        phongMaterial.color.copy(materialWithMaps.color);
        console.log('Applied color:', phongMaterial.color);
    } else {
        // 기본 색상 설정 (흰색)
        phongMaterial.color.setHex(0xffffff);
        console.log('Set default white color');
    }
    
    if (materialWithMaps.emissive && materialWithMaps.emissive instanceof THREE.Color) {
        phongMaterial.emissive.copy(materialWithMaps.emissive);
    }
    
    if (materialWithMaps.specular && materialWithMaps.specular instanceof THREE.Color) {
        phongMaterial.specular.copy(materialWithMaps.specular);
    }
    
    // PhongMaterial 특화 속성들 설정
    if (typeof materialWithMaps.shininess === 'number') {
        phongMaterial.shininess = materialWithMaps.shininess;
    } else {
        phongMaterial.shininess = 30; // 기본값
    }
    
    if (typeof materialWithMaps.wireframe === 'boolean') {
        phongMaterial.wireframe = materialWithMaps.wireframe;
    }
    
    if (typeof materialWithMaps.wireframeLinewidth === 'number') {
        phongMaterial.wireframeLinewidth = materialWithMaps.wireframeLinewidth;
    }
    
    // 그레이스케일 효과 (필터를 통한 처리)
    if (materialWithMaps.defines && typeof materialWithMaps.defines === 'object' && 'GRAYSCALE' in materialWithMaps.defines) {
        console.log('Grayscale effect detected in material:', material.name);
    }
    
    phongMaterial.needsUpdate = true;
    
    console.log('Final PhongMaterial:', {
        name: phongMaterial.name,
        color: phongMaterial.color,
        map: phongMaterial.map,
        transparent: phongMaterial.transparent,
        opacity: phongMaterial.opacity
    });
    
    return phongMaterial;
}

/**
 * 씬의 모든 머터리얼을 PhongMaterial로 변환합니다.
 * @param scene 변환할 씬
 * @returns 변환된 머터리얼들의 배열
 */
export function convertSceneMaterialsToPhong(scene: THREE.Group): THREE.MeshPhongMaterial[] {
    const convertedMaterials: THREE.MeshPhongMaterial[] = [];
    const materialMap = new Map<string, THREE.MeshPhongMaterial>(); // 중복 방지용
    
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
            const originalMaterial = child.material;
            const materialKey = originalMaterial.uuid;
            
            // 이미 변환된 머터리얼이 있다면 재사용
            if (materialMap.has(materialKey)) {
                child.material = materialMap.get(materialKey)!;
                return;
            }
            
            // 새로운 PhongMaterial로 변환
            const phongMaterial = convertToPhongMaterial(originalMaterial);
            materialMap.set(materialKey, phongMaterial);
            child.material = phongMaterial;
            convertedMaterials.push(phongMaterial);
        }
    });
    
    return convertedMaterials;
}