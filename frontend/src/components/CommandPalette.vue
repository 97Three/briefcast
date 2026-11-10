<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[70] bg-[#04070d]/75 backdrop-blur-[3px] no-print"
        @click.self="close"
      >
        <div class="mx-auto mt-[11vh] w-[min(36rem,calc(100vw-2rem))]">
          <div
            class="overflow-hidden rounded-xl border border-white/[0.12] bg-dark-card/95 shadow-[0_30px_80px_rgba(2,8,17,0.65)]"
            role="dialog"
            aria-modal="true"
            :aria-label="tr('命令面板', 'Command palette')"
          >
            <!-- 输入行 -->
            <div class="flex items-center gap-2.5 border-b border-white/[0.07] px-4 py-3.5">
              <svg class="h-4 w-4 shrink-0 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
              <input
                ref="inputEl"
                v-model="query"
                type="text"
                class="w-full bg-transparent text-[15px] text-text-primary placeholder-text-tertiary outline-none"
                :placeholder="tr('搜索动作…', 'Search actions…')"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
                @keydown.enter.prevent="run"
                @keydown.esc.prevent="close"
              />
              <kbd class="shrink-0 rounded border border-white/[0.12] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
                ESC
              </kbd>
            </div>

            <!-- 动作列表 -->
            <ul class="max-h-[54vh] overflow-y-auto py-1.5" role="listbox">
              <li v-for="(action, index) in filtered" :key="action.id">
                <p
                  v-if="showGroupHeader(index)"
                  class="px-4 pb-1 pt-2.5 text-[10px] uppercase tracking-[0.14em] text-text-tertiary"
                >
                  {{ action.group }}
                </p>

                <button
                  class="flex w-full items-center gap-3 border-l-2 py-2.5 pl-3.5 pr-4 text-left transition-colors duration-100"
                  :class="
                    index === cursor
                      ? 'border-cyber-blue bg-white/[0.07] text-text-primary'
                      : 'border-transparent text-text-secondary hover:bg-white/[0.035]'
                  "
                  role="option"
                  :aria-selected="index === cursor"
                  @click="runAction(action)"
                  @mouseenter="cursor = index"
                >
                  <svg
                    v-if="action.icon"
                    class="h-4 w-4 shrink-0"
                    :class="index === cursor ? 'text-cyber-blue' : 'text-text-tertiary'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="action.icon" />
                  </svg>
                  <span class="min-w-0 flex-1 truncate text-[14px]">{{ action.label }}</span>
                  <kbd
                    v-if="action.hint"
                    class="shrink-0 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary"
                  >
                    {{ action.hint }}
                  </kbd>
                </button>
              </li>

              <li v-if="filtered.length === 0" class="px-4 py-8 text-center text-[13px] text-text-tertiary">
                {{ tr('没有匹配的动作', 'No matching actions') }}
              </li>
            </ul>

            <!-- 快捷键条 -->
            <div class="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-text-tertiary">
              <span class="flex items-center gap-1">
                <kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> {{ tr('选择', 'move') }}
              </span>
              <span class="flex items-center gap-1">
                <kbd class="kbd">↵</kbd> {{ tr('执行', 'run') }}
              </span>
              <span class="ml-auto font-mono text-[10px] tracking-wider">BRIEFCAST</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { tr } from '../composables/useLocale'
import type { PaletteAction } from '../composables/useCommandPalette'

const props = defineProps<{
  open: boolean
  actions: PaletteAction[]
}>()

const emit = defineEmits<{
  close: []
}>()

const query = ref('')
const cursor = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return props.actions
  return props.actions.filter((action) => action.label.toLowerCase().includes(keyword))
})

/** 搜索时不再插入分组标题，避免结果被切碎 */
function showGroupHeader(index: number): boolean {
  if (query.value.trim()) return false
  const current = filtered.value[index]
  if (!current?.group) return false
  const previous = filtered.value[index - 1]
  return index === 0 || previous?.group !== current.group
}

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      query.value = ''
      cursor.value = 0
      return
    }
    cursor.value = 0
    await nextTick()
    inputEl.value?.focus()
  }
)

watch(query, () => {
  cursor.value = 0
})

function move(delta: number) {
  if (filtered.value.length === 0) return
  cursor.value = (cursor.value + delta + filtered.value.length) % filtered.value.length
}

function runAction(action: PaletteAction) {
  emit('close')
  action.run()
}

function run() {
  const action = filtered.value[cursor.value]
  if (action) runAction(action)
}

function close() {
  emit('close')
}
</script>

<style scoped>
.kbd {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.03);
  padding: 0 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  line-height: 16px;
}
</style>
