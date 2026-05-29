/**
 * Reusable dirty-state leave guard.
 *
 * Usage: include in a page component and implement `hasUnsavedChanges()` to
 * return a truthy value whenever there is work the user would lose if they
 * navigate away. The mixin hooks into `beforeunload` (reload / tab close)
 * and `beforeRouteLeave` (router navigation) and prompts the user to
 * confirm before losing the changes. Components can also call
 * `this.confirmDiscard()` directly when implementing their own close
 * buttons, e.g. in a modal.
 */
export default {
    methods: {
        hasUnsavedChanges() {
            // Default heuristic: warn when an add / edit modal is open.
            // Pages that track precise dirty state can override this method
            // to compare a snapshot of the form against current values.
            return !!(this.showAdd || this.showEdit);
        },
        confirmDiscard() {
            const msg = this.$t
                ? (this.$t('common.discardChangesPrompt')
                    || 'You have unsaved changes. Are you sure you want to discard them?')
                : 'You have unsaved changes. Are you sure you want to discard them?';
            return window.confirm(msg);
        },
        _dirtyGuardBeforeUnload(e) {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        },
    },
    beforeRouteLeave(to, from, next) {
        if (this.hasUnsavedChanges() && !this.confirmDiscard()) {
            return next(false);
        }
        next();
    },
    mounted() {
        window.addEventListener('beforeunload', this._dirtyGuardBeforeUnload);
    },
    beforeUnmount() {
        window.removeEventListener('beforeunload', this._dirtyGuardBeforeUnload);
    },
};
