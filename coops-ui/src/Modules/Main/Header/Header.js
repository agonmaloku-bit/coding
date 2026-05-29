// import Messages from './Messages/Messages.vue';
// import Notifications from './Notifications/Notifications.vue';
import User from './User/User.vue';

export default {
    name: "Header",
    components: {
        // 'messages-dropdown': Messages,
        // 'notifications-dropdown': Notifications,
        'user-dropdown': User
    },
    data() {
        return {
            langDropdownOpen: false
        }
    },
    computed: {
        currentLocaleLabel() {
            return this.$i18n.locale === 'sq' ? 'SQ' : 'EN';
        }
    },
    methods: {
        onToggleMenuSidebar() {
            this.$emit('toggle-menu-sidebar');
        },
        toggleLangDropdown() {
            this.langDropdownOpen = !this.langDropdownOpen;
        },
        switchLocale(locale) {
            this.$i18n.locale = locale;
            localStorage.setItem('locale', locale);
            this.langDropdownOpen = false;
        }
    },
    mounted() {
        document.addEventListener('click', (e) => {
            if (!this.$el.contains(e.target)) {
                this.langDropdownOpen = false;
            }
        });
    }
}