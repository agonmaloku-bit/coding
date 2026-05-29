import { mapGetters, mapActions } from "vuex";
import dirtyGuard from "../../Mixins/dirtyGuard";
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";
import {
  SUPPLIER_LIST_GETTER,
  SUPPLIERS_PAGINATED_DATA_GETTER,
  SUPPLIER_GETTER,
  NEW_SUPPLIER_GETTER,
  FIRST_TIME_LOADED_GETTER,
  IS_LOADING_ALL_GETTER,
  IS_LOADING_GETTER,
  IS_CREATING_GETTER,
  CREATED_DATA_GETTER,
  IS_UPDATING_GETTER,
  UPDATED_DATA_GETTER,
  ERRORS_GETTER,
  FETCH_ALL_SUPPLIERS_ACTION,
  FETCH_DETAIL_SUPPLIER_ACTION,
  STORE_SUPPLIER_ACTION,
  UPDATE_SUPPLIER_ACTION,
  DELETE_SUPPLIER_ACTION,
  ADD_SUPPLIER_INPUT_ACTION,
  UPDATE_SUPPLIER_INPUT_ACTION,
  SET_ERRORS_ACTION,
} from "@/Store/Modules/Supplier/constants";
import { useMeta } from "vue-meta";

export default {
  name: "Suppliers",
    mixins: [dirtyGuard],
  components: {
    VPagination,
  },
  setup() {
    useMeta({ title: "Suppliers" });
  },
  data() {
    return {
      modalAddActive: false,
      modalInfoActive: false,
      modalEditActive: false,
      query: {
        page: 1,
      },
      canShowAll: false,
      canShow: false,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      arbkStatus: null,   // null | 'loading' | 'found' | 'not-found' | 'error'
      arbkTimer: null,
    };
  },
  computed: {
    ...mapGetters("suppliers", {
      supplier: SUPPLIER_GETTER,
      newSupplier: NEW_SUPPLIER_GETTER,
      supplierList: SUPPLIER_LIST_GETTER,
      suppliersPaginatedData: SUPPLIERS_PAGINATED_DATA_GETTER,
      createdData: CREATED_DATA_GETTER,
      updatedData: UPDATED_DATA_GETTER,
      isLoadingAll: IS_LOADING_ALL_GETTER,
      firstTimeLoaded: FIRST_TIME_LOADED_GETTER,
      isLoading: IS_LOADING_GETTER,
      isCreating: IS_CREATING_GETTER,
      isUpdating: IS_UPDATING_GETTER,
      errors: ERRORS_GETTER,
    }),
    isModalActive() {
      return this.$store.getters["ui/modalActive"];
    },
    rolePermissions() {
      return this.$store.getters["auth/rolePermissions"];
    },
    directPermissions() {
      return this.$store.getters["auth/directPermissions"];
    },
  },
  methods: {
    ...mapActions("suppliers", {
      fetchAllSuppliers: FETCH_ALL_SUPPLIERS_ACTION,
      fetchDetailSupplier: FETCH_DETAIL_SUPPLIER_ACTION,
      storeSupplier: STORE_SUPPLIER_ACTION,
      updateSupplier: UPDATE_SUPPLIER_ACTION,
      addSupplierInput: ADD_SUPPLIER_INPUT_ACTION,
      updateSupplierInput: UPDATE_SUPPLIER_INPUT_ACTION,
      deleteSupplier: DELETE_SUPPLIER_ACTION,
      setErrors: SET_ERRORS_ACTION,
    }),
    closeModal() {
      this.$store.dispatch("ui/setModalActive", false);
      this.modalAddActive = false;
      this.modalInfoActive = false;
      this.modalEditActive = false;
    },

    showAddModal() {
      this.$store.dispatch("ui/setModalActive", !this.isModalActive);
      this.setErrors(null);
      return (this.modalAddActive = !this.modalAddActive);
    },
    showInfoModal(id) {
      this.$store.dispatch("ui/setModalActive", !this.isModalActive);
      this.fetchDetailSupplier(id);
      return (this.modalInfoActive = !this.modalInfoActive);
    },
    showEditModal(id) {
      this.$store.dispatch("ui/setModalActive", !this.isModalActive);
      // this.$store.dispatch('suppliers/setErrors', null);
      this.fetchDetailSupplier(id);
      this.setErrors(null);
      return (this.modalEditActive = !this.modalEditActive);
    },
    addSupplierInputAction(e) {
      this.addSupplierInput(e);
      if (e.target.name === 'bussines_no') {
        this.scheduleArbkLookup(e.target.value, 'add');
      }
    },
    updateSupplierInputAction(e) {
      this.updateSupplierInput(e);
      if (e.target.name === 'bussines_no') {
        this.scheduleArbkLookup(e.target.value, 'edit');
      }
    },
    scheduleArbkLookup(nui, mode) {
      clearTimeout(this.arbkTimer);
      this.arbkStatus = null;
      if (!nui || nui.length < 5) return;
      this.arbkTimer = setTimeout(() => this.doArbkLookup(nui, mode), 700);
    },
    async doArbkLookup(nui, mode) {
      this.arbkStatus = 'loading';
      try {
        const user  = JSON.parse(localStorage.getItem('user') || '{}');
        const token = user && user.token ? user.token : '';
        const baseUrl = process.env.VUE_APP_URL;
        const resp = await fetch(`${baseUrl}arbk/lookup?business_number=${encodeURIComponent(nui)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.status === 404) { this.arbkStatus = 'not-found'; return; }
        if (!resp.ok) { this.arbkStatus = 'error'; return; }
        const data = await resp.json();
        const fields = [
          ['name', data.name],
          ['address', data.address],
          ['city', data.city],
          ['country', data.country],
          ['phone', data.phone],
          ['email', data.email],
          ['website', data.website],
        ];
        const dispatch = mode === 'add' ? this.addSupplierInput : this.updateSupplierInput;
        const current  = mode === 'add' ? this.newSupplier : this.supplier;
        for (const [field, value] of fields) {
          if (value && !current[field]) {
            dispatch({ target: { name: field, value } });
          }
        }
        this.arbkStatus = 'found';
      } catch (_) {
        this.arbkStatus = 'error';
      }
    },
    onNoContractNeededChange(e, mode) {
      if (mode === 'add') {
        this.newSupplier.no_contract_needed = e.target.checked;
      } else {
        this.supplier.no_contract_neededNew = e.target.checked;
      }
    },
    onSubmitAdd() {
      const { name, bussines_no, no_contract_needed, address, city, country, phone, email, website, contact_name, contact_surname, contact_email, contact_phone } = this.newSupplier;
      this.storeSupplier({
        name, bussines_no,
        no_contract_needed: no_contract_needed ? 1 : 0,
        address, city, country, phone, email, website,
        contact_name, contact_surname, contact_email, contact_phone,
      });
    },
    onSubmitEdit() {
      const s = this.supplier;
      const get = (field) => s[field + 'New'] !== undefined ? s[field + 'New'] : s[field];
      this.updateSupplier({
        id: s.id,
        name: get('name'),
        bussines_no: get('bussines_no'),
        no_contract_needed: (get('no_contract_needed')) ? 1 : 0,
        address: get('address'),
        city: get('city'),
        country: get('country'),
        phone: get('phone'),
        email: get('email'),
        website: get('website'),
        contact_name: get('contact_name'),
        contact_surname: get('contact_surname'),
        contact_email: get('contact_email'),
        contact_phone: get('contact_phone'),
      });
    },

    showDeleteModal(id) {
      this.$swal
        .fire({
          text: "Are you sure you want to delete this supplier?",
          icon: "error",
          cancelButtonText: "Cancel",
          confirmButtonText: "Yes",
          showCancelButton: true,
        })
        .then((result) => {
          if (result["isConfirmed"]) {
            this.deleteSupplier(id);
            // this.fetchAllTasks();
            this.$swal.fire({
              text: "Supplier has been deleted.",
              icon: "success",
              timer: 10000,
            });
          }
        });
    },
    getResults() {
      this.fetchAllSuppliers(this.query);
      console.log(this.fetchAllSuppliers);
    },
    getRouteQuery() {
      if (this.$route.query.page != null) {
        this.query.page = parseInt(this.$route.query.page);
      }
      return this.query;
    },
    modalContent() {},
    checkIfFieldHasErrors(errors, field) {
      if (errors != null && !this.isCreating) {
        if (errors[field] != null) {
          return true;
        }
      }
      return false;
    },
    checkIfUserHasPermissionToShowAll() {
      let permission = "Supplier Show All";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canShowAll = true);
      }
      if (p2.length >= 1) {
        return (this.canShowAll = true);
      }

      return (this.canShowAll = false);
    },
    checkIfUserHasPermissionToShow() {
      let permission = "Supplier Show";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canShow = true);
      }
      if (p2.length >= 1) {
        return (this.canShow = true);
      }

      return (this.canShow = false);
    },
    checkIfUserHasPermissionToAdd() {
      let permission = "Supplier Add";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canAdd = true);
      }
      if (p2.length >= 1) {
        return (this.canAdd = true);
      }

      return (this.canAdd = false);
    },
    checkIfUserHasPermissionToEdit() {
      let permission = "Supplier Edit";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canEdit = true);
      }
      if (p2.length >= 1) {
        return (this.canEdit = true);
      }

      return (this.canEdit = false);
    },
    checkIfUserHasPermissionToDelete() {
      let permission = "Supplier Delete";
      let p1 = this.rolePermissions.filter((p) => p.name === permission);
      let p2 = this.directPermissions.filter((p) => p.name === permission);
      if (p1.length >= 1) {
        return (this.canDelete = true);
      }
      if (p2.length >= 1) {
        return (this.canDelete = true);
      }

      return (this.canDelete = false);
    },
  },
  watch: {
    updatedData: function () {
      if (this.updatedData !== null && !this.isUpdating) {
        this.$store.dispatch("ui/setModalActive", false);
        this.$swal.fire({
          text: "Supplier has been updated successfully!",
          icon: "success",
          timer: 10000,
        });

        return (this.modalEditActive = !this.modalEditActive);
      }
    },
    createdData: function () {
      if (this.createdData !== null && !this.isCreating) {
        this.$store.dispatch("ui/setModalActive", false);
        this.$swal.fire({
          text: "Supplier has been added successfully!",
          icon: "success",
          timer: 10000,
        });

        return (this.modalAddActive = false);
      }
    },
    // errors: function () {
    //     console.log(this.errors.message)
    //     this.$toast.error("Error")
    // }
  },
  created() {
    this.checkIfUserHasPermissionToShowAll();
    this.checkIfUserHasPermissionToShow();
    this.checkIfUserHasPermissionToAdd();
    this.checkIfUserHasPermissionToEdit();
    this.checkIfUserHasPermissionToDelete();
    if (this.canShowAll) {
      this.fetchAllSuppliers(this.getRouteQuery());
    }
    if (this.$route.query.openAdd === 'true') {
      this.$nextTick(() => {
        this.showAddModal();
      });
    }
  },
};
