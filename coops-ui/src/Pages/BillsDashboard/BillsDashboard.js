import { useMeta } from 'vue-meta';
import BillDataService from '../../Services/BillDataService';

export default {
    name: 'BillsDashboard',
    setup() {
        useMeta({ title: 'Bills & Invoices Dashboard' });
    },
    data() {
        return {
            loading: false,
            stats: {
                requested: 0,
                pending: 0,
                approved_ceo: 0,
                canceled: 0,
                approved_admin: 0,
                printed: 0,
                delivered: 0,
                total: 0,
            },
        };
    },
    computed: {
        statusCards() {
            return [
                {
                    key: 'requested',
                    status: 1,
                    label: this.$t('billsDashboard.statusRequested'),
                    icon: 'fas fa-paper-plane',
                    color: '#0ea5e9',
                },
                {
                    key: 'pending',
                    status: 2,
                    label: this.$t('billsDashboard.statusPending'),
                    icon: 'fas fa-hourglass-half',
                    color: '#f59e0b',
                },
                {
                    key: 'approved_ceo',
                    status: 3,
                    label: this.$t('billsDashboard.statusApprovedCeo'),
                    icon: 'fas fa-user-check',
                    color: '#8b5cf6',
                },
                {
                    key: 'approved_admin',
                    status: 5,
                    label: this.$t('billsDashboard.statusApprovedAdmin'),
                    icon: 'fas fa-check-double',
                    color: '#10b981',
                },
                {
                    key: 'printed',
                    status: 6,
                    label: this.$t('billsDashboard.statusPrinted'),
                    icon: 'fas fa-print',
                    color: '#3b82f6',
                },
                {
                    key: 'delivered',
                    status: 7,
                    label: this.$t('billsDashboard.statusDelivered'),
                    icon: 'fas fa-hand-holding-usd',
                    color: '#6f42c1',
                },
                {
                    key: 'canceled',
                    status: 4,
                    label: this.$t('billsDashboard.statusCanceled'),
                    icon: 'fas fa-times-circle',
                    color: '#ef4444',
                },
            ];
        },
    },
    methods: {
        loadStats() {
            this.loading = true;
            BillDataService.dashboard()
                .then((res) => {
                    this.stats = { ...this.stats, ...res.data };
                })
                .catch(() => {})
                .finally(() => { this.loading = false; });
        },

        pct(key) {
            if (!this.stats.total) return 0;
            return Math.round(((this.stats[key] || 0) / this.stats.total) * 100);
        },
    },
    created() {
        this.loadStats();
    },
};
