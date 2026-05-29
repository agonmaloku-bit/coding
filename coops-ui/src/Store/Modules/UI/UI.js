import { calculateWindowSize } from '@/Utils/Helpers';


const state = () => ({
    isSidebarMenuCollapsed: false,
    screenSize: calculateWindowSize(window.innerWidth),
    modalActive: false,
    busy: false,
    busyMessage: '',
});


const getters = {
    isSidebarMenuCollapsed: state => state.isSidebarMenuCollapsed,
    screenSize: state => state.screenSize,
    modalActive: state => state.modalActive,
    busy: state => state.busy,
    busyMessage: state => state.busyMessage,
}


const mutations = {
    toggleSidebarMenu: (state) => {
        state.isSidebarMenuCollapsed = !state.isSidebarMenuCollapsed;
    },
    setWindowSize: (state, payload) => {
        state.screenSize = payload;
    },
    setModalActive: (state, payload) => {
        state.modalActive = payload;
    },
    setBusy: (state, payload) => {
        if (typeof payload === 'object' && payload !== null) {
            state.busy = !!payload.busy;
            state.busyMessage = payload.message || '';
        } else {
            state.busy = !!payload;
            if (!payload) state.busyMessage = '';
        }
    }
};


const actions = {
    toggleSidebarMenu: (context) => {
        context.commit('toggleSidebarMenu');
    },
    setWindowSize: (context, payload) => {
        context.commit('setWindowSize', payload);
    },
    setModalActive: (context, payload) => {
        context.commit('setModalActive', payload);
    },
    setBusy: (context, payload) => {
        context.commit('setBusy', payload);
    }
};


const UI = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};

export default UI;
