import { Octokit } from 'octokit'

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  has_pages: boolean
  default_branch: string
  category?: string
}

export interface RepoCategory {
  brain: Repository[]
  websites: Repository[]
  tools: Repository[]
  other: Repository[]
}

/**
 * Fetches all repositories from the pewpi-infinity organization
 */
export async function fetchPewpiInfinityRepos(token?: string): Promise<Repository[]> {
  try {
    const octokit = token ? new Octokit({ auth: token }) : new Octokit()
    
    const { data } = await octokit.rest.repos.listForUser({
      username: 'pewpi-infinity',
      type: 'all',
      per_page: 100,
      sort: 'updated'
    })

    return data as Repository[]
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return []
  }
}

/**
 * Categorizes repositories based on their names, topics, and descriptions
 */
export function categorizeRepos(repos: Repository[]): RepoCategory {
  const categories: RepoCategory = {
    brain: [],
    websites: [],
    tools: [],
    other: []
  }

  repos.forEach(repo => {
    const name = repo.name.toLowerCase()
    const description = (repo.description || '').toLowerCase()
    const topics = repo.topics || []

    // Brain repos - mongoose.os, brain-related
    if (
      name.includes('brain') ||
      name.includes('mongoose') ||
      description.includes('brain') ||
      topics.includes('brain') ||
      topics.includes('ai')
    ) {
      categories.brain.push({ ...repo, category: 'brain' })
    }
    // Website repos - has GitHub Pages
    else if (repo.has_pages || name.includes('site') || name.includes('page')) {
      categories.websites.push({ ...repo, category: 'websites' })
    }
    // Tools - utilities, libs, etc
    else if (
      name.includes('tool') ||
      name.includes('util') ||
      name.includes('lib') ||
      topics.includes('tool') ||
      topics.includes('utility')
    ) {
      categories.tools.push({ ...repo, category: 'tools' })
    }
    // Everything else
    else {
      categories.other.push({ ...repo, category: 'other' })
    }
  })

  return categories
}

/**
 * Checks if a repository has GitHub Pages enabled and returns the URL
 */
export function getGitHubPagesUrl(repo: Repository): string | null {
  if (!repo.has_pages) return null
  
  // Standard GitHub Pages URL format
  const username = repo.full_name.split('/')[0]
  return `https://${username}.github.io/${repo.name}/`
}

/**
 * Fetches repository README content
 */
export async function fetchRepoReadme(owner: string, repo: string, token?: string): Promise<string | null> {
  try {
    const octokit = token ? new Octokit({ auth: token }) : new Octokit()
    
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      mediaType: {
        format: 'raw'
      }
    })

    return data as unknown as string
  } catch (error) {
    console.error('Error fetching README:', error)
    return null
  }
}

/**
 * Fetches repository file tree
 */
export async function fetchRepoTree(owner: string, repo: string, token?: string) {
  try {
    const octokit = token ? new Octokit({ auth: token }) : new Octokit()
    
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: 'HEAD',
      recursive: '1'
    })

    return data.tree
  } catch (error) {
    console.error('Error fetching repo tree:', error)
    return []
  }
}

/**
 * Checks if a repository is the mongoose.os brain
 */
export function isMongooseBrain(repo: Repository): boolean {
  return repo.name.toLowerCase().includes('mongoose')
}

/**
 * Gets repository statistics
 */
export async function getRepoStats(owner: string, repo: string, token?: string) {
  try {
    const octokit = token ? new Octokit({ auth: token }) : new Octokit()
    
    const [repoData, commits, contributors] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 1 }),
      octokit.rest.repos.listContributors({ owner, repo, per_page: 10 })
    ])

    return {
      stars: repoData.data.stargazers_count,
      forks: repoData.data.forks_count,
      issues: repoData.data.open_issues_count,
      lastCommit: commits.data[0]?.commit.author?.date || null,
      contributors: contributors.data.length,
      size: repoData.data.size
    }
  } catch (error) {
    console.error('Error fetching repo stats:', error)
    return null
  }
}
