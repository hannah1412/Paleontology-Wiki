import React, { useRef, useState, useEffect} from 'react'
import brontoScene from '../../../../../../../public/3d/Sauropoda/brontosaurus.glb'
import { useGLTF } from "@react-three/drei";
import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"

const Brontosaurus = ({isRotating, setCurrentStage, isCurrentStage, setOnZoom }) => {
    const brontoRef = useRef(); 
    const { scene } = useGLTF(brontoScene)
    const { gl, camera, viewport } = useThree();

    const [ isOnClick, setOnClick ] = useState(false); 
    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);

    const speed = 0.005;
    let direction = 1; // Direction of movement 1-right (-1)- left 
    let walkingPhase = 0; 

    useEffect(() => {
      const originalPos = brontoRef.current.position.clone();
          setOriginalPosition(originalPos);
        if (isCurrentStage === 17) {
          setZoomIn(true);
          const newPos = new THREE.Vector3(0, -1.01, 3); 
          brontoRef.current.position.copy(newPos);
          // const newScale = new THREE.Vector3(13, 13, 13);
          brontoRef.current.scale.set(7, 7, 7)
          brontoRef.current.rotation.set(0,-18, 0)
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            brontoRef.current.position.copy(originalPosition);
            brontoRef.current.scale.copy(new THREE.Vector3(5, 5, 5));
          }
        }
      }, [isCurrentStage]);
    
    useFrame((delta) => {

        const leftEdge = - (viewport.width /5);
        // console.log(`Edge: ${leftEdge/3}`)
        const rightEdge = viewport.width /5;

        // console.log(isRotating + 'rotating');
        if(isRotating && isCurrentStage === null ){

          // chekcing reaching leftEdge
          // console.log(brontoRef.current.position.x);
          if(brontoRef.current.position.x <= leftEdge){
              direction = -1;    //facing right edge 
              brontoRef.current.rotation.y = Math.PI/1.5;
          }else if(brontoRef.current.position.x >=rightEdge){
            direction = -1; 
            brontoRef.current.rotation.y = Math.PI/1.5;
          }
          brontoRef.current.position.x += speed * direction; 
          // console.log(`TREX is on the move!`)
          walkingPhase -= speed * direction * 10;
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
        const intersects = raycaster.intersectObject(brontoRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            // handleObjectClick(intersects[0].object);
            setCurrentStage(17);
            setOnZoom(true);

        }else{
           setCurrentStage(null);
           setOnZoom(false);
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
    <mesh ref={brontoRef} scale={[5, 5, 5]} rotation={[0, 2, 0]} position={[-2, -1, 3]}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default Brontosaurus