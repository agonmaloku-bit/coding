// import { mapGetters } from "vuex";
import Button from '@/Components/Button/Button.vue';
import { API_BASE_URL } from '@/http-common';

export default {
    name: "Login",
    components: {
        'app-button': Button
    },
    data() {
        return {
            appElement: null,
            email: null,
            password: null,
            remember_me: false,
            serverUrl: localStorage.getItem('apiBaseUrl') || API_BASE_URL || '',
            showServerField: !!localStorage.getItem('apiBaseUrl'),
        }
    },
    mounted() {
        this.appElement = document.getElementsByTagName('body')[0];
        this.appElement.classList.add('login-page');
    },
    unmounted() {
        this.appElement.classList.remove('login-page');
    },
    computed: {
        loggedIn() {
            return this.$store.state.auth.status.loggedIn;
        },
        isLoading() {
            return this.$store.state.auth.status.isLoading;
        },
        errorStatus() {
            return this.$store.state.auth.error.status;
        },
        errorMessage() {
            return this.$store.state.auth.error.message;
        },
    },
    created() {
        if (this.loggedIn) {
            this.$router.push("/platform");
        }
    },
    methods: {
        toggleServerField() {
            this.showServerField = !this.showServerField;
        },
        applyServerUrl() {
            // Persist the chosen server URL so the next request rebuild uses it.
            // We require a hard reload because axios is configured at module load.
            const raw = (this.serverUrl || '').trim();
            if (!raw) {
                localStorage.removeItem('apiBaseUrl');
            } else {
                let v = raw;
                if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
                if (!v.endsWith('/')) v += '/';
                localStorage.setItem('apiBaseUrl', v);
                this.serverUrl = v;
            }
            window.location.reload();
        },
        handleLogin() {
            const user = {
                email: this.email,
                password: this.password,
                remember_me: this.remember_me
            };

            this.$store.dispatch("auth/login", user).then(
                () => {
                    this.$swal.fire({
                        text: "You are Logged in.",
                        icon: "success",
                        timer: 10000,
                    });
                    this.$router.push("/platform");
                },
                () => {
                    // console.log(error.message);
                }
            );
        },
    },
}