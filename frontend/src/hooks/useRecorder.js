import { useRef, useState, useCallback } from 'react';
import { audioApi } from '@/lib/api';

// MediaRecorder hook → records mic audio, posts the Blob to /api/audio/transcribe.
export function useRecorder({ onText } = {}) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setTranscribing(true);
        try {
          const text = await audioApi.transcribe(blob);
          onText?.(text);
        } catch (e) {
          onText?.('', e);
        } finally {
          setTranscribing(false);
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e) {
      onText?.('', e);
    }
  }, [onText]);

  const stop = useCallback(() => {
    mediaRef.current?.stop();
    setRecording(false);
  }, []);

  const toggle = useCallback(() => (recording ? stop() : start()), [recording, start, stop]);

  return { recording, transcribing, start, stop, toggle };
}
