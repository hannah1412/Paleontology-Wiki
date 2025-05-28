/*
Author: U.A.C.WAD (https://sketchfab.com/hilalarican23)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/nodosaurus-d59c66ab353942d0a54db1c4439f3be9
Title: Nodosaurus
*/

import React, { useState, useRef, useEffect} from 'react'
import nodoScene from '../../../../../../../public/3d/Thyreophora/nodosaurus.glb'
import { MeshDistortMaterial, useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Nodosaurus = ({isRotating, setCurrentStage, isCurrentStage}) => {
    const nodoRef = useRef();
    const { scene } = useGLTF(nodoScene)
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);


    const speed = 0.04;
    let direction = -1.98; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 
    
    useEffect(() => {
        const originalPos = nodoRef.current.position.clone();
        setOriginalPosition(originalPos);
        if (isCurrentStage === 21) {
          setZoomIn(true);
         // Adjust distance as needed
          nodoRef.current.position.copy(new THREE.Vector3(0, -2, -5));
          nodoRef.current.rotation.copy(new THREE.Vector3(0, -5.6, 0));
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            nodoRef.current.position.copy(originalPosition);
            
          }
        }
      }, [isCurrentStage]);

    // dinos movements 
    useFrame((delta) => {
        let time = 0;

        const leftEdge = - (viewport.width / 3);
        const rightEdge = viewport.width / 2;


        const offsetX = Math.sin(time) * 0.75;
        const offsetY = Math.cos(time) * 0.001;
        
        // console.log(isRotating + 'rotating');
        if(isRotating && isCurrentStage === null ){

            // chekcing reaching leftEdge
    
            if(nodoRef.current.position.x <= leftEdge){
                // console.log(`TREX hits left edge`)
                direction = 1;    //facing right edge 
                nodoRef.current.rotation.y = Math.PI/1.5;
            }else if(nodoRef.current.position.x >= rightEdge){
                direction = -1
                nodoRef.current.rotation.y = -(Math.PI/1.5);
            }
            time += 0.1
            nodoRef.current.position.x += speed * direction + offsetX;
            nodoRef.current.position.y += offsetY;

            time += 0.1
            // console.log(`TREX is on the move!`)
            walkingPhase += speed * direction * 10;
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
        const intersects = raycaster.intersectObject(nodoRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(21);
            console.log("Kentro stage : 21")
        }else{
            setCurrentStage(null)
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
    <mesh ref={nodoRef} position={[25, -10, -20]} rotation={[0, -2.05, 0]} scale={[1, 1, 1]}>
        <MeshDistortMaterial
                distort={0.7}
                metalness={0.2}
                
            />
        <primitive object={scene} />
    </mesh>
  )
}

export default Nodosaurus