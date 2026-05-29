import UserDataService from "../../../Services/UserDataService";
import {
    USER_LIST_GETTER,
    USERS_PAGINATED_DATA_GETTER,
    USER_GETTER,
    NEW_USER_GETTER,
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

    FETCH_ALL_USERS_ACTION,
    FETCH_DETAIL_USER_ACTION,
    STORE_USER_ACTION,
    UPDATE_USER_ACTION,
    DELETE_USER_ACTION,
    ADD_USER_INPUT_ACTION,
    UPDATE_USER_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_USERS_MUTATION,
    SAVE_UPDATED_USER_MUTATION,
    SET_USER_ADD_INPUT_MUTATION,
    SET_USER_ARE_LOADING_MUTATION,
    SET_USER_DETAIL_INPUT_MUTATION,
    SET_USER_DETAIL_MUTATION,
    SET_USER_IS_CREATING_MUTATION,
    SET_USER_IS_DELETING_MUTATION,
    SET_USER_IS_LOADING_MUTATION,
    SET_USER_IS_UPDATING_MUTATION,
    SET_USERS_LOADED_MUTATION,
    SET_USERS_MUTATION,
    SET_USERS_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    users: [],
    usersPaginatedData: null,
    user: null,
    newUser: {name: null},
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
    [USER_LIST_GETTER]: state => state.users,
    [USERS_PAGINATED_DATA_GETTER]: state => state.usersPaginatedData,
    [USER_GETTER]: state => state.user,
    [NEW_USER_GETTER]: state => state.newUser,
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
    userDepartmentsGetter: state => state.user !== null ? state.user.departments : null
};


const actions = {
    async [FETCH_ALL_USERS_ACTION]({commit}, query = null) {
        commit(SET_USER_ARE_LOADING_MUTATION, true);
        let url = null;
        if (query === null) {
            url = null;
        } else {
            url = `?page=${query.page}`;
        }

        let user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            UserDataService.getAll(url)
                .then(res => {
                    const users = res.data.data;
                    commit(SET_USERS_MUTATION, users);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_USERS_PAGINATED_MUTATION, res.data);
                    commit(SET_USER_ARE_LOADING_MUTATION, false);
                    commit(SET_USERS_LOADED_MUTATION, true);
                }).catch(() => {
                //console.log('error', err);
                commit(SET_USER_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_USER_ACTION]({commit}, id) {
        commit(SET_USER_IS_LOADING_MUTATION, true);
        await UserDataService.get(id)
            .then(res => {
                commit(SET_USER_DETAIL_MUTATION, res.data.data);
                commit(SET_USER_IS_LOADING_MUTATION, false);
            }).catch(err => {
            console.log('error', err);
            commit(SET_USER_IS_LOADING_MUTATION, false);
        });
    },

    async [STORE_USER_ACTION]({commit, dispatch}, user) {
        commit(SET_USER_IS_CREATING_MUTATION, true);
        UserDataService.create(user)
            .then(res => {
                dispatch(FETCH_ALL_USERS_ACTION, {query: {page: 1}});
                commit(SAVE_NEW_USERS_MUTATION, res.data.data);
                commit(SET_USER_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
                commit("setNewUserInputNull");
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_USER_IS_CREATING_MUTATION, false);
        });
    },

    async [UPDATE_USER_ACTION]({commit, dispatch}, user) {
        commit(SET_USER_IS_UPDATING_MUTATION, true);

        UserDataService.update(user.id, user)
            .then(() => {
                dispatch(FETCH_ALL_USERS_ACTION, {query: {page: 1}});
                // commit(SAVE_UPDATED_USER_MUTATION, res.data.data);
                commit(SAVE_UPDATED_USER_MUTATION, user);
                commit(SET_USER_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
            // console.log(err.response.data);
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_USER_IS_UPDATING_MUTATION, false);
        });
    },

    async [DELETE_USER_ACTION]({commit, dispatch}, id) {
        commit(SET_USER_IS_DELETING_MUTATION, true);
        UserDataService.delete(id)
            .then(() => {
                commit(SET_USER_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_USERS_ACTION, {query: {page: 1}});
            }).catch(err => {
            console.log('error', err);
            commit(SET_USER_IS_DELETING_MUTATION, false);
        });
    },

    [ADD_USER_INPUT_ACTION]({commit}, e) {
        commit(SET_USER_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_USER_INPUT_ACTION]({commit}, e) {
        commit(SET_USER_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION]({commit}, e) {
        commit(SET_ERRORS_MUTATION, e);
    },
    addCompanyForNewUserAction({commit}, company) {
        commit("setCompanyForNewUserMutation", company);
    },
    addDepartmentsForNewUserAction({commit}, department) {
        commit("setDepartmentsForNewUserMutation", department);
    },
    addRolesForNewUserAction({commit}, roles) {
        commit("setRolesForNewUserMutation", roles);
    },
    addCustomPermissionsForNewUserAction({commit}, permissions) {
        commit("setCustomPermissionsForNewUserMutation", permissions);
    },
    addCompanyForEditUserAction({commit}, company) {
        commit("setCompanyForEditUserMutation", company);
    },
    addDepartmentsForEditUserAction({commit}, departments) {
        commit("setDepartmentsForEditUserMutation", departments);
    },
    addRolesForEditUserAction({commit}, roles) {
        commit("setRolesForEditUserMutation", roles);
    },
    setRolesForUserNullAction({commit}) {
        commit("setRolesForUserNullMutation");
    },
    addCustomPermissionsForEditUserAction({commit}, permissions) {
        commit("setCustomPermissionsForEditUserMutation", permissions);
    },
    setDepartmentForCompanyNullAction({commit}) {
        commit("setDepartmentForCompanyNullMutation");
    },
    setDepartmentForCompanyEditNullAction({commit}) {
        commit("setDepartmentForCompanyEditNullMutation");
    },
}


const mutations = {
    [SET_USERS_MUTATION]: (state, users) => {
        state.users = users
    },
    [SET_USERS_PAGINATED_MUTATION]: (state, usersPaginatedData) => {
        state.usersPaginatedData = usersPaginatedData
    },
    [SET_USER_DETAIL_MUTATION]: (state, user) => {
        state.user = user
    },
    [SET_USER_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_USERS_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_USER_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_USERS_MUTATION]: (state, user) => {
        // state.users.unshift(user)
        state.users.push(user)
        state.createdData = user;
    },
    [SET_USER_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_USER_MUTATION]: (state, user) => {
        //state.users.unshift(user);
        state.users = state.users.map(x => (x.id === user.id ? {...x, name: user.name} : x));
        state.updatedData = user;
    },
    [SET_USER_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_USER_ADD_INPUT_MUTATION]: (state, e) => {
        let user = state.newUser;
        user[e.target.name] = e.target.value;
        state.newUser = user
    },
    [SET_USER_DETAIL_INPUT_MUTATION]: (state, e) => {
        let user = state.user;
        user[e.target.name + "New"] = e.target.value;
        state.user = user
    },
    [SET_USER_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },
    setCompanyForNewUserMutation(state, company) {
        state.newUser.company = company;
    },
    setDepartmentsForNewUserMutation(state, departments) {
        state.newUser.departments = departments;
    },
    setRolesForNewUserMutation(state, roles) {
        state.newUser.roles = roles;
    },
    setCustomPermissionsForNewUserMutation(state, permissions) {
        state.newUser.permissions = permissions;
    },
    setCompanyForEditUserMutation(state, company) {
        state.user.company = company;
    },
    setDepartmentsForEditUserMutation(state, department) {
        state.user.department = department;
    },
    setRolesForEditUserMutation(state, roles) {
        state.user.roles = roles;
    },
    setRolesForUserNullMutation: (state) => {
        state.user.roles = [];
    },
    setForUserNullMutation: (state) => {
        state.user.roles = [];
    },
    setCustomPermissionsForEditUserMutation(state, permissions) {
        state.user.permissions = permissions;
    },
    setDepartmentForCompanyNullMutation: (state) => {
        state.newUser.departments = null
    },
    setDepartmentForCompanyEditNullMutation: (state) => {
        state.user.department = null
    },
    setNewUserInputNull (state) {
        state.newUser['first_name'] = null
        state.newUser['last_name'] = null
        state.newUser['email'] = null
        state.newUser['password'] = null
        state.newUser['password_confirmation'] = null
        state.newUser['company'] = null
        state.newUser['departments'] = null
        state.newUser['roles'] = null
        state.newUser['permissions'] = null
    }
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}