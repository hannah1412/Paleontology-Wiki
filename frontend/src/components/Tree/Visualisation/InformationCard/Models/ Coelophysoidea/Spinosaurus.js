import { useRef, useState, useEffect } from "react"

import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from "@react-three/fiber";
import spinoScene from '../../../../../../../public/3d/spinosaurus_animation.glb'
import * as THREE from 'three'

const Spinosaurus = ({isRotating, isCurrentStage, setCurrentStage, setOnZoom}) => {
    const spinoRef = useRef();
    const { scene } = useGLTF(spinoScene);
    const { gl, camera } = useThree();


    const [isOnClick, setOnClick] = useState(false);

    const [originalPosition, setOriginalPosition] = useState(null);
    const [ isZoomIn, setZoomIn ] = useState(false);
    // let mixer = new THREE.AnimationMixer(scene);
    // animations.forEach((clip) => {
    //     const action = mixer.clipAction(clip);
    //     action.play();
    // })
    
    const speed = 0.007; 
    let direction = -1;
    let walkingPhrase = 0;

    useEffect(() => {
        if (isCurrentStage === 4) {
          setZoomIn(true);
          const originalPos = spinoRef.current.position.clone();
          setOriginalPosition(originalPos);
          const newPos = new THREE.Vector3(0, -2.43, 3); 
          spinoRef.current.position.copy(newPos);
          spinoRef.current.scale.set(0.004, 0.004, 0.0039)
          
        } else {
          setZoomIn(false);
          if (originalPosition) {
            spinoRef.current.position.copy(originalPosition);
            spinoRef.current.scale.copy(new THREE.Vector3(0.0069999999, 0.006999998, 0.006999999))
          }
        }
      }, [isCurrentStage]);

    const handleMouseClick = (e) => {
        // e.stopPropagation();
        e.preventDefault(); 

        const mouse = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Set raycaster origin and direction from camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections with objects
        const intersects = raycaster.intersectObject(spinoRef.current);
        
        // Check if any objects are intersected
        if (intersects.length > 0) {
            // Trigger appropriate event handler for the intersected object
            setCurrentStage(4);
            setOnZoom(true)
        }else{
            setCurrentStage(null)
            setOnZoom(false)
        }

    }

    const handleMouseMissed = (e) => {
        // if the mouse position is out of the canvas
        console.log('Missed');
    }

    useFrame(({delta}) => {
        // mixer.update(delta);
        if(isRotating && isCurrentStage === null){
            spinoRef.current.position.x -= speed * direction;
            walkingPhrase -= speed * direction * 10; 
        }
        
    })

    useEffect(() => {
        const canvas = gl.domElement;
        canvas.addEventListener("click", handleMouseClick);
        // canvas.addEventListener("mouseout", handleMouseMissed);
        // canvas.addEventListener("click", handleMouseClickOutside);
        return () => {
            canvas.removeEventListener("click", handleMouseClick);
            // canvas.addEventListener("mouseout", handleMouseMissed);
            // canvas.removeEventListener("click", handleMouseClickOutside);
        }
    }, [gl.domElement, isOnClick])

  return (

    // z-position does effect the effectiveness of raycaster 
    <mesh position={[-9, -3, -5]} scale={[0.0069999999, 0.006999998, 0.006999999]} rotation={[0, -10.4, 0]}
    ref={spinoRef}>
        <primitive ref={spinoRef} object={scene}/>
    </mesh>
  )
}

export default Spinosaurus