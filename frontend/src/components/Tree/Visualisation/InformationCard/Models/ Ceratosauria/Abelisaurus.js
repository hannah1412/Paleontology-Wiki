/*
Author: Bambi the oviraptor (https://sketchfab.com/SammyTheCitipati)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/dinorauls-abelisaurus-69820a8031ce4b84acff8ec403f6114a
Title: Dinoraul's Abelisaurus
*/
import React, { useRef, useState, useEffect } from 'react'
import abeliScene from '../../../../../../../public/3d/Ceratosauria/abelisaurus.glb'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
const Abelisaurus = ({isRotating, setCurrentStage, currentStage, setOnZoom  }) => {
    const abeliRef= useRef();
    const { scene } = useGLTF(abeliScene); 
    const { gl, camera, viewport } = useThree();
    
    const [ isOnClick, setOnClick ] = useState();
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.0076;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
      const originalPos = abeliRef.current.position.clone();
          setOriginalPosition(originalPos);
        if (currentStage === 7) {
          setZoomIn(true);
          const newPos = new THREE.Vector3(0, -2, -5); // Adjust distance as needed
          abeliRef.current.position.copy(newPos);
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            abeliRef.current.position.copy(originalPosition);
          }
        }
      }, [currentStage]);
    
    useFrame((delta) => {

        const leftEdge = - (viewport.width / 3);
        const rightEdge = viewport.width / 3;

        // console.log(isRotating + 'rotating');
        if(isRotating && currentStage === null ){

            // chekcing reaching leftEdge
            // console.log(abeliRef.current.position.x);
            if(abeliRef.current.position.x <= leftEdge){
                console.log(`TREX hits left edge`)
                direction = 1;    //facing right edge 
                abeliRef.current.rotation.y = Math.PI/1.5;
            }
            abeliRef.current.position.x += speed * direction; 
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
        const intersects = raycaster.intersectObject(abeliRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(7);
            setOnZoom(true);
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
    <mesh ref={abeliRef} rotation={[0, 5, 0]} position={[ 10, 0, -6]} scale={[1, 1, 1]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Abelisaurus