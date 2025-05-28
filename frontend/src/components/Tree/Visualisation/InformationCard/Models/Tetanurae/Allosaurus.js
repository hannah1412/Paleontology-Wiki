/*
Author: seth the yutyrannus (https://sketchfab.com/slang107123456789)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/allosaurus-02e651e39fed47bbaec0aa0546f17fd3
Title: Allosaurus
*/
import React, { useRef, useState, useEffect } from 'react'
import alloScene from '../../../../../../../public/3d/Tetanurae/allosaurus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Allosaurus = ({isRotating, setCurrentStage, isCurrentStage, setOnZoom}) => {
    const alloRef = useRef();
    const { scene } = useGLTF(alloScene)
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.051;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
        if (isCurrentStage === 10) {
          setZoomIn(true);
          const originalPos = alloRef.current.position.clone();
          setOriginalPosition(originalPos);
          alloRef.current.position.copy(new THREE.Vector3(0, -4, -2));
          alloRef.current.scale.copy(new THREE.Vector3(0.6, 0.6, 0.6));
          alloRef.current.rotation.copy(new THREE.Vector3(0, -14.02, 0))
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            alloRef.current.position.copy(originalPosition);
            alloRef.current.scale.copy(new THREE.Vector3(1,1, 1))
          }
        }
      }, [isCurrentStage]);
    
    useFrame((delta) => {
        let time = 0.1;
        const leftEdge = - (viewport.width / 3);
        // console.log(`Edge: ${leftEdge/3}`)
        const rightEdge = viewport.width / 2;

        // console.log(isRotating + 'rotating');
        if(isRotating && isCurrentStage === null ){

            // chekcing reaching leftEdge
            // console.log(alloRef.current.position.x);
            if(alloRef.current.position.x <= leftEdge){
                // console.log(`TREX hits left edge`)
                direction = 1;    //facing right edge 
                alloRef.current.rotation.y = Math.PI/1.5;
                
            }
            alloRef.current.position.x += speed * direction; 
            alloRef.current.position.z += 0.01;
            time  += 0.1;
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
        const intersects = raycaster.intersectObject(alloRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(10);
            setOnZoom(true);
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
    <mesh ref={alloRef} position={[-20, -10, -15]} rotation={[0, 2, 0]} scale={[1, 1, 1]}>
        <primitive object={scene} />
    </mesh>
  )
}

export default Allosaurus