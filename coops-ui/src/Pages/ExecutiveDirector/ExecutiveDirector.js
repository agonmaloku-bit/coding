import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import {mapGetters, mapActions} from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from '@/Components/vue-multiselect/src';
// import "vue-multiselect/dist/vue-multiselect.css";
import {
    EXECUTIVE_DIRECTOR_LIST_GETTER,
    EXECUTIVE_DIRECTORS_PAGINATED_DATA_GETTER,
    EXECUTIVE_DIRECTOR_GETTER,
    NEW_EXECUTIVE_DIRECTOR_GETTER,
    FIRST_TIME_LOADED_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_LOADING_GETTER,
    IS_CREATING_GETTER,
    CREATED_DATA_GETTER,
    IS_UPDATING_GETTER,
    UPDATED_DATA_GETTER,
    // IS_DELETING_GETTER,
    // DELETED_DATA_GETTER,
    ERRORS_GETTER,

    FETCH_ALL_EXECUTIVE_DIRECTORS_ACTION,
    FETCH_DETAIL_EXECUTIVE_DIRECTOR_ACTION,
    STORE_EXECUTIVE_DIRECTOR_ACTION,
    UPDATE_EXECUTIVE_DIRECTOR_ACTION,
    DELETE_EXECUTIVE_DIRECTOR_ACTION,
    ADD_EXECUTIVE_DIRECTOR_INPUT_ACTION,
    UPDATE_EXECUTIVE_DIRECTOR_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/ExecutiveDirector/constants';
import {DEPARTMENT_LIST_GETTER, FETCH_ALL_DEPARTMENTS_ACTION} from "../../Store/Modules/Department/constants";
import {FETCH_ALL_PERMISSIONS_ACTION, PERMISSION_LIST_GETTER} from "../../Store/Modules/Permission/constants";
import {useMeta} from "vue-meta";

export default {
    name: "ExecutiveDirectors",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Executive Directors' })
    },
    data() {
        return {
            modalAddActive: false,
            modalInfoActive: false,
            modalEditActive: false,
            query: {
                page: 1,
            },
            customPermissions: false,
            customEditPermissions: false,
            canShowAll: false,
            canShow: false,
            canAdd: false,
            canEdit: false,
            canDelete: false,
        }
    },
    computed: {
        ...mapGetters('executive_director', {
            executive_director: EXECUTIVE_DIRECTOR_GETTER,
            newExecutiveDirector: NEW_EXECUTIVE_DIRECTOR_GETTER,
            executive_directorList: EXECUTIVE_DIRECTOR_LIST_GETTER,
            executive_directorsPaginatedData: EXECUTIVE_DIRECTORS_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
            executive_directorDepartmentsGetter: "executiveDirectorDepartmentsGetter",
        }),

        ...mapGetters("departments", {
            departmentList: DEPARTMENT_LIST_GETTER,
        }),

        ...mapGetters('roles', {
            roleByNameForDepartmentsGetter: "roleByNameForDepartmentsGetter",
        }),

        ...mapGetters('permissions', {
            permissionListGetter: PERMISSION_LIST_GETTER,
        }),

        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },

        selecteNewDepartments: {
            get: function () {
                if (this.newExecutiveDirector != null) {
                    if (this.newExecutiveDirector['departments'] != null) {
                        return this.newExecutiveDirector.departments;
                    }
                }
                return null;
            },
            set: function (departments) {
                //let depIds = departments.map(a => a.id);
                this.addDepartmentsForNewExecutiveDirectorAction(departments);
                this.getRoleByNameForDepartments({ id: departments.id, slug: 'executive_director'});
                this.setRolesForDepartmentsNullAction();
                this.addRolesForNewExecutiveDirectorAction([]);
            }
        },

        selectedRolesForDepartments: {
            get: function () {
                if (this.newExecutiveDirector != null) {
                    if (this.newExecutiveDirector['roles'] != null) {
                        return this.newExecutiveDirector.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForNewExecutiveDirectorAction(roles);
            }
        },
        selecteCustomPermissions: {
            get: function () {
                if (this.newExecutiveDirector != null) {
                    if (this.newExecutiveDirector['permissions'] != null) {
                        return this.newExecutiveDirector.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForNewExecutiveDirectorAction(permissions);
            }
        },
        editDepartmentsForCurrentExecutiveDirector: {
            get: function () {
                if (this.executive_director != null) {
                    if (this.executive_director['department'] != null) {
                        return this.executive_director.department;
                    }
                }
                return null;
            },
            set: function (department) {
                this.addDepartmentsForEditExecutiveDirectorAction(department);
                this.getRoleByNameForDepartments({ id: department.id, slug: 'executive_director'});
                this.setRolesForDepartmentsNullAction();
                this.setRolesForExecutiveDirectorNullAction();
            }
        },
        editRolesForCurrentExecutiveDirector: {
            get: function () {
                if (this.executive_director != null) {
                    if (this.executive_director['roles'] != null) {
                        this.getRoleByNameForDepartments({ id: this.executive_director.department.id, slug: 'executive_director'});
                        return this.executive_director.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForEditExecutiveDirectorAction(roles);
            }
        },
        editCustomPermissions: {
            get: function () {
                if (this.executive_director != null) {
                    if (this.executive_director['permissions'] != null) {
                        return this.executive_director.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForEditExecutiveDirectorAction(permissions);
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
        ...mapActions("executive_director", {
            fetchAllExecutiveDirectors: FETCH_ALL_EXECUTIVE_DIRECTORS_ACTION,
            fetchDetailExecutiveDirector: FETCH_DETAIL_EXECUTIVE_DIRECTOR_ACTION,
            storeExecutiveDirector: STORE_EXECUTIVE_DIRECTOR_ACTION,
            updateExecutiveDirector: UPDATE_EXECUTIVE_DIRECTOR_ACTION,
            addExecutiveDirectorInput: ADD_EXECUTIVE_DIRECTOR_INPUT_ACTION,
            updateExecutiveDirectorInput: UPDATE_EXECUTIVE_DIRECTOR_INPUT_ACTION,
            deleteExecutiveDirector: DELETE_EXECUTIVE_DIRECTOR_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addDepartmentsForNewExecutiveDirectorAction: "addDepartmentsForNewExecutiveDirectorAction",
            addRolesForNewExecutiveDirectorAction: "addRolesForNewExecutiveDirectorAction",
            addCustomPermissionsForNewExecutiveDirectorAction: "addCustomPermissionsForNewExecutiveDirectorAction",
            addDepartmentsForEditExecutiveDirectorAction: "addDepartmentsForEditExecutiveDirectorAction",
            addRolesForEditExecutiveDirectorAction: "addRolesForEditExecutiveDirectorAction",
            setRolesForExecutiveDirectorNullAction: "setRolesForExecutiveDirectorNullAction",
            addCustomPermissionsForEditExecutiveDirectorAction: "addCustomPermissionsForEditExecutiveDirectorAction",
        }),

        ...mapActions("departments", {
            fetchAllDepartments: FETCH_ALL_DEPARTMENTS_ACTION,
        }),

        ...mapActions("roles", {
            getRoleByNameForDepartments: "getRoleByNameForDepartments",
            setRolesForDepartmentsNullAction: "setRolesForDepartmentsNullAction",
        }),

        ...mapActions("permissions", {
            fetchAllPermissionsAction: FETCH_ALL_PERMISSIONS_ACTION,
        }),

        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
            this.modalAddActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
        },

        showAddModal() {
            this.fetchAllDepartments();
            this.fetchAllPermissionsAction();
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.setErrors(null);
            return this.modalAddActive = !this.modalAddActive;
        },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailExecutiveDirector(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailExecutiveDirector(id);
            this.fetchAllDepartments();
            this.fetchAllPermissionsAction();
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addExecutiveDirectorInputAction(e) {
            this.addExecutiveDirectorInput(e);
        },
        updateExecutiveDirectorInputAction(e) {
            this.updateExecutiveDirectorInput(e);
        },
        onSubmitAdd() {
            const {
                first_name,
                last_name,
                email,
                password,
                password_confirmation,
                departments,
                roles,
                permissions
            } = this.newExecutiveDirector;
            this.storeExecutiveDirector({
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password,
                password_confirmation: password_confirmation,
                department_id: departments != null ? departments.id : null,
                roles: roles,
                permissions: this.customPermissions === true ? permissions : "",
            });
        },
        onSubmitEdit() {
            const ed = this.executive_director;
            const first_name = ed.first_nameNew != null ? ed.first_nameNew : ed.first_name;
            const last_name = ed.last_nameNew != null ? ed.last_nameNew : ed.last_name;
            const email = ed.emailNew != null ? ed.emailNew : ed.email;
            const department = ed.department;
            const roles = ed.roles;
            const password = ed.passwordNew;
            const password_confirmation = ed.password_confirmationNew;
            const permissions = ed.permissions;
            if (password != null || password_confirmation != null) {
                this.updateExecutiveDirector({
                    id: ed.id,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    password: password,
                    password_confirmation: password_confirmation,
                    department_id: department != null ? department.id : null,
                    roles: roles != null ? roles : null,
                    permissions: permissions,
                });
            } else {
                this.updateExecutiveDirector({
                    id: ed.id,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    department_id: department != null ? department.id : null,
                    roles: roles != null ? roles : null,
                    permissions: permissions,
                });
            }
        },

        showDeleteModal(id) {
            this.$swal
                .fire({
                    text: this.$t('executiveDirector.deleteConfirm'),
                    icon: "error",
                    cancelButtonText: this.$t('common.cancel'),
                    confirmButtonText: this.$t('executiveDirector.confirmDelete'),
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteExecutiveDirector(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: this.$t('executiveDirector.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllExecutiveDirectors(this.query);
        },
        getRouteQuery() {
            if (this.$route.query.page != null) {
                this.query.page = parseInt(this.$route.query.page);
            }
            return this.query;
        },
        modalContent() {
        },
        checkIfFieldHasErrors(errors, field, loader) {
            if (errors != null && !loader) {
                if (errors[field] != null) {
                    return true;
                }
            }
            return false;
        },
        editCustomPermissionsTrueOrFalse(value) {
            this.customEditPermissions = value;
        },
        checkIfUserHasPermissionToShowAll() {
            let permission = "Executive Director Show All";
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
            let permission = "Executive Director Show";
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
        checkIfUserHasPermissionToAdd() {
            let permission = "Executive Director Add";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canAdd = true;
            }
            if (p2.length >= 1) {
                return this.canAdd = true;
            }

            return this.canAdd = false;
        },
        checkIfUserHasPermissionToEdit() {
            let permission = "Executive Director Edit";
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
        checkIfUserHasPermissionToDelete() {
            let permission = "Executive Director Delete";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canDelete = true;
            }
            if (p2.length >= 1) {
                return this.canDelete = true;
            }

            return this.canDelete = false;
        },
    },
    watch: {
        updatedData: function () {
            if (this.updatedData !== null && !this.isUpdating) {
                this.$store.dispatch('ui/setModalActive', !this.isModalActive);
                this.$swal.fire({
                    text: this.$t('executiveDirector.updateSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                return this.modalEditActive = !this.modalEditActive;
            }
        },
        createdData: function () {
            if (this.createdData !== null && !this.isCreating) {
                this.$store.dispatch('ui/setModalActive', !this.isModalActive);
                // console.log(this.createdData)
                // console.log(this.isCreating)
                this.$swal.fire({
                    text: this.$t('executiveDirector.addSuccess'),
                    icon: "success",
                    timer: 10000,
                });

                return this.modalAddActive = !this.modalAddActive;
            }
        },
    },
    created() {
        this.checkIfUserHasPermissionToShowAll()
        this.checkIfUserHasPermissionToShow()
        this.checkIfUserHasPermissionToAdd()
        this.checkIfUserHasPermissionToEdit()
        this.checkIfUserHasPermissionToDelete()
        if (this.canShowAll) {
            this.fetchAllExecutiveDirectors(this.getRouteQuery())
        }
    },
}