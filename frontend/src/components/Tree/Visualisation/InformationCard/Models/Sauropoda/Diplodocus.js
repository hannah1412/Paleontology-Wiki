/*
Author: hendrikReyneke (https://sketchfab.com/hendrikReyneke)
License: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
Source: https://sketchfab.com/3d-models/diplodocus-24a9f33e355b49b5983086415134128a
Title: Diplodocus
*/
import React, { useState, useRef, useEffect} from 'react'
import diploScene from '../../../../../../../public/3d/Sauropoda/diplodocus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Diplodocus = ({isRotating, setCurrentStage, isCurrentStage, setOnZoom}) => {
    const diploRef = useRef(); 
    const { scene } = useGLTF(diploScene)
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.05;
    let direction = 1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
      const originalPos = diploRef.current.position.clone();
          setOriginalPosition(originalPos);
        if (isCurrentStage === 14) {
          setZoomIn(true);
          const newPos = new THREE.Vector3(-1, -1, 3); // Adjust distance as needed
          diploRef.current.position.copy(newPos);
          diploRef.current.scale.set(2.45, 2.45, 2.45)
          diploRef.current.rotation.copy(new THREE.Vector3(0, 2, 0))
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            diploRef.current.position.copy(originalPosition);
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
            // console.log(diploRef.current.position.x);
            if(diploRef.current.position.x <= leftEdge){
                // console.log(`TREX hits left edge`)
                // direction = 1;    //facing right edge 
                diploRef.current.rotation.y = Math.PI/1.5;
            }
            diploRef.current.position.x += speed * direction; 
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
        const intersects = raycaster.intersectObject(diploRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(14);
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
    <mesh ref={diploRef} position={[-1, -3, -2.65]} scale={[10, 10, 10]} rotation={[0, -5, 0]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Diplodocus