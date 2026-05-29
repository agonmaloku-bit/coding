import Header from './Header/Header.vue';
import MenuSidebar from './MenuSidebar/MenuSidebar.vue';
import Footer from './Footer/Footer.vue';

export default {
    name: "Main",
    components: {
        'app-header': Header,
        'menu-sidebar': MenuSidebar,
        'app-footer': Footer,
    },
    data() {
        return {
            appElement: null,
        }
    },
    mounted() {
        this.appElement = document.getElementsByTagName('body')[0];
        this.appElement.classList.add('hold-transition');
        this.appElement.classList.add('sidebar-mini');
        this.appElement.classList.add('layout-fixed');
    },
    unmounted() {
        this.appElement.classList.remove('hold-transition');
        this.appElement.classList.remove('sidebar-mini');
        this.appElement.classList.remove('layout-fixed');
    },
    watch: {
        // watchLayoutChanges(value) {
        //   console.log(value);
        // },
        isSidebarMenuCollapsed: function (newValue) {
            this.watchLayoutChanges(newValue);
        },
    },
    computed: {
        isSidebarMenuCollapsed() {
            return this.$store.getters['ui/isSidebarMenuCollapsed'];
        },
        screenSize() {
            return this.$store.getters['ui/screenSize'];
        },
        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        }
    },
    methods: {
        toggleMenuSidebar() {
            this.$store.dispatch('ui/toggleSidebarMenu');
        },
        watchLayoutChanges() {
            if (!this.appElement) {
                return;
            }

            this.appElement.classList.remove('sidebar-closed');
            this.appElement.classList.remove('sidebar-collapse');
            this.appElement.classList.remove('sidebar-open');
            if (this.isSidebarMenuCollapsed && this.screenSize === 'lg') {
                this.appElement.classList.add('sidebar-collapse');
            } else if (this.isSidebarMenuCollapsed && this.screenSize === 'xs') {
                this.appElement.classList.add('sidebar-open');
            } else if (!this.isSidebarMenuCollapsed && this.screenSize !== 'lg') {
                this.appElement.classList.add('sidebar-closed');
                this.appElement.classList.add('sidebar-collapse');
            }
            return this.appElement.classList.value;
        },
        setModalActive() {
            this.$store.dispatch('ui/setModalActive', false);
        },
    },
    created() {
        this.$store.dispatch('auth/getUser')
    }
}