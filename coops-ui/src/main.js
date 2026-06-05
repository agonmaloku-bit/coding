import { createApp } from 'vue'
import App from './App.vue'
import Router from './Router'
import Store from './Store'
import { createMetaManager } from 'vue-meta'
import i18n from './i18n'
import './registerServiceWorker'

import './index.css';
import 'nprogress/nprogress.css';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import VueToast from 'vue-toast-notification';
// import 'vue-toast-notification/dist/theme-default.css';
import 'vue-toast-notification/dist/theme-sugar.css';


import Button from '@/Components/Button/Button.vue';
import Loader from '@/Components/Loader/Loader.vue';

const app = createApp(App);

app.use(i18n);
app.use(Store);
app.use(Router);
app.use(VueSweetalert2);
app.use(VueToast, {
    position: 'bottom-right',
    duration: 10000,
});
app.use(createMetaManager())
// app.use(vueMetaPlugin)

app.component('app-button', Button);
app.component('app-loader', Loader);

app.config.devtools = process.env.VUE_APP_DEV_TOOLS;
app.config.globalProperties.appTitle = process.env.VUE_APP_TITLE;
app.config.globalProperties.appDescription = process.env.VUE_APP_DESCRIPTION;

Router.isReady().then(app.mount('#app'))
