
import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import type { Topic } from '../../types/topic'
import { AppIcon } from '../AppIcon'

import './topicDialogs.css'

export interface TopicFormValues {
  name: string
  slug: string
  description: string | null
}

/**
 * Generate a URL-friendly slug from a topic name.
 */
function suggestSlug(name: string): string {
  return name
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100)
      .replace(/-+$/g, '')
}

function useModalDialog() {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    dialog.showModal()

    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return ref
}

interface TopicEditorDialogProps {
  mode: 'create' | 'edit'
  topic?: Topic
  parent?: Topic | null
  onSubmit: (values: TopicFormValues) => Promise<void>
  onCancel: () => void
}

export function TopicEditorDialog({
                                    mode,
                                    topic,
                                    parent,
                                    onSubmit,
                                    onCancel,
                                  }: TopicEditorDialogProps) {
  const dialogRef = useModalDialog()
  const id = useId()

  const [name, setName] = useState(topic?.name ?? '')
  const [slug, setSlug] = useState(topic?.slug ?? '')
  const [description, setDescription] = useState(topic?.description ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    // Generate the slug during creation.
    // Preserve the existing slug during editing unless explicitly changed.
    const trimmedSlug =
        mode === 'create'
            ? suggestSlug(trimmedName)
            : slug.trim().toLowerCase()

    if (!trimmedName) {
      setError('Topic name is required.')
      return
    }

    if (!trimmedSlug) {
      setError(
          mode === 'create'
              ? 'Could not generate a slug. Use at least one Latin letter or number in the topic name.'
              : 'Topic slug is required.',
      )
      return
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
      setError('Use lowercase letters, numbers, and hyphens in the slug.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSubmit({
        name: trimmedName,
        slug: trimmedSlug,
        description: description.trim() || null,
      })
    } catch (reason) {
      setError(
          reason instanceof Error ? reason.message : 'Unable to save topic.',
      )
    } finally {
      setSaving(false)
    }
  }

  const title =
      mode === 'edit'
          ? 'Edit topic'
          : parent
              ? `Add subtopic to ${parent.name}`
              : 'Create root topic'

  return (
      <dialog
          ref={dialogRef}
          className="topic-dialog"
          aria-labelledby={`${id}-title`}
          onCancel={(event) => {
            if (saving) event.preventDefault()
            else onCancel()
          }}
      >
        <div className="topic-dialog__heading">
          <div>
            <span className="topic-dialog__eyebrow">TOPIC MANAGEMENT</span>
            <h2 id={`${id}-title`}>{title}</h2>
          </div>

          <button
              type="button"
              className="topic-dialog__close"
              aria-label="Close topic form"
              onClick={onCancel}
              disabled={saving}
          >
            <AppIcon name="close" size={19} />
          </button>
        </div>

        <form
            className="topic-dialog__form"
            onSubmit={(event) => void handleSubmit(event)}
        >
          {mode === 'create' && (
              <p className="topic-dialog__context">
                {parent
                    ? `This topic will be created under “${parent.name}”.`
                    : 'This topic will appear at the top level of your knowledge tree.'}
              </p>
          )}

          <div className="topic-dialog__field">
            <label htmlFor={`${id}-name`}>Name</label>
            <input
                id={`${id}-name`}
                type="text"
                value={name}
                autoFocus
                required
                maxLength={100}
                disabled={saving}
                placeholder="e.g. FastAPI Fundamentals"
                onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="topic-dialog__field">
            <label htmlFor={`${id}-description`}>
              Description <span>(optional)</span>
            </label>

            <textarea
                id={`${id}-description`}
                rows={4}
                value={description}
                disabled={saving}
                placeholder="What should you study in this topic?"
                onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          {mode === 'edit' && (
              <details className="topic-dialog__advanced">
                <summary>Advanced settings</summary>

                <div className="topic-dialog__field">
                  <label htmlFor={`${id}-slug`}>Slug</label>

                  <input
                      id={`${id}-slug`}
                      type="text"
                      value={slug}
                      maxLength={100}
                      spellCheck={false}
                      disabled={saving}
                      placeholder="fastapi-fundamentals"
                      onChange={(event) => setSlug(event.target.value)}
                  />

                  <small>
                    Used as a URL-friendly identifier. Must be unique among
                    sibling topics. Changing the topic name does not change
                    its slug.
                  </small>
                </div>
              </details>
          )}

          {error && (
              <p className="topic-dialog__error" role="alert">
                <AppIcon name="alert-circle" size={17} />
                {error}
              </p>
          )}

          <div className="topic-dialog__actions">
            <button
                type="button"
                className="ui-button ui-button--secondary"
                disabled={saving}
                onClick={onCancel}
            >
              Cancel
            </button>

            <button
                type="submit"
                className="ui-button ui-button--primary"
                disabled={saving}
            >
              {saving
                  ? 'Saving...'
                  : mode === 'create'
                      ? 'Create topic'
                      : 'Save changes'}
            </button>
          </div>
        </form>
      </dialog>
  )
}

interface TopicDeleteDialogProps {
  topic: Topic
  blockingReason: string | null
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function TopicDeleteDialog({
                                    topic,
                                    blockingReason,
                                    onConfirm,
                                    onCancel,
                                  }: TopicDeleteDialogProps) {
  const dialogRef = useModalDialog()
  const id = useId()

  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)

    try {
      await onConfirm()
    } catch (reason) {
      setError(
          reason instanceof Error ? reason.message : 'Unable to delete topic.',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
      <dialog
          ref={dialogRef}
          className="topic-dialog topic-dialog--delete"
          aria-labelledby={`${id}-title`}
          onCancel={(event) => {
            if (deleting) event.preventDefault()
            else onCancel()
          }}
      >
        <div className="topic-dialog__heading">
          <div>
            <span className="topic-dialog__eyebrow">DANGER ZONE</span>
            <h2 id={`${id}-title`}>Delete topic?</h2>
          </div>

          <button
              type="button"
              className="topic-dialog__close"
              disabled={deleting}
              aria-label="Close confirmation"
              onClick={onCancel}
          >
            <AppIcon name="close" size={19} />
          </button>
        </div>

        <p className="topic-dialog__context">
          You are about to delete <strong>{topic.name}</strong>. This action
          cannot be undone.
        </p>

        {blockingReason && (
            <p className="topic-dialog__warning" role="status">
              <AppIcon name="alert-circle" size={19} />
              {blockingReason}
            </p>
        )}

        {error && (
            <p className="topic-dialog__error" role="alert">
              {error}
            </p>
        )}

        <div className="topic-dialog__actions">
          <button
              type="button"
              className="ui-button ui-button--secondary"
              disabled={deleting}
              onClick={onCancel}
          >
            Cancel
          </button>

          <button
              type="button"
              className="ui-button topic-dialog__danger"
              disabled={deleting || blockingReason !== null}
              onClick={() => void handleDelete()}
          >
            {deleting ? 'Deleting...' : 'Delete topic'}
          </button>
        </div>
      </dialog>
  )
}
