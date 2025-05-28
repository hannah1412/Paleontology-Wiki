'use client'
import React, { useState , useEffect} from 'react'
import { Canvas } from '@react-three/fiber'
import SceneInfo from './Models/SceneInfo'
// Models
import Allosaurus from './Models/Tetanurae/Allosaurus.js'
import Dilophosaurus from './Models/Tetanurae/Dilophosaurus'
import Compsognathus from './Models/Tetanurae/Compsognathus.js'
import Giganotosaurus from './Models/Tetanurae/Giganotosaurus'
import NorthernLight from './Models/Islands/NorthernLights.js'

const Tetanurae = () => {
    const [isRotating, setIsRotating] = useState(false);
    // const [ currentStage, setCurrentStage ] = useState(null);  //for displaying the text box

    const [ alloOnZoom, setAlloOnZoom ] = useState(false);
    const [ alloStage, setAlloStage ] = useState(null);

    const [ dilphoOnZom, setDilphoOnZoom ] = useState(false);
    const [ dilphoStage, setDilphoStage ] = useState(null);

    const [ compsoOnZom, setCompsoOnZoom ] = useState(false);
    const [ compsoStage, setCompsoStage ] = useState(null);

    const [ giganOnZom, setGiganoOnZoom ] = useState(false);
    const [ giganStage, setGiganStage ] = useState(null);


    useEffect(() => {
      const getModels = async () => {
        try {
          const northernLightRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/tundra_northern_lights`)
          if(!northernLightRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const northernLightModel = northernLightRequest.blob

          const alloRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Tetanurae|allosaurus`)
          if(!alloRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const alloModel = alloRequest.blob

          const diloRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Tetanurae|dilophosaurus`)
          if(!diloRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const diloModel = diloRequest.blob

          const compsoRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Tetanurae|compsognathus`)
          if(!compsoRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const compsoModel = compsoRequest.blob

          const giganRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Tetanurae|giganotosaurus`)
          if(!giganRequest.ok) {
            throw new Error(`GLB file not found`);
          }
          const giganModel = giganRequest.blob

        }catch(error){
          console.error(error);
        }
      }
    })
    
  return (
    <section className='w-full h-screen relative'>
        {/* TO DO; add 'current stages' for  displayed text on command  */}
        <div className="absolute top-28 left-0 right-0 z-10 flex items-center
      justify-center">
        {/* {currentStage && <SceneInfo currentStage={currentStage}/>} */}
        {alloOnZoom && <SceneInfo currentStage={alloStage}/>}
        {dilphoOnZom && <SceneInfo currentStage={dilphoStage}/>}
        {compsoOnZom && <SceneInfo currentStage={compsoStage}/>}
        {giganOnZom && <SceneInfo currentStage={giganStage}/>}
      </div>
        <Canvas className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`} 
        style={{width:'100%', height:'100vh'}}
          >
            {/* <directionalLight position={[10, 20, 25]} intensity={3}/> */}
            <directionalLight position={[2, 10, 10]} intensity={10} castShadow />
            <ambientLight position={[0, 0, 0]} intensity={-1.5}/>
            <spotLight intensity={0.6}/>
            <NorthernLight
                isRotating={isRotating}
                setIsRotating={setIsRotating}
            />
            <Allosaurus
                isRotating={isRotating}
                setCurrentStage={setAlloStage}
                isCurrentStage={alloStage}
                setOnZoom={setAlloOnZoom}
            />
            <Dilophosaurus
                isRotating={isRotating}
                setCurrentStage={setDilphoStage}
                isCurrentStage={dilphoStage}
                setOnZoom={setDilphoOnZoom}
            />
            <Compsognathus
                isRotating={isRotating}
                setCurrentStage={setCompsoStage}
                isCurrentStage={compsoStage}
                setOnZoom={setCompsoOnZoom}
            />
            <Giganotosaurus
                isRotating={isRotating}
                setCurrentStage={setGiganStage}
                isCurrentStage={giganStage}
                setOnZoom={setGiganoOnZoom}
            />
            
        </Canvas>
      </section>
  )
}

export default Tetanurae