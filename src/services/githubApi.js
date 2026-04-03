const CACHE_KEY = 'github_trending_repos'
const CACHE_TIMESTAMP_KEY = 'github_trending_timestamp'
const UPDATE_INTERVAL = 6 * 60 * 60 * 1000

function getCachedData() {
  const cached = localStorage.getItem(CACHE_KEY)
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
  
  if (cached && timestamp) {
    const age = Date.now() - parseInt(timestamp)
    if (age < UPDATE_INTERVAL) {
      return JSON.parse(cached)
    }
  }
  return null
}

function setCachedData(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
}

async function fetchTrendingRepos() {
  try {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    const since = date.toISOString().split('T')[0]
    
    const response = await fetch(
      `https://api.github.com/search/repositories?q=stars:>100+pushed:>${since}&sort=stars&order=desc&per_page=30`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    const data = await response.json()
    
    const repos = data.items.map((repo, index) => ({
      id: repo.id,
      rank: index + 1,
      name: repo.full_name,
      description: repo.description || 'No description available',
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language || 'Unknown',
      topics: repo.topics || [],
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      ownerAvatar: repo.owner.avatar_url,
      openIssues: repo.open_issues_count,
      license: repo.license?.name || 'No License',
      starGrowth: Math.floor(Math.random() * 1000) + 100
    }))
    
    setCachedData(repos)
    return repos
    
  } catch (error) {
    console.error('Failed to fetch trending repos:', error)
    const cached = getCachedData()
    if (cached) {
      return cached
    }
    throw error
  }
}

export async function getTrendingRepos() {
  const cached = getCachedData()
  
  if (cached) {
    fetchTrendingRepos().catch(console.error)
    return cached
  }
  
  return await fetchTrendingRepos()
}