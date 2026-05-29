import { mapGetters, mapActions } from "vuex";
import dirtyGuard from "../../Mixins/dirtyGuard";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import {
    COMPANY_LIST_GETTER,
    COMPANIES_PAGINATED_DATA_GETTER,
    COMPANY_GETTER,
    NEW_COMPANY_GETTER,
    FIRST_TIME_LOADED_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_LOADING_GETTER,
    IS_CREATING_GETTER,
    CREATED_DATA_GETTER,
    IS_UPDATING_GETTER,
    UPDATED_DATA_GETTER,
    ERRORS_GETTER,

    FETCH_ALL_COMPANIES_ACTION,
    FETCH_DETAIL_COMPANY_ACTION,
    STORE_COMPANY_ACTION,
    UPDATE_COMPANY_ACTION,
    DELETE_COMPANY_ACTION,
    ADD_COMPANY_INPUT_ACTION,
    UPDATE_COMPANY_INPUT_ACTION,
    SET_ERRORS_ACTION
} from '@/Store/Modules/Company/constants';
import {useMeta} from "vue-meta";

export default {
    name: "Companies",
    mixins: [dirtyGuard],
    components: {
        VPagination,
    },
    setup () {
        useMeta({ title: 'Companies' })
    },
    data() {
        return {
            modalAddActive: false,
            modalInfoActive: false,
            modalEditActive: false,
            query: {
                page: 1,
            },
            canShowAll: false,
            canShow: false,
            canAdd: false,
            canEdit: false,
            canDelete: false,
        }
    },
    computed: {
        ...mapGetters( 'companies', {
            company: COMPANY_GETTER,
            newCompany: NEW_COMPANY_GETTER,
            companyList: COMPANY_LIST_GETTER,
            companiesPaginatedData: COMPANIES_PAGINATED_DATA_GETTER,
            createdData: CREATED_DATA_GETTER,
            updatedData: UPDATED_DATA_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            errors: ERRORS_GETTER
        }),
        isModalActive() {
            return this.$store.getters['ui/modalActive'];
        },
        rolePermissions() {
            return this.$store.getters['auth/rolePermissions']
        },
        directPermissions() {
            return this.$store.getters['auth/directPermissions']
        }
    },
    methods: {
        ...mapActions("companies", {
            fetchAllCompanies: FETCH_ALL_COMPANIES_ACTION,
            fetchDetailCompany: FETCH_DETAIL_COMPANY_ACTION,
            storeCompany: STORE_COMPANY_ACTION,
            updateCompany: UPDATE_COMPANY_ACTION,
            addCompanyInput: ADD_COMPANY_INPUT_ACTION,
            updateCompanyInput: UPDATE_COMPANY_INPUT_ACTION,
            deleteCompany: DELETE_COMPANY_ACTION,
            setErrors: SET_ERRORS_ACTION
        }),
        closeModal() {
            this.$store.dispatch('ui/setModalActive', false);
            this.modalAddActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
        },

        showAddModal() {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.setErrors(null);
            return this.modalAddActive = !this.modalAddActive;
        },
        showInfoModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            this.fetchDetailCompany(id);
            return this.modalInfoActive = !this.modalInfoActive;
        },
        showEditModal(id) {
            this.$store.dispatch('ui/setModalActive', !this.isModalActive);
            // this.$store.dispatch('companies/setErrors', null);
            this.fetchDetailCompany(id);
            this.setErrors(null);
            return this.modalEditActive = !this.modalEditActive;
        },
        addCompanyInputAction(e) {
            this.addCompanyInput(e);
        },
        updateCompanyInputAction(e) {
            this.updateCompanyInput(e);
        },
        onSubmitAdd() {
            const { name, business_no, address } = this.newCompany;
            let fd = new FormData();
            fd.append('name', name || '');
            if (business_no) fd.append('business_no', business_no);
            if (address) fd.append('address', address);
            if (this.$refs.addLogo && this.$refs.addLogo.files[0]) {
                fd.append('logo', this.$refs.addLogo.files[0]);
            }
            this.storeCompany(fd);
        },
        onSubmitEdit() {
            const { id, name, nameNew, business_no, business_noNew, address, addressNew } = this.company;
            let fd = new FormData();
            fd.append('_method', 'PUT');
            fd.append('id', id);
            if (nameNew !== undefined && name !== nameNew) {
                fd.append('name', nameNew);
            }
            if (business_noNew !== undefined) {
                fd.append('business_no', business_noNew);
            } else if (business_no !== undefined) {
                fd.append('business_no', business_no || '');
            }
            if (addressNew !== undefined) {
                fd.append('address', addressNew);
            } else if (address !== undefined) {
                fd.append('address', address || '');
            }
            if (this.$refs.editLogo && this.$refs.editLogo.files[0]) {
                fd.append('logo', this.$refs.editLogo.files[0]);
            }
            this.updateCompany(fd);
        },

        showDeleteModal(id) {
            this.$swal
                .fire({
                    text: "Are you sure you want to delete this company?",
                    icon: "error",
                    cancelButtonText: "Cancel",
                    confirmButtonText: "Yes",
                    showCancelButton: true,
                })
                .then((result) => {
                    if (result["isConfirmed"]) {
                        this.deleteCompany(id);
                        // this.fetchAllTasks();
                        this.$swal.fire({
                            text: "Company has been deleted.",
                            icon: "success",
                            timer: 10000,
                        });
                    }
                });
        },
        getResults() {
            this.fetchAllCompanies(this.query);
        },
        getRouteQuery() {
            if (this.$route.query.page != null) {
                this.query.page = parseInt(this.$route.query.page);
            }
            return this.query;
        },
        modalContent() {
        },
        checkIfFieldHasErrors(errors, field) {
            if (errors != null && !this.isCreating) {
                if (errors[field] != null) {
                    return true;
                }
            }
            return false;
        },
        checkIfUserHasPermissionToShowAll() {
            let permission = "Company Show All";
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
            let permission = "Company Show";
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
            let permission = "Company Add";
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
            let permission = "Company Edit";
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
            let permission = "Company Delete";
            let p1 = this.rolePermissions.filter(p => p.name === permission)
            let p2 = this.directPermissions.filter(p => p.name === permission)
            if (p1.length >= 1) {
                return this.canDelete = true;
            }
            if (p2.length >= 1) {
                return this.canDelete = true;
            }

            return this.canDelete = false;
        }
    },
    watch: {
        updatedData: function () {
            if (this.updatedData !== null && !this.isUpdating) {
                this.$store.dispatch('ui/setModalActive', false);
                this.$swal.fire({
                    text: "Company has been updated successfully!",
                    icon: "success",
                    timer: 10000,
                });

                return this.modalEditActive = !this.modalEditActive;
            }
        },
        createdData: function () {
            if (this.createdData !== null && !this.isCreating) {
                this.$store.dispatch('ui/setModalActive', false);
                this.$swal.fire({
                    text: "Company has been added successfully!",
                    icon: "success",
                    timer: 10000,
                });

                return this.modalAddActive = false;
            }
        },
        // errors: function () {
        //     console.log(this.errors.message)
        //     this.$toast.error("Error")
        // }
    },
    created() {
        this.checkIfUserHasPermissionToShowAll()
        this.checkIfUserHasPermissionToShow()
        this.checkIfUserHasPermissionToAdd()
        this.checkIfUserHasPermissionToEdit()
        this.checkIfUserHasPermissionToDelete()
        if (this.canShowAll) {
            this.fetchAllCompanies(this.getRouteQuery());
        }
    },
}