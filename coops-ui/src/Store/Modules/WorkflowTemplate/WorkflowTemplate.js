import WorkflowTemplateDataService from "../../../Services/WorkflowTemplateDataService";
import {
    WORKFLOW_TEMPLATE_LIST_GETTER,
    WORKFLOW_TEMPLATES_PAGINATED_DATA_GETTER,
    WORKFLOW_TEMPLATE_GETTER,
    NEW_WORKFLOW_TEMPLATE_GETTER,
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

    FETCH_ALL_WORKFLOW_TEMPLATES_ACTION,
    FETCH_DETAIL_WORKFLOW_TEMPLATE_ACTION,
    STORE_WORKFLOW_TEMPLATE_ACTION,
    UPDATE_WORKFLOW_TEMPLATE_ACTION,
    DELETE_WORKFLOW_TEMPLATE_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_WORKFLOW_TEMPLATES_MUTATION,
    SAVE_UPDATED_WORKFLOW_TEMPLATE_MUTATION,
    SET_WORKFLOW_TEMPLATE_ARE_LOADING_MUTATION,
    SET_WORKFLOW_TEMPLATE_DETAIL_MUTATION,
    SET_WORKFLOW_TEMPLATE_IS_CREATING_MUTATION,
    SET_WORKFLOW_TEMPLATE_IS_DELETING_MUTATION,
    SET_WORKFLOW_TEMPLATE_IS_LOADING_MUTATION,
    SET_WORKFLOW_TEMPLATE_IS_UPDATING_MUTATION,
    SET_WORKFLOW_TEMPLATES_LOADED_MUTATION,
    SET_WORKFLOW_TEMPLATES_MUTATION,
    SET_WORKFLOW_TEMPLATES_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    workflow_templates: [],
    workflow_templatesPaginatedData: null,
    workflow_template: null,
    newWorkflowTemplate: {
        name: null,
        type: 'contract',
        company_id: null,
        is_default: false,
        is_active: true,
        steps: []
    },
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
    [WORKFLOW_TEMPLATE_LIST_GETTER]: state => state.workflow_templates,
    [WORKFLOW_TEMPLATES_PAGINATED_DATA_GETTER]: state => state.workflow_templatesPaginatedData,
    [WORKFLOW_TEMPLATE_GETTER]: state => state.workflow_template,
    [NEW_WORKFLOW_TEMPLATE_GETTER]: state => state.newWorkflowTemplate,
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
    async [FETCH_ALL_WORKFLOW_TEMPLATES_ACTION]({ commit }, query = null) {
        commit(SET_WORKFLOW_TEMPLATE_ARE_LOADING_MUTATION, true);
        let url = null;
        if (query !== null) {
            url = `?page=${query.page}`;
        }

        let user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            WorkflowTemplateDataService.getAll(url)
                .then(res => {
                    const items = res.data.data;
                    commit(SET_WORKFLOW_TEMPLATES_MUTATION, items);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        last_page: res.data.last_page
                    };
                    commit(SET_WORKFLOW_TEMPLATES_PAGINATED_MUTATION, pagination);
                    commit(SET_WORKFLOW_TEMPLATE_ARE_LOADING_MUTATION, false);
                    commit(SET_WORKFLOW_TEMPLATES_LOADED_MUTATION, true);
                })
                .catch(err => {
                    commit(SET_WORKFLOW_TEMPLATE_ARE_LOADING_MUTATION, false);
                    commit(SET_ERRORS_MUTATION, err.response ? err.response.data : err);
                });
        }
    },

    async [FETCH_DETAIL_WORKFLOW_TEMPLATE_ACTION]({ commit }, id) {
        commit(SET_WORKFLOW_TEMPLATE_IS_LOADING_MUTATION, true);
        WorkflowTemplateDataService.get(id)
            .then(res => {
                commit(SET_WORKFLOW_TEMPLATE_DETAIL_MUTATION, res.data.data);
                commit(SET_WORKFLOW_TEMPLATE_IS_LOADING_MUTATION, false);
            })
            .catch(err => {
                commit(SET_WORKFLOW_TEMPLATE_IS_LOADING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, err.response ? err.response.data : err);
            });
    },

    async [STORE_WORKFLOW_TEMPLATE_ACTION]({ commit }, data) {
        commit(SET_WORKFLOW_TEMPLATE_IS_CREATING_MUTATION, true);
        return WorkflowTemplateDataService.create(data)
            .then(res => {
                commit(SAVE_NEW_WORKFLOW_TEMPLATES_MUTATION, res.data.data);
                commit(SET_WORKFLOW_TEMPLATE_IS_CREATING_MUTATION, false);
                return res;
            })
            .catch(err => {
                commit(SET_WORKFLOW_TEMPLATE_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, err.response ? err.response.data : err);
                throw err;
            });
    },

    async [UPDATE_WORKFLOW_TEMPLATE_ACTION]({ commit }, payload) {
        commit(SET_WORKFLOW_TEMPLATE_IS_UPDATING_MUTATION, true);
        return WorkflowTemplateDataService.update(payload.id, payload.data)
            .then(res => {
                commit(SAVE_UPDATED_WORKFLOW_TEMPLATE_MUTATION, res.data.data);
                commit(SET_WORKFLOW_TEMPLATE_IS_UPDATING_MUTATION, false);
                return res;
            })
            .catch(err => {
                commit(SET_WORKFLOW_TEMPLATE_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, err.response ? err.response.data : err);
                throw err;
            });
    },

    async [DELETE_WORKFLOW_TEMPLATE_ACTION]({ commit }, id) {
        commit(SET_WORKFLOW_TEMPLATE_IS_DELETING_MUTATION, true);
        return WorkflowTemplateDataService.delete(id)
            .then(res => {
                commit(SET_WORKFLOW_TEMPLATE_IS_DELETING_MUTATION, false);
                return res;
            })
            .catch(err => {
                commit(SET_WORKFLOW_TEMPLATE_IS_DELETING_MUTATION, false);
                throw err;
            });
    },

    [SET_ERRORS_ACTION]({ commit }, errors) {
        commit(SET_ERRORS_MUTATION, errors);
    }
};

const mutations = {
    [SET_WORKFLOW_TEMPLATES_MUTATION](state, data) {
        state.workflow_templates = data;
    },
    [SET_WORKFLOW_TEMPLATES_PAGINATED_MUTATION](state, data) {
        state.workflow_templatesPaginatedData = data;
    },
    [SET_WORKFLOW_TEMPLATE_DETAIL_MUTATION](state, data) {
        state.workflow_template = data;
    },
    [SET_WORKFLOW_TEMPLATE_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading;
    },
    [SET_WORKFLOW_TEMPLATES_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded;
    },
    [SET_WORKFLOW_TEMPLATE_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading;
    },
    [SAVE_NEW_WORKFLOW_TEMPLATES_MUTATION](state, data) {
        state.createdData = data;
        state.workflow_templates.unshift(data);
    },
    [SET_WORKFLOW_TEMPLATE_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating;
    },
    [SAVE_UPDATED_WORKFLOW_TEMPLATE_MUTATION](state, data) {
        state.updatedData = data;
    },
    [SET_WORKFLOW_TEMPLATE_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating;
    },
    [SET_WORKFLOW_TEMPLATE_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting;
    },
    [SET_ERRORS_MUTATION](state, errors) {
        state.errors = errors;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
