import Dropdown from '@/Components/Dropdown/Dropdown.vue';

export default {
    name: "User",
    components: {
        'app-dropdown': Dropdown
    },
    computed: {
        user() {
            return this.$store.state.auth.user.user;
        }
    },
    methods: {
        logOut() {
            this.$store.dispatch('auth/logout');
        }
    }
}