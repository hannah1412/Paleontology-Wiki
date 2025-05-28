/*
Author: Paul (https://sketchfab.com/paul_paul_paul)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/free-skybox-tundra-northern-lights-38b11068b8534e5d95817807152594c2
Title: FREE - SkyBox Tundra Northern Lights
*/
import React, { useEffect, useRef } from 'react'
import lightScene from '../../../../../../../public/3d/tundra_northern_lights.glb'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'

const NorthernLights = ({isRotating, setIsRotating, ...props}) => {
    const lightRef = useRef();
    const { nodes, materials } = useGLTF(lightScene);
    const { gl, viewport } =  useThree();
    
    const lastHorizontalPosition = useRef(0);
    const rotationSpeed = useRef(0);
    const dampingFactor = 0.95;


    const handlePointerDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(true);

        const clientX = e.touches ?
                        e.touches[0].clientX : e.clientX;
        
        lastHorizontalPosition.current = clientX;
    }

    const handlePointerUp = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(false);

    }

    const handlePointerMove = (e) => {
        e.stopPropagation();
        e.preventDefault();

        if(isRotating){
            const clientX = e.touches ?
                            e.touches[0].clientX : e.clientX;
            
            const delta = (clientX - lastHorizontalPosition.current) / viewport.width;

            // update the island rotation based on the mouse
            lightRef.current.rotation.y += delta * 0.006 * Math.PI;
        
            lastHorizontalPosition.current = clientX;
        
            rotationSpeed.current = delta * 0.01 * Math.PI;
        }
    }

    // Accessibility: using keyboard control 
    const hanleKeyboardDown = (e) => {
        if(e.key === 'ArrowLeft'){
            if(!isRotating) setIsRotating(true); 
            lightRef.current.rotation.y -= 0.01 * Math.PI;
        }else if(e.key === 'ArrowRight'){
            if(!isRotating) setIsRotating(true);
            lightRef.current.rotation.y += 0.01 * Math.PI;
        }
    }

    const handleKeyboardUp = (e) => {
        if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
            setIsRotating(false);
        }
    }

    useFrame(() => {
        // TO DO: control the speed
    })

    useEffect(() => {
        const canvas = gl.domElement;
        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("pointermove", handlePointerMove);
        canvas.addEventListener("pointerup", handlePointerUp);
        document.addEventListener("keydown", hanleKeyboardDown);
        document.addEventListener("keyup", handleKeyboardUp);
        return () => {
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("pointermove", handlePointerMove);
            canvas.removeEventListener("pointerup", handlePointerUp);
            document.removeEventListener("keydown", hanleKeyboardDown);
            document.removeEventListener("keyup", handleKeyboardUp);
        }
    })
  return (
    <group {...props} ref={lightRef}>
      <group scale={0.01}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Sphere__0.geometry}
          material={materials["Scene_-_Root"]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={50000}
        />
      </group>
    </group>
  );
}

export default NorthernLights