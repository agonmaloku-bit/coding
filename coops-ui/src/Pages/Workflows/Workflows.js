import { mapGetters, mapActions } from "vuex";
import dirtyGuard from "../../Mixins/dirtyGuard";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import {
    WORKFLOW_TEMPLATE_LIST_GETTER,
    WORKFLOW_TEMPLATES_PAGINATED_DATA_GETTER,
    WORKFLOW_TEMPLATE_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_LOADING_GETTER,
    IS_CREATING_GETTER,
    IS_UPDATING_GETTER,
    FIRST_TIME_LOADED_GETTER,
    ERRORS_GETTER,
    FETCH_ALL_WORKFLOW_TEMPLATES_ACTION,
    FETCH_DETAIL_WORKFLOW_TEMPLATE_ACTION,
    STORE_WORKFLOW_TEMPLATE_ACTION,
    UPDATE_WORKFLOW_TEMPLATE_ACTION,
    DELETE_WORKFLOW_TEMPLATE_ACTION,
    SET_ERRORS_ACTION,
} from "@/Store/Modules/WorkflowTemplate/constants";
import RoleDataService from "../../Services/RoleDataService";
import CompanyDataService from "../../Services/CompanyDataService";
import { useMeta } from "vue-meta";

export default {
    name: "Workflows",
    mixins: [dirtyGuard],
    components: {
        VPagination,
    },
    setup() {
        useMeta({ title: "Workflows" });
    },
    data() {
        return {
            modalAddActive: false,
            modalInfoActive: false,
            modalEditActive: false,
            query: { page: 1 },
            roles: [],
            companies: [],
            // Form model for create
            newTemplate: {
                name: "",
                type: "contract",
                company_id: null,
                is_default: false,
                is_active: true,
                steps: [{ name: "", role_id: null, notify_roles: [], description: "" }],
            },
            // Form model for edit
            editTemplate: {
                id: null,
                name: "",
                type: "contract",
                company_id: null,
                is_default: false,
                is_active: true,
                steps: [],
            },
        };
    },
    computed: {
        ...mapGetters("workflow_templates", {
            workflowTemplateList: WORKFLOW_TEMPLATE_LIST_GETTER,
            paginatedData: WORKFLOW_TEMPLATES_PAGINATED_DATA_GETTER,
            workflowTemplate: WORKFLOW_TEMPLATE_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            isLoading: IS_LOADING_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            errors: ERRORS_GETTER,
        }),
        isModalActive() {
            return this.$store.getters["ui/modalActive"];
        },
    },
    methods: {
        ...mapActions("workflow_templates", {
            fetchAll: FETCH_ALL_WORKFLOW_TEMPLATES_ACTION,
            fetchDetail: FETCH_DETAIL_WORKFLOW_TEMPLATE_ACTION,
            storeTemplate: STORE_WORKFLOW_TEMPLATE_ACTION,
            updateTemplate: UPDATE_WORKFLOW_TEMPLATE_ACTION,
            deleteTemplate: DELETE_WORKFLOW_TEMPLATE_ACTION,
            setErrors: SET_ERRORS_ACTION,
        }),

        closeModal() {
            this.$store.dispatch("ui/setModalActive", false);
            this.modalAddActive = false;
            this.modalInfoActive = false;
            this.modalEditActive = false;
        },

        openAddModal() {
            this.newTemplate = {
                name: "",
                type: "contract",
                company_id: null,
                is_default: false,
                is_active: true,
                steps: [{ name: "", role_id: null, notify_roles: [], description: "" }],
            };
            this.modalAddActive = true;
            this.$store.dispatch("ui/setModalActive", true);
        },

        openInfoModal(item) {
            this.fetchDetail(item.id);
            this.modalInfoActive = true;
            this.$store.dispatch("ui/setModalActive", true);
        },

        openEditModal(item) {
            this.editTemplate = {
                id: item.id,
                name: item.name,
                type: item.type,
                company_id: item.company_id,
                is_default: item.is_default,
                is_active: item.is_active,
                steps: item.steps.map((s) => ({
                    name: s.name,
                    role_id: s.role_id,
                    notify_roles: s.notify_roles || [],
                    description: s.description || "",
                })),
            };
            this.modalEditActive = true;
            this.$store.dispatch("ui/setModalActive", true);
        },

        // Step management
        addStep(steps) {
            steps.push({ name: "", role_id: null, notify_roles: [], description: "" });
        },
        removeStep(steps, index) {
            if (steps.length > 1) {
                steps.splice(index, 1);
            }
        },
        moveStepUp(steps, index) {
            if (index > 0) {
                const temp = steps[index];
                steps.splice(index, 1);
                steps.splice(index - 1, 0, temp);
            }
        },
        moveStepDown(steps, index) {
            if (index < steps.length - 1) {
                const temp = steps[index];
                steps.splice(index, 1);
                steps.splice(index + 1, 0, temp);
            }
        },
        toggleNotifyRole(step, roleId) {
            const idx = step.notify_roles.indexOf(roleId);
            if (idx === -1) {
                step.notify_roles.push(roleId);
            } else {
                step.notify_roles.splice(idx, 1);
            }
        },

        getRoleName(roleId) {
            const role = this.roles.find((r) => r.id === roleId);
            return role ? role.name : "Unknown";
        },
        getCompanyName(companyId) {
            const company = this.companies.find((c) => c.id === companyId);
            return company ? company.name : "—";
        },

        async onSubmitAdd() {
            // Validate
            if (!this.newTemplate.name) return;
            if (this.newTemplate.steps.some((s) => !s.name || !s.role_id)) {
                this.$swal({
                    icon: "warning",
                    title: this.$t("common.warning") || "Warning",
                    text: this.$t("workflows.fillAllSteps"),
                });
                return;
            }

            try {
                await this.storeTemplate(this.newTemplate);
                this.closeModal();
                this.fetchAll(this.query);
                this.$swal({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: this.$t("workflows.created"),
                    showConfirmButton: false,
                    timer: 2000,
                });
            } catch (e) {
                // errors handled in store
            }
        },

        async onSubmitEdit() {
            if (!this.editTemplate.name) return;
            if (this.editTemplate.steps.some((s) => !s.name || !s.role_id)) {
                this.$swal({
                    icon: "warning",
                    title: this.$t("common.warning") || "Warning",
                    text: this.$t("workflows.fillAllSteps"),
                });
                return;
            }

            try {
                await this.updateTemplate({
                    id: this.editTemplate.id,
                    data: {
                        name: this.editTemplate.name,
                        type: this.editTemplate.type,
                        company_id: this.editTemplate.company_id,
                        is_default: this.editTemplate.is_default,
                        is_active: this.editTemplate.is_active,
                        steps: this.editTemplate.steps,
                    },
                });
                this.closeModal();
                this.fetchAll(this.query);
                this.$swal({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: this.$t("workflows.updated"),
                    showConfirmButton: false,
                    timer: 2000,
                });
            } catch (e) {
                // errors handled in store
            }
        },

        confirmDelete(item) {
            this.$swal({
                title: this.$t("workflows.confirmDelete"),
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: this.$t("common.yes"),
                cancelButtonText: this.$t("common.no"),
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await this.deleteTemplate(item.id);
                    this.fetchAll(this.query);
                    this.$swal({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: this.$t("workflows.deleted"),
                        showConfirmButton: false,
                        timer: 2000,
                    });
                }
            });
        },

        onPaginationChange(page) {
            this.query.page = page;
            this.fetchAll(this.query);
        },

        loadRoles() {
            RoleDataService.getAll(null).then((res) => {
                this.roles = res.data.data || res.data;
            });
        },
        loadCompanies() {
            CompanyDataService.getAll(null).then((res) => {
                this.companies = res.data.data || res.data;
            });
        },
    },
    mounted() {
        this.fetchAll(this.query);
        this.loadRoles();
        this.loadCompanies();
    },
};
