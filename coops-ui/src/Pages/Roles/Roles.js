import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import {mapGetters, mapActions} from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from '@/Components/vue-multiselect/src';
import {
    ROLE_LIST_GETTER,
    ROLES_PAGINATED_DATA_GETTER,
    ROLE_GETTER,
    FIRST_TIME_LOADED_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_LOADING_GETTER,
    IS_UPDATING_GETTER,
    UPDATED_DATA_GETTER,
    // IS_DELETING_GETTER,
    // DELETED_DATA_GETTER,
    ERRORS_GETTER,

    FETCH_ALL_ROLES_ACTION,
    FETCH_DETAIL_ROLE_ACTION,
    UPDATE_ROLE_ACTION,
    DELETE_ROLE_ACTION,
    UPDATE_ROLE_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/Role/constants';
import {DEPARTMENT_LIST_GETTER, FETCH_ALL_DEPARTMENTS_ACTION} from "../../Store/Modules/Department/constants";
import {FETCH_ALL_PERMISSIONS_ACTION, PERMISSION_LIST_GETTER} from "../../Store/Modules/Permission/constants";
import {useMeta} from "vue-meta";

export default {
    name: "Roles",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Roles' })
    },
    data() {
        return {
            modalInfoActive: false,
            modalEditActive: false,
            query: {
                page: 1,
            },
            canShowAll: false,
            canShow: false,
            canEdit: false,
        }
    },
    computed: {
        ...mapGetters('roles', {
            role: ROLE_GETTER,
            roleList: ROLE_LIST_GETTER,
            rolesPaginatedData: ROLES_PAGINATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER
        }),
        ...mapGetters("departments", {
            departmentList: DEPARTMENT_LIST_GETTER,
            "countDepartments": "countDepartments"
        }),
        ...mapGetters('permissions', {
            permissionList: PERMISSION_LIST_GETTER,
        }),
        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },
        selectedDepartments: {
            get: function () {
                return this.role.departments;
            },
            set: function (newValue) {
                this.updateRoleDepartmentsAction(newValue);
            }
        },
        selectedPermissions: {
            get: function () {
                return this.role.permissions;
            },
            set: function (newValue) {
                this.updateRolePermissionsAction(newValue);
            }
        },
        rolePermissions() {
            return this.$store.getters['auth/rolePermissions']
        },
        directPermissions() {
            return this.$store.getters['auth/directPermissions']
        }
    },
    methods: {
        ...mapActions("roles", {
            fetchAllRoles: FETCH_ALL_ROLES_ACTION,
            fetchDetailRole: FETCH_DETAIL_ROLE_ACTION,
            updateRole: UPDATE_ROLE_ACTION,
            updateRoleInput: UPDATE_ROLE_INPUT_ACTION,
            deleteRole: DELETE_ROLE_ACTION,
            setErrors: SET_ERRORS_ACTION,
            updateRoleDepartmentsAction: "updateRoleDepartmentsAction",
            updateRolePermissionsAction: "updateRolePermissionsAction",
        }),
        ...mapActions("departments", {
            fetchAllDepartments: FETCH_ALL_DEPARTMENTS_ACTION,
            getCountDepartments: "getCountDepartments"
        }),
        ...mapActions("permissions", {
            fetchAllPermissions: FETCH_ALL_PERMISSIONS_ACTION,
        }),
        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
            this.modalAddActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
        },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailRole(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            // this.$store.dispatch('roles/setErrors', null);
            this.fetchDetailRole(id);
            this.fetchAllDepartments();
            this.fetchAllPermissions();
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        updateRoleInputAction(e) {
            this.updateRoleInput(e);
        },
        onSubmitEdit() {
            const {id, name, description, departments, permissions} = this.role;
            this.updateRole({
                id: id,
                name: name,
                description: description,
                departments: departments,
                permissions: permissions
            });
        },
        getResults() {
            this.fetchAllRoles(this.query);
        },
        getRouteQuery() {
            if (this.$route.query.page != null) {
                this.query.page = parseInt(this.$route.query.page);
            }
            return this.query;
        },
        modalContent() {
        },
        checkRoleDepartments(length) {
            if (length == this.countDepartments) {
                return "HAS ALL";
            } else if (length >= 3) {
                return "HAS MANY";
            } else if (length == 2) {
                return "HAS TWO";
            } else if (length == 1) {
                return "HAS ONE";
            } else {
                return "DOSEN'T HAVE ANY";
            }
        },
        checkIfFieldHasErrors(errors, field, loader) {
            if (errors != null && !loader) {
                if (errors[field] != null) {
                    return true;
                }
            }
            return false;
        },
        checkIfUserHasPermissionToShowAll() {
            let permission = "Roles Show All";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canShowAll = true;
            }
            if (p2.length >= 1) {
                return this.canShowAll = true;
            }


            return this.canShowAll = false;
        },
        checkIfUserHasPermissionToShow() {
            let permission = "Roles Show";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canShow = true;
            }
            if (p2.length >= 1) {
                return this.canShow = true;
            }

            return this.canShow = false;
        },
        checkIfUserHasPermissionToEdit() {
            let permission = "Roles Edit";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canEdit = true;
            }
            if (p2.length >= 1) {
                return this.canEdit = true;
            }

            return this.canEdit = false;
        },
    },
    watch: {
        updatedData: function () {
            if (this.updatedData !== null && !this.isUpdating) {
                this.$store.dispatch('ui/setModalActive', !this.isModalActive);
                this.$swal.fire({
                    text: "Role has been updated successfully!",
                    icon: "success",
                    timer: 10000,
                }).then(() => {
                    location.reload()
                });

                return this.modalEditActive = !this.modalEditActive;
            }
        },
    },
    created() {
        this.checkIfUserHasPermissionToShowAll()
        this.checkIfUserHasPermissionToShow()
        this.checkIfUserHasPermissionToEdit()
        if (this.canShowAll) {
            this.fetchAllRoles(this.getRouteQuery())
            this.getCountDepartments()
        }
    },
}