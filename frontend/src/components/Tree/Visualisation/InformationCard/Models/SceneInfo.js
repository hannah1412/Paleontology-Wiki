import React from 'react'
import styles from './DinoInformationBox.module.css';
import Link from 'next/link';
const renderTextBox = {

    
    // Dino Models
    1: (
        <Link target='_blank'
        href={`/result?id=Q14388&label=Stegosaurus&short_description=genus+of+reptiles+%28fossil%29`}> 

            <h1 className={`${styles.textBox}`}> Stegasaurus</h1>
        </Link>
    ), 
    2: (
        <Link target='_blank' 
        href={`/result?id=Q14332&label=Tyrannosaurus&short_description=genus+of+large+Late+Cretaceous+tyrannosaurids`}> 

            <h1 className={`${styles.textBox}`}> Tyrannasaurus</h1>
        </Link>
    ), 
    3: (
        <h1 className={`${styles.textBox}`}> Pteradactyl</h1>
    ), 

    // Coelophysoidea
    4: (
        <Link target='_blank'
        href={`/result?id=Q130966&label=Spinosaurus&short_description=genus+of+theropod+dinosaur+%28fossil%29`}>
            <h1 className={`${styles.textBox}`}>Spinosaurus</h1>
        </Link>
    ),
    5: (
        <Link target='_blank' 
        href={`/result?id=Q309392&label=Coelophysis&short_description=extinct+genus+of+theropods`}>
            
            <h1 className={`${styles.textBox}`}>Coelophysis</h1>
        </Link>
    ), 
    6: (
        <Link target='_blank' 
        href={`/result?id=Q130902&label=Ceratosaurus&short_description=Genus+of+theropod+dinosaur`}>
            
            <h1 className={`${styles.textBox}`}>Ceratosaurus</h1>
        </Link>
    ), 
    7: (
        <Link target='_blank' 
        href={`/result?id=Q130921&label=Abelisaurus&short_description=genus+of+abelisaurid+theropods`}>
            <h1 className={`${styles.textBox}`}>Abelisaurus</h1>
        </Link>
    ),
    8: (
        <Link target='_blank'
        href={`/result?id=Q18511009&label=Majungasaurus&short_description=genus+of+reptiles+%28fossil%29`}>
            <h1 className={`${styles.textBox}`}>Majungasaurus</h1>
        </Link>
    ), 
    9: (
        <Link target='_blank' href={`/result?id=Q18510948&label=Carnotaurus&short_description=genus+of+reptiles+%28fossil%29`}>
            <h1 className={`${styles.textBox}`}>Carnotaurus</h1>
        </Link>
    ), 
    // Tetanurae
    10: (
        <Link target='_blank' 
        href={`/result?id=Q14400&label=Allosaurus&short_description=genus+of+large+theropod+dinosaur+%28fossil%29`}>
            <h1 className={`${styles.textBox}`}>Allosaurus</h1>
        </Link>
    ), 
    11: (
        <Link target='_blank' 
        href={`/result?id=Q130880&label=Compsognathus&short_description=genus+of+Jurassic+theropods`}>
            <h1 className={`${styles.textBox}`}>Compsognathus</h1>
        </Link>
    ), 
    12: (
        <Link target='_blank'
        href={`/result?id=Q271710&label=Dilophosaurus&short_description=genus+of+reptiles+%28fossil%29`}>
            <h1 className={`${styles.textBox}`}>Dilophosaurus</h1>
        </Link>
    ),
    13: (
        <Link target='_blank'
        href={`/result?id=Q767702&label=Gigantosaurus&short_description=genus+of+reptiles+%28fossil%29`}>
            <h1 className={`${styles.textBox}`}>Giganotosaurus</h1>
        </Link>
    ),
    // Sauropoda
    14: (
        <Link target="_blank" 
        href={`/result?id=Q14330&label=Diplodocus&short_description=genus+of+diplodocid+sauropod+dinosaur+%28fossil%29`}>
            <h1 className={`${styles.textBox}`}>Diplodocus</h1>
        </Link>
    ), 
    15: (
        <Link target='_blank' 
        href={`/result?id=Q130859&label=Argentinosaurus&short_description=genus+of+titanosaurian+sauropod+dinosaur`}>
          
            <h1 className={`${styles.textBox}`}>Argentinosaurus</h1>
        </Link>
    ), 
    16: (
        <Link target='_blank' 
        href={`/result?id=Q14397&label=Brachiosaurus&short_description=sauropod+dinosaur+genus+from+the+late+Jurassic+Period`}>
            <h1 className={`${styles.textBox}`}>Brachiosaurus</h1>
        </Link>
    ), 
    17: (
        <Link target='_blank' 
        href={`/result?id=Q3222766&label=Brontosaurus&short_description=genus+of+apatosaurs`}>

            <h1 className={`${styles.textBox}`}>Brontosaurus</h1>
        </Link>
    ),
    18: (
        <Link target='_blank' 
        href={`/result?id=Q131547&label=Titanosaurus&short_description=genus+of+reptiles+%28fossil%29`}>

            <h1 className={`${styles.textBox}`}>Titanosaurus</h1>
        </Link>
    ), 
    // Thyreophora
    19: (
        <Link target='_blank' 
        href={`/result?id=Q40621&label=Ankylosaurus&short_description=ankylosaurid+dinosaur+genus+from+the+Late+Cretaceous+Period`}>

            <h1 className={`${styles.textBox}`}>Ankylosaurus</h1>
        </Link>
    ), 
    20: (
        <Link target='_blank' 
        href={`/result?id=Q131094&label=Kentrosaurus&short_description=genus+of+reptiles+%28fossil%29`}>

            <h1 className={`${styles.textBox}`}>Kentrosaurus</h1>
        </Link>
    ),
    21: (
        <Link target='_blank' 
        href={`/result?id=Q134209&label=Nodosaurus&short_description=genus+of+reptiles+%28fossil%29`}>

            <h1 className={`${styles.textBox}`}>Nodosaurus</h1>
        </Link>
    )
}

const SceneInfo = ({currentStage}) => {

    // TO DO: gether the stages in the scene for prompting new messages 
    return renderTextBox[currentStage] || null;

}

export default SceneInfo