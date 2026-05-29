export default {
    name: "Modal",
    methods: {
        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
        },
        modalContent() {
        },
    }
}