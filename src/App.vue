<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">GITHUB STAR TRACKER</span>
          </h1>
          <p class="subtitle mono">实时追踪GitHub热门项目趋势 | 6小时自动更新</p>
        </div>
        
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-label">追踪项目</span>
            <span class="stat-value">{{ repos.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最后更新</span>
            <span class="stat-value mono">{{ lastUpdate }}</span>
          </div>
          <button @click="refreshData" class="refresh-btn" :class="{ loading: isLoading }">
            {{ isLoading ? '刷新中...' : '🔄 刷新数据' }}
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <section class="controls-section">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索项目名称或描述..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>

        <div class="filter-tags">
          <button
            v-for="tag in availableTags"
            :key="tag"
            @click="toggleTag(tag)"
            class="tag-btn"
            :class="{ active: selectedTags.includes(tag) }"
          >
            {{ tag }}
          </button>
          <button
            v-if="selectedTags.length > 0"
            @click="clearTags"
            class="tag-btn clear-btn"
          >
            ✕ 清除筛选
          </button>
        </div>
      </section>

      <section class="trend-chart-section" v-if="!isLoading && filteredRepos.length > 0">
        <h2 class="section-title">
          <span class="title-icon">📈</span>
          Star 增长趋势图
        </h2>
        <TrendChart :repos="filteredRepos.slice(0, 10)" />
      </section>

      <section class="repos-grid-section">
        <h2 class="section-title">
          <span class="title-icon">🔥</span>
          热门项目排行榜
          <span class="repo-count mono">({{ filteredRepos.length }} 个项目)</span>
        </h2>

        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载GitHub热门数据...</p>
        </div>

        <div v-else-if="filteredRepos.length === 0" class="empty-state">
          <div class="empty-icon">😢</div>
          <p>未找到匹配的项目</p>
          <button @click="resetFilters" class="reset-btn">重置筛选条件</button>
        </div>

        <div v-else class="repos-grid">
          <RepoCard
            v-for="repo in filteredRepos"
            :key="repo.id"
            :repo="repo"
          />
        </div>
      </section>
    </main>

    <footer class="footer">
      <p class="mono">
        ⚡ Powered by GitHub API | 数据每6小时自动更新 | 
        <a href="https://github.com" target="_blank">GitHub</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTrendingRepos } from './services/githubApi.js'
import RepoCard from './components/RepoCard.vue'
import TrendChart from './components/TrendChart.vue'

const repos = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedTags = ref([])

const lastUpdate = computed(() => {
  const timestamp = localStorage.getItem('github_trending_timestamp')
  if (timestamp) {
    const date = new Date(parseInt(timestamp))
    return date.toLocaleString('zh-CN')
  }
  return '从未'
})

const availableTags = computed(() => {
  const tags = new Set()
  repos.value.forEach(repo => {
    if (repo.language && repo.language !== 'Unknown') {
      tags.add(repo.language)
    }
    repo.topics.slice(0, 3).forEach(topic => tags.add(topic))
  })
  return Array.from(tags).slice(0, 15)
})

const filteredRepos = computed(() => {
  let result = repos.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(repo =>
      repo.name.toLowerCase().includes(query) ||
      repo.description.toLowerCase().includes(query)
    )
  }

  if (selectedTags.value.length > 0) {
    result = result.filter(repo =>
      selectedTags.value.some(tag =>
        repo.language === tag ||
        repo.topics.includes(tag)
      )
    )
  }

  return result
})

async function refreshData() {
  isLoading.value(true)
  try {
    localStorage.removeItem('github_trending_repos')
    localStorage.removeItem('github_trending_timestamp')
    repos.value = await getTrendingRepos()
  } catch (error) {
    console.error('Refresh failed:', error)
  } finally {
    isLoading.value(false)
  }
}

function toggleTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function clearTags() {
  selectedTags.value = []
}

function resetFilters() {
  searchQuery.value = ''
  selectedTags.value = []
}

onMounted(async () => {
  try {
    repos.value = await getTrendingRepos()
  } catch (error) {
    console.error('Failed to load repos:', error)
  } finally {
    isLoading.value(false)
  }
})
</script>

<style scoped>
.app-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 2rem 2rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  margin-bottom: 1.5rem;
}

.logo {
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-icon {
  font-size: 3rem;
  animation: pulse-glow 2s ease-in-out infinite;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
}

.stats-bar {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent-cyan);
}

.refresh-btn {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
  color: var(--bg-primary);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: auto;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--glow-cyan);
}

.refresh-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  width: 100%;
}

.controls-section {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 20px var(--glow-cyan);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.tag-btn:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.tag-btn.active {
  background: var(--accent-cyan);
  color: var(--bg-primary);
  border-color: var(--accent-cyan);
}

.clear-btn {
  background: transparent;
  border-color: var(--accent-purple);
  color: var(--accent-purple);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.title-icon {
  font-size: 1.75rem;
}

.repo-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.trend-chart-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.repos-grid-section {
  margin-bottom: 2rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.reset-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-cyan);
  color: var(--bg-primary);
  border-radius: 8px;
  font-weight: 600;
}

.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 2rem;
  text-align: center;
}

.footer p {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.footer a {
  color: var(--accent-cyan);
}

@media (max-width: 768px) {
  .header {
    padding: 1.5rem 1rem;
  }
  
  .logo {
    font-size: 1.75rem;
  }
  
  .stats-bar {
    gap: 1rem;
  }
  
  .refresh-btn {
    width: 100%;
    margin-left: 0;
    margin-top: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .repos-grid {
    grid-template-columns: 1fr;
  }
}
</style>