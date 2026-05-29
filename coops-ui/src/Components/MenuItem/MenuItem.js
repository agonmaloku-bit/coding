export default {
    name: "app-menu-item",
    props: {
        menuItem: Object,
        icon: String,
        type: String,
        placeholder: String,
        autocomplete: String
    },
    data() {
        return {
            // menuItem: null,
            isMenuExtended: false,
            isExpandable: false,
            isMainActive: false,
            isOneOfChildrenActive: false,
        }
    },
    mounted() {
        this.isExpandable = this.menuItem && this.menuItem.children && this.menuItem.children.length > 0;
        this.calculateIsActive(this.$router.currentRoute.value.path);
        this.$router.afterEach((to) => {
            this.calculateIsActive(to.path);
        });
    },
    methods: {
        handleMainMenuAction() {
            if (this.isExpandable) {
                this.toggleMenu();
                return;
            }
            this.$router.replace(this.menuItem.path);
        },

        toggleMenu() {
            this.isMenuExtended = !this.isMenuExtended;
        },

        calculateIsActive(url) {
            this.isMainActive = false;
            this.isOneOfChildrenActive = false;
            if (this.isExpandable) {
                this.menuItem.children.forEach((item) => {
                    if (item.path === url) {
                        this.isOneOfChildrenActive = true;
                        this.isMenuExtended = true;
                    }
                });
            } else if (this.menuItem.path === url) {
                this.isMainActive = true;
            }
            if (!this.isMainActive && !this.isOneOfChildrenActive) {
                this.isMenuExtended = false;
            }
        }
    },

}