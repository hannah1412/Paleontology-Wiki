'use client'
import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import SceneInfo from './Models/SceneInfo'
// Models
import NorthernLight from './Models/Islands/NorthernLights.js'
import Diplodocus from './Models/Sauropoda/Diplodocus.js'
import Argentinosaurus from './Models/Sauropoda/Argentinosaurus.js'
import Brachiosaurus from './Models/Sauropoda/Brachiosaurus.js'
import Brontosaurus from './Models/Sauropoda/Brontosaurus.js'
import Titanosaurus from './Models/Sauropoda/Titanosaurus.js'

const Sauropoda = () => {
    const [isRotating, setIsRotating] = useState(false);
    const [ currentStage, setCurrentStage ] = useState(null);  //for displaying the text box

    const [ diploOnZoom, setDiploOnZoom ] = useState(false);
    const [ diploStage, setDiploStage ] = useState(null);

    const [ argenOnZoom, setArgenOnZoom ] = useState(false)
    const [ argenStage, setArgenStage ] = useState(null)

    const [ brachioOnZoom, setBrachioOnZoom ] = useState(false)
    const [ brachioStage, setBrachioStage ] = useState(null)

    const [ brontoOnZoom, setBrontoOnZoom ] = useState(false)
    const [ brontoStage, setBrontoStage ] = useState(null)

    const [ titanOnZoom, setTitanOnZoom ] = useState(false)
    const [ titanStage, setTitanStage ] = useState(null)


    useEffect(() => {
      const getModels = async () => {
        try {
          const northernLightRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/tundra_northern_lights`)
          if(!northernLightRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const northernLightModel = northernLightRequest.blob

          const diploRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Sauropoda|diplodocus`)
          if(!diploRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const diploModel = diploRequest.blob

          const argenRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Sauropoda|argentinosaurus`)
          if(!argenRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const argenModel = argenRequest.blob

          const brachioRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Sauropoda|brachiosaurus`)
          if(!brachioRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const brachioModel = brachioRequest.blob

          const brontoRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Sauropoda|brontosaurus`)
          if(!brontoRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const brontoModel = brontoRequest.blob

          const titanRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Sauropoda|titanosaurus`)
          if(!titanRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const titanModel = titanRequest.blob

        }catch(error){
          console.error(error);
        }
      }
    })

    console.log(`Current: ${titanStage}`)
  return (
    <section className='w-full h-screen relative'>
        <div className="absolute top-28 left-0 right-0 z-10 flex items-center
      justify-center">

        {argenOnZoom && <SceneInfo currentStage={argenStage}/>}
        {brachioOnZoom && <SceneInfo currentStage={brachioStage}/>}
        {brontoOnZoom && <SceneInfo currentStage={brontoStage}/>}
        {diploOnZoom && <SceneInfo currentStage={diploStage}/>}
        {titanOnZoom && <SceneInfo currentStage={titanStage}/>}
      </div>
        <Canvas className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`} 
        style={{width:'100%', height:'100vh'}}
          >
            <directionalLight position={[10, 20, 25]} intensity={5}/>
            <ambientLight intensity={0.3}/>
            <spotLight intensity={0.2}/>

            <Diplodocus 
              isRotating={isRotating}
              setCurrentStage={setDiploStage}
              isCurrentStage={diploStage}
              setOnZoom={setDiploOnZoom}
            />
            <Argentinosaurus
              isRotating={isRotating}
              setCurrentStage={setArgenStage}
              isCurrentStage={argenStage}
              setOnZoom={setArgenOnZoom}
            />
            <Brachiosaurus
              isRotating={isRotating}
              setCurrentStage={setBrachioStage}
              isCurrentStage={brachioStage}
              setOnZoom={setBrachioOnZoom}
            />
            <Brontosaurus
              isRotating={isRotating}
              setCurrentStage={setBrontoStage}
              isCurrentStage={brontoStage}
              setOnZoom={setBrontoOnZoom}
            />
            <Titanosaurus
              isRotating={isRotating}
              setCurrentStage={setTitanStage}
              isCurrentStage={titanStage}
              setOnZoom={setTitanOnZoom}
            />

            <NorthernLight
                isRotating={isRotating}
                setIsRotating={setIsRotating}
            />
            
        </Canvas>
      </section>
  )
}

export default Sauropoda