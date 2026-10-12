import { useEffect, useState } from 'react'
import {
  Link,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom'

import {
  createTopic,
  deleteTopic,
  getTopicTree,
  updateTopic,
} from '../../api/topics'
import type { Topic, TopicTree } from '../../types/topic'
import { AppIcon } from '../AppIcon'
import { TopicSidebar } from './TopicSidebar'
import { findTopicPath } from './topicTreeUtils'
import { TopicDeleteDialog, TopicEditorDialog } from '../topics/TopicDialogs'
import type { TopicFormValues } from '../topics/TopicDialogs'

import './layout.css'

type TopicModal =
  | { mode: 'create'; parent: Topic | null }
  | { mode: 'edit' | 'delete'; topic: Topic }

export interface LayoutContext {
  topics: TopicTree[]
  loadingTopics: boolean
  topicsError: string | null
  refreshTopics: () => void
  topicMutationVersion: number
  openCreateTopic: (parent?: Topic | null) => void
  openEditTopic: (topic: Topic) => void
  openDeleteTopic: (topic: Topic) => void
}

/** Shared navigation and topic data stay mounted while routes change. */
export function AppLayout() {
  const topicId = useMatch('/topics/:topicId')?.params.topicId
  const location = useLocation()
  const navigate = useNavigate()
  const [topics, setTopics] = useState<TopicTree[]>([])
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [topicsError, setTopicsError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [topicMutationVersion, setTopicMutationVersion] = useState(0)
  const [modal, setModal] = useState<TopicModal | null>(null)
  const [topicNotice, setTopicNotice] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    getTopicTree(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setTopics(data)
        setTopicsError(null)
        setLoadingTopics(false)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setTopicsError(
          error instanceof Error ? error.message : 'Could not load topics.',
        )
        setLoadingTopics(false)
      })

    return () => controller.abort()
  }, [reloadKey])

  // Escape closes the mobile topic drawer; avoid obscuring the content on narrow screens.
  useEffect(() => {
    if (!sidebarOpen) return
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [sidebarOpen])

  const refreshTopics = () => setReloadKey((key) => key + 1)
  const onTopicRoute = location.pathname.startsWith('/topics/')

  function openCreateTopic(parent: Topic | null = null) {
    setSidebarOpen(false)
    setTopicNotice(null)
    setModal({ mode: 'create', parent })
  }

  function openEditTopic(topic: Topic) {
    setTopicNotice(null)
    setModal({ mode: 'edit', topic })
  }

  function openDeleteTopic(topic: Topic) {
    setTopicNotice(null)
    setModal({ mode: 'delete', topic })
  }

  function afterMutation() {
    refreshTopics()
    setTopicMutationVersion((version) => version + 1)
  }

  async function saveTopic(values: TopicFormValues) {
    if (!modal) return
    if (modal.mode === 'create') {
      const created = await createTopic({
        ...values,
        parentId: modal.parent?.id ?? null,
      })
      setModal(null)
      afterMutation()
      setTopicNotice(`Topic “${created.name}” created.`)
      navigate(`/topics/${created.id}`)
    } else if (modal.mode === 'edit') {
      // PATCH rather than PUT: changing the name does not change the parent.
      const updated = await updateTopic(modal.topic.id, values)
      setModal(null)
      afterMutation()
      setTopicNotice(`Topic “${updated.name}” updated.`)
    }
  }

  async function confirmDeleteTopic() {
    if (!modal || modal.mode !== 'delete') return
    const deleted = modal.topic
    await deleteTopic(deleted.id)
    setModal(null)
    afterMutation()
    navigate(deleted.parent_id ? `/topics/${deleted.parent_id}` : '/')
    setTopicNotice(`Topic “${deleted.name}” deleted.`)
  }

  const deletionTree =
    modal?.mode === 'delete'
      ? findTopicPath(topics, modal.topic.id).at(-1)
      : null
  const deleteBlockReason =
    modal?.mode !== 'delete'
      ? null
      : !deletionTree
        ? 'Cannot verify topic contents. Refresh the topic list before deleting.'
        : deletionTree.children.length > 0
          ? 'Delete its subtopics first. Parent topics cannot be deleted while they have children.'
          : deletionTree.question_counts.total > 0
            ? 'Delete or move its questions first to avoid losing study material.'
            : null

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <div className="app-header__inner">
          <button
            type="button"
            className="app-header__menu"
            aria-label={sidebarOpen ? 'Close topics' : 'Open topics'}
            aria-expanded={sidebarOpen}
            aria-controls="topic-sidebar"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <AppIcon name={sidebarOpen ? 'close' : 'menu'} size={23} />
          </button>
          <Link
            to="/"
            className="app-brand"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="app-brand__symbol">
              <AppIcon name="layers" size={28} />
            </span>
            <span>
              Recall<span className="app-brand__accent">Stack</span>
            </span>
          </Link>

          <div className="app-header__actions">
            <label className="app-header__search" htmlFor="header-topic-search">
              <AppIcon name="search" size={19} />
              <span className="sr-only">Search topics</span>
              <input
                id="header-topic-search"
                type="search"
                placeholder="Search topics..."
                value={search}
                onFocus={() => setSidebarOpen(true)}
                onChange={(event) => setSearch(event.target.value)}
                autoComplete="off"
              />
            </label>
            <Link
              to="/practice"
              className="app-header__practice"
              onClick={() => setSidebarOpen(false)}
            >
              <AppIcon name="play" size={17} />
              <span>Practice</span>
            </Link>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Close topics menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="app-shell__body">
        <aside
          id="topic-sidebar"
          className={`topic-sidebar${sidebarOpen ? ' topic-sidebar--open' : ''}`}
        >
          <TopicSidebar
            topics={topics}
            loading={loadingTopics}
            error={topicsError}
            selectedTopicId={onTopicRoute ? topicId : undefined}
            search={search}
            onSearchChange={setSearch}
            onNavigate={() => setSidebarOpen(false)}
            onRetry={refreshTopics}
            onCreateTopic={() => openCreateTopic()}
          />
        </aside>

        <div id="main-content" className="app-shell__content" tabIndex={-1}>
          {topicNotice && (
            <div className="topic-mutation-notice" role="status">
              <span>{topicNotice}</span>
              <button
                type="button"
                onClick={() => setTopicNotice(null)}
                aria-label="Dismiss notification"
              >
                <AppIcon name="close" size={16} />
              </button>
            </div>
          )}
          <Outlet
            context={
              {
                topics,
                loadingTopics,
                topicsError,
                refreshTopics,
                topicMutationVersion,
                openCreateTopic,
                openEditTopic,
                openDeleteTopic,
              } satisfies LayoutContext
            }
          />
        </div>
      </div>
      {modal?.mode === 'create' && (
        <TopicEditorDialog
          key={`create-${modal.parent?.id ?? 'root'}`}
          mode="create"
          parent={modal.parent}
          onSubmit={saveTopic}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.mode === 'edit' && (
        <TopicEditorDialog
          key={`edit-${modal.topic.id}`}
          mode="edit"
          topic={modal.topic}
          onSubmit={saveTopic}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.mode === 'delete' && (
        <TopicDeleteDialog
          key={`delete-${modal.topic.id}`}
          topic={modal.topic}
          blockingReason={deleteBlockReason}
          onConfirm={confirmDeleteTopic}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  )
}
