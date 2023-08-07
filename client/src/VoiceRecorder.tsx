import React, { useRef, useState } from 'react';

interface VoiceRecorderProps {
  audioBlobRef: React.MutableRefObject<Blob | null>;
  setNewRecordingSignal: React.Dispatch<React.SetStateAction<number>>;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  audioBlobRef,
  setNewRecordingSignal
}) => {

  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current = [event.data];
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioBlobRef.current = audioBlob;
        setNewRecordingSignal(x => x + 1);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      setError('Error starting recording: ' + error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };
  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Talking' : 'Start Talking'}
      </button>
      {error ?? <div>{error}</div>}
    </div>
  );
};

export default VoiceRecorder;
