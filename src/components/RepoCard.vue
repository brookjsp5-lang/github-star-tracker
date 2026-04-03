<template>
  <article class="repo-card" :style="{ animationDelay: `${repo.rank * 0.05}s` }">
    <div class="card-header">
      <div class="rank-badge" :class="getRankClass(repo.rank)">
        #{{ repo.rank }}
      </div>
      <div class="repo-info">
        <h3 class="repo-name">
          <a :href="repo.url" target="_blank" rel="noopener noreferrer">
            {{ repo.name }}
          </a>
        </h3>
        <p class="repo-description">{{ repo.description }}</p>
      </div>
    </div>

    <div class="card-body">
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{{ formatNumber(repo.stars) }}</span>
          <span class="stat-label">Stars</span>
        </div>
        <div class="stat">
          <span class="stat-icon">🍴</span>
          <span class="stat-value">{{ formatNumber(repo.forks) }}</span>
          <span class="stat-label">Forks</span>
        </div>
        <div class="stat">
          <span class="stat-icon">🐛</span>
          <span class="stat-value">{{ formatNumber(repo.openIssues) }}</span>
          <span class="stat-label">Issues</span>
        </div>
        <div class="stat trend-stat">
          <span class="stat-icon">📈</span>
          <span class="stat-value trend-up">+{{ formatNumber(repo.starGrowth) }}</span>
          <span class="stat-label">本周增长</span>
        </div>
      </div>

      <div class="meta-info">
        <div class="language-badge" v-if="repo.language !== 'Unknown'">
          <span class="language-dot" :style="{ backgroundColor: getLanguageColor(repo.language) }"></span>
          <span>{{ repo.language }}</span>
        </div>
        <span class="license-badge">{{ repo.license }}</span>
        <span class="updated-time mono">更新于 {{ timeAgo(repo.updatedAt) }}</span>
      </div>

      <div class="topics-list" v-if="repo.topics.length > 0">
        <span
          v-for="topic in repo.topics.slice(0, 5)"
          :key="topic"
          class="topic-tag"
        >
          {{ topic }}
        </span>
      </div>
    </div>

    <div class="card-footer">
      <a
        :href="repo.url"
        target="_blank"
        rel="noopener noreferrer"
        class="visit-btn"
      >
        访问 GitHub →
      </a>
    </div>
  </article>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  repo: {
    type: Object,
    required: true
  }
})

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function getRankClass(rank) {
  if (rank <= 3) return 'top-rank'
  if (rank <= 10) return 'high-rank'
  return 'normal-rank'
}

function getLanguageColor(language) {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'Swift': '#F05138',
    'Kotlin': '#A97BFF',
    'Dart': '#00B4AB',
    'Vue': '#41B883',
    'React': '#61DAFB',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Docker': '#384d54'
  }
  return colors[language] || '#94a3b8'
}

function timeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.repo-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out both;
  position: relative;
  overflow: hidden;
}

.repo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green), var(--accent-purple));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.repo-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-cyan);
  box-shadow:
    0 10px 40px rgba(0, 255, 255, 0.15),
    0 0 20px rgba(0, 255, 255, 0.1);
}

.repo-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: flex-start;
}

.rank-badge {
  min-width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  font-family: 'Orbitron', sans-serif;
  flex-shrink: 0;
}

.rank-badge.top-rank {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.rank-badge.high-rank {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  color: #333;
}

.rank-badge.normal-rank {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.repo-info {
  flex: 1;
  min-width: 0;
}

.repo-name {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.repo-name a {
  color: var(--text-primary);
}

.repo-name a:hover {
  color: var(--accent-cyan);
}

.repo-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-body {
  margin-bottom: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.stat-icon {
  font-size: 1rem;
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.trend-up {
  color: var(--accent-green) !important;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.language-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.language-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.license-badge,
.updated-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  background: var(--bg-secondary);
  border-radius: 4px;
}

.topics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.topic-tag {
  padding: 0.2rem 0.6rem;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--accent-cyan);
}

.card-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.visit-btn {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
  color: var(--bg-primary);
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.visit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--glow-cyan);
  color: var(--bg-primary);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>