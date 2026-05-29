import ContractTypeDataService from "../../../Services/ContractTypeDataService";
import {
    CONTRACT_TYPE_LIST_GETTER,
    CONTRACT_TYPES_PAGINATED_DATA_GETTER,
    CONTRACT_TYPE_GETTER,
    NEW_CONTRACT_TYPE_GETTER,
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

    FETCH_ALL_CONTRACT_TYPES_ACTION,
    FETCH_DETAIL_CONTRACT_TYPE_ACTION,
    STORE_CONTRACT_TYPE_ACTION,
    UPDATE_CONTRACT_TYPE_ACTION,
    DELETE_CONTRACT_TYPE_ACTION,
    ADD_CONTRACT_TYPE_INPUT_ACTION,
    UPDATE_CONTRACT_TYPE_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_CONTRACT_TYPES_MUTATION,
    SAVE_UPDATED_CONTRACT_TYPE_MUTATION,
    SET_CONTRACT_TYPE_ADD_INPUT_MUTATION,
    SET_CONTRACT_TYPE_ARE_LOADING_MUTATION,
    SET_CONTRACT_TYPE_DETAIL_INPUT_MUTATION,
    SET_CONTRACT_TYPE_DETAIL_MUTATION,
    SET_CONTRACT_TYPE_IS_CREATING_MUTATION,
    SET_CONTRACT_TYPE_IS_DELETING_MUTATION,
    SET_CONTRACT_TYPE_IS_LOADING_MUTATION,
    SET_CONTRACT_TYPE_IS_UPDATING_MUTATION,
    SET_CONTRACT_TYPES_LOADED_MUTATION,
    SET_CONTRACT_TYPES_MUTATION,
    SET_CONTRACT_TYPES_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    contract_types: [],
    contract_typesPaginatedData: null,
    contract_type: null,
    newContractType: { name: null, company: null },
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
    [CONTRACT_TYPE_LIST_GETTER]: state => state.contract_types,
    [CONTRACT_TYPES_PAGINATED_DATA_GETTER]: state => state.contract_typesPaginatedData,
    [CONTRACT_TYPE_GETTER]: state => state.contract_type,
    [NEW_CONTRACT_TYPE_GETTER]: state => state.newContractType,
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
    async [FETCH_ALL_CONTRACT_TYPES_ACTION] ({ commit }, query = null) {
        commit(SET_CONTRACT_TYPE_ARE_LOADING_MUTATION, true);
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
            ContractTypeDataService.getAll(url)
                .then(res => {
                    const contract_types = res.data.data;
                    commit(SET_CONTRACT_TYPES_MUTATION, contract_types);
                    const pagination = {
                        total: res.data.total,
                        per_page: res.data.per_page,
                        current_page: res.data.current_page,
                        total_pages: res.data.last_page
                    }
                    res.data.pagination = pagination;
                    commit(SET_CONTRACT_TYPES_PAGINATED_MUTATION, res.data);
                    commit(SET_CONTRACT_TYPE_ARE_LOADING_MUTATION, false);
                    commit(SET_CONTRACT_TYPES_LOADED_MUTATION, true);
                }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data);
                commit(SET_CONTRACT_TYPE_ARE_LOADING_MUTATION, false);
            });
        }
    },

    async [FETCH_DETAIL_CONTRACT_TYPE_ACTION] ({ commit }, id) {
        commit(SET_CONTRACT_TYPE_IS_LOADING_MUTATION, true);
        ContractTypeDataService.get(id)
            .then(res => {
                commit(SET_CONTRACT_TYPE_DETAIL_MUTATION, res.data.data);
                commit(SET_CONTRACT_TYPE_IS_LOADING_MUTATION, false);
            }).catch(err => {
                console.log('error', err);
                commit(SET_CONTRACT_TYPE_IS_LOADING_MUTATION, false);
            });
    },

    async [STORE_CONTRACT_TYPE_ACTION] ({ commit, dispatch }, contract_type) {
        commit(SET_CONTRACT_TYPE_IS_CREATING_MUTATION, true);
        ContractTypeDataService.create(contract_type)
            .then(res => {
                dispatch(FETCH_ALL_CONTRACT_TYPES_ACTION, { query: { page: 1 } });
                commit(SAVE_NEW_CONTRACT_TYPES_MUTATION, res.data.data);
                commit(SET_CONTRACT_TYPE_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
                commit("setNewContractTypeInputNull")
            }).catch(err => {
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_CONTRACT_TYPE_IS_CREATING_MUTATION, false);
            });
    },

    async [UPDATE_CONTRACT_TYPE_ACTION] ({ commit, dispatch },contract_type) {
        commit(SET_CONTRACT_TYPE_IS_UPDATING_MUTATION, true);

        ContractTypeDataService.update(contract_type.id, contract_type)
            .then(() => {
                dispatch(FETCH_ALL_CONTRACT_TYPES_ACTION, { query: { page: 1 } });
                // commit(SAVE_UPDATED_CONTRACT_TYPE_MUTATION, res.data.data);
                commit(SAVE_UPDATED_CONTRACT_TYPE_MUTATION, contract_type);
                commit(SET_CONTRACT_TYPE_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
                // console.log(err.response.data);
                commit(SET_ERRORS_MUTATION, err.response.data.errors);
                commit(SET_CONTRACT_TYPE_IS_UPDATING_MUTATION, false);
            });
    },

    async [DELETE_CONTRACT_TYPE_ACTION] ({ commit, dispatch }, id) {
        commit(SET_CONTRACT_TYPE_IS_DELETING_MUTATION, true);
        ContractTypeDataService.delete(id)
            .then(() => {
                commit(SET_CONTRACT_TYPE_IS_DELETING_MUTATION, false);
                dispatch(FETCH_ALL_CONTRACT_TYPES_ACTION, { query: { page: 1 } });
            }).catch(err => {
                console.log('error', err);
                commit(SET_CONTRACT_TYPE_IS_DELETING_MUTATION, false);
            });
    },

    [ADD_CONTRACT_TYPE_INPUT_ACTION] ({ commit }, e) {
        commit(SET_CONTRACT_TYPE_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_CONTRACT_TYPE_INPUT_ACTION] ({ commit }, e) {
        commit(SET_CONTRACT_TYPE_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION] ({ commit }, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addCompanyForContractTypeAction({ commit }, company) {
        commit("setCompanyForContractTypeInputMutation", company);
    },
    editCompanyForContractTypeAction({ commit }, company) {
        commit("updateCompanyForContractTypeInputMutation", company);
    }
}


const mutations = {
    [SET_CONTRACT_TYPES_MUTATION]: (state, contract_types) => {
        state.contract_types = contract_types
    },
    [SET_CONTRACT_TYPES_PAGINATED_MUTATION]: (state, contract_typesPaginatedData) => {
        state.contract_typesPaginatedData = contract_typesPaginatedData
    },
    [SET_CONTRACT_TYPE_DETAIL_MUTATION]: (state, contract_type) => {
        state.contract_type = contract_type
    },
    [SET_CONTRACT_TYPE_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_CONTRACT_TYPES_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_CONTRACT_TYPE_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_CONTRACT_TYPES_MUTATION]: (state, contract_type) => {
        // state.contract_types.unshift(contract_type)
        state.contract_types.push(contract_type)
        state.createdData = contract_type;
    },
    [SET_CONTRACT_TYPE_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_CONTRACT_TYPE_MUTATION]: (state, contract_type) => {
        //state.contract_types.unshift(contract_type);
        state.contract_types = state.contract_types.map(x => (x.id === contract_type.id ? { ...x, name: contract_type.name } : x));
        state.updatedData = contract_type;
    },
    [SET_CONTRACT_TYPE_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_CONTRACT_TYPE_ADD_INPUT_MUTATION]: (state, e) => {
        let contract_type = state.newContractType;
        contract_type[e.target.name] = e.target.value;
        state.newContractType = contract_type
    },
    [SET_CONTRACT_TYPE_DETAIL_INPUT_MUTATION]: (state, e) => {
        let contract_type = state.contract_type;
        contract_type[e.target.name+"New"] = e.target.value;
        state.contract_type = contract_type
    },
    [SET_CONTRACT_TYPE_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },
    setNewContractTypeInputNull (state) {
        state.newContractType['name'] = null
        state.newContractType['company'] = null
    },
    setCompanyForContractTypeInputMutation: (state, company) => {
        state.newContractType.company = company
    },
    updateCompanyForContractTypeInputMutation: (state, company) => {
        state.contract_type.company = company
    }
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}