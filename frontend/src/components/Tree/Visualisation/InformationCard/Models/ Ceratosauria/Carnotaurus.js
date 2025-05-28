/*
Author: Sammy The Citipati (https://sketchfab.com/SammyTheCitipati)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/dinorauls-carnotaurus-30b8aa39f78f4167912044d89afbf1f2
Title: Dinoraul's Carnotaurus
*/
import React, { useRef, useState, useEffect } from 'react'
import carnoScene from '../../../../../../../public/3d/Ceratosauria/carnotaurus.glb'
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
const Carnotaurus = ({isRotating, setCurrentStage, currentStage, setOnZoom }) => {
    const carnoRef = useRef(); 
    const { scene } = useGLTF(carnoScene);
    const { gl, camera, viewport } = useThree();
    
    const [ isOnClick, setOnClick ] = useState();
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.0123;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
        if (currentStage === 9) {
          setZoomIn(true);
          const originalPos = carnoRef.current.position.clone();
          setOriginalPosition(originalPos);
          const newPos = new THREE.Vector3(0, -2, -5); // Adjust distance as needed
          carnoRef.current.position.copy(newPos);
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            carnoRef.current.position.copy(originalPosition);
            carnoRef.current.position.set(-6.76, 0,-1)
          }
        }
      }, [currentStage]);
    
    useFrame((delta) => {

        const leftEdge = - (viewport.width / 3);
        const rightEdge = viewport.width / 3;

        // console.log(isRotating + 'rotating');
        if(isRotating && currentStage === null ){

        // chekcing reaching leftEdge
        // console.log(carnoRef.current.position.x);
        if(carnoRef.current.position.x <= leftEdge){
            console.log(`TREX hits left edge`)
            direction = 1;    //facing right edge 
            carnoRef.current.rotation.y = Math.PI/1.5;
        }
        carnoRef.current.position.x += speed * direction; 
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
        const intersects = raycaster.intersectObject(carnoRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(9);
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
            // canvas.removeEventListener("click", handleMouseClickOutside);
        }
    }, [gl.domElement, isOnClick])
  return (
    <mesh ref={carnoRef} rotation={[0, -5, 0]} position={[-4, 0,-1]} scale={[1, 1, 1 ]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Carnotaurus