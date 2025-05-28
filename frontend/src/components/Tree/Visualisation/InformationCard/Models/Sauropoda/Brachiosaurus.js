/*
Author: CGreature (https://sketchfab.com/CGreature)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/brachiosaurus-877612f01ccb41bd86f217a56d2388e4
Title: Brachiosaurus
*/
import React, { useState, useRef, useEffect } from 'react'
import brachioScene from '../../../../../../../public/3d/Sauropoda/brachiosaurus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Brachiosaurus = ({isRotating, setCurrentStage, isCurrentStage, setOnZoom}) => {
    const brachioRef = useRef(); 
    const { scene } = useGLTF(brachioScene);
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.0096;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
      const originalPos = brachioRef.current.position.clone();
        setOriginalPosition(originalPos);
        if (isCurrentStage === 16) {
          setZoomIn(true);
          const newPos = new THREE.Vector3(2, -3,1); // Adjust distance as needed
          brachioRef.current.position.copy(newPos);
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            brachioRef.current.position.copy(originalPosition);
            brachioRef.current.scale.set(0.8, 0.8, 0.8)
          }
        }
      }, [isCurrentStage]);
    
    useFrame((delta) => {

        const leftEdge = - (viewport.width / 3);
        // console.log(`Edge: ${leftEdge/3}`)
        const rightEdge = viewport.width / 2;

        // console.log(isRotating + 'rotating');
        if(isRotating && isCurrentStage === null ){

            // chekcing reaching leftEdge
            // console.log(brachioRef.current.position.x);
            if(brachioRef.current.position.x <= leftEdge){
                // console.log(`TREX hits left edge`)
                direction = 1;    //facing right edge 
                brachioRef.current.rotation.y = Math.PI/1.5;
            }else if(brachioRef.current.position.x >= rightEdge){
              direction = -1;
              brachioRef.current.rotation.y = Math.PI/0.03;
            }
            brachioRef.current.position.x += speed * direction; 
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
        const intersects = raycaster.intersectObject(brachioRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(16);
            setOnZoom(true);
        }else{
          setCurrentStage(null);
          setOnZoom(false);
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
    <mesh ref={brachioRef} scale={[0.8, 0.8, 0.8]} position={[6, -1, -2]} rotation={[0, 5, 0]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Brachiosaurus