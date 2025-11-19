import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, X, Send, Mic, Image as ImageIcon, Loader2, StopCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input || "Analyser l'image",
      ...(selectedImage && { image: selectedImage }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const apiMessages = messages.concat(userMessage).map(msg => {
        if (msg.image) {
          return {
            role: msg.role,
            content: [
              { type: 'text', text: msg.content },
              { type: 'image_url', image_url: { url: msg.image } },
            ],
          };
        }
        return { role: msg.role, content: msg.content };
      });

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { messages: apiMessages },
      });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || "Erreur de communication");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content || "Aucune réponse reçue",
      }]);

      // Émettre un événement pour rafraîchir l'organigramme après succès
      const refreshEvent = new CustomEvent('aiAssistantSuccess');
      window.dispatchEvent(refreshEvent);
    } catch (error: any) {
      // Supprimer le dernier message utilisateur en cas d'erreur serveur uniquement
      setMessages(prev => prev.slice(0, -1));

      const description = error.message?.includes("Aucune personne trouvée")
        ? "Impossible de trouver cette personne dans l'organigramme. Vérifiez qu'elle existe bien ou importez-la d'abord."
        : (error.message || "Impossible de traiter la demande");

      toast({
        title: "Erreur de l'assistant IA",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image valide",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop the recording without processing
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear audio chunks
      audioChunksRef.current = [];
      setIsRecording(false);
      
      toast({
        title: "Enregistrement annulé",
        description: "L'enregistrement audio a été annulé",
      });
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];

        console.log('Transcribing audio...');
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Data },
        });

        if (error) {
          console.error('Transcription error:', error);
          throw new Error(error.message || 'Erreur de transcription');
        }

        if (data?.text) {
          setInput(data.text);
          toast({
            title: "Transcription réussie",
            description: "L'audio a été transcrit automatiquement",
          });
        } else {
          throw new Error('Aucune transcription reçue');
        }
      };
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      toast({
        title: "Erreur de transcription",
        description: error.message || "Impossible de transcrire l'audio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Assistant IA</h3>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">Donnez-moi des informations à modifier</p>
            <p className="text-sm">
              Mentionnez simplement un nom, un titre, une section...
              <br />
              Je vous demanderai confirmation avant toute modification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded"
                      className="rounded mb-2 max-w-full"
                    />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t space-y-2">
        {selectedImage && (
          <div className="relative inline-block">
            <img
              src={selectedImage}
              alt="Selected"
              className="h-20 rounded border"
            />
            <Button
              onClick={() => setSelectedImage(null)}
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="icon"
            disabled={isLoading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          {isRecording ? (
            <>
              <Button
                onClick={stopRecording}
                variant="default"
                size="icon"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <StopCircle className="h-4 w-4" />
              </Button>
              <Button
                onClick={cancelRecording}
                variant="destructive"
                size="icon"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={startRecording}
              variant="outline"
              size="icon"
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Tapez votre message..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            disabled={isLoading}
          />

          <Button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
