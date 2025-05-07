"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaPause, FaStop, FaSave, FaTimes, FaPlay } from 'react-icons/fa';
import styles from './styles.module.css';
import { API_BASE_URL, WS_URL } from "../../utils/constants";


export default function RecordPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [timerSec, setTimerSec] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);
  const wsRef = useRef(null);
  const recordingInfoRef = useRef({ duration: null, path: null });
  const intervalRef = useRef(null);
  
  
  const [formData, setFormData] = useState({
    paciente: "",
    edad: "",
    genero: "",
    fecha_consulta: "",
    doctor: "",
    motivo_consulta: "",
    cirugias_previas: "",
    alergias: "",
    presion_arterial: "",
    frecuencia_cardiaca: "",
    temperatura: "",
    peso: "",
    altura: "",
    examenes_solicitados: "",
  });

  useEffect(() => {
    if (isRecording && !isPaused && !isStopped) {
      intervalRef.current = setInterval(() => {
        setTimerSec((sec) => sec + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording, isPaused, isStopped]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      mediaRecorder.start();
      setTimerSec(0);
      setIsPaused(false);
      setIsStopped(false);
      setIsRecording(true);
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access the microphone.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsPaused(false);
      setIsStopped(true);
      mediaRecorderRef.current.addEventListener("stop", () => {
        audioBlobRef.current = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlobRef.current);
        setAudioURL(url);
      });
    }
  };

  const resetRecording = () => {
    // Reset everything
    clearInterval(intervalRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setTimerSec(0);
    setAudioURL(null);
    setTranscriptionResult(null);
    setProgress(0);
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    audioBlobRef.current = null;
  };

  // Upload the recorded audio to the backend and return recording info.
  const uploadAudio = async (audioBlob) => {
    const formDataUpload = new FormData();
    formDataUpload.append("audio", audioBlob, "consulta_audio.webm");

    console.log("Uploading audio...");
    const response = await fetch(`${API_BASE_URL}/`, {
      method: "POST",
      body: formDataUpload,
    });
    const data = await response.json();
    console.log("Response:", data);

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    console.log("Recording duration:", data.duration);
    console.log("Recording path:", data.path);
    // Save recording info in a ref to be used in the transcription message.
    recordingInfoRef.current = { duration: data.duration, path: data.path };
    return { duration: data.duration, path: data.path };
  };

  // Start transcription by establishing a WebSocket connection.
  const startTranscription = (duration, path) => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log("WebSocket connection established.");
      // Wait for connection response before sending transcription data.
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);
      if (data.type === "CONNECTION_RESPONSE") {
        const message = {
          type: "TRANSCRIBE",
          duration: duration,
          path: path,
          n_speakers: 1,
        };
        wsRef.current.send(JSON.stringify(message));
        console.log("Sent transcription info:", message);
      } else if (data.type === "TRANSCRIPTION_PROGRESS") {
        setProgress(data.progress);
        console.log("Transcription progress:", data.progress);
      } else if (data.type === "TRANSCRIPTION_COMPLETED") {
        setTranscriptionResult(data.transcription);
        setProgress(0);
        console.log("Transcription completed:", data.transcription);
        wsRef.current.send(JSON.stringify({ type: "GET_DATA", path: data.path }));
      } else if (data.type === "DATA_RESPONSE") {
        // Fill the form with the data received from the backend.
        const payload = data.data || data;
        setFormData({
          paciente: payload.paciente || "",
          edad: payload.edad || "",
          genero: payload.genero || "",
          fecha_consulta: payload.fecha_consulta || "",
          doctor: payload.doctor || "",
          motivo_consulta: payload.motivo_consulta || "",
          cirugias_previas: (payload.cirugias_previas || []).join(", "),
          alergias: (payload.alergias || []).join(", "),
          presion_arterial: payload.presion_arterial || "",
          frecuencia_cardiaca: payload.frecuencia_cardiaca || "",
          temperatura: payload.temperatura || "",
          peso: payload.peso || "",
          altura: payload.altura || "",
          examenes_solicitados: (payload.examenes_solicitados || []).join(", "),
        });
        console.log("Form data updated from backend:", payload);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  // Handle the full recording process: upload audio and start transcription.
  const postRecording = async () => {
    try {
      const { duration, path } = await uploadAudio(audioBlobRef.current);
      startTranscription(duration, path);
    } catch (error) {
      console.error("Error in postRecording:", error);
    }
  };

  // Handle changes in the form inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // When the user submits the form, send a SUBMIT_DATA message.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: "SUBMIT_DATA",
        data: {
          ...formData,
          // Convert comma-separated string fields into arrays if needed.
          cirugias_previas: formData.cirugias_previas.split(",").map(s => s.trim()).filter(Boolean),
          alergias: formData.alergias.split(",").map(s => s.trim()).filter(Boolean),
          examenes_solicitados: formData.examenes_solicitados.split(",").map(s => s.trim()).filter(Boolean),
        }
      };
      wsRef.current.send(JSON.stringify(message));
      console.log("Submitted form data:", message);
    } else {
      console.error("WebSocket is not open. Cannot submit data.");
    }
  };

  return (
    <div className={styles.recordPanel}>
      <h1 className={styles.recordTitle}>Comienza a grabar</h1>
        {!isRecording ? (
          <div className={styles.micButton}  onClick={startRecording}>
          <FaMicrophone className={`${styles.micIcon} ${isRecording || isPaused ? styles.expanded : ''}`} />
          </div>
        ) : (
          <div className={`${styles.micButton} ${isRecording || isPaused ? styles.expanded : ''}`}>
          <div className={styles.recordingContainer}>
            <div className={styles.timer}>{formatTime(timerSec)}</div>
            <div className={styles.optionsContainer}>
              {!isStopped ? (
              !isPaused ? (
                <FaPause className={styles.optionsIcon} onClick={pauseRecording} />
              ) : (
                <FaPlay className={styles.optionsIcon} onClick={resumeRecording} />
              )
              ) :(
                <FaPause className={styles.optionsIconDisabled} />
              )}
              <FaStop className={styles.optionsIcon} onClick={stopRecording} />
              {isStopped ? (
                <FaSave className={styles.optionsIcon} onClick={resetRecording}/>
              ) : (
                <FaSave className={styles.optionsIconDisabled} />
              )}
            </div>
            <FaTimes className={styles.closeIcon} onClick={resetRecording}/>
          </div>
          </div>
        )}
    </div>
  );
}