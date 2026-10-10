// noinspection HtmlUnknownAnchorTarget

import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useMatch } from 'react-router-dom'

import { getTopicTree } from '../../api/topics'
import type { TopicTree } from '../../types/topic'
import { AppIcon } from '../AppIcon'
import { TopicSidebar } from './TopicSidebar'

import './layout.css'

export interface LayoutContext {
  topics: TopicTree[]
  loadingTopics: boolean
  topicsError: string | null
  refreshTopics: () => void
}

/** Shared navigation and topic data stay mounted while routes change. */
export function AppLayout() {
  const topicId = useMatch('/topics/:topicId')?.params.topicId
  const location = useLocation()
  const [topics, setTopics] = useState<TopicTree[]>([])
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [topicsError, setTopicsError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
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
          />
        </aside>

        <div id="main-content" className="app-shell__content" tabIndex={-1}>
          <Outlet
            context={
              {
                topics,
                loadingTopics,
                topicsError,
                refreshTopics,
              } satisfies LayoutContext
            }
          />
        </div>
      </div>
    </div>
  )
}
