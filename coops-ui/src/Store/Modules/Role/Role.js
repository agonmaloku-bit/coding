import RoleDataService from "../../../Services/RoleDataService";
import {
    ROLE_LIST_GETTER,
    ROLES_PAGINATED_DATA_GETTER,
    ROLE_GETTER,
    NEW_ROLE_GETTER,
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

    FETCH_ALL_ROLES_ACTION,
    FETCH_DETAIL_ROLE_ACTION,
    STORE_ROLE_ACTION,
    UPDATE_ROLE_ACTION,
    DELETE_ROLE_ACTION,
    ADD_ROLE_INPUT_ACTION,
    UPDATE_ROLE_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_ROLES_MUTATION,
    SAVE_UPDATED_ROLE_MUTATION,
    SET_ROLE_ADD_INPUT_MUTATION,
    SET_ROLE_ARE_LOADING_MUTATION,
    SET_ROLE_DETAIL_INPUT_MUTATION,
    SET_ROLE_DETAIL_MUTATION,
    SET_ROLE_IS_CREATING_MUTATION,
    SET_ROLE_IS_DELETING_MUTATION,
    SET_ROLE_IS_LOADING_MUTATION,
    SET_ROLE_IS_UPDATING_MUTATION,
    SET_ROLES_LOADED_MUTATION,
    SET_ROLES_MUTATION,
    SET_ROLES_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    roles: [],
    rolesPaginatedData: null,
    role: null,
    newRole: {name: null},
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
    // rolesForDepartments: [{
    //     "id": 0,
    //     "name": "Select department first to see the roles",
    // }],
    rolesForDepartments: [],
    roleByNameForDepartments: [],
});


const getters = {
    [ROLE_LIST_GETTER]: state => state.roles,
    [ROLES_PAGINATED_DATA_GETTER]: state => state.rolesPaginatedData,
    [ROLE_GETTER]: state => state.role,
    [NEW_ROLE_GETTER]: state => state.newRole,
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
    rolesForDepartmentsGetter: state => state.rolesForDepartments,
    roleByNameForDepartmentsGetter: state => state.roleByNameForDepartments
};


const actions = {
    async [FETCH_ALL_ROLES_ACTION]({commit}, query = null) {
        commit(SET_ROLE_ARE_LOADING_MUTATION, true);
        let url = null;
        if (query === null) {
            url = null;
        }
        else {
            url = `?page=${query.page}`;
        }

        let user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            RoleDataService.getAll(url)
                .then(res => {
                    const roles = res.data.data;
                    commit(SET_ROLES_MUTATION, roles);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_ROLES_PAGINATED_MUTATION, res.data);
                    commit(SET_ROLE_ARE_LOADING_MUTATION, false);
                    commit(SET_ROLES_LOADED_MUTATION, true);
                }).catch(() => {
                //console.log('error', err);
                commit(SET_ROLE_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_ROLE_ACTION]({commit}, id) {
        commit(SET_ROLE_IS_LOADING_MUTATION, true);
        RoleDataService.get(id)
            .then(res => {
                commit(SET_ROLE_DETAIL_MUTATION, res.data.data);
                commit(SET_ROLE_IS_LOADING_MUTATION, false);
            }).catch(err => {
            console.log('error', err);
            commit(SET_ROLE_IS_LOADING_MUTATION, false);
        });
    },

    async [STORE_ROLE_ACTION]({commit, dispatch}, role) {
        commit(SET_ROLE_IS_CREATING_MUTATION, true);
        RoleDataService.create(role)
            .then(res => {
                dispatch(FETCH_ALL_ROLES_ACTION);
                commit(SAVE_NEW_ROLES_MUTATION, res.data.data);
                commit("onSuccessEmptyNewRole");
                commit(SET_ROLE_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_ROLE_IS_CREATING_MUTATION, false);
        });
    },

    async [UPDATE_ROLE_ACTION]({commit, dispatch}, role) {
        commit(SET_ROLE_IS_UPDATING_MUTATION, true);

        RoleDataService.update(role.id, role)
            .then(() => {
                dispatch(FETCH_ALL_ROLES_ACTION, { query: { page: 1 } });
                // commit(SAVE_UPDATED_ROLE_MUTATION, res.data.data);
                commit(SAVE_UPDATED_ROLE_MUTATION, role);
                commit(SET_ROLE_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data);
            // commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_ROLE_IS_UPDATING_MUTATION, false);
        });
    },

    async [DELETE_ROLE_ACTION]({commit, dispatch}, id) {
        commit(SET_ROLE_IS_DELETING_MUTATION, true);
        RoleDataService.delete(id)
            .then(() => {
                commit(SET_ROLE_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_ROLES_ACTION);
            }).catch(err => {
            console.log('error', err);
            commit(SET_ROLE_IS_DELETING_MUTATION, false);
        });
    },

    [ADD_ROLE_INPUT_ACTION]({commit}, e) {
        commit(SET_ROLE_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_ROLE_INPUT_ACTION]({commit}, e) {
        commit(SET_ROLE_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION]({commit}, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addRoleDepartmentsAction({commit}, departments) {
        commit("setRoleDepartmentsInputMutation", departments);
    },

    updateRoleDepartmentsAction({commit}, departments) {
        commit("setRoleDepartmentsUpdateMutation", departments);
    },

    updateRolePermissionsAction({commit}, permissions) {
        commit("setRolePermissionsUpdateMutation", permissions);
    },

    async getAllRolesForDepartments({commit}, ids) {
        RoleDataService.getAllRolesByDepartmentIds(ids)
            .then(res => {
                const roles = res.data.data;
                commit("setRolesForDepartments", roles);
            }).catch(() => {
            //console.log('error', err);
        });
    },

    async getRoleByNameForDepartments({commit}, depIdAndRoleName) {
        RoleDataService.getRoleByNameAndByDepartmentIds(depIdAndRoleName.id, depIdAndRoleName.slug)
            .then(res => {
                const role = res.data.data;
                commit("setRoleForDepartments", role);
            }).catch(() => {
            //console.log('error', err);
        });
    },

    setRolesForDepartmentsNullAction({ commit }) {
        commit("setRolesForDepartmentsNullMutation");
    },
}


const mutations = {
    [SET_ROLES_MUTATION]: (state, roles) => {
        state.roles = roles
    },
    [SET_ROLES_PAGINATED_MUTATION]: (state, rolesPaginatedData) => {
        state.rolesPaginatedData = rolesPaginatedData
    },
    [SET_ROLE_DETAIL_MUTATION]: (state, role) => {
        state.role = role
    },
    [SET_ROLE_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_ROLES_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_ROLE_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_ROLES_MUTATION]: (state, role) => {
        // state.roles.unshift(role)
        state.roles.push(role)
        state.createdData = role;
    },
    [SET_ROLE_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_ROLE_MUTATION]: (state, role) => {
        //state.roles.unshift(role);
        state.roles = state.roles.map(x => (x.id === role.id ? {...x, name: role.name} : x));
        state.updatedData = role;
    },
    [SET_ROLE_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_ROLE_ADD_INPUT_MUTATION]: (state, e) => {
        let role = state.newRole;
        role[e.target.name] = e.target.value;
        state.newRole = role
    },
    [SET_ROLE_DETAIL_INPUT_MUTATION]: (state, e) => {
        let role = state.role;
        role[e.target.name] = e.target.value;
        state.role = role
    },
    [SET_ROLE_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },
    onSuccessEmptyNewRole(state) {
        state.newRole = null;
    },
    setRoleDepartmentsInputMutation: (state, departments) => {
        state.newRole.departments = departments
    },
    setRoleDepartmentsUpdateMutation: (state, departments) => {
        state.role.departments = departments
    },
    setRolePermissionsUpdateMutation: (state, permissions) => {
        state.role.permissions = permissions
    },
    setRolesForDepartments: (state, roles) => {
        state.rolesForDepartments = roles;
    },

    setRolesForDepartmentsNullMutation: (state) => {
        state.rolesForDepartments = [];
    },

    setRoleForDepartments: (state, role) => {
        state.roleByNameForDepartments = role;
    },
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}