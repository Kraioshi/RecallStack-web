import { Link } from 'react-router-dom'

import type { Topic, TopicTree } from '../../types/topic'
import { AppIcon } from '../AppIcon'
import { totalQuestions, totalSubtopics } from '../layout/topicTreeUtils'

import './topicOverview.css'

interface TopicOverviewProps {
  topic: Topic
  path: TopicTree[]
  selectedTree: TopicTree | null
}

/** Topic counts describe only questions attached to this topic, not its children. */
export function TopicOverview({
  topic,
  path,
  selectedTree,
}: TopicOverviewProps) {
  const counts = selectedTree?.question_counts
  const descendantQuestions = selectedTree
    ? totalQuestions(selectedTree) - selectedTree.question_counts.total
    : null
  const subtopicCount = selectedTree ? totalSubtopics(selectedTree) : null
  const availableQuestions = selectedTree ? totalQuestions(selectedTree) : null
  const ancestorPath = path.slice(0, -1)
  const isFastApi = path.some((item) =>
    item.slug.toLowerCase().includes('fastapi'),
  )
  const isSql = path.some((item) => item.slug.toLowerCase().includes('sql'))
  const iconName = isFastApi ? 'bolt' : isSql ? 'database' : 'code'

  return (
    <section className="topic-overview" aria-labelledby="topic-title">
      <nav className="topic-overview__breadcrumbs" aria-label="Breadcrumb">
        <Link to="/" className="topic-overview__home" aria-label="All topics">
          <AppIcon name="home" size={17} />
        </Link>
        {ancestorPath.map((ancestor) => (
          <span key={ancestor.id} className="topic-overview__crumb">
            <AppIcon name="chevron-right" size={14} />
            <Link to={`/topics/${ancestor.id}`}>{ancestor.name}</Link>
          </span>
        ))}
        <span className="topic-overview__crumb topic-overview__crumb--current">
          <AppIcon name="chevron-right" size={14} />
          <span aria-current="page">{topic.name}</span>
        </span>
      </nav>

      <div className="topic-overview__identity">
        <div
          className={`topic-overview__symbol${isFastApi ? ' topic-overview__symbol--fastapi' : ''}`}
          aria-hidden="true"
        >
          <AppIcon name={iconName} size={35} />
        </div>
        <div className="topic-overview__identity-content">
          <span className="topic-overview__eyebrow">TOPIC OVERVIEW</span>
          <h1 id="topic-title">{topic.name}</h1>
          <p className="topic-overview__description">
            {topic.description?.trim() ||
              'Explore questions and practice your knowledge of this topic.'}
          </p>
          <div className="topic-overview__tags" aria-label="Topic hierarchy">
            {ancestorPath.map((ancestor) => (
              <Link
                key={ancestor.id}
                to={`/topics/${ancestor.id}`}
                className="topic-overview__tag"
              >
                {ancestor.name}
              </Link>
            ))}
            {ancestorPath.length === 0 && (
              <span className="topic-overview__tag">Root topic</span>
            )}
            {subtopicCount !== null && subtopicCount > 0 && (
              <span className="topic-overview__tag topic-overview__tag--count">
                {subtopicCount} {subtopicCount === 1 ? 'subtopic' : 'subtopics'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="topic-overview__summary">
        <dl
          className="topic-overview__stats"
          aria-label="Questions in this topic"
        >
          <div className="topic-overview__stat topic-overview__stat--total">
            <span className="topic-overview__stat-icon" aria-hidden="true">
              <AppIcon name="book" size={22} />
            </span>
            <dt>Questions</dt>
            <dd>{counts?.total ?? '—'}</dd>
          </div>
          <div className="topic-overview__stat">
            <dt>
              <span className="topic-overview__dot topic-overview__dot--easy" />
              Easy
            </dt>
            <dd>{counts?.easy ?? '—'}</dd>
          </div>
          <div className="topic-overview__stat">
            <dt>
              <span className="topic-overview__dot topic-overview__dot--medium" />
              Medium
            </dt>
            <dd>{counts?.medium ?? '—'}</dd>
          </div>
          <div className="topic-overview__stat">
            <dt>
              <span className="topic-overview__dot topic-overview__dot--hard" />
              Hard
            </dt>
            <dd>{counts?.hard ?? '—'}</dd>
          </div>
        </dl>
        <Link
          to={`/practice?topic_id=${topic.id}`}
          className="topic-overview__practice"
        >
          <span className="topic-overview__practice-icon">
            <AppIcon name="play" size={23} />
          </span>
          <span className="topic-overview__practice-label">
            <strong>Practice this topic</strong>
            <small>
              {availableQuestions === null
                ? 'Choose a difficulty and begin'
                : `${availableQuestions} ${availableQuestions === 1 ? 'question' : 'questions'} available${descendantQuestions !== null && descendantQuestions > 0 ? ' with subtopics' : ''}`}
            </small>
          </span>
          <AppIcon name="arrow-right" size={18} />
        </Link>
      </div>
      {descendantQuestions !== null && descendantQuestions > 0 && (
        <p className="topic-overview__count-note">
          The counts above are for this topic only. Another{' '}
          {descendantQuestions}{' '}
          {descendantQuestions === 1 ? 'question is' : 'questions are'}{' '}
          available in its subtopics.
        </p>
      )}
      {!counts && (
        <p className="topic-overview__count-note" role="status">
          Question statistics are temporarily unavailable. You can still browse
          and practice.
        </p>
      )}
    </section>
  )
}
