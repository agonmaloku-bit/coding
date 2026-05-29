import DropdownMenu from './DropdownMenu/DropdownMenu.vue';

export default {
    name: "Dropdown",
    components: {
        'app-dropdown-menu': DropdownMenu
    },
    props: {
        size: String
    },
    data() {
        return {
            dropdownElement: null,
            isOpen: false,
            //size: 'md',
        }
    },
    mounted() {
        this.dropdownElement = this.$refs.dropdown;
        document.addEventListener('click', this.documentClick);
    },
    unmounted() {
        document.removeEventListener('click', this.documentClick);
    },
    methods: {
        documentClick(event) {
            const target = event.target;
            if (
                this.dropdownElement !== target &&
                !this.dropdownElement.contains(target)
            ) {
                this.isOpen = false;
            }
        },
        toggleDropdown() {
            this.isOpen = !this.isOpen;
        }
    }
}