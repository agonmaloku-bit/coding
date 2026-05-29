import AuthService from "../../../Services/AuthService";

const user = JSON.parse(localStorage.getItem("user"));
const initialState = user
  ? {
      status: { loggedIn: true, isLoading: false, profile: false },
      user,
      currentUser: null,
      error: { status: false, message: null },
      errors: null,
    }
  : {
      status: { loggedIn: false, isLoading: false, profile: false },
      user: null,
      currentUser: null,
      error: { status: false, message: null },
      errors: null,
    };

export const auth = {
  namespaced: true,
  state: initialState,
  getters: {
    user: (state) => state.user.user,
    errorsGetter: (state) => state.errors,
    rolePermissions: (state) => {
      let rolePermissions = [];

      if (state.user.user !== null) {
        if (state.user.user.roles.length >= 1) {
          state.user.user.roles.forEach(function (r) {
            r.permissions.forEach(function (p) {
              rolePermissions.push(p);
            });
          });
        }
      }
      return rolePermissions;
    },
    directPermissions: (state) => state.user.user.permissions,
    // directPermissions: state => {
    //     if (state.currentUser != null) {
    //         return state.currentUser.permissions
    //     }
    // }
    // directPermissions: state => {
    //     let directPermissions = [];
    //     if (state.user.user.permissions.length >= 1) {
    //         state.user.user.permissions.forEach(function (r) {
    //             r.permissions.forEach(function (p) {
    //                 rolePermissions.push(p)
    //             })
    //         })
    //     }
    //     return directPermissions
    // },
  },
  actions: {
    login({ commit }, user) {
      commit("setIsLoading", true);
      return AuthService.login(user).then(
        (response) => {
          commit("loginSuccess", response);
          commit("setIsLoading", false);
          commit("setErrorStatus", false);
          return Promise.resolve(response);
        },
        (error) => {
          commit("loginFailure");
          commit("setIsLoading", false);
          commit("setErrorStatus", true);
          commit("setErrorMessage", "The email or password are incorrect.");
          return Promise.reject(error);
        }
      );
    },
    logout({ commit }) {
      let user = localStorage.getItem("user");
      AuthService.logout(user)
        .then(() => {
          commit("logout");
          localStorage.removeItem("user");
          document.location.href = "/login";
        })
        .catch((e) => {
          console.log(e.message);
        });
    },
    register({ commit }, user) {
      return AuthService.register(user).then(
        (response) => {
          commit("registerSuccess");
          return Promise.resolve(response.data);
        },
        (error) => {
          commit("registerFailure");
          return Promise.reject(error);
        }
      );
    },
    async getUser({ commit }) {
      await AuthService.getCurrentUser().then(
        (response) => {
          commit("setCurrentUser", response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    changeProfile({ commit }, user) {
      return AuthService.changeProfile(user).then(
        (response) => {
          commit("profileSuccess");
          return Promise.resolve(response);
        },
        (error) => {
          commit("setErrorsMutation", error.response.data.errors);
          commit("profileFailure");
          return Promise.reject(error);
        }
      );
    },
  },
  mutations: {
    loginSuccess(state, user) {
      state.status.loggedIn = true;
      state.user = user;
    },
    loginFailure(state) {
      state.status.loggedIn = false;
      state.user = null;
    },
    logout(state) {
      state.status.loggedIn = false;
      state.user = null;
    },
    registerSuccess(state) {
      state.status.loggedIn = false;
    },
    registerFailure(state) {
      state.status.loggedIn = false;
    },
    profileSuccess(state) {
      state.status.profile = true;
    },
    profileFailure(state) {
      state.status.profile = false;
    },
    setIsLoading(state, isLoading) {
      state.status.isLoading = isLoading;
    },
    setErrorStatus(state, status) {
      state.error.status = status;
    },
    setErrorMessage(state, message) {
      state.error.message = message;
    },
    setErrorsMutation(state, error) {
      state.errors = error;
    },
    setCurrentUser(state, user) {
      state.currentUser = user;
    },
  },
};
