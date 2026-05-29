export default {
    name: "NotFound",
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
    },
    created() {
        // if (this.loggedIn) {
        //     this.$router.push("/platform");
        // }
    },
}