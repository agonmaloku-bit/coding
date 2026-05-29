import { useMeta } from 'vue-meta';
import UserService from '../../Services/UserDataService';

export default {
    name: 'ContractDashboard',
    setup() {
        useMeta({ title: 'Contract Dashboard' });
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        },
    },
    data() {
        return {
            allData: null,
            loading: false,
        };
    },
    methods: {
        loadData() {
            this.loading = true;
            UserService.getDashboardData()
                .then((res) => { this.allData = res.data; })
                .catch(() => {})
                .finally(() => { this.loading = false; });
        },
    },
    created() {
        this.loadData();
    },
};
