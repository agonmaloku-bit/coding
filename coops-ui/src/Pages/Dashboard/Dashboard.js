import { useMeta } from 'vue-meta';
import AppRoleDataService from '../../Services/AppRoleDataService';

const APP_META = {
    contract_process:    { path: '/platform/apps/contracts',       color: '#0ea5e9', live: true },
    bills_invoice:       { path: '/platform/apps/bills',           color: '#10b981', live: true },
    procurement_process: { path: '/platform/apps/procurement',     color: '#f59e0b', live: true },
    employee_portal:     { path: '/platform/apps/employee-portal', color: '#14b8a6', live: false },
    general_tickets:     { path: '/platform/apps/general-tickets', color: '#f97316', live: false },
    work_orders:         { path: '/platform/apps/work-orders',     color: '#ef4444', live: false },
    quality_of_service:  { path: '/platform/apps/quality-of-service', color: '#3b82f6', live: false },
};

export default {
    name: 'Dashboard',
    setup() {
        useMeta({ title: 'Dashboard' });
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        },
    },
    data() {
        return {
            apps: [],
            loading: false,
        };
    },
    methods: {
        loadApps() {
            this.loading = true;
            AppRoleDataService.getApps()
                .then((res) => {
                    const raw = res.data.data || res.data;
                    this.apps = raw.map((a) => {
                        const meta = APP_META[a.key] || {};
                        return {
                            key: a.key,
                            name: a.name,
                            description: a.description || '',
                            icon: a.icon,
                            path: meta.path || '/platform/apps',
                            color: a.color || meta.color || '#64748b',
                            live: !!a.is_existing,
                        };
                    });
                })
                .finally(() => { this.loading = false; });
        },
    },
    created() {
        this.loadApps();
    },
};
