import ContentHeader from "../../Modules/Main/ContentHeader/ContentHeader.vue";
import BreadcrumbItem from "../../Modules/Main/BreadcrumbItem/BreadcrumbItem.vue";
import Content from "../../Modules/Main/Content/Content.vue";
import AiDataService from "../../Services/AiDataService";

export default {
    name: "AiSettings",
    components: {
        "content-header": ContentHeader,
        "breadcrumb-item": BreadcrumbItem,
        "page-content": Content,
    },
    data() {
        return {
            loading: true,
            saving: false,
            testing: false,
            testResult: null, // { ok, message }
            form: {
                enabled: false,
                base_url: "https://api.openai.com/v1",
                model: "gpt-4o-mini",
                vision_enabled: true,
                api_key: "",
            },
            api_key_set: false,
            api_key_hint: null,
        };
    },
    mounted() {
        this.fetch();
    },
    methods: {
        async fetch() {
            this.loading = true;
            try {
                const res = await AiDataService.get();
                const d = res.data && res.data.data ? res.data.data : res.data;
                this.form.enabled        = !!d.enabled;
                this.form.base_url       = d.base_url       || "https://api.openai.com/v1";
                this.form.model          = d.model          || "gpt-4o-mini";
                this.form.vision_enabled = d.vision_enabled !== false;
                this.api_key_set         = !!d.api_key_set;
                this.api_key_hint        = d.api_key_hint   || null;
                this.form.api_key        = ""; // never echo, always blank
            } catch (e) {
                this.$toast?.error?.("Failed to load AI settings.");
            } finally {
                this.loading = false;
            }
        },
        async save() {
            this.saving = true;
            this.testResult = null;
            try {
                const payload = {
                    enabled: this.form.enabled,
                    base_url: this.form.base_url,
                    model: this.form.model,
                    vision_enabled: this.form.vision_enabled,
                };
                if (this.form.api_key && this.form.api_key.trim() !== "") {
                    payload.api_key = this.form.api_key.trim();
                }
                const res = await AiDataService.save(payload);
                const d = res.data && res.data.data ? res.data.data : res.data;
                this.api_key_set  = !!d.api_key_set;
                this.api_key_hint = d.api_key_hint || null;
                this.form.api_key = "";
                this.$toast?.success?.("AI settings saved.");
            } catch (e) {
                this.$toast?.error?.("Failed to save AI settings.");
            } finally {
                this.saving = false;
            }
        },
        async test() {
            this.testing = true;
            this.testResult = null;
            try {
                const res = await AiDataService.test();
                const d = res.data && res.data.data ? res.data.data : res.data;
                this.testResult = { ok: !!d.ok, message: d.message || "" };
            } catch (e) {
                this.testResult = {
                    ok: false,
                    message: (e.response && e.response.data && (e.response.data.message || JSON.stringify(e.response.data))) || e.message || "Test failed.",
                };
            } finally {
                this.testing = false;
            }
        },
    },
};
