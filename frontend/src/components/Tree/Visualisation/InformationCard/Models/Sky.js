/*
Author: Paul (https://sketchfab.com/paul_paul_paul)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/free-skybox-basic-sky-b2a4fd1b92c248abaae31975c9ea79e2
Title: FREE - SkyBox Basic Sky
*/

import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import skyScene from '../../../../../../public/3d/sky.glb'
import { useFrame } from '@react-three/fiber'

const Sky = ({isRotating}) => {

  const skyRef = useRef();
  const sky = useGLTF(skyScene);
  useFrame((_, delta) => {
    if(isRotating){
      skyRef.current.rotation.y += 0.25 * delta;    //0.25 factor is the speed when the sky moves
    }
  })
  return (
    <mesh ref={skyRef}>
        <primitive object={sky.scene} />
    </mesh>
  );
}

export default Sky;
