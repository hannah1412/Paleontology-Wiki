/*
Author: Sammy The Citipati (https://sketchfab.com/SammyTheCitipati)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/daz-studios-dinorauls-kentrosaurus-0054915aecc64459ad08cb7168829c29
Title: Daz studios & Dinoraul's Kentrosaurus
*/

import React, { useState, useRef, useEffect } from 'react'
import kentroScene from '../../../../../../../public/3d/Thyreophora/kentrosaurus.glb'
import { MeshDistortMaterial, useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Kentrosaurus = ({ isRotating, setCurrentStage, isCurrentStage, isOnZoom}) => {
    const kentroRef = useRef();
    const { scene } = useGLTF(kentroScene)
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);


    const speed = 0.04;
    let direction = -1.56; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
        if (isCurrentStage === 20) {
          setZoomIn(true);
          const originalPos = kentroRef.current.position.clone();
          setOriginalPosition(originalPos);
          const newPos = new THREE.Vector3(0, -2, -5); // Adjust distance as needed
          kentroRef.current.position.copy(new THREE.Vector3(0, -2, 0));

          kentroRef.current.scale.copy(new THREE.Vector3(2, 2, 2));

          kentroRef.current.rotation.copy(new THREE.Vector3(0, -10, 0));
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            kentroRef.current.position.copy(originalPosition);
            kentroRef.current.scale.copy(new THREE.Vector3(1.5, 1.5, 1.5))
          }
        }
      }, [isCurrentStage]);
    
    useFrame((delta) => {
        let time = 0.1;

        const leftEdge = - (viewport.width / 3);
        // console.log(`Edge: ${leftEdge/3}`)
        const rightEdge = viewport.width / 2;

        const offsetX = Math.sin(time) * 0.75;
        const offsetY = Math.cos(time) * 0.001;

        // console.log(isRotating + 'rotating');
        if(isRotating && isCurrentStage === null ){

            // chekcing reaching leftEdge
            if(kentroRef.current.position.x <= leftEdge){
                // console.log(`TREX hits left edge`)
                direction = 1;    //facing right edge 
                kentroRef.current.rotation.y = Math.PI/1.5;
            }else if(kentroRef.current.position.x >= rightEdge){
                direction = -1
                kentroRef.current.rotation.y = -(Math.PI/1.5);
            }
            time += 0.1
            kentroRef.current.position.x += speed * direction + offsetX;
            kentroRef.current.position.y += offsetY;

            time += 0.1

            // console.log(`TREX is on the move!`)
            // walkingPhase += speed * direction * 10;
            // TO DO : what happens when walking up to the edge of the screen
        }

        
    });
    
    const handleMouseOnClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const mouse = new THREE.Vector3();
        const raycaster = new THREE.Raycaster();

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Set raycaster origin and direction from camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections with objects
        const intersects = raycaster.intersectObject(kentroRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(20);
            isOnZoom(true);

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
    <mesh ref={kentroRef} position={[-7, -4, -2 ]} 
        rotation={[0, 2, 0]} scale={[1.5, 1.5, 1.5]}>
            <MeshDistortMaterial
                distort={0.4}
                metalness={0.9}
                
            />
        <primitive object={scene} />
    </mesh>
  )
}

export default Kentrosaurus