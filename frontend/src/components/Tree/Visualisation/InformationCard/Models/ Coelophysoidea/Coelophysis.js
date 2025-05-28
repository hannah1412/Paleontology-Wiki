import React, { useRef, useState, useEffect } from 'react'
import coelScene from '../../../../../../../public/3d/Coelophysoidea/coelophysis.glb'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const Coelophysis = ({isRotating, isCurrentStage, setCurrentStage, setOnZoom }) => {
    const coelRef = useRef();
    const { scene } = useGLTF(coelScene);
    const { gl, camera, viewport } = useThree();
    
    // detect mouse click 
    const [ isOnClick, setOnClick ] = useState();
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.0085;
    let direction = -1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
        if (isCurrentStage === 5) {
          setZoomIn(true);
          const originalPos = coelRef.current.position.clone();
          setOriginalPosition(originalPos);
          const newPos = new THREE.Vector3(3, -3, 1); 
          coelRef.current.position.copy(newPos);
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            coelRef.current.position.copy(originalPosition);
            coelRef.current.scale.copy(new THREE.Vector3(3, 3, 3))
          }
        }
      }, [isCurrentStage]);
    
    useFrame((delta) => {

        const leftEdge = - (viewport.width / 3);
        const rightEdge = viewport.width / 3;

        // console.log(isRotating + 'rotating');
        if(isRotating && isCurrentStage === null ){

        // chekcing reaching leftEdge
        // console.log(coelRef.current.position.x);
        if(coelRef.current.position.x <= leftEdge){
            console.log(`TREX hits left edge`)
            direction = 1;    //facing right edge 
            coelRef.current.rotation.y = Math.PI/1.5;
        }
        coelRef.current.position.x += speed * direction; 
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
        const intersects = raycaster.intersectObject(coelRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(5);
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
    <mesh position={[6.54, -3, 0]} scale={[3, 3, 3]} rotation={[0, 5, 0]}
    ref={coelRef} >
        <primitive object={scene}/>
    </mesh>
  )
}

export default Coelophysis