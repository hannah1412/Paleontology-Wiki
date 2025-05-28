/*
Author: Daniel Hudson (https://sketchfab.com/danielsamhudson)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/near-accurate-ceratosaurus-8068f3c7b8924def901ec4c1172b4cc2
Title: Near-Accurate Ceratosaurus
*/
import React, { useRef, useState, useEffect } from 'react'
import ceraScene from '../../../../../../../public/3d/Ceratosauria/near-accurate_ceratosaurus.glb'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
const Ceratosaurus = ({isRotating, currentStage, setCurrentStage, setOnZoom }) => {
    const ceraRef = useRef(); 
    const { scene } = useGLTF(ceraScene); 
    const { gl, camera, viewport } = useThree();
    
    const [ isOnClick, setOnClick ] = useState();
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.4;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
      const originalPos = ceraRef.current.position.clone();
          setOriginalPosition(originalPos);
        if (currentStage === 6) {
          setZoomIn(true);
          
          const newPos = new THREE.Vector3(0, -2, -5); // Adjust distance as needed
          ceraRef.current.position.set(3, 0, 0);
          ceraRef.current.scale.set(6, 6, 6)
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            ceraRef.current.position.copy(originalPosition);
          }
        }
      }, [currentStage]);
    
    useFrame((delta) => {

        const leftEdge = - (viewport.width / 3);
        const rightEdge = viewport.width / 3;

        // console.log(isRotating + 'rotating');
        if(isRotating && currentStage === null ){

          // chekcing reaching leftEdge
          // console.log(ceraRef.current.position.x);
          if(ceraRef.current.position.x <= leftEdge){
              console.log(`TREX hits left edge`)
              direction = 1;    //facing right edge 
              ceraRef.current.rotation.y = Math.PI/1.5;
          }
          ceraRef.current.position.x += speed * direction; 
          // console.log(`TREX is on the move!`)
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
        const intersects = raycaster.intersectObject(ceraRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(6);
            setOnZoom(true)
        }else{
          setCurrentStage(null);
          setOnZoom(false)
        }
    }

    useEffect(() => {
        const canvas = gl.domElement;
        canvas.addEventListener("click", handleMouseOnClick);
        // canvas.addEventListener("click", handleMouseClickOutside);
        return () => {
            canvas.removeEventListener("click", handleMouseOnClick);
        }
    }, [gl.domElement, isOnClick])

  return (
    <mesh position={[-10.23, -4, -4.76]} scale={[1, 1, 1]} rotation={[0, 39, 0]} ref={ceraRef}>
        <primitive object={scene}/> 
    </mesh>
  )
}

export default Ceratosaurus