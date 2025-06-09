import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>OpenT3Chat</h1>
        <p>OpenT3Chat is a chat application that uses OpenAI's GPT-3.5-turbo model to generate responses to user queries.</p>
        <p>Enter your OpenAI API key in the input field below:</p>
        <input type="text" />
        <button>Submit</button>
      </main>
    </div>
  );
}
