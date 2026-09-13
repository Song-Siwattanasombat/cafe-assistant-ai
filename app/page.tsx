'use client';

import { useEffect, useRef, useState } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const starterMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content: 'Hi! I can help with daily menus, prices, ingredients, and allergens.',
  },
];

const suggestedQuestions = [
  "Monday's menu",
  "Tuesday's menu",
  "Wednesday's menu",
  "Thursday's menu",
  "Friday's menu",

];

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll for new messages
  useEffect(() => {
    if (messages.length <= starterMessages.length) return;

    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!showAbout) return;

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setShowAbout(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [showAbout]);

  const sendMessage = async (suggestedQuestion?: string): Promise<void> => {
    const trimmed = (suggestedQuestion ?? input).trim();
    if (!trimmed || loading) return;

    // add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
    };

    const baseMessages = [...messages, userMessage];
    setMessages([...baseMessages, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    try {
      // API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: baseMessages,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      // read streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // put JSON lines from stream
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          try {
            const parsed = JSON.parse(trimmedLine);
            const token = parsed.message?.content || '';

            if (token) {
              assistantText += token;
              // update real-time
              setMessages([
                ...baseMessages,
                {
                  role: 'assistant',
                  content: assistantText,
                },
              ]);
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setMessages([
        ...baseMessages,
        {
          role: 'assistant',
          content: `Error: ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // enter key to send message, shift + enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  // clear chat to starter messages
  const clearChat = (): void => {
    if (loading) return;
    setMessages(starterMessages);
  };

  return (
    <main className="page">
      <section className="chat-card">
        <div className="chat-header">
          <div className="header-copy">
            <h1><span aria-hidden="true">🍅</span> School Café Assistant AI</h1>
            <p>
              Daily menus, prices, ingredients, and allergen information
              <span className="prototype-note">
                Menu available for 7–11 September 2026 only.
              </span>
            </p>
          </div>
          <div className="header-actions">
            <button
              className="secondary-btn"
              onClick={() => setShowAbout(true)}
              type="button"
            >
              About
            </button>
            <button className="secondary-btn" onClick={clearChat} type="button">
              Clear
            </button>
          </div>
        </div>

        <div className="messages">
          {messages.map((msg, index) => (
            <div className="message-group" key={index}>
              <div
                className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="message-bubble">
                  <div className="message-role">
                    {msg.role === 'user' ? 'You' : 'Café Assistant'}
                  </div>
                  <div className="message-text">{msg.content}</div>
                </div>
              </div>
              {index === 0 && msg.role === 'assistant' && (
                <div className="quick-replies" aria-label="Suggested questions">
                  {suggestedQuestions.map((question) => (
                    <button
                      className="quick-reply-btn"
                      disabled={loading}
                      key={question}
                      onClick={() => void sendMessage(question)}
                      type="button"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="typing-indicator">Café Assistant is typing...</div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="composer">
          <textarea
            placeholder="Ask about today's menu, prices, or ingredients"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <button
            className="primary-btn"
            aria-label="Send message"
            onClick={() => void sendMessage()}
            disabled={loading}
            type="button"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <footer className="site-footer">
          Made by Song Siwattanasombat · An educational portfolio project · Not affiliated with any institution
        </footer>
      </section>

      {showAbout && (
        <div
          className="modal-backdrop"
          onClick={() => setShowAbout(false)}
          role="presentation"
        >
          <section
            aria-labelledby="about-title"
            aria-modal="true"
            className="about-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close About"
              className="modal-close"
              onClick={() => setShowAbout(false)}
              type="button"
            >
              ×
            </button>
            <span className="modal-kicker">About this project</span>
            <h2 id="about-title">🍅 School Café Assistant AI</h2>
            <p>
              An educational portfolio prototype by Song Siwattanasombat,
              designed to explore AI-assisted access to sample school café menus.
            </p>
            <div className="development-note">
              <strong>Currently in development</strong>
              <p>
                Responses may be slow, incomplete, or inconsistent because the
                project uses a small local AI model running on CPU and prototype data.
              </p>
            </div>
            <p className="modal-disclaimer">
              Not affiliated with any institution.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
