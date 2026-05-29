<template>
  <section class="content-header">
    <div class="container-fluid">
      <h1 class="m-0">{{ $t('appHub.apps.employeePortal.title') }}</h1>
      <p class="module-subtitle">{{ $t('appHub.apps.employeePortal.description') }}</p>
    </div>
  </section>

  <section class="content">
    <div class="container-fluid">
      <div class="card module-card">
        <div class="card-body">
          <h5>{{ $t('appHub.underConstructionTitle') }}</h5>
          <p>{{ $t('appHub.employeePortalHint') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useMeta } from "vue-meta";

export default {
  name: "EmployeePortal",
  setup() {
    useMeta({ title: "Employee Portal" });
  },
};
</script>

<style scoped>
.module-subtitle {
  color: #64748b;
  margin-top: 0.35rem;
}

.module-card {
  border-top: 4px solid #14b8a6;
}
</style>
