import { useEffect, useState } from "react"
import axios from "axios"
import fs from "fs"
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [file, setFile] = useState<any>(null);
  const [bird, changeBird] = useState<any>()
  const [birdConfidence, changeBirdConfidence] = useState<any>()
  const [birdDetails, changeBirdDetails] = useState<any>()
  const [loading, changeLoading] = useState(false)
  const [error, changeError] = useState<any>(false)

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = () => {
      setFile(reader.result);
    };
  };

  const getBird = async () => {
    changeLoading(true)
    changeError(false)
    axios({
      method: "POST",
      url: "https://detect.roboflow.com/bird-v2/2",
      params: {
          api_key: "sXOu9jLGWGgbfk9jhhXp"
      },
      data: file,
      headers: {
          "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(async function(response) {
      changeBird(response.data.predictions[0].class);
      changeBirdConfidence(response.data.predictions[0].confidence)
    
      const response2 = await axios.get(`/api/search?bird=${response.data.predictions[0].class}`); // call the API endpoint
      console.log(response2)
      changeBirdDetails(response2.data)
      changeLoading(false)
    })
    .catch(function(error) {
        console.log(error.message);
        changeLoading(false)
        changeError(true)
    });
  }
  
  const playAudio = () => {
    var audio: any = document.getElementById("my-audio");
    audio.play();
  }

  const pauseAudio = () => {
    var audio: any = document.getElementById("my-audio");
    audio.pause();
  }

  const getComplexInfo = () => {
    router.push(birdDetails.inDepthInformation)
  }

  return (
    <main>
      <div className="container">
        <div className="logo-container">
          <i className="fa-solid fa-feather"></i>
        </div>
        <h1>Archipelago</h1>
        <p className="description">Simply upload a photo of your bird and get it&apos;s bird noises, information, pictures and more!</p>
        { !loading ?
        <>
        { !birdDetails ?
        <>
          <input id="file-upload" type="file" onChange={handleFileChange} accept="image/png, image/jpeg"/>
          <label htmlFor="file-upload" className="custom-file-upload">
              {!file ? 
              <>
                <p>+</p>
                <p>Upload a bird photo</p>
              </>
              :
              <img src={file} />
              }
          </label>
          {error && <p className="error">An Unknown Error has Occured, Please Upload a New Photo!</p>}
          <button onClick={getBird} className="submit">View Bird Details</button>
        </>
        :
        <>
          <img src={file} className="bird-image"/>
          <h2>{bird.replaceAll("-", " ")} - {(birdConfidence * 100).toFixed(0) + '%'}</h2>
          <p className="subheader">Genus: {birdDetails.genus}</p>
          <p className="subheader">Family: {birdDetails.family}</p>
          <p className="subheader">Scientific: {birdDetails.scientific}</p>
          <p className="bird-description">{birdDetails.description}</p>
          <p className="subheader">Range: {birdDetails.range}</p>
          <audio controls preload="metadata" src={birdDetails.audio} id="my-audio" />
          <div className="audio-buttons">
            <button onClick={playAudio} className="submit">Play Bird Noise</button>
            <button onClick={pauseAudio} className="button-2">Pause</button>
          </div>
          <div className="bird-grid">
            {
              birdDetails.images.map((image: any, index: any) => {
                return <img src={image} alt="Bird image" key={index} />
              })
            }
          </div>
          <h2 className="learn-more-header">Learn More</h2>
          <ul className="resource-grid">
            {
              birdDetails.resources.map((resource: any, index: any) => {
                return <li key={index}><a href={resource.url}>{resource.name}</a></li>
              })
            }
          </ul>
          <button onClick={getComplexInfo} className="submit">In-Depth Info</button>
        </>
        }
        </>
        :
        <div className="loading">
          <div className="loading-inside"></div>
        </div>
        }
      </div>
    </main>
  )
}