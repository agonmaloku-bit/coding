import ExecutiveDirectorDataService from "../../../Services/ExecutiveDirectorDataService";
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
    IS_DELETING_GETTER,
    DELETED_DATA_GETTER,
    ERRORS_GETTER,

    FETCH_ALL_EXECUTIVE_DIRECTORS_ACTION,
    FETCH_DETAIL_EXECUTIVE_DIRECTOR_ACTION,
    STORE_EXECUTIVE_DIRECTOR_ACTION,
    UPDATE_EXECUTIVE_DIRECTOR_ACTION,
    DELETE_EXECUTIVE_DIRECTOR_ACTION,
    ADD_EXECUTIVE_DIRECTOR_INPUT_ACTION,
    UPDATE_EXECUTIVE_DIRECTOR_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_EXECUTIVE_DIRECTORS_MUTATION,
    SAVE_UPDATED_EXECUTIVE_DIRECTOR_MUTATION,
    SET_EXECUTIVE_DIRECTOR_ADD_INPUT_MUTATION,
    SET_EXECUTIVE_DIRECTOR_ARE_LOADING_MUTATION,
    SET_EXECUTIVE_DIRECTOR_DETAIL_INPUT_MUTATION,
    SET_EXECUTIVE_DIRECTOR_DETAIL_MUTATION,
    SET_EXECUTIVE_DIRECTOR_IS_CREATING_MUTATION,
    SET_EXECUTIVE_DIRECTOR_IS_DELETING_MUTATION,
    SET_EXECUTIVE_DIRECTOR_IS_LOADING_MUTATION,
    SET_EXECUTIVE_DIRECTOR_IS_UPDATING_MUTATION,
    SET_EXECUTIVE_DIRECTORS_LOADED_MUTATION,
    SET_EXECUTIVE_DIRECTORS_MUTATION,
    SET_EXECUTIVE_DIRECTORS_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    executiveDirectors: [],
    executiveDirectorsPaginatedData: null,
    executiveDirector: null,
    newExecutiveDirector: { name: null },
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
    [EXECUTIVE_DIRECTOR_LIST_GETTER]: state => state.executiveDirectors,
    [EXECUTIVE_DIRECTORS_PAGINATED_DATA_GETTER]: state => state.executiveDirectorsPaginatedData,
    [EXECUTIVE_DIRECTOR_GETTER]: state => state.executiveDirector,
    [NEW_EXECUTIVE_DIRECTOR_GETTER]: state => state.newExecutiveDirector,
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
    executiveDirectorDepartmentsGetter: state => state.executiveDirector !== null ? state.executiveDirector.department : null
};


const actions = {
    async [FETCH_ALL_EXECUTIVE_DIRECTORS_ACTION] ({ commit }, query = null) {
        commit(SET_EXECUTIVE_DIRECTOR_ARE_LOADING_MUTATION, true);
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
            ExecutiveDirectorDataService.getAll(url)
                .then(res => {
                    const executiveDirectors = res.data.data;
                    commit(SET_EXECUTIVE_DIRECTORS_MUTATION, executiveDirectors);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_EXECUTIVE_DIRECTORS_PAGINATED_MUTATION, res.data);
                    commit(SET_EXECUTIVE_DIRECTOR_ARE_LOADING_MUTATION, false);
                    commit(SET_EXECUTIVE_DIRECTORS_LOADED_MUTATION, true);
                }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data);
                commit(SET_EXECUTIVE_DIRECTOR_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_EXECUTIVE_DIRECTOR_ACTION] ({ commit }, id) {
        commit(SET_EXECUTIVE_DIRECTOR_IS_LOADING_MUTATION, true);
        ExecutiveDirectorDataService.get(id)
            .then(res => {
                commit(SET_EXECUTIVE_DIRECTOR_DETAIL_MUTATION, res.data.data);
                commit(SET_EXECUTIVE_DIRECTOR_IS_LOADING_MUTATION, false);
            }).catch(err => {
                console.log('error', err);
                commit(SET_EXECUTIVE_DIRECTOR_IS_LOADING_MUTATION, false);
            });
    },

    async [STORE_EXECUTIVE_DIRECTOR_ACTION] ({ commit, dispatch }, executiveDirector) {
        commit(SET_EXECUTIVE_DIRECTOR_IS_CREATING_MUTATION, true);
        ExecutiveDirectorDataService.create(executiveDirector)
            .then(res => {
                dispatch(FETCH_ALL_EXECUTIVE_DIRECTORS_ACTION, { query: { page: 1 } });
                commit(SAVE_NEW_EXECUTIVE_DIRECTORS_MUTATION, res.data.data);
                commit(SET_EXECUTIVE_DIRECTOR_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_EXECUTIVE_DIRECTOR_IS_CREATING_MUTATION, false);
            });
    },

    async [UPDATE_EXECUTIVE_DIRECTOR_ACTION] ({ commit, dispatch },executiveDirector) {
        commit(SET_EXECUTIVE_DIRECTOR_IS_UPDATING_MUTATION, true);

        ExecutiveDirectorDataService.update(executiveDirector.id, executiveDirector)
            .then(() => {
                dispatch(FETCH_ALL_EXECUTIVE_DIRECTORS_ACTION, { query: { page: 1 } });
                // commit(SAVE_UPDATED_EXECUTIVE_DIRECTOR_MUTATION, res.data.data);
                commit(SAVE_UPDATED_EXECUTIVE_DIRECTOR_MUTATION, executiveDirector);
                commit(SET_EXECUTIVE_DIRECTOR_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                // console.log(err.response.data);
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_EXECUTIVE_DIRECTOR_IS_UPDATING_MUTATION, false);
            });
    },

    async [DELETE_EXECUTIVE_DIRECTOR_ACTION] ({ commit, dispatch }, id) {
        commit(SET_EXECUTIVE_DIRECTOR_IS_DELETING_MUTATION, true);
        ExecutiveDirectorDataService.delete(id)
            .then(() => {
                commit(SET_EXECUTIVE_DIRECTOR_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_EXECUTIVE_DIRECTORS_ACTION, { query: { page: 1 } });
            }).catch(err => {
                console.log('error', err);
                commit(SET_EXECUTIVE_DIRECTOR_IS_DELETING_MUTATION, false);
            });
    },

    [ADD_EXECUTIVE_DIRECTOR_INPUT_ACTION] ({ commit }, e) {
        commit(SET_EXECUTIVE_DIRECTOR_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_EXECUTIVE_DIRECTOR_INPUT_ACTION] ({ commit }, e) {
        commit(SET_EXECUTIVE_DIRECTOR_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION] ({ commit }, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addDepartmentsForNewExecutiveDirectorAction ({ commit }, department) {
        commit("setDepartmentsForNewExecutiveDirectorMutation", department);
    },

    addRolesForNewExecutiveDirectorAction ({ commit }, roles) {
        commit("setRolesForNewExecutiveDirectorMutation", roles);
    },

    addCustomPermissionsForNewExecutiveDirectorAction ({ commit }, permissions) {
        commit("setCustomPermissionsForNewExecutiveDirectorMutation", permissions);
    },

    addDepartmentsForEditExecutiveDirectorAction ({ commit }, departments) {
        commit("setDepartmentsForEditExecutiveDirectorMutation", departments);
    },

    addRolesForEditExecutiveDirectorAction ({ commit }, roles) {
        commit("setRolesForEditExecutiveDirectorMutation", roles);
    },

    setRolesForExecutiveDirectorNullAction({ commit }) {
        commit("setRolesForExecutiveDirectorNullMutation");
    },

    addCustomPermissionsForEditExecutiveDirectorAction ({ commit }, permissions) {
        commit("setCustomPermissionsForEditExecutiveDirectorMutation", permissions);
    },
}


const mutations = {
    [SET_EXECUTIVE_DIRECTORS_MUTATION]: (state, executiveDirectors) => {
        state.executiveDirectors = executiveDirectors
    },
    [SET_EXECUTIVE_DIRECTORS_PAGINATED_MUTATION]: (state, executiveDirectorsPaginatedData) => {
        state.executiveDirectorsPaginatedData = executiveDirectorsPaginatedData
    },
    [SET_EXECUTIVE_DIRECTOR_DETAIL_MUTATION]: (state, executiveDirector) => {
        state.executiveDirector = executiveDirector
    },
    [SET_EXECUTIVE_DIRECTOR_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_EXECUTIVE_DIRECTORS_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_EXECUTIVE_DIRECTOR_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_EXECUTIVE_DIRECTORS_MUTATION]: (state, executiveDirector) => {
        // state.executiveDirectors.unshift(executiveDirector)
        state.executiveDirectors.push(executiveDirector)
        state.createdData = executiveDirector;
    },
    [SET_EXECUTIVE_DIRECTOR_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_EXECUTIVE_DIRECTOR_MUTATION]: (state, executiveDirector) => {
        //state.executiveDirectors.unshift(executiveDirector);
        state.executiveDirectors = state.executiveDirectors.map(x => (x.id === executiveDirector.id ? { ...x, name: executiveDirector.name } : x));
        state.updatedData = executiveDirector;
    },
    [SET_EXECUTIVE_DIRECTOR_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_EXECUTIVE_DIRECTOR_ADD_INPUT_MUTATION]: (state, e) => {
        let executiveDirector = state.newExecutiveDirector;
        executiveDirector[e.target.name] = e.target.value;
        state.newExecutiveDirector = executiveDirector
    },
    [SET_EXECUTIVE_DIRECTOR_DETAIL_INPUT_MUTATION]: (state, e) => {
        let executiveDirector = state.executiveDirector;
        executiveDirector[e.target.name + "New"] = e.target.value;
        state.executiveDirector = executiveDirector
    },
    [SET_EXECUTIVE_DIRECTOR_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },

    setDepartmentsForNewExecutiveDirectorMutation (state, departments) {
        state.newExecutiveDirector.departments = departments;
    },

    setRolesForNewExecutiveDirectorMutation (state, roles) {
        state.newExecutiveDirector.roles = roles;
    },

    setCustomPermissionsForNewExecutiveDirectorMutation (state, permissions) {
        state.newExecutiveDirector.permissions = permissions;
    },

    setDepartmentsForEditExecutiveDirectorMutation (state, department) {
        state.executiveDirector.department = department;
    },

    setRolesForEditExecutiveDirectorMutation (state, roles) {
        state.executiveDirector.roles = roles;
    },

    setRolesForExecutiveDirectorNullMutation: (state) => {
        state.executiveDirector.roles = [];
    },

    setCustomPermissionsForEditExecutiveDirectorMutation (state, permissions) {
        state.executiveDirector.permissions = permissions;
    },
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}