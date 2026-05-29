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
    RESPONSIBLE_PERSON_LIST_GETTER,
    RESPONSIBLE_PERSONS_PAGINATED_DATA_GETTER,
    RESPONSIBLE_PERSON_GETTER,
    NEW_RESPONSIBLE_PERSON_GETTER,
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

    FETCH_ALL_RESPONSIBLE_PERSONS_ACTION,
    FETCH_DETAIL_RESPONSIBLE_PERSON_ACTION,
    STORE_RESPONSIBLE_PERSON_ACTION,
    UPDATE_RESPONSIBLE_PERSON_ACTION,
    DELETE_RESPONSIBLE_PERSON_ACTION,
    ADD_RESPONSIBLE_PERSON_INPUT_ACTION,
    UPDATE_RESPONSIBLE_PERSON_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/ResponsiblePerson/constants';
import {DEPARTMENT_LIST_GETTER, FETCH_ALL_DEPARTMENTS_ACTION} from "../../Store/Modules/Department/constants";
import {FETCH_ALL_PERMISSIONS_ACTION, PERMISSION_LIST_GETTER} from "../../Store/Modules/Permission/constants";
import {useMeta} from "vue-meta";

export default {
    name: "ResponsiblePersons",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Responsible Person' })
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
        ...mapGetters('responsible_person', {
            responsible_person: RESPONSIBLE_PERSON_GETTER,
            newResponsiblePerson: NEW_RESPONSIBLE_PERSON_GETTER,
            responsible_personList: RESPONSIBLE_PERSON_LIST_GETTER,
            responsible_personsPaginatedData: RESPONSIBLE_PERSONS_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
            responsible_personDepartmentsGetter: "responsiblePersonDepartmentsGetter",
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
                if (this.newResponsiblePerson != null) {
                    if (this.newResponsiblePerson['departments'] != null) {
                        return this.newResponsiblePerson.departments;
                    }
                }
                return null;
            },
            set: function (departments) {
                //let depIds = departments.map(a => a.id);
                this.addDepartmentsForNewResponsiblePersonAction(departments);
                this.getRoleByNameForDepartments({ id: departments.id, slug: 'responsible_person'});
                this.setRolesForDepartmentsNullAction();
                this.addRolesForNewResponsiblePersonAction([]);
            }
        },

        selectedRolesForDepartments: {
            get: function () {
                if (this.newResponsiblePerson != null) {
                    if (this.newResponsiblePerson['roles'] != null) {
                        return this.newResponsiblePerson.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForNewResponsiblePersonAction(roles);
            }
        },
        selecteCustomPermissions: {
            get: function () {
                if (this.newResponsiblePerson != null) {
                    if (this.newResponsiblePerson['permissions'] != null) {
                        return this.newResponsiblePerson.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForNewResponsiblePersonAction(permissions);
            }
        },
        editDepartmentsForCurrentResponsiblePerson: {
            get: function () {
                if (this.responsible_person != null) {
                    if (this.responsible_person['department'] != null) {
                        return this.responsible_person.department;
                    }
                }
                return null;
            },
            set: function (department) {
                this.addDepartmentsForEditResponsiblePersonAction(department);
                this.getRoleByNameForDepartments({ id: department.id, slug: 'responsible_person'});
                this.setRolesForDepartmentsNullAction();
                this.setRolesForResponsiblePersonNullAction();
            }
        },
        editRolesForCurrentResponsiblePerson: {
            get: function () {
                if (this.responsible_person != null) {
                    if (this.responsible_person['roles'] != null) {
                        this.getRoleByNameForDepartments({ id: this.responsible_person.department.id, slug: 'responsible_person'});
                        return this.responsible_person.roles;
                    }
                }
                return null;
            },
            set: function (roles) {
                this.addRolesForEditResponsiblePersonAction(roles);
            }
        },
        editCustomPermissions: {
            get: function () {
                if (this.responsible_person != null) {
                    if (this.responsible_person['permissions'] != null) {
                        return this.responsible_person.permissions;
                    }
                }
                return null;
            },
            set: function (permissions) {
                this.addCustomPermissionsForEditResponsiblePersonAction(permissions);
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
        ...mapActions("responsible_person", {
            fetchAllResponsiblePersons: FETCH_ALL_RESPONSIBLE_PERSONS_ACTION,
            fetchDetailResponsiblePerson: FETCH_DETAIL_RESPONSIBLE_PERSON_ACTION,
            storeResponsiblePerson: STORE_RESPONSIBLE_PERSON_ACTION,
            updateResponsiblePerson: UPDATE_RESPONSIBLE_PERSON_ACTION,
            addResponsiblePersonInput: ADD_RESPONSIBLE_PERSON_INPUT_ACTION,
            updateResponsiblePersonInput: UPDATE_RESPONSIBLE_PERSON_INPUT_ACTION,
            deleteResponsiblePerson: DELETE_RESPONSIBLE_PERSON_ACTION,
            setErrors: SET_ERRORS_ACTION,
            addDepartmentsForNewResponsiblePersonAction: "addDepartmentsForNewResponsiblePersonAction",
            addRolesForNewResponsiblePersonAction: "addRolesForNewResponsiblePersonAction",
            addCustomPermissionsForNewResponsiblePersonAction: "addCustomPermissionsForNewResponsiblePersonAction",
            addDepartmentsForEditResponsiblePersonAction: "addDepartmentsForEditResponsiblePersonAction",
            addRolesForEditResponsiblePersonAction: "addRolesForEditResponsiblePersonAction",
            setRolesForResponsiblePersonNullAction: "setRolesForResponsiblePersonNullAction",
            addCustomPermissionsForEditResponsiblePersonAction: "addCustomPermissionsForEditResponsiblePersonAction",
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
            this.fetchDetailResponsiblePerson(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailResponsiblePerson(id);
            this.fetchAllDepartments();
            this.fetchAllPermissionsAction();
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addResponsiblePersonInputAction(e) {
            this.addResponsiblePersonInput(e);
        },
        updateResponsiblePersonInputAction(e) {
            this.updateResponsiblePersonInput(e);
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
            } = this.newResponsiblePerson;
            this.storeResponsiblePerson({
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
            const rp = this.responsible_person;
            const first_name = rp.first_nameNew != null ? rp.first_nameNew : rp.first_name;
            const last_name = rp.last_nameNew != null ? rp.last_nameNew : rp.last_name;
            const email = rp.emailNew != null ? rp.emailNew : rp.email;
            const department = rp.department;
            const roles = rp.roles;
            const password = rp.passwordNew;
            const password_confirmation = rp.password_confirmationNew;
            const permissions = rp.permissions;
            if (password != null || password_confirmation != null) {
                this.updateResponsiblePerson({
                    id: rp.id,
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
                this.updateResponsiblePerson({
                    id: rp.id,
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
                    text: this.$t('responsiblePerson.deleteConfirm'),
                    icon: "error",
                    cancelButtonText: this.$t('common.cancel'),
                    confirmButtonText: this.$t('responsiblePerson.confirmDelete'),
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteResponsiblePerson(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: this.$t('responsiblePerson.deleteSuccess'),
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllResponsiblePersons(this.query);
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
            let permission = "Responsible Person Show All";
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
            let permission = "Responsible Person Show";
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
            let permission = "Responsible Person Add";
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
            let permission = "Responsible Person Edit";
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
            let permission = "Responsible Person Delete";
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
                    text: this.$t('responsiblePerson.updateSuccess'),
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
                    text: this.$t('responsiblePerson.addSuccess'),
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
            this.fetchAllResponsiblePersons(this.getRouteQuery())
        }
    },
}