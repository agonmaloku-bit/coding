import ResponsiblePersonDataService from "../../../Services/ResponsiblePersonDataService";
import {
    RESPONSIBLE_PERSON_LIST_GETTER,
    RESPONSIBLE_PERSONS_PAGINATED_DATA_GETTER,
    RESPONSIBLE_PERSON_GETTER,
    NEW_RESPONSIBLE_PERSON_GETTER,
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

    FETCH_ALL_RESPONSIBLE_PERSONS_ACTION,
    FETCH_DETAIL_RESPONSIBLE_PERSON_ACTION,
    STORE_RESPONSIBLE_PERSON_ACTION,
    UPDATE_RESPONSIBLE_PERSON_ACTION,
    DELETE_RESPONSIBLE_PERSON_ACTION,
    ADD_RESPONSIBLE_PERSON_INPUT_ACTION,
    UPDATE_RESPONSIBLE_PERSON_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_RESPONSIBLE_PERSONS_MUTATION,
    SAVE_UPDATED_RESPONSIBLE_PERSON_MUTATION,
    SET_RESPONSIBLE_PERSON_ADD_INPUT_MUTATION,
    SET_RESPONSIBLE_PERSON_ARE_LOADING_MUTATION,
    SET_RESPONSIBLE_PERSON_DETAIL_INPUT_MUTATION,
    SET_RESPONSIBLE_PERSON_DETAIL_MUTATION,
    SET_RESPONSIBLE_PERSON_IS_CREATING_MUTATION,
    SET_RESPONSIBLE_PERSON_IS_DELETING_MUTATION,
    SET_RESPONSIBLE_PERSON_IS_LOADING_MUTATION,
    SET_RESPONSIBLE_PERSON_IS_UPDATING_MUTATION,
    SET_RESPONSIBLE_PERSONS_LOADED_MUTATION,
    SET_RESPONSIBLE_PERSONS_MUTATION,
    SET_RESPONSIBLE_PERSONS_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    responsiblePersons: [],
    responsiblePersonsPaginatedData: null,
    responsiblePerson: null,
    newResponsiblePerson: {name: null},
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
    [RESPONSIBLE_PERSON_LIST_GETTER]: state => state.responsiblePersons,
    [RESPONSIBLE_PERSONS_PAGINATED_DATA_GETTER]: state => state.responsiblePersonsPaginatedData,
    [RESPONSIBLE_PERSON_GETTER]: state => state.responsiblePerson,
    [NEW_RESPONSIBLE_PERSON_GETTER]: state => state.newResponsiblePerson,
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
    responsiblePersonDepartmentsGetter: state => state.responsiblePerson !== null ? state.responsiblePerson.department : null
};


const actions = {
    async [FETCH_ALL_RESPONSIBLE_PERSONS_ACTION]({commit}, query = null) {
        commit(SET_RESPONSIBLE_PERSON_ARE_LOADING_MUTATION, true);
        let url = null;
        if (query === null) {
            url = null;
        } else {
            url = `?page=${query.page}`;
        }

        let user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            ResponsiblePersonDataService.getAll(url)
                .then(res => {
                    const responsiblePersons = res.data.data;
                    commit(SET_RESPONSIBLE_PERSONS_MUTATION, responsiblePersons);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_RESPONSIBLE_PERSONS_PAGINATED_MUTATION, res.data);
                    commit(SET_RESPONSIBLE_PERSON_ARE_LOADING_MUTATION, false);
                    commit(SET_RESPONSIBLE_PERSONS_LOADED_MUTATION, true);
                }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data);
                commit(SET_RESPONSIBLE_PERSON_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_RESPONSIBLE_PERSON_ACTION]({commit}, id) {
        commit(SET_RESPONSIBLE_PERSON_IS_LOADING_MUTATION, true);
        ResponsiblePersonDataService.get(id)
            .then(res => {
                commit(SET_RESPONSIBLE_PERSON_DETAIL_MUTATION, res.data.data);
                commit(SET_RESPONSIBLE_PERSON_IS_LOADING_MUTATION, false);
            }).catch(err => {
            console.log('error', err);
            commit(SET_RESPONSIBLE_PERSON_IS_LOADING_MUTATION, false);
        });
    },

    async [STORE_RESPONSIBLE_PERSON_ACTION]({commit, dispatch}, responsiblePerson) {
        commit(SET_RESPONSIBLE_PERSON_IS_CREATING_MUTATION, true);
        ResponsiblePersonDataService.create(responsiblePerson)
            .then(res => {
                dispatch(FETCH_ALL_RESPONSIBLE_PERSONS_ACTION, {query: {page: 1}});
                commit(SAVE_NEW_RESPONSIBLE_PERSONS_MUTATION, res.data.data);
                commit(SET_RESPONSIBLE_PERSON_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_RESPONSIBLE_PERSON_IS_CREATING_MUTATION, false);
        });
    },

    async [UPDATE_RESPONSIBLE_PERSON_ACTION]({commit, dispatch}, responsiblePerson) {
        commit(SET_RESPONSIBLE_PERSON_IS_UPDATING_MUTATION, true);

        ResponsiblePersonDataService.update(responsiblePerson.id, responsiblePerson)
            .then(() => {
                dispatch(FETCH_ALL_RESPONSIBLE_PERSONS_ACTION, {query: {page: 1}});
                // commit(SAVE_UPDATED_RESPONSIBLE_PERSON_MUTATION, res.data.data);
                commit(SAVE_UPDATED_RESPONSIBLE_PERSON_MUTATION, responsiblePerson);
                commit(SET_RESPONSIBLE_PERSON_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
            // console.log(err.response.data);
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_RESPONSIBLE_PERSON_IS_UPDATING_MUTATION, false);
        });
    },

    async [DELETE_RESPONSIBLE_PERSON_ACTION]({commit, dispatch}, id) {
        commit(SET_RESPONSIBLE_PERSON_IS_DELETING_MUTATION, true);
        ResponsiblePersonDataService.delete(id)
            .then(() => {
                commit(SET_RESPONSIBLE_PERSON_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_RESPONSIBLE_PERSONS_ACTION, {query: {page: 1}});
            }).catch(err => {
            console.log('error', err);
            commit(SET_RESPONSIBLE_PERSON_IS_DELETING_MUTATION, false);
        });
    },

    [ADD_RESPONSIBLE_PERSON_INPUT_ACTION]({commit}, e) {
        commit(SET_RESPONSIBLE_PERSON_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_RESPONSIBLE_PERSON_INPUT_ACTION]({commit}, e) {
        commit(SET_RESPONSIBLE_PERSON_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION]({commit}, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addDepartmentsForNewResponsiblePersonAction({commit}, department) {
        commit("setDepartmentsForNewResponsiblePersonMutation", department);
    },

    addRolesForNewResponsiblePersonAction({commit}, roles) {
        commit("setRolesForNewResponsiblePersonMutation", roles);
    },

    addCustomPermissionsForNewResponsiblePersonAction({commit}, permissions) {
        commit("setCustomPermissionsForNewResponsiblePersonMutation", permissions);
    },

    addDepartmentsForEditResponsiblePersonAction({commit}, departments) {
        commit("setDepartmentsForEditResponsiblePersonMutation", departments);
    },

    addRolesForEditResponsiblePersonAction({commit}, roles) {
        commit("setRolesForEditResponsiblePersonMutation", roles);
    },

    setRolesForResponsiblePersonNullAction({commit}) {
        commit("setRolesForResponsiblePersonNullMutation");
    },

    addCustomPermissionsForEditResponsiblePersonAction({commit}, permissions) {
        commit("setCustomPermissionsForEditResponsiblePersonMutation", permissions);
    },

    async getResponsiblePersonsByDepartmentId({commit}, id) {
        commit(SET_RESPONSIBLE_PERSON_ARE_LOADING_MUTATION, true);
        ResponsiblePersonDataService.getByDepartmentId(id)
            .then(res => {
                const responsiblePersons = res.data.data;
                commit(SET_RESPONSIBLE_PERSONS_MUTATION, responsiblePersons);
                commit(SET_RESPONSIBLE_PERSON_ARE_LOADING_MUTATION, false);
                commit(SET_RESPONSIBLE_PERSONS_LOADED_MUTATION, true);
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data);
            commit(SET_RESPONSIBLE_PERSON_ARE_LOADING_MUTATION, false);
        });
    },
}


const mutations = {
    [SET_RESPONSIBLE_PERSONS_MUTATION]: (state, responsiblePersons) => {
        state.responsiblePersons = responsiblePersons
    },
    [SET_RESPONSIBLE_PERSONS_PAGINATED_MUTATION]: (state, responsiblePersonsPaginatedData) => {
        state.responsiblePersonsPaginatedData = responsiblePersonsPaginatedData
    },
    [SET_RESPONSIBLE_PERSON_DETAIL_MUTATION]: (state, responsiblePerson) => {
        state.responsiblePerson = responsiblePerson
    },
    [SET_RESPONSIBLE_PERSON_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_RESPONSIBLE_PERSONS_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_RESPONSIBLE_PERSON_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_RESPONSIBLE_PERSONS_MUTATION]: (state, responsiblePerson) => {
        // state.responsiblePersons.unshift(responsiblePerson)
        state.responsiblePersons.push(responsiblePerson)
        state.createdData = responsiblePerson;
    },
    [SET_RESPONSIBLE_PERSON_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_RESPONSIBLE_PERSON_MUTATION]: (state, responsiblePerson) => {
        //state.responsiblePersons.unshift(responsiblePerson);
        state.responsiblePersons = state.responsiblePersons.map(x => (x.id === responsiblePerson.id ? {
            ...x,
            name: responsiblePerson.name
        } : x));
        state.updatedData = responsiblePerson;
    },
    [SET_RESPONSIBLE_PERSON_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_RESPONSIBLE_PERSON_ADD_INPUT_MUTATION]: (state, e) => {
        let responsiblePerson = state.newResponsiblePerson;
        responsiblePerson[e.target.name] = e.target.value;
        state.newResponsiblePerson = responsiblePerson
    },
    [SET_RESPONSIBLE_PERSON_DETAIL_INPUT_MUTATION]: (state, e) => {
        let responsiblePerson = state.responsiblePerson;
        responsiblePerson[e.target.name + "New"] = e.target.value;
        state.responsiblePerson = responsiblePerson
    },
    [SET_RESPONSIBLE_PERSON_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },

    setDepartmentsForNewResponsiblePersonMutation(state, departments) {
        state.newResponsiblePerson.departments = departments;
    },

    setRolesForNewResponsiblePersonMutation(state, roles) {
        state.newResponsiblePerson.roles = roles;
    },

    setCustomPermissionsForNewResponsiblePersonMutation(state, permissions) {
        state.newResponsiblePerson.permissions = permissions;
    },

    setDepartmentsForEditResponsiblePersonMutation(state, department) {
        state.responsiblePerson.department = department;
    },

    setRolesForEditResponsiblePersonMutation(state, roles) {
        state.responsiblePerson.roles = roles;
    },

    setRolesForResponsiblePersonNullMutation: (state) => {
        state.responsiblePerson.roles = [];
    },

    setCustomPermissionsForEditResponsiblePersonMutation(state, permissions) {
        state.responsiblePerson.permissions = permissions;
    },
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}