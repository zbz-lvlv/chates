import { useEffect, useRef, useState } from 'react';
import './App.css';
import VoiceRecorder from './VoiceRecorder';
import { postJson, postForm, postJsonForArrayBuffer } from './utils/fetcher';
import { SCENARIOS } from './constants/scenarios';

const PATH_ELEVENLABS_API = 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM';

interface Message {
  role: string;
  content: string;
}

function App() {

  const audioBlobRef = useRef<Blob | null>(null);
  const [newRecordingSignal, setNewRecordingSignal] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [chosenScenario, setChoosenScenario] = useState<number>(0); // [0, 1, 2, 3, 4, ...]

  const [messages, setMessages] = useState<Message[]>([]);

  const resetMessages = () => {
    setMessages([
      {
        "role": "system",
        "content": SCENARIOS[0].prompt
      }
    ])
  };

  const requestAndPlayTranscriptionAudio = (text: string) => {

    const headers = {
      "accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": "167977463442499312513b449c0edf38"
    }

    const postData = {
      "text": text,
      "model_id": "eleven_multilingual_v1",
      "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.5
      }
    }

    postJsonForArrayBuffer(PATH_ELEVENLABS_API, postData, headers)
      .then((response) => {

        const audioBlob = new Blob([response], { type: 'audio/mpeg' });
        const audioObjUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioObjUrl);
        audio.play();
        
      })
      .catch((error) => {
        console.error(error);
      }
    );

  };

  useEffect(() => {
    resetMessages();
  }, []);

  useEffect(() => {

    if (!audioBlobRef.current) {
      return;
    }

    const formData = new FormData();
    formData.append('messages', JSON.stringify(messages));
    formData.append('user_audio', audioBlobRef.current);

    postForm('http://192.168.3.128:5000/chat', formData)
      .then((response) => {

        if (response.status !== 0) {
          console.error(response);
          return;
        }
        
        const userText = response.data.userText;
        const assistantText = response.data.assistantText;

        const temp = [...messages];

        temp.push({
          "role": "user",
          "content": userText
        });

        temp.push({
          "role": "assistant",
          "content": assistantText
        });

        setMessages(temp);

        requestAndPlayTranscriptionAudio(assistantText);

      })
      .catch((error) => {
        console.error(error);
      }
    );

  }, [newRecordingSignal]);

  return (
    <div className="App">

      <h3>{`Spanish Conversation`}</h3>

      <VoiceRecorder audioBlobRef={audioBlobRef} setNewRecordingSignal={setNewRecordingSignal} />

      {messages.map((message, index) => (
        <p key={index}>{`${message.role}: ${message.content}`}</p>
      ))}

      {audioUrl && (
        <audio autoPlay controls>
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}

      <button onClick={resetMessages}>Reset</button>
      
      <h3>{`Scenarios`}</h3>
      <p>{`Current chosen: ${SCENARIOS[chosenScenario].titleEn}`}</p>

      {SCENARIOS.map((scenario, index) => (
        <button key={index} onClick={() => {

          setMessages([{
            "role": "system",
            "content": scenario.prompt
          }]);

          setChoosenScenario(index);

        }}>{scenario.titleEn}</button>
      ))}

      {audioUrl && (
        <audio autoPlay controls>
          <source src={audioUrl} type="audio/mpeg" />
        </audio>
      )}


    </div>
  );
}

export default App;
