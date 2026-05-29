<template>
    <teleport to="body">
        <div
            v-if="open"
            class="cwd-backdrop"
            @click.self="$emit('close')"
            role="dialog"
            aria-modal="true"
        >
            <aside class="cwd-drawer" @click.stop>
                <!-- Header -->
                <header class="cwd-header">
                    <div class="cwd-title-block">
                        <div class="cwd-eyebrow">
                            #{{ bill && (bill.bill_no || bill.id) }}
                            <span class="cwd-dot">·</span>
                            {{ bill && bill.type }}
                        </div>
                        <h2 class="cwd-title">{{ (bill && (bill.name || bill.description)) || '—' }}</h2>
                        <div class="cwd-sub">
                            <span class="cwd-badge" :class="statusClass">
                                <i class="fas" :class="statusIcon"></i>
                                {{ statusLabel }}
                            </span>
                            <span v-if="bill" class="cwd-meta">
                                <i class="far fa-user"></i>
                                {{ creatorName }}
                            </span>
                            <span v-if="bill && bill.created_at" class="cwd-meta">
                                <i class="far fa-calendar"></i>
                                {{ formatDate(bill.created_at) }}
                            </span>
                        </div>
                    </div>
                    <div class="cwd-header-actions">
                        <button
                            v-if="aiEnabled"
                            type="button"
                            class="cwd-ai-btn"
                            :title="aiVerify && aiVerify.loading ? 'Verifying…' : 'Verify with AI'"
                            :disabled="aiVerify && aiVerify.loading"
                            @click="$emit('verify-ai')"
                        >
                            <i class="fas" :class="aiVerify && aiVerify.loading ? 'fa-spinner fa-spin' : 'fa-magic'"></i>
                            <span>{{ aiVerify && aiVerify.loading ? 'Verifying…' : 'Verify with AI' }}</span>
                        </button>
                        <button
                            v-if="bill && bill.can_print"
                            type="button"
                            class="cwd-print-btn"
                            title="Print"
                            @click="$emit('print', bill.id)"
                        >
                            <i class="fas fa-print"></i>
                            <span>Print</span>
                        </button>
                        <button class="cwd-close" @click="$emit('close')" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </header>
                <!-- Progress bar -->
                <div class="cwd-progress" v-if="steps.length">
                    <div
                        v-for="(s, i) in steps"
                        :key="s.id || i"
                        class="cwd-progress-segment"
                        :class="segmentClass(s)"
                        :title="s.name || (s.role && s.role.name)"
                    ></div>
                </div>

                <!-- Details strip -->
                <section class="cwd-details" v-if="bill">
                    <header class="cwd-details-head" @click="detailsOpen = !detailsOpen">
                        <span class="cwd-details-title">
                            <i class="fas fa-info-circle"></i>
                            Bill details
                        </span>
                        <span class="cwd-details-toggle">
                            <i class="fas" :class="detailsOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                        </span>
                    </header>
                    <div v-show="detailsOpen" class="cwd-details-grid">
                        <div class="cwd-field"><span class="cwd-field-k">Id</span><span class="cwd-field-v">#{{ bill.id }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Bill no.</span><span class="cwd-field-v">{{ bill.bill_no || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Type</span><span class="cwd-field-v">{{ bill.type || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Supplier</span><span class="cwd-field-v">{{ bill.supplier || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Value</span><span class="cwd-field-v">{{ bill.value != null ? formatValue(bill.value) : '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Department</span><span class="cwd-field-v">{{ bill.assigned_dep_id || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Step</span><span class="cwd-field-v">{{ bill.step != null ? 'Step ' + bill.step + (steps.length ? ' / ' + steps.length : '') : '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Status</span><span class="cwd-field-v">{{ statusLabel }}</span></div>
                        <div class="cwd-field cwd-field--wide" v-if="bill.description">
                            <span class="cwd-field-k">Description</span><span class="cwd-field-v">{{ bill.description }}</span>
                        </div>
                        <div class="cwd-field"><span class="cwd-field-k">Created by</span><span class="cwd-field-v">{{ creatorName || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Created</span><span class="cwd-field-v">{{ formatDate(bill.created_at) }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Updated</span><span class="cwd-field-v">{{ formatDate(bill.updated_at) }}</span></div>
                    </div>
                </section>

                <!-- AI Verification panel -->
                <section
                    v-if="aiVerify && aiVerify.show"
                    class="cwd-ai-panel ai-verify-panel"
                    :class="['ai-verify--' + (aiVerify.severity || 'pending'), { 'ai-verify--collapsed': !aiOpen }]"
                >
                    <div class="ai-verify__head" @click="aiOpen = !aiOpen" role="button" :aria-expanded="aiOpen">
                        <i class="fas" :class="aiSeverityIcon(aiVerify.severity)"></i>
                        <strong>{{ $t ? $t('bills.workflow.aiVerifyTitle') || 'AI Verification' : 'AI Verification' }}</strong>
                        <span v-if="aiVerify.message" class="ai-verify__msg"> — {{ aiVerify.message }}</span>
                        <span class="ai-verify__toggle">
                            <i class="fas" :class="aiOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                        </span>
                    </div>
                    <div v-show="aiOpen" class="ai-verify__body">
                        <ul v-if="aiVerify.findings && aiVerify.findings.length" class="ai-verify__list">
                            <li
                                v-for="(f, i) in aiVerify.findings"
                                :key="i"
                                :class="'ai-issue--' + (f.severity || 'warn')"
                            >
                                <span class="ai-issue__sev">{{ (f.severity || 'warn').toUpperCase() }}</span>
                                <span class="ai-issue__msg">
                                    <strong v-if="f.field">{{ f.field }}:</strong>
                                    {{ f.message }}
                                    <small v-if="f.expected != null || f.actual != null">
                                        (expected <code>{{ f.expected }}</code>, found <code>{{ f.actual }}</code>)
                                    </small>
                                </span>
                            </li>
                        </ul>
                        <div v-else-if="aiVerify.severity === 'ok'" class="ai-verify__empty">{{ $t ? $t('bills.workflow.aiNoIssues') || 'No issues detected.' : 'No issues detected.' }}</div>
                    </div>
                </section>

                <!-- Body: lanes (left) + activity (right) -->
                <div class="cwd-body">
                    <!-- Lanes -->
                    <section class="cwd-lanes" :class="{ 'cwd-pane--collapsed': !lanesOpen }">
                        <header class="cwd-section-head" @click="lanesOpen = !lanesOpen">
                            <h3 class="cwd-section-title">
                                <i class="fas fa-stream"></i>
                                {{ $t ? $t('bills.workflow.lanesTitle') || 'Workflow' : 'Workflow' }}
                            </h3>
                            <span class="cwd-section-toggle" :aria-expanded="lanesOpen">
                                <i class="fas" :class="lanesOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                            </span>
                        </header>
                        <div v-show="lanesOpen" class="cwd-section-body">

                        <article class="cwd-lane cwd-lane-creator">
                            <div class="cwd-lane-marker">
                                <span class="cwd-lane-num"><i class="fas fa-flag"></i></span>
                            </div>
                            <div class="cwd-lane-body">
                                <div class="cwd-lane-head">
                                    <strong>{{ creatorName || 'Requester' }}</strong>
                                    <span class="cwd-pill cwd-pill-done">Requested</span>
                                </div>
                                <div class="cwd-lane-meta">
                                    <i class="far fa-paper-plane"></i>
                                    Initial submission
                                    <span v-if="bill && bill.created_at"> · {{ formatDate(bill.created_at) }}</span>
                                </div>
                                <div v-if="creatorFiles.length" class="cwd-lane-files">
                                    <a
                                        v-for="f in creatorFiles"
                                        :key="f.id"
                                        href="#"
                                        @click.prevent="$emit('download-file', f)"
                                        class="cwd-file"
                                    >
                                        <i class="far fa-fw" :class="fileIcon(f.file_extension)"></i>
                                        <span>{{ f.file_name || (f.file_id + '.' + f.file_extension) }}</span>
                                    </a>
                                </div>
                                <div v-else class="cwd-lane-meta cwd-lane-empty">
                                    No attachments uploaded at request time
                                </div>
                            </div>
                        </article>

                        <div v-if="!steps.length" class="cwd-empty">
                            No workflow template assigned
                        </div>

                        <article
                            v-for="(s, i) in steps"
                            :key="s.id || i"
                            class="cwd-lane"
                            :class="laneClass(s)"
                        >
                            <div class="cwd-lane-marker">
                                <span class="cwd-lane-num">{{ s.step_order }}</span>
                                <span v-if="laneState(s) === 'done'" class="cwd-lane-tick"><i class="fas fa-check"></i></span>
                                <span v-else-if="laneState(s) === 'current'" class="cwd-lane-pulse"></span>
                            </div>
                            <div class="cwd-lane-body">
                                <div class="cwd-lane-head">
                                    <strong>{{ s.name || (s.role && s.role.name) || 'Step ' + s.step_order }}</strong>
                                    <span class="cwd-pill" :class="'cwd-pill-' + laneState(s)">
                                        {{ laneStateLabel(s) }}
                                    </span>
                                </div>
                                <div class="cwd-lane-meta" v-if="s.role">
                                    <i class="far fa-id-badge"></i>
                                    {{ s.role.name }}
                                </div>
                                <div v-if="laneApprovers(s).length" class="cwd-lane-approvers">
                                    <div v-for="ap in laneApprovers(s)" :key="ap.id" class="cwd-approver">
                                        <i class="fas fa-check-circle"></i>
                                        <span>{{ ap.user_name }}</span>
                                        <small>{{ formatDate(ap.at) }}</small>
                                    </div>
                                </div>
                                <div v-if="laneComments(s).length" class="cwd-lane-notes">
                                    <div v-for="c in laneComments(s)" :key="c.id" class="cwd-note">
                                        <div class="cwd-note-head">
                                            <strong>{{ c.user_name }}</strong>
                                            <small>{{ formatDate(c.at) }}</small>
                                        </div>
                                        <p>{{ c.message }}</p>
                                    </div>
                                </div>
                                <div v-if="laneFiles(s).length" class="cwd-lane-files">
                                    <a
                                        v-for="f in laneFiles(s)"
                                        :key="f.id"
                                        href="#"
                                        @click.prevent="$emit('download-file', f)"
                                        class="cwd-file"
                                    >
                                        <i class="far fa-fw" :class="fileIcon(f.file_extension)"></i>
                                        <span>{{ f.file_name || (f.file_id + '.' + f.file_extension) }}</span>
                                    </a>
                                </div>

                                <!-- Action zone for current step -->
                                <div v-if="laneState(s) === 'current' && canActOnCurrent" class="cwd-lane-actions">
                                    <textarea
                                        v-model="composer.comment"
                                        placeholder="Add a comment for this step…"
                                        rows="2"
                                        class="form-control cwd-textarea"
                                    ></textarea>
                                    <div class="cwd-file-pick">
                                        <input
                                            type="file"
                                            ref="composerFile"
                                            @change="onComposerFile"
                                        />
                                        <span v-if="composer.fileLabel" class="cwd-file-label">{{ composer.fileLabel }}</span>
                                    </div>
                                    <div class="cwd-action-row">
                                        <button class="btn btn-sm btn-success" :disabled="busy" @click="submitApprove">
                                            <i class="fas fa-check"></i> Approve
                                        </button>
                                        <button class="btn btn-sm btn-danger" :disabled="busy" @click="submitCancel">
                                            <i class="fas fa-times"></i> Cancel bill
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                        </div>
                    </section>

                    <!-- Activity -->
                    <section class="cwd-activity" :class="{ 'cwd-pane--collapsed': !activityOpen }">
                        <header class="cwd-section-head" @click="activityOpen = !activityOpen">
                            <h3 class="cwd-section-title">
                                <i class="fas fa-history"></i>
                                {{ $t ? $t('bills.workflow.activity') || 'Activity' : 'Activity' }}
                            </h3>
                            <span class="cwd-section-toggle" :aria-expanded="activityOpen">
                                <i class="fas" :class="activityOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                            </span>
                        </header>
                        <div v-show="activityOpen" class="cwd-section-body">

                        <div v-if="loadingTimeline" class="cwd-empty">
                            <i class="fas fa-spinner fa-spin"></i> Loading…
                        </div>
                        <ul v-else class="cwd-timeline">
                            <li
                                v-for="(e, i) in groupedTimeline"
                                :key="i"
                                class="cwd-event"
                                :class="'cwd-event-' + e.type"
                            >
                                <span class="cwd-event-icon"><i class="fas" :class="eventIcon(e.type)"></i></span>
                                <div class="cwd-event-body">
                                    <div class="cwd-event-head">
                                        <strong>{{ e.user && e.user.name || 'System' }}</strong>
                                        <small>{{ formatDate(e.at) }}</small>
                                    </div>
                                    <div class="cwd-event-msg">
                                        <span v-if="e.step" class="cwd-step-pill">Step {{ e.step }}</span>
                                        <a v-if="e.type === 'file' && e.file"
                                           href="#"
                                           @click.prevent="$emit('download-file', e.file)"
                                           class="cwd-event-file">
                                            <i class="far fa-fw" :class="fileIcon(e.file.file_extension)"></i>
                                            {{ e.message }}
                                        </a>
                                        <span v-else>{{ e.message }}</span>
                                    </div>
                                    <div v-if="e.attachments && e.attachments.length" class="cwd-event-attachments">
                                        <a
                                            v-for="a in e.attachments"
                                            :key="a.id"
                                            href="#"
                                            @click.prevent="$emit('download-file', a)"
                                            class="cwd-event-file"
                                        >
                                            <i class="far fa-fw" :class="fileIcon(a.file_extension)"></i>
                                            {{ a.file_name || (a.file_id + '.' + a.file_extension) }}
                                        </a>
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <!-- Free-form comment + attachment composer -->
                        <div v-if="canComment" class="cwd-add-comment">
                            <textarea
                                v-model="freeComment"
                                rows="2"
                                class="form-control cwd-textarea"
                                placeholder="Leave a comment on this bill…"
                            ></textarea>
                            <div class="cwd-file-pick">
                                <input
                                    type="file"
                                    ref="freeFile"
                                    multiple
                                    @change="onFreeFiles"
                                />
                                <span v-if="freeFileLabel" class="cwd-file-label">{{ freeFileLabel }}</span>
                            </div>
                            <button
                                class="btn btn-sm btn-outline-primary"
                                :disabled="busy || (!freeComment.trim() && !freeFiles)"
                                @click="submitFreeComment"
                            >
                                <i class="far fa-comment"></i> Post
                            </button>
                        </div>
                        </div>
                    </section>
                </div>
            </aside>
        </div>
    </teleport>
</template>

<script>
export default {
    name: 'BillWorkflowDrawer',
    props: {
        open: { type: Boolean, default: false },
        bill: { type: Object, default: null },
        timeline: { type: Array, default: () => [] },
        loadingTimeline: { type: Boolean, default: false },
        currentUser: { type: Object, default: null },
        canApproveProp: { type: Boolean, default: false },
        canComment: { type: Boolean, default: true },
        busy: { type: Boolean, default: false },
        aiEnabled: { type: Boolean, default: false },
        aiVerify: {
            type: Object,
            default: () => ({ show: false, loading: false, severity: null, message: null, findings: [], extracted: null }),
        },
    },
    emits: ['close', 'approve', 'cancel', 'comment', 'download-file', 'print', 'verify-ai'],
    data() {
        return {
            composer: { comment: '', file: null, fileLabel: '' },
            freeComment: '',
            freeFiles: null,
            freeFileLabel: '',
            detailsOpen: false,
            lanesOpen: true,
            activityOpen: true,
            aiOpen: true,
        };
    },
    computed: {
        steps() {
            const t = this.bill && this.bill.workflow_template;
            if (t && Array.isArray(t.steps)) {
                return [...t.steps].sort((a, b) => a.step_order - b.step_order);
            }
            return [];
        },
        statusLabel() {
            const map = {
                1: 'Requested',
                2: 'Pending',
                3: 'Approved by CEO',
                4: 'Canceled',
                5: 'Approved (Admin)',
                6: 'Printed & Closed',
                7: 'Delivered to Finances',
            };
            return (this.bill && map[this.bill.status]) || '—';
        },
        statusClass() {
            const map = {
                1: 'cwd-st-request',
                2: 'cwd-st-progress',
                3: 'cwd-st-approved',
                4: 'cwd-st-cancel',
                5: 'cwd-st-approved',
                6: 'cwd-st-archive',
                7: 'cwd-st-archive',
            };
            return (this.bill && map[this.bill.status]) || '';
        },
        statusIcon() {
            const map = {
                1: 'fa-paper-plane',
                2: 'fa-spinner',
                3: 'fa-user-check',
                4: 'fa-ban',
                5: 'fa-check-circle',
                6: 'fa-print',
                7: 'fa-truck-loading',
            };
            return (this.bill && map[this.bill.status]) || 'fa-circle';
        },
        creatorName() {
            const c = this.bill && this.bill.created_by;
            return c ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : '';
        },
        creatorFiles() {
            if (!this.bill || !Array.isArray(this.bill.files)) return [];
            return this.bill.files.filter(f => {
                const s = Number(f.step);
                return !s || s <= 0;
            });
        },
        canActOnCurrent() {
            if (!this.canApproveProp || !this.bill) return false;
            // Only act while bill is mid-workflow
            if (![1, 2].includes(this.bill.status)) return false;
            const cur = this.steps.find(s => s.step_order === this.bill.step);
            if (!cur) return false;
            if (!this.currentUser || !this.currentUser.roles || !this.currentUser.roles.length) return false;
            const role = this.currentUser.roles[0].name;
            if (role === 'Super Admin') return true;
            return cur.role && cur.role.name === role;
        },
        groupedTimeline() {
            const events = Array.isArray(this.timeline) ? [...this.timeline] : [];
            const TOLERANCE_MS = 15000;
            const isCommentLike = (t) => ['comment', 'approval', 'cancel'].includes(t);
            const ts = (s) => { try { return new Date(s).getTime(); } catch (e) { return 0; } };
            const consumed = new Set();
            const out = [];
            events.forEach((e, idx) => {
                if (consumed.has(idx)) return;
                if (e.type === 'file') {
                    const fTime = ts(e.at);
                    const fStep = Number(e.step);
                    const fUser = e.user && e.user.id;
                    const sibling = events.findIndex((c, j) => (
                        j !== idx
                        && !consumed.has(j)
                        && isCommentLike(c.type)
                        && Number(c.step) === fStep
                        && (c.user && c.user.id) === fUser
                        && Math.abs(ts(c.at) - fTime) <= TOLERANCE_MS
                    ));
                    if (sibling !== -1) {
                        if (!events[sibling].attachments) events[sibling].attachments = [];
                        events[sibling].attachments.push(e.file || {
                            id: e.id, file_id: e.file_id, file_extension: e.file_extension, file_name: e.message,
                        });
                        consumed.add(idx);
                        return;
                    }
                }
                out.push(e);
            });
            return out;
        },
    },
    methods: {
        laneState(step) {
            if (!this.bill) return 'pending';
            // Final/closed states — every defined step counts as done.
            if ([3, 5, 6, 7].includes(this.bill.status)) return 'done';
            if (this.bill.status === 4) {
                return step.step_order < this.bill.step ? 'done' : 'canceled';
            }
            if (step.step_order < this.bill.step) return 'done';
            if (step.step_order === this.bill.step) return 'current';
            return 'pending';
        },
        laneStateLabel(step) {
            const s = this.laneState(step);
            return { done: 'Approved', current: 'Awaiting', pending: 'Pending', canceled: 'Canceled' }[s] || s;
        },
        segmentClass(step) { return 'cwd-seg-' + this.laneState(step); },
        laneClass(step)    { return 'cwd-lane-' + this.laneState(step); },
        laneApprovers(step) {
            if (!this.bill || !Array.isArray(this.bill.comments)) return [];
            return this.bill.comments
                .filter(c => Number(c.steps) === Number(step.step_order) && c.approved_at && !c.canceled)
                .map(c => ({
                    id: c.id,
                    user_name: c.user ? `${c.user.first_name} ${c.user.last_name}` : '',
                    at: c.approved_at,
                }));
        },
        laneComments(step) {
            if (!this.bill || !Array.isArray(this.bill.comments)) return [];
            return this.bill.comments
                .filter(c => Number(c.steps) === Number(step.step_order) && (!c.approved_at || c.canceled))
                .map(c => ({
                    id: c.id,
                    user_name: c.user ? `${c.user.first_name} ${c.user.last_name}` : '',
                    at: c.created_at,
                    message: c.name,
                }));
        },
        laneFiles(step) {
            if (!this.bill || !Array.isArray(this.bill.files)) return [];
            const order = Number(step.step_order);
            return this.bill.files.filter(f => Number(f.step) === order);
        },
        eventIcon(type) {
            return {
                created: 'fa-plus-circle',
                comment: 'fa-comment',
                approval: 'fa-check-circle',
                cancel: 'fa-ban',
                file: 'fa-paperclip',
            }[type] || 'fa-circle';
        },
        fileIcon(ext) {
            const e = (ext || '').toLowerCase();
            if (['pdf'].includes(e)) return 'fa-file-pdf';
            if (['doc', 'docx'].includes(e)) return 'fa-file-word';
            if (['xls', 'xlsx', 'csv'].includes(e)) return 'fa-file-excel';
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(e)) return 'fa-file-image';
            return 'fa-file';
        },
        formatDate(s) {
            if (!s) return '';
            try { return new Date(s).toLocaleString(); } catch (e) { return s; }
        },
        formatValue(v) {
            const n = Number(v);
            if (isNaN(n)) return v;
            return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        },
        onComposerFile(e) {
            const file = e.target.files && e.target.files[0];
            this.composer.file = file || null;
            this.composer.fileLabel = file ? file.name : '';
        },
        submitApprove() {
            this.$emit('approve', { comment: this.composer.comment, file: this.composer.file });
            this.composer = { comment: '', file: null, fileLabel: '' };
            if (this.$refs.composerFile) this.$refs.composerFile.value = '';
        },
        submitCancel() {
            if (!this.composer.comment.trim()) {
                window.alert('Please add a reason for cancellation.');
                return;
            }
            this.$emit('cancel', { comment: this.composer.comment });
            this.composer = { comment: '', file: null, fileLabel: '' };
        },
        onFreeFiles(e) {
            const files = e.target.files;
            this.freeFiles = files;
            this.freeFileLabel = files && files.length
                ? Array.from(files).map(f => f.name).join(', ')
                : '';
        },
        submitFreeComment() {
            this.$emit('comment', { comment: this.freeComment, files: this.freeFiles });
            this.freeComment = '';
            this.freeFiles = null;
            this.freeFileLabel = '';
            if (this.$refs.freeFile) this.$refs.freeFile.value = '';
        },
        aiSeverityIcon(sev) {
            switch (sev) {
                case 'ok':      return 'fa-check-circle';
                case 'warn':    return 'fa-exclamation-triangle';
                case 'block':   return 'fa-times-circle';
                case 'error':   return 'fa-bug';
                case 'pending': return 'fa-spinner fa-spin';
                default:        return 'fa-magic';
            }
        },
    },
};
</script>

<style scoped>
.cwd-backdrop {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(2px);
    z-index: 1040;
    display: flex;
    justify-content: flex-end;
}
.cwd-drawer {
    width: min(1100px, 96vw);
    height: 100vh;
    background: #f8fafc;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.18);
    display: flex; flex-direction: column;
    animation: cwd-slide 220ms ease-out;
}
@keyframes cwd-slide {
    from { transform: translateX(60px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
}

.cwd-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 22px 26px 14px;
    background: #ffffff; border-bottom: 1px solid #e5e7eb;
}
.cwd-eyebrow { color: #64748b; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; }
.cwd-dot { margin: 0 6px; }
.cwd-title { margin: 4px 0 8px; font-size: 22px; font-weight: 600; color: #0f172a; }
.cwd-sub { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; color: #475569; font-size: 13px; }
.cwd-meta i { margin-right: 6px; opacity: .7; }

.cwd-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 500;
    border: 1px solid transparent;
}
.cwd-st-request  { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.cwd-st-progress { background: #fef3c7; color: #92400e; border-color: #fde68a; }
.cwd-st-approved { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
.cwd-st-cancel   { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
.cwd-st-archive  { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }

.cwd-close {
    background: transparent; border: none; color: #64748b; font-size: 18px; cursor: pointer;
    width: 32px; height: 32px; border-radius: 8px;
}
.cwd-close:hover { background: #f1f5f9; color: #0f172a; }
.cwd-header-actions { display: inline-flex; align-items: center; gap: 8px; }
.cwd-print-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: #ecfdf5; color: #047857;
    border: 1px solid #a7f3d0; border-radius: 8px;
    padding: 6px 12px; font-size: 12.5px; font-weight: 600;
    cursor: pointer; transition: background 0.15s, color 0.15s;
}
.cwd-print-btn:hover { background: #047857; color: #fff; }

.cwd-progress { display: flex; gap: 4px; padding: 8px 26px 12px; background: #fff; border-bottom: 1px solid #e5e7eb; }
.cwd-progress-segment { flex: 1; height: 6px; border-radius: 999px; background: #e2e8f0; }
.cwd-seg-done    { background: #10b981; }
.cwd-seg-current { background: #f59e0b; }
.cwd-seg-pending { background: #e2e8f0; }
.cwd-seg-canceled{ background: #ef4444; }

.cwd-details { background: #fff; border-bottom: 1px solid #e5e7eb; }
.cwd-details-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 26px; cursor: pointer; user-select: none;
}
.cwd-details-head:hover { background: #f8fafc; }
.cwd-details-title {
    font-size: 12px; font-weight: 700; color: #0f172a;
    text-transform: uppercase; letter-spacing: 0.04em;
    display: inline-flex; align-items: center; gap: 8px;
}
.cwd-details-title i { color: #6366f1; font-size: 13px; }
.cwd-details-toggle { color: #94a3b8; font-size: 12px; }
.cwd-details-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 6px 18px; padding: 4px 26px 14px;
    max-height: 40vh; overflow-y: auto;
}
.cwd-field {
    display: flex; flex-direction: column;
    padding: 6px 0; border-bottom: 1px dashed #f1f5f9; min-width: 0;
}
.cwd-field:last-child { border-bottom: 0; }
.cwd-field--wide { grid-column: 1 / -1; }
.cwd-field-k {
    font-size: 10.5px; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
}
.cwd-field-v {
    font-size: 12.5px; color: #0f172a; font-weight: 500;
    word-break: break-word; overflow-wrap: anywhere;
}
.cwd-field--wide .cwd-field-v { white-space: pre-wrap; line-height: 1.5; }

.cwd-body {
    flex: 1; min-height: 0; display: grid; grid-template-columns: 1.4fr 1fr; gap: 0; overflow: hidden;
}
@media (max-width: 900px) {
    .cwd-body {
        grid-template-columns: 1fr;
        grid-auto-rows: minmax(0, auto);
        overflow-y: auto;
    }
    .cwd-lanes, .cwd-activity {
        overflow-y: visible;
        border-right: 0;
    }
    .cwd-lanes { border-bottom: 1px solid #e5e7eb; }
    .cwd-lanes .cwd-section-body,
    .cwd-activity .cwd-section-body {
        max-height: 55vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    .cwd-details-grid { max-height: 50vh; }
}

.cwd-section-title {
    display: flex; align-items: center; gap: 8px; margin: 0;
    font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em;
    color: #475569;
}
.cwd-section-head {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; margin: 0 0 14px;
    cursor: pointer; user-select: none;
    padding: 4px 8px; margin-left: -8px; margin-right: -8px;
    border-radius: 6px;
}
.cwd-section-head:hover { background: rgba(148, 163, 184, 0.12); }
.cwd-section-toggle {
    color: #94a3b8; font-size: 12px;
    width: 22px; height: 22px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 6px;
}
.cwd-pane--collapsed { flex: 0 0 auto; }
.cwd-pane--collapsed .cwd-section-head { margin-bottom: 0; }

.cwd-lanes, .cwd-activity { padding: 22px 26px; overflow-y: auto; min-height: 0; }
.cwd-lanes { border-right: 1px solid #e5e7eb; background: #f8fafc; }
.cwd-activity { background: #ffffff; }

.cwd-empty { padding: 18px; color: #94a3b8; text-align: center; font-size: 13px; }

.cwd-lane {
    display: flex; gap: 14px;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
    padding: 14px 16px; margin-bottom: 12px;
    transition: box-shadow .15s ease, border-color .15s ease;
}
.cwd-lane-current { border-color: #f59e0b; box-shadow: 0 4px 18px rgba(245, 158, 11, 0.12); }
.cwd-lane-done    { border-color: #d1fae5; }
.cwd-lane-canceled{ border-color: #fecaca; opacity: .85; }
.cwd-lane-creator { border-color: #c7d2fe; background: #eef2ff; }
.cwd-lane-creator .cwd-lane-num { background: #6366f1; color: #fff; }
.cwd-lane-empty   { color: #94a3b8; font-style: italic; margin-top: 6px; }

.cwd-lane-marker {
    flex: 0 0 36px; display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.cwd-lane-num {
    width: 32px; height: 32px; border-radius: 50%;
    background: #f1f5f9; color: #475569; font-weight: 600;
    display: inline-flex; align-items: center; justify-content: center;
}
.cwd-lane-done .cwd-lane-num { background: #10b981; color: #fff; }
.cwd-lane-current .cwd-lane-num { background: #f59e0b; color: #fff; }
.cwd-lane-canceled .cwd-lane-num { background: #ef4444; color: #fff; }
.cwd-lane-tick { color: #10b981; font-size: 13px; }
.cwd-lane-pulse {
    width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;
    box-shadow: 0 0 0 0 rgba(245, 158, 11, .6);
    animation: cwd-pulse 1.6s infinite;
}
@keyframes cwd-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(245, 158, 11, .6); }
    70%  { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
    100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}

.cwd-lane-body { flex: 1; min-width: 0; }
.cwd-lane-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.cwd-lane-meta { color: #64748b; font-size: 12px; margin-top: 2px; }
.cwd-lane-meta i { margin-right: 6px; }

.cwd-pill {
    padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 500;
    background: #f1f5f9; color: #475569;
}
.cwd-pill-done    { background: #ecfdf5; color: #065f46; }
.cwd-pill-current { background: #fffbeb; color: #92400e; }
.cwd-pill-canceled{ background: #fef2f2; color: #991b1b; }

.cwd-lane-approvers { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }
.cwd-approver { font-size: 12px; color: #065f46; display: flex; gap: 8px; align-items: center; }
.cwd-approver i { color: #10b981; }
.cwd-approver small { color: #94a3b8; margin-left: auto; }

.cwd-lane-notes { margin-top: 10px; }
.cwd-note {
    background: #f8fafc; border-left: 3px solid #cbd5e1;
    padding: 8px 10px; border-radius: 6px; margin-bottom: 6px;
}
.cwd-note-head { display: flex; justify-content: space-between; font-size: 12px; color: #475569; }
.cwd-note p { margin: 4px 0 0; font-size: 13px; color: #0f172a; white-space: pre-wrap; }

.cwd-lane-files { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }
.cwd-file {
    display: inline-flex; align-items: center; gap: 8px;
    color: #1d4ed8; text-decoration: none; font-size: 13px;
}
.cwd-file:hover { text-decoration: underline; }

.cwd-lane-actions {
    margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e5e7eb;
    display: flex; flex-direction: column; gap: 8px;
}
.cwd-textarea { font-size: 13px; }
.cwd-file-pick { font-size: 12px; color: #64748b; }
.cwd-file-pick input { font-size: 12px; }
.cwd-file-label { display: block; margin-top: 4px; color: #475569; }
.cwd-action-row { display: flex; gap: 8px; flex-wrap: wrap; }

.cwd-timeline { list-style: none; padding: 0; margin: 0; position: relative; }
.cwd-timeline::before {
    content: ''; position: absolute; left: 14px; top: 0; bottom: 0;
    width: 2px; background: #e5e7eb;
}
.cwd-event { display: flex; gap: 12px; padding: 8px 0 14px; position: relative; }
.cwd-event-icon {
    width: 30px; height: 30px; border-radius: 50%;
    background: #fff; border: 2px solid #e5e7eb;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; color: #64748b; z-index: 1;
}
.cwd-event-approval .cwd-event-icon { border-color: #10b981; color: #10b981; }
.cwd-event-cancel .cwd-event-icon   { border-color: #ef4444; color: #ef4444; }
.cwd-event-created .cwd-event-icon  { border-color: #3b82f6; color: #3b82f6; }

.cwd-event-body { flex: 1; min-width: 0; }
.cwd-event-head { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; color: #475569; }
.cwd-event-msg  { font-size: 13px; color: #0f172a; margin-top: 2px; word-break: break-word; }
.cwd-event-file { color: #1d4ed8; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
.cwd-event-file:hover { text-decoration: underline; }
.cwd-event-attachments { margin-top: 6px; display: flex; flex-direction: column; gap: 3px; padding-left: 10px; border-left: 2px solid #e5e7eb; }
.cwd-event-attachments .cwd-event-file { font-size: 12.5px; }
.cwd-step-pill {
    display: inline-block; padding: 1px 8px; margin-right: 6px;
    border-radius: 999px; font-size: 11px; background: #f1f5f9; color: #475569;
}

.cwd-add-comment { margin-top: 16px; display: flex; gap: 8px; flex-direction: column; }
.cwd-add-comment button { align-self: flex-end; }

/* ===== Mobile / small screens ===== */
@media (max-width: 640px) {
    .cwd-drawer {
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        height: 100dvh;
        box-shadow: none;
    }
    .cwd-header {
        padding: 14px 14px 10px;
        flex-wrap: wrap;
        gap: 8px;
    }
    .cwd-header-actions {
        order: 3;
        flex-basis: 100%;
        justify-content: flex-end;
        flex-wrap: wrap;
    }
    .cwd-title { font-size: 18px; margin: 2px 0 6px; }
    .cwd-eyebrow { font-size: 11px; }
    .cwd-sub { gap: 8px 12px; font-size: 12px; }
    .cwd-ai-btn, .cwd-print-btn { padding: 5px 10px; font-size: 12px; }
    .cwd-ai-btn span, .cwd-print-btn span { display: none; }
    .cwd-progress { padding: 6px 14px 10px; gap: 3px; }
    .cwd-progress-segment { height: 5px; }

    .cwd-details-head { padding: 10px 14px; }
    .cwd-details-grid {
        grid-template-columns: 1fr 1fr;
        gap: 4px 12px;
        padding: 4px 14px 12px;
        max-height: 45vh;
    }
    .cwd-field--wide { grid-column: 1 / -1; }
    .cwd-field-k { font-size: 10px; }
    .cwd-field-v { font-size: 12px; }

    .cwd-lanes, .cwd-activity { padding: 14px 14px; }
    .cwd-lanes .cwd-section-body,
    .cwd-activity .cwd-section-body { max-height: 60vh; }

    .cwd-lane { padding: 12px 12px; gap: 10px; border-radius: 10px; }
    .cwd-lane-marker { flex: 0 0 28px; }
    .cwd-lane-num { width: 26px; height: 26px; font-size: 12px; }
    .cwd-lane-head { flex-wrap: wrap; gap: 6px; }
    .cwd-pill { font-size: 10px; padding: 2px 8px; }
    .cwd-action-row .btn { flex: 1 1 auto; min-width: 0; font-size: 12px; }

    .cwd-event-icon { width: 26px; height: 26px; font-size: 11px; }
    .cwd-timeline::before { left: 12px; }
    .cwd-event-head { flex-wrap: wrap; gap: 4px; }

    .cwd-section-title { font-size: 12px; }
    .cwd-section-head { padding: 8px; margin-left: 0; margin-right: 0; }
    .cwd-section-toggle { width: 28px; height: 28px; }

    .cwd-ai-panel { margin: 0 14px 10px; }
}
</style>

<style scoped>
.cwd-ai-btn {
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    color: #3730a3;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: background .15s;
    margin-right: 6px;
}
.cwd-ai-btn:hover:not(:disabled) { background: #e0e7ff; }
.cwd-ai-btn:disabled { opacity: .6; cursor: not-allowed; }
.cwd-ai-panel { margin: 0 26px 12px; }
</style>

<style>
/* AI Verification panel — global so it works inside the teleported drawer */
.ai-verify-panel {
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 12px 14px;
}
.ai-verify-panel.ai-verify--ok      { border-color:#a7f3d0; background:#ecfdf5; }
.ai-verify-panel.ai-verify--warn    { border-color:#fde68a; background:#fffbeb; }
.ai-verify-panel.ai-verify--block   { border-color:#fecaca; background:#fef2f2; }
.ai-verify-panel.ai-verify--error   { border-color:#fecaca; background:#fef2f2; }
.ai-verify-panel.ai-verify--pending { border-color:#c7d2fe; background:#eef2ff; }
.ai-verify-panel .ai-verify__head {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.95rem; color: #0f172a;
    cursor: pointer; user-select: none;
}
.ai-verify-panel .ai-verify__head .ai-verify__toggle {
    margin-left: auto; color: #94a3b8; font-size: 12px;
    width: 22px; height: 22px;
    display: inline-flex; align-items: center; justify-content: center;
}
.ai-verify-panel .ai-verify__body { margin-top: 6px; }
.ai-verify-panel.ai-verify--collapsed .ai-verify__body { display: none; }
.ai-verify-panel .ai-verify__head i { font-size: 1.05rem; }
.ai-verify-panel.ai-verify--ok      .ai-verify__head i { color:#059669; }
.ai-verify-panel.ai-verify--warn    .ai-verify__head i { color:#b45309; }
.ai-verify-panel.ai-verify--block   .ai-verify__head i { color:#b91c1c; }
.ai-verify-panel.ai-verify--error   .ai-verify__head i { color:#b91c1c; }
.ai-verify-panel.ai-verify--pending .ai-verify__head i { color:#4338ca; }
.ai-verify-panel .ai-verify__msg { color:#475569; font-weight:400; font-size:0.85rem; }
.ai-verify-panel .ai-verify__list {
    list-style: none; margin: 10px 0 0; padding: 0;
    display: flex; flex-direction: column; gap: 6px;
    max-height: 40vh; overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
@media (max-width: 900px) {
    .ai-verify-panel .ai-verify__list { max-height: 35vh; }
}
.ai-verify-panel .ai-verify__list li {
    display: flex; gap: 10px; align-items: flex-start;
    background: #fff; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 8px 10px; font-size: 0.85rem;
}
.ai-verify-panel .ai-issue__sev {
    flex: 0 0 auto;
    font-size: 0.65rem; font-weight: 800; letter-spacing: 0.04em;
    padding: 3px 7px; border-radius: 999px;
    background: #e2e8f0; color: #334155; height: fit-content;
}
.ai-verify-panel .ai-verify__list li.ai-issue--ok    .ai-issue__sev { background:#d1fae5; color:#065f46; }
.ai-verify-panel .ai-verify__list li.ai-issue--warn  .ai-issue__sev { background:#fef3c7; color:#92400e; }
.ai-verify-panel .ai-verify__list li.ai-issue--block .ai-issue__sev { background:#fee2e2; color:#991b1b; }
.ai-verify-panel .ai-issue__msg { color: #0f172a; line-height: 1.4; }
.ai-verify-panel .ai-issue__msg small { color: #64748b; display: block; margin-top: 2px; }
.ai-verify-panel .ai-issue__msg code {
    background: #f1f5f9; color: #1d4ed8;
    padding: 1px 5px; border-radius: 4px; font-size: 0.78rem;
}
.ai-verify-panel .ai-verify__empty {
    margin-top: 8px; color: #065f46;
    font-size: 0.85rem; font-style: italic;
}

@media (max-width: 640px) {
    .ai-verify-panel { padding: 10px 12px; }
    .ai-verify-panel .ai-verify__head { font-size: 0.9rem; flex-wrap: wrap; }
    .ai-verify-panel .ai-verify__msg { flex-basis: 100%; font-size: 0.78rem; }
    .ai-verify-panel .ai-verify__list { max-height: 40vh; }
    .ai-verify-panel .ai-verify__list li { font-size: 0.8rem; padding: 7px 8px; gap: 8px; }
    .ai-verify-panel .ai-issue__sev { font-size: 0.6rem; padding: 2px 6px; }
    .ai-verify-panel .ai-issue__msg code { font-size: 0.72rem; }
}
</style>
