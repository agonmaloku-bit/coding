import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import { mapGetters, mapActions } from "vuex";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import VueMultiselect from "@/Components/vue-multiselect/src";
import {useMeta} from "vue-meta";
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import ContractTemplateDataService from "../../Services/ContractTemplateDataService";
import dirtyGuard from "../../Mixins/dirtyGuard";

import {
    CONTRACT_TEMPLATE_LIST_GETTER,
    CONTRACT_TEMPLATES_PAGINATED_DATA_GETTER,
    CONTRACT_TEMPLATE_GETTER,
    NEW_CONTRACT_TEMPLATE_GETTER,
    FIRST_TIME_LOADED_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_CREATING_GETTER,
    IS_UPDATING_GETTER,
    IS_DELETING_GETTER,
    ERRORS_GETTER,
    FETCH_ALL_CONTRACT_TEMPLATES_ACTION,
    FETCH_DETAIL_CONTRACT_TEMPLATE_ACTION,
    STORE_CONTRACT_TEMPLATE_ACTION,
    UPDATE_CONTRACT_TEMPLATE_ACTION,
    DELETE_CONTRACT_TEMPLATE_ACTION,
    SET_ERRORS_ACTION,
} from "../../Store/Modules/ContractTemplate/constants";

import {
    CONTRACT_TYPE_LIST_GETTER,
    FETCH_ALL_CONTRACT_TYPES_ACTION,
} from "../../Store/Modules/ContractType/constants";

export default {
    name: "ContractTemplates",
    mixins: [dirtyGuard],
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
        VPagination,
        VueMultiselect,
        QuillEditor,
    },
    setup() {
        useMeta({ title: 'Contract Templates' })
    },
    data() {
        return {
            query: {
                page: 1,
            },
            showAdd: false,
            showInfo: false,
            showEdit: false,
            editTemplateId: null,
            editName: '',
            editContractType: null,
            editContent: '',
            editFile: null,
            addFile: null,
            addInitialSnapshot: null,
            editInitialSnapshot: null,
            templateVariableGroups: [
                {
                    key: 'company',
                    label: 'Company',
                    icon: 'fas fa-building',
                    variables: [
                        { key: '{{company_logo}}', label: 'Company Logo', icon: 'fas fa-image' },
                        { key: '{{company_name}}', label: 'Company Name' },
                        { key: '{{company_business_no}}', label: 'Company Business No.' },
                        { key: '{{company_address}}', label: 'Company Address' },
                        { key: '{{ceo_name}}', label: 'CEO Name' },
                        { key: '{{cto_name}}', label: 'CTO Name' },
                        { key: '{{cfo_name}}', label: 'CFO Name' },
                        { key: '{{legal_name}}', label: 'Legal Office' },
                        { key: '{{procurement_name}}', label: 'Procurement' },
                        { key: '{{created_by}}', label: 'Created By' },
                    ],
                },
                {
                    key: 'supplier',
                    label: 'Supplier',
                    icon: 'fas fa-truck',
                    variables: [
                        { key: '{{supplier_name}}', label: 'Supplier Name' },
                        { key: '{{supplier_address}}', label: 'Supplier Address' },
                        { key: '{{supplier_business_number}}', label: 'Supplier Business No.' },
                        { key: '{{supplier_person}}', label: 'Supplier Contact Person' },
                    ],
                },
                {
                    key: 'technical',
                    label: 'Technical',
                    icon: 'fas fa-cogs',
                    variables: [
                        { key: '{{contract_name}}', label: 'Contract Name' },
                        { key: '{{contract_type}}', label: 'Contract Type' },
                        { key: '{{deadline_from}}', label: 'Start Date' },
                        { key: '{{deadline_to}}', label: 'End Date' },
                        { key: '{{date}}', label: 'Current Date' },
                        { key: '{{responsible_person}}', label: 'Responsible Person' },
                        { key: '{{address}}', label: 'Address' },
                        { key: '{{total_price}}', label: 'Total Price' },
                        { key: '{{unit_price}}', label: 'Unit Price' },
                        { key: '{{payment_terms}}', label: 'Payment Terms' },
                    ],
                },
            ],
            editorToolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'header': [1, 2, 3, false] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['clean']
            ],
            addContent: '',
            isUploadingFile: false,
            canShowAll: false,
            canShow: false,
            canAdd: false,
            canEdit: false,
            canDelete: false,
        };
    },
    computed: {
        ...mapGetters("contract_templates", {
            contract_templateList: CONTRACT_TEMPLATE_LIST_GETTER,
            contract_templatesPaginatedData: CONTRACT_TEMPLATES_PAGINATED_DATA_GETTER,
            contract_template: CONTRACT_TEMPLATE_GETTER,
            newContractTemplate: NEW_CONTRACT_TEMPLATE_GETTER,
            firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
            isLoadingAll: IS_LOADING_ALL_GETTER,
            isCreating: IS_CREATING_GETTER,
            isUpdating: IS_UPDATING_GETTER,
            isDeleting: IS_DELETING_GETTER,
            errors: ERRORS_GETTER,
        }),
        ...mapGetters("contract_types", {
            contract_typeList: CONTRACT_TYPE_LIST_GETTER,
        }),
        templateVariables() {
            return this.templateVariableGroups.reduce(
                (acc, g) => acc.concat(g.variables), []);
        },
        addDirty() {
            if (!this.showAdd || !this.addInitialSnapshot) return false;
            return JSON.stringify(this.addSnapshot()) !== JSON.stringify(this.addInitialSnapshot);
        },
        editDirty() {
            if (!this.showEdit || !this.editInitialSnapshot) return false;
            return JSON.stringify(this.editSnapshot()) !== JSON.stringify(this.editInitialSnapshot);
        },
        isDirty() {
            return this.addDirty || this.editDirty;
        },
        rolePermissions() {
            return this.$store.getters["auth/rolePermissions"];
        },
        directPermissions() {
            return this.$store.getters["auth/directPermissions"];
        },
        selectContractType: {
            get() {
                const id = this.newContractTemplate.contract_type_id;
                if (!id) return null;
                if (typeof id === 'object') return id;
                return this.contract_typeList.find(ct => ct.id === id) || null;
            },
            set(value) {
                this.$store.commit('contract_templates/setNewContractTemplateField', { field: 'contract_type_id', value: value ? value.id : null });
            }
        },
    },
    methods: {
        ...mapActions("contract_templates", {
            fetchAllContractTemplates: FETCH_ALL_CONTRACT_TEMPLATES_ACTION,
            fetchDetailContractTemplate: FETCH_DETAIL_CONTRACT_TEMPLATE_ACTION,
            storeContractTemplate: STORE_CONTRACT_TEMPLATE_ACTION,
            updateContractTemplate: UPDATE_CONTRACT_TEMPLATE_ACTION,
            deleteContractTemplate: DELETE_CONTRACT_TEMPLATE_ACTION,
            setErrors: SET_ERRORS_ACTION,
        }),
        ...mapActions("contract_types", {
            fetchAllContractTypes: FETCH_ALL_CONTRACT_TYPES_ACTION,
        }),
        addSnapshot() {
            return {
                name: this.newContractTemplate.name || '',
                contract_type_id: this.newContractTemplate.contract_type_id || null,
                content: this.addContent || '',
                file: this.addFile ? this.addFile.name : null,
            };
        },
        editSnapshot() {
            return {
                name: this.editName || '',
                contract_type_id: this.editContractType ? this.editContractType.id : null,
                content: this.editContent || '',
                file: this.editFile ? this.editFile.name : null,
            };
        },
        confirmDiscard() {
            return window.confirm(this.$t('contractTemplates.discardPrompt') || this.$t('common.discardChangesPrompt') || 'You have unsaved changes. Are you sure you want to discard them?');
        },
        hasUnsavedChanges() {
            return this.isDirty;
        },
        closeAdd() {
            if (this.addDirty && !this.confirmDiscard()) return;
            this.showAdd = false;
            this.addInitialSnapshot = null;
        },
        closeEdit() {
            if (this.editDirty && !this.confirmDiscard()) return;
            this.showEdit = false;
            this.editInitialSnapshot = null;
        },
        getAllContractTemplates(page = 1) {
            this.fetchAllContractTemplates({ page: page });
        },
        showAddModal() {
            this.fetchAllContractTypes();
            this.addFile = null;
            this.addContent = '';
            this.$store.commit('contract_templates/resetNewContractTemplate');
            this.setErrors(null);
            this.showAdd = true;
            this.$nextTick(() => {
                this.addInitialSnapshot = this.addSnapshot();
            });
        },
        showInfoModal(id) {
            this.fetchDetailContractTemplate(id);
            this.showInfo = true;
        },
        showEditModal(item) {
            this.fetchAllContractTypes();
            this.editTemplateId = item.id;
            this.editName = item.name;
            this.editContractType = item.contract_type || null;
            this.editContent = item.content || '';
            this.editFile = null;
            this.setErrors(null);
            this.showEdit = true;
            this.$nextTick(() => {
                this.editInitialSnapshot = this.editSnapshot();
            });
        },
        onSubmitAdd() {
            let formData = new FormData();
            formData.append('name', this.newContractTemplate.name || '');
            formData.append('contract_type_id', this.newContractTemplate.contract_type_id || '');
            formData.append('content', this.addContent || '');
            if (this.addFile) {
                formData.append('file', this.addFile);
            }
            this.storeContractTemplate(formData);
        },
        onSubmitEdit() {
            let formData = new FormData();
            formData.append('name', this.editName || '');
            formData.append('contract_type_id', this.editContractType ? this.editContractType.id : '');
            formData.append('content', this.editContent || '');
            if (this.editFile) {
                formData.append('file', this.editFile);
            }
            formData.append('_method', 'PUT');
            this.updateContractTemplate({ id: this.editTemplateId, data: formData });
        },
        onDeleteContractTemplate(id) {
            if (confirm(this.$t('contractTemplates.deleteConfirm'))) {
                this.deleteContractTemplate(id);
            }
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).catch(() => {
                const el = document.createElement('textarea');
                el.value = text;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
            });
        },
        onAddFileChange(e) {
            const file = e.target.files[0];
            if (!file) return;
            this.addFile = file;
            this.isUploadingFile = true;
            let fd = new FormData();
            fd.append('file', file);
            ContractTemplateDataService.extractContent(fd).then(res => {
                const data = res.data.data || res.data;
                if (data.content) {
                    this.addContent = data.content;
                    this.$nextTick(() => {
                        const editor = this.$refs.addEditor;
                        if (editor) {
                            const quill = editor.getQuill();
                            quill.clipboard.dangerouslyPasteHTML(data.content);
                        }
                    });
                }
                this.isUploadingFile = false;
            }).catch(() => {
                this.isUploadingFile = false;
            });
        },
        onEditFileChange(e) {
            const file = e.target.files[0];
            if (!file) return;
            this.editFile = file;
            this.isUploadingFile = true;
            let fd = new FormData();
            fd.append('file', file);
            ContractTemplateDataService.extractContent(fd).then(res => {
                const data = res.data.data || res.data;
                if (data.content) {
                    this.editContent = data.content;
                    this.$nextTick(() => {
                        const editor = this.$refs.editEditor;
                        if (editor) {
                            const quill = editor.getQuill();
                            quill.clipboard.dangerouslyPasteHTML(data.content);
                        }
                    });
                }
                this.isUploadingFile = false;
            }).catch(() => {
                this.isUploadingFile = false;
            });
        },
        insertVariable(variable, target) {
            if (target === 'add') {
                const editor = this.$refs.addEditor;
                if (editor) {
                    const quill = editor.getQuill();
                    const range = quill.getSelection(true);
                    quill.insertText(range.index, variable);
                    quill.setSelection(range.index + variable.length);
                    this.addContent = quill.root.innerHTML;
                }
            } else if (target === 'edit') {
                const editor = this.$refs.editEditor;
                if (editor) {
                    const quill = editor.getQuill();
                    const range = quill.getSelection(true);
                    quill.insertText(range.index, variable);
                    quill.setSelection(range.index + variable.length);
                    this.editContent = quill.root.innerHTML;
                }
            }
        },
        downloadTemplate(id) {
            ContractTemplateDataService.download(id).then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                const disposition = res.headers['content-disposition'];
                let filename = 'template.txt';
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    filename = disposition.split('filename=')[1].replace(/"/g, '');
                }
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            });
        },
        hasPermission(permissionName) {
            let p1 = this.rolePermissions.filter(p => p.name === permissionName);
            let p2 = this.directPermissions.filter(p => p.name === permissionName);
            return p1.length >= 1 || p2.length >= 1;
        },
        checkPermissions() {
            this.canShowAll = this.hasPermission('Contract Type Show All');
            this.canShow = this.hasPermission('Contract Type Show');
            this.canAdd = this.hasPermission('Contract Type Add');
            this.canEdit = this.hasPermission('Contract Type Edit');
            this.canDelete = this.hasPermission('Contract Type Delete');
        },
    },
    watch: {
        isCreating(newVal, oldVal) {
            if (oldVal === true && newVal === false && this.errors === null) {
                this.showAdd = false;
                this.addInitialSnapshot = null;
            }
        },
        isUpdating(newVal, oldVal) {
            if (oldVal === true && newVal === false && this.errors === null) {
                this.showEdit = false;
                this.editInitialSnapshot = null;
            }
        },
        isDeleting() {
            // Busy overlay is driven by global axios interceptor.
        },
    },
    mounted() {
        this.checkPermissions();
        if (this.canShowAll && !this.firstTimeLoaded) {
            this.getAllContractTemplates();
        }
    },
};
