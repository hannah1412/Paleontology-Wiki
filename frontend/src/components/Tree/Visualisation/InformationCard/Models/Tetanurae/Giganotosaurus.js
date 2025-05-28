import React, { useState, useEffect, useRef } from 'react'
import giganScene  from '../../../../../../../public/3d/Tetanurae/giganotosaurus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Giganotosaurus = ({isRotating, setCurrentStage, isCurrentStage, setOnZoom }) => {
    const giganRef = useRef(); 
    const { scene } = useGLTF(giganScene)
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.0051;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    
    useEffect(() => {
      const originalPos = giganRef.current.position.clone();
      setOriginalPosition(originalPos);
        if (isCurrentStage === 13) {
          setZoomIn(true);
          
          giganRef.current.position.copy(new THREE.Vector3(0, -1, 2));
          giganRef.current.rotation.set(0, -4.03, 0)
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            giganRef.current.position.copy(originalPosition);
            // giganRef.current.rotation.set(0.32, -10.45, 0);
          }
        }
      }, [isCurrentStage]);    
    
    useFrame((delta) => {
        let time = 0.1;
        const leftEdge = - (viewport.width / 3);
        const rightEdge = viewport.width / 2;

        const offsetX = Math.sin(time) * 0.75;
        const offsetY = Math.cos(time) * 0.001;

        // console.log(isRotating + 'rotating');
        if(isRotating && isCurrentStage === null ){

          // chekcing reaching leftEdge
          // console.log(giganRef.current.position.x);
          if(giganRef.current.position.x <= leftEdge){
              // console.log(`TREX hits left edge`)
              direction = 1;    //facing right edge 
              giganRef.current.rotation.y = Math.PI/0.02;
          }
          // giganRef.current.position.x += speed * direction; 
          // console.log(`TREX is on the move!`)
          giganRef.current.position.x += speed * direction;
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
        const intersects = raycaster.intersectObject(giganRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(13);
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
    <mesh ref={giganRef}
    castShadow rotation={[0.32, 10.45, 0]} scale={[0.3, 0.3, 0.3]} position={[-5.86, -1.04, 0]}>
        <primitive object={scene}/> 
    </mesh>
  )
}

export default Giganotosaurus