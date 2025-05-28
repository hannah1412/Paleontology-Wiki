'use client'
import React, { Suspense, useEffect, useState } from "react"
import { Canvas } from '@react-three/fiber';
// Models
import Stegasaurus from './Models/Stegasaurus.js'
import Island from './Models/Islands/Island.js'
import Sky from './Models/Sky.js'
import Pteradactyl from  './Models/Pteradactyl.js'
import TRex from './Models/T_Rex.js'
import Spinosaurus from './Models/ Coelophysoidea/Spinosaurus.js'
import SceneInfo from './Models/SceneInfo.js'

const DinoModels = () => {
    const [isRotating, setIsRotating] = useState(false);
    const [ currentStage, setCurrentStage ] = useState(null);  //for displaying the text box

    useEffect(() => {
      const getModels = async () => {
        try {
          const stegaRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/pbr_stegasaurus_animated`)
          if(!stegaRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const stegaModel = stegaRequest.blob

          const skyRequest =  (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/sky`))
          if(!skyRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const skyModel = skyRequest.blob

          const pteradactylRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/animated-flying-pteradactal-dinosaur-loop|source|Pteradactal`)
          if(!pteradactylRequest.ok) {
              throw new Error(`GLB file not found`);
          }
          const pterModel = pteradactylRequest.blob

          const tRexRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/t-rex`)
          if(!tRexRequest.ok) {
              throw new Error(`GLB file not found`);
          }
          const tRexModel = tRexRequest.blob

          const islandRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/hunterIsland`)
          if(!islandRequest.ok) {
              throw new Error(`GLB file not found`);
          }
          const islandModel = islandRequest.blob

        }catch(error){
          console.error(error);
        }
      }
    })
    
    // console.log(`Current stage: ${currentStage}`);

    return (
      <section className='w-full h-screen relative'>
        {/* TO DO; add 'current stages' for  displayed text on command  */}
        <div className="absolute top-28 left-0 right-0 z-10 flex items-center
      justify-center">
          {currentStage && <SceneInfo currentStage={currentStage}/>}
        </div>

        <Canvas className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`} 
        style={{width:'100%', height:'100vh'}}
          >
            <directionalLight position={[10, 20, 25]} intensity={3}/>
            <ambientLight intensity={0.3}/>
            <spotLight intensity={0.2}/>
            <Stegasaurus 
              position={[-10.2, -2.4, -6.4]} 
              scale={[1.5, 1.5, 1.5]} 
              rotation={[0,20,0] }
              isRotating={isRotating}
              // setIsRotating={setIsRotating}
              setCurrentStage={setCurrentStage}  
              isCurrentStage={currentStage}
            />
            <Sky 
              isRotating={isRotating}
            />
            <Pteradactyl 
              isRotating={isRotating}
              setCurrentStage={setCurrentStage}
              isCurrentStage={currentStage}
            /> 
            <TRex 
              isRotating={isRotating}
              setCurrentStage={setCurrentStage}
              isCurrentStage={currentStage}
            />
            <Island 
              position={[1.2, -5.5, -35.4]}
              scale={[5.5, 5, 6]}
              isRotating={isRotating}
              setIsRotating={setIsRotating}
            />
        </Canvas>
      </section>
    );
}

export default DinoModels;