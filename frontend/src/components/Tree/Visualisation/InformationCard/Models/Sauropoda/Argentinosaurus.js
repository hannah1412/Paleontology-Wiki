/*
Author: liendre (https://sketchfab.com/liendre)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/argentinosaurus-0a50ca2d92d145e3bd140371e1a9b774
Title: Argentinosaurus
*/
import React, { useRef, useState, useEffect } from 'react'
import argenScene from '../../../../../../../public/3d/Sauropoda/argentinosaurus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Argentinosaurus = ({isRotating, setCurrentStage, isCurrentStage, setOnZoom}) => {
    const argenRef = useRef(); 
    const { scene } = useGLTF(argenScene);
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.0097;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 
    
    useEffect(() => {
      const originalPos = argenRef.current.position.clone();
      setOriginalPosition(originalPos);
        if (isCurrentStage === 15) {
            // console.log(`currentStage ARGEN: ${isCurrentStage}`)
          setZoomIn(true);
          const newPos = new THREE.Vector3(0, -3, 1); // Adjust distance as needed
          argenRef.current.position.copy(newPos);
          argenRef.current.rotation.set(0, 0, 0);
          
        } else{
            console.log(`Gets to undefined stage`)
            setZoomIn(false);
          if (originalPosition) {
            argenRef.current.position.copy(originalPosition);
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
            console.log(argenRef.current.position.x);
            if(argenRef.current.position.x <= leftEdge){
                // console.log(`TREX hits left edge`)
                direction = 1;    //facing right edge 
                argenRef.current.rotation.y = Math.PI/1.5;
            }else if(argenRef.current.position.x >=rightEdge){
              direction = -1;
              argenRef.current.rotation.y = (Math.PI/2.5);
            }

            argenRef.current.position.x += speed * direction; 
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
        const intersects = raycaster.intersectObject(argenRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(15);
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
    <mesh ref={argenRef} position={[9, -6, -4]} scale={[1, 1, 1]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Argentinosaurus