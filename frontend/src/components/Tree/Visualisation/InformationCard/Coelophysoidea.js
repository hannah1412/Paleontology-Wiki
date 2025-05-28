'use client'
import React, { useState, useEffect} from 'react'
import { Canvas } from '@react-three/fiber'
// Models
import Spinosaurus from './Models/ Coelophysoidea/Spinosaurus.js'
import Coelophysis from './Models/ Coelophysoidea/Coelophysis.js'
import NorthernLight from './Models/Islands/AboveTheSky'
import OakTree from './Models/Islands/OakTree.js'
import SceneInfo from './Models/SceneInfo.js'

const Coelophysoidea = () => {
    const [ isRotating, setIsRotating ] = useState(false);
    const [ currenStage, setCurrentStage ] = useState(null);
    
    const [ spinoStage, setSpinoStage ] = useState(null);
    const [ spinoOnZoom, setSpinoOnZoom ] = useState(false)

    const [ coelStage, setCoelStage ] = useState(null)
    const [ coelOnZoom, setCoelOnZoom ] = useState(false)
    
    useEffect(() => {
        const getModels = async () => {
          try {
            const spinosauRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/spinosaurus_animation`)
            if(!spinosauRequest.ok) {
              throw new Error(`GLB file not found`);
            }
            const spinoModel = spinosauRequest.blob

            const coeloRequest =  (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Coelophysoidea|coelophysis`))
            if(!coeloRequest.ok) {
              throw new Error(`GLB file not found`);
            }
            const ankylModel = coeloRequest.blob

            const northernLightRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/tundra_northern_lights`)
            if(!northernLightRequest.ok) {
                throw new Error(`GLB file not found`);
            }
            const northernLightModel = northernLightRequest.blob
  
          }catch(error){
            console.error(error);
          }
        }
      })


  return (
   <section className='w-full h-scrren relative'>
        {spinoOnZoom && <SceneInfo currentStage={spinoStage}/>}
        {coelOnZoom && <SceneInfo currentStage={coelStage}/>}
    <div>
        <Canvas className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`} 
        style={{width:'100%', height:'100vh'}}>
            <directionalLight position={[10, 20, 25]} intensity={3} castShadow={true}/>
            <ambientLight intensity={0.3}/>
            <spotLight intensity={0.2} castShadow={true}/>
            <NorthernLight 
                // setCurrentStage={setCurrentStage}
                setIsRotating={setIsRotating}
                isRotating={isRotating}
            />

            {/* Rendering Dinos for this scene */}
            <Spinosaurus
                isRotating={isRotating}
                isCurrentStage={spinoStage}
                setCurrentStage={setSpinoStage}
                setOnZoom={setSpinoOnZoom}
            />
            <Coelophysis
                isRotating={isRotating}
                isCurrentStage={coelStage}
                setCurrentStage={setCoelStage}
                setOnZoom={setCoelOnZoom}
            />

        </Canvas>
    </div>
   </section>
  ) 
}

export default Coelophysoidea