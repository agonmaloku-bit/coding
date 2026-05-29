import DepartmentDataService from "../../../Services/DepartmentDataService";
import {
    DEPARTMENT_LIST_GETTER,
    DEPARTMENTS_PAGINATED_DATA_GETTER,
    DEPARTMENT_GETTER,
    NEW_DEPARTMENT_GETTER,
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

    FETCH_ALL_DEPARTMENTS_ACTION,
    FETCH_DETAIL_DEPARTMENT_ACTION,
    STORE_DEPARTMENT_ACTION,
    UPDATE_DEPARTMENT_ACTION,
    DELETE_DEPARTMENT_ACTION,
    ADD_DEPARTMENT_INPUT_ACTION,
    UPDATE_DEPARTMENT_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_DEPARTMENTS_MUTATION,
    SAVE_UPDATED_DEPARTMENT_MUTATION,
    SET_DEPARTMENT_ADD_INPUT_MUTATION,
    SET_DEPARTMENT_ARE_LOADING_MUTATION,
    SET_DEPARTMENT_DETAIL_INPUT_MUTATION,
    SET_DEPARTMENT_DETAIL_MUTATION,
    SET_DEPARTMENT_IS_CREATING_MUTATION,
    SET_DEPARTMENT_IS_DELETING_MUTATION,
    SET_DEPARTMENT_IS_LOADING_MUTATION,
    SET_DEPARTMENT_IS_UPDATING_MUTATION,
    SET_DEPARTMENTS_LOADED_MUTATION,
    SET_DEPARTMENTS_MUTATION,
    SET_DEPARTMENTS_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    departments: [],
    departmentsPaginatedData: null,
    department: null,
    newDepartment: {name: null},
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
    countDepartments: null,
});


const getters = {
    [DEPARTMENT_LIST_GETTER]: state => state.departments,
    [DEPARTMENTS_PAGINATED_DATA_GETTER]: state => state.departmentsPaginatedData,
    [DEPARTMENT_GETTER]: state => state.department,
    [NEW_DEPARTMENT_GETTER]: state => state.newDepartment,
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
    countDepartments: state => state.countDepartments,
};


const actions = {
    async [FETCH_ALL_DEPARTMENTS_ACTION]({commit}, query = null) {
        commit(SET_DEPARTMENT_ARE_LOADING_MUTATION, true);
        let url = null;
        if (query === null) {
            url = null;
        } else {
            url = `?page=${query.page}`;
        }
        let user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            DepartmentDataService.getAll(url)
                .then(res => {
                    const departments = res.data.data;
                    commit(SET_DEPARTMENTS_MUTATION, departments);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_DEPARTMENTS_PAGINATED_MUTATION, res.data);
                    commit(SET_DEPARTMENT_ARE_LOADING_MUTATION, false);
                    commit(SET_DEPARTMENTS_LOADED_MUTATION, true);
                }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data);
                commit(SET_DEPARTMENT_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_DEPARTMENT_ACTION]({commit}, id) {
        commit(SET_DEPARTMENT_IS_LOADING_MUTATION, true);
        DepartmentDataService.get(id)
            .then(res => {
                commit(SET_DEPARTMENT_DETAIL_MUTATION, res.data.data);
                commit(SET_DEPARTMENT_IS_LOADING_MUTATION, false);
            }).catch(err => {
            console.log('error', err);
            commit(SET_DEPARTMENT_IS_LOADING_MUTATION, false);
        });
    },

    async [STORE_DEPARTMENT_ACTION]({commit, dispatch}, department) {
        commit(SET_DEPARTMENT_IS_CREATING_MUTATION, true);
        DepartmentDataService.create(department)
            .then(res => {
                dispatch(FETCH_ALL_DEPARTMENTS_ACTION, {query: {page: 1}});
                commit(SAVE_NEW_DEPARTMENTS_MUTATION, res.data.data);
                commit(SET_DEPARTMENT_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
                commit("setNewDepartmentInputNull");
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_DEPARTMENT_IS_CREATING_MUTATION, false);
        });
    },

    async [UPDATE_DEPARTMENT_ACTION]({commit, dispatch}, department) {
        commit(SET_DEPARTMENT_IS_UPDATING_MUTATION, true);

        DepartmentDataService.update(department.id, department)
            .then(() => {
                dispatch(FETCH_ALL_DEPARTMENTS_ACTION, {query: {page: 1}});
                // commit(SAVE_UPDATED_DEPARTMENT_MUTATION, res.data.data);
                commit(SAVE_UPDATED_DEPARTMENT_MUTATION, department);
                commit(SET_DEPARTMENT_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
            // console.log(err.response.data);
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_DEPARTMENT_IS_UPDATING_MUTATION, false);
        });
    },

    async [DELETE_DEPARTMENT_ACTION]({commit, dispatch}, id) {
        commit(SET_DEPARTMENT_IS_DELETING_MUTATION, true);
        DepartmentDataService.delete(id)
            .then(() => {
                commit(SET_DEPARTMENT_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_DEPARTMENTS_ACTION, {query: {page: 1}});
            }).catch(err => {
            console.log('error', err);
            commit(SET_DEPARTMENT_IS_DELETING_MUTATION, false);
        });
    },

    async getCountDepartments({commit}) {
        DepartmentDataService.count()
            .then(res => {
                commit("setCountDepartments", res.data.data.count);
            }).catch(() => {
            //console.log('error', err);
        });
    },

    async getDepartmentByCompanyId({commit}, id) {
        commit(SET_DEPARTMENT_ARE_LOADING_MUTATION, true);
        DepartmentDataService.getDepartmentByCompanyId(id)
            .then(res => {
                const departments = res.data.data;
                commit(SET_DEPARTMENTS_MUTATION, departments);
                commit(SET_DEPARTMENT_ARE_LOADING_MUTATION, false);
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data);
            commit(SET_DEPARTMENT_ARE_LOADING_MUTATION, false);
        });
    },

    [ADD_DEPARTMENT_INPUT_ACTION]({commit}, e) {
        commit(SET_DEPARTMENT_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_DEPARTMENT_INPUT_ACTION]({commit}, e) {
        commit(SET_DEPARTMENT_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION]({commit}, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addCompanyForDepartmentAction({commit}, company) {
        commit("setCompanyForDepartmentInputMutation", company);
    },
    editCompanyForDepartmentAction({commit}, company) {
        commit("updateCompanyForDepartmentInputMutation", company);
    },
}


const mutations = {
    [SET_DEPARTMENTS_MUTATION]: (state, departments) => {
        state.departments = departments
    },
    [SET_DEPARTMENTS_PAGINATED_MUTATION]: (state, departmentsPaginatedData) => {
        state.departmentsPaginatedData = departmentsPaginatedData
    },
    [SET_DEPARTMENT_DETAIL_MUTATION]: (state, department) => {
        state.department = department
    },
    [SET_DEPARTMENT_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_DEPARTMENTS_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_DEPARTMENT_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_DEPARTMENTS_MUTATION]: (state, department) => {
        // state.departments.unshift(department)
        state.departments.push(department)
        state.createdData = department;
    },
    [SET_DEPARTMENT_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_DEPARTMENT_MUTATION]: (state, department) => {
        //state.departments.unshift(department);
        state.departments = state.departments.map(x => (x.id === department.id ? {...x, name: department.name} : x));
        state.updatedData = department;
    },
    [SET_DEPARTMENT_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_DEPARTMENT_ADD_INPUT_MUTATION]: (state, e) => {
        let department = state.newDepartment;
        department[e.target.name] = e.target.value;
        state.newDepartment = department
    },
    [SET_DEPARTMENT_DETAIL_INPUT_MUTATION]: (state, e) => {
        let department = state.department;
        department[e.target.name+"New"] = e.target.value;
        state.department = department
    },
    [SET_DEPARTMENT_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },
    setCountDepartments(state, count) {
        state.countDepartments = count;
    },
    setCompanyForDepartmentInputMutation: (state, company) => {
        state.newDepartment.company = company
    },
    updateCompanyForDepartmentInputMutation: (state, company) => {
        state.department.company = company
    },
    setNewDepartmentInputNull (state) {
        let dep = state.newDepartment
        dep['name'] = null
        dep['company'] = null
    }
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}