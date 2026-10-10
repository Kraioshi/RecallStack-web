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
import { AppIcon } from './AppIcon'
import { QuestionCard } from './QuestionCard'
import { QuestionForm } from './QuestionForm'
import type {
  QuestionFormTopicOption,
  QuestionFormValues,
} from './QuestionForm'

import './questions.css'

interface QuestionListProps {
  topicId: string
  actions?: (busy: boolean) => ReactNode
  interactionLocked?: boolean
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
  interactionLocked = false,
  children,
  onQuestionDeleted,
  onQuestionUpdated,
}: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  )
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  )
  const [deleteError, setDeleteError] = useState<{
    questionId: string
    message: string
  } | null>(null)
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
          setError(null)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setError(
          error instanceof Error ? error.message : 'Could not load questions.',
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadQuestions()
    return () => controller.abort()
  }, [topicId, reloadKey])

  async function handleDeleteQuestion(question: Question): Promise<void> {
    if (deletingQuestionId !== null || confirmingDeleteId !== question.id) {
      return
    }

    setDeleteError(null)
    setDeletingQuestionId(question.id)

    try {
      await deleteQuestion(question.id)
      setQuestions((current) =>
        current.filter((item) => item.id !== question.id),
      )
      onQuestionDeleted?.()
    } catch (error) {
      setDeleteError({
        questionId: question.id,
        message:
          error instanceof Error ? error.message : 'Could not delete question.',
      })
    } finally {
      setDeletingQuestionId(null)
      setConfirmingDeleteId(null)
    }
  }

  async function handleStartEditing(question: Question): Promise<void> {
    if (
      interactionLocked ||
      editingQuestionId !== null ||
      openingEditorId !== null ||
      deletingQuestionId !== null ||
      confirmingDeleteId !== null
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
    interactionLocked ||
    editingQuestionId ||
    openingEditorId ||
    deletingQuestionId ||
    confirmingDeleteId,
  )

  return (
    <section className="questions-section" aria-labelledby="questions-heading">
      <div className="questions-section__header">
        <div className="questions-section__title">
          <span className="questions-section__icon" aria-hidden="true">
            <AppIcon name="book" size={20} />
          </span>
          <h2 id="questions-heading">Questions</h2>
          {!loading && !error && (
            <span className="questions-section__count">{questions.length}</span>
          )}
        </div>
        {actions?.(actionsDisabled)}
      </div>

      {children}

      {editError && (
        <p className="question-form__error question-list__error" role="alert">
          <AppIcon name="alert-circle" size={18} />
          <span>{editError}</span>
        </p>
      )}
      {openingEditorId && (
        <p className="question-list__message" role="status">
          Loading topics for editing...
        </p>
      )}

      {loading ? (
        <div
          className="question-list__loading"
          role="status"
          aria-label="Loading questions"
        >
          <span>Loading questions...</span>
          <div className="question-list__skeleton" aria-hidden="true" />
          <div className="question-list__skeleton" aria-hidden="true" />
          <div className="question-list__skeleton" aria-hidden="true" />
        </div>
      ) : error ? (
        <div className="question-list__empty" role="alert">
          <span className="question-list__empty-icon">
            <AppIcon name="alert-circle" size={26} />
          </span>
          <h3>Could not load questions</h3>
          <p>{error}</p>
          <button
            type="button"
            className="ui-button ui-button--secondary"
            onClick={() => {
              setLoading(true)
              setError(null)
              setReloadKey((key) => key + 1)
            }}
          >
            <AppIcon name="refresh" size={17} />
            Try again
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="question-list__empty">
          <span className="question-list__empty-icon">
            <AppIcon name="book" size={26} />
          </span>
          <h3>No questions in this topic yet</h3>
          <p>Add a question to start building your study collection.</p>
        </div>
      ) : (
        <ol className="question-list" role="list">
          {questions.map((question, index) =>
            editingQuestionId === question.id ? (
              <li
                className="question-card question-card--editing"
                key={question.id}
              >
                <div className="question-card__edit-heading">
                  <span className="question-card__number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3>Edit question</h3>
                    <p>Update the question or move it to a different topic.</p>
                  </div>
                </div>
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
                number={index + 1}
                deleting={deletingQuestionId === question.id}
                confirmingDelete={confirmingDeleteId === question.id}
                deleteError={
                  deleteError?.questionId === question.id
                    ? deleteError.message
                    : null
                }
                actionsDisabled={actionsDisabled}
                onEdit={(item) => void handleStartEditing(item)}
                onRequestDelete={(item) => {
                  if (actionsDisabled) return
                  setDeleteError(null)
                  setConfirmingDeleteId(item.id)
                }}
                onCancelDelete={() => setConfirmingDeleteId(null)}
                onDelete={(item) => void handleDeleteQuestion(item)}
              />
            ),
          )}
        </ol>
      )}
    </section>
  )
}
