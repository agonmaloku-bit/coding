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
                            #{{ contract && contract.serial_number }}
                            <span class="cwd-dot">·</span>
                            {{ contract && contract.contract_type && contract.contract_type.name }}
                        </div>
                        <h2 class="cwd-title">{{ contract && contract.name }}</h2>
                        <div class="cwd-sub">
                            <span class="cwd-badge" :class="statusClass">
                                <i class="fas" :class="statusIcon"></i>
                                {{ statusLabel }}
                            </span>
                            <span v-if="contract" class="cwd-meta">
                                <i class="far fa-user"></i>
                                {{ creatorName }}
                            </span>
                            <span v-if="contract && contract.deadline_to" class="cwd-meta">
                                <i class="far fa-calendar"></i>
                                {{ contract.deadline_from }} → {{ contract.deadline_to }}
                            </span>
                        </div>
                    </div>
                    <button class="cwd-close" @click="$emit('close')" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
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

                <!-- Details strip: quick-glance of all the contract fields -->
                <section class="cwd-details" v-if="contract">
                    <header class="cwd-details-head" @click="detailsOpen = !detailsOpen">
                        <span class="cwd-details-title">
                            <i class="fas fa-info-circle"></i>
                            Contract details
                        </span>
                        <span class="cwd-details-toggle">
                            <i class="fas" :class="detailsOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                        </span>
                    </header>
                    <div v-show="detailsOpen" class="cwd-details-grid">
                        <div class="cwd-field"><span class="cwd-field-k">Id</span><span class="cwd-field-v">#{{ contract.id }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">File number</span><span class="cwd-field-v">{{ contract.serial_number || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Type</span><span class="cwd-field-v">{{ contract.contract_type && contract.contract_type.name || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Contractor</span><span class="cwd-field-v">{{ (contract.supplier && contract.supplier.name) || contract.name_of_contractor || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Address</span><span class="cwd-field-v">{{ contract.address || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Start date</span><span class="cwd-field-v">{{ contract.deadline_from || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Due date</span><span class="cwd-field-v">{{ contract.deadline_to || 'No deadline' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Company</span><span class="cwd-field-v">{{ companyName || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Department</span><span class="cwd-field-v">{{ departmentName || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Responsible</span><span class="cwd-field-v">{{ responsibleName || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Total price</span><span class="cwd-field-v">{{ contract.total_price != null ? contract.total_price + ' €' : '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Unit price</span><span class="cwd-field-v">{{ contract.unit_price != null ? contract.unit_price + ' €' : '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Payment date</span><span class="cwd-field-v">{{ contract.payment_date || '—' }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Step</span><span class="cwd-field-v">{{ contract.step != null ? 'Step ' + contract.step + (steps.length ? ' / ' + steps.length : '') : '—' }}</span></div>
                        <div class="cwd-field cwd-field--wide" v-if="contract.purpose_contractor">
                            <span class="cwd-field-k">Purpose</span><span class="cwd-field-v">{{ contract.purpose_contractor }}</span>
                        </div>
                        <div class="cwd-field cwd-field--wide" v-if="contract.payment_terms">
                            <span class="cwd-field-k">Payment terms</span><span class="cwd-field-v">{{ contract.payment_terms }}</span>
                        </div>
                        <div class="cwd-field cwd-field--wide" v-if="contract.contractor_obligations">
                            <span class="cwd-field-k">Contractor obligations</span><span class="cwd-field-v">{{ contract.contractor_obligations }}</span>
                        </div>
                        <div class="cwd-field cwd-field--wide" v-if="contract.company_obligations">
                            <span class="cwd-field-k">Company obligations</span><span class="cwd-field-v">{{ contract.company_obligations }}</span>
                        </div>
                        <div class="cwd-field"><span class="cwd-field-k">Created</span><span class="cwd-field-v">{{ formatDate(contract.created_at) }}</span></div>
                        <div class="cwd-field"><span class="cwd-field-k">Updated</span><span class="cwd-field-v">{{ formatDate(contract.updated_at) }}</span></div>
                    </div>
                </section>

                <!-- Body: lanes (left) + activity (right) -->
                <div class="cwd-body">
                    <!-- Lanes -->
                    <section class="cwd-lanes" :class="{ 'cwd-pane--collapsed': !lanesOpen }">
                        <header class="cwd-section-head" @click="lanesOpen = !lanesOpen">
                            <h3 class="cwd-section-title">
                                <i class="fas fa-stream"></i>
                                {{ $t ? $t('contracts.workflow.lanesTitle') || 'Workflow' : 'Workflow' }}
                            </h3>
                            <span class="cwd-section-toggle" :aria-expanded="lanesOpen">
                                <i class="fas" :class="lanesOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                            </span>
                        </header>
                        <div v-show="lanesOpen" class="cwd-section-body">

                        <!-- Initial submission (step 0) — creator and the
                             attachments / comment from the request stage. -->
                        <article class="cwd-lane cwd-lane-creator">
                            <div class="cwd-lane-marker">
                                <span class="cwd-lane-num"><i class="fas fa-flag"></i></span>
                            </div>
                            <div class="cwd-lane-body">
                                <div class="cwd-lane-head">
                                    <strong>{{ creatorName || 'Requester' }}</strong>
                                    <span class="cwd-pill cwd-pill-done">
                                        {{ $t ? $t('contracts.workflow.requested') || 'Requested' : 'Requested' }}
                                    </span>
                                </div>
                                <div class="cwd-lane-meta">
                                    <i class="far fa-paper-plane"></i>
                                    {{ $t ? $t('contracts.workflow.initialSubmission') || 'Initial submission' : 'Initial submission' }}
                                    <span v-if="contract && contract.created_at"> · {{ formatDate(contract.created_at) }}</span>
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
                                    {{ $t ? $t('contracts.workflow.noInitialAttachments') || 'No attachments uploaded at request time' : 'No attachments uploaded at request time' }}
                                </div>
                            </div>
                        </article>

                        <div v-if="!steps.length" class="cwd-empty">
                            {{ $t ? $t('contracts.workflow.noTemplate') || 'No workflow template assigned' : 'No workflow template assigned' }}
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
                                        :placeholder="$t ? $t('contracts.workflow.commentPlaceholder') || 'Add a comment for this step…' : 'Add a comment…'"
                                        rows="2"
                                        class="form-control cwd-textarea"
                                    ></textarea>
                                    <div class="cwd-file-pick">
                                        <input
                                            type="file"
                                            ref="composerFile"
                                            multiple
                                            @change="onComposerFiles"
                                        />
                                        <span v-if="composer.fileLabel" class="cwd-file-label">{{ composer.fileLabel }}</span>
                                    </div>
                                    <div class="cwd-action-row">
                                        <button class="btn btn-sm btn-success" :disabled="busy" @click="submitApprove">
                                            <i class="fas fa-check"></i>
                                            {{ $t ? $t('common.approve') : 'Approve' }}
                                        </button>
                                        <button class="btn btn-sm btn-warning" :disabled="busy" @click="submitRequestChanges">
                                            <i class="fas fa-undo"></i>
                                            {{ $t ? $t('contracts.workflow.requestChanges') || 'Request changes' : 'Request changes' }}
                                        </button>
                                        <button class="btn btn-sm btn-danger" :disabled="busy" @click="submitCancel">
                                            <i class="fas fa-times"></i>
                                            {{ $t ? $t('contracts.cancelContract') || 'Cancel contract' : 'Cancel contract' }}
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
                                {{ $t ? $t('contracts.workflow.activity') || 'Activity' : 'Activity' }}
                            </h3>
                            <span class="cwd-section-toggle" :aria-expanded="activityOpen">
                                <i class="fas" :class="activityOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                            </span>
                        </header>
                        <div v-show="activityOpen" class="cwd-section-body">

                        <div v-if="loadingTimeline" class="cwd-empty">
                            <i class="fas fa-spinner fa-spin"></i>
                            {{ $t ? $t('common.loading') || 'Loading…' : 'Loading…' }}
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
                                    <!-- Files posted alongside this comment/event are merged in. -->
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

                        <!-- Free-form comment + attachment composer.
                             Available on every contract regardless of status
                             so users can keep a record/exchange documents
                             even after final approval. -->
                        <div v-if="canComment" class="cwd-add-comment">
                            <textarea
                                v-model="freeComment"
                                rows="2"
                                class="form-control cwd-textarea"
                                :placeholder="$t ? $t('contracts.workflow.addCommentPlaceholder') || 'Leave a comment on this contract…' : 'Leave a comment…'"
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
                                <i class="far fa-comment"></i>
                                {{ $t ? $t('common.post') || 'Post' : 'Post' }}
                            </button>
                        </div>
                        </div>
                    </section>
                </div>

                <!-- Footer: admin tools -->
                <footer v-if="canReassign" class="cwd-footer">
                    <button class="btn btn-sm btn-outline-secondary" @click="reassignOpen = !reassignOpen">
                        <i class="fas fa-user-edit"></i>
                        {{ $t ? $t('contracts.workflow.reassign') || 'Reassign responsible' : 'Reassign responsible' }}
                    </button>
                    <div v-if="reassignOpen" class="cwd-reassign">
                        <select v-model="reassign.userId" class="form-control form-control-sm">
                            <option :value="null">— {{ $t ? $t('contracts.workflow.selectUser') || 'select user' : 'select user' }} —</option>
                            <option v-for="u in users" :key="u.id" :value="u.id">
                                {{ u.first_name }} {{ u.last_name }} <template v-if="u.roles && u.roles.length">— {{ u.roles[0].name }}</template>
                            </option>
                        </select>
                        <input
                            v-model="reassign.comment"
                            type="text"
                            class="form-control form-control-sm"
                            :placeholder="$t ? $t('contracts.workflow.reassignReason') || 'Reason (optional)' : 'Reason (optional)'"
                        />
                        <button class="btn btn-sm btn-primary" :disabled="busy || !reassign.userId" @click="submitReassign">
                            <i class="fas fa-paper-plane"></i>
                            {{ $t ? $t('common.confirm') || 'Confirm' : 'Confirm' }}
                        </button>
                    </div>
                </footer>
            </aside>
        </div>
    </teleport>
</template>

<script>
export default {
    name: 'ContractWorkflowDrawer',
    props: {
        open: { type: Boolean, default: false },
        contract: { type: Object, default: null },
        timeline: { type: Array, default: () => [] },
        loadingTimeline: { type: Boolean, default: false },
        currentUser: { type: Object, default: null },
        users: { type: Array, default: () => [] },
        canApproveProp: { type: Boolean, default: false },
        canReassign: { type: Boolean, default: false },
        canComment: { type: Boolean, default: true },
        busy: { type: Boolean, default: false },
    },
    emits: ['close', 'approve', 'request-changes', 'cancel', 'reassign', 'comment', 'download-file'],
    data() {
        return {
            composer: { comment: '', files: null, fileLabel: '' },
            freeComment: '',
            freeFiles: null,
            freeFileLabel: '',
            reassignOpen: false,
            reassign: { userId: null, comment: '' },
            detailsOpen: false,
            lanesOpen: true,
            activityOpen: true,
        };
    },
    computed: {
        steps() {
            const t = this.contract && this.contract.workflow_template;
            if (t && Array.isArray(t.steps)) {
                return [...t.steps].sort((a, b) => a.step_order - b.step_order);
            }
            return [];
        },
        statusLabel() {
            const map = {
                1: 'Archived',
                2: 'Requested',
                3: 'In progress',
                4: 'Canceled',
                5: 'Approved',
            };
            return (this.contract && map[this.contract.status]) || '—';
        },
        statusClass() {
            const map = {
                1: 'cwd-st-archive',
                2: 'cwd-st-request',
                3: 'cwd-st-progress',
                4: 'cwd-st-cancel',
                5: 'cwd-st-approved',
            };
            return (this.contract && map[this.contract.status]) || '';
        },
        statusIcon() {
            const map = {
                1: 'fa-archive',
                2: 'fa-paper-plane',
                3: 'fa-spinner',
                4: 'fa-ban',
                5: 'fa-check-circle',
            };
            return (this.contract && map[this.contract.status]) || 'fa-circle';
        },
        creatorName() {
            const c = this.contract && this.contract.created_by;
            return c ? `${c.first_name} ${c.last_name}` : '';
        },
        creatorFiles() {
            // Files attached at request time are saved with step = 0 (or
            // null). They belong to the requester, not to any workflow lane.
            if (!this.contract || !Array.isArray(this.contract.files)) return [];
            return this.contract.files.filter(f => {
                const s = Number(f.step);
                return !s || s <= 0;
            });
        },
        responsibleName() {
            const r = this.contract && this.contract.responsible_person;
            return r ? `${r.first_name || ''} ${r.last_name || ''}`.trim() : '';
        },
        departmentName() {
            const r = this.contract && this.contract.responsible_person;
            if (r && r.department && r.department.name) return r.department.name;
            if (this.contract && this.contract.department && this.contract.department.name) return this.contract.department.name;
            return '';
        },
        companyName() {
            const r = this.contract && this.contract.responsible_person;
            if (r && r.department && r.department.company && r.department.company.name) return r.department.company.name;
            if (this.contract && this.contract.department && this.contract.department.company && this.contract.department.company.name) return this.contract.department.company.name;
            return '';
        },
        canActOnCurrent() {
            if (!this.canApproveProp || !this.contract) return false;
            if (this.contract.status === 4 || this.contract.status === 5) return false;
            const cur = this.steps.find(s => s.step_order === this.contract.step);
            if (!cur) return false;
            if (!this.currentUser || !this.currentUser.roles || !this.currentUser.roles.length) return false;
            const role = this.currentUser.roles[0].name;
            if (role === 'Super Admin') return true;
            return cur.role && cur.role.name === role;
        },
        /**
         * Merge file events into the comment / approval that triggered them
         * so the timeline shows attachments inline under the message text
         * instead of as separate rows. A file is considered part of an
         * adjacent comment when both share the same user and step and were
         * created within ±15 seconds.
         */
        groupedTimeline() {
            const events = Array.isArray(this.timeline) ? [...this.timeline] : [];
            const TOLERANCE_MS = 15000;
            const isCommentLike = (t) => ['comment', 'approval', 'request_changes', 'cancel', 'reassign'].includes(t);
            const ts = (s) => { try { return new Date(s).getTime(); } catch (e) { return 0; } };
            const consumed = new Set();
            const out = [];
            events.forEach((e, idx) => {
                if (consumed.has(idx)) return;
                if (e.type === 'file') {
                    // Try to find a sibling comment-like event to attach this file to.
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
            if (!this.contract) return 'pending';
            if (this.contract.status === 5) return 'done';
            if (this.contract.status === 4) {
                return step.step_order < this.contract.step ? 'done' : 'canceled';
            }
            if (step.step_order < this.contract.step) return 'done';
            if (step.step_order === this.contract.step) return 'current';
            return 'pending';
        },
        laneStateLabel(step) {
            const s = this.laneState(step);
            return { done: 'Approved', current: 'Awaiting', pending: 'Pending', canceled: 'Canceled' }[s] || s;
        },
        segmentClass(step) {
            return 'cwd-seg-' + this.laneState(step);
        },
        laneClass(step) {
            return 'cwd-lane-' + this.laneState(step);
        },
        laneApprovers(step) {
            if (!this.contract || !Array.isArray(this.contract.comments)) return [];
            return this.contract.comments
                .filter(c => c.steps === step.step_order && c.approved_at && !c.canceled)
                .map(c => ({
                    id: c.id,
                    user_name: c.user ? `${c.user.first_name} ${c.user.last_name}` : '',
                    at: c.approved_at,
                }));
        },
        laneComments(step) {
            if (!this.contract || !Array.isArray(this.contract.comments)) return [];
            return this.contract.comments
                .filter(c => c.steps === step.step_order && (!c.approved_at || c.canceled))
                .map(c => ({
                    id: c.id,
                    user_name: c.user ? `${c.user.first_name} ${c.user.last_name}` : '',
                    at: c.created_at,
                    message: c.name,
                }));
        },
        laneFiles(step) {
            if (!this.contract || !Array.isArray(this.contract.files)) return [];
            const order = Number(step.step_order);
            return this.contract.files.filter(f => Number(f.step) === order);
        },
        eventIcon(type) {
            return {
                created: 'fa-plus-circle',
                comment: 'fa-comment',
                approval: 'fa-check-circle',
                request_changes: 'fa-undo',
                cancel: 'fa-ban',
                reassign: 'fa-user-edit',
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
        onComposerFiles(e) {
            const files = e.target.files;
            this.composer.files = files;
            this.composer.fileLabel = files && files.length
                ? Array.from(files).map(f => f.name).join(', ')
                : '';
        },
        submitApprove() {
            this.$emit('approve', { comment: this.composer.comment, files: this.composer.files });
            this.composer = { comment: '', files: null, fileLabel: '' };
        },
        submitRequestChanges() {
            if (!this.composer.comment.trim()) {
                window.alert('Please add a comment explaining what needs changing.');
                return;
            }
            this.$emit('request-changes', { comment: this.composer.comment, files: this.composer.files });
            this.composer = { comment: '', files: null, fileLabel: '' };
        },
        submitCancel() {
            if (!this.composer.comment.trim()) {
                window.alert('Please add a reason for cancellation.');
                return;
            }
            this.$emit('cancel', { comment: this.composer.comment });
            this.composer = { comment: '', files: null, fileLabel: '' };
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
        submitReassign() {
            this.$emit('reassign', { userId: this.reassign.userId, comment: this.reassign.comment });
            this.reassign = { userId: null, comment: '' };
            this.reassignOpen = false;
        },
    },
};
</script>

<style scoped>
.cwd-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(2px);
    /* Sit below SweetAlert2's container (z-index 1060) so that the
       confirmation / please-wait modal pops in front of the drawer. */
    z-index: 1040;
    display: flex;
    justify-content: flex-end;
}
.cwd-drawer {
    width: min(1100px, 96vw);
    height: 100vh;
    background: #f8fafc;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    animation: cwd-slide 220ms ease-out;
}
@keyframes cwd-slide {
    from { transform: translateX(60px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
}

.cwd-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 22px 26px 14px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
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

.cwd-progress { display: flex; gap: 4px; padding: 8px 26px 12px; background: #fff; border-bottom: 1px solid #e5e7eb; }
.cwd-progress-segment { flex: 1; height: 6px; border-radius: 999px; background: #e2e8f0; }
.cwd-seg-done    { background: #10b981; }
.cwd-seg-current { background: #f59e0b; }
.cwd-seg-pending { background: #e2e8f0; }
.cwd-seg-canceled{ background: #ef4444; }

.cwd-details {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
}
.cwd-details-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 26px;
    cursor: pointer;
    user-select: none;
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
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 6px 18px;
    padding: 4px 26px 14px;
    max-height: 40vh;
    overflow-y: auto;
}
.cwd-field {
    display: flex; flex-direction: column;
    padding: 6px 0;
    border-bottom: 1px dashed #f1f5f9;
    min-width: 0;
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
    flex: 1; min-height: 0; display: grid; grid-template-columns: 1.4fr 1fr;
    gap: 0; overflow: hidden;
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
    /* On mobile, when a pane is expanded, cap its inner body so each
       section is independently scrollable rather than the whole drawer. */
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
.cwd-event-approval .cwd-event-icon       { border-color: #10b981; color: #10b981; }
.cwd-event-request_changes .cwd-event-icon{ border-color: #f59e0b; color: #f59e0b; }
.cwd-event-cancel .cwd-event-icon         { border-color: #ef4444; color: #ef4444; }
.cwd-event-created .cwd-event-icon        { border-color: #3b82f6; color: #3b82f6; }
.cwd-event-reassign .cwd-event-icon       { border-color: #8b5cf6; color: #8b5cf6; }

.cwd-event-body { flex: 1; min-width: 0; }
.cwd-event-head { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; color: #475569; }
.cwd-event-msg  { font-size: 13px; color: #0f172a; margin-top: 2px; word-break: break-word; }
.cwd-event-file { color: #1d4ed8; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
.cwd-event-file:hover { text-decoration: underline; }
.cwd-event-attachments { margin-top: 6px; display: flex; flex-direction: column; gap: 3px; padding-left: 4px; border-left: 2px solid #e5e7eb; padding-left: 10px; }
.cwd-event-attachments .cwd-event-file { font-size: 12.5px; }
.cwd-step-pill {
    display: inline-block; padding: 1px 8px; margin-right: 6px;
    border-radius: 999px; font-size: 11px; background: #f1f5f9; color: #475569;
}

.cwd-add-comment { margin-top: 16px; display: flex; gap: 8px; flex-direction: column; }
.cwd-add-comment button { align-self: flex-end; }

.cwd-footer {
    background: #ffffff; border-top: 1px solid #e5e7eb;
    padding: 12px 26px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
}
.cwd-reassign { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; align-items: center; }
.cwd-reassign select, .cwd-reassign input { flex: 1; min-width: 140px; }

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
    .cwd-title { font-size: 18px; margin: 2px 0 6px; }
    .cwd-eyebrow { font-size: 11px; }
    .cwd-sub { gap: 8px 12px; font-size: 12px; }
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

    .cwd-footer {
        padding: 10px 14px;
        gap: 8px;
        position: sticky; bottom: 0;
        background: #fff;
    }
    .cwd-reassign { flex-direction: column; align-items: stretch; }
    .cwd-reassign select, .cwd-reassign input { width: 100%; }
    .cwd-reassign .btn { width: 100%; }

    .cwd-section-title { font-size: 12px; }
    .cwd-section-head { padding: 8px; margin-left: 0; margin-right: 0; }
    .cwd-section-toggle { width: 28px; height: 28px; }
}
</style>
