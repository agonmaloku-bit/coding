<template>
    <div
        class="cw-card"
        :class="['cw-status-' + statusKey, { 'cw-card--compact': compact }]"
        @click="$emit('open', item.id)"
    >
        <div class="cw-card__stripe" :class="'cw-stripe-' + statusKey"></div>

        <div class="cw-card__body">
            <div class="cw-card__head">
                <div class="cw-card__title-wrap">
                    <div class="cw-card__serial">#{{ item.serial_number || item.id }}</div>
                    <div class="cw-card__title" :title="item.name">{{ item.name }}</div>
                </div>
                <span class="cw-pill" :class="'cw-pill-' + statusKey">
                    <i class="fas" :class="statusIcon"></i>
                    {{ statusLabel }}
                </span>
            </div>

            <div class="cw-card__meta">
                <div class="cw-meta-item" v-if="item.contract_type && item.contract_type.name">
                    <i class="fas fa-folder-open"></i>
                    <span>{{ item.contract_type.name }}</span>
                </div>
                <div class="cw-meta-item" v-if="contractor">
                    <i class="fas fa-building"></i>
                    <span>{{ contractor }}</span>
                </div>
                <div class="cw-meta-item">
                    <i class="far fa-calendar-alt"></i>
                    <span>{{ item.deadline_from || '—' }} <span class="cw-arrow">→</span> {{ item.deadline_to || $t('contracts.noDeadline') }}</span>
                </div>
            </div>

            <div class="cw-card__foot">
                <div class="cw-people">
                    <div class="cw-avatar" :title="responsibleName" v-if="responsibleName">
                        {{ responsibleInitials }}
                    </div>
                    <div class="cw-people-text" v-if="responsibleName">
                        <div class="cw-people-label">{{ $t('contracts.responsiblePerson') }}</div>
                        <div class="cw-people-name">{{ responsibleName }}</div>
                    </div>
                </div>

                <div class="cw-card__steps">
                    <span class="cw-step-chip" v-if="item.step != null">
                        <i class="fas fa-stream"></i>
                        Step {{ item.step }}<span v-if="totalSteps">/{{ totalSteps }}</span>
                    </span>
                </div>
            </div>

            <div class="cw-card__progress" v-if="totalSteps">
                <div
                    v-for="n in totalSteps"
                    :key="n"
                    class="cw-progress-seg"
                    :class="{
                        'is-done': item.status === 5 || (item.step != null && n < item.step),
                        'is-current': item.status !== 5 && item.status !== 4 && item.step === n,
                        'is-canceled': item.status === 4
                    }"
                ></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ContractCard",
    props: {
        item: { type: Object, required: true },
        compact: { type: Boolean, default: false }
    },
    emits: ["open"],
    computed: {
        statusKey() {
            switch (this.item.status) {
                case 1: return "archived";
                case 2: return "request";
                case 3: return "progress";
                case 4: return "canceled";
                case 5: return "approved";
                default: return "request";
            }
        },
        statusLabel() {
            switch (this.item.status) {
                case 1: return this.$t ? this.$t('contracts.statusValues.archived') || 'Archived' : 'Archived';
                case 2: return 'Request';
                case 3: return 'In Progress';
                case 4: return 'Canceled';
                case 5: return 'Approved';
                default: return '—';
            }
        },
        statusIcon() {
            switch (this.item.status) {
                case 1: return "fa-archive";
                case 2: return "fa-paper-plane";
                case 3: return "fa-spinner";
                case 4: return "fa-ban";
                case 5: return "fa-check-circle";
                default: return "fa-circle";
            }
        },
        contractor() {
            if (this.item.supplier && this.item.supplier.name) return this.item.supplier.name;
            return this.item.name_of_contractor || null;
        },
        responsibleName() {
            const r = this.item.responsible_person;
            if (!r) return null;
            return [r.first_name, r.last_name].filter(Boolean).join(' ');
        },
        responsibleInitials() {
            const r = this.item.responsible_person;
            if (!r) return '';
            return ((r.first_name || '?')[0] + (r.last_name || '')[0]).toUpperCase();
        },
        totalSteps() {
            if (this.item.workflow_template && Array.isArray(this.item.workflow_template.steps)) {
                return this.item.workflow_template.steps.length;
            }
            return 0;
        }
    }
};
</script>

<style scoped>
.cw-card {
    position: relative;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
    display: flex;
    min-height: 160px;
}
.cw-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
    border-color: #cbd5e1;
}
.cw-card__stripe {
    width: 6px;
    flex-shrink: 0;
}
.cw-stripe-request   { background: #f59e0b; }
.cw-stripe-progress  { background: #3b82f6; }
.cw-stripe-approved  { background: #10b981; }
.cw-stripe-canceled  { background: #ef4444; }
.cw-stripe-archived  { background: #6b7280; }

.cw-card__body { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.cw-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.cw-card__title-wrap { min-width: 0; }
.cw-card__serial { font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 0.04em; }
.cw-card__title {
    font-size: 14.5px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.cw-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.cw-pill i { font-size: 10px; }
.cw-pill-request   { background: #fef3c7; color: #92400e; }
.cw-pill-progress  { background: #dbeafe; color: #1d4ed8; }
.cw-pill-approved  { background: #d1fae5; color: #047857; }
.cw-pill-canceled  { background: #fee2e2; color: #b91c1c; }
.cw-pill-archived  { background: #e5e7eb; color: #374151; }

.cw-card__meta { display: flex; flex-direction: column; gap: 4px; }
.cw-meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: #475569;
    min-width: 0;
}
.cw-meta-item i { width: 14px; color: #94a3b8; flex-shrink: 0; }
.cw-meta-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cw-arrow { color: #cbd5e1; padding: 0 4px; }

.cw-card__foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: auto; }
.cw-people { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cw-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    letter-spacing: 0.02em;
}
.cw-people-text { min-width: 0; }
.cw-people-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.cw-people-name { font-size: 12.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }

.cw-step-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: #eef2ff;
    color: #4338ca;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
}

.cw-card__progress {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 3px;
    margin-top: 4px;
}
.cw-progress-seg {
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
    transition: background 0.2s;
}
.cw-progress-seg.is-done    { background: #10b981; }
.cw-progress-seg.is-current { background: #3b82f6; animation: cw-pulse 1.6s ease-in-out infinite; }
.cw-progress-seg.is-canceled{ background: #ef4444; }

@keyframes cw-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
}

.cw-card--compact { min-height: 0; }
.cw-card--compact .cw-card__body { padding: 10px 12px; gap: 6px; }
.cw-card--compact .cw-card__title { font-size: 13px; }
.cw-card--compact .cw-meta-item { font-size: 11.5px; }
.cw-card--compact .cw-people-name { font-size: 11.5px; }
.cw-card--compact .cw-card__progress { margin-top: 2px; }
</style>
