
import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import dinoScene from '../../../../../../public/3d/animated-flying-pteradactal-dinosaur-loop/source/Pteradactal.glb'
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three'
const Pteradactyl = ({isCurrentStage, setCurrentStage, ...props}) => {
  const pterRef = useRef();
  const { scene, animations } = useGLTF(dinoScene);
  const { gl, camera, viewport} = useThree(); 

  const [ isOnClick, setOnClick] = useState(false);
  const [originalPosition, setOriginalPosition] = useState(null);
  const [ isZoomIn, setZoomIn ] = useState(false);

  // search and include predefined animation clips
  // have to access it from mixer instead of directly extract the clip by calling useAnimations() 
  let mixer = new THREE.AnimationMixer(scene);
  animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    // console.log('Animation clip ' + ':', clip);
    action.play();
  });

  useEffect(() => {
    if (isCurrentStage === 3) {
      setZoomIn(true);
      const originalPos = pterRef.current.position.clone();
      setOriginalPosition(originalPos);
      const newPos = new THREE.Vector3(0, -2, -5);
      pterRef.current.position.copy(newPos);
      
    } else {
      setZoomIn(false);
      if (originalPosition) {
        pterRef.current.position.copy(originalPosition);
      }
    }
  }, [isCurrentStage]);
  
  useFrame(( delta) => {
      mixer.update(delta);
  });

  // modifying its movements: Fly
  useFrame(({clock, camera}) => {
    pterRef.current.position.y = Math.sin(clock.elapsedTime) * 0.5 + 2;
    
    if(pterRef.current.position.x > camera.position.x + 10 ){   //if exited the camera
      pterRef.current.rotation.y = Math.PI;
    }else if(pterRef.current.position.x < camera.position.x - 10){  //if still in camera, move forward
      pterRef.current.rotation.y = 0;
    }

    // flying in circle effect as flying forward
    if(pterRef.current.rotation.y === 0){
      pterRef.current.position.x += 0.01;
      pterRef.current.position.z -= 0.01;
    }else{
      pterRef.current.position.x -= 0.01;
      pterRef.current.position.z += 0.01;
    }
    return null;
  })

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
    const intersects = raycaster.intersectObject(pterRef.current);
    
    // Check if any objects are intersected
    if (intersects.length > 0) {
        // Trigger appropriate event handler for the intersected object
        // handleObjectClick(intersects[0].object);
        setCurrentStage(3);
        for (let i = 0; i < intersects.length; i++) {
            const distance = intersects[i].distance;
            console.log(`Intersection ${i + 1}: Distance: ${distance}`);
        }
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
    <mesh position={[-15, 6,-10]} rotation={[66.6, 25.80, -15.5]}  scale={[2.5, 2.5, 2.5]}
    ref={pterRef}>
      <primitive object={scene}/>
    </mesh>
  );
}

export default Pteradactyl