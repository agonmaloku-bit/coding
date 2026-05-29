import ContractDataService from "../../../Services/ContractDataService";
import {
    CONTRACT_LIST_GETTER,
    CONTRACTS_PAGINATED_DATA_GETTER,
    CONTRACT_GETTER,
    NEW_CONTRACT_GETTER,
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

    FETCH_ALL_CONTRACTS_ACTION,
    FETCH_DETAIL_CONTRACT_ACTION,
    STORE_CONTRACT_ACTION,
    UPDATE_CONTRACT_ACTION,
    DELETE_CONTRACT_ACTION,
    ADD_CONTRACT_INPUT_ACTION,
    UPDATE_CONTRACT_INPUT_ACTION,
    SET_ERRORS_ACTION,

    SAVE_NEW_CONTRACTS_MUTATION,
    SAVE_UPDATED_CONTRACT_MUTATION,
    SET_CONTRACT_ADD_INPUT_MUTATION,
    SET_CONTRACT_ARE_LOADING_MUTATION,
    SET_CONTRACT_DETAIL_INPUT_MUTATION,
    SET_CONTRACT_DETAIL_MUTATION,
    SET_CONTRACT_IS_CREATING_MUTATION,
    SET_CONTRACT_IS_DELETING_MUTATION,
    SET_CONTRACT_IS_LOADING_MUTATION,
    SET_CONTRACT_IS_UPDATING_MUTATION,
    SET_CONTRACTS_LOADED_MUTATION,
    SET_CONTRACTS_MUTATION,
    SET_CONTRACTS_PAGINATED_MUTATION,
    SET_ERRORS_MUTATION
} from "./constants";

const state = () => ({
    contracts: [],
    contractsPaginatedData: null,
    contract: null,
    newContract: {name: null},
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
    countContracts: null,
    contractApprove: false,
    contractCancel: false,
});


const getters = {
    [CONTRACT_LIST_GETTER]: state => state.contracts,
    [CONTRACTS_PAGINATED_DATA_GETTER]: state => state.contractsPaginatedData,
    [CONTRACT_GETTER]: state => state.contract,
    [NEW_CONTRACT_GETTER]: state => state.newContract,
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
    countContracts: state => state.countContracts,
    contractApprove: state => state.contractApprove,
    contractCancel: state => state.contractCancel,
};


const actions = {
    async [FETCH_ALL_CONTRACTS_ACTION]({commit}, query = null) {
        commit(SET_CONTRACT_ARE_LOADING_MUTATION, true);
        let url = null;
        if (query.page !== null) {
            url = `?page=${query.page}`;
        }
        if (query.search.text != null && query.search.text != "") {
            url = url + `&search_text=${query.search.text}`
        }
        if (query.search) {
            url = url + `&search_status=${query.search.status.id}&search_order=${query.search.orderBy.id}&search_sort=${query.search.sort}`
        }
        if (query.search.start_date != null) {
            url = url + `&start_date=${query.search.start_date}`
        }
        if (query.search.end_date != null) {
            url = url + `&end_date=${query.search.end_date}`
        }
        if (query.search.company !== null) {
            url = url + `&company=${query.search.company.id}`
        }
        if (query.search.department !== null) {
            url = url + `&department=${query.search.department.id}`
        }
        if (query.search.procurement_officer !== null) {
            url = url + `&procurement_officer=${query.search.procurement_officer.id}`
        }
        if (query.search.responsible_person !== null) {
            url = url + `&responsible_person=${query.search.responsible_person.id}`
        }
        await ContractDataService.getArchive(url)
            .then(res => {
                const contracts = res.data.data;
                commit(SET_CONTRACTS_MUTATION, contracts);
                const pagination = {
                    total: res.data.total,
                    per_page: res.data.per_page,
                    current_page: res.data.current_page,
                    total_pages: res.data.last_page
                }
                res.data.pagination = pagination;
                commit(SET_CONTRACTS_PAGINATED_MUTATION, res.data);
                commit(SET_CONTRACT_ARE_LOADING_MUTATION, false);
                commit(SET_CONTRACTS_LOADED_MUTATION, true);
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data);
            commit(SET_CONTRACT_ARE_LOADING_MUTATION, false);
        });
    },

    async [FETCH_DETAIL_CONTRACT_ACTION]({commit}, id) {
        commit(SET_CONTRACT_IS_LOADING_MUTATION, true);
        await ContractDataService.get(id)
            .then(res => {
                commit(SET_CONTRACT_DETAIL_MUTATION, res.data.data);
                commit(SET_CONTRACT_IS_LOADING_MUTATION, false);
            }).catch(err => {
                console.log('error', err);
                commit(SET_CONTRACT_IS_LOADING_MUTATION, false);
            });
    },

    async [STORE_CONTRACT_ACTION]({commit}, contract) {
        commit(SET_CONTRACT_IS_CREATING_MUTATION, true);
        ContractDataService.create(contract)
            .then(res => {
                // dispatch(FETCH_ALL_CONTRACTS_ACTION, {query: {page: 1}});
                commit(SAVE_NEW_CONTRACTS_MUTATION, res.data.data);
                commit(SET_CONTRACT_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
                commit("setNewContractInputNull")
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_CONTRACT_IS_CREATING_MUTATION, false);
        });
    },

    async requestContractAction({commit}, contract) {
        commit(SET_CONTRACT_IS_CREATING_MUTATION, true);
        ContractDataService.request(contract)
            .then(res => {
                // dispatch(FETCH_ALL_CONTRACTS_ACTION, {query: {page: 1}});
                commit(SAVE_NEW_CONTRACTS_MUTATION, res.data.data);
                commit(SET_CONTRACT_IS_CREATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
                commit("setNewContractInputNull")
            }).catch(err => {
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_CONTRACT_IS_CREATING_MUTATION, false);
        });
    },

    async [UPDATE_CONTRACT_ACTION]({commit}, contract) {
        commit(SET_CONTRACT_IS_UPDATING_MUTATION, true);

        ContractDataService.update(contract.get('id'), contract)
            .then(() => {
                // dispatch(FETCH_ALL_CONTRACTS_ACTION, {query: {page: 1}});
                // commit(SAVE_UPDATED_CONTRACT_MUTATION, res.data.data);
                commit(SAVE_UPDATED_CONTRACT_MUTATION, contract);
                commit(SET_CONTRACT_IS_UPDATING_MUTATION, false);
                commit(SET_ERRORS_MUTATION, null);
            }).catch(err => {
            // console.log(err.response.data);
            commit(SET_ERRORS_MUTATION, err.response.data.errors);
            commit(SET_CONTRACT_IS_UPDATING_MUTATION, false);
        });
    },

    async [DELETE_CONTRACT_ACTION]({commit}, id) {
        commit(SET_CONTRACT_IS_DELETING_MUTATION, true);
        ContractDataService.delete(id)
            .then(() => {
                commit(SET_CONTRACT_IS_DELETING_MUTATION, false);
                // dispatch(FETCH_ALL_CONTRACTS_ACTION, {query: {page: 1}});
            }).catch(err => {
            console.log('error', err);
            commit(SET_CONTRACT_IS_DELETING_MUTATION, false);
        });
    },

    async getContractAttachments({commit}, file) {
        commit(SET_CONTRACT_IS_LOADING_MUTATION, true);
        commit(SET_CONTRACT_IS_LOADING_MUTATION, false);
        ContractDataService.attachment(file.file_id).then(response => {
            const type = response.headers['content-type'];
            const blob = new Blob([response.data], {type: type});
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = file.file_name || `${file.file_id}.${file.file_extension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(link.href);
        });
    },

    async exportContractsToExcel({commit}, query) {
        commit(SET_CONTRACT_IS_LOADING_MUTATION, true);
        commit(SET_CONTRACT_IS_LOADING_MUTATION, false);
        let url = null;
        if (query.page !== null) {
            url = `?page=${query.page}`;
        }
        if (query.search.text != null && query.search.text != "") {
            url = url + `&search_text=${query.search.text}`
        }
        if (query.search) {
            url = url + `&search_status=${query.search.status.id}&search_order=${query.search.orderBy.id}&search_sort=${query.search.sort}`
        }
        if (query.search.start_date != null) {
            url = url + `&start_date=${query.search.start_date}`
        }
        if (query.search.end_date != null) {
            url = url + `&end_date=${query.search.end_date}`
        }
        if (query.search.company !== null) {
            url = url + `&company=${query.search.company.id}`
        }
        if (query.search.department !== null) {
            url = url + `&department=${query.search.department.id}`
        }
        if (query.search.procurement_officer !== null) {
            url = url + `&procurement_officer=${query.search.procurement_officer.id}`
        }
        if (query.search.responsible_person !== null) {
            url = url + `&responsible_person=${query.search.responsible_person.id}`
        }
        if(query.search.contract_type !== null && query.search.contract_type !== undefined){
            url = url + `&contract_type=${query.search.contract_type.id}`
        }
        ContractDataService.excel(url).then(response => {
            const type = response.headers['content-type'];
            const blob = new Blob([response.data], {type: type, encoding: 'UTF-8'});
            window.open(window.URL.createObjectURL(blob));
        });
    },

    async getCountContracts({commit}) {
        ContractDataService.count()
            .then(res => {
                commit("setCountContracts", res.data.data.count);
            }).catch(() => {
            //console.log('error', err);
        });
    },

    async approveContract({commit}, contract) {
        ContractDataService.approve(contract.id, contract.comment)
            .then(res => {
                let result = res.data.data.success;
                if (result === true) {
                    commit("contractApproveResponse", "success");
                    // dispatch(FETCH_ALL_CONTRACTS_ACTION, {query: {page: 1}});
                }
                if (result === false) {
                    commit("contractApproveResponse", "error");
                }
            }).catch(() => {
        });
    },
    async cancelContract({commit}, contract) {
        ContractDataService.cancel(contract.id, contract.comment)
            .then(res => {
                let result = res.data.data.success;
                if (result === true) {
                    commit("contractCancelResponse", "success");
                }
                if (result === false) {
                    commit("contractCancelResponse", "error");
                }
            }).catch(() => {
        });
    },

    resetContractApprove({commit}) {
        commit("contractApproveResponse", false);
    },

    resetContractCancel({commit}) {
        commit("contractCancelResponse", false);
    },

    [ADD_CONTRACT_INPUT_ACTION]({commit}, e) {
        commit(SET_CONTRACT_ADD_INPUT_MUTATION, e);
    },

    [UPDATE_CONTRACT_INPUT_ACTION]({commit}, e) {
        commit(SET_CONTRACT_DETAIL_INPUT_MUTATION, e);
    },

    [SET_ERRORS_ACTION]({commit}, e) {
        commit(SET_ERRORS_MUTATION, e);
    },

    addStepForContractAction({commit}, step) {
        commit("setStepForContractInputMutation", step);
    },
    addContractTypeForContractAction({commit}, contract_type) {
        commit("setContractTypeForContractInputMutation", contract_type);
    },
    addCompanyForContractAction({commit}, company) {
        commit("setCompanyForContractInputMutation", company);
    },
    addDeadlineFromForContractAction({commit}, deadline_from) {
        commit("setDeadlineFromForContractInputMutation", deadline_from);
    },
    addDeadlineToForContractAction({commit}, deadline_to) {
        commit("setDeadlineToForContractInputMutation", deadline_to);
    },
    addResponsiblePersonForContractAction({commit}, responsible_person) {
        commit("setResponsiblePersonForContractInputMutation", responsible_person);
    },
    addTotalPriceForContractAction({commit}, value) {
        commit("setTotalPriceForContractInputMutation", value);
    },
    addUnitPriceForContractAction({commit}, value) {
        commit("setUnitPriceForContractInputMutation", value);
    },
    addPaymentDateForContractAction({commit}, payment_date) {
        commit("setPaymentDateForContractInputMutation", payment_date);
    },
    addDepartmentForContractAction({commit}, department) {
        commit("setDepartmentContractInputMutation", department);
    },

    editStatusForContractAction({commit}, step) {
        commit("updateStatusForContractInputMutation", step);
    },
    editStepForContractAction({commit}, step) {
        commit("updateStepForContractInputMutation", step);
    },
    editContractTypeForContractAction({commit}, contract_type) {
        commit("updateContractTypeForContractInputMutation", contract_type);
    },
    editCompanyForContractAction({commit}, company) {
        commit("updateCompanyForContractInputMutation", company);
    },
    editDeadlineFromForContractAction({commit}, deadline_from) {
        commit("updateDeadlineFromForContractInputMutation", deadline_from);
    },
    editDeadlineToForContractAction({commit}, deadline_to) {
        commit("updateDeadlineToForContractInputMutation", deadline_to);
    },
    editResponsiblePersonForContractAction({commit}, responsible_person) {
        commit("updateResponsiblePersonForContractInputMutation", responsible_person);
    },
    editTotalPriceForContractAction({commit}, value) {
        commit("updateTotalPriceForContractInputMutation", value);
    },
    editUnitPriceForContractAction({commit}, value) {
        commit("updateUnitPriceForContractInputMutation", value);
    },
    editPaymentDateForContractAction({commit}, payment_date) {
        commit("updatePaymentDateForContractInputMutation", payment_date);
    },
    editDepartmentForContractAction({commit}, department) {
        commit("updateDepartmentContractInputMutation", department);
    },

    updateContractFilesToDelete({commit}, file) {
        commit("editContractFilesToDelete", file);
    },
    updateContractFilesToRestore({commit}, file) {
        commit("editContractFilesToRestore", file);
    },
    updateContractFilesFromRestoreToDelete({commit}, file) {
        commit("editContractFilesFromRestoreToDelete", file);
    },
    updateContractFilesToRestoreFromDeleted({commit}, file) {
        commit("editContractFilesToRestoreFromDeleted", file);
    },
    updateContractFilesToDeletePermanent({commit}, file) {
        commit("editContractFilesToDeletePermanent", file);
    },
    setDepartmentForCompanyNullAction({commit}) {
        commit("setDepartmentForCompanyNullMutation");
    },
    setDepartmentForCompanyEditNullAction({commit}) {
        commit("setDepartmentForCompanyEditNullMutation");
    },
}


const mutations = {
    [SET_CONTRACTS_MUTATION]: (state, contracts) => {
        state.contracts = contracts
    },
    [SET_CONTRACTS_PAGINATED_MUTATION]: (state, contractsPaginatedData) => {
        state.contractsPaginatedData = contractsPaginatedData
    },
    [SET_CONTRACT_DETAIL_MUTATION]: (state, contract) => {
        state.contract = contract
    },
    [SET_CONTRACT_ARE_LOADING_MUTATION](state, isLoading) {
        state.isLoadingAll = isLoading
    },
    [SET_CONTRACTS_LOADED_MUTATION](state, loaded) {
        state.firstTimeLoaded = loaded
    },
    [SET_CONTRACT_IS_LOADING_MUTATION](state, isLoading) {
        state.isLoading = isLoading
    },
    [SAVE_NEW_CONTRACTS_MUTATION]: (state, contract) => {
        // state.contracts.unshift(contract)
        state.contracts.push(contract)
        state.createdData = contract;
    },
    [SET_CONTRACT_IS_CREATING_MUTATION](state, isCreating) {
        state.isCreating = isCreating
    },
    [SAVE_UPDATED_CONTRACT_MUTATION]: (state, contract) => {
        //state.contracts.unshift(contract);
        state.contracts = state.contracts.map(x => (x.id === contract.id ? {...x, name: contract.name} : x));
        state.updatedData = contract;
    },
    [SET_CONTRACT_IS_UPDATING_MUTATION](state, isUpdating) {
        state.isUpdating = isUpdating
    },
    [SET_CONTRACT_ADD_INPUT_MUTATION]: (state, e) => {
        let contract = state.newContract;
        contract[e.target.name] = e.target.value;
        state.newContract = contract
    },
    [SET_CONTRACT_DETAIL_INPUT_MUTATION]: (state, e) => {
        let contract = state.contract;
        contract[e.target.name + "New"] = e.target.value;
        state.contract = contract
    },
    [SET_CONTRACT_IS_DELETING_MUTATION](state, isDeleting) {
        state.isDeleting = isDeleting
    },
    [SET_ERRORS_MUTATION](state, error) {
        state.errors = error
    },
    setCountContracts(state, count) {
        state.countContracts = count;
    },
    setStepForContractInputMutation: (state, step) => {
        state.newContract.step = step
    },
    setContractTypeForContractInputMutation: (state, contract_type) => {
        state.newContract.contract_type = contract_type
    },
    setCompanyForContractInputMutation: (state, company) => {
        state.newContract.company = company
    },
    setDeadlineFromForContractInputMutation: (state, deadline_from) => {
        state.newContract.deadline_from = deadline_from
    },
    setDeadlineToForContractInputMutation: (state, deadline_to) => {
        state.newContract.deadline_to = deadline_to
    },
    setResponsiblePersonForContractInputMutation: (state, responsible_person) => {
        state.newContract.responsible_person = responsible_person
    },
    setTotalPriceForContractInputMutation: (state, value) => {
        state.newContract.total_price = value
    },
    setUnitPriceForContractInputMutation: (state, value) => {
        state.newContract.unit_price = value
    },
    setPaymentDateForContractInputMutation: (state, payment_date) => {
        state.newContract.payment_date = payment_date
    },
    setDepartmentContractInputMutation: (state, department) => {
        state.newContract.department = department
    },
    updateStatusForContractInputMutation: (state, status) => {
        state.contract.status = status
    },
    updateStepForContractInputMutation: (state, step) => {
        state.contract.step = step
    },
    updateContractTypeForContractInputMutation: (state, contract_type) => {
        state.contract.contract_type = contract_type
    },
    updateCompanyForContractInputMutation: (state, company) => {
        state.contract.company = company
    },
    updateDeadlineFromForContractInputMutation: (state, deadline_from) => {
        state.contract.deadline_from = deadline_from
    },
    updateDeadlineToForContractInputMutation: (state, deadline_to) => {
        state.contract.deadline_to = deadline_to
    },
    updateResponsiblePersonForContractInputMutation: (state, responsible_person) => {
        state.contract.responsible_person = responsible_person
    },
    updateTotalPriceForContractInputMutation: (state, value) => {
        state.contract.total_price = value
    },
    updateUnitPriceForContractInputMutation: (state, value) => {
        state.contract.unit_price = value
    },
    updatePaymentDateForContractInputMutation: (state, payment_date) => {
        state.contract.payment_date = payment_date
    },
    updateDepartmentContractInputMutation: (state, department) => {
        state.contract.department = department
    },
    editContractFilesToDelete: (state, file) => {
        // let file = state.contract.files.filter( f => f.id === id);
        if (state.contract['files_deleted'] === undefined) {
            state.contract['files_deleted'] = [];
        }
        state.contract.files_deleted.push({
            id: file.id,
            file_id: file.file_id,
            file_extension: file.file_extension,
            file_path: file.file_path
        });
        state.contract.files = state.contract.files.filter(f => f.id !== file.id);
    },
    editContractFilesToRestore: (state, file) => {
        // let file = state.contract.files.filter( f => f.id === id);
        if (state.contract['files_restore'] === undefined) {
            state.contract['files_restore'] = [];
        }
        state.contract.files_restore.push({
            id: file.id,
            file_id: file.file_id,
            file_extension: file.file_extension,
            file_path: file.file_path
        });
        state.contract.files = state.contract.files.filter(f => f.id !== file.id);
    },
    editContractFilesFromRestoreToDelete: (state, file) => {
        if (state.contract['files_deleted'] === undefined) {
            state.contract['files_deleted'] = [];
        }
        state.contract.files_deleted.push({
            id: file.id,
            file_id: file.file_id,
            file_extension: file.file_extension,
            file_path: file.file_path,
        });
        state.contract.files_restore = state.contract.files_restore.filter(f => f.id !== file.id);
    },
    editContractFilesToRestoreFromDeleted: (state, file) => {
        if (state.contract['files_restore'] === undefined) {
            state.contract['files_restore'] = [];
        }
        state.contract.files_restore.push({
            id: file.id,
            file_id: file.file_id,
            file_extension: file.file_extension,
            file_path: file.file_path,
        });
        state.contract.files_deleted = state.contract.files_deleted.filter(f => f.id !== file.id);
    },
    editContractFilesToDeletePermanent: (state, file) => {
        if (state.contract['files_deleted_permanent'] === undefined) {
            state.contract['files_deleted_permanent'] = [];
        }
        state.contract.files_deleted_permanent.push({
            id: file.id,
            file_id: file.file_id,
            file_extension: file.file_extension,
            file_path: file.file_path,
        });
        if (state.contract.files_deleted !== undefined) {
            state.contract.files_deleted = state.contract.files_deleted.filter(f => f.id !== file.id);
        }
        if (state.contract.files !== null) {
            state.contract.files = state.contract.files.filter(f => f.id !== file.id);
        }
    },
    contractApproveResponse: (state, res) => {
        state.contractApprove = res
    },
    contractCancelResponse: (state, res) => {
        state.contractCancel = res
    },
    setDepartmentForCompanyNullMutation: (state) => {
        if (state.newContract.department !== undefined) {
            state.newContract.department = null
        }
    },
    setDepartmentForCompanyEditNullMutation: (state) => {
        if (state.contract.department !== undefined) {
            state.contract.department = null
        }
    },
    setNewContractInputNull(state) {
        state.newContract['name'] = null
        state.newContract['contract_type'] = null
        state.newContract['name_of_contractor'] = null
        state.newContract['address'] = null
        state.newContract['purpose_contractor'] = null
        state.newContract['deadline_from'] = null
        state.newContract['deadline_to'] = null
        state.newContract['company'] = null
        state.newContract['department'] = null
        state.newContract['responsible_person'] = null
        state.newContract['total_price'] = null
        state.newContract['unit_price'] = null
        state.newContract['payment_date'] = null
        state.newContract['payment_terms'] = null
        state.newContract['contractor_obligations'] = null
        state.newContract['status'] = null
    }
}


export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}