import PermissionDataService from "../../../Services/PermissionDataService";
import {
  PERMISSION_LIST_GETTER,
  PERMISSIONS_PAGINATED_DATA_GETTER,
  PERMISSION_GETTER,
  NEW_PERMISSION_GETTER,
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
  FETCH_ALL_PERMISSIONS_ACTION,
  FETCH_DETAIL_PERMISSION_ACTION,
  STORE_PERMISSION_ACTION,
  UPDATE_PERMISSION_ACTION,
  DELETE_PERMISSION_ACTION,
  ADD_PERMISSION_INPUT_ACTION,
  UPDATE_PERMISSION_INPUT_ACTION,
  SET_ERRORS_ACTION,
  SAVE_NEW_PERMISSIONS_MUTATION,
  SAVE_UPDATED_PERMISSION_MUTATION,
  SET_PERMISSION_ADD_INPUT_MUTATION,
  SET_PERMISSION_ARE_LOADING_MUTATION,
  SET_PERMISSION_DETAIL_INPUT_MUTATION,
  SET_PERMISSION_DETAIL_MUTATION,
  SET_PERMISSION_IS_CREATING_MUTATION,
  SET_PERMISSION_IS_DELETING_MUTATION,
  SET_PERMISSION_IS_LOADING_MUTATION,
  SET_PERMISSION_IS_UPDATING_MUTATION,
  SET_PERMISSIONS_LOADED_MUTATION,
  SET_PERMISSIONS_MUTATION,
  SET_PERMISSIONS_PAGINATED_MUTATION,
  SET_ERRORS_MUTATION,
} from "./constants";

const state = () => ({
  permissions: [],
  permissionsPaginatedData: null,
  permission: null,
  newPermission: { name: null },
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
  modules: [
    { name: "Users", slug: "users" },
    { name: "Departments", slug: "departments" },
    { name: "Company", slug: "company" },
    { name: "Contract Type", slug: "contract_type" },
    { name: "Responsible Person", slug: "responsible_person" },
    { name: "Procurement Officer", slug: "procurement_officer" },
    { name: "Director Department", slug: "director_department" },
    { name: "Executive Director", slug: "executive_director" },
    { name: "Legal Office", slug: "legal_office" },
    { name: "Contract", slug: "contract" },
    { name: "Bill", slug: "bill" },
  ],
  permissionsType: [
    { name: "Show", slug: "show" },
    { name: "Add", slug: "add" },
    { name: "Edit", slug: "edit" },
    { name: "Delete", slug: "delete" },
    { name: "Approve", slug: "approve" },
    { name: "Request - Only valid in contract module", slug: "request" },
    // { name: "Approve - Only valid in contract module", slug: "approve" },
  ],
});

const getters = {
  [PERMISSION_LIST_GETTER]: (state) => state.permissions,
  [PERMISSIONS_PAGINATED_DATA_GETTER]: (state) =>
    state.permissionsPaginatedData,
  [PERMISSION_GETTER]: (state) => state.permission,
  [NEW_PERMISSION_GETTER]: (state) => state.newPermission,
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
  modulesList: (state) => state.modules,
  permissionTypes: (state) => state.permissionsType,
};

const actions = {
  async [FETCH_ALL_PERMISSIONS_ACTION]({ commit }, query = null) {
    commit(SET_PERMISSION_ARE_LOADING_MUTATION, true);
    let url = null;
    if (query === null) {
      url = null;
    } else {
      url = `?page=${query.page}`;
    }

    let user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      PermissionDataService.getAll(url)
        .then((res) => {
          const permissions = res.data.data;
          commit(SET_PERMISSIONS_MUTATION, permissions);
          const pagination = {
            total: res.data.total,
            per_page: res.data.per_page,
            current_page: res.data.current_page,
            total_pages: res.data.last_page,
          };
          res.data.pagination = pagination;
          commit(SET_PERMISSIONS_PAGINATED_MUTATION, res.data);
          commit(SET_PERMISSION_ARE_LOADING_MUTATION, false);
          commit(SET_PERMISSIONS_LOADED_MUTATION, true);
        })
        .catch((err) => {
          commit(SET_ERRORS_MUTATION, err.response.data);
          commit(SET_PERMISSION_ARE_LOADING_MUTATION, false);
        });
    }
  },

  async [FETCH_DETAIL_PERMISSION_ACTION]({ commit }, id) {
    commit(SET_PERMISSION_IS_LOADING_MUTATION, true);
    PermissionDataService.get(id)
      .then((res) => {
        commit(SET_PERMISSION_DETAIL_MUTATION, res.data.data);
        commit(SET_PERMISSION_IS_LOADING_MUTATION, false);
      })
      .catch((err) => {
        console.log("error", err);
        commit(SET_PERMISSION_IS_LOADING_MUTATION, false);
      });
  },

  async [STORE_PERMISSION_ACTION]({ commit, dispatch }, permission) {
    commit(SET_PERMISSION_IS_CREATING_MUTATION, true);
    PermissionDataService.create(permission)
      .then((res) => {
        dispatch(FETCH_ALL_PERMISSIONS_ACTION);
        commit(SAVE_NEW_PERMISSIONS_MUTATION, res.data.data);
        commit(SET_PERMISSION_IS_CREATING_MUTATION, false);
        commit(SET_ERRORS_MUTATION, null);
      })
      .catch((err) => {
        commit(SET_ERRORS_MUTATION, err.response.data.errors);
        commit(SET_PERMISSION_IS_CREATING_MUTATION, false);
      });
  },

  async [UPDATE_PERMISSION_ACTION]({ commit, dispatch }, permission) {
    commit(SET_PERMISSION_IS_UPDATING_MUTATION, true);

    PermissionDataService.update(permission.id, permission)
      .then(() => {
        dispatch(FETCH_ALL_PERMISSIONS_ACTION);
        // commit(SAVE_UPDATED_PERMISSION_MUTATION, res.data.data);
        commit(SAVE_UPDATED_PERMISSION_MUTATION, permission);
        commit(SET_PERMISSION_IS_UPDATING_MUTATION, false);
        commit(SET_ERRORS_MUTATION, null);
      })
      .catch((err) => {
        // console.log(err.response.data);
        commit(SET_ERRORS_MUTATION, err.response.data.errors);
        commit(SET_PERMISSION_IS_UPDATING_MUTATION, false);
      });
  },

  async [DELETE_PERMISSION_ACTION]({ commit, dispatch }, id) {
    commit(SET_PERMISSION_IS_DELETING_MUTATION, true);
    PermissionDataService.delete(id)
      .then(() => {
        commit(SET_PERMISSION_IS_DELETING_MUTATION, false);
        dispatch(FETCH_ALL_PERMISSIONS_ACTION);
      })
      .catch((err) => {
        console.log("error", err);
        commit(SET_PERMISSION_IS_DELETING_MUTATION, false);
      });
  },

  [ADD_PERMISSION_INPUT_ACTION]({ commit }, e) {
    commit(SET_PERMISSION_ADD_INPUT_MUTATION, e);
  },

  [UPDATE_PERMISSION_INPUT_ACTION]({ commit }, e) {
    commit(SET_PERMISSION_DETAIL_INPUT_MUTATION, e);
  },

  [SET_ERRORS_ACTION]({ commit }, e) {
    commit(SET_ERRORS_MUTATION, e);
  },

  addPermissionModuleAction({ commit }, module) {
    commit("setPermissionModuleInputMutation", module);
  },

  addPermissionTypeInputAction({ commit }, name) {
    commit("setPermissionTypeInputMutation", name);
  },

  editPermissionModuleAction({ commit }, module) {
    commit("setPermissionModuleUpdateMutation", module);
  },

  editPermissionTypeInputAction({ commit }, name) {
    commit("setPermissionTypeUpdateMutation", name);
  },
};

const mutations = {
  [SET_PERMISSIONS_MUTATION]: (state, permissions) => {
    state.permissions = permissions;
  },
  [SET_PERMISSIONS_PAGINATED_MUTATION]: (state, permissionsPaginatedData) => {
    state.permissionsPaginatedData = permissionsPaginatedData;
  },
  [SET_PERMISSION_DETAIL_MUTATION]: (state, permission) => {
    state.permission = permission;
  },
  [SET_PERMISSION_ARE_LOADING_MUTATION](state, isLoading) {
    state.isLoadingAll = isLoading;
  },
  [SET_PERMISSIONS_LOADED_MUTATION](state, loaded) {
    state.firstTimeLoaded = loaded;
  },
  [SET_PERMISSION_IS_LOADING_MUTATION](state, isLoading) {
    state.isLoading = isLoading;
  },
  [SAVE_NEW_PERMISSIONS_MUTATION]: (state, permission) => {
    // state.permissions.unshift(permission)
    state.permissions.push(permission);
    state.createdData = permission;
  },
  [SET_PERMISSION_IS_CREATING_MUTATION](state, isCreating) {
    state.isCreating = isCreating;
  },
  [SAVE_UPDATED_PERMISSION_MUTATION]: (state, permission) => {
    //state.permissions.unshift(permission);
    state.permissions = state.permissions.map((x) =>
      x.id === permission.id ? { ...x, name: permission.name } : x
    );
    state.updatedData = permission;
  },
  [SET_PERMISSION_IS_UPDATING_MUTATION](state, isUpdating) {
    state.isUpdating = isUpdating;
  },
  [SET_PERMISSION_ADD_INPUT_MUTATION]: (state, e) => {
    let permission = state.newPermission;
    permission[e.target.name] = e.target.value;
    state.newPermission = permission;
  },
  [SET_PERMISSION_DETAIL_INPUT_MUTATION]: (state, e) => {
    let permission = state.permission;
    permission[e.target.name] = e.target.value;
    state.permission = permission;
  },
  [SET_PERMISSION_IS_DELETING_MUTATION](state, isDeleting) {
    state.isDeleting = isDeleting;
  },
  [SET_ERRORS_MUTATION](state, error) {
    state.errors = error;
  },
  setPermissionModuleInputMutation: (state, module) => {
    state.newPermission.module = module;
  },
  setPermissionTypeInputMutation: (state, name) => {
    state.newPermission.name = name;
  },
  setPermissionModuleUpdateMutation: (state, module) => {
    state.permission.module = module;
  },
  setPermissionTypeUpdateMutation: (state, name) => {
    state.permission.type = name;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
