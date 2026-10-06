import type { TopicTree } from '../types/topic'

const API_URL = import.meta.env.VITE_API_URL

export async function getTopicTree(
    signal?: AbortSignal,
): Promise<TopicTree[]> {
    const response = await fetch(`${API_URL}/api/topics/tree`, {
        signal,
    })

    if (!response.ok) {
        throw new Error(
            `Failed to fetch topic tree: ${response.status} ${response.statusText}`,
        )
    }

    return response.json()
}