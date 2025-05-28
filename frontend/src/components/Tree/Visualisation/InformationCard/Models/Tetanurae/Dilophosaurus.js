/*
Author: Efthalía Estasmalteadas (https://sketchfab.com/efthalia)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/high-poly-dilophosaurus-c01176efe1ea45b783e8f10531e89372
Title: High-Poly Dilophosaurus
*/
import React, { useRef, useState, useEffect } from 'react'
import dilphoScene from '../../../../../../../public/3d/Tetanurae/dilophosaurus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Dilophosaurus = ({isRotating, setCurrentStage, isCurrentStage, setOnZoom}) => {
    const dilphoRef = useRef();
    const { scene } = useGLTF(dilphoScene)
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.0051;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
        if (isCurrentStage === 12) {
          setZoomIn(true);
          const originalPos = dilphoRef.current.position.clone();
          setOriginalPosition(originalPos);
          dilphoRef.current.position.copy(new THREE.Vector3(0, 0, 2));
          dilphoRef.current.scale.copy( new THREE.Vector3(15,15, 15));
          dilphoRef.current.rotation.set(0.45, -5.073, 0)
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            dilphoRef.current.position.copy(originalPosition);
            dilphoRef.current.rotation.set(0, 17, 0)
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
        if(dilphoRef.current.position.x <= leftEdge){
            console.log(`TREX hits left edge`)
            direction = 1;    //facing right edge 
            dilphoRef.current.rotation.y = Math.PI/1.5;
        }
        dilphoRef.current.position.x += speed * direction; 
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
        const intersects = raycaster.intersectObject(dilphoRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(12);
            setOnZoom(true)
            
        }else{
            setCurrentStage(null)
            setOnZoom(false)
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
    <mesh ref={dilphoRef} position={[3, 0, 3]} scale={[15,15, 15]} rotation={[0, 17, 0]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Dilophosaurus