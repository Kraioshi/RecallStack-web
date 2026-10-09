import type { QuestionDifficulty } from '../types/question'

interface PracticeFiltersProps {
  difficulty: QuestionDifficulty | ''
  includeDescendants: boolean
  showDescendants: boolean
  onDifficultyChange: (value: QuestionDifficulty | '') => void
  onIncludeDescendantsChange: (value: boolean) => void
}

export function PracticeFilters({
  difficulty,
  includeDescendants,
  showDescendants,
  onDifficultyChange,
  onIncludeDescendantsChange,
}: PracticeFiltersProps) {
  return (
    <div className="practice-filters">
      <label className="practice-filters__field">
        Difficulty
        <select
          value={difficulty}
          onChange={(event) =>
            onDifficultyChange(event.target.value as QuestionDifficulty | '')
          }
        >
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </label>

      {showDescendants && (
        <label className="practice-filters__checkbox">
          <input
            type="checkbox"
            checked={includeDescendants}
            onChange={(event) =>
              onIncludeDescendantsChange(event.target.checked)
            }
          />
          Include subtopics
        </label>
      )}
    </div>
  )
}
