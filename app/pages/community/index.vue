<script setup lang="ts">
import type { SubjectData } from '~/components/forum/SubjectCard.vue'

const { t, locale } = useI18n()
const session = useState<any>('app-session')

const { data, refresh: refreshForum } = await useFetch<{
  subjects: SubjectData[]
  initialDate: string | null
}>('/api/forum/community-init')

const subjects = computed(() => data.value?.subjects ?? [])
const initialDate = computed(() => data.value?.initialDate ?? null)
const isMod = computed(() => session.value?.role === 'admin' || session.value?.role === 'moderator')
const userId = computed(() => session.value?.id ?? 0)
const userRole = computed(() => session.value?.role ?? 'subscriber')
const displayName = computed(() => session.value?.displayName ?? '')
const lang = computed(() => locale.value)

const TABS = ['forum', 'suivi', 'pour-moi', 'recherche', 'archives', 'biffe'] as const
const activeTab = ref<string>('forum')
const suiviKey = ref(0)
const pourMoiKey = ref(0)
const biffeKey = ref(0)

const archives = ref<SubjectData[] | null>(null)
const loadingArchives = ref(false)
const biffeSubjects = ref<SubjectData[] | null>(null)
const loadingBiffe = ref(false)

async function loadArchives(force = false) {
  if (archives.value !== null && !force) return
  loadingArchives.value = true
  const d = await $fetch<SubjectData[]>('/api/forum/subjects?filter=archived')
  archives.value = Array.isArray(d) ? d : []
  loadingArchives.value = false
}

async function loadBiffe() {
  loadingBiffe.value = true
  const d = await $fetch<SubjectData[]>('/api/forum/subjects?filter=hidden')
  biffeSubjects.value = Array.isArray(d) ? d : []
  loadingBiffe.value = false
}

function handleTabChange(tab: string) {
  activeTab.value = tab
  if (tab === 'forum') refreshForum()
  if (tab === 'suivi') suiviKey.value++
  if (tab === 'pour-moi') pourMoiKey.value++
  if (tab === 'archives') loadArchives()
  if (tab === 'biffe') { biffeKey.value++; loadBiffe() }
}

const tabLabels: Record<string, string> = {
  forum: 'forum.tabForum',
  suivi: 'forum.tabSuivi',
  'pour-moi': 'forum.tabPourMoi',
  recherche: 'forum.tabRecherche',
  archives: 'forum.tabArchives',
  biffe: 'forum.tabBiffe',
}
</script>

<template>
  <main class="container mx-auto py-10 space-y-6">
    <h1 class="text-2xl font-bold">{{ t('community.title') }}</h1>

    <!-- Onglets -->
    <div>
      <div class="flex gap-0 border-b overflow-x-auto">
        <button
          v-for="tab in isMod ? TABS : TABS.filter(t => t !== 'biffe')"
          :key="tab"
          class="px-6 py-2 text-sm font-medium transition-colors whitespace-nowrap"
          :class="activeTab === tab
            ? 'border-b-2 border-primary text-primary -mb-px'
            : 'text-muted-foreground hover:text-foreground'"
          @click="handleTabChange(tab)"
        >
          {{ t(tabLabels[tab]) }}
        </button>
      </div>

      <div class="border border-t-0 rounded-b-lg rounded-tr-lg p-6">

        <!-- Onglet Forum -->
        <div v-if="activeTab === 'forum'" class="space-y-4">
          <div class="flex justify-end">
            <NuxtLink to="/community/new">
              <UButton size="sm">{{ t('forum.newSubject') }}</UButton>
            </NuxtLink>
          </div>
          <p v-if="subjects.length === 0" class="text-sm text-muted-foreground py-4">{{ t('forum.noSubjects') }}</p>
          <ForumSubjectCard
            v-for="s in subjects"
            :key="s.id"
            :subject="s"
            :user-id="userId"
            :user-role="userRole"
            :display-name="displayName"
            :is-mod="isMod"
            :lang="lang"
            :on-refresh-list="refreshForum"
          />
        </div>

        <!-- Onglet Suivi -->
        <div v-else-if="activeTab === 'suivi'">
          <ForumSuiviTab
            :initial-date="initialDate"
            :suivi-key="suiviKey"
            :lang="lang"
            :user-id="userId"
            :user-role="userRole"
            :display-name="displayName"
            :is-mod="isMod"
          />
        </div>

        <!-- Onglet Pour moi -->
        <div v-else-if="activeTab === 'pour-moi'">
          <ForumPourMoiTab
            :key="pourMoiKey"
            :lang="lang"
            :user-id="userId"
            :user-role="userRole"
            :display-name="displayName"
            :is-mod="isMod"
          />
        </div>

        <!-- Onglet Recherche -->
        <div v-else-if="activeTab === 'recherche'">
          <ForumRechercheTab
            :lang="lang"
            :user-id="userId"
            :user-role="userRole"
            :display-name="displayName"
            :is-mod="isMod"
          />
        </div>

        <!-- Onglet Archives -->
        <div v-else-if="activeTab === 'archives'" class="space-y-4">
          <p v-if="loadingArchives" class="text-sm text-muted-foreground py-4">{{ t('common.loading') }}</p>
          <p v-else-if="archives !== null && archives.length === 0" class="text-sm text-muted-foreground py-4">{{ t('forum.archivesEmpty') }}</p>
          <ForumSubjectCard
            v-for="s in archives ?? []"
            :key="s.id"
            :subject="s"
            :user-id="userId"
            :user-role="userRole"
            :display-name="displayName"
            :is-mod="isMod"
            :lang="lang"
            read-only
            :on-refresh-list="() => loadArchives(true)"
          />
        </div>

        <!-- Onglet Biffé (mod seulement) -->
        <div v-else-if="activeTab === 'biffe' && isMod" class="space-y-3">
          <p v-if="loadingBiffe" class="text-sm text-muted-foreground py-4">{{ t('common.loading') }}</p>
          <p v-else-if="biffeSubjects !== null && biffeSubjects.length === 0" class="text-sm text-muted-foreground py-4">{{ t('forum.biffeEmpty') }}</p>
          <ForumSubjectCard
            v-for="s in biffeSubjects ?? []"
            :key="s.id"
            :subject="s"
            :user-id="userId"
            :user-role="userRole"
            :display-name="displayName"
            :is-mod="isMod"
            :lang="lang"
            read-only
            :on-refresh-list="loadBiffe"
          />
        </div>

      </div>
    </div>
  </main>
</template>
