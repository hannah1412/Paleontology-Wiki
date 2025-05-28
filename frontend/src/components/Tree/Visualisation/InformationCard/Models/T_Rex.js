/*
Author: seth the yutyrannus (https://sketchfab.com/slang107123456789)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/tyranno-a54f6868a63e4c729556d387aa090a43
Title: TYRANNO
*/

import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import tRexScene from '../../../../../../public/3d/t-rex.glb'
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const TRex = ({isRotating,isCurrentStage, setCurrentStage, ...props}) => {
  const tRexRef = useRef();
  const { scene, animations } = useGLTF(tRexScene);
  const { gl, camera, viewport } = useThree();

  const [ isOnClick, setOnClick ] = useState(false); 
  const [originalPosition, setOriginalPosition] = useState(null);
  const [ isZoomIn, setZoomIn ] = useState(false);

  // let mixer = new THREE.AnimationMixer(scene);
  // animations.forEach((clip) => {
  //   const action = mixer.clipAction(clip);
  //   // action.play();
  //   if(clip.name === 'Walk'){
  //     action.play();
  //     // console.log("Walk is playing");
  //   }
  // });

  const speed = 0.04;
  let direction = -1; // Direction of movement 1-right (-1)- left 
  let walkingPhase = 0; 

  useEffect(() => {
    if (isCurrentStage === 2) {
      setZoomIn(true);
      const originalPos = tRexRef.current.position.clone();
      setOriginalPosition(originalPos);
      const newPos = new THREE.Vector3(0, -0.5, 3); 
      tRexRef.current.position.copy(newPos);
      
    } else {
      setZoomIn(false);
      if (originalPosition) {
        tRexRef.current.position.copy(originalPosition);
      }
    }
  }, [isCurrentStage]);
  
  useFrame((delta) => {
    // mixer.update(delta);

    const leftEdge = - (viewport.width / 3);
    console.log(`Edge: ${leftEdge/3}`)
    const rightEdge = viewport.width / 2;

    // console.log(isRotating + 'rotating');
    if(isRotating && isCurrentStage === null ){

      // chekcing reaching leftEdge
      console.log(tRexRef.current.position.x);
      if(tRexRef.current.position.x <= leftEdge){
        console.log(`TREX hits left edge`)
        direction = 1;    //facing right edge 
        tRexRef.current.rotation.y = Math.PI/1.5;
      }
      tRexRef.current.position.x += speed * direction; 
      console.log(`TREX is on the move!`)
      walkingPhase += speed * direction * 10;
      // TO DO : what happens when walking up to the edge of the screen
    }
  });
  
  const handleMouseOnClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Set raycaster origin and direction from camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with objects
    const intersects = raycaster.intersectObject(tRexRef.current);
    
    // Check if any objects are intersected
    if (intersects.length > 0) {
        // Trigger appropriate event handler for the intersected object
        // handleObjectClick(intersects[0].object);
        setCurrentStage(2);
        for (let i = 0; i < intersects.length; i++) {
            const distance = intersects[i].distance;
            console.log(`Intersection ${i + 1}: Distance: ${distance}`);
        }
    }
  }

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("click", handleMouseOnClick);
    // canvas.addEventListener("click", handleMouseClickOutside);
    return () => {
      canvas.removeEventListener("click", handleMouseOnClick);
      // canvas.removeEventListener("click", handleMouseClickOutside);
    }
  }, [gl.domElement, isOnClick])

  return (
    <mesh position={[3, -0.920 , 1.820]} scale={[0.3, 0.3, 0.3]} rotation={[0.3, 0, 0]} ref={tRexRef} {...props}>
      <primitive ref={tRexRef} object={scene}/>
    </mesh>
  );
}

export default TRex;