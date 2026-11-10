import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './styles/main.css'
import App from './App.vue'
import InputView from './views/InputView.vue'
import BriefingView from './views/BriefingView.vue'
import { reveal } from './directives/reveal'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: InputView },
    { path: '/briefing', component: BriefingView }
  ],
  // 有 View Transitions 的浏览器走一次淡入；不支持时静默降级
  scrollBehavior: () => ({ top: 0 })
})

const app = createApp(App)
app.use(router)
app.directive('reveal', reveal)
app.mount('#app')
