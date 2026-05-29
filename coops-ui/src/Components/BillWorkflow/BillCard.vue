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
                    <div class="cw-card__serial">#{{ item.bill_no || item.id }}</div>
                    <div class="cw-card__title" :title="item.name || item.description">
                        {{ item.name || item.description || '—' }}
                    </div>
                </div>
                <div class="cw-card__head-actions">
                    <button
                        v-if="item.can_print"
                        type="button"
                        class="cw-card__print"
                        title="Print"
                        @click.stop="$emit('print', item.id)"
                    >
                        <i class="fas fa-print"></i>
                    </button>
                    <span class="cw-pill" :class="'cw-pill-' + statusKey">
                        <i class="fas" :class="statusIcon"></i>
                        {{ statusLabel }}
                    </span>
                </div>
            </div>

            <div class="cw-card__meta">
                <div class="cw-meta-item" v-if="item.type">
                    <i class="fas fa-tag"></i>
                    <span>{{ item.type }}</span>
                </div>
                <div class="cw-meta-item" v-if="item.supplier">
                    <i class="fas fa-truck"></i>
                    <span>{{ item.supplier }}</span>
                </div>
                <div class="cw-meta-item" v-if="item.value != null">
                    <i class="fas fa-coins"></i>
                    <span>{{ formatValue(item.value) }}</span>
                </div>
                <div class="cw-meta-item" v-if="item.assigned_dep_id">
                    <i class="fas fa-building"></i>
                    <span>{{ item.assigned_dep_id }}</span>
                </div>
            </div>

            <div class="cw-card__foot">
                <div class="cw-people">
                    <div class="cw-avatar" :title="creatorName" v-if="creatorName">
                        {{ creatorInitials }}
                    </div>
                    <div class="cw-people-text" v-if="creatorName">
                        <div class="cw-people-label">Created by</div>
                        <div class="cw-people-name">{{ creatorName }}</div>
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
                        'is-done': isFinalStatus || (item.step != null && n < item.step),
                        'is-current': !isFinalStatus && item.status !== 4 && item.step === n,
                        'is-canceled': item.status === 4
                    }"
                ></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "BillCard",
    props: {
        item: { type: Object, required: true },
        compact: { type: Boolean, default: false }
    },
    emits: ["open", "print"],
    computed: {
        statusKey() {
            switch (this.item.status) {
                case 1: return "requested";
                case 2: return "pending";
                case 3: return "approvedceo";
                case 4: return "canceled";
                case 5: return "approvedadmin";
                case 6: return "printed";
                case 7: return "delivered";
                default: return "requested";
            }
        },
        statusLabel() {
            switch (this.item.status) {
                case 1: return "Requested";
                case 2: return "Pending";
                case 3: return "Approved by CEO";
                case 4: return "Canceled";
                case 5: return "Approved (Admin)";
                case 6: return "Printed & Closed";
                case 7: return "Delivered";
                default: return "—";
            }
        },
        statusIcon() {
            switch (this.item.status) {
                case 1: return "fa-paper-plane";
                case 2: return "fa-spinner";
                case 3: return "fa-user-check";
                case 4: return "fa-ban";
                case 5: return "fa-check-circle";
                case 6: return "fa-print";
                case 7: return "fa-truck-loading";
                default: return "fa-circle";
            }
        },
        isFinalStatus() {
            return [3, 5, 6, 7].includes(this.item.status);
        },
        creatorName() {
            const c = this.item.created_by;
            if (!c) return null;
            return [c.first_name, c.last_name].filter(Boolean).join(' ');
        },
        creatorInitials() {
            const c = this.item.created_by;
            if (!c) return '';
            return ((c.first_name || '?')[0] + (c.last_name || '')[0]).toUpperCase();
        },
        totalSteps() {
            if (this.item.workflow_template && Array.isArray(this.item.workflow_template.steps)) {
                return this.item.workflow_template.steps.length;
            }
            return 0;
        }
    },
    methods: {
        formatValue(v) {
            if (v == null || v === '') return '—';
            const n = Number(v);
            if (isNaN(n)) return v;
            return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
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
.cw-card__stripe { width: 6px; flex-shrink: 0; }
.cw-card__head-actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}
.cw-card__print {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    border: 1px solid #d1fae5;
    background: #ecfdf5;
    color: #047857;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    padding: 0;
    transition: background 0.15s, color 0.15s, transform 0.15s;
}
.cw-card__print:hover {
    background: #047857;
    color: #fff;
    transform: scale(1.05);
}
.cw-stripe-requested     { background: #f59e0b; }
.cw-stripe-pending       { background: #3b82f6; }
.cw-stripe-approvedceo   { background: #10b981; }
.cw-stripe-canceled      { background: #ef4444; }
.cw-stripe-approvedadmin { background: #059669; }
.cw-stripe-printed       { background: #6366f1; }
.cw-stripe-delivered     { background: #0ea5e9; }

.cw-card__body { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.cw-card__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.cw-card__title-wrap { min-width: 0; }
.cw-card__serial { font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 0.04em; }
.cw-card__title {
    font-size: 14.5px; font-weight: 600; color: #0f172a;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}

.cw-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
    white-space: nowrap; text-transform: uppercase; letter-spacing: 0.03em;
}
.cw-pill i { font-size: 10px; }
.cw-pill-requested     { background: #fef3c7; color: #92400e; }
.cw-pill-pending       { background: #dbeafe; color: #1d4ed8; }
.cw-pill-approvedceo   { background: #d1fae5; color: #047857; }
.cw-pill-canceled      { background: #fee2e2; color: #b91c1c; }
.cw-pill-approvedadmin { background: #d1fae5; color: #065f46; }
.cw-pill-printed       { background: #e0e7ff; color: #3730a3; }
.cw-pill-delivered     { background: #cffafe; color: #155e75; }

.cw-card__meta { display: flex; flex-direction: column; gap: 4px; }
.cw-meta-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #475569; min-width: 0; }
.cw-meta-item i { width: 14px; color: #94a3b8; flex-shrink: 0; }
.cw-meta-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.cw-card__foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: auto; }
.cw-people { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cw-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cw-people-text { min-width: 0; }
.cw-people-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.cw-people-name { font-size: 12.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }

.cw-step-chip {
    display: inline-flex; align-items: center; gap: 5px;
    background: #eef2ff; color: #4338ca;
    font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 8px;
}

.cw-card__progress { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 3px; margin-top: 4px; }
.cw-progress-seg { height: 4px; border-radius: 2px; background: #e2e8f0; transition: background 0.2s; }
.cw-progress-seg.is-done    { background: #10b981; }
.cw-progress-seg.is-current { background: #3b82f6; animation: cw-pulse 1.6s ease-in-out infinite; }
.cw-progress-seg.is-canceled{ background: #ef4444; }

@keyframes cw-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }

.cw-card--compact { min-height: 0; }
.cw-card--compact .cw-card__body { padding: 10px 12px; gap: 6px; }
.cw-card--compact .cw-card__title { font-size: 13px; }
.cw-card--compact .cw-meta-item { font-size: 11.5px; }
.cw-card--compact .cw-people-name { font-size: 11.5px; }
.cw-card--compact .cw-card__progress { margin-top: 2px; }
</style>
