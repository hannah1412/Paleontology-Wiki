/*
Author: hendrikReyneke (https://sketchfab.com/hendrikReyneke)
License: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
Source: https://sketchfab.com/3d-models/compsognathus-12d92eee414e46bbb81b0ef5ec4a4189
Title: Compsognathus
*/
import React, {useState, useEffect, useRef } from 'react'
import compsoScene from '../../../../../../../public/3d/Tetanurae/compsognathus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"
const Compsognathus = ({isRotating, setCurrentStage, isCurrentStage, setOnZoom}) => {
    const compsoRef = useRef(); 
    const { scene } = useGLTF(compsoScene);
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.007;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
        const originalPos = compsoRef.current.position.clone();
        setOriginalPosition(originalPos);
        if (isCurrentStage === 11) {
          setZoomIn(true);
          compsoRef.current.position.copy(new THREE.Vector3(0, -3, 1));
          compsoRef.current.scale.set(12, 12, 12) 
          compsoRef.current.rotation.set(0, -2.05, 0);
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            compsoRef.current.position.copy(originalPosition);
            compsoRef.current.rotation.set(0, -2.45, 0)
          }
        }
      }, [isCurrentStage]);
    
    useFrame((delta) => {

        const leftEdge = - (viewport.width / 3);
        console.log(`Edge: ${leftEdge/3}`)
        const rightEdge = viewport.width / 2;

        // console.log(isRotating + 'rotating');
        if(isRotating && isCurrentStage === null ){

        // chekcing reaching leftEdge
        console.log(compsoRef.current.position.x);
        if(compsoRef.current.position.x <= leftEdge){
            console.log(`TREX hits left edge`)
            direction = 1;    //facing right edge 
            compsoRef.current.rotation.y = Math.PI/1.5;
        }else{
          direction = -1;
          compsoRef.current.rotation.y = -(Math.PI/1.5);
        }
        compsoRef.current.position.x += speed * direction; 
        console.log(`TREX is on the move!`)
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
        const intersects = raycaster.intersectObject(compsoRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(11);
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
    <mesh ref={compsoRef} scale={[10, 10, 10]} position={[3.98, -2.98, 0]} rotation={[0, -2.45, 0]}
      castShadow>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Compsognathus