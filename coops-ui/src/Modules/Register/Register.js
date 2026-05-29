export default {
    name: "Register",
    data() {
        return {
            appElement: null,
        }
    },
    mounted() {
        this.appElement = document.getElementsByTagName('body')[0];
        this.appElement.classList.add('register-page');
    },
    unmounted() {
        this.appElement.classList.remove('register-page');
    },
}