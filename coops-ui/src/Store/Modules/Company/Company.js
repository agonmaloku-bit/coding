import CompanyDataService from "../../../Services/CompanyDataService";
import {
    COMPANY_LIST_GETTER,
    COMPANIES_PAGINATED_DATA_GETTER,
    COMPANY_GETTER,
    NEW_COMPANY_GETTER,
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

    FETCH_ALL_COMPANIES_ACTION,
    FETCH_DETAIL_COMPANY_ACTION,
    STORE_COMPANY_ACTION,
    UPDATE_COMPANY_ACTION,
    DELETE_COMPANY_ACTION,
    ADD_COMPANY_INPUT_ACTION,
    UPDATE_COMPANY_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_COMPANIES_MUTATION,
    SAVE_UPDATED_COMPANY_MUTATION,
    SET_COMPANY_ADD_INPUT_MUTATION,
    SET_COMPANY_ARE_LOADING_MUTATION,
    SET_COMPANY_DETAIL_INPUT_MUTATION,
    SET_COMPANY_DETAIL_MUTATION,
    SET_COMPANY_IS_CREATING_MUTATION,
    SET_COMPANY_IS_DELETING_MUTATION,
    SET_COMPANY_IS_LOADING_MUTATION,
    SET_COMPANY_IS_UPDATING_MUTATION,
    SET_COMPANIES_LOADED_MUTATION,
    SET_COMPANIES_MUTATION,
    SET_COMPANIES_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    companies: [],
    companiesPaginatedData: null,
    company: null,
    newCompany: { name: null, business_no: null, address: null },
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
    [COMPANY_LIST_GETTER]: state => state.companies,
    [COMPANIES_PAGINATED_DATA_GETTER]: state => state.companiesPaginatedData,
    [COMPANY_GETTER]: state => state.company,
    [NEW_COMPANY_GETTER]: state => state.newCompany,
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
    async [FETCH_ALL_COMPANIES_ACTION] ({ commit }, query = null) {
        commit(SET_COMPANY_ARE_LOADING_MUTATION, true);
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
            await CompanyDataService.getAll(url)
                .then(res => {
                    const companies = res.data.data;
                    commit(SET_COMPANIES_MUTATION, companies);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_COMPANIES_PAGINATED_MUTATION, res.data);
                    commit(SET_COMPANY_ARE_LOADING_MUTATION, false);
                    commit(SET_COMPANIES_LOADED_MUTATION, true);
                }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data);
                commit(SET_COMPANY_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_COMPANY_ACTION] ({ commit }, id) {
        commit(SET_COMPANY_IS_LOADING_MUTATION, true);
        CompanyDataService.get(id)
            .then(res => {
                commit(SET_COMPANY_DETAIL_MUTATION, res.data.data);
                commit(SET_COMPANY_IS_LOADING_MUTATION, false);
            }).catch(err => {
                console.log('error', err);
                commit(SET_COMPANY_IS_LOADING_MUTATION, false);
            });
    },

    async [STORE_COMPANY_ACTION] ({ commit, dispatch }, company) {
        commit(SET_COMPANY_IS_CREATING_MUTATION, true);
        CompanyDataService.create(company)
            .then(res => {
                dispatch(FETCH_ALL_COMPANIES_ACTION, { query: { page: 1 } });
                commit(SAVE_NEW_COMPANIES_MUTATION, res.data.data);
                commit(SET_COMPANY_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
                commit("setNewCompanyInputNull");
            }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_COMPANY_IS_CREATING_MUTATION, false);
            });
    },

    async [UPDATE_COMPANY_ACTION] ({ commit, dispatch },company) {
        commit(SET_COMPANY_IS_UPDATING_MUTATION, true);
        const id = company instanceof FormData ? company.get('id') : company.id;
        const data = company instanceof FormData ? company : company;

        CompanyDataService.update(id, data)
            .then(() => {
                dispatch(FETCH_ALL_COMPANIES_ACTION, { query: { page: 1 } });
                commit(SAVE_UPDATED_COMPANY_MUTATION, company instanceof FormData ? { id } : company);
                commit(SET_COMPANY_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                // console.log(err.response.data);
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_COMPANY_IS_UPDATING_MUTATION, false);
            });
    },

    async [DELETE_COMPANY_ACTION] ({ commit, dispatch }, id) {
        commit(SET_COMPANY_IS_DELETING_MUTATION, true);
        CompanyDataService.delete(id)
            .then(() => {
                commit(SET_COMPANY_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_COMPANIES_ACTION, { query: { page: 1 } });
            }).catch(err => {
                console.log('error', err);
                commit(SET_COMPANY_IS_DELETING_MUTATION, false);
            });
    },

    [ADD_COMPANY_INPUT_ACTION] ({ commit }, e) {
        commit(SET_COMPANY_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_COMPANY_INPUT_ACTION] ({ commit }, e) {
        commit(SET_COMPANY_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION] ({ commit }, e) {
        commit(SET_ERRORS_MUTATION, e);
    }
}


const mutations = {
    [SET_COMPANIES_MUTATION]: (state, companies) => {
        state.companies = companies
    },
    [SET_COMPANIES_PAGINATED_MUTATION]: (state, companiesPaginatedData) => {
        state.companiesPaginatedData = companiesPaginatedData
    },
    [SET_COMPANY_DETAIL_MUTATION]: (state, company) => {
        state.company = company
    },
    [SET_COMPANY_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_COMPANIES_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_COMPANY_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_COMPANIES_MUTATION]: (state, company) => {
        // state.companies.unshift(company)
        //state.companies.push(company)
        state.createdData = company;
    },
    [SET_COMPANY_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_COMPANY_MUTATION]: (state, company) => {
        //state.companies.unshift(company);
        state.companies = state.companies.map(x => (x.id === company.id ? { ...x, name: company.name } : x));
        state.updatedData = company;
    },
    [SET_COMPANY_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_COMPANY_ADD_INPUT_MUTATION]: (state, e) => {
        let company = state.newCompany;
        company[e.target.name] = e.target.value;
        state.newCompany = company
    },
    [SET_COMPANY_DETAIL_INPUT_MUTATION]: (state, e) => {
        let company = state.company;
        company[e.target.name+"New"] = e.target.value;
        state.company = company
    },
    [SET_COMPANY_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },
    setNewCompanyInputNull (state) {
        state.newCompany['name'] = null
        state.newCompany['business_no'] = null
        state.newCompany['address'] = null
    }
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}