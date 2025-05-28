import React, { useRef } from 'react'
import treeScene from '../../../../../../../public/3d/oak_trees.glb'
import { useGLTF} from "@react-three/drei"
const OakTree = () => {
    const treeRef = useRef(); 
    const { scene } = useGLTF(treeScene)

    
  return (
    <mesh ref={treeRef}>
        <primitive object={scene}/>
    </mesh>
  )
}

export default OakTree