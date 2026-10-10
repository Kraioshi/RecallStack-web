import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import {
  deleteQuestion,
  getQuestionsByTopic,
  updateQuestion,
} from '../api/questions'
import { getTopicTree } from '../api/topics'
import type { Question } from '../types/question'
import type { TopicTree } from '../types/topic'
import { QuestionCard } from './QuestionCard'
import { QuestionForm } from './QuestionForm'
import type {
  QuestionFormTopicOption,
  QuestionFormValues,
} from './QuestionForm'

import './questions.css'

interface QuestionListProps {
  topicId: string
  actions?: ReactNode
  children?: ReactNode
  onQuestionDeleted?: () => void
  onQuestionUpdated?: () => void
}

// Keep full paths visible, because subtopics can have the same name.
function getTopicOptions(
  topics: TopicTree[],
  parents: string[] = [],
): QuestionFormTopicOption[] {
  return topics.flatMap((topic) => {
    const path = [...parents, topic.name]

    return [
      { id: topic.id, label: path.join(' / ') },
      ...getTopicOptions(topic.children, path),
    ]
  })
}

export function QuestionList({
  topicId,
  actions,
  children,
  onQuestionDeleted,
  onQuestionUpdated,
}: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  )
  const [openingEditorId, setOpeningEditorId] = useState<string | null>(null)
  const [topicOptions, setTopicOptions] = useState<QuestionFormTopicOption[]>(
    [],
  )
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadQuestions() {
      try {
        const data = await getQuestionsByTopic(topicId, controller.signal)
        if (!controller.signal.aborted) {
          setQuestions(data)
        }
      } catch (error) {
        if (controller.signal.aborted) return

        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadQuestions()
    return () => controller.abort()
  }, [topicId])

  async function handleDeleteQuestion(question: Question): Promise<void> {
    if (
      deletingQuestionId !== null ||
      editingQuestionId !== null ||
      openingEditorId !== null
    ) {
      return
    }

    const confirmed = window.confirm(
      `Delete this question?\n\n${question.question.slice(0, 120)}\n\nThis action cannot be undone.`,
    )
    if (!confirmed) return

    setDeleteError(null)
    setDeletingQuestionId(question.id)

    try {
      await deleteQuestion(question.id)
      setQuestions((current) =>
        current.filter((item) => item.id !== question.id),
      )
      onQuestionDeleted?.()
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Could not delete question.',
      )
    } finally {
      setDeletingQuestionId(null)
    }
  }

  async function handleStartEditing(question: Question): Promise<void> {
    if (
      editingQuestionId !== null ||
      openingEditorId !== null ||
      deletingQuestionId !== null
    ) {
      return
    }

    setEditError(null)
    setOpeningEditorId(question.id)

    try {
      // Load the full tree only when needed; the context tree omits other branches.
      const tree = await getTopicTree()
      const options = getTopicOptions(tree)

      if (!options.some((option) => option.id === question.topic_id)) {
        setEditError('Current topic is missing from the topic tree.')
        return
      }

      setTopicOptions(options)
      setEditingQuestionId(question.id)
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : 'Could not open the editor.',
      )
    } finally {
      setOpeningEditorId(null)
    }
  }

  async function handleUpdateQuestion(
    question: Question,
    values: QuestionFormValues,
  ): Promise<void> {
    const updated = await updateQuestion(question.id, {
      question: values.question,
      answer: values.answer,
      difficulty: values.difficulty,
      topicId: values.topicId,
    })

    setQuestions((current) =>
      updated.topic_id === topicId
        ? current.map((item) => (item.id === updated.id ? updated : item))
        : current.filter((item) => item.id !== updated.id),
    )
    setEditingQuestionId(null)
    onQuestionUpdated?.()
  }

  const actionsDisabled = Boolean(
    editingQuestionId || openingEditorId || deletingQuestionId,
  )

  return (
    <section className="questions-section" aria-labelledby="questions-heading">
      <div className="questions-section__header">
        <h2 id="questions-heading">Questions</h2>
        {actions}
      </div>

      {children}

      {deleteError && (
        <p className="question-form__error" role="alert">
          {deleteError}
        </p>
      )}
      {editError && (
        <p className="question-form__error" role="alert">
          {editError}
        </p>
      )}
      {openingEditorId && <p role="status">Loading topics for editing...</p>}

      {loading ? (
        <p>Loading questions...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : questions.length === 0 ? (
        <p>No questions in this topic yet.</p>
      ) : (
        <ul className="question-list">
          {questions.map((question) =>
            editingQuestionId === question.id ? (
              <li className="question-card" key={question.id}>
                <h3>Edit question</h3>
                <QuestionForm
                  initialValues={{
                    question: question.question,
                    answer: question.answer,
                    difficulty: question.difficulty,
                  }}
                  initialTopicId={question.topic_id}
                  topicOptions={topicOptions}
                  onSubmit={(values) => handleUpdateQuestion(question, values)}
                  onCancel={() => setEditingQuestionId(null)}
                  submitLabel="Save changes"
                />
              </li>
            ) : (
              <QuestionCard
                key={question.id}
                question={question}
                deleting={deletingQuestionId === question.id}
                actionsDisabled={actionsDisabled}
                onEdit={(item) => void handleStartEditing(item)}
                onDelete={(item) => void handleDeleteQuestion(item)}
              />
            ),
          )}
        </ul>
      )}
    </section>
  )
}
