import React, { useState } from 'react'
import { DocsThemeConfig, useTheme } from 'nextra-theme-docs'



// update the imports
const Modal = ({ children, open, onClose }) => {
  const theme = useTheme();
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
      }}
      onClick={onClose}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: theme.resolvedTheme === 'dark' ? '#1a1a1a' : 'white',
          padding: 20,
          borderRadius: 5,
          width: '80%',
          maxWidth: 700,
          maxHeight: '80%',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const Search = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const answerQuestion = async (e: any) => {
    e.preventDefault();
    setAnswer("");
    // build the contextualized prompt
    const promptResponse = await fetch("/api/buildPrompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: question,
      }),
    });
    const promptData = await promptResponse.json();
    // send it to ChatGPT
    const response = await fetch("/api/qa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: promptData.prompt,
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    // read the streaming ChatGPT answer
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      // update our interface with the answer
      setAnswer((prev) => prev + chunkValue);
    }
  };
  return (
    <>
      <input
        placeholder="Soru sor"
        onClick={() => setOpen(true)}
        type="text"
        style={{ border: '1px black solid', borderRadius: '10px' }}
      />
      <Modal open={open} onClose={() => setOpen(false)}>
        <form onSubmit={answerQuestion} className="nx-flex nx-gap-3">
          <input
            style={{
              flexGrow: 1,
              width: '100%',
            }}
            placeholder="Soru sor"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button style={{
            border: '1px black solid',
            borderRadius: '10px',
            backgroundColor: 'white',
            color: 'black',
            width: '100px',

          }} type="submit">
            Ask
          </button>
        </form>
        <p>
          {answer}
        </p>
      </Modal>
    </>
  );
}


const config: DocsThemeConfig = {
  logo: <span>My Project</span>,
  project: {
    link: 'https://github.com/shuding/nextra-docs-template',
  },
  chat: {
    link: 'https://discord.com',
  },
  docsRepositoryBase: 'https://github.com/shuding/nextra-docs-template',
  footer: {
    text: 'Nextra Docs Template',
  },
  // add this to use our Search component
  search: {
    component: <Search />
  }
}

export default config