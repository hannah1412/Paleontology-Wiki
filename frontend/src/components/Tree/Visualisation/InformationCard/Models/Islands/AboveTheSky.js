/*
Author: Paul (https://sketchfab.com/paul_paul_paul)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/free-skybox-above-the-clouds-77e196f5089040ffb7b4d32c6a3fc035
Title: FREE - SkyBox Above The Clouds
*/

import React, { useRef, useEffect } from 'react'
import skyScene from '../../../../../../../public/3d/Ceratosauria/above-the-cloud.glb'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber';
const AboveTheSky = ({isRotating, setIsRotating, ...props}) => {
    const skyRef = useRef();
    const { nodes, materials } = useGLTF(skyScene)
    const { gl, viewport } = useThree()

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
            skyRef.current.rotation.y += delta * 0.001 * Math.PI;
        
            lastHorizontalPosition.current = clientX;
        
            rotationSpeed.current = delta * 0.001 * Math.PI;
        }
    }

    // Accessibility: using keyboard control 
    const hanleKeyboardDown = (e) => {
        if(e.key === 'ArrowLeft'){
            if(!isRotating) setIsRotating(true); 
            skyRef.current.rotation.y += 0.1 * Math.PI;
        }else if(e.key === 'ArrowRight'){
            if(!isRotating) setIsRotating(true);
            skyRef.current.rotation.y -= 0.1 * Math.PI;
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
    <group {...props} ref={skyRef}>
      <group scale={0.001}>
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
  )
}

export default AboveTheSky