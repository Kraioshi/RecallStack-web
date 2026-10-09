import type { QuestionDifficulty } from '../types/question'
import type { QuestionCounts } from '../types/topic'

interface PracticeFiltersProps {
  difficulty: QuestionDifficulty | ''
  includeDescendants: boolean
  showDescendants: boolean
  questionCounts: QuestionCounts | null
  onDifficultyChange: (value: QuestionDifficulty | '') => void
  onIncludeDescendantsChange: (value: boolean) => void
}

export function PracticeFilters({
  difficulty,
  includeDescendants,
  showDescendants,
  questionCounts,
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
          <option value="">
            All difficulties{questionCounts ? ` (${questionCounts.total})` : ''}
          </option>
          <option value="easy">
            Easy{questionCounts ? ` (${questionCounts.easy})` : ''}
          </option>
          <option value="medium">
            Medium{questionCounts ? ` (${questionCounts.medium})` : ''}
          </option>
          <option value="hard">
            Hard{questionCounts ? ` (${questionCounts.hard})` : ''}
          </option>
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
