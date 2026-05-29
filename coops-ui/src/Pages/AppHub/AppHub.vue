<template>
  <section class="content-header">
    <div class="container-fluid">
      <div class="row mb-2">
        <div class="col-sm-7">
          <h1 class="m-0">{{ $t('appHub.title') }}</h1>
          <p class="app-hub-subtitle">{{ $t('appHub.subtitle') }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="content">
    <div class="container-fluid">
      <div class="row">
        <div class="col-xl-4 col-md-6 mb-4" v-for="app in apps" :key="app.key">
          <div class="app-card" :style="{ '--app-color': app.color }">
            <div class="app-card-header">
              <div class="app-icon">
                <i :class="app.icon"></i>
              </div>
              <span class="badge" :class="app.statusClass">{{ app.status }}</span>
            </div>
            <h3>{{ app.name }}</h3>
            <p>{{ app.description }}</p>
            <router-link :to="app.path" class="app-open-link">
              {{ $t('appHub.openApp') }}
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useMeta } from "vue-meta";

export default {
  name: "AppHub",
  setup() {
    useMeta({ title: "Business Apps" });
  },
  computed: {
    apps() {
      return [
        {
          key: "contract_process",
          name: this.$t("appHub.apps.contractProcess.title"),
          description: this.$t("appHub.apps.contractProcess.description"),
          path: "/platform/apps/contracts",
          icon: "fas fa-file-contract",
          color: "#0ea5e9",
          status: this.$t("appHub.statusLive"),
          statusClass: "badge-success",
        },
        {
          key: "bills_invoice_process",
          name: this.$t("appHub.apps.billsInvoice.title"),
          description: this.$t("appHub.apps.billsInvoice.description"),
          path: "/platform/apps/bills",
          icon: "fas fa-file-invoice-dollar",
          color: "#10b981",
          status: this.$t("appHub.statusLive"),
          statusClass: "badge-success",
        },
        {
          key: "procurement_process",
          name: this.$t("appHub.apps.procurement.title"),
          description: this.$t("appHub.apps.procurement.description"),
          path: "/platform/apps/procurement",
          icon: "fas fa-shopping-cart",
          color: "#f59e0b",
          status: this.$t("appHub.statusPlanned"),
          statusClass: "badge-warning",
        },
        {
          key: "employee_portal",
          name: this.$t("appHub.apps.employeePortal.title"),
          description: this.$t("appHub.apps.employeePortal.description"),
          path: "/platform/apps/employee-portal",
          icon: "fas fa-users",
          color: "#14b8a6",
          status: this.$t("appHub.statusPlanned"),
          statusClass: "badge-warning",
        },
        {
          key: "general_tickets",
          name: this.$t("appHub.apps.generalTickets.title"),
          description: this.$t("appHub.apps.generalTickets.description"),
          path: "/platform/apps/general-tickets",
          icon: "fas fa-ticket-alt",
          color: "#f97316",
          status: this.$t("appHub.statusPlanned"),
          statusClass: "badge-warning",
        },
        {
          key: "work_orders",
          name: this.$t("appHub.apps.workOrders.title"),
          description: this.$t("appHub.apps.workOrders.description"),
          path: "/platform/apps/work-orders",
          icon: "fas fa-tools",
          color: "#ef4444",
          status: this.$t("appHub.statusPlanned"),
          statusClass: "badge-warning",
        },
        {
          key: "quality_of_service",
          name: this.$t("appHub.apps.qualityService.title"),
          description: this.$t("appHub.apps.qualityService.description"),
          path: "/platform/apps/quality-of-service",
          icon: "fas fa-chart-line",
          color: "#3b82f6",
          status: this.$t("appHub.statusPlanned"),
          statusClass: "badge-warning",
        },
      ];
    },
  },
};
</script>

<style scoped>
.app-hub-subtitle {
  color: #64748b;
  margin-top: 0.35rem;
}

.app-card {
  --app-color: #2563eb;
  background: linear-gradient(150deg, #ffffff 0%, #f8fafc 60%, #eef2ff 100%);
  border: 1px solid #e2e8f0;
  border-top: 4px solid var(--app-color);
  border-radius: 14px;
  padding: 1rem;
  min-height: 220px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.07);
  display: flex;
  flex-direction: column;
}

.app-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--app-color);
}

.app-card h3 {
  margin-top: 0.85rem;
  margin-bottom: 0.6rem;
  font-size: 1.1rem;
  color: #0f172a;
}

.app-card p {
  color: #475569;
  line-height: 1.4;
  flex: 1;
  margin-bottom: 1rem;
}

.app-open-link {
  text-decoration: none;
  font-weight: 600;
  color: var(--app-color);
}

.app-open-link i {
  margin-left: 0.45rem;
}
</style>
