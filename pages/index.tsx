import { useEffect, useState } from "react"
import axios from "axios"
import fs from "fs"

export default function Home() {
  const [file, setFile] = useState<any>(null);
  const [bird, changeBird] = useState<any>()
  const [birdConfidence, changeBirdConfidence] = useState<any>()
  const [birdDetails, changeBirdDetails] = useState<any>()

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = () => {
      setFile(reader.result);
    };
  };

  const getBird = async () => {
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
    })
    .catch(function(error) {
        console.log(error.message);
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

  return (
    <main>
      <div className="container">
        <div className="logo-container">
          <i className="fa-solid fa-feather"></i>
        </div>
        <h1>Archipelago</h1>
        <p className="description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ex dui, laoreet at blandit nec.</p>
        { !birdDetails ?
        <>
          <input id="file-upload" type="file" onChange={handleFileChange} />
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
          <button onClick={getBird} className="submit">View Bird Details</button>
        </>
        :
        <>
          <img src={file} className="bird-image"/>
          <h2>{bird.replaceAll("-", " ")} - {(birdConfidence * 100).toFixed(0) + '%'}</h2>
          <p className="bird-description">{birdDetails.description}</p>
          <audio controls preload="metadata" src={birdDetails.audio} id="my-audio" />
          <div className="audio-buttons">
            <button onClick={playAudio} className="submit">Play Bird Noise</button>
            <button onClick={pauseAudio} className="button-2">Pause</button>
          </div>
          <div className="bird-grid">
            {
              birdDetails.images.map((image: any) => {
                return <img src={image} alt="Bird image" />
              })
            }
          </div>
        </>
        }
      </div>
    </main>
  )
}