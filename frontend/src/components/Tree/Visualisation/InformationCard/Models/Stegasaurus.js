/*
Author: Ferocious Industries (https://sketchfab.com/ferociousindustries.matthias)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/pbr-stegasaurus-animated-ec254ea1554941fe8a131f62db0faf3d
Title: PBR Stegasaurus (Animated)
*/
import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three'
const Stegasaurus = ({ isRotating, setIsRotating, isCurrentStage, setCurrentStage,  ...props }) => {
  const group = useRef();
  const { scene,  animations } = useGLTF("/3d/pbr_stegasaurus_animated.glb");
  const { gl, camera } = useThree();

  const [isOnClick, setOnClick] = useState(false);
  const [originalPosition, setOriginalPosition] = useState(null);
  const [ isZoomIn, setZoomIn ] = useState(false);

  const speed = 0.04; // Adjust as needed
  let direction = 1; // Direction of movement
  let walkingPhase = 0; // Used for simulating walking animation

  // let mixer = new THREE.AnimationMixer(scene);
  // animations.forEach((clip) => {
  //   const action = mixer.clipAction(clip);
  //   action.play();
  // })

  useEffect(() => {
    if (isCurrentStage === 1) {
      setZoomIn(true);
      const originalPos = group.current.position.clone();
      setOriginalPosition(originalPos);
      const newPos = new THREE.Vector3(0, -2, -5); // Adjust distance as needed
      group.current.position.copy(newPos);
      
    } else {
      setZoomIn(false);
      if (originalPosition) {
        group.current.position.copy(originalPosition);
      }
    }
  }, [isCurrentStage]);


  useFrame((_, delta) => {
      // mixer.update(delta);
      if(isRotating && isCurrentStage === null ){
        group.current.position.x += speed * direction; 

        walkingPhase += speed * direction * 10;
        // TO DO : what happens when walking up to the edge of the screen
      }
      
      // rotation for zoomed in Stega
      if(isZoomIn && isCurrentStage === 1){
        group.current.rotation.y += 0.0001 * delta;
      }
  });

  // TO DO: hover effect on dino 

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
    const intersects = raycaster.intersectObject(group.current);
    
    // Check if any objects are intersected
    if (intersects.length > 0) {
        // Trigger appropriate event handler for the intersected object
        // handleObjectClick(intersects[0].object);
        setCurrentStage(1);
        // group.current.position.z += 2;
        // for (let i = 0; i < intersects.length; i++) {
        //     const distance = intersects[i].distance;
        //     console.log(`Intersection ${i + 1}: Distance: ${distance}`);
        // }
    }else{
      setCurrentStage(null);
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
    <>
      <mesh ref={group} {...props}>
        <primitive object={scene} />
      </mesh>
    </>
  );
};


export default Stegasaurus;
