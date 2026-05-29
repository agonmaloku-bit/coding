import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";

export default {
    name: "Profile",
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
    },
    data() {
      return {
          first_name: null,
          last_name: null,
          email: null,
          password: null,
          password_confirmation: null,
      }
    },
    computed: {
        user() {
            return this.$store.state.auth.user.user;
        },
        errors() {
            return this.$store.getters['auth/errorsGetter'];
        }
    },
    methods: {
        onSubmit() {
            let user = [];
            if (this.first_name !== null) {
                user['first_name'] = this.first_name
            }
            if (this.last_name !== null) {
                user['last_name'] = this.last_name
            }
            if (this.password !== null) {
                user['password'] = this.password
            }
            if (this.password_confirmation !== null) {
                user['password_confirmation'] = this.password_confirmation
            }

            this.$store.dispatch("auth/changeProfile", user).then(
                () => {
                    this.$swal.fire({
                        text: this.$t('profile.updateSuccess'),
                        icon: "success",
                        timer: 10000,
                    }).then(() => {
                        location.reload();
                    });
                },
                () => {
                    // console.log(error.message);
                }
            );
        },
        checkIfFieldHasErrors(errors, field) {
            if (errors != null) {
                if (errors[field] != null) {
                    return true;
                }
            }
            return false;
        },
    },
}