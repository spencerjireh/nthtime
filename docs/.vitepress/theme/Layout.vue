<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useData, useRoute, withBase, Content } from 'vitepress';

const { site, page, frontmatter, isDark } = useData();
const route = useRoute();

const sidebarOpen = ref(false);

// Close sidebar on route change
watch(() => route.path, () => {
  sidebarOpen.value = false;
});

// Derive the path prefix from page.relativePath (e.g. "guide/architecture.md" -> "/guide/")
// This is more reliable than route.path which includes the base prefix.
const pagePrefix = computed(() => {
  const rel = page.value.relativePath;
  if (!rel) return '';
  const parts = rel.split('/');
  return parts.length > 1 ? '/' + parts[0] + '/' : '/';
});

// Resolve sidebar items from themeConfig by matching the current page prefix
const sidebarGroups = computed(() => {
  const sidebar = site.value.themeConfig?.sidebar;
  if (!sidebar) return [];
  const prefix = pagePrefix.value;
  if (prefix && sidebar[prefix]) {
    return sidebar[prefix];
  }
  return [];
});

const navLinks = computed(() => site.value.themeConfig?.nav || []);
const footer = computed(() => site.value.themeConfig?.footer);

const isHome = computed(() => frontmatter.value?.layout === 'home');
const hasSidebar = computed(() => !isHome.value && sidebarGroups.value.length > 0);

// Current page path without base for matching sidebar/nav active states
const pagePath = computed(() => {
  const rel = page.value.relativePath;
  if (!rel) return '';
  // "guide/architecture.md" -> "/guide/architecture"
  return '/' + rel.replace(/\.md$/, '');
});

function isActiveLink(link) {
  return pagePath.value === link;
}

function isActiveNav(link) {
  if (link.startsWith('http')) return false;
  const prefix = link.replace(/\/[^/]*$/, '/');
  return pagePath.value.startsWith(prefix);
}

function toggleDark() {
  isDark.value = !isDark.value;
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

// Construct links with base path
function withBasePath(path) {
  return withBase(path);
}
</script>

<template>
  <!-- Header -->
  <header class="nt-header">
    <div class="nt-header-left">
      <button class="nt-hamburger" @click="toggleSidebar" aria-label="Toggle sidebar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <a :href="withBasePath('/')" class="nt-logo">nthtime</a>
      <nav class="nt-nav">
        <a
          v-for="link in navLinks"
          :key="link.text"
          :href="link.link.startsWith('http') ? link.link : withBasePath(link.link)"
          :target="link.link.startsWith('http') ? '_blank' : undefined"
          :rel="link.link.startsWith('http') ? 'noopener noreferrer' : undefined"
          class="nt-nav-link"
          :class="{ active: isActiveNav(link.link) }"
        >
          {{ link.text }}
        </a>
      </nav>
    </div>
    <div class="nt-header-right">
      <button class="nt-theme-toggle" @click="toggleDark" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  </header>

  <!-- Sidebar overlay (mobile) -->
  <div class="nt-sidebar-overlay" :class="{ open: sidebarOpen }" @click="sidebarOpen = false" />

  <!-- Sidebar: v-show avoids SSG hydration mismatch (v-if tears down SSR'd sidebar) -->
  <aside v-show="hasSidebar" class="nt-sidebar" :class="{ open: sidebarOpen }">
    <div v-for="group in sidebarGroups" :key="group.text" class="nt-sidebar-group">
      <div class="nt-sidebar-title">{{ group.text }}</div>
      <ul class="nt-sidebar-items">
        <li v-for="item in group.items" :key="item.link">
          <a
            :href="withBasePath(item.link)"
            class="nt-sidebar-link"
            :class="{ active: isActiveLink(item.link) }"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </div>
  </aside>

  <!-- Main -->
  <main class="nt-main" :style="{ marginLeft: hasSidebar ? undefined : '0' }">
    <!-- Home layout -->
    <template v-if="isHome">
      <div class="nt-hero" v-if="frontmatter.hero">
        <h1 class="nt-hero-name">{{ frontmatter.hero.name }}</h1>
        <p class="nt-hero-text" v-if="frontmatter.hero.text">{{ frontmatter.hero.text }}</p>
        <p class="nt-hero-tagline">{{ frontmatter.hero.tagline }}</p>
        <div class="nt-hero-actions" v-if="frontmatter.hero.actions">
          <a
            v-for="action in frontmatter.hero.actions"
            :key="action.text"
            :href="action.link.startsWith('http') ? action.link : withBasePath(action.link)"
            class="nt-hero-btn"
            :class="action.theme || 'primary'"
          >
            {{ action.text }}
          </a>
        </div>
      </div>
      <div class="nt-features" v-if="frontmatter.features">
        <div v-for="feature in frontmatter.features" :key="feature.title" class="nt-feature">
          <div class="nt-feature-icon" v-if="feature.icon">{{ feature.icon }}</div>
          <div class="nt-feature-title">{{ feature.title }}</div>
          <div class="nt-feature-desc">{{ feature.details }}</div>
        </div>
      </div>
    </template>

    <!-- Doc layout -->
    <div v-else class="nt-content">
      <Content />
    </div>
  </main>

  <!-- Footer -->
  <footer v-if="footer" class="nt-footer" :style="{ marginLeft: hasSidebar ? 'var(--nt-sidebar-width)' : '0' }">
    <p v-if="footer.message">{{ footer.message }}</p>
    <p v-if="footer.copyright">{{ footer.copyright }}</p>
  </footer>
</template>
