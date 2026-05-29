import ContractTemplateDataService from "../../../Services/ContractTemplateDataService";
import {
    CONTRACT_TEMPLATE_LIST_GETTER,
    CONTRACT_TEMPLATES_PAGINATED_DATA_GETTER,
    CONTRACT_TEMPLATE_GETTER,
    NEW_CONTRACT_TEMPLATE_GETTER,
    FIRST_TIME_LOADED_GETTER,
    IS_LOADING_ALL_GETTER,
    IS_LOADING_GETTER,
    IS_CREATING_GETTER,
    CREATED_DATA_GETTER,
    IS_UPDATING_GETTER,
    UPDATED_DATA_GETTER,
    IS_DELETING_GETTER,
    DELETED_DATA_GETTER,
    ERRORS_GETTER,

    FETCH_ALL_CONTRACT_TEMPLATES_ACTION,
    FETCH_DETAIL_CONTRACT_TEMPLATE_ACTION,
    STORE_CONTRACT_TEMPLATE_ACTION,
    UPDATE_CONTRACT_TEMPLATE_ACTION,
    DELETE_CONTRACT_TEMPLATE_ACTION,
    SET_ERRORS_ACTION,
} from "./constants";

const state = () => ({
    contract_templates: [],
    contract_templatesPaginatedData: null,
    contract_template: null,
    newContractTemplate: { name: null, contract_type_id: null, content: null },
    isLoadingAll: false,
    firstTimeLoaded: false,
    isLoading: false,
    isCreating: false,
    createdData: null,
    isUpdating: false,
    updatedData: null,
    isDeleting: false,
    deletedData: null,
    errors: null,
});

const getters = {
    [CONTRACT_TEMPLATE_LIST_GETTER]: state => state.contract_templates,
    [CONTRACT_TEMPLATES_PAGINATED_DATA_GETTER]: state => state.contract_templatesPaginatedData,
    [CONTRACT_TEMPLATE_GETTER]: state => state.contract_template,
    [NEW_CONTRACT_TEMPLATE_GETTER]: state => state.newContractTemplate,
    [FIRST_TIME_LOADED_GETTER]: state => state.firstTimeLoaded,
    [IS_LOADING_ALL_GETTER]: state => state.isLoadingAll,
    [IS_LOADING_GETTER]: state => state.isLoading,
    [IS_CREATING_GETTER]: state => state.isCreating,
    [CREATED_DATA_GETTER]: state => state.createdData,
    [IS_UPDATING_GETTER]: state => state.isUpdating,
    [UPDATED_DATA_GETTER]: state => state.updatedData,
    [IS_DELETING_GETTER]: state => state.isDeleting,
    [DELETED_DATA_GETTER]: state => state.deletedData,
    [ERRORS_GETTER]: state => state.errors
};

const actions = {
    async [FETCH_ALL_CONTRACT_TEMPLATES_ACTION]({ commit }, query = null) {
        commit("setIsLoadingAll", true);
        let url = null;
        if (query !== null) {
            url = `?page=${query.page}`;
        }

        let user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            ContractTemplateDataService.getAll(url)
                .then(res => {
                    const templates = res.data.data;
                    commit("setContractTemplates", templates);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    };
                    res.data.pagination = pagination;
                    commit("setContractTemplatesPaginated", res.data);
                    commit("setIsLoadingAll", false);
                    commit("setFirstTimeLoaded", true);
                }).catch(err => {
                    commit("setErrors", err.response ? err.response.data : null);
                    commit("setIsLoadingAll", false);
                });
        }
    },

    async [FETCH_DETAIL_CONTRACT_TEMPLATE_ACTION]({ commit }, id) {
        commit("setIsLoading", true);
        ContractTemplateDataService.get(id)
            .then(res => {
                commit("setContractTemplateDetail", res.data.data);
                commit("setIsLoading", false);
            }).catch(err => {
                console.log('error', err);
                commit("setIsLoading", false);
            });
    },

    async [STORE_CONTRACT_TEMPLATE_ACTION]({ commit, dispatch }, data) {
        commit("setIsCreating", true);
        ContractTemplateDataService.create(data)
            .then(res => {
                dispatch(FETCH_ALL_CONTRACT_TEMPLATES_ACTION, { page: 1 });
                commit("setCreatedData", res.data.data);
                commit("setIsCreating", false);
                commit("setErrors", null);
                commit("resetNewContractTemplate");
            }).catch(err => {
                commit("setErrors", err.response ? err.response.data.errors : null);
                commit("setIsCreating", false);
            });
    },

    async [UPDATE_CONTRACT_TEMPLATE_ACTION]({ commit, dispatch }, { id, data }) {
        commit("setIsUpdating", true);
        ContractTemplateDataService.update(id, data)
            .then(() => {
                dispatch(FETCH_ALL_CONTRACT_TEMPLATES_ACTION, { page: 1 });
                commit("setUpdatedData", data);
                commit("setIsUpdating", false);
                commit("setErrors", null);
            }).catch(err => {
                commit("setErrors", err.response ? err.response.data.errors : null);
                commit("setIsUpdating", false);
            });
    },

    async [DELETE_CONTRACT_TEMPLATE_ACTION]({ commit, dispatch }, id) {
        commit("setIsDeleting", true);
        ContractTemplateDataService.delete(id)
            .then(() => {
                commit("setIsDeleting", false);
                dispatch(FETCH_ALL_CONTRACT_TEMPLATES_ACTION, { page: 1 });
            }).catch(err => {
                console.log('error', err);
                commit("setIsDeleting", false);
            });
    },

    [SET_ERRORS_ACTION]({ commit }, e) {
        commit("setErrors", e);
    }
};

const mutations = {
    setContractTemplates: (state, templates) => {
        state.contract_templates = templates;
    },
    setContractTemplatesPaginated: (state, data) => {
        state.contract_templatesPaginatedData = data;
    },
    setContractTemplateDetail: (state, template) => {
        state.contract_template = template;
    },
    setIsLoadingAll(state, val) {
        state.isLoadingAll = val;
    },
    setFirstTimeLoaded(state, val) {
        state.firstTimeLoaded = val;
    },
    setIsLoading(state, val) {
        state.isLoading = val;
    },
    setCreatedData(state, data) {
        state.contract_templates.push(data);
        state.createdData = data;
    },
    setIsCreating(state, val) {
        state.isCreating = val;
    },
    setUpdatedData(state, data) {
        state.updatedData = data;
    },
    setIsUpdating(state, val) {
        state.isUpdating = val;
    },
    setIsDeleting(state, val) {
        state.isDeleting = val;
    },
    setErrors(state, errors) {
        state.errors = errors;
    },
    resetNewContractTemplate(state) {
        state.newContractTemplate = { name: null, contract_type_id: null, content: null };
    },
    setNewContractTemplateField(state, { field, value }) {
        state.newContractTemplate[field] = value;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
