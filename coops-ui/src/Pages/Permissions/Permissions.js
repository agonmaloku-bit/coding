import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import dirtyGuard from "../../Mixins/dirtyGuard";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import {mapGetters, mapActions} from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from '@/Components/vue-multiselect/src';
import {
    PERMISSION_LIST_GETTER,
    PERMISSIONS_PAGINATED_DATA_GETTER,
    PERMISSION_GETTER,
    // NEW_PERMISSION_GETTER,
    FIRST_TIME_LOADED_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_LOADING_GETTER,
    // IS_CREATING_GETTER,
    // CREATED_DATA_GETTER,
    // IS_UPDATING_GETTER,
    // UPDATED_DATA_GETTER,
    // IS_DELETING_GETTER,
    // DELETED_DATA_GETTER,
    ERRORS_GETTER,

    FETCH_ALL_PERMISSIONS_ACTION,
    FETCH_DETAIL_PERMISSION_ACTION,
    // STORE_PERMISSION_ACTION,
    // UPDATE_PERMISSION_ACTION,
    // DELETE_PERMISSION_ACTION,
    // ADD_PERMISSION_INPUT_ACTION,
    // UPDATE_PERMISSION_INPUT_ACTION,
    // SET_ERRORS_ACTION
} from '@/Store/Modules/Permission/constants';
import {useMeta} from "vue-meta";

export default {
    name: "Permissions",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
    },
    setup () {
        useMeta({ title: 'Permissions' })
    },
    data() {
        return {
            // modalAddActive: false,
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
        ...mapGetters('permissions', {
            permission: PERMISSION_GETTER,
            // newPermission: NEW_PERMISSION_GETTER,
            permissionList: PERMISSION_LIST_GETTER,
            permissionsPaginatedData: PERMISSIONS_PAGINATED_DATA_GETTER,
            // createdData: CREATED_DATA_GETTER,
            // updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            // isCreating: IS_CREATING_GETTER,
            // isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER,
            // modulesList: "modulesList",
            // permissionTypes: "permissionTypes",
        }),

        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },

        // permissionmodules: {
        //   get: function () {
        //     if (this.newPermission != null) {
        //       if (this.newPermission['module'] != null) {
        //         return this.newPermission.module;
        //       }
        //     }
        //     return null;
        //   },
        //   set: function (newValue) {
        //     this.addPermissionModuleAction(newValue);
        //   }
        // },
        // permissionTypesComputed: {
        //   get: function () {
        //     if (this.newPermission != null) {
        //       if (this.newPermission['name'] != null) {
        //         return this.newPermission.name;
        //       }
        //     }
        //     return null;
        //   },
        //   set: function (newValue) {
        //     this.addPermissionTypeInputAction(newValue);
        //   }
        // },
        // permissionModulesEdit: {
        //     get: function () {
        //         if (this.permission != null) {
        //             if (this.permission['module'] == null) {
        //                 let per = this.permission.name.split("_");
        //                 return { name: per[0].charAt(0).toUpperCase() + per[0].slice(1), slug: per[0] }
        //             }
        //         }
        //         return this.permission['module'];
        //     },
        //     set: function (newValue) {
        //         this.editPermissionModuleAction(newValue);
        //     }
        // },
        // permissionTypesEdit: {
        //     get: function () {
        //         if (this.permission != null) {
        //             if(this.permission['type'] == null) {
        //                 if (this.permission['name'] != null) {
        //                     let per = this.permission['name'].split("_");
        //                     return {name: per[1].charAt(0).toUpperCase() + per[1].slice(1), slug: per[1]}
        //                 }
        //             }
        //         }
        //         return this.permission['type'];
        //     },
        //     set: function (newValue) {
        //         this.editPermissionTypeInputAction(newValue);
        //     }
        // },

        rolePermissions() {
            return this.$store.getters['auth/rolePermissions']
        },
        directPermissions() {
            return this.$store.getters['auth/directPermissions']
        }
    },
    methods: {
        ...mapActions("permissions", {
            fetchAllPermissions: FETCH_ALL_PERMISSIONS_ACTION,
            fetchDetailPermission: FETCH_DETAIL_PERMISSION_ACTION,
            // storePermission: STORE_PERMISSION_ACTION,
            // updatePermission: UPDATE_PERMISSION_ACTION,
            // addPermissionInput: ADD_PERMISSION_INPUT_ACTION,
            // updatePermissionInput: UPDATE_PERMISSION_INPUT_ACTION,
            // deletePermission: DELETE_PERMISSION_ACTION,
            // setErrors: SET_ERRORS_ACTION,
            // addPermissionModuleAction: "addPermissionModuleAction",
            // addPermissionTypeInputAction: "addPermissionTypeInputAction",
            // editPermissionModuleAction: "editPermissionModuleAction",
            // editPermissionTypeInputAction: "editPermissionTypeInputAction",
        }),

        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
            // this.modalAddActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
        },

        // showAddModal() {
        //   this.$store.dispatch('ui/setModalActive', !this.isModalActive);
        //   this.setErrors(null);
        //   return this.modalAddActive = !this.modalAddActive;
        // },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailPermission(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        // showEditModal(id) {
        //     this.$store.dispatch('ui/setModalActive', !this.isModalActive);
        //     // this.$store.dispatch('permissions/setErrors', null);
        //     this.fetchDetailPermission(id);
        //     this.setErrors(null);
        //     return this.modalEditActive = !this.modalEditActive;
        // },
        // addPermissionInputAction(e) {
        //   this.addPermissionInput(e);
        // },
        // updatePermissionInputAction(e) {
        //     this.updatePermissionInput(e);
        // },
        // onSubmitAdd() {
        //   const { name, module } = this.newPermission;
        //   this.storePermission({
        //     name: module.slug + "_" + name.slug,
        //   });
        // },
        // onSubmitEdit() {
        //     const {id, name, module, type } = this.permission;
        //     let nameEdit = null;
        //     if (module != null && type == null) {
        //         nameEdit = module.slug + "_" + name.split("_")[1];
        //     }
        //     if (type != null && module == null) {
        //         nameEdit = name.split("_")[0] + "_" + type.slug;
        //     }
        //     this.updatePermission({
        //         id: id,
        //         name: nameEdit != null ? nameEdit : name,
        //     });
        // },

        // showDeleteModal(id) {
        //   this.$swal
        //       .fire({
        //         text: "Are you sure to delete the permission ?",
        //         icon: "error",
        //         cancelButtonText: "Cancel",
        //         confirmButtonText: "Yes, Confirm Delete",
        //         showCancelButton: true,
        //       })
        //       .then((result) => {
        //         if (result["isConfirmed"]) {
        //           this.deletePermission(id);
        //           // this.fetchAllTasks();
        //           this.$swal.fire({
        //             text: "Success, Permission has been deleted.",
        //             icon: "success",
        //             timer: 10000,
        //           });
        //         }
        //       });
        // },
        getResults() {
            this.fetchAllPermissions(this.query);
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
        checkIfUserHasPermissionToShowAll() {
            let permission = "Permissions Show All";
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
            let permission = "Permissions Show";
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
            let permission = "Permissions Edit";
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
        // updatedData: function () {
        //     if (this.updatedData !== null && !this.isUpdating) {
        //         this.$store.dispatch('ui/setModalActive', !this.isModalActive);
        //         this.$swal.fire({
        //             text: "Success, Permission has been updated successfully!",
        //             icon: "success",
        //             timer: 10000,
        //         });
        //
        //         return this.modalEditActive = !this.modalEditActive;
        //     }
        // },
        // createdData: function () {
        //   if (this.createdData !== null && !this.isCreating) {
        //     this.$store.dispatch('ui/setModalActive', !this.isModalActive);
        //     // console.log(this.createdData)
        //     // console.log(this.isCreating)
        //     this.$swal.fire({
        //       text: "Success, Permission has been added successfully!",
        //       icon: "success",
        //       timer: 10000,
        //     });
        //
        //     return this.modalAddActive = !this.modalAddActive;
        //   }
        // },
    },
    created() {
        this.checkIfUserHasPermissionToShowAll()
        this.checkIfUserHasPermissionToShow()
        this.checkIfUserHasPermissionToEdit()
        if (this.canShowAll)  {
            this.fetchAllPermissions(this.getRouteQuery())
        }
    },
}