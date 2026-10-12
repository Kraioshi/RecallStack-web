import { Link, useOutletContext } from 'react-router-dom'

import { AppIcon } from '../components/AppIcon'
import type { LayoutContext } from '../components/layout/AppLayout'
import {
  totalQuestions,
  totalSubtopics,
} from '../components/layout/topicTreeUtils'

import './topics.css'

export function TopicsPage() {
  const { topics, loadingTopics, topicsError, refreshTopics, openCreateTopic } =
    useOutletContext<LayoutContext>()
  const questionCount = topics.reduce(
    (total, topic) => total + totalQuestions(topic),
    0,
  )

  return (
    <main className="topics-home">
      <section className="topics-home__hero">
        <span className="topics-home__eyebrow">YOUR STUDY SPACE</span>
        <h1>
          Learn. Recall. <span>Grow.</span>
        </h1>
        <p>
          Explore your knowledge base, revisit important concepts, and prepare
          for your next interview.
        </p>
        <div className="topics-home__hero-actions">
          <Link to="/practice" className="ui-button ui-button--primary">
            <AppIcon name="play" size={17} /> Start practicing{' '}
            <AppIcon name="arrow-right" size={17} />
          </Link>
          <a href="#root-topics" className="ui-button ui-button--secondary">
            <AppIcon name="book" size={17} /> Browse topics
          </a>
        </div>
      </section>

      <section
        className="topics-home__stats"
        aria-label="Question bank overview"
      >
        <div className="topics-home__stat">
          <span>Root topics</span>
          <strong>{topics.length}</strong>
        </div>
        <div className="topics-home__stat">
          <span>Total questions</span>
          <strong>{questionCount}</strong>
        </div>
        <div className="topics-home__stat">
          <span>Difficulty levels</span>
          <strong>3</strong>
        </div>
      </section>

      <section className="topics-home__explore" id="root-topics">
        <div className="topics-home__section-title">
          <div>
            <span className="topics-home__eyebrow">EXPLORE YOUR KNOWLEDGE</span>
            <h2>Topics</h2>
            <p>Select an area to browse its questions and subtopics.</p>
          </div>
          <button
            type="button"
            className="ui-button ui-button--secondary topics-home__create"
            onClick={() => openCreateTopic()}
          >
            <AppIcon name="plus" size={17} /> New root topic
          </button>
        </div>

        {loadingTopics && topics.length === 0 ? (
          <p role="status" className="topics-home__state">
            Loading topics...
          </p>
        ) : topicsError && topics.length === 0 ? (
          <div role="alert" className="topics-home__state">
            <p>Could not load your topics.</p>
            <button
              className="ui-button ui-button--secondary"
              type="button"
              onClick={refreshTopics}
            >
              Try again
            </button>
          </div>
        ) : topics.length === 0 ? (
          <div className="topics-home__state">
            <p>There are no topics yet. Create your first topic to begin.</p>
            <button
              type="button"
              className="ui-button ui-button--primary"
              onClick={() => openCreateTopic()}
            >
              <AppIcon name="plus" size={17} /> Create a topic
            </button>
          </div>
        ) : (
          <div className="topics-home__grid">
            {topics.map((topic) => (
              <Link
                to={`/topics/${topic.id}`}
                key={topic.id}
                className="topics-home__topic-card"
              >
                <span className="topics-home__topic-icon">
                  <AppIcon
                    name={
                      topic.slug.toLowerCase().includes('sql')
                        ? 'database'
                        : 'code'
                    }
                    size={23}
                  />
                </span>
                <span className="topics-home__topic-heading">
                  {topic.name} <AppIcon name="arrow-right" size={18} />
                </span>
                <span className="topics-home__topic-meta">
                  {totalQuestions(topic)} questions · {totalSubtopics(topic)}{' '}
                  subtopics
                </span>
                {topic.description && (
                  <span className="topics-home__topic-description">
                    {topic.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
