import ProcurementOfficerDataService from "../../../Services/ProcurementOfficerDataService";
import {
    PROCUREMENT_OFFICER_LIST_GETTER,
    PROCUREMENT_OFFICERS_PAGINATED_DATA_GETTER,
    PROCUREMENT_OFFICER_GETTER,
    NEW_PROCUREMENT_OFFICER_GETTER,
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

    FETCH_ALL_PROCUREMENT_OFFICERS_ACTION,
    FETCH_DETAIL_PROCUREMENT_OFFICER_ACTION,
    STORE_PROCUREMENT_OFFICER_ACTION,
    UPDATE_PROCUREMENT_OFFICER_ACTION,
    DELETE_PROCUREMENT_OFFICER_ACTION,
    ADD_PROCUREMENT_OFFICER_INPUT_ACTION,
    UPDATE_PROCUREMENT_OFFICER_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_PROCUREMENT_OFFICERS_MUTATION,
    SAVE_UPDATED_PROCUREMENT_OFFICER_MUTATION,
    SET_PROCUREMENT_OFFICER_ADD_INPUT_MUTATION,
    SET_PROCUREMENT_OFFICER_ARE_LOADING_MUTATION,
    SET_PROCUREMENT_OFFICER_DETAIL_INPUT_MUTATION,
    SET_PROCUREMENT_OFFICER_DETAIL_MUTATION,
    SET_PROCUREMENT_OFFICER_IS_CREATING_MUTATION,
    SET_PROCUREMENT_OFFICER_IS_DELETING_MUTATION,
    SET_PROCUREMENT_OFFICER_IS_LOADING_MUTATION,
    SET_PROCUREMENT_OFFICER_IS_UPDATING_MUTATION,
    SET_PROCUREMENT_OFFICERS_LOADED_MUTATION,
    SET_PROCUREMENT_OFFICERS_MUTATION,
    SET_PROCUREMENT_OFFICERS_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";
import UserDataService from "../../../Services/UserDataService";

const state = () => ({
    procurementOfficers: [],
    procurementOfficersPaginatedData: null,
    procurementOfficer: null,
    newProcurementOfficer: { name: null },
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
    [PROCUREMENT_OFFICER_LIST_GETTER]: state => state.procurementOfficers,
    [PROCUREMENT_OFFICERS_PAGINATED_DATA_GETTER]: state => state.procurementOfficersPaginatedData,
    [PROCUREMENT_OFFICER_GETTER]: state => state.procurementOfficer,
    [NEW_PROCUREMENT_OFFICER_GETTER]: state => state.newProcurementOfficer,
    [FIRST_TIME_LOADED_GETTER]: state => state.firstTimeLoaded,
    [IS_LOADING_ALL_GETTER]: state => state.isLoadingAll,
    [IS_LOADING_GETTER]: state => state.isLoading,
    [IS_CREATING_GETTER]: state => state.isCreating,
    [CREATED_DATA_GETTER]: state => state.createdData,
    [IS_UPDATING_GETTER]: state => state.isUpdating,
    [UPDATED_DATA_GETTER]: state => state.updatedData,
    [IS_DELETING_GETTER]: state => state.isDeleting,
    [DELETED_DATA_GETTER]: state => state.deletedData,
    [ERRORS_GETTER]: state => state.errors,
    procurementOfficerDepartmentsGetter: state => state.procurementOfficer !== null ? state.procurementOfficer.department : null
};


const actions = {
    async [FETCH_ALL_PROCUREMENT_OFFICERS_ACTION] ({ commit }, query = null) {
        commit(SET_PROCUREMENT_OFFICER_ARE_LOADING_MUTATION, true);
        let url = null;
        if (query === null) {
            url = null;
        }
        else {
            url = `?page=${query.page}`;
        }

        let user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token)
        {
            ProcurementOfficerDataService.getAll(url)
                .then(res => {
                    const procurementOfficers = res.data.data;
                    commit(SET_PROCUREMENT_OFFICERS_MUTATION, procurementOfficers);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_PROCUREMENT_OFFICERS_PAGINATED_MUTATION, res.data);
                    commit(SET_PROCUREMENT_OFFICER_ARE_LOADING_MUTATION, false);
                    commit(SET_PROCUREMENT_OFFICERS_LOADED_MUTATION, true);
                }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data);
                commit(SET_PROCUREMENT_OFFICER_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_PROCUREMENT_OFFICER_ACTION] ({ commit }, id) {
        commit(SET_PROCUREMENT_OFFICER_IS_LOADING_MUTATION, true);
        ProcurementOfficerDataService.get(id)
            .then(res => {
                commit(SET_PROCUREMENT_OFFICER_DETAIL_MUTATION, res.data.data);
                commit(SET_PROCUREMENT_OFFICER_IS_LOADING_MUTATION, false);
            }).catch(err => {
                console.log('error', err);
                commit(SET_PROCUREMENT_OFFICER_IS_LOADING_MUTATION, false);
            });
    },

    async [STORE_PROCUREMENT_OFFICER_ACTION] ({ commit, dispatch }, procurementOfficer) {
        commit(SET_PROCUREMENT_OFFICER_IS_CREATING_MUTATION, true);
        ProcurementOfficerDataService.create(procurementOfficer)
            .then(res => {
                dispatch(FETCH_ALL_PROCUREMENT_OFFICERS_ACTION, { query: { page: 1 } });
                commit(SAVE_NEW_PROCUREMENT_OFFICERS_MUTATION, res.data.data);
                commit(SET_PROCUREMENT_OFFICER_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_PROCUREMENT_OFFICER_IS_CREATING_MUTATION, false);
            });
    },

    async [UPDATE_PROCUREMENT_OFFICER_ACTION] ({ commit, dispatch },procurementOfficer) {
        commit(SET_PROCUREMENT_OFFICER_IS_UPDATING_MUTATION, true);

        ProcurementOfficerDataService.update(procurementOfficer.id, procurementOfficer)
            .then(() => {
                dispatch(FETCH_ALL_PROCUREMENT_OFFICERS_ACTION, { query: { page: 1 } });
                // commit(SAVE_UPDATED_PROCUREMENT_OFFICER_MUTATION, res.data.data);
                commit(SAVE_UPDATED_PROCUREMENT_OFFICER_MUTATION, procurementOfficer);
                commit(SET_PROCUREMENT_OFFICER_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                // console.log(err.response.data);
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_PROCUREMENT_OFFICER_IS_UPDATING_MUTATION, false);
            });
    },

    async [DELETE_PROCUREMENT_OFFICER_ACTION] ({ commit, dispatch }, id) {
        commit(SET_PROCUREMENT_OFFICER_IS_DELETING_MUTATION, true);
        ProcurementOfficerDataService.delete(id)
            .then(() => {
                commit(SET_PROCUREMENT_OFFICER_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_PROCUREMENT_OFFICERS_ACTION, { query: { page: 1 } });
            }).catch(err => {
                console.log('error', err);
                commit(SET_PROCUREMENT_OFFICER_IS_DELETING_MUTATION, false);
            });
    },

    [ADD_PROCUREMENT_OFFICER_INPUT_ACTION] ({ commit }, e) {
        commit(SET_PROCUREMENT_OFFICER_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_PROCUREMENT_OFFICER_INPUT_ACTION] ({ commit }, e) {
        commit(SET_PROCUREMENT_OFFICER_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION] ({ commit }, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addDepartmentsForNewProcurementOfficerAction ({ commit }, department) {
        commit("setDepartmentsForNewProcurementOfficerMutation", department);
    },

    addRolesForNewProcurementOfficerAction ({ commit }, roles) {
        commit("setRolesForNewProcurementOfficerMutation", roles);
    },

    addCustomPermissionsForNewProcurementOfficerAction ({ commit }, permissions) {
        commit("setCustomPermissionsForNewProcurementOfficerMutation", permissions);
    },

    addDepartmentsForEditProcurementOfficerAction ({ commit }, departments) {
        commit("setDepartmentsForEditProcurementOfficerMutation", departments);
    },

    addRolesForEditProcurementOfficerAction ({ commit }, roles) {
        commit("setRolesForEditProcurementOfficerMutation", roles);
    },

    setRolesForProcurementOfficerNullAction({ commit }) {
        commit("setRolesForProcurementOfficerNullMutation");
    },

    addCustomPermissionsForEditProcurementOfficerAction ({ commit }, permissions) {
        commit("setCustomPermissionsForEditProcurementOfficerMutation", permissions);
    },

    async getProcurementOfficerByDepartmentId({commit}, id) {
        commit(SET_PROCUREMENT_OFFICER_ARE_LOADING_MUTATION, true);
        UserDataService.getProcurementOfficerByDepartmentId(id)
            .then(res => {
                const users = res.data.data;
                commit(SET_PROCUREMENT_OFFICERS_MUTATION, users);
                commit(SET_PROCUREMENT_OFFICER_ARE_LOADING_MUTATION, false);
                commit(SET_PROCUREMENT_OFFICERS_LOADED_MUTATION, true);
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data);
            commit(SET_PROCUREMENT_OFFICER_ARE_LOADING_MUTATION, false);
        });
    },
}


const mutations = {
    [SET_PROCUREMENT_OFFICERS_MUTATION]: (state, procurementOfficers) => {
        state.procurementOfficers = procurementOfficers
    },
    [SET_PROCUREMENT_OFFICERS_PAGINATED_MUTATION]: (state, procurementOfficersPaginatedData) => {
        state.procurementOfficersPaginatedData = procurementOfficersPaginatedData
    },
    [SET_PROCUREMENT_OFFICER_DETAIL_MUTATION]: (state, procurementOfficer) => {
        state.procurementOfficer = procurementOfficer
    },
    [SET_PROCUREMENT_OFFICER_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_PROCUREMENT_OFFICERS_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_PROCUREMENT_OFFICER_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_PROCUREMENT_OFFICERS_MUTATION]: (state, procurementOfficer) => {
        // state.procurementOfficers.unshift(procurementOfficer)
        state.procurementOfficers.push(procurementOfficer)
        state.createdData = procurementOfficer;
    },
    [SET_PROCUREMENT_OFFICER_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_PROCUREMENT_OFFICER_MUTATION]: (state, procurementOfficer) => {
        //state.procurementOfficers.unshift(procurementOfficer);
        state.procurementOfficers = state.procurementOfficers.map(x => (x.id === procurementOfficer.id ? { ...x, name: procurementOfficer.name } : x));
        state.updatedData = procurementOfficer;
    },
    [SET_PROCUREMENT_OFFICER_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_PROCUREMENT_OFFICER_ADD_INPUT_MUTATION]: (state, e) => {
        let procurementOfficer = state.newProcurementOfficer;
        procurementOfficer[e.target.name] = e.target.value;
        state.newProcurementOfficer = procurementOfficer
    },
    [SET_PROCUREMENT_OFFICER_DETAIL_INPUT_MUTATION]: (state, e) => {
        let procurementOfficer = state.procurementOfficer;
        procurementOfficer[e.target.name + "New"] = e.target.value;
        state.procurementOfficer = procurementOfficer
    },
    [SET_PROCUREMENT_OFFICER_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },

    setDepartmentsForNewProcurementOfficerMutation (state, departments) {
        state.newProcurementOfficer.departments = departments;
    },

    setRolesForNewProcurementOfficerMutation (state, roles) {
        state.newProcurementOfficer.roles = roles;
    },

    setCustomPermissionsForNewProcurementOfficerMutation (state, permissions) {
        state.newProcurementOfficer.permissions = permissions;
    },

    setDepartmentsForEditProcurementOfficerMutation (state, department) {
        state.procurementOfficer.department = department;
    },

    setRolesForEditProcurementOfficerMutation (state, roles) {
        state.procurementOfficer.roles = roles;
    },

    setRolesForProcurementOfficerNullMutation: (state) => {
        state.procurementOfficer.roles = [];
    },

    setCustomPermissionsForEditProcurementOfficerMutation (state, permissions) {
        state.procurementOfficer.permissions = permissions;
    },
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}