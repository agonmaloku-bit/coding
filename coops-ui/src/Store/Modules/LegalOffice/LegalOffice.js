import LegalOfficeDataService from "../../../Services/LegalOfficeDataService";
import {
    LEGAL_OFFICE_LIST_GETTER,
    LEGAL_OFFICES_PAGINATED_DATA_GETTER,
    LEGAL_OFFICE_GETTER,
    NEW_LEGAL_OFFICE_GETTER,
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

    FETCH_ALL_LEGAL_OFFICES_ACTION,
    FETCH_DETAIL_LEGAL_OFFICE_ACTION,
    STORE_LEGAL_OFFICE_ACTION,
    UPDATE_LEGAL_OFFICE_ACTION,
    DELETE_LEGAL_OFFICE_ACTION,
    ADD_LEGAL_OFFICE_INPUT_ACTION,
    UPDATE_LEGAL_OFFICE_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_LEGAL_OFFICES_MUTATION,
    SAVE_UPDATED_LEGAL_OFFICE_MUTATION,
    SET_LEGAL_OFFICE_ADD_INPUT_MUTATION,
    SET_LEGAL_OFFICE_ARE_LOADING_MUTATION,
    SET_LEGAL_OFFICE_DETAIL_INPUT_MUTATION,
    SET_LEGAL_OFFICE_DETAIL_MUTATION,
    SET_LEGAL_OFFICE_IS_CREATING_MUTATION,
    SET_LEGAL_OFFICE_IS_DELETING_MUTATION,
    SET_LEGAL_OFFICE_IS_LOADING_MUTATION,
    SET_LEGAL_OFFICE_IS_UPDATING_MUTATION,
    SET_LEGAL_OFFICES_LOADED_MUTATION,
    SET_LEGAL_OFFICES_MUTATION,
    SET_LEGAL_OFFICES_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    legalOffices: [],
    legalOfficesPaginatedData: null,
    legalOffice: null,
    newLegalOffice: { name: null },
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
    [LEGAL_OFFICE_LIST_GETTER]: state => state.legalOffices,
    [LEGAL_OFFICES_PAGINATED_DATA_GETTER]: state => state.legalOfficesPaginatedData,
    [LEGAL_OFFICE_GETTER]: state => state.legalOffice,
    [NEW_LEGAL_OFFICE_GETTER]: state => state.newLegalOffice,
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
    legalOfficeDepartmentsGetter: state => state.legalOffice !== null ? state.legalOffice.department : null
};


const actions = {
    async [FETCH_ALL_LEGAL_OFFICES_ACTION] ({ commit }, query = null) {
        commit(SET_LEGAL_OFFICE_ARE_LOADING_MUTATION, true);
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
            LegalOfficeDataService.getAll(url)
                .then(res => {
                    const legalOffices = res.data.data;
                    commit(SET_LEGAL_OFFICES_MUTATION, legalOffices);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_LEGAL_OFFICES_PAGINATED_MUTATION, res.data);
                    commit(SET_LEGAL_OFFICE_ARE_LOADING_MUTATION, false);
                    commit(SET_LEGAL_OFFICES_LOADED_MUTATION, true);
                }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data);
                commit(SET_LEGAL_OFFICE_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_LEGAL_OFFICE_ACTION] ({ commit }, id) {
        commit(SET_LEGAL_OFFICE_IS_LOADING_MUTATION, true);
        LegalOfficeDataService.get(id)
            .then(res => {
                commit(SET_LEGAL_OFFICE_DETAIL_MUTATION, res.data.data);
                commit(SET_LEGAL_OFFICE_IS_LOADING_MUTATION, false);
            }).catch(err => {
                console.log('error', err);
                commit(SET_LEGAL_OFFICE_IS_LOADING_MUTATION, false);
            });
    },

    async [STORE_LEGAL_OFFICE_ACTION] ({ commit, dispatch }, legalOffice) {
        commit(SET_LEGAL_OFFICE_IS_CREATING_MUTATION, true);
        LegalOfficeDataService.create(legalOffice)
            .then(res => {
                dispatch(FETCH_ALL_LEGAL_OFFICES_ACTION, { query: { page: 1 } });
                commit(SAVE_NEW_LEGAL_OFFICES_MUTATION, res.data.data);
                commit(SET_LEGAL_OFFICE_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_LEGAL_OFFICE_IS_CREATING_MUTATION, false);
            });
    },

    async [UPDATE_LEGAL_OFFICE_ACTION] ({ commit, dispatch },legalOffice) {
        commit(SET_LEGAL_OFFICE_IS_UPDATING_MUTATION, true);

        LegalOfficeDataService.update(legalOffice.id, legalOffice)
            .then(() => {
                dispatch(FETCH_ALL_LEGAL_OFFICES_ACTION, { query: { page: 1 } });
                // commit(SAVE_UPDATED_LEGAL_OFFICE_MUTATION, res.data.data);
                commit(SAVE_UPDATED_LEGAL_OFFICE_MUTATION, legalOffice);
                commit(SET_LEGAL_OFFICE_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                // console.log(err.response.data);
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_LEGAL_OFFICE_IS_UPDATING_MUTATION, false);
            });
    },

    async [DELETE_LEGAL_OFFICE_ACTION] ({ commit, dispatch }, id) {
        commit(SET_LEGAL_OFFICE_IS_DELETING_MUTATION, true);
        LegalOfficeDataService.delete(id)
            .then(() => {
                commit(SET_LEGAL_OFFICE_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_LEGAL_OFFICES_ACTION, { query: { page: 1 } });
            }).catch(err => {
                console.log('error', err);
                commit(SET_LEGAL_OFFICE_IS_DELETING_MUTATION, false);
            });
    },

    [ADD_LEGAL_OFFICE_INPUT_ACTION] ({ commit }, e) {
        commit(SET_LEGAL_OFFICE_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_LEGAL_OFFICE_INPUT_ACTION] ({ commit }, e) {
        commit(SET_LEGAL_OFFICE_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION] ({ commit }, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addDepartmentsForNewLegalOfficeAction ({ commit }, department) {
        commit("setDepartmentsForNewLegalOfficeMutation", department);
    },

    addRolesForNewLegalOfficeAction ({ commit }, roles) {
        commit("setRolesForNewLegalOfficeMutation", roles);
    },

    addCustomPermissionsForNewLegalOfficeAction ({ commit }, permissions) {
        commit("setCustomPermissionsForNewLegalOfficeMutation", permissions);
    },

    addDepartmentsForEditLegalOfficeAction ({ commit }, departments) {
        commit("setDepartmentsForEditLegalOfficeMutation", departments);
    },

    addRolesForEditLegalOfficeAction ({ commit }, roles) {
        commit("setRolesForEditLegalOfficeMutation", roles);
    },

    setRolesForLegalOfficeNullAction({ commit }) {
        commit("setRolesForLegalOfficeNullMutation");
    },

    addCustomPermissionsForEditLegalOfficeAction ({ commit }, permissions) {
        commit("setCustomPermissionsForEditLegalOfficeMutation", permissions);
    },
}


const mutations = {
    [SET_LEGAL_OFFICES_MUTATION]: (state, legalOffices) => {
        state.legalOffices = legalOffices
    },
    [SET_LEGAL_OFFICES_PAGINATED_MUTATION]: (state, legalOfficesPaginatedData) => {
        state.legalOfficesPaginatedData = legalOfficesPaginatedData
    },
    [SET_LEGAL_OFFICE_DETAIL_MUTATION]: (state, legalOffice) => {
        state.legalOffice = legalOffice
    },
    [SET_LEGAL_OFFICE_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_LEGAL_OFFICES_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_LEGAL_OFFICE_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_LEGAL_OFFICES_MUTATION]: (state, legalOffice) => {
        // state.legalOffices.unshift(legalOffice)
        state.legalOffices.push(legalOffice)
        state.createdData = legalOffice;
    },
    [SET_LEGAL_OFFICE_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_LEGAL_OFFICE_MUTATION]: (state, legalOffice) => {
        //state.legalOffices.unshift(legalOffice);
        state.legalOffices = state.legalOffices.map(x => (x.id === legalOffice.id ? { ...x, name: legalOffice.name } : x));
        state.updatedData = legalOffice;
    },
    [SET_LEGAL_OFFICE_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_LEGAL_OFFICE_ADD_INPUT_MUTATION]: (state, e) => {
        let legalOffice = state.newLegalOffice;
        legalOffice[e.target.name] = e.target.value;
        state.newLegalOffice = legalOffice
    },
    [SET_LEGAL_OFFICE_DETAIL_INPUT_MUTATION]: (state, e) => {
        let legalOffice = state.legalOffice;
        legalOffice[e.target.name + "New"] = e.target.value;
        state.legalOffice = legalOffice
    },
    [SET_LEGAL_OFFICE_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },

    setDepartmentsForNewLegalOfficeMutation (state, departments) {
        state.newLegalOffice.departments = departments;
    },

    setRolesForNewLegalOfficeMutation (state, roles) {
        state.newLegalOffice.roles = roles;
    },

    setCustomPermissionsForNewLegalOfficeMutation (state, permissions) {
        state.newLegalOffice.permissions = permissions;
    },

    setDepartmentsForEditLegalOfficeMutation (state, department) {
        state.legalOffice.department = department;
    },

    setRolesForEditLegalOfficeMutation (state, roles) {
        state.legalOffice.roles = roles;
    },

    setRolesForLegalOfficeNullMutation: (state) => {
        state.legalOffice.roles = [];
    },

    setCustomPermissionsForEditLegalOfficeMutation (state, permissions) {
        state.legalOffice.permissions = permissions;
    },
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}