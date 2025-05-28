'use client'
import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
// Models
import Ceratosaurus from './Models/ Ceratosauria/Ceratosaurus'
import Majungasaurus from './Models/ Ceratosauria/Majungasaurus'
import Carnotaurus from './Models/ Ceratosauria/Carnotaurus'
import Abelisaurus from './Models/ Ceratosauria/Abelisaurus'
import AboveTheSky from './Models/Islands/NorthernLights'
import SceneInfo from './Models/SceneInfo'

const Ceratosauria = () => {
  const [isRotating, setIsRotating ] = useState(false);

  const [ ceraStage, setCeraStage ] = useState(null)
  const [ ceraOnZoom, setCeraOnZoom ] = useState(false)

  const [ majunStage, setMajunStage ] = useState(null)
  const [ majunOnZoom, setMajunOnZoom ] = useState(false)
  
  const [ abeliStage, setAbeliStage ] = useState(null)
  const [ abeliOnZoom, setAbeliOnZoom ] = useState(false)

  const [ carnoStage, setCarnoStage ] = useState(null)
  const [ carnoOnZoom, setCarnoOnZoom ] = useState(false)
  
  useEffect(() => {
    const getModels = async () => {
      try {
        const ceraRequest = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Ceratosauria|near-accurate_ceratosaurus`)
        if(!ceraRequest.ok) {
          throw new Error(`GLB file not found`);
        }
        const ceraModel = ceraRequest.blob

        const majunhaRequest =  (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Ceratosauria|majungasaurus`))
        if(!majunhaRequest.ok) {
          throw new Error(`GLB file not found`);
        }
        const manjunModel = majunhaRequest.blob

        const carnoRequest = (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Ceratosauria|carnotaurus`))
        if(!carnoRequest.ok) {
          throw new Error(`GLB file not found`);
        }
        const carnoModel = carnoRequest.blob

        const abeliRequest = (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Ceratosauria|abelisaurus`))
        if(!abeliRequest.ok) {
          throw new Error(`GLB file not found`);
        }
        const abeliModel = abeliRequest.blob

        const skyRequest = (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ADDR}/cladogram/Ceratosauria|above-the-cloud`))
        if(!skyRequest.ok) {
          throw new Error(`GLB file not found`);
        }
        const skyModel = skyRequest.blob
      }catch(error){
        console.error(error);
      }
    }
  })

  return (
    <section className='w-full h-screen relative'>
      <div>
        {ceraOnZoom && <SceneInfo currentStage={ceraStage}/>}
        {majunOnZoom && <SceneInfo currentStage={majunStage}/>}
        {carnoOnZoom && <SceneInfo currentStage={carnoStage}/>}
        {abeliOnZoom && <SceneInfo currentStage={abeliStage}/>}
      </div>
      <Canvas className={`w-full h-screen bg-transparent ${isRotating ? 'cursor-grabbing' : 'cursor-grab'}`} 
          style={{width:'100%', height:'100vh'}}>
              <directionalLight position={[10, 20, 25]} intensity={3} castShadow={true}/>
              <ambientLight intensity={0.3}/>
              <spotLight intensity={0.2} castShadow={true}/>
              
              <AboveTheSky
                isRotating={isRotating}
                setIsRotating={setIsRotating}
              />
              <Ceratosaurus
                isRotating={isRotating}
                setCurrentStage={setCeraStage}
                currenStage={ceraStage}
                setOnZoom={setCeraOnZoom}
              />
              <Majungasaurus
                isRotating={isRotating}
                setCurrentStage={setMajunStage}
                currentStage={majunStage}
                setOnZoom={setMajunOnZoom}              
              />
              <Carnotaurus
                isRotating={isRotating}
                setCurrentStage={setCarnoStage}
                currentStage={carnoStage}
                setOnZoom={setCarnoOnZoom}
              />
              <Abelisaurus
                isRotating={isRotating}
                setCurrentStage={setAbeliStage}
                currentStage={abeliStage}
                setOnZoom={setAbeliOnZoom}
              />

      </Canvas>
    </section>
  )
}

export default Ceratosauria