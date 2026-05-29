export default {
    name: "app-dropdown-menu",
    props: {
        size: String
    },
    data() {
        return {
            dropdownMenuElement: null,
        }
    },
    mounted() {
        this.dropdownMenuElement = this.$refs.dropdownMenu;
    },
    methods: {
        fixStyles() {
            if (this.dropdownMenuElement) {
                const windowWidth = document.getElementsByTagName('body')[0].offsetWidth;
                const offsetLeft = this.dropdownMenuElement.getBoundingClientRect().left;
                const offsetWidth = this.dropdownMenuElement.offsetWidth;
                const visiblePart = windowWidth - offsetLeft;

                if (offsetLeft < 0) {
                    return {
                        left: 'inherit',
                        right: `${offsetLeft - 5}px`
                    };
                } else if (visiblePart < offsetWidth) {
                    return {left: 'inherit', right: `0px`};
                }
                return {left: 'inherit', right: `0px`};
            }
            return {left: 'inherit', right: `0px`};
        }
    }
}