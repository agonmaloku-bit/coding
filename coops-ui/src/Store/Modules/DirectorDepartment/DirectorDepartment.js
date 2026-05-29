import DirectorDepartmentDataService from "../../../Services/DirectorDepartmentDataService";
import {
    DIRECTOR_DEPARTMENT_LIST_GETTER,
    DIRECTOR_DEPARTMENTS_PAGINATED_DATA_GETTER,
    DIRECTOR_DEPARTMENT_GETTER,
    NEW_DIRECTOR_DEPARTMENT_GETTER,
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

    FETCH_ALL_DIRECTOR_DEPARTMENTS_ACTION,
    FETCH_DETAIL_DIRECTOR_DEPARTMENT_ACTION,
    STORE_DIRECTOR_DEPARTMENT_ACTION,
    UPDATE_DIRECTOR_DEPARTMENT_ACTION,
    DELETE_DIRECTOR_DEPARTMENT_ACTION,
    ADD_DIRECTOR_DEPARTMENT_INPUT_ACTION,
    UPDATE_DIRECTOR_DEPARTMENT_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_DIRECTOR_DEPARTMENTS_MUTATION,
    SAVE_UPDATED_DIRECTOR_DEPARTMENT_MUTATION,
    SET_DIRECTOR_DEPARTMENT_ADD_INPUT_MUTATION,
    SET_DIRECTOR_DEPARTMENT_ARE_LOADING_MUTATION,
    SET_DIRECTOR_DEPARTMENT_DETAIL_INPUT_MUTATION,
    SET_DIRECTOR_DEPARTMENT_DETAIL_MUTATION,
    SET_DIRECTOR_DEPARTMENT_IS_CREATING_MUTATION,
    SET_DIRECTOR_DEPARTMENT_IS_DELETING_MUTATION,
    SET_DIRECTOR_DEPARTMENT_IS_LOADING_MUTATION,
    SET_DIRECTOR_DEPARTMENT_IS_UPDATING_MUTATION,
    SET_DIRECTOR_DEPARTMENTS_LOADED_MUTATION,
    SET_DIRECTOR_DEPARTMENTS_MUTATION,
    SET_DIRECTOR_DEPARTMENTS_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    directorDepartments: [],
    directorDepartmentsPaginatedData: null,
    directorDepartment: null,
    newDirectorDepartment: { name: null },
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
    [DIRECTOR_DEPARTMENT_LIST_GETTER]: state => state.directorDepartments,
    [DIRECTOR_DEPARTMENTS_PAGINATED_DATA_GETTER]: state => state.directorDepartmentsPaginatedData,
    [DIRECTOR_DEPARTMENT_GETTER]: state => state.directorDepartment,
    [NEW_DIRECTOR_DEPARTMENT_GETTER]: state => state.newDirectorDepartment,
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
    directorDepartmentDepartmentsGetter: state => state.directorDepartment !== null ? state.directorDepartment.department : null
};


const actions = {
    async [FETCH_ALL_DIRECTOR_DEPARTMENTS_ACTION] ({ commit }, query = null) {
        commit(SET_DIRECTOR_DEPARTMENT_ARE_LOADING_MUTATION, true);
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
            DirectorDepartmentDataService.getAll(url)
                .then(res => {
                    const directorDepartments = res.data.data;
                    commit(SET_DIRECTOR_DEPARTMENTS_MUTATION, directorDepartments);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_DIRECTOR_DEPARTMENTS_PAGINATED_MUTATION, res.data);
                    commit(SET_DIRECTOR_DEPARTMENT_ARE_LOADING_MUTATION, false);
                    commit(SET_DIRECTOR_DEPARTMENTS_LOADED_MUTATION, true);
                }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data);
                commit(SET_DIRECTOR_DEPARTMENT_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_DIRECTOR_DEPARTMENT_ACTION] ({ commit }, id) {
        commit(SET_DIRECTOR_DEPARTMENT_IS_LOADING_MUTATION, true);
        DirectorDepartmentDataService.get(id)
            .then(res => {
                commit(SET_DIRECTOR_DEPARTMENT_DETAIL_MUTATION, res.data.data);
                commit(SET_DIRECTOR_DEPARTMENT_IS_LOADING_MUTATION, false);
            }).catch(err => {
                console.log('error', err);
                commit(SET_DIRECTOR_DEPARTMENT_IS_LOADING_MUTATION, false);
            });
    },

    async [STORE_DIRECTOR_DEPARTMENT_ACTION] ({ commit, dispatch }, directorDepartment) {
        commit(SET_DIRECTOR_DEPARTMENT_IS_CREATING_MUTATION, true);
        DirectorDepartmentDataService.create(directorDepartment)
            .then(res => {
                dispatch(FETCH_ALL_DIRECTOR_DEPARTMENTS_ACTION, { query: { page: 1 } });
                commit(SAVE_NEW_DIRECTOR_DEPARTMENTS_MUTATION, res.data.data);
                commit(SET_DIRECTOR_DEPARTMENT_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_DIRECTOR_DEPARTMENT_IS_CREATING_MUTATION, false);
            });
    },

    async [UPDATE_DIRECTOR_DEPARTMENT_ACTION] ({ commit, dispatch },directorDepartment) {
        commit(SET_DIRECTOR_DEPARTMENT_IS_UPDATING_MUTATION, true);

        DirectorDepartmentDataService.update(directorDepartment.id, directorDepartment)
            .then(() => {
                dispatch(FETCH_ALL_DIRECTOR_DEPARTMENTS_ACTION, { query: { page: 1 } });
                // commit(SAVE_UPDATED_DIRECTOR_DEPARTMENT_MUTATION, res.data.data);
                commit(SAVE_UPDATED_DIRECTOR_DEPARTMENT_MUTATION, directorDepartment);
                commit(SET_DIRECTOR_DEPARTMENT_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                // console.log(err.response.data);
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_DIRECTOR_DEPARTMENT_IS_UPDATING_MUTATION, false);
            });
    },

    async [DELETE_DIRECTOR_DEPARTMENT_ACTION] ({ commit, dispatch }, id) {
        commit(SET_DIRECTOR_DEPARTMENT_IS_DELETING_MUTATION, true);
        DirectorDepartmentDataService.delete(id)
            .then(() => {
                commit(SET_DIRECTOR_DEPARTMENT_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_DIRECTOR_DEPARTMENTS_ACTION, { query: { page: 1 } });
            }).catch(err => {
                console.log('error', err);
                commit(SET_DIRECTOR_DEPARTMENT_IS_DELETING_MUTATION, false);
            });
    },

    [ADD_DIRECTOR_DEPARTMENT_INPUT_ACTION] ({ commit }, e) {
        commit(SET_DIRECTOR_DEPARTMENT_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_DIRECTOR_DEPARTMENT_INPUT_ACTION] ({ commit }, e) {
        commit(SET_DIRECTOR_DEPARTMENT_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION] ({ commit }, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addDepartmentsForNewDirectorDepartmentAction ({ commit }, department) {
        commit("setDepartmentsForNewDirectorDepartmentMutation", department);
    },

    addRolesForNewDirectorDepartmentAction ({ commit }, roles) {
        commit("setRolesForNewDirectorDepartmentMutation", roles);
    },

    addCustomPermissionsForNewDirectorDepartmentAction ({ commit }, permissions) {
        commit("setCustomPermissionsForNewDirectorDepartmentMutation", permissions);
    },

    addDepartmentsForEditDirectorDepartmentAction ({ commit }, departments) {
        commit("setDepartmentsForEditDirectorDepartmentMutation", departments);
    },

    addRolesForEditDirectorDepartmentAction ({ commit }, roles) {
        commit("setRolesForEditDirectorDepartmentMutation", roles);
    },

    setRolesForDirectorDepartmentNullAction({ commit }) {
        commit("setRolesForDirectorDepartmentNullMutation");
    },

    addCustomPermissionsForEditDirectorDepartmentAction ({ commit }, permissions) {
        commit("setCustomPermissionsForEditDirectorDepartmentMutation", permissions);
    },
}


const mutations = {
    [SET_DIRECTOR_DEPARTMENTS_MUTATION]: (state, directorDepartments) => {
        state.directorDepartments = directorDepartments
    },
    [SET_DIRECTOR_DEPARTMENTS_PAGINATED_MUTATION]: (state, directorDepartmentsPaginatedData) => {
        state.directorDepartmentsPaginatedData = directorDepartmentsPaginatedData
    },
    [SET_DIRECTOR_DEPARTMENT_DETAIL_MUTATION]: (state, directorDepartment) => {
        state.directorDepartment = directorDepartment
    },
    [SET_DIRECTOR_DEPARTMENT_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_DIRECTOR_DEPARTMENTS_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_DIRECTOR_DEPARTMENT_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_DIRECTOR_DEPARTMENTS_MUTATION]: (state, directorDepartment) => {
        // state.directorDepartments.unshift(directorDepartment)
        state.directorDepartments.push(directorDepartment)
        state.createdData = directorDepartment;
    },
    [SET_DIRECTOR_DEPARTMENT_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_DIRECTOR_DEPARTMENT_MUTATION]: (state, directorDepartment) => {
        //state.directorDepartments.unshift(directorDepartment);
        state.directorDepartments = state.directorDepartments.map(x => (x.id === directorDepartment.id ? { ...x, name: directorDepartment.name } : x));
        state.updatedData = directorDepartment;
    },
    [SET_DIRECTOR_DEPARTMENT_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_DIRECTOR_DEPARTMENT_ADD_INPUT_MUTATION]: (state, e) => {
        let directorDepartment = state.newDirectorDepartment;
        directorDepartment[e.target.name] = e.target.value;
        state.newDirectorDepartment = directorDepartment
    },
    [SET_DIRECTOR_DEPARTMENT_DETAIL_INPUT_MUTATION]: (state, e) => {
        let directorDepartment = state.directorDepartment;
        directorDepartment[e.target.name + "New"] = e.target.value;
        state.directorDepartment = directorDepartment
    },
    [SET_DIRECTOR_DEPARTMENT_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },

    setDepartmentsForNewDirectorDepartmentMutation (state, departments) {
        state.newDirectorDepartment.departments = departments;
    },

    setRolesForNewDirectorDepartmentMutation (state, roles) {
        state.newDirectorDepartment.roles = roles;
    },

    setCustomPermissionsForNewDirectorDepartmentMutation (state, permissions) {
        state.newDirectorDepartment.permissions = permissions;
    },

    setDepartmentsForEditDirectorDepartmentMutation (state, department) {
        state.directorDepartment.department = department;
    },

    setRolesForEditDirectorDepartmentMutation (state, roles) {
        state.directorDepartment.roles = roles;
    },

    setRolesForDirectorDepartmentNullMutation: (state) => {
        state.directorDepartment.roles = [];
    },

    setCustomPermissionsForEditDirectorDepartmentMutation (state, permissions) {
        state.directorDepartment.permissions = permissions;
    },
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}