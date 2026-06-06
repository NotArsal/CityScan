import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onVoiceRecorded?: (audioBlob: Blob) => void;
  className?: string;
}

const VoiceRecorder = ({ onVoiceRecorded, className = "" }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        onVoiceRecorded?.(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Speak clearly to record your complaint details",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Please allow microphone access to record voice notes",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setIsPlaying(false);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`border-accent/20 bg-gradient-to-r from-accent/5 to-secondary/5 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Voice Note (Optional)</h3>
            {isRecording && (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm font-mono text-destructive">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isRecording && !audioBlob && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startRecording}
                className="flex-1"
              >
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={stopRecording}
                className="flex-1"
              >
                <MicOff className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            )}

            {audioBlob && !isRecording && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isPlaying ? pauseAudio : playAudio}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={deleteRecording}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground flex-1">
                  Voice note recorded
                </span>
              </>
            )}
          </div>

          <audio ref={audioRef} className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;