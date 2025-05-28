/*
Author: Indominus Rex (https://sketchfab.com/lentoneulb)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/dr-majungasaurus-7b62b90793714fd4afea7e1093ee6953
Title: DR Majungasaurus
*/
import React, { useState, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import majungaScene from '../../../../../../../public/3d/Ceratosauria/majungasaurus.glb'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const Majungasaurus = ({isRotating, setCurrentStage, currentStage, setOnZoom }) => {
    const majungaRef = useRef(); 
    const { scene } = useGLTF(majungaScene); 
    const { gl, camera, viewport } = useThree();
    
    const [ isOnClick, setOnClick ] = useState();

    const speed = 0.04;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 
    
    useFrame((delta) => {

        const leftEdge = - (viewport.width / 3);
        const rightEdge = viewport.width / 3;

        // console.log(isRotating + 'rotating');
        if(isRotating && currentStage === null ){

        // chekcing reaching leftEdge
        // console.log(majungaRef.current.position.x);
        if(majungaRef.current.position.x <= leftEdge){
            console.log(`TREX hits left edge`)
            direction = 1;    //facing right edge 
            majungaRef.current.rotation.y = Math.PI/1.5;
        }
        majungaRef.current.position.x += speed * direction; 
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
        const intersects = raycaster.intersectObject(majungaRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(8);
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
    <mesh ref={majungaRef} position={[2, -4, -2.87]} scale={[1, 1, 1]} rotation={[0, -39, 0]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Majungasaurus