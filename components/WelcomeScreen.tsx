import { SparklesIcon, NewspaperIcon, CodeIcon, GraduationCapIcon } from '@/components/Icons';

export default function WelcomeScreen() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10">
      <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
        <div className="w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8">
          <h2 className="text-3xl font-semibold">How can I help you?</h2>
          <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
            <button className="..."><SparklesIcon className="max-sm:block" /><div>Create</div></button>
            <button className="..."><NewspaperIcon className="max-sm:block" /><div>Explore</div></button>
            <button className="..."><CodeIcon className="max-sm:block" /><div>Code</div></button>
            <button className="..."><GraduationCapIcon className="max-sm:block" /><div>Learn</div></button>
          </div>
          <div className="flex flex-col text-foreground">
            {/* Suggestion buttons */}
            <div className="flex items-start gap-2 border-t border-secondary/40 py-1 first:border-none">
                <button className="w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3">
                    <span>How does AI work?</span>
                </button>
            </div>
            {/* ... other suggestions */}
          </div>
        </div>
      </div>
    </div>
  );
}
// NOTE: I've truncated the repetitive button classes for brevity. Copy the full classes from the original.