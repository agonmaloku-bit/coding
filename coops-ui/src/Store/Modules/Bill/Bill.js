import BillDataService from "../../../Services/BillDataService";
import {
  BILL_LIST_GETTER,
  BILLS_PAGINATED_DATA_GETTER,
  BILL_GETTER,
  NEW_BILL_GETTER,
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

  FETCH_ALL_BILLS_ACTION,
  FETCH_DETAIL_BILL_ACTION,
  STORE_BILL_ACTION,
  UPDATE_BILL_ACTION,
  DELETE_BILL_ACTION,
  REMOVE_FILE_ACTION,
  ADD_BILL_INPUT_ACTION,
  UPDATE_BILL_INPUT_ACTION,
  SET_ERRORS_ACTION,

  SAVE_NEW_BILLS_MUTATION,
  SAVE_UPDATED_BILL_MUTATION,
  SET_BILL_ADD_INPUT_MUTATION,
  SET_BILL_ARE_LOADING_MUTATION,
  SET_BILL_DETAIL_INPUT_MUTATION,
  SET_BILL_DETAIL_MUTATION,
  SET_BILL_IS_CREATING_MUTATION,
  SET_BILL_IS_DELETING_MUTATION,
  SET_BILL_IS_LOADING_MUTATION,
  SET_BILL_IS_UPDATING_MUTATION,
  SET_BILLS_LOADED_MUTATION,
  SET_BILLS_MUTATION,
  SET_BILLS_PAGINATED_MUTATION,
  SET_ERRORS_MUTATION,
} from "./constants";

const state = () => ({
  bills: [],
  billsPaginatedData: null,
  bill: null,
  newBill: { name: null },
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
  countBills: null,
  billApprove: false,
  billCancel: false,
});

const getters = {
  [BILL_LIST_GETTER]: (state) => state.bills,
  [BILLS_PAGINATED_DATA_GETTER]: (state) => state.billsPaginatedData,
  [BILL_GETTER]: (state) => state.bill,
  [NEW_BILL_GETTER]: (state) => state.newBill,
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
  countBills: (state) => state.countBills,
  billApprove: (state) => state.billApprove,
  billCancel: (state) => state.billCancel,
};

const actions = {
  // search
  async [FETCH_ALL_BILLS_ACTION]({ commit }, query = null) {
    commit(SET_BILL_ARE_LOADING_MUTATION, true);
    let url = null;
    if (query === null) {
      url = null;
    }
    if (query.page !== null) {
      url = `?page=${query.page}`;
    }
    if (query.status == 7) {
      url = `?search_status=${query.search.status.id}`;
    }
    if (query.search.text != null && query.search.text != "") {
      url = url + `&search_text=${query.search.text}`;
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
    if (query.search.suppliers != null) {
        url = url + `&suppliers=${query.search.suppliers.id}`
    }
    // if (query.search) {
    //   url =
    //     url +
    //     `&search_status=${query.search.status.id}&search_order=${query.search.orderBy.id}&search_sort=${query.search.sort}`;
    // }
    
    if (query.filterArchivedBills) {
      if (url.includes("?")) {
        url = url + `&closedBills=true`;
      } else {
        url = url + `?closedBills=true`;
      }
    }
    if (query.filterProgressBills) {
      if (url.includes("?")) {
        url = url + `&inProgress=true`;
      } else {
        url = url + `?inProgress=true`;
      }
    }
    
    await BillDataService.getAll(url)
      .then((res) => {
        const bills = res.data.data;
        commit(SET_BILLS_MUTATION, bills);
        const pagination = {
          total: res.data.total,
          per_page: res.data.per_page,
          current_page: res.data.current_page,
          total_pages: res.data.last_page,
        };
        res.data.pagination = pagination;
        commit(SET_BILLS_PAGINATED_MUTATION, res.data);
        commit(SET_BILL_ARE_LOADING_MUTATION, false);
        commit(SET_BILLS_LOADED_MUTATION, true);
      })
      .catch((err) => {
        commit(SET_ERRORS_MUTATION, err.response.data);
        commit(SET_BILL_ARE_LOADING_MUTATION, false);
        console.error('Error:', err);
      });
  },

  async [FETCH_DETAIL_BILL_ACTION]({ commit }, id) {
    commit(SET_BILL_IS_LOADING_MUTATION, true);
    BillDataService.get(id)
      .then((res) => {
        commit(SET_BILL_DETAIL_MUTATION, res.data.data);
        commit(SET_BILL_IS_LOADING_MUTATION, false);
      })
      .catch((err) => {
        console.log("error", err);
        commit(SET_BILL_IS_LOADING_MUTATION, false);
      });
  },

  async [STORE_BILL_ACTION]({ commit }, bill) {
    commit(SET_BILL_IS_CREATING_MUTATION, true);
    BillDataService.create(bill)
      .then((res) => {
        // dispatch(FETCH_ALL_BILLS_ACTION, { query: { page: 1 } });
        commit(SAVE_NEW_BILLS_MUTATION, res.data.data);
        commit(SET_BILL_IS_CREATING_MUTATION, false);
        commit(SET_ERRORS_MUTATION, null);
        commit("setNewBillInputNull");
      })
      .catch((err) => {
        commit(SET_ERRORS_MUTATION, err.response.data.errors);
        commit(SET_BILL_IS_CREATING_MUTATION, false);
      });
  },
  async requestBillAction({ commit }, bill) {
    commit(SET_BILL_IS_CREATING_MUTATION, true);
    BillDataService.request(bill)
      .then((res) => {
        // dispatch(FETCH_ALL_BILLS_ACTION, { query: { page: 1 } });
        commit(SAVE_NEW_BILLS_MUTATION, res.data.data);
        commit(SET_BILL_IS_CREATING_MUTATION, false);
        commit(SET_ERRORS_MUTATION, null);
        commit("setNewBillInputNull");
      })
      .catch((err) => {
        commit(SET_ERRORS_MUTATION, err.response.data.errors);
        commit(SET_BILL_IS_CREATING_MUTATION, false);
      });
  },
  async [UPDATE_BILL_ACTION]({ commit }, bill) {
    commit(SET_BILL_IS_UPDATING_MUTATION, true);

    BillDataService.update(bill.get("id"), bill)
      .then(() => {
        // dispatch(FETCH_ALL_BILLS_ACTION, { query: { page: 1 } });
        // commit(SAVE_UPDATED_BILL_MUTATION, res.data.data);
        commit(SAVE_UPDATED_BILL_MUTATION, bill);
        commit(SET_BILL_IS_UPDATING_MUTATION, false);
        commit(SET_ERRORS_MUTATION, null);
      })
      .catch((err) => {
        // console.log(err.response.data);
        commit(SET_ERRORS_MUTATION, err.response.data.errors);
        commit(SET_BILL_IS_UPDATING_MUTATION, false);
      });
  },

  async [REMOVE_FILE_ACTION]({ commit }, file) {
    commit(SET_BILL_IS_UPDATING_MUTATION, true);

    // BillDataService.update(file.get("file_id"), file)
    BillDataService.Filedelete(file.id, file)
      .then(() => {
        commit(SET_BILL_IS_UPDATING_MUTATION, false);
        commit(SET_ERRORS_MUTATION, null);
      })
      .catch((err) => {
        console.log(err.response.data);
        commit(SET_ERRORS_MUTATION, err.response.data.errors);
        commit(SET_BILL_IS_UPDATING_MUTATION, false);
      });
  },

  async [DELETE_BILL_ACTION]({ commit, dispatch }, id) {
    commit(SET_BILL_IS_DELETING_MUTATION, true);
    BillDataService.delete(id)
      .then(() => {
        commit(SET_BILL_IS_DELETING_MUTATION, false);
        dispatch(FETCH_ALL_BILLS_ACTION, { query: { page: 1 } });
      })
      .catch((err) => {
        console.log("error", err);
        commit(SET_BILL_IS_DELETING_MUTATION, false);
      });
  },

  async getBillAttachments({ commit }, file) {
    commit(SET_BILL_IS_LOADING_MUTATION, true);
    commit(SET_BILL_IS_LOADING_MUTATION, false);
    BillDataService.attachment(file.file_id).then((response) => {
      const type = response.headers["content-type"];
      const blob = new Blob([response.data], { type: type, encoding: "UTF-8" });
      window.open(window.URL.createObjectURL(blob));
      // const link = document.createElement('a');
      // link.href = window.URL.createObjectURL(blob);
      // link.download = `${file.file_id}.${file.file_extension}`;
      // link.click();
    });
  },

  async exportBillsToExcel({ commit }, query) {
    commit(SET_BILL_IS_LOADING_MUTATION, true);
    commit(SET_BILL_IS_LOADING_MUTATION, false);
    let url = null;
    if (query.page !== null) {
      url = `?page=${query.page}`;
    }
    if (query.search.text != null && query.search.text != "") {
      url = url + `&search_text=${query.search.text}`;
    }
    // if (query.search) {
    //   url =
    //     url +
    //     `&search_status=${query.search.status.id}&search_order=${query.search.orderBy.id}&search_sort=${query.search.sort}`;
    // }
    // if (query.search.name != null) {
    //   url = url + `&name=${query.search.name}`;
    // }
    // if (query.search.bill_no != null) {
    //   url = url + `&bill_no=${query.search.bill_no}`;
    // }
    BillDataService.excel(url).then((response) => {
      const type = response.headers["content-type"];
      const blob = new Blob([response.data], { type: type, encoding: "UTF-8" });
      window.open(window.URL.createObjectURL(blob));
    });
  },

  async getCountBills({ commit }) {
    BillDataService.count()
      .then((res) => {
        commit("setCountBills", res.data.data.count);
      })
      .catch(() => {
        //console.log('error', err);
      });
  },

  async approveBill({ commit }, { id, comment, file }) {
    return BillDataService.approve(id, comment, file)
      .then((res) => {
        let result = res.data.data.success;
        if (result === true) {
          commit("billApproveResponse", "success");
          // dispatch(FETCH_ALL_BILLS_ACTION, {query: {page: 1}});
        }
        if (result === false) {
          commit("billApproveResponse", "error");
        }
      })
      .catch(() => {
        commit("billApproveResponse", "error");
      });
  },
  async cancelBill({ commit }, bill) {
    return BillDataService.cancel(bill.id, bill.comment)
      .then((res) => {
        let result = res.data.data.success;
        if (result === true) {
          commit("billCancelResponse", "success");
        }
        if (result === false) {
          commit("billCancelResponse", "error");
        }
      })
      .catch(() => {
        commit("billCancelResponse", "error");
      });
  },

  resetBillApprove({ commit }) {
    commit("billApproveResponse", false);
  },

  resetBillCancel({ commit }) {
    commit("billCancelResponse", false);
  },

  fetchBillTimeline(_ctx, id) {
    return BillDataService.timeline(id).then((res) => {
      const events = res?.data?.data?.events || [];
      return events;
    });
  },
  [ADD_BILL_INPUT_ACTION]({ commit }, e) {
    commit(SET_BILL_ADD_INPUT_MUTATION, e);
  },

  [UPDATE_BILL_INPUT_ACTION]({ commit }, e) {
    commit(SET_BILL_DETAIL_INPUT_MUTATION, e);
  },

  [SET_ERRORS_ACTION]({ commit }, e) {
    commit(SET_ERRORS_MUTATION, e);
  },
  addStepForBillAction({ commit }, step) {
    commit("setStepForBillInputMutation", step);
  },
  addBillTypeForBillAction({ commit }, type) {
    commit("setBillTypeForBillInputMutation", type);
  },
  // addSupplierForBillAction({ commit }, supplier) {
  //   commit("setSupplierForBillInputMutation", supplier);
  // },
  addValueForBillAction({ commit }, value) {
    commit("setValueForBillInputMutation", value);
  },
  addDepartmentsForBillAction({ commit }, value) {
    commit("setDepartmentsForBillInputMutation", value);
  },
  addSuppliersForBillAction({ commit }, value) {
    commit("setSuppliersForBillInputMutation", value);
  },

  editStatusForBillAction({ commit }, step) {
    commit("updateStatusForBillInputMutation", step);
  },
  editStepForBillAction({ commit }, step) {
    commit("updateStepForBillInputMutation", step);
  },
  editBillTypeForBillAction({ commit }, type) {
    commit("updateBillTypeForBillInputMutation", type);
  },
  editSupplierForBillAction({ commit }, supplier) {
    commit("updateSupplierForBillInputMutation", supplier);
  },
  editValueForBillAction({ commit }, value) {
    commit("updateValueForBillInputMutation", value);
  },

  updateBillFilesToDelete({ commit }, file) {
    commit("editBillFilesToDelete", file);
  },
  updateBillFilesToRestore({ commit }, file) {
    commit("editBillFilesToRestore", file);
  },
  updateBillFilesFromRestoreToDelete({ commit }, file) {
    commit("editBillFilesFromRestoreToDelete", file);
  },
  updateBillFilesToRestoreFromDeleted({ commit }, file) {
    commit("editBillFilesToRestoreFromDeleted", file);
  },
  updateBillFilesToDeletePermanent({ commit }, file) {
    commit("editBillFilesToDeletePermanent", file);
  },
};

const mutations = {
  [SET_BILLS_MUTATION]: (state, bills) => {
    state.bills = bills;
  },
  [SET_BILLS_PAGINATED_MUTATION]: (state, billsPaginatedData) => {
    state.billsPaginatedData = billsPaginatedData;
  },
  [SET_BILL_DETAIL_MUTATION]: (state, bill) => {
    state.bill = bill;
  },
  [SET_BILL_ARE_LOADING_MUTATION](state, isLoading) {
    state.isLoadingAll = isLoading;
  },
  [SET_BILLS_LOADED_MUTATION](state, loaded) {
    state.firstTimeLoaded = loaded;
  },
  [SET_BILL_IS_LOADING_MUTATION](state, isLoading) {
    state.isLoading = isLoading;
  },
  [SAVE_NEW_BILLS_MUTATION]: (state, bill) => {
    // state.bills.unshift(bill)
    state.bills.push(bill);
    state.createdData = bill;
  },
  [SET_BILL_IS_CREATING_MUTATION](state, isCreating) {
    state.isCreating = isCreating;
  },
  [SAVE_UPDATED_BILL_MUTATION]: (state, bill) => {
    //state.bills.unshift(bill);
    state.bills = state.bills.map((x) =>
      x.id === bill.id ? { ...x, name: bill.name } : x
    );
    state.updatedData = bill;
  },
  [SET_BILL_IS_UPDATING_MUTATION](state, isUpdating) {
    state.isUpdating = isUpdating;
  },
  [SET_BILL_ADD_INPUT_MUTATION]: (state, e) => {
    let bill = state.newBill;
    bill[e.target.name] = e.target.value;
    state.newBill = bill;
  },
  [SET_BILL_DETAIL_INPUT_MUTATION]: (state, e) => {
    let bill = state.bill;
    bill[e.target.name + "New"] = e.target.value;
    state.bill = bill;
  },
  [SET_BILL_IS_DELETING_MUTATION](state, isDeleting) {
    state.isDeleting = isDeleting;
  },
  [SET_ERRORS_MUTATION](state, error) {
    state.errors = error;
  },

  setCountBills(state, count) {
    state.countBills = count;
  },
  setStepForBillInputMutation: (state, step) => {
    state.newBill.step = step;
  },
  setDepartmentsForBillInputMutation: (state, departments) => {
    // console.log(departments, "departments");
    state.newBill.departments = departments;
  },
  setBillTypeForBillInputMutation: (state, type) => {
    state.newBill.type = type;
  },
  setValueForBillInputMutation: (state, value) => {
    state.newBill.total_price = value;
  },
  // setSupplierForBillInputMutation: (state, supplier) => {
  //   state.newBill.supplier = supplier;
  // },
  setSuppliersForBillInputMutation: (state, suppliers) => {
    // console.log(suppliers, "suppliers");
    state.newBill.suppliers = suppliers;
  },

  updateStatusForBillInputMutation: (state, status) => {
    state.bill.status = status;
  },
  updateStepForBillInputMutation: (state, step) => {
    state.bill.step = step;
  },
  updateBillTypeForBillInputMutation: (state, bill_type) => {
    state.bill.bill_type = bill_type;
  },
  updateValueForBillInputMutation: (state, value) => {
    state.bill.total_price = value;
  },
  updateSupplierForBillInputMutation: (state, suppliers) => {
    state.bill.suppliers = suppliers;
  },

  editBillFilesToDelete: (state, file) => {
    // let file = state.bill.files.filter( f => f.id === id);
    if (state.bill["files_deleted"] === undefined) {
      state.bill["files_deleted"] = [];
    }
    state.bill.files_deleted.push({
      id: file.id,
      file_id: file.file_id,
      file_extension: file.file_extension,
      file_path: file.file_path,
    });
    state.bill.files = state.bill.files.filter((f) => f.id !== file.id);
  },
  editBillFilesToRestore: (state, file) => {
    // let file = state.bill.files.filter( f => f.id === id);
    if (state.bill["files_restore"] === undefined) {
      state.bill["files_restore"] = [];
    }
    state.bill.files_restore.push({
      id: file.id,
      file_id: file.file_id,
      file_extension: file.file_extension,
      file_path: file.file_path,
    });
    state.bill.files = state.bill.files.filter((f) => f.id !== file.id);
  },
  editBillFilesFromRestoreToDelete: (state, file) => {
    if (state.bill["files_deleted"] === undefined) {
      state.bill["files_deleted"] = [];
    }
    state.bill.files_deleted.push({
      id: file.id,
      file_id: file.file_id,
      file_extension: file.file_extension,
      file_path: file.file_path,
    });
    state.bill.files_restore = state.bill.files_restore.filter(
      (f) => f.id !== file.id
    );
  },
  editBillFilesToRestoreFromDeleted: (state, file) => {
    if (state.bill["files_restore"] === undefined) {
      state.bill["files_restore"] = [];
    }
    state.bill.files_restore.push({
      id: file.id,
      file_id: file.file_id,
      file_extension: file.file_extension,
      file_path: file.file_path,
    });
    state.bill.files_deleted = state.bill.files_deleted.filter(
      (f) => f.id !== file.id
    );
  },
  editBillFilesToDeletePermanent: (state, file) => {
    if (state.bill["files_deleted_permanent"] === undefined) {
      state.bill["files_deleted_permanent"] = [];
    }
    state.bill.files_deleted_permanent.push({
      id: file.id,
      file_id: file.file_id,
      file_extension: file.file_extension,
      file_path: file.file_path,
    });
    if (state.bill.files_deleted !== undefined) {
      state.bill.files_deleted = state.bill.files_deleted.filter(
        (f) => f.id !== file.id
      );
    }
    if (state.bill.files !== null) {
      state.bill.files = state.bill.files.filter((f) => f.id !== file.id);
    }
  },
  billApproveResponse: (state, res) => {
    state.billApprove = res;
  },
  billCancelResponse: (state, res) => {
    state.billCancel = res;
  },
  setNewBillInputNull(state) {
    state.newBill["name"] = null;
    state.newBill["type"] = null;
    state.newBill["value"] = null;
    state.newBill["bill_no"] = null;
    state.newBill["suppliers"] = null;
    state.newBill["comment"] = null;
    state.newBill["status"] = null;
    state.newBill["description"] = null;
    state.newBill["departments"] = null;
    state.newBill["files"] = null;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
