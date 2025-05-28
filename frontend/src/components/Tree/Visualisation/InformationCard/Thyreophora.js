'use client'
import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneInfo from './Models/SceneInfo'
import NorthernLight from './Models/Islands/NorthernLights.js'
import Ankylosaurus from './Models/Thyreophora/Ankylosaurus'
import Kentrosaurus from './Models/Thyreophora/Kentrosaurus'
import Nodosaurus from './Models/Thyreophora/Nodosaurus'
import OakTree from './Models/Islands/OakTree'

const Thyreophora = () => {
    const [ isRotating, setIsRotating ] = useState(false);
    const [ currentStage, setCurrentStage ] = useState(null);  //for displaying the text box
    const [ ankylOnClick, setAnkylOnClick ] = useState(false);
    const [ ankylStage, setAnkylStage ] = useState(null);

    const [ kentroOnclick, setKentroOnclick ] = useState(false);
    const [ kentroStage, setKentroStage ] = useState(null);

    useEffect(() => {
      const getModels = async () => {
        try {
          const northernLightRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/tundra_northern_lights`)
          if(!northernLightRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const northernLightModel = northernLightRequest.blob
          const ankylosaurusRequest =  (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Thyreophora|ankylosaurus`))
          if(!ankylosaurusRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const ankylModel = ankylosaurusRequest.blob
          const kentroRequest = (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Thyreophora|kentrosaurus`))
          if(!kentroRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const kentroModel = ankylosaurusRequest.blob

          const nodoRequest = (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Thyreophora|nodosaurus`))
          if(!nodoRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const nodoModel = ankylosaurusRequest.blob
        }catch(error){
          console.error(error);
        }
      }
    })
    console.log(`On zoom : ${ankylOnClick}`)
    console.log(`Current satge : ${currentStage}`)
  return (
    <section className='w-full h-screen relative'>
        {/* TO DO; add 'current stages' for  displayed text on command  */}
        <div className="absolute top-28 left-0 right-0 z-10 flex items-center
      justify-center">
        {currentStage && <SceneInfo currentStage={currentStage}/>}
        {ankylOnClick && <SceneInfo currentStage={ankylStage}/>}
        {kentroOnclick && <SceneInfo currentStage={kentroStage}/>}
        
      </div>       
       <Canvas className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`} 
        style={{width:'100%', height:'100vh'}}
          >
            <directionalLight position={[10, 20, 25]} intensity={3}/>
            <ambientLight intensity={0.3}/>
            <spotLight intensity={0.2}/>
        
            <OakTree/>
            <Ankylosaurus
                isRotating={isRotating}
                setCurrentStage={setAnkylStage}
                isCurrentStage={ankylStage}
                isOnZoom={setAnkylOnClick}
            />
            <Kentrosaurus
                isRotating={isRotating}
                setCurrentStage={setKentroStage}
                isCurrentStage={kentroStage}
                isOnZoom={setKentroOnclick}
            />
            <Nodosaurus
                isRotating={isRotating}
                setCurrentStage={setCurrentStage}
                isCurrentStage={currentStage}
            />
            <NorthernLight
                isRotating={isRotating}
                setIsRotating={setIsRotating}
            />
        </Canvas>
      </section>
  )
}

export default Thyreophora