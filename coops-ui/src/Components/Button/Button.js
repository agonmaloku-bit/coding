export default {
    name: "Button",
    props: {
        icon: String,
        type: String,
        block: String,
        theme: String,
        loading: Boolean,
        disabled: Boolean,
        flex: Boolean,
        icon_size: String
    },
    data() {
        return {
            fontawesome_icon: this.icon,
            fontawesome_size: this.icon_size
        }
    },
    computed: {
        isDisabled() {
            return this.loading || this.disabled;
        },
    }
}