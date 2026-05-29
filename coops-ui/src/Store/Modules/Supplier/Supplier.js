import SupplierDataService from "../../../Services/SupplierDataService";
import {
  SUPPLIER_LIST_GETTER,
  SUPPLIERS_PAGINATED_DATA_GETTER,
  SUPPLIER_GETTER,
  NEW_SUPPLIER_GETTER,
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
  FETCH_ALL_SUPPLIERS_ACTION,
  FETCH_DETAIL_SUPPLIER_ACTION,
  STORE_SUPPLIER_ACTION,
  UPDATE_SUPPLIER_ACTION,
  DELETE_SUPPLIER_ACTION,
  ADD_SUPPLIER_INPUT_ACTION,
  UPDATE_SUPPLIER_INPUT_ACTION,
  SET_ERRORS_ACTION,
  SAVE_NEW_SUPPLIERS_MUTATION,
  SAVE_UPDATED_SUPPLIER_MUTATION,
  SET_SUPPLIER_ADD_INPUT_MUTATION,
  SET_SUPPLIER_ARE_LOADING_MUTATION,
  SET_SUPPLIER_DETAIL_INPUT_MUTATION,
  SET_SUPPLIER_DETAIL_MUTATION,
  SET_SUPPLIER_IS_CREATING_MUTATION,
  SET_SUPPLIER_IS_DELETING_MUTATION,
  SET_SUPPLIER_IS_LOADING_MUTATION,
  SET_SUPPLIER_IS_UPDATING_MUTATION,
  SET_SUPPLIERS_LOADED_MUTATION,
  SET_SUPPLIERS_MUTATION,
  SET_SUPPLIERS_PAGINATED_MUTATION,
  SET_ERRORS_MUTATION,
} from "./constants";

const state = () => ({
  suppliers: [],
  suppliersPaginatedData: null,
  supplier: null,
  newSupplier: { name: null, no_contract_needed: false, address: null, city: null, country: null, phone: null, email: null, website: null, contact_name: null, contact_surname: null, contact_email: null, contact_phone: null },
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
  [SUPPLIER_LIST_GETTER]: (state) => state.suppliers,
  [SUPPLIERS_PAGINATED_DATA_GETTER]: (state) => state.suppliersPaginatedData,
  [SUPPLIER_GETTER]: (state) => state.supplier,
  [NEW_SUPPLIER_GETTER]: (state) => state.newSupplier,
  [FIRST_TIME_LOADED_GETTER]: (state) => state.firstTimeLoaded,
  [IS_LOADING_ALL_GETTER]: (state) => state.isLoadingAll,
  [IS_LOADING_GETTER]: (state) => state.isLoading,
  [IS_CREATING_GETTER]: (state) => state.isCreating,
  [CREATED_DATA_GETTER]: (state) => state.createdData,
  [IS_UPDATING_GETTER]: (state) => state.isUpdating,
  [UPDATED_DATA_GETTER]: (state) => state.updatedData,
  [IS_DELETING_GETTER]: (state) => state.isDeleting,
  [DELETED_DATA_GETTER]: (state) => state.deletedData,
  [ERRORS_GETTER]: (state) => state.errors,
};

const actions = {
  async [FETCH_ALL_SUPPLIERS_ACTION]({ commit }, query = null) {
    commit(SET_SUPPLIER_ARE_LOADING_MUTATION, true);
    let url = null;
    if (query === null) {
      url = null;
    } else {
      url = `?page=${query.page}`;
    }

    let user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      await SupplierDataService.getAll(url)
        .then((res) => {
          const suppliers = res.data.data;
          commit(SET_SUPPLIERS_MUTATION, suppliers);
          const pagination = {
            total: res.data.total,
            per_page: res.data.per_page,
            current_page: res.data.current_page,
            total_pages: res.data.last_page,
          };
          res.data.pagination = pagination;
          commit(SET_SUPPLIERS_PAGINATED_MUTATION, res.data);
          commit(SET_SUPPLIER_ARE_LOADING_MUTATION, false);
          commit(SET_SUPPLIERS_LOADED_MUTATION, true);
        })
        .catch((err) => {
          commit(SET_ERRORS_MUTATION, err.response.data);
          commit(SET_SUPPLIER_ARE_LOADING_MUTATION, false);
        });
    }
  },

  async [FETCH_DETAIL_SUPPLIER_ACTION]({ commit }, id) {
    commit(SET_SUPPLIER_IS_LOADING_MUTATION, true);
    SupplierDataService.get(id)
      .then((res) => {
        commit(SET_SUPPLIER_DETAIL_MUTATION, res.data.data);
        commit(SET_SUPPLIER_IS_LOADING_MUTATION, false);
      })
      .catch((err) => {
        console.log("error", err);
        commit(SET_SUPPLIER_IS_LOADING_MUTATION, false);
      });
  },

  async [STORE_SUPPLIER_ACTION]({ commit, dispatch }, supplier) {
    commit(SET_SUPPLIER_IS_CREATING_MUTATION, true);
    SupplierDataService.create(supplier)
      .then((res) => {
        dispatch(FETCH_ALL_SUPPLIERS_ACTION, { query: { page: 1 } });
        commit(SAVE_NEW_SUPPLIERS_MUTATION, res.data.data);
        commit(SET_SUPPLIER_IS_CREATING_MUTATION, false);
        commit(SET_ERRORS_MUTATION, null);
        commit("setNewSupplierInputNull");
      })
      .catch((err) => {
        commit(SET_ERRORS_MUTATION, err.response.data.errors);
        commit(SET_SUPPLIER_IS_CREATING_MUTATION, false);
      });
  },

  async [UPDATE_SUPPLIER_ACTION]({ commit, dispatch }, supplier) {
    commit(SET_SUPPLIER_IS_UPDATING_MUTATION, true);

    SupplierDataService.update(supplier.id, supplier)
      .then(() => {
        dispatch(FETCH_ALL_SUPPLIERS_ACTION, { query: { page: 1 } });
        // commit(SAVE_UPDATED_SUPPLIER_MUTATION, res.data.data);
        commit(SAVE_UPDATED_SUPPLIER_MUTATION, supplier);
        commit(SET_SUPPLIER_IS_UPDATING_MUTATION, false);
        commit(SET_ERRORS_MUTATION, null);
      })
      .catch((err) => {
        // console.log(err.response.data);
        commit(SET_ERRORS_MUTATION, err.response.data.errors);
        commit(SET_SUPPLIER_IS_UPDATING_MUTATION, false);
      });
  },

  async [DELETE_SUPPLIER_ACTION]({ commit, dispatch }, id) {
    commit(SET_SUPPLIER_IS_DELETING_MUTATION, true);
    SupplierDataService.delete(id)
      .then(() => {
        commit(SET_SUPPLIER_IS_DELETING_MUTATION, false);
        dispatch(FETCH_ALL_SUPPLIERS_ACTION, { query: { page: 1 } });
      })
      .catch((err) => {
        console.log("error", err);
        commit(SET_SUPPLIER_IS_DELETING_MUTATION, false);
      });
  },

  [ADD_SUPPLIER_INPUT_ACTION]({ commit }, e) {
    commit(SET_SUPPLIER_ADD_INPUT_MUTATION, e);
  },

  [UPDATE_SUPPLIER_INPUT_ACTION]({ commit }, e) {
    commit(SET_SUPPLIER_DETAIL_INPUT_MUTATION, e);
  },

  [SET_ERRORS_ACTION]({ commit }, e) {
    commit(SET_ERRORS_MUTATION, e);
  },
};

const mutations = {
  [SET_SUPPLIERS_MUTATION]: (state, suppliers) => {
    state.suppliers = suppliers;
  },
  [SET_SUPPLIERS_PAGINATED_MUTATION]: (state, suppliersPaginatedData) => {
    state.suppliersPaginatedData = suppliersPaginatedData;
  },
  [SET_SUPPLIER_DETAIL_MUTATION]: (state, supplier) => {
    state.supplier = supplier;
  },
  [SET_SUPPLIER_ARE_LOADING_MUTATION](state, isLoading) {
    state.isLoadingAll = isLoading;
  },
  [SET_SUPPLIERS_LOADED_MUTATION](state, loaded) {
    state.firstTimeLoaded = loaded;
  },
  [SET_SUPPLIER_IS_LOADING_MUTATION](state, isLoading) {
    state.isLoading = isLoading;
  },
  [SAVE_NEW_SUPPLIERS_MUTATION]: (state, supplier) => {
    // state.suppliers.unshift(supplier)
    //state.suppliers.push(supplier)
    state.createdData = supplier;
  },
  [SET_SUPPLIER_IS_CREATING_MUTATION](state, isCreating) {
    state.isCreating = isCreating;
  },
  [SAVE_UPDATED_SUPPLIER_MUTATION]: (state, supplier) => {
    //state.suppliers.unshift(supplier);
    state.suppliers = state.suppliers.map((x) =>
      x.id === supplier.id ? { ...x, name: supplier.name } : x
    );
    state.updatedData = supplier;
  },
  [SET_SUPPLIER_IS_UPDATING_MUTATION](state, isUpdating) {
    state.isUpdating = isUpdating;
  },
  [SET_SUPPLIER_ADD_INPUT_MUTATION]: (state, e) => {
    let supplier = state.newSupplier;
    supplier[e.target.name] = e.target.value;
    state.newSupplier = supplier;
  },
  [SET_SUPPLIER_DETAIL_INPUT_MUTATION]: (state, e) => {
    let supplier = state.supplier;
    supplier[e.target.name + "New"] = e.target.value;
    state.supplier = supplier;
  },
  [SET_SUPPLIER_IS_DELETING_MUTATION](state, isDeleting) {
    state.isDeleting = isDeleting;
  },
  [SET_ERRORS_MUTATION](state, error) {
    state.errors = error;
  },
  setNewSupplierInputNull(state) {
    state.newSupplier = { name: null, no_contract_needed: false, address: null, city: null, country: null, phone: null, email: null, website: null, contact_name: null, contact_surname: null, contact_email: null, contact_phone: null };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
