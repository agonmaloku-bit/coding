<template>
  <metainfo>
    <template v-slot:title="{ content }">{{ content ? `${content} — PSM` : 'PSM' }}</template>
  </metainfo>
  <router-view/>
  <div v-if="busy" class="global-busy-overlay" role="status" aria-live="polite">
    <div class="global-busy-card">
      <i class="fas fa-spinner fa-spin"></i>
      <span>{{ busyMessage || 'Please wait…' }}</span>
    </div>
  </div>
  <div v-if="pwaUpdateAvailable" class="pwa-update-toast" role="alert">
    <i class="fas fa-cloud-download-alt mr-2"></i>
    <span>A new version is available.</span>
    <button type="button" class="pwa-update-btn" @click="reloadForUpdate">Reload</button>
  </div>
</template>

<script>
import { useMeta } from 'vue-meta'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      app_title: process.env.VUE_APP_TITLE,
      pwaUpdateAvailable: false,
      pwaRegistration: null,
    }
  },
  computed: {
    ...mapGetters('ui', ['busy', 'busyMessage']),
  },
  setup () {
    useMeta({
      title: '',
      htmlAttrs: { lang: 'en', amp: true }
    })
  },
  mounted() {
    document.addEventListener('pwa-update-available', this.onPwaUpdate);
  },
  beforeUnmount() {
    document.removeEventListener('pwa-update-available', this.onPwaUpdate);
  },
  methods: {
    onPwaUpdate(event) {
      this.pwaRegistration = event.detail || null;
      this.pwaUpdateAvailable = true;
    },
    reloadForUpdate() {
      // workbox `skipWaiting:true` already activates the new SW; just reload.
      window.location.reload();
    },
  },
}
</script>

<style>
.nav-link:hover {
  cursor: pointer;
}
#app {
  position: relative;
  z-index: 1;
}
.global-busy-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: wait;
}
.global-busy-card {
  background: #fff;
  border-radius: 6px;
  padding: 14px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
  min-width: 180px;
}
.global-busy-card .fa-spinner {
  color: #007bff;
  font-size: 18px;
}

.pwa-update-toast {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  z-index: 99999;
  background: #0f172a;
  color: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.25);
  max-width: calc(100vw - 32px);
}
.pwa-update-btn {
  margin-left: 12px;
  padding: 6px 14px;
  border: 0;
  background: #1d4ed8;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.pwa-update-btn:hover { background: #1e40af; }
/*.btn:hover {*/
/*  transform: scale(1.05);*/
/*}*/

td > .fas:hover {
  transform: scale(1.05) !important;
}
i.fas:hover{
  transform: scale(1.05)
}

/*.v-toast {*/
/*  position: relative !important;*/
/*  display: flex;*/
/*  top: 0;*/
/*  bottom: 0;*/
/*  left: 0;*/
/*  right: 0;*/
/*  padding: 2em;*/
/*  overflow: hidden;*/
/*  z-index: 9552 !important;*/
/*  pointer-events: none;*/
/*}*/

/*#app {*/
/*  font-family: Avenir, Helvetica, Arial, sans-serif;*/
/*  -webkit-font-smoothing: antialiased;*/
/*  -moz-osx-font-smoothing: grayscale;*/
/*  color: #2c3e50;*/
/*}*/

/*#nav {*/
/*  padding: 30px;*/
/*}*/

/*#nav a {*/
/*  font-weight: bold;*/
/*  color: #2c3e50;*/
/*}*/

/*#nav a.router-link-exact-active {*/
/*  color: #42b983;*/
/*}*/
</style>
