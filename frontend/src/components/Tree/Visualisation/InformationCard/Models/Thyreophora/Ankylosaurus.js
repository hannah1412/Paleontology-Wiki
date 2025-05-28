
import React, { useRef, useState, useEffect} from 'react'
import ankylScene from '../../../../../../../public/3d/Thyreophora/hd_ankylosaurus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"
const Ankylosaurus = ({isRotating, setCurrentStage, isCurrentStage, isOnZoom}) => {
    const ankylRef = useRef();
    const { scene } = useGLTF(ankylScene)
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.04;
    let direction = 1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {

        if (isCurrentStage === 19) {
          setZoomIn(true);
          const originalPos = ankylRef.current.position.clone();
          setOriginalPosition(originalPos);
          ankylRef.current.position.copy(new THREE.Vector3(0, -2, -5));
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            ankylRef.current.position.copy(originalPosition);
          }
        }
      }, [isCurrentStage]);
    

    // ankyl's path
    useFrame((delta) => {

        let time = 0;

        const leftEdge = - (viewport.width / 2);
        const rightEdge = viewport.width / 2;

        const offsetX = Math.sin(time) * 0.75;
        const offsetY = Math.cos(time) * 0.001;

        if(isRotating && isCurrentStage === null ){

            // chekcing reaching leftEdge
            if(ankylRef.current.position.x <= leftEdge){
                direction = 1;    //facing right edge 
                ankylRef.current.rotation.y = Math.PI/1.2;
            }else if(ankylRef.current.position.x >= rightEdge){
                direction = -1
                ankylRef.current.rotation.y = -(Math.PI/1.5);
            }
            time += 0.1
            ankylRef.current.position.x += speed * direction + offsetX;
            ankylRef.current.position.y += offsetY;

            time += 0.1

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
        const intersects = raycaster.intersectObject(ankylRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(19);
            console.log("Kentro stage : 19")
            isOnZoom(true)
        
        }else{
            setCurrentStage(null)
            isOnZoom(false)
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
    <mesh ref={ankylRef} scale={[1.5, 1.5, 1.5]}
        position={[-4, 0, -6]} rotation={[0, 7, 0]}>
        <primitive object={scene} />
    </mesh>
  )
}

export default Ankylosaurus