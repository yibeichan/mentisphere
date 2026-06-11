import { getRegion, useBrainStore } from '@/store/brainStore'

function QuizPanel() {
  const quizTargetRegionId = useBrainStore((state) => state.quizTargetRegionId)
  const quizAnsweredCount = useBrainStore((state) => state.quizAnsweredCount)
  const quizCorrectCount = useBrainStore((state) => state.quizCorrectCount)
  const quizFeedback = useBrainStore((state) => state.quizFeedback)
  const nextQuizPrompt = useBrainStore((state) => state.nextQuizPrompt)
  const resetQuiz = useBrainStore((state) => state.resetQuiz)
  const targetRegion = getRegion(quizTargetRegionId)
  const selectedRegion = getRegion(quizFeedback?.selectedRegionId ?? null)

  if (!targetRegion) {
    return null
  }

  return (
    <aside className="w-96 bg-slate-50 border-l border-slate-200 p-6 overflow-y-auto">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice Mode</p>
        <h2 className="text-2xl font-bold text-slate-950">Find The Region</h2>
      </div>

      <div className="space-y-5">
        <div className="rounded border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Prompt</p>
          <p className="mt-1 text-xl font-semibold text-slate-950">{targetRegion.name}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Select this structure in the 3D view. Use the camera buttons to change perspective before answering.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Correct</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{quizCorrectCount}</p>
          </div>
          <div className="rounded border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Answered</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{quizAnsweredCount}</p>
          </div>
        </div>

        {quizFeedback && selectedRegion && (
          <div
            className={`rounded border p-4 ${
              quizFeedback.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
            }`}
          >
            <p className={`text-sm font-semibold ${quizFeedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
              {quizFeedback.isCorrect ? 'Correct' : 'Not quite'}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              You selected <span className="font-medium">{selectedRegion.name}</span>. The target was{' '}
              <span className="font-medium">{targetRegion.name}</span>.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{targetRegion.summary}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!quizFeedback}
            onClick={nextQuizPrompt}
          >
            Next
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-500"
            onClick={resetQuiz}
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  )
}

export default QuizPanel
